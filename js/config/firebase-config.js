/**
 * FIREBASE CONFIGURATION
 * Placeholders para integração com Firebase Authentication.
 * 
 * INSTRUÇÕES:
 * 1. Crie um projeto em console.firebase.google.com
 * 2. Ative Authentication -> Email/Password e Google.
 * 3. Vá em Project Settings -> General -> Add Web App.
 * 4. Copie as chaves abaixo e substitua os placeholders.
 */

const firebaseConfig = {
  apiKey: "COLE_SUA_API_KEY_AQUI",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Inicializa o Firebase apenas se as chaves forem configuradas
let isFirebaseConfigured = false;
if (firebaseConfig.apiKey !== "COLE_SUA_API_KEY_AQUI") {
  try {
    firebase.initializeApp(firebaseConfig);
    isFirebaseConfigured = true;
    console.log("Firebase Auth Inicializado.");
  } catch (error) {
    console.error("Erro ao inicializar Firebase:", error);
  }
} else {
  console.warn("FIREBASE NÃO CONFIGURADO: Autenticação em modo fallback de segurança.");
}

window.sbFirebase = {
  isConfigured: isFirebaseConfigured,
  auth: isFirebaseConfigured ? firebase.auth() : null
};
