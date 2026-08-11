import os
import json
import urllib.request
import urllib.error
import time
from http.server import SimpleHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

# --- Load Environment Variables ---
def load_env():
    if os.path.exists('.env'):
        with open('.env', 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    key, val = line.split('=', 1)
                    os.environ[key.strip()] = val.strip()

load_env()
API_KEY = os.environ.get('ODDS_API_KEY', '')

# --- Simple In-Memory Cache to prevent rate limit exhaustion ---
cache = {}
CACHE_TTL_SPORTS = 3600 # 1 hour
CACHE_TTL_ODDS = 60 # 60 seconds

class ScannerBetProxy(SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_url = urlparse(self.path)
        
        # Intercept /api/ routes
        if parsed_url.path.startswith('/api/'):
            self.handle_api_request(parsed_url)
        else:
            # Serve standard static files
            super().do_GET()
            
    def handle_api_request(self, parsed_url):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        if not API_KEY:
            self.wfile.write(json.dumps({"error": "ODDS_API_KEY is not configured in .env"}).encode())
            return
            
        endpoint = parsed_url.path.replace('/api/', '')
        query = parsed_url.query
        
        # Check cache
        cache_key = f"{endpoint}?{query}"
        if cache_key in cache:
            entry = cache[cache_key]
            ttl = CACHE_TTL_SPORTS if 'sports' in endpoint and 'odds' not in endpoint else CACHE_TTL_ODDS
            if time.time() - entry['time'] < ttl:
                self.wfile.write(json.dumps(entry['data']).encode())
                return
                
        # Fetch from The Odds API
        try:
            base_url = f"https://api.the-odds-api.com/v4/{endpoint}?apiKey={API_KEY}"
            if query:
                base_url += f"&{query}"
                
            req = urllib.request.Request(base_url, headers={'User-Agent': 'ScannerBet/1.0'})
            with urllib.request.urlopen(req, timeout=10) as response:
                data = json.loads(response.read().decode())
                
                # Update Cache
                cache[cache_key] = {'time': time.time(), 'data': data}
                
                self.wfile.write(json.dumps(data).encode())
        except urllib.error.HTTPError as e:
            error_data = {"error": f"API Error: {e.code}", "message": e.read().decode()}
            self.wfile.write(json.dumps(error_data).encode())
        except Exception as e:
            self.wfile.write(json.dumps({"error": str(e)}).encode())

if __name__ == '__main__':
    PORT = 3000
    server = HTTPServer(('0.0.0.0', PORT), ScannerBetProxy)
    print(f"ScannerBet Backend Proxy running on http://localhost:{PORT}")
    server.serve_forever()
