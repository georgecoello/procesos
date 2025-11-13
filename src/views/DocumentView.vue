<template>
  <div class="document-view">
    <div class="document-controls">
      <button @click="generateWordDocument" class="generate-btn" :disabled="isGenerating">
        <span v-if="isGenerating" class="spinner">⏳</span>
        <span v-else>📄 Generar Documento Word</span>
      </button>
      <button @click="resetDocument" class="reset-btn">
        🔄 Limpiar Todo
      </button>
    </div>

    <div class="status-message" v-if="statusMessage" :class="statusType">
      {{ statusMessage }}
    </div>

    <!-- Spinner overlay -->
    <div v-if="isGenerating" class="spinner-overlay">
      <div class="spinner-content">
        <div class="spinner">⏳</div>
        <p>Generando documento Word...</p>
      </div>
    </div>

    <div class="document-editor">
      <!-- Configuración del Encabezado -->
      <div class="section header-config">
        <h3>📋 Configuración del Encabezado del Documento</h3>
        <div class="header-fields">
          <div class="field-group">
            <label>Manual de Políticas y Procedimientos:</label>
            <input v-model="headerConfig.manualName" placeholder="Manual de Políticas y Procedimientos" class="header-input">
          </div>
          <div class="field-group">
            <label>POLÍTICA O PROCEDIMIENTO DE:</label>
            <input v-model="headerConfig.policyName" placeholder="PAGO A PROVEEDORES" class="header-input">
          </div>
          <div class="field-group">
            <label>CÓDIGO:</label>
            <input v-model="headerConfig.codigo" placeholder="PROC-ADM-004" class="header-input">
          </div>
          <div class="field-group">
            <label>Área:</label>
            <input v-model="headerConfig.area" placeholder="Administración" class="header-input">
          </div>
          <div class="field-group">
            <label>Unidad:</label>
            <input v-model="headerConfig.unidad" placeholder="Finanzas" class="header-input">
          </div>
          <div class="field-group">
            <label>Revisión:</label>
            <input v-model="headerConfig.revision" placeholder="01" class="header-input">
          </div>
          <div class="field-group">
            <label>Fecha:</label>
            <input v-model="headerConfig.fecha" type="date" class="header-input">
          </div>
        </div>
      </div>

      <!-- Secciones editables del contenido -->
      <div class="section" v-for="(section, index) in sections" :key="index">
        <h3>{{ section.title }}</h3>
        <div class="section-description">
          <p>{{ section.description }}</p>
        </div>
        <textarea 
          v-model="section.content" 
          :placeholder="section.placeholder"
          class="section-textarea"
          :rows="section.rows || 6"
        ></textarea>
      </div>

      <!-- Sección de Procedimiento Mejorada -->
      <div class="section">
        <h3>5. Procedimiento</h3>
        <div class="section-description">
          <p><strong>Instrucciones para describir el procedimiento:</strong></p>
          <ul>
            <li><strong>Escribe en lenguaje natural</strong> cómo se realiza el proceso</li>
            <li><strong>Menciona los responsables</strong> y sus actividades</li>
    <li><strong>Incluye decisiones</strong> (si algo está correcto o no)</li>
            <li><strong>Describe alternativas</strong> (qué pasa si algo sale bien o mal)</li>
            <li><strong>El sistema generará automáticamente</strong> la numeración continua (5.1, 5.2, 5.3...)</li>
            <li><strong>El encabezado aparecerá en todas las páginas</strong> del documento generado</li>
          </ul>
          <p><strong>Ejemplo de cómo escribir:</strong></p>
          <pre class="format-example">
El administrador revisa la lista de proveedores a pagar
El administrador envía la lista al gerente general para revisión
El gerente general revisa la lista de proveedores
¿La lista está correcta?
Si está correcta, el gerente general realiza el pago a los proveedores
Si no está correcta, el gerente general devuelve la lista al administrador
El administrador verifica y corrige la información de los proveedores
Fin del proceso</pre>
        </div>
        
        <textarea 
          v-model="procedimientoText" 
          placeholder="Describe el procedimiento completo aquí en lenguaje natural..."
          class="section-textarea"
          rows="15"
        ></textarea>
        
        <!-- Vista previa de la tabla generada automáticamente -->
        <div class="table-preview">
          <h4>Vista Previa de la Tabla Generada Automáticamente:</h4>
          <div class="preview-container">
            <table class="preview-table">
              <thead>
                <tr>
                  <th width="15%">(#)</th>
                  <th width="25%">(Quien)</th>
                  <th width="60%">(Actividad)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in generatedTable" :key="index" 
                    :class="getRowClass(row)">
                  <td>{{ row.number ? '5.' + row.number : '&nbsp;' }}</td>
                  <td>{{ row.who || '&nbsp;' }}</td>
                  <td>{{ row.activity || '&nbsp;' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="action-buttons">
          <button @click="parseProcedimiento" class="parse-btn">🔄 Generar Tabla Automáticamente</button>
          <button @click="loadExampleProcedimiento" class="sample-btn">📝 Cargar Ejemplo</button>
        </div>
      </div>

      <!-- Secciones restantes -->
      <div class="section" v-for="(section, index) in remainingSections" :key="index + 10">
        <h3>{{ section.title }}</h3>
        <div class="section-description">
          <p>{{ section.description }}</p>
        </div>
        <textarea 
          v-model="section.content" 
          :placeholder="section.placeholder"
          class="section-textarea"
          :rows="section.rows || 6"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script>
import { generateWordDocument } from '@/utils/docGenerator'

export default {
  name: 'DocumentView',
  data() {
    return {
      headerConfig: {
        manualName: 'Manual de Políticas y Procedimientos',
        policyName: 'PAGO A PROVEEDORES',
        codigo: 'PROC-ADM-004',
        area: 'Administración',
        unidad: 'Finanzas',
        revision: '01',
        fecha: this.getFormattedDate()
      },
      sections: [
        { 
          title: '1. Objetivo o Propósito', 
          content: '',
          description: 'Establecer el propósito general del procedimiento.',
          placeholder: 'Definir el objetivo principal del procedimiento y los resultados esperados...',
          rows: 4
        },
        { 
          title: '2. Alcance', 
          content: '',
          description: 'Definir los límites y cobertura del procedimiento.',
          placeholder: 'Especificar los límites, áreas de aplicación y exclusiones del procedimiento...',
          rows: 4
        },
        { 
          title: '3. Responsabilidades', 
          content: '',
          description: 'Listar los roles y responsabilidades de cada participante.',
          placeholder: '1. Responsable Principal\n2. Coordinador\n3. Ejecutor...',
          rows: 6
        },
        { 
          title: '4. Normativa', 
          content: '',
          description: 'Establecer las normas, políticas y criterios aplicables.',
          placeholder: 'I. [MARCO NORMATIVO]\nEstablecer las normas y políticas que rigen el procedimiento...',
          rows: 12
        }
      ],
      remainingSections: [
        { 
          title: '6. Anexos', 
          content: '',
          description: 'Listar los formatos, documentos y anexos relacionados.',
          placeholder: 'Formato de registro\nDocumentos de referencia...',
          rows: 4
        },
        { 
          title: '7. Términos y Referencias', 
          content: '',
          description: 'Definir términos técnicos y referencias documentales.',
          placeholder: 'Término 1: Definición\nTérmino 2: Explicación...',
          rows: 4
        }
      ],
      procedimientoText: '',
      generatedTable: [],
      statusMessage: '',
      statusType: '',
      isGenerating: false
    }
  },
  computed: {
    procedureTable() {
      return this.generatedTable;
    }
  },
  methods: {
    getFormattedDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    parseProcedimiento() {
      if (!this.procedimientoText.trim()) {
        this.showStatus('❌ Por favor ingresa la descripción del procedimiento', 'error');
        return;
      }

      try {
        const lines = this.procedimientoText.split('\n').filter(line => line.trim() !== '');
        const table = [];
        let stepNumber = 1; // Iniciar desde 1 para que sea 5.1, 5.2, etc.

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          if (line === '') continue;

          // Detectar secciones principales (oraciones que describen procesos completos)
          if (this.isMainProcessLine(line)) {
            table.push({ number: '', who: '', activity: line });
          }
          // Detectar preguntas de decisión
          else if (line.startsWith('¿')) {
            table.push({ number: '', who: '', activity: line });
          }
          // Detectar alternativas (Si/No)
          else if (line.toLowerCase().startsWith('si ') || line.toLowerCase().startsWith('no ') || 
                   line.toLowerCase().startsWith('si,') || line.toLowerCase().startsWith('no,')) {
            table.push({ number: '', who: '', activity: line });
          }
          // Detectar fin del proceso
          else if (line.toLowerCase().includes('fin del proceso')) {
            table.push({ number: '', who: '', activity: 'Fin del Proceso' });
          }
          // Detectar actividades con responsables
          else {
            const responsible = this.extractResponsible(line);
            const activity = this.extractActivity(line, responsible);
            
            if (responsible || activity) {
              table.push({ 
                number: `${stepNumber}`, 
                who: responsible, 
                activity: activity 
              });
              stepNumber++; // Incrementar el número de paso para la siguiente actividad
            }
          }

          // NO reiniciar el conteo en preguntas o fin del proceso
          // El conteo continúa secuencialmente
        }

        this.generatedTable = table;
        this.showStatus('✅ Tabla generada automáticamente desde la descripción', 'success');
      } catch (error) {
        this.showStatus('❌ Error al procesar la descripción: ' + error.message, 'error');
      }
    },

    isMainProcessLine(line) {
      // Una línea es un proceso principal si:
      // - No es una pregunta
      // - No es una alternativa (Si/No)
      // - No menciona un responsable específico al inicio
      // - Describe un proceso completo
      // - No contiene "fin del proceso"
      return !line.startsWith('¿') && 
             !line.toLowerCase().startsWith('si ') && 
             !line.toLowerCase().startsWith('no ') &&
             !line.toLowerCase().startsWith('si,') && 
             !line.toLowerCase().startsWith('no,') &&
             !line.toLowerCase().includes('fin del proceso') &&
             !this.extractResponsible(line) &&
             line.length > 10; // Para evitar que líneas cortas se consideren secciones principales
    },

    extractResponsible(line) {
      // Patrones comunes para detectar responsables
      const patterns = [
        /^el (\w+)/i,
        /^la (\w+)/i,
        /^los (\w+)/i,
        /^las (\w+)/i,
        /^un (\w+)/i,
        /^una (\w+)/i,
        /^(\w+) (revisa|envía|realiza|verifica|corrige|aprueba|autoriza)/i
      ];

      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          return this.capitalizeFirstLetter(match[1] || match[2]);
        }
      }

      return '';
    },

    extractActivity(line, responsible) {
      if (!responsible) return line;

      // Remover el responsable del inicio de la línea para obtener solo la actividad
      const patterns = [
        new RegExp(`^el ${responsible.toLowerCase()}\\s+`, 'i'),
        new RegExp(`^la ${responsible.toLowerCase()}\\s+`, 'i'),
        new RegExp(`^los ${responsible.toLowerCase()}\\s+`, 'i'),
        new RegExp(`^las ${responsible.toLowerCase()}\\s+`, 'i'),
        new RegExp(`^${responsible.toLowerCase()}\\s+`, 'i')
      ];

      let activity = line;
      for (const pattern of patterns) {
        activity = activity.replace(pattern, '');
      }

      return activity.charAt(0).toUpperCase() + activity.slice(1);
    },

    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },

    loadExampleProcedimiento() {
      this.procedimientoText = `El administrador revisa la lista de proveedores a pagar
El administrador envía la lista al gerente general para revisión
El gerente general revisa la lista de proveedores
¿La lista está correcta?
Si está correcta, el gerente general realiza el pago a los proveedores
Si no está correcta, el gerente general devuelve la lista al administrador
El administrador verifica y corrige la información de los proveedores
El administrador actualiza la lista con la información corregida
El proceso se repite desde el envío al gerente general
Fin del proceso

Proceso de compras urgentes
El coordinador identifica la necesidad de compra urgente
El coordinador completa el formulario de compra urgente
El gerente aprueba la compra urgente
¿La compra fue aprobada?
Si fue aprobada, el departamento de compras procede con la adquisición
Si no fue aprobada, se archiva la solicitud
Fin del proceso`;

      this.showStatus('📝 Ejemplo cargado. Haz clic en "Generar Tabla Automáticamente" para ver el resultado.', 'info');
    },

    getRowClass(row) {
      if (!row.number && !row.who && row.activity && 
          !row.activity.startsWith('¿') && 
          !row.activity.toLowerCase().startsWith('si') && 
          !row.activity.toLowerCase().startsWith('no') &&
          row.activity !== 'Fin del Proceso') {
        return 'section-row';
      }
      if (row.number && !row.who && row.activity) {
        return 'subsection-row';
      }
      if (!row.number && !row.who && !row.activity) {
        return 'empty-row';
      }
      return 'normal-row';
    },

    async generateWordDocument() {
      this.isGenerating = true;
      
      // Asegurarse de que la tabla esté actualizada
      if (this.procedimientoText && this.generatedTable.length === 0) {
        this.parseProcedimiento();
      }

      const documentData = {
        headerConfig: this.headerConfig,
        objetivo: this.sections[0].content,
        alcance: this.sections[1].content,
        responsabilidades: this.sections[2].content,
        normativa: this.sections[3].content,
        anexos: this.remainingSections[0].content,
        terminos: this.remainingSections[1].content
      };

      try {
        await generateWordDocument(documentData, this.generatedTable);
        this.showStatus('✅ Documento Word generado exitosamente! El encabezado aparecerá en todas las páginas.', 'success');
      } catch (error) {
        this.showStatus('❌ Error al generar el documento: ' + error.message, 'error');
      } finally {
        this.isGenerating = false;
      }
    },

    resetDocument() {
      if (confirm('¿Estás seguro de que quieres limpiar todo el documento? Se perderán todos los cambios.')) {
        this.sections.forEach(section => {
          section.content = '';
        });
        this.remainingSections.forEach(section => {
          section.content = '';
        });
        this.procedimientoText = '';
        this.generatedTable = [];
        this.headerConfig.fecha = this.getFormattedDate();
        // Restablecer valores por defecto
        this.headerConfig.manualName = 'Manual de Políticas y Procedimientos';
        this.headerConfig.policyName = 'PAGO A PROVEEDORES';
        this.headerConfig.codigo = 'PROC-ADM-004';
        this.headerConfig.area = 'Administración';
        this.headerConfig.unidad = 'Finanzas';
        this.headerConfig.revision = '01';
        this.showStatus('🗑️ Todo el contenido ha sido resetado', 'info');
      }
    },

    showStatus(message, type) {
      this.statusMessage = message;
      this.statusType = type;
      
      setTimeout(() => {
        this.statusMessage = '';
        this.statusType = '';
      }, 5000);
    }
  }
}
</script>

<style scoped>
.document-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Times New Roman', serif;
}

.document-controls {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  justify-content: center;
  flex-wrap: wrap;
}

.generate-btn, .reset-btn {
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 160px;
  font-family: 'Times New Roman', serif;
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.generate-btn:disabled:hover {
  transform: none;
}

.generate-btn {
  background-color: #27ae60;
  color: white;
}

.generate-btn:hover:not(:disabled) {
  background-color: #219a52;
  transform: translateY(-2px);
}

.reset-btn {
  background-color: #e74c3c;
  color: white;
}

.reset-btn:hover {
  background-color: #c0392b;
  transform: translateY(-2px);
}

.document-editor {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  font-family: 'Times New Roman', serif;
}

.section {
  margin-bottom: 30px;
  padding: 25px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  background: #ffffff;
  transition: box-shadow 0.3s ease;
  font-family: 'Times New Roman', serif;
}

.section:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.section h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.4rem;
  border-bottom: 3px solid #3498db;
  padding-bottom: 10px;
  font-weight: 700;
  font-family: 'Times New Roman', serif;
}

.header-config {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-left: 4px solid #3498db;
}

.header-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.field-group {
  display: flex;
  flex-direction: column;
}

.field-group label {
  font-weight: 600;
  margin-bottom: 5px;
  color: #2c3e50;
  font-size: 0.9rem;
  font-family: 'Times New Roman', serif;
}

.header-input {
  padding: 10px 12px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  font-family: 'Times New Roman', serif;
}

.header-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.section-description {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-size: 0.95rem;
  color: #495057;
  border-left: 4px solid #3498db;
  font-family: 'Times New Roman', serif;
}

.section-description p {
  margin: 0;
}

.section-description ul {
  margin: 10px 0;
  padding-left: 20px;
}

.section-description li {
  margin-bottom: 5px;
  line-height: 1.4;
  font-family: 'Times New Roman', serif;
}

.format-example {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 15px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  line-height: 1.4;
  margin: 10px 0;
  white-space: pre-wrap;
  color: #495057;
}

.section-textarea {
  width: 100%;
  min-height: 120px;
  padding: 15px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-family: 'Times New Roman', serif;
  font-size: 14px;
  resize: vertical;
  line-height: 1.5;
  transition: border-color 0.3s ease;
}

.section-textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.parse-btn, .sample-btn {
  border: none;
  padding: 10px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.3s ease;
  font-family: 'Times New Roman', serif;
}

.parse-btn {
  background-color: #27ae60;
  color: white;
}

.sample-btn {
  background-color: #3498db;
  color: white;
}

.parse-btn:hover, .sample-btn:hover {
  transform: translateY(-1px);
  opacity: 0.9;
}

.table-preview {
  margin: 25px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  font-family: 'Times New Roman', serif;
}

.table-preview h4 {
  margin-bottom: 15px;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
  font-family: 'Times New Roman', serif;
}

.preview-container {
  overflow-x: auto;
  background: white;
  border: 1px solid #ced4da;
  border-radius: 6px;
  padding: 10px;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
  font-size: 11px;
  font-family: 'Times New Roman', serif;
}

.preview-table th {
  border: 1px solid #000;
  padding: 6px 8px;
  background-color: #f0f0f0;
  font-weight: bold;
  text-align: center;
  font-family: 'Times New Roman', serif;
}

.preview-table td {
  border: 1px solid #000;
  padding: 4px 6px;
  text-align: left;
  vertical-align: top;
  font-family: 'Times New Roman', serif;
}

.section-row td {
  background-color: #e3f2fd;
  font-weight: bold;
}

.subsection-row td:first-child {
  font-weight: bold;
  background-color: #f3e5f5;
}

.subsection-row td:not(:first-child) {
  background-color: #f3e5f5;
}

.empty-row td {
  background-color: #ffffff;
  color: #6c757d;
}

.normal-row td {
  background-color: #ffffff;
}

.spinner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.spinner-content {
  background: white;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  font-family: 'Times New Roman', serif;
}

.spinner {
  font-size: 2rem;
  margin-bottom: 15px;
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.spinner-content p {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
  font-family: 'Times New Roman', serif;
}

.status-message {
  padding: 15px 20px;
  margin: 20px auto;
  border-radius: 8px;
  font-weight: 600;
  text-align: center;
  max-width: 600px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  font-family: 'Times New Roman', serif;
}

.status-message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-message.info {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

@media (max-width: 768px) {
  .document-view {
    padding: 10px;
  }
  
  .document-controls {
    flex-direction: column;
    align-items: center;
  }
  
  .generate-btn, .reset-btn {
    width: 100%;
    max-width: 300px;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .section {
    padding: 15px;
  }
  
  .header-fields {
    grid-template-columns: 1fr;
  }
}
</style>