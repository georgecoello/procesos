<template>
  <div class="document-view">
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
        <h3> Configuración del Encabezado del Documento</h3>
        <div class="header-fields">
          <div class="field-group">
            <label>Manual de Políticas y Procedimientos:</label>
            <input v-model="headerConfig.manualName" placeholder="Manual de Políticas y Procedimientos" class="header-input">
          </div>
          <div class="field-group">
            <label>POLÍTICA O PROCEDIMIENTO DE:</label>
            <input v-model="headerConfig.policyName" placeholder="NOMBRE DEL PROCEDIMIENTO" class="header-input">
          </div>
          <div class="field-group">
            <label>CÓDIGO:</label>
            <input v-model="headerConfig.codigo" placeholder="XX-P-XXX-#" class="header-input">
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
        
        <div class="rich-text-editor">
          <div class="toolbar">
            <button
              class="toolbar-btn"
              :class="{ 'active': section.editor?.isActive('bold') }"
              @click="section.editor?.chain().focus().toggleBold().run()"
              title="Negrita"
            >
              <strong>B</strong>
            </button>
            
            <button
              class="toolbar-btn"
              :class="{ 'active': section.editor?.isActive('italic') }"
              @click="section.editor?.chain().focus().toggleItalic().run()"
              title="Cursiva"
            >
              <em>I</em>
            </button>
            
            <button
              class="toolbar-btn"
              :class="{ 'active': section.editor?.isActive('underline') }"
              @click="section.editor?.chain().focus().toggleUnderline().run()"
              title="Subrayado"
            >
              <u>U</u>
            </button>
            
            <div class="toolbar-separator"></div>
            
            <button
              class="toolbar-btn"
              :class="{ 'active': section.editor?.isActive('bulletList') && !section.editor?.isActive('bulletList', { 'data-type': 'letter' }) }"
              @click="toggleBulletList(section.editor)"
              title="Lista con viñetas"
            >
              <span>•</span>
            </button>
            
            <button
              class="toolbar-btn"
              :class="{ 'active': section.editor?.isActive('orderedList') }"
              @click="section.editor?.chain().focus().toggleOrderedList().run()"
              title="Lista numerada"
            >
              <span>1.</span>
            </button>

            <button
              class="toolbar-btn"
              :class="{ 'active': section.editor?.isActive('bulletList', { 'data-type': 'letter' }) }"
              @click="toggleLetterList(section.editor)"
              title="Lista con letras"
            >
              <span>a)</span>
            </button>
            
            <div class="toolbar-separator"></div>
            
            <button
              class="toolbar-btn"
              @click="section.editor?.chain().focus().undo().run()"
              title="Deshacer"
            >
              ↶
            </button>
            
            <button
              class="toolbar-btn"
              @click="section.editor?.chain().focus().redo().run()"
              title="Rehacer"
            >
              ↷
            </button>
            
            <button
              class="toolbar-btn"
              @click="clearSection(section)"
              title="Limpiar"
            >
              ×
            </button>
          </div>
          
          <editor-content 
            :editor="section.editor" 
            class="editor-content"
          />
        </div>
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
            <li><strong>Para subsecciones usa:</strong> 5.1.1, a), b), •, -, →, subpaso 1, etc.</li>
            <li><strong>El encabezado aparecerá en todas las páginas</strong> del documento generado</li>
          </ul>
          <p><strong>Ejemplo de cómo escribir con subsecciones:</strong></p>
          <pre class="format-example">
El administrador revisa la lista de proveedores a pagar
El administrador envía la lista al gerente general para revisión
El gerente general revisa la lista de proveedores
¿La lista está correcta?
Si está correcta, el gerente general realiza el pago a los proveedores
a) Verifica disponibilidad de fondos
b) Prepara órdenes de pago
c) Registra en el sistema contable
Si no está correcta, el gerente general devuelve la lista al administrador
El administrador verifica y corrige la información de los proveedores
5.1.1 Consulta base de datos de proveedores
5.1.2 Actualiza información faltante
5.1.3 Valida documentos de respaldo
El administrador actualiza la lista con la información corregida
El proceso se repite desde el envío al gerente general
Fin del proceso
          </pre>
        </div>
        
        <div class="rich-text-editor">
          <div class="toolbar">
            <button
              class="toolbar-btn"
              :class="{ 'active': procedimientoEditor?.isActive('bold') }"
              @click="procedimientoEditor?.chain().focus().toggleBold().run()"
              title="Negrita"
            >
              <strong>B</strong>
            </button>
            
            <button
              class="toolbar-btn"
              :class="{ 'active': procedimientoEditor?.isActive('italic') }"
              @click="procedimientoEditor?.chain().focus().toggleItalic().run()"
              title="Cursiva"
            >
              <em>I</em>
            </button>
            
            <button
              class="toolbar-btn"
              :class="{ 'active': procedimientoEditor?.isActive('underline') }"
              @click="procedimientoEditor?.chain().focus().toggleUnderline().run()"
              title="Subrayado"
            >
              <u>U</u>
            </button>
            
            <div class="toolbar-separator"></div>
            
            <button
              class="toolbar-btn"
              :class="{ 'active': procedimientoEditor?.isActive('bulletList') && !procedimientoEditor?.isActive('bulletList', { 'data-type': 'letter' }) }"
              @click="toggleBulletList(procedimientoEditor)"
              title="Lista con viñetas"
            >
              <span>•</span>
            </button>
            
            <button
              class="toolbar-btn"
              :class="{ 'active': procedimientoEditor?.isActive('orderedList') }"
              @click="procedimientoEditor?.chain().focus().toggleOrderedList().run()"
              title="Lista numerada"
            >
              <span>1.</span>
            </button>

            <button
              class="toolbar-btn"
              :class="{ 'active': procedimientoEditor?.isActive('bulletList', { 'data-type': 'letter' }) }"
              @click="toggleLetterList(procedimientoEditor)"
              title="Lista con letras"
            >
              <span>a)</span>
            </button>
            
            <div class="toolbar-separator"></div>
            
            <button
              class="toolbar-btn"
              @click="procedimientoEditor?.chain().focus().undo().run()"
              title="Deshacer"
            >
              ↶
            </button>
            
            <button
              class="toolbar-btn"
              @click="procedimientoEditor?.chain().focus().redo().run()"
              title="Rehacer"
            >
              ↷
            </button>
            
            <button
              class="toolbar-btn"
              @click="clearProcedimiento"
              title="Limpiar"
            >
              ×
            </button>
          </div>
          
          <editor-content 
            :editor="procedimientoEditor" 
            class="editor-content"
          />
        </div>
        
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
          <button @click="parseProcedimiento" class="parse-btn"> 
            <font-awesome-icon icon="table" class="button-icon" />
            Generar Tabla Automáticamente
          </button>
          <button @click="loadExampleProcedimiento" class="sample-btn">
            <font-awesome-icon icon="file-alt" class="button-icon" />
            Cargar Ejemplo con Subsecciones
          </button>
        </div>
      </div>

      <!-- Secciones restantes -->
      <div class="section" v-for="(section, index) in remainingSections" :key="index + 10">
        <h3>{{ section.title }}</h3>
        <div class="section-description">
          <p>{{ section.description }}</p>
        </div>
        
        <div class="rich-text-editor">
          <div class="toolbar">
            <button
              class="toolbar-btn"
              :class="{ 'active': section.editor?.isActive('bold') }"
              @click="section.editor?.chain().focus().toggleBold().run()"
              title="Negrita"
            >
              <strong>B</strong>
            </button>
            
            <button
              class="toolbar-btn"
              :class="{ 'active': section.editor?.isActive('italic') }"
              @click="section.editor?.chain().focus().toggleItalic().run()"
              title="Cursiva"
            >
              <em>I</em>
            </button>
            
            <button
              class="toolbar-btn"
              :class="{ 'active': section.editor?.isActive('underline') }"
              @click="section.editor?.chain().focus().toggleUnderline().run()"
              title="Subrayado"
            >
              <u>U</u>
            </button>
            
            <div class="toolbar-separator"></div>
            
            <button
              class="toolbar-btn"
              :class="{ 'active': section.editor?.isActive('bulletList') && !section.editor?.isActive('bulletList', { 'data-type': 'letter' }) }"
              @click="toggleBulletList(section.editor)"
              title="Lista con viñetas"
            >
              <span>•</span>
            </button>
            
            <button
              class="toolbar-btn"
              :class="{ 'active': section.editor?.isActive('orderedList') }"
              @click="section.editor?.chain().focus().toggleOrderedList().run()"
              title="Lista numerada"
            >
              <span>1.</span>
            </button>

            <button
              class="toolbar-btn"
              :class="{ 'active': section.editor?.isActive('bulletList', { 'data-type': 'letter' }) }"
              @click="toggleLetterList(section.editor)"
              title="Lista con letras"
            >
              <span>a)</span>
            </button>
            
            <div class="toolbar-separator"></div>
            
            <button
              class="toolbar-btn"
              @click="section.editor?.chain().focus().undo().run()"
              title="Deshacer"
            >
              ↶
            </button>
            
            <button
              class="toolbar-btn"
              @click="section.editor?.chain().focus().redo().run()"
              title="Rehacer"
            >
              ↷
            </button>
            
            <button
              class="toolbar-btn"
              @click="clearSection(section)"
              title="Limpiar"
            >
              ×
            </button>
          </div>
          
          <editor-content 
            :editor="section.editor" 
            class="editor-content"
          />
        </div>
      </div>
      
      <div class="document-controls">
        <button @click="generateWordDocument" class="generate-btn" :disabled="isGenerating">
          <font-awesome-icon icon="file-word" class="button-icon" />
          Generar Documento Word
        </button>
        <button @click="resetDocument" class="reset-btn">
          <font-awesome-icon icon="trash" class="button-icon" />
          Limpiar Todo
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { generateWordDocument } from '@/utils/docGenerator'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import HardBreak from '@tiptap/extension-hard-break'
import BulletList from '@tiptap/extension-bullet-list'

// Extensión personalizada para listas con letras
const LetterListExtension = BulletList.extend({
  addAttributes() {
    return {
      'data-type': {
        default: null,
        parseHTML: element => element.getAttribute('data-type'),
        renderHTML: attributes => {
          return attributes['data-type'] ? { 'data-type': attributes['data-type'] } : {}
        }
      }
    }
  }
})

export default {
  name: 'DocumentView',
  components: {
    EditorContent
  },
  data() {
    return {
      headerConfig: {
        manualName: 'Manual de Políticas y Procedimientos',
        policyName: 'PROCEDIMIENTO',
        codigo: 'XX-P-XXX-#',
        area: 'Administración',
        unidad: 'Finanzas',
        revision: '01',
        fecha: this.getFormattedDate()
      },
      sections: [
        { 
          title: '1. Objetivo o Propósito', 
          description: 'Establecer el propósito general del procedimiento.',
          placeholder: 'Definir el objetivo principal del procedimiento y los resultados esperados...',
          content: '',
          editor: null
        },
        { 
          title: '2. Alcance', 
          description: 'Definir los límites y cobertura del procedimiento.',
          placeholder: 'Especificar los límites, áreas de aplicación y exclusiones del procedimiento...',
          content: '',
          editor: null
        },
        { 
          title: '3. Responsabilidades', 
          description: 'Listar los roles y responsabilidades de cada participante.',
          placeholder: '1. Responsable Principal\n2. Coordinador\n3. Ejecutor...',
          content: '',
          editor: null
        },
        { 
          title: '4. Normativa', 
          description: 'Establecer las normas, políticas y criterios aplicables.',
          placeholder: 'I. [MARCO NORMATIVO]\nEstablecer las normas y políticas que rigen el procedimiento...',
          content: '',
          editor: null
        }
      ],
      remainingSections: [
        { 
          title: '6. Anexos', 
          description: 'Listar los formatos, documentos y anexos relacionados.',
          placeholder: 'Formato de registro\nDocumentos de referencia...',
          content: '',
          editor: null
        },
        { 
          title: '7. Términos y Referencias', 
          description: 'Definir términos técnicos y referencias documentales.',
          placeholder: 'Término 1: Definición\nTérmino 2: Explicación...',
          content: '',
          editor: null
        }
      ],
      generatedTable: [],
      statusMessage: '',
      statusType: '',
      isGenerating: false,
      procedimientoEditor: null
    }
  },
  computed: {
    procedureTable() {
      return this.generatedTable;
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initializeEditors();
    });
  },
  beforeUnmount() {
    this.destroyEditors();
  },
  methods: {
    initializeEditors() {
      // Inicializar secciones principales
      this.sections.forEach((section, index) => {
        section.editor = new Editor({
          content: section.content,
          extensions: [
            StarterKit.configure({
              hardBreak: {
                keepMarks: true,
              },
              bulletList: {
                HTMLAttributes: {
                  class: 'bullet-list',
                },
              },
            }),
            Underline,
            HardBreak.configure({
              keepMarks: true,
            }),
            Placeholder.configure({
              placeholder: section.placeholder
            }),
            LetterListExtension
          ],
          onUpdate: () => {
            this.sections[index].content = section.editor.getHTML();
          },
          onCreate: () => {
            console.log(`Editor ${section.title} inicializado`);
          },
          editorProps: {
            attributes: {
              class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
              style: 'min-height: 120px; white-space: pre-line;'
            },
            handleKeyDown: (view, event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                const { state } = view;
                const { $from } = state.selection;
                const depth = $from.depth;
                const parentNode = depth > 0 ? $from.node(depth - 1) : null;
                if (parentNode && parentNode.type && parentNode.type.name === 'listItem') {
                  return false;
                }
                view.dispatch(state.tr.replaceSelectionWith(state.schema.nodes.hardBreak.create()).scrollIntoView());
                return true;
              }
              return false;
            }
          }
        });
      });

      // Inicializar secciones restantes
      this.remainingSections.forEach((section, index) => {
        section.editor = new Editor({
          content: section.content,
          extensions: [
            StarterKit.configure({
              hardBreak: {
                keepMarks: true,
              },
              bulletList: {
                HTMLAttributes: {
                  class: 'bullet-list',
                },
              },
            }),
            Underline,
            HardBreak.configure({
              keepMarks: true,
            }),
            Placeholder.configure({
              placeholder: section.placeholder
            }),
            LetterListExtension
          ],
          onUpdate: () => {
            this.remainingSections[index].content = section.editor.getHTML();
          },
          editorProps: {
            attributes: {
              class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
              style: 'min-height: 120px; white-space: pre-line;'
            },
            handleKeyDown: (view, event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                const { state } = view;
                const { $from } = state.selection;
                const parent = $from.parent;
                if (parent && parent.type && parent.type.name === 'listItem') {
                  return false;
                }
                view.dispatch(state.tr.replaceSelectionWith(state.schema.nodes.hardBreak.create()).scrollIntoView());
                return true;
              }
              return false;
            }
          }
        });
      });

      // Inicializar editor de procedimiento
      this.procedimientoEditor = new Editor({
        content: '',
        extensions: [
          StarterKit.configure({
            hardBreak: {
              keepMarks: true,
            },
            bulletList: {
              HTMLAttributes: {
                class: 'bullet-list',
              },
            },
          }),
          Underline,
          HardBreak.configure({
            keepMarks: true,
          }),
          Placeholder.configure({
            placeholder: 'Describe el procedimiento completo aquí en lenguaje natural...'
          }),
          LetterListExtension
        ],
        onCreate: () => {
          console.log('Editor de procedimiento inicializado');
        },
        editorProps: {
          attributes: {
            class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
            style: 'min-height: 200px; white-space: pre-line;'
          },
          handleKeyDown: (view, event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              const { state } = view;
              const { $from } = state.selection;
              const depth = $from.depth;
              const parentNode = depth > 0 ? $from.node(depth - 1) : null;
              if (parentNode && parentNode.type && parentNode.type.name === 'listItem') {
                return false;
              }
              view.dispatch(state.tr.replaceSelectionWith(state.schema.nodes.hardBreak.create()).scrollIntoView());
              return true;
            }
            return false;
          }
        }
      });
    },

    // Método para alternar lista con letras
    toggleLetterList(editor) {
      if (!editor) return;

      // Si ya está activa la lista de letras -> quitar atributo 'data-type' (vuelve a viñeta normal)
      if (editor.isActive('bulletList', { 'data-type': 'letter' })) {
        editor.chain().focus().updateAttributes('bulletList', { 'data-type': null }).run();
        return;
      }

      // Si hay una lista normal activa -> convertirla a lista de letras
      if (editor.isActive('bulletList')) {
        editor.chain().focus().updateAttributes('bulletList', { 'data-type': 'letter' }).run();
        return;
      }

      // Si no hay lista activa -> crear lista y luego marcar como 'letter' en una sola cadena
      editor.chain().focus().toggleBulletList().updateAttributes('bulletList', { 'data-type': 'letter' }).run();
    },

    // Nuevo: método central para togglear viñetas normales y limpiar el atributo 'letter' si existe
    toggleBulletList(editor) {
      if (!editor) return;

      // Si estamos en una lista de letras y se quiere viñeta normal -> quitar atributo 'letter'
      if (editor.isActive('bulletList', { 'data-type': 'letter' })) {
        editor.chain().focus().updateAttributes('bulletList', { 'data-type': null }).run();
        return;
      }

      // En el resto de casos, hacer toggle normal (activar/desactivar)
      editor.chain().focus().toggleBulletList().run();
    },

    destroyEditors() {
      // Destruir todos los editores para evitar memory leaks
      this.sections.forEach(section => {
        if (section.editor) {
          section.editor.destroy();
        }
      });
      this.remainingSections.forEach(section => {
        if (section.editor) {
          section.editor.destroy();
        }
      });
      if (this.procedimientoEditor) {
        this.procedimientoEditor.destroy();
      }
    },

    clearSection(section) {
      if (section.editor) {
        section.editor.commands.clearContent();
        this.showStatus('Sección limpiada', 'info');
      }
    },

    clearProcedimiento() {
      if (this.procedimientoEditor) {
        this.procedimientoEditor.commands.clearContent();
        this.generatedTable = [];
        this.showStatus('Procedimiento limpiado', 'info');
      }
    },

    getFormattedDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    loadExampleProcedimiento() {
      if (!this.procedimientoEditor) return;
      
      const exampleText = `El administrador revisa la lista de proveedores a pagar
El administrador envía la lista al gerente general para revisión
El gerente general revisa la lista de proveedores
¿La lista está correcta?
Si está correcta, el gerente general realiza el pago a los proveedores
a) Verifica disponibilidad de fondos
b) Prepara órdenes de pago
c) Registra en el sistema contable
Si no está correcta, el gerente general devuelve la lista al administrador
El administrador verifica y corrige la información de los proveedores
5.1.1 Consulta base de datos de proveedores
5.1.2 Actualiza información faltante
5.1.3 Valida documentos de respaldo
El administrador actualiza la lista con la información corregida
El proceso se repite desde el envío al gerente general
Fin del proceso`;

      // Convertir el texto plano a formato que Tiptap entienda con saltos de línea
      const formattedContent = exampleText.split('\n').map(line => {
        if (line.trim() === '') return '<p></p>';
        
        // Detectar si es una lista con letras (a), b), c), etc.)
        if (/^[a-z]\)/.test(line.trim())) {
          return `<ul data-type="letter"><li>${line.replace(/^[a-z]\)\s*/, '')}</li></ul>`;
        }
        
        // Detectar si es una lista numerada (5.1.1, 5.1.2, etc.)
        if (/^\d+\.\d+\.\d+/.test(line.trim())) {
          return `<ul><li>${line}</li></ul>`;
        }
        
        return `<p>${line}</p>`;
      }).join('');

      this.procedimientoEditor.commands.setContent(formattedContent);
      this.showStatus('📝 Ejemplo con subsecciones cargado. Haz clic en "Generar Tabla Automáticamente" para ver el resultado.', 'info');
    },

    // Los demás métodos se mantienen igual...
    parseProcedimiento() {
      if (!this.procedimientoEditor) return;
      
      const textContent = this.procedimientoEditor.getText();
      
      if (!textContent.trim()) {
        this.showStatus(' Por favor ingresa la descripción del procedimiento', 'error');
        return;
      }

      try {
        const lines = textContent.split('\n').filter(line => line.trim() !== '');
        const table = [];
        let stepNumber = 1;
        let subStepNumber = 0;
        let currentMainStep = null;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          if (line === '') continue;

          if (this.isSubsectionStarter(line)) {
            if (currentMainStep) {
              subStepNumber++;
              const fullNumber = `${currentMainStep}.${subStepNumber}`;
              const responsible = this.extractResponsible(line);
              const activity = this.extractActivity(line, responsible);
              
              table.push({ 
                number: fullNumber, 
                who: responsible, 
                activity: activity,
                level: 'sub'
              });
            } else {
              const responsible = this.extractResponsible(line);
              const activity = this.extractActivity(line, responsible);
              
              table.push({ 
                number: `${stepNumber}`, 
                who: responsible, 
                activity: activity 
              });
              stepNumber++;
              subStepNumber = 0;
            }
          }
          else if (this.isMainProcessLine(line)) {
            table.push({ number: '', who: '', activity: line, level: 'section' });
            currentMainStep = null;
            subStepNumber = 0;
          }
          else if (line.startsWith('¿')) {
            table.push({ number: '', who: '', activity: line, level: 'question' });
            currentMainStep = null;
            subStepNumber = 0;
          }
          else if (line.toLowerCase().startsWith('si ') || line.toLowerCase().startsWith('no ') || 
                   line.toLowerCase().startsWith('si,') || line.toLowerCase().startsWith('no,')) {
            table.push({ number: '', who: '', activity: line, level: 'alternative' });
            currentMainStep = null;
            subStepNumber = 0;
          }
          else if (line.toLowerCase().includes('fin del proceso')) {
            table.push({ number: '', who: '', activity: 'Fin del Proceso', level: 'end' });
            currentMainStep = null;
            subStepNumber = 0;
          }
          else {
            const responsible = this.extractResponsible(line);
            const activity = this.extractActivity(line, responsible);
            
            if (responsible || activity) {
              table.push({ 
                number: `${stepNumber}`, 
                who: responsible, 
                activity: activity 
              });
              currentMainStep = stepNumber;
              stepNumber++;
              subStepNumber = 0;
            }
          }
        }

        this.generatedTable = table;
        this.showStatus(' Tabla generada automáticamente desde la descripción', 'success');
      } catch (error) {
        this.showStatus(' Error al procesar la descripción: ' + error.message, 'error');
      }
    },

    isSubsectionStarter(line) {
      const subsectionPatterns = [
        /^\d+\.\d+\.\d+/,
        /^[a-z]\)/,
        /^[ivx]+\)/,
        /^•\s/,
        /^-\s/,
        /^→\s/,
        /^subpaso\s\d+/i,
        /^detalle\s\d+/i
      ];

      return subsectionPatterns.some(pattern => pattern.test(line.toLowerCase()));
    },

    isMainProcessLine(line) {
      return !line.startsWith('¿') && 
             !line.toLowerCase().startsWith('si ') && 
             !line.toLowerCase().startsWith('no ') &&
             !line.toLowerCase().startsWith('si,') && 
             !line.toLowerCase().startsWith('no,') &&
             !line.toLowerCase().includes('fin del proceso') &&
             !this.extractResponsible(line) &&
             !this.isSubsectionStarter(line) &&
             line.length > 10;
    },

    extractResponsible(line) {
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

      // Asegurar que 'responsible' se use correctamente y escapar caracteres para la regex
      const respRaw = String(responsible).trim();
      const respEscaped = respRaw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Quitar prefijos típicos que repiten el responsable (ej. "El administrador ...")
      const removePattern = new RegExp(`^(el\\s+${respEscaped}|la\\s+${respEscaped}|los\\s+${respEscaped}|las\\s+${respEscaped}|${respEscaped})\\s+`, 'i');
      let activity = line.replace(removePattern, '').trim();

      // Capitalizar primera letra
      if (!activity) return '';
      return activity.charAt(0).toUpperCase() + activity.slice(1);
    },

    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },

    getRowClass(row) {
      if (row.level === 'section') {
        return 'section-row';
      }
      if (row.level === 'sub') {
        return 'subsection-row';
      }
      if (row.level === 'question') {
        return 'question-row';
      }
      if (row.level === 'alternative') {
        return 'alternative-row';
      }
      if (row.level === 'end') {
        return 'end-row';
      }
      if (!row.number && !row.who && !row.activity) {
        return 'empty-row';
      }
      return 'normal-row';
    },

    async generateWordDocument() {
      this.isGenerating = true;
      
      const procedimientoText = this.procedimientoEditor ? this.procedimientoEditor.getText() : '';
      
      if (procedimientoText && this.generatedTable.length === 0) {
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
        this.showStatus(' Documento Word generado exitosamente! El encabezado aparecerá en todas las páginas.', 'success');
      } catch (error) {
        this.showStatus(' Error al generar el documento: ' + error.message, 'error');
      } finally {
        this.isGenerating = false;
      }
    },

    resetDocument() {
      if (confirm('¿Estás seguro de que quieres limpiar todo el documento? Se perderán todos los cambios.')) {
        this.sections.forEach(section => {
          if (section.editor) {
            section.editor.commands.clearContent();
          }
        });
        this.remainingSections.forEach(section => {
          if (section.editor) {
            section.editor.commands.clearContent();
          }
        });
        if (this.procedimientoEditor) {
          this.procedimientoEditor.commands.clearContent();
        }
        this.generatedTable = [];
        this.headerConfig.fecha = this.getFormattedDate();
        this.headerConfig.manualName = 'Manual de Políticas y Procedimientos';
        this.headerConfig.policyName = 'PROCEDIMIENTO';
        this.headerConfig.codigo = 'XX-P-XXX-#';
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

/* Estilos para el editor de texto enriquecido */
.rich-text-editor {
  border: 2px solid #e9ecef;
  border-radius: 6px;
  background: white;
  transition: border-color 0.3s ease;
  overflow: hidden;
}

.rich-text-editor:focus-within {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.toolbar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  gap: 4px;
  flex-wrap: wrap;
}

.toolbar-btn {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #495057;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
}

.toolbar-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.toolbar-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.toolbar-separator {
  width: 1px;
  height: 20px;
  background: #dee2e6;
  margin: 0 4px;
}

.editor-content {
  padding: 15px;
  min-height: 120px;
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #2c3e50;
  background: white;
  outline: none;
}

/* Estilos para el contenido del editor Tiptap */
:deep(.ProseMirror) {
  outline: none;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #2c3e50;
  min-height: 100px;
  padding: 0 !important;
}

:deep(.ProseMirror p) {
  margin: 0 0 12px 0;
}

:deep(.ProseMirror:focus) {
  outline: none;
}

:deep(.ProseMirror ul),
:deep(.ProseMirror ol) {
  padding-left: 24px;
  margin: 12px 0;
}

:deep(.ProseMirror li) {
  margin-bottom: 6px;
  line-height: 1.5;
}

:deep(.ProseMirror ul li) {
  list-style-type: disc;
}

:deep(.ProseMirror ol li) {
  list-style-type: decimal;
}

:deep(.ProseMirror strong) {
  font-weight: 600;
  color: #2c3e50;
}

:deep(.ProseMirror em) {
  font-style: italic;
}

:deep(.ProseMirror u) {
  text-decoration: underline;
}

:deep(.ProseMirror .is-empty:first-child::before) {
  content: attr(data-placeholder);
  color: #adb5bd;
  float: left;
  height: 0;
  pointer-events: none;
}

/* Estilos para listas con letras en el editor */
:deep(ul[data-type="letter"]) {
  list-style-type: lower-alpha !important;
  padding-left: 24px !important;
  margin: 8px 0 !important;
}

:deep(ul[data-type="letter"] li) {
  list-style-type: lower-alpha !important;
  margin-bottom: 4px !important;
}

:deep(ul:not([data-type="letter"])) {
  list-style-type: disc !important;
  padding-left: 24px !important;
  margin: 8px 0 !important;
}

:deep(ul:not([data-type="letter"]) li) {
  list-style-type: disc !important;
  margin-bottom: 4px !important;
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
  display: flex;
  align-items: center;
  gap: 6px;
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

/* Estilos para subsecciones y diferentes tipos de filas */
.section-row td {
  background-color: #e3f2fd;
  font-weight: bold;
  border-left: 4px solid #2196f3 !important;
}

.subsection-row td:first-child {
  font-weight: bold;
  background-color: #e8f5e8;
  padding-left: 30px !important;
}

.subsection-row td:not(:first-child) {
  background-color: #e8f5e8;
  padding-left: 10px;
}

.question-row td {
  background-color: #fff3cd !important;
  font-style: italic;
  border-left: 4px solid #ffc107 !important;
}

.alternative-row td {
  background-color: #d1ecf1 !important;
  border-left: 4px solid #17a2b8 !important;
}

.end-row td {
  background-color: #d4edda !important;
  font-weight: bold;
  border-left: 4px solid #28a745 !important;
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
}

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

/* Responsive breakpoints */
@media (max-width: 1024px) {
  .document-editor {
    padding: 22px;
  }

  .header-fields {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
  }

  .section h3 {
    font-size: 1.25rem;
  }

  .editor-content {
    min-height: 100px;
    max-height: 300px;
    padding: 12px;
  }

  .preview-table {
    font-size: 10px;
  }

  .action-buttons {
    gap: 8px;
  }
}

@media (max-width: 768px) {
  .document-view {
    padding: 8px;
  }

  .document-controls {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    gap: 10px;
  }
  
  .generate-btn, .reset-btn {
    width: 100%;
    max-width: none;
  }
  
  .action-buttons {
    justify-content: center;
    flex-direction: column;
    align-items: stretch;
  }

  .parse-btn, .sample-btn {
    width: 100%;
  }
  
  .section {
    padding: 12px;
  }
  
  .header-fields {
    grid-template-columns: 1fr;
  }

  .format-example {
    font-size: 11px;
    padding: 12px;
  }

  .toolbar {
    padding: 6px 8px;
  }

  .toolbar-btn {
    padding: 4px 6px;
    font-size: 11px;
    min-width: 24px;
    height: 24px;
  }
}

@media (max-width: 480px) {
  .document-view {
    padding: 6px;
  }

  .document-editor {
    padding: 12px;
  }

  .section h3 {
    font-size: 1.05rem;
    padding-bottom: 8px;
  }

  .header-input {
    padding: 9px 10px;
    font-size: 13px;
  }

  .editor-content {
    min-height: 80px;
    max-height: 250px;
    padding: 10px;
  }

  .preview-container {
    padding: 6px;
  }

  .preview-table th, .preview-table td {
    padding: 6px 6px;
  }

  .button-icon {
    display: none;
  }
}
</style>