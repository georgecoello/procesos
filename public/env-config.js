// public/env-config.js
(function(window) {
  // Configuración para el navegador
  window.__env = window.__env || {};
  
  // Variables de entorno - REEMPLAZA CON TUS VALORES REALES
  //window.__env.VITE_AI_PROVIDER = 'groq';
  //window.__env.VITE_GROQ_API_KEY = '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'; 
  //window.__env.VITE_GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  //window.__env.VITE_GROQ_MODEL = 'mixtral-8x7b-32768';
  
  // Para debugging
  console.log('📁 Environment variables loaded from env-config.js');
  console.log('Provider:', window.__env.VITE_AI_PROVIDER);
  console.log('Has API Key:', !!window.__env.VITE_GROQ_API_KEY);
})(window);