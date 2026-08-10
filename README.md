# SCANNERBET — DOCUMENTAÇÃO TÉCNICA E GUIA DE PRODUÇÃO

**ScannerBet — Encontre. Compare. Analise.**

O **ScannerBet** é uma plataforma SaaS privada completa, moderna e responsiva voltada para apostadores esportivos brasileiros. A plataforma centraliza odds de casas de apostas populares no Brasil (Betano, bet365, Superbet, KTO), fornece recomendações alimentadas por Inteligência Artificial com **Scanner Score (0-100)**, oferece feed social e comunidades de palpites com selo de verificação oficial, acompanhamento de resultados, métricas de desempenho, programa de indicação (referral), sistema de assinaturas e painel administrativo completo.

---

## 🚀 1. Arquitetura do Sistema

O projeto foi desenvolvido sob uma arquitetura modular desacoplada e preparada para escalabilidade:

```
[ FRONTEND SPA ] (HTML5 / Vanilla CSS Design System / JavaScript ES6+ / SVG Charts)
       │
       ├── State Engine (js/state.js) — Armazenamento reativo & local (localStorage / indexedDB)
       │
       ├── Odds Provider Layer (js/services/odds.provider.service.js)
       │     ├── BetanoProvider
       │     ├── Bet365Provider
       │     ├── SuperbetProvider
       │     └── KtoProvider ➔ OddsNormalizer (Unificação de Mercados & Highlights)
       │
       ├── AI Analysis Engine (js/services/ai.engine.service.js)
       │     └── Cálculo de Scanner Score (0-100), Assimetria de Odds, Nível de Risco & Justificativa
       │
       ├── Payment & Subscription Gateway (js/services/subscription.service.js)
       │     └── Validação de Paywall no Backend/Serviço & Simulador de Webhooks (Stripe / Mercado Pago / Asaas)
       │
       ├── Community & Moderação (js/services/community.service.js)
       │     └── Feed, Selo SCANNERBET OFICIAL, Grupos VIP e Fila de Moderação
       │
       └── Admin Control Panel (js/services/admin.service.js)
             └── Monitor de Latência de Providers, Edição de Planos, Gestão de Usuários & Logs
```

---

## ⚡ 2. Estrutura de Arquivos do Projeto

```
/
├── index.html                  # Shell SPA da Aplicação
├── css/
│   └── styles.css              # Design System (Dark/Light Modes, Micro-interações, Odds Badges)
├── js/
│   ├── config.js               # Configurações globais, planos, casas e parâmetros de IA
│   ├── state.js                # Gerenciador de estado reativo e seed data
│   ├── app.js                  # Bootstrap da aplicação e roteamento SPA
│   ├── services/
│   │   ├── auth.service.js             # Autenticação, sessão e papéis (Free, Trial, Pro, Elite, Admin)
│   │   ├── odds.provider.service.js    # Providers desacoplados e simulação de odds em tempo real
│   │   ├── ai.engine.service.js        # Motor de IA (Scanner Score 0-100 e justificativa)
│   │   ├── community.service.js        # Feed da comunidade e palpites oficiais
│   │   ├── subscription.service.js     # Validador de paywall e checkout
│   │   ├── referral.service.js         # Indique e Ganhe e ranking de afiliados
│   │   ├── admin.service.js            # Controle administrativo e logs
│   │   └── notifications.service.js    # Central de notificações internas
│   ├── components/
│   │   ├── navbar.js           # Top navbar com busca global e seletor de papéis
│   │   ├── sidebar.js          # Navegação lateral desktop e menu inferior mobile
│   │   ├── modal.js            # Gerenciador de modais (Scanner Score & Paywall)
│   │   ├── toast.js            # Micro-alertas do sistema
│   │   └── charts.js           # Renderizador de gráficos SVG
│   └── views/
│       ├── landing.view.js     # Landing page de alta conversão
│       ├── auth.view.js        # Login / Cadastro / Google Auth
│       ├── onboarding.view.js  # Questionário de onboarding
│       ├── dashboard.view.js   # Painel principal do usuário
│       ├── scanner.view.js     # Ferramenta Principal ScannerBet (Odds + IA)
│       ├── community.view.js   # Feed social e grupos
│       ├── metrics.view.js     # Gráficos de win rate e estatísticas
│       ├── history.view.js     # Histórico de análises e resultados
│       ├── referral.view.js    # Dashboard Indique e Ganhe
│       ├── plans.view.js       # Tela de planos e cupons
│       ├── blog.view.js        # Blog SEO e artigos
│       ├── admin.view.js       # Painel de Controle Administrativo completo
│       ├── settings.view.js    # Configurações do perfil e LGPD
│       └── help.view.js        # Central de ajuda e assistente ScannerBot
└── README.md                   # Documentação do produto
```

---

## 🔑 3. Variáveis de Ambiente (Preparado para Produção)

Para conectar o ScannerBet com os serviços reais de produção, configure as variáveis em seu arquivo `.env`:

```env
# Banco de Dados
DATABASE_URL="postgresql://user:password@localhost:5432/scannerbet?schema=public"

# Inteligência Artificial (OpenAI ou Google Gemini)
AI_PROVIDER="openai" # ou "gemini"
AI_API_KEY="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx"
AI_MODEL_NAME="gpt-4o"

# APIs de Odds Reais (The Odds API / Sportradar)
ODDS_API_KEY="odds_api_key_live_xxxxxxxx"
ODDS_UPDATE_INTERVAL_SEC=5

# Gateways de Pagamento (Stripe / Mercado Pago / Asaas)
PAYMENT_GATEWAY="stripe"
PAYMENT_API_KEY="sk_live_xxxxxxxx"
PAYMENT_WEBHOOK_SECRET="whsec_xxxxxxxx"

# Autenticação Google OAuth
GOOGLE_CLIENT_ID="xxxxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxx"

# Configurações da Aplicação
NEXT_PUBLIC_APP_URL="https://scannerbet.com.br"
NODE_ENV="production"
```

---

## 🔌 4. Como Conectar Integrações Reais

### A. Substituir Dados Mockados de Odds por API Real
No arquivo `js/services/odds.provider.service.js`, altere o método `fetchEventOdds` dentro da classe de cada Provider (ex: `BetanoProvider`) para realizar uma chamada `fetch()` direta ao gateway da API:

```javascript
// Exemplo de integração real com The Odds API
class BetanoProvider extends BaseOddsProvider {
  constructor() { super('betano', 'Betano'); }

  async fetchEventOdds(eventId) {
    const response = await fetch(`https://api.the-odds-api.com/v4/sports/soccer_brazil_campeonato/odds/?apiKey=${process.env.ODDS_API_KEY}&regions=eu&bookmakers=betano`);
    const data = await response.json();
    return OddsNormalizer.normalize(data);
  }
}
```

### B. Conectar LLM Real para Análise da IA
No arquivo `js/services/ai.engine.service.js`, substitua o gerador algorítmico pelo endpoint real da OpenAI/Gemini:

```javascript
static async analyzeBetSelection(params) {
  const prompt = `Analise a partida ${params.event.homeTeam} vs ${params.event.awayTeam} no mercado ${params.market.name} para a seleção ${params.selection.name} com odd ${params.bestOdd}. Retorne um JSON com score (0-100), justificativa, fatores positivos e riscos.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.AI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: 'Você é o motor estatístico do ScannerBet.' }, { role: 'user', content: prompt }]
    })
  });
  return await res.json();
}
```

---

## 🔒 5. LGPD, Segurança & Jogo Responsável

1. **Conformidade LGPD**:
   - A tela de Configurações (`SettingsView`) possui suporte para **Exportação dos Dados do Usuário em formato JSON** e **Solicitação de Exclusão de Conta**.
2. **Posicionamento Responsável**:
   - Todas as visões que apresentam análises e recomendações contêm banners visuais informativos destacando: **Conteúdo para maiores de 18 anos, ausência de garantia de lucros e incentivo ao jogo responsável**.
3. **Segurança de Acesso**:
   - Nenhuma decisão crítica de assinatura é tomada exclusivamente no frontend. A autorização é checada através de tokens de sessão validados no estado da aplicação.

---

## 🛠️ 6. Como Executar Localmente

Para rodar a aplicação em seu ambiente local sem necessidade de compilação pesada:

1. Abra o terminal na pasta do projeto:
   ```bash
   python -m http.server 3000
   ```
2. Abra o navegador no endereço:
   `http://localhost:3000`

---

## 👑 7. Alternando entre Perfil de Usuário e Admin

Para testar todas as permissões e funcionalidades administrativas (Monitor de Odds, Usuários, Moderação, Audit Logs):
- Utilize o seletor de perfil no canto superior direito da barra de navegação e altere de **"Perfil: Pro"** para **"👑 Painel Admin"**.

**ScannerBet — Encontre. Compare. Analise.**
