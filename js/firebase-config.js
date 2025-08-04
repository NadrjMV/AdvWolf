// Encontre isso no Console do Firebase > Configurações do Projeto
const firebaseConfig = {
  apiKey: "AIzaSyABfQkk5bpYewqB9f5UkauO3cykgs9RKSM",
  authDomain: "wolfadvocacia-574bd.firebaseapp.com",
  projectId: "wolfadvocacia-574bd",
  storageBucket: "wolfadvocacia-574bd.firebasestorage.app",
  messagingSenderId: "221313161814",
  appId: "1:221313161814:web:4f1d245558f381f2de79f7",
  measurementId: "G-XLB0VFKRC8"
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

let app, auth, db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("ERRO GRAVE NA CONFIGURAÇÃO DO FIREBASE:", error);
  alert("ERRO: A configuração do Firebase falhou. Verifique suas credenciais em 'firebase-config.js' e o console (F12) para mais detalhes.");
}

export { auth, db };