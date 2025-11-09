<template>
  <div class="document-view">
    <div class="document-controls">
      <button @click="generateWordDocument" class="generate-btn">
        📄 Generar Documento Word
      </button>
      <button @click="loadOriginalContent" class="sample-btn">
        🎯 Cargar Contenido Original
      </button>
      <button @click="resetDocument" class="reset-btn">
        🔄 Limpiar Todo
      </button>
    </div>

    <div class="status-message" v-if="statusMessage" :class="statusType">
      {{ statusMessage }}
    </div>

    <div class="document-editor">
      <!-- Configuración del Encabezado ACTUALIZADA -->
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
            <input v-model="headerConfig.codigo" placeholder="XX-P-XXX-#" class="header-input">
          </div>
          <div class="field-group">
            <label>Área:</label>
            <input v-model="headerConfig.area" placeholder="Logística" class="header-input">
          </div>
          <div class="field-group">
            <label>Unidad:</label>
            <input v-model="headerConfig.unidad" placeholder="Compras" class="header-input">
          </div>
          <div class="field-group">
            <label>Revisión:</label>
            <input v-model="headerConfig.revision" placeholder="(1)" class="header-input">
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

      <!-- Tabla de procedimiento -->
      <div class="section">
        <h3>5. Procedimiento - Tabla de Actividades</h3>
        <div class="section-description">
          <p><strong>Instrucciones para la tabla:</strong></p>
          <ul>
            <li><strong>Sección principal:</strong> Deja # y Quién vacíos, escribe solo en Actividad</li>
            <li><strong>Subsección:</strong> Llena solo # y Actividad, deja Quién vacío</li>
            <li><strong>Fila normal:</strong> Llena las tres columnas</li>
            <li><strong>Fila vacía:</strong> Para separar, deja las tres columnas vacías</li>
          </ul>
        </div>
        
        <!-- Vista previa de la tabla -->
        <div class="table-preview">
          <h4>Vista Previa de la Tabla:</h4>
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
                <tr v-for="(row, index) in procedureTable" :key="index" 
                    :class="getRowClass(row)">
                  <td>{{ row.number || '&nbsp;' }}</td>
                  <td>{{ row.who || '&nbsp;' }}</td>
                  <td>{{ row.activity || '&nbsp;' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Controles de la tabla -->
        <div class="table-controls">
          <button @click="addTableRow" class="control-btn add-row">+ Fila Normal</button>
          <button @click="addTableSection" class="control-btn add-section">+ Sección</button>
          <button @click="addTableSubsection" class="control-btn add-subsection">+ Subsección</button>
          <button @click="addEmptyRow" class="control-btn add-empty">+ Espacio</button>
        </div>
        
        <!-- Editor de la tabla -->
        <div class="table-editor">
          <table class="editor-table">
            <thead>
              <tr>
                <th width="15%">#</th>
                <th width="25%">Quién</th>
                <th width="50%">Actividad</th>
                <th width="10%">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in procedureTable" :key="index"
                  :class="getRowClass(row)">
                <td>
                  <input 
                    v-model="row.number" 
                    :placeholder="getNumberPlaceholder(row)" 
                    class="table-input"
                    :disabled="!row.number && !row.who && row.activity"
                  >
                </td>
                <td>
                  <input 
                    v-model="row.who" 
                    :placeholder="getWhoPlaceholder(row)" 
                    class="table-input"
                    :disabled="(!row.number && row.activity) || (row.number && !row.who && row.activity)"
                  >
                </td>
                <td>
                  <textarea 
                    v-model="row.activity" 
                    :placeholder="getActivityPlaceholder(row)" 
                    class="table-textarea"
                  ></textarea>
                </td>
                <td>
                  <button 
                    @click="removeTableRow(index)" 
                    class="remove-btn" 
                    :disabled="procedureTable.length === 1"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
        codigo: 'XX-P-XXX-#',
        area: 'Logística',
        unidad: 'Compras',
        revision: '(1)',
        fecha: this.getFormattedDate() // Fecha actual por defecto
      },
      sections: [
        { 
          title: '1. Objetivo o Propósito', 
          content: '',
          description: 'Establecer el propósito general del procedimiento de pagos.',
          placeholder: 'Establecer el procedimiento de pagos a nuestros proveedores con políticas claras y definidas...',
          rows: 4
        },
        { 
          title: '2. Alcance', 
          content: '',
          description: 'Definir los límites y cobertura del procedimiento.',
          placeholder: 'Este procedimiento abarca el proceso a partir del requerimiento de pago...',
          rows: 4
        },
        { 
          title: '3. Responsabilidades', 
          content: '',
          description: 'Listar los roles y responsabilidades de cada participante.',
          placeholder: '1. Jefe (a) Administrativo (a)\n2. Gerente General\n3. Proveedor...',
          rows: 6
        },
        { 
          title: '4. Normativa', 
          content: '',
          description: 'Establecer las normas, políticas y criterios aplicables. Use el formato: I. [TITULO], 1) Punto, a. Subpunto',
          placeholder: 'I. [INTRODUCCION]\nLa Gerencia General del restaurante [ASADOS EL CARRETÓN]...\n1) Compras a créditos se establecerán...\na. Calidad del producto...',
          rows: 12
        },
        { 
          title: '6. Anexos', 
          content: '',
          description: 'Listar los formatos, documentos y anexos relacionados.',
          placeholder: 'Formato de listado de pago a proveedores\nRegistro de facturas pendientes...',
          rows: 4
        },
        { 
          title: '7. Términos y Referencias', 
          content: '',
          description: 'Definir términos técnicos y referencias documentales.',
          placeholder: 'RTN: Registro Tributario Nacional\nPrefactura: Documento previo a la factura definitiva...',
          rows: 4
        }
      ],
      procedureTable: [
        { number: '', who: '', activity: 'Pagos de Compras de Crédito' }
      ],
      statusMessage: '',
      statusType: ''
    }
  },
  methods: {
    // Método para obtener la fecha formateada para el input type="date"
    getFormattedDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    generateWordDocument() {
      const documentData = {
        headerConfig: this.headerConfig,
        objetivo: this.sections[0].content,
        alcance: this.sections[1].content,
        responsabilidades: this.sections[2].content,
        normativa: this.sections[3].content,
        anexos: this.sections[4].content,
        terminos: this.sections[5].content,
        nota: 'Documento generado automáticamente - ASADOS EL CARRETÓN'
      };

      try {
        generateWordDocument(documentData, this.procedureTable);
        this.showStatus('✅ Documento Word generado exitosamente!', 'success');
      } catch (error) {
        this.showStatus('❌ Error al generar el documento: ' + error.message, 'error');
      }
    },

    loadOriginalContent() {
      // Cargar contenido de ejemplo para las secciones
      this.sections[0].content = `Establecer el procedimiento de pagos a nuestros proveedores con
políticas claras y definidas. para aprovechar los descuentos por pago
oportuno, un mayor monto de crédito en base a bienes, insumos y
servicios adquiridos por la entidad y por las cuales se genera una
obligación a cancelar vía factura comercial.`;

      this.sections[1].content = `Este procedimiento abarca el proceso a partir del requerimiento de pago
por la adquisición del bien, insumos o servicios, hasta el pago mediante
la transferencia bancaria y emisión de la factura con RTN. No incluye el
proceso pre-contractual requerido para realizar la compra ni de la
recepción del bien.`;

      this.sections[2].content = `1.  Jefe (a) Administrativo (a)

2.  Gerente General

3.  Proveedor

4.  Encargado (a) de Almacén

5.  Cajero (a)`;

      this.sections[3].content = `I.  [INTRODUCCION]

La Gerencia General del restaurante [ASADOS EL CARRETÓN]
junto con el jefe administrativo tiene que velar por los pagos de las
facturas realizadas para abastecer el almacén y los restaurantes de
[ASADOS EL CARRETÓN.]

1)  Compras a créditos se establecerán de mutuo acuerdo entre ASADOS EL
    CARRETON y el proveedor con un periodo máximo de quince días (15)
    laborables.

2)  ASADOS EL CARRETON podrá contar con uno o más proveedores de acuerdo
    con sus necesidades de abastecimiento y las negociones contraídas
    con cada uno de los proveedores.

3)  ASADOS EL CARRETRON elegirá a sus proveedores en base a los
    siguientes criterios:

    a.  Calidad del producto o insumos

    b.  Tiempos de entrega

    c.  Conveniencia de la entrega

    d.  Precios

    e.  Periodos o ciclos de crédito.

    f.  Modalidades de pago favorables para ASADOS EL CARRETON

4)  El proveedor deberá emitir prefactura de compra para corroborar la
    orden de compra emitida por ASADOS EL CARRETON asi como los precios
    de los productos correspondan a la negociación previamente acordada.

5)  ASADOS EL CARRETON en mutuo acuerdo con el proveedor se establecerá
    la forma en que se hará el pago de la factura. Para esto se tienen
    tres (3) opciones:

    a.  Pago en efectivo.

    b.  Pago vía transferencia electrónica.

    c.  Pago por medio de link de pago.

    d.  Pago con tarjeta de crédito

6)  La administración de ASADOS EL CARRETON deberá gestionar con el
    Gerente General los pagos a proveedores dentro de los quince (15)
    días establecidos, evitando asi que las facturas caigan en mora.

7)  Si llegada la fecha estipulada de pago al proveedor no se ha
    realizado la cancelación de la factura, ASADOS EL CARRETON deberá
    someterse a la sanción establecida por el proveedor siendo estas el
    no abastecimiento de sus productos en tanto no sea cancelado el
    saldo pendiente y/o el pago de interese moratorios al saldo adeudado
    a la fecha.`;

      this.sections[4].content = `Formato de listado de pago a proveedores
Registro de facturas pendientes
Comprobantes de pago
Anexo No. 2: Lista de Pago a Proveedores`;

      this.sections[5].content = `RTN: Registro Tributario Nacional
Prefactura: Documento previo a la factura definitiva
Transferencia electrónica: Pago realizado mediante transferencia bancaria
Link de pago: Método de pago mediante enlace electrónico
Mora: Estado de incumplimiento en el pago de obligaciones`;

      // Cargar tabla de ejemplo
      this.procedureTable = [
        { number: '', who: '', activity: 'Pagos de Compras de Crédito' },
        { number: '5.7', who: 'Administrador(a)', activity: 'Revisa las cuentas por pagar próximas a vencer' },
        { number: '', who: 'Administrador', activity: 'Elabora la lista de Proveedor a efectuar pagos con el saldo adeudado.' },
        { number: '', who: 'Administrador(a)', activity: 'envía al Gerente General la lista de proveedores a pagar. (Ver Anexo No. 2)' },
        { number: '', who: 'Gerente General', activity: 'Revisa el documento Lista de Pago a Proveedores.' },
        { number: '', who: '', activity: '¿Esta correcta?' },
        { number: '', who: '', activity: 'Si, pasa al paso No. XXX' },
        { number: '', who: '', activity: 'No, Devuelve el formato al administrador(a) para su corrección. Pasa al paso No. 5.7' },
        { number: '', who: 'Gerente General', activity: 'Realiza el pago de las facturas: Transferencia, Electrónica, link de pago o tarjeta de crédito.' },
        { number: '', who: 'Gerente General', activity: 'Envia a Administración los comprobantes de pago Imprime el recibo de pago.' },
        { number: '', who: 'Administrador (a)', activity: 'Realiza la cancelación del pago en el sistema contable' },
        { number: '', who: '', activity: 'Fin del Proceso' },
        { number: '', who: '', activity: '' },
        { number: '', who: '', activity: 'Pagos de Contado' }
      ];

      this.showStatus('📝 Contenido original cargado exitosamente!', 'success');
    },

    addTableRow() {
      this.procedureTable.push({ number: '', who: '', activity: '' });
    },

    addTableSection() {
      this.procedureTable.push({ number: '', who: '', activity: 'Nueva Sección' });
    },

    addTableSubsection() {
      this.procedureTable.push({ number: '5.7.1.X', who: '', activity: 'Nueva Subsección' });
    },

    addEmptyRow() {
      this.procedureTable.push({ number: '', who: '', activity: '' });
    },

    removeTableRow(index) {
      if (this.procedureTable.length > 1) {
        this.procedureTable.splice(index, 1);
      }
    },

    getRowClass(row) {
      if (!row.number && !row.who && row.activity) return 'section-row';
      if (row.number && !row.who && row.activity) return 'subsection-row';
      if (!row.number && !row.who && !row.activity) return 'empty-row';
      return 'normal-row';
    },

    getNumberPlaceholder(row) {
      if (!row.who && row.activity) return '5.7.1.3';
      return '5.7';
    },

    getWhoPlaceholder(row) {
      if (!row.number && row.activity) return '';
      if (row.number && !row.who && row.activity) return '';
      return 'Administrador(a)';
    },

    getActivityPlaceholder(row) {
      if (!row.number && !row.who) return 'Nombre de la sección';
      if (row.number && !row.who) return 'Nombre de la subsección';
      return 'Describe la actividad...';
    },

    resetDocument() {
      if (confirm('¿Estás seguro de que quieres limpiar todo el documento? Se perderán todos los cambios.')) {
        this.sections.forEach(section => {
          section.content = '';
        });
        this.procedureTable = [{ number: '', who: '', activity: 'Pagos de Compras de Crédito' }];
        // Resetear la fecha a la actual
        this.headerConfig.fecha = this.getFormattedDate();
        this.showStatus('🗑️ Todo el contenido ha sido resetado', 'info');
      }
    },

    showStatus(message, type) {
      this.statusMessage = message;
      this.statusType = type;
      
      // Auto-ocultar el mensaje después de 5 segundos
      setTimeout(() => {
        this.statusMessage = '';
        this.statusType = '';
      }, 5000);
    }
  }
}
</script>

<style scoped>
/* Los estilos se mantienen igual que en tu archivo original */
.document-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.document-controls {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  justify-content: center;
  flex-wrap: wrap;
}

.generate-btn, .sample-btn, .reset-btn {
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 160px;
}

.generate-btn {
  background-color: #27ae60;
  color: white;
}

.generate-btn:hover {
  background-color: #219a52;
  transform: translateY(-2px);
}

.sample-btn {
  background-color: #3498db;
  color: white;
}

.sample-btn:hover {
  background-color: #2980b9;
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
}

.section {
  margin-bottom: 30px;
  padding: 25px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  background: #ffffff;
  transition: box-shadow 0.3s ease;
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
}

.header-input {
  padding: 10px 12px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
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
}

.section-textarea {
  width: 100%;
  min-height: 120px;
  padding: 15px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-family: 'Consolas', 'Monaco', monospace;
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

/* Estilos para la tabla de vista previa */
.table-preview {
  margin: 25px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.table-preview h4 {
  margin-bottom: 15px;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
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
  font-family: "Times New Roman", serif;
}

.preview-table th {
  border: 1px solid #000;
  padding: 6px 8px;
  background-color: #f0f0f0;
  font-weight: bold;
  text-align: center;
}

.preview-table td {
  border: 1px solid #000;
  padding: 4px 6px;
  text-align: left;
  vertical-align: top;
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

/* Controles de la tabla */
.table-controls {
  display: flex;
  gap: 10px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.control-btn {
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.add-row {
  background-color: #27ae60;
  color: white;
}

.add-section {
  background-color: #3498db;
  color: white;
}

.add-subsection {
  background-color: #9b59b6;
  color: white;
}

.add-empty {
  background-color: #95a5a6;
  color: white;
}

.control-btn:hover {
  transform: translateY(-1px);
  opacity: 0.9;
}

/* Editor de tabla */
.table-editor {
  overflow-x: auto;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
}

.editor-table {
  width: 100%;
  border-collapse: collapse;
}

.editor-table th {
  background-color: #34495e;
  color: white;
  padding: 12px 8px;
  text-align: left;
  font-weight: 600;
  font-size: 13px;
}

.editor-table td {
  padding: 8px;
  border-bottom: 1px solid #dee2e6;
}

.table-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'Consolas', 'Monaco', monospace;
  transition: border-color 0.3s ease;
}

.table-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}

.table-input:disabled {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.table-textarea {
  width: 100%;
  min-height: 50px;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  resize: vertical;
  font-size: 12px;
  font-family: 'Consolas', 'Monaco', monospace;
  line-height: 1.4;
}

.table-textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}

.remove-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  font-size: 12px;
  transition: all 0.3s ease;
}

.remove-btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
  transform: none;
}

.remove-btn:not(:disabled):hover {
  background-color: #c0392b;
  transform: scale(1.1);
}

/* Estilos para los mensajes de estado */
.status-message {
  padding: 15px 20px;
  margin: 20px auto;
  border-radius: 8px;
  font-weight: 600;
  text-align: center;
  max-width: 600px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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

/* Estilos responsivos */
@media (max-width: 768px) {
  .document-view {
    padding: 10px;
  }
  
  .document-controls {
    flex-direction: column;
    align-items: center;
  }
  
  .generate-btn, .sample-btn, .reset-btn {
    width: 100%;
    max-width: 300px;
  }
  
  .table-controls {
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