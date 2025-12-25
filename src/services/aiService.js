// src/services/aiService.js
// Versión simplificada para Vercel

console.log('=== AI Service Initializing ===');

// Obtener variables de entorno del objeto window.__env
const getEnv = (keyVariants) => {
  try {
    // Primero buscar en window.__env (nuestra configuración)
    if (typeof window !== 'undefined' && window.__env) {
      console.log('Checking window.__env...');
      for (const k of keyVariants) {
        const value = window.__env[k];
        if (value && value !== '' && value !== 'undefined') {
          console.log(`✓ Found ${k} in window.__env`);
          return value;
        }
      }
    }
    
    // Buscar directamente en window (para Vercel)
    if (typeof window !== 'undefined') {
      console.log('Checking window object directly...');
      for (const k of keyVariants) {
        const value = window[k];
        if (value && value !== '' && value !== 'undefined') {
          console.log(`✓ Found ${k} in window`);
          return value;
        }
      }
    }
    
    // Buscar en import.meta.env (para desarrollo local con Vite)
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      console.log('Checking import.meta.env...');
      for (const k of keyVariants) {
        const value = import.meta.env[k];
        if (value && value !== '' && value !== 'undefined') {
          console.log(`✓ Found ${k} in import.meta.env`);
          return value;
        }
      }
    }
    
    console.log(`✗ No env found for keys: ${keyVariants.join(', ')}`);
    return '';
    
  } catch (error) {
    console.error('Error reading environment:', error);
    return '';
  }
};

// Configuración con valores por defecto
const AI_PROVIDER = getEnv(['VITE_AI_PROVIDER']) || 'groq';
const GROQ_KEY = getEnv(['VITE_GROQ_API_KEY']) || '';
const GROQ_URL = getEnv(['VITE_GROQ_API_URL']) || 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = getEnv(['VITE_GROQ_MODEL']) || 'mixtral-8x7b-32768';

// Log de configuración
console.log('=== AI Configuration ===');
console.log('Provider:', AI_PROVIDER);
console.log('Groq Key present:', GROQ_KEY ? `Yes (${GROQ_KEY.substring(0, 10)}...)` : 'No');
console.log('Groq URL:', GROQ_URL);
console.log('Groq Model:', GROQ_MODEL);
console.log('========================');

export class AIService {
  constructor() {
    console.log('=== Creating AIService ===');
    
    this.provider = AI_PROVIDER;
    this.groqKey = GROQ_KEY;
    this.groqUrl = GROQ_URL;
    this.groqModel = GROQ_MODEL;
    
    this.isAvailable = this.checkAvailability();
    
    if (this.isAvailable) {
      console.log('✅ AIService initialized successfully');
      console.log(`Using provider: ${this.provider}`);
      console.log(`Model: ${this.groqModel}`);
    } else {
      console.error('❌ AIService initialization failed');
      console.error('Reason: Missing or invalid API key');
      console.error('Expected: VITE_GROQ_API_KEY in window.__env');
      console.error('Current window.__env:', window.__env || 'Not defined');
    }
  }

  checkAvailability() {
    if (this.provider === 'groq') {
      const hasKey = this.groqKey && this.groqKey.length > 30;
      const isValidKey = this.groqKey && this.groqKey.startsWith('gsk_');
      
      if (hasKey && isValidKey) {
        console.log('✅ Groq service is available');
        return true;
      } else {
        console.warn('❌ Groq service NOT available');
        if (!this.groqKey) {
          console.warn('- Missing API key');
        } else if (this.groqKey.length < 30) {
          console.warn('- API key too short');
        } else if (!this.groqKey.startsWith('gsk_')) {
          console.warn('- API key should start with gsk_');
        }
        return false;
      }
    }
    
    console.warn(`❌ Unknown provider: ${this.provider}`);
    return false;
  }

  // Método principal para enviar prompts
  async sendPrompt(prompt, options = {}) {
    if (!this.isAvailable) {
      const errorMsg = 'IA no configurada. Por favor, configura tu API key de Groq.';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    console.log('📤 Sending prompt to Groq...');
    console.log('Prompt length:', prompt.length);

    const messages = [
      { 
        role: 'system', 
        content: options.systemPrompt || 'Eres un asistente útil especializado en redacción de documentos empresariales.'
      },
      { role: 'user', content: prompt }
    ];

    const body = {
      messages,
      model: options.model || this.groqModel,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.max_tokens || 2000,
      stream: false
    };

    try {
      const response = await fetch(this.groqUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.groqKey}`,
          'User-Agent': 'ProcedimientosApp/1.0'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API error:', response.status, errorText);
        throw new Error(`Error Groq API: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || 
                     data.content || 
                     data.result || 
                     JSON.stringify(data);
      
      console.log('✅ Response received');
      return content;
      
    } catch (error) {
      console.error('Error calling Groq API:', error);
      throw error;
    }
  }

  // Analizar procedimiento
  async analyzeProcedimiento(texto) {
    if (!this.isAvailable) {
      throw new Error('API key no configurada.');
    }

    const prompt = `Analiza el siguiente texto que describe un procedimiento empresarial. Extrae pasos, responsables y actividades.

Formato JSON:
{
  "pasos": [
    {
      "numero": "5.1",
      "responsable": "Administrador",
      "actividad": "Revisar lista",
      "tipo": "normal"
    }
  ]
}

Texto: ${texto}`;

    const content = await this.sendPrompt(prompt, { 
      temperature: 0.3, 
      max_tokens: 3000 
    });

    // Extraer JSON
    const jsonMatch = (content || '').match(/```json\n([\s\S]*?)\n```/) || 
                     (content || '').match(/{[\s\S]*}/);
    
    let jsonText = '';
    if (jsonMatch) {
      jsonText = jsonMatch[0].replace(/```json\n|\n```/g, '');
    } else {
      const jsonStart = (content || '').indexOf('{');
      const jsonEnd = (content || '').lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonText = (content || '').substring(jsonStart, jsonEnd + 1);
      }
    }

    try {
      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return { pasos: [] };
    }
  }

  // Mejorar texto
  async mejorarTextoProcedimiento(texto) {
    if (!this.isAvailable || !texto.trim()) {
      return texto;
    }

    const prompt = `Mejora este texto para un documento empresarial:
${texto}`;

    try {
      const content = await this.sendPrompt(prompt, { 
        temperature: 0.4, 
        max_tokens: 2000 
      });
      return content || texto;
    } catch (error) {
      console.error('Error improving text:', error);
      return texto;
    }
  }

  // Sugerir mejoras rápidas
  async sugerirMejorasRapidas(texto) {
    if (!this.isAvailable || !texto.trim()) {
      return [];
    }

    const prompt = `Sugiere 2-3 mejoras para este texto: "${texto}"`;

    try {
      const content = await this.sendPrompt(prompt, { 
        temperature: 0.3, 
        max_tokens: 300 
      });
      
      const lines = (content || '').split('\n').filter(line => line.trim());
      return lines.slice(0, 3);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [];
    }
  }
}

// Instancia exportada
export const aiService = new AIService();