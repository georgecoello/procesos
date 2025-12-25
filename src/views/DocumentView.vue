<template>
  <div class="document-view">
    <!-- Modal de confirmación mejorado -->
    <div v-if="showResetModal" class="modal-overlay" @click.self="closeResetModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">Confirmar Limpieza</h3>
          <button class="modal-close-btn" @click="closeResetModal">
            <span>×</span>
          </button>
        </div>
        
        <div class="modal-content">
          <p class="modal-message">¿Estás seguro de que quieres limpiar todo el documento?</p>
          <p class="modal-warning">Se perderán todos los cambios no guardados.</p>
        </div>
        
        <div class="modal-actions">
          <button class="modal-btn modal-btn-cancel" @click="closeResetModal">
            Cancelar
          </button>
          <button class="modal-btn modal-btn-confirm" @click="confirmReset">
            Limpiar Todo
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de IA -->
    <div v-if="showAIModal" class="modal-overlay" @click.self="closeAIModal">
      <div class="modal-container ai-modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ aiModalTitle }}</h3>
          <button class="modal-close-btn" @click="closeAIModal">
            <span>×</span>
          </button>
        </div>
        
        <div class="modal-content">
          <div v-if="aiService.isAvailable" class="ai-status available">
            ✅ IA disponible ({{ aiService.provider.toUpperCase() }})
          </div>
          <div v-else class="ai-status unavailable">
            ❌ IA no disponible - Configura las variables de entorno
          </div>
          
          <div class="ai-prompt-section">
            <label>Instrucción para la IA:</label>
            <textarea 
              v-model="aiPrompt" 
              class="ai-prompt-input"
              placeholder="Escribe lo que quieres que la IA haga con este texto..."
              rows="3"
              :disabled="isAILoading"
            ></textarea>
            
            <div class="ai-examples">
              <small>Ejemplos: 
                <span @click="setExamplePrompt('Corrige la gramática y ortografía')" class="example-link">Corregir</span> • 
                <span @click="setExamplePrompt('Haz el texto más profesional')" class="example-link">Profesionalizar</span> • 
                <span @click="setExamplePrompt('Expande esta idea con más detalles')" class="example-link">Expandir</span> •
                <span @click="setExamplePrompt('Traduce al inglés')" class="example-link">Traducir</span>
              </small>
            </div>
          </div>
          
          <div class="ai-preview">
            <h4>Texto actual:</h4>
            <div class="current-text-preview">
              <pre>{{ currentTextForAI }}</pre>
            </div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button 
            class="modal-btn modal-btn-cancel" 
            @click="closeAIModal"
            :disabled="isAILoading"
          >
            Cancelar
          </button>
          <button 
            class="modal-btn modal-btn-confirm ai-execute-btn" 
            @click="executeAICommand"
            :disabled="isAILoading || !aiService.isAvailable || !aiPrompt.trim()"
          >
            <span v-if="isAILoading">⏳ Procesando...</span>
            <span v-else>🚀 Ejecutar IA</span>
          </button>
        </div>
      </div>
    </div>

    <div class="status-message" v-if="statusMessage" :class="statusType">
      {{ statusMessage }}
    </div>

    <div class="document-editor">
      <!-- Configuración del Encabezado -->
      <div class="section header-config">
        <div class="section-header">
          <h3>Configuración del Encabezado del Documento</h3>
          <span class="ai-indicator" :class="{ 'available': aiService.isAvailable, 'unavailable': !aiService.isAvailable }">
            {{ aiService.isAvailable ? '🤖 IA disponible' : '❌ IA no configurada' }}
          </span>
        </div>
        <div class="header-fields">
          <div class="field-group">
            <label>Manual de Políticas y Procedimientos:</label>
            <input v-model="headerConfig.manualName" placeholder="Ingrese el nombre del manual" class="header-input">
          </div>
          <div class="field-group">
            <label>POLÍTICA O PROCEDIMIENTO DE:</label>
            <input v-model="headerConfig.policyName" placeholder="Ingrese el nombre del procedimiento" class="header-input">
          </div>
          <div class="field-group">
            <label>CÓDIGO:</label>
            <input v-model="headerConfig.codigo" placeholder="Ej: XX-P-XXX-#" class="header-input">
          </div>
          <div class="field-group">
            <label>Área:</label>
            <input v-model="headerConfig.area" placeholder="Ej: Administración" class="header-input">
          </div>
          <div class="field-group">
            <label>Unidad:</label>
            <input v-model="headerConfig.unidad" placeholder="Ej: Finanzas" class="header-input">
          </div>
          <div class="field-group">
            <label>Revisión:</label>
            <input v-model="headerConfig.revision" placeholder="Ej: 01" class="header-input">
          </div>
          <div class="field-group">
            <label>Fecha:</label>
            <input v-model="headerConfig.fecha" type="date" class="header-input">
          </div>
        </div>
      </div>

      <!-- Secciones editables del contenido -->
      <div class="section" v-for="(section, index) in sections" :key="index">
        <div class="section-header">
          <h3>{{ section.title }}</h3>
          <div class="section-actions">
            <button 
              class="section-ai-btn"
              @click="quickImproveWithAI(section)"
              :disabled="!aiService.isAvailable || isAILoading"
              title="Mejorar con IA"
            >
              <span v-if="isAILoading && currentAISection === section">⏳</span>
              <span v-else>✨ Mejorar</span>
            </button>
            <button 
              class="section-ai-btn"
              @click="generateWithAI(section)"
              :disabled="!aiService.isAvailable || isAILoading"
              title="Generar con IA"
            >
              <span v-if="isAILoading && currentAISection === section">⏳</span>
              <span v-else>🚀 Generar</span>
            </button>
          </div>
        </div>
        <div class="section-description">
          <p>{{ section.description }}</p>
        </div>
        
        <div class="rich-text-editor">
          <div class="toolbar">
            <!-- Grupo de formato de texto -->
            <div class="toolbar-group">
              <button
                class="toolbar-btn"
                :class="{ 'active': section.editor?.isActive('bold') }"
                @click="section.editor?.chain().focus().toggleBold().run()"
                title="Negrita (Ctrl+B)"
              >
                <strong>B</strong>
              </button>
              
              <button
                class="toolbar-btn"
                :class="{ 'active': section.editor?.isActive('italic') }"
                @click="section.editor?.chain().focus().toggleItalic().run()"
                title="Cursiva (Ctrl+I)"
              >
                <em>I</em>
              </button>
              
              <button
                class="toolbar-btn"
                :class="{ 'active': section.editor?.isActive('underline') }"
                @click="section.editor?.chain().focus().toggleUnderline().run()"
                title="Subrayado (Ctrl+U)"
              >
                <u>U</u>
              </button>
              
              <button
                class="toolbar-btn"
                :class="{ 'active': section.editor?.isActive('strike') }"
                @click="section.editor?.chain().focus().toggleStrike().run()"
                title="Tachado (Ctrl+Shift+S)"
              >
                <s>S</s>
              </button>
            </div>
            
            <div class="toolbar-separator"></div>
            
            <!-- Grupo de estilos de párrafo -->
            <div class="toolbar-group">
              <select 
                class="style-select"
                @change="applyStyle(section.editor, $event.target.value)"
                :value="getCurrentStyle(section.editor)"
                title="Estilo de párrafo"
              >
                <option value="paragraph">Párrafo normal</option>
                <option value="h1">Título 1</option>
                <option value="h2">Título 2</option>
                <option value="h3">Título 3</option>
                <option value="blockquote">Cita</option>
                <option value="code">Código</option>
              </select>
              
              <button
                class="toolbar-btn"
                :class="{ 'active': section.editor?.isActive('paragraph') && !section.editor?.isActive('heading') && !section.editor?.isActive('blockquote') && !section.editor?.isActive('codeBlock') }"
                @click="section.editor?.chain().focus().setParagraph().run()"
                title="Párrafo normal"
              >
                <span class="icon-text">¶</span>
              </button>
            </div>
            
            <div class="toolbar-separator"></div>
            
            <!-- Grupo de alineación -->
            <div class="toolbar-group">
              <button
                class="toolbar-btn"
                :class="{ 'active': section.editor?.isActive({ textAlign: 'left' }) }"
                @click="section.editor?.chain().focus().setTextAlign('left').run()"
                title="Alinear a la izquierda"
              >
                <font-awesome-icon icon="align-left" />
              </button>
              
              <button
                class="toolbar-btn"
                :class="{ 'active': section.editor?.isActive({ textAlign: 'center' }) }"
                @click="section.editor?.chain().focus().setTextAlign('center').run()"
                title="Centrar"
              >
                <font-awesome-icon icon="align-center" />
              </button>
              
              <button
                class="toolbar-btn"
                :class="{ 'active': section.editor?.isActive({ textAlign: 'right' }) }"
                @click="section.editor?.chain().focus().setTextAlign('right').run()"
                title="Alinear a la derecha"
              >
                <font-awesome-icon icon="align-right" />
              </button>
              
              <button
                class="toolbar-btn"
                :class="{ 'active': section.editor?.isActive({ textAlign: 'justify' }) }"
                @click="section.editor?.chain().focus().setTextAlign('justify').run()"
                title="Justificar"
              >
                <font-awesome-icon icon="align-justify" />
              </button>
            </div>
            
            <div class="toolbar-separator"></div>
            
            <!-- Grupo de listas -->
            <div class="toolbar-group">
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
            </div>
            
            <div class="toolbar-separator"></div>
            
            <!-- Grupo de herramientas -->
            <div class="toolbar-group">
              <button
                class="toolbar-btn"
                @click="section.editor?.chain().focus().undo().run()"
                title="Deshacer (Ctrl+Z)"
              >
                ↶
              </button>
              
              <button
                class="toolbar-btn"
                @click="section.editor?.chain().focus().redo().run()"
                title="Rehacer (Ctrl+Y)"
              >
                ↷
              </button>
              
              <button
                class="toolbar-btn"
                @click="clearSection(section)"
                title="Limpiar sección"
              >
                ×
              </button>
            </div>
            
            <div class="toolbar-separator"></div>
            
            <!-- Grupo de IA -->
            <div class="toolbar-group">
              <button
                class="toolbar-btn ia-btn"
                @click="showAIInput(section, 'improve')"
                title="Mejorar con IA"
                :disabled="!aiService.isAvailable || isAILoading"
              >
                <span>✨</span>
              </button>
              
              <button
                class="toolbar-btn ia-btn"
                @click="showAIInput(section, 'suggest')"
                title="Sugerir con IA"
                :disabled="!aiService.isAvailable || isAILoading"
              >
                <span>💡</span>
              </button>
              
              <button
                class="toolbar-btn ia-btn"
                @click="showAIInput(section, 'expand')"
                title="Expandir con IA"
                :disabled="!aiService.isAvailable || isAILoading"
              >
                <span>➕</span>
              </button>
            </div>
          </div>
          
          <editor-content 
            :editor="section.editor" 
            class="editor-content"
          />
        </div>
      </div>

      <!-- Sección de Procedimiento Mejorada -->
      <div class="section">
        <div class="section-header">
          <h3>5. Procedimiento</h3>
          <div class="section-actions">
            <button 
              class="section-ai-btn"
              @click="quickImproveWithAI('procedimiento')"
              :disabled="!aiService.isAvailable || isAILoading"
              title="Mejorar con IA"
            >
              <span v-if="isAILoading && currentAISection === 'procedimiento'">⏳</span>
              <span v-else>✨ Mejorar</span>
            </button>
            <button 
              class="section-ai-btn"
              @click="analyzeWithAI"
              :disabled="!aiService.isAvailable || isAILoading"
              title="Analizar con IA"
            >
              <span v-if="isAnalyzing">⏳</span>
              <span v-else>🔍 Analizar</span>
            </button>
          </div>
        </div>
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
            <!-- Grupo de formato de texto -->
            <div class="toolbar-group">
              <button
                class="toolbar-btn"
                :class="{ 'active': procedimientoEditor?.isActive('bold') }"
                @click="procedimientoEditor?.chain().focus().toggleBold().run()"
                title="Negrita (Ctrl+B)"
              >
                <strong>B</strong>
              </button>
              
              <button
                class="toolbar-btn"
                :class="{ 'active': procedimientoEditor?.isActive('italic') }"
                @click="procedimientoEditor?.chain().focus().toggleItalic().run()"
                title="Cursiva (Ctrl+I)"
              >
                <em>I</em>
              </button>
              
              <button
                class="toolbar-btn"
                :class="{ 'active': procedimientoEditor?.isActive('underline') }"
                @click="procedimientoEditor?.chain().focus().toggleUnderline().run()"
                title="Subrayado (Ctrl+U)"
              >
                <u>U</u>
              </button>
              
              <button
                class="toolbar-btn"
                :class="{ 'active': procedimientoEditor?.isActive('strike') }"
                @click="procedimientoEditor?.chain().focus().toggleStrike().run()"
                title="Tachado (Ctrl+Shift+S)"
              >
                <s>S</s>
              </button>
            </div>
            
            <div class="toolbar-separator"></div>
            
            <!-- Grupo de estilos de párrafo -->
            <div class="toolbar-group">
              <select 
                class="style-select"
                @change="applyStyle(procedimientoEditor, $event.target.value)"
                :value="getCurrentStyle(procedimientoEditor)"
                title="Estilo de párrafo"
              >
                <option value="paragraph">Párrafo normal</option>
                <option value="h1">Título 1</option>
                <option value="h2">Título 2</option>
                <option value="h3">Título 3</option>
                <option value="blockquote">Cita</option>
                <option value="code">Código</option>
              </select>
              
              <button
                class="toolbar-btn"
                :class="{ 'active': procedimientoEditor?.isActive('paragraph') && !procedimientoEditor?.isActive('heading') && !procedimientoEditor?.isActive('blockquote') && !procedimientoEditor?.isActive('codeBlock') }"
                @click="procedimientoEditor?.chain().focus().setParagraph().run()"
                title="Párrafo normal"
              >
                <span class="icon-text">¶</span>
              </button>
            </div>
            
            <div class="toolbar-separator"></div>
            
            <!-- Grupo de alineación -->
            <div class="toolbar-group">
              <button
                class="toolbar-btn"
                :class="{ 'active': procedimientoEditor?.isActive({ textAlign: 'left' }) }"
                @click="procedimientoEditor?.chain().focus().setTextAlign('left').run()"
                title="Alinear a la izquierda"
              >
                <font-awesome-icon icon="align-left" />
              </button>
              
              <button
                class="toolbar-btn"
                :class="{ 'active': procedimientoEditor?.isActive({ textAlign: 'center' }) }"
                @click="procedimientoEditor?.chain().focus().setTextAlign('center').run()"
                title="Centrar"
              >
                <font-awesome-icon icon="align-center" />
              </button>
              
              <button
                class="toolbar-btn"
                :class="{ 'active': procedimientoEditor?.isActive({ textAlign: 'right' }) }"
                @click="procedimientoEditor?.chain().focus().setTextAlign('right').run()"
                title="Alinear a la derecha"
              >
                <font-awesome-icon icon="align-right" />
              </button>
              
              <button
                class="toolbar-btn"
                :class="{ 'active': procedimientoEditor?.isActive({ textAlign: 'justify' }) }"
                @click="procedimientoEditor?.chain().focus().setTextAlign('justify').run()"
                title="Justificar"
              >
                <font-awesome-icon icon="align-justify" />
              </button>
            </div>
            
            <div class="toolbar-separator"></div>
            
            <!-- Grupo de listas -->
            <div class="toolbar-group">
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
            </div>
            
            <div class="toolbar-separator"></div>
            
            <!-- Grupo de herramientas -->
            <div class="toolbar-group">
              <button
                class="toolbar-btn"
                @click="procedimientoEditor?.chain().focus().undo().run()"
                title="Deshacer (Ctrl+Z)"
              >
                ↶
              </button>
              
              <button
                class="toolbar-btn"
                @click="procedimientoEditor?.chain().focus().redo().run()"
                title="Rehacer (Ctrl+Y)"
              >
                ↷
              </button>
              
              <button
                class="toolbar-btn"
                @click="clearProcedimiento"
                title="Limpiar procedimiento"
              >
                ×
              </button>
            </div>
            
            <div class="toolbar-separator"></div>
            
            <!-- Grupo de IA -->
            <div class="toolbar-group">
              <button
                class="toolbar-btn ia-btn"
                @click="showAIInput('procedimiento', 'improve')"
                title="Mejorar con IA"
                :disabled="!aiService.isAvailable || isAILoading"
              >
                <span>✨</span>
              </button>
              
              <button
                class="toolbar-btn ia-btn"
                @click="showAIInput('procedimiento', 'suggest')"
                title="Sugerir con IA"
                :disabled="!aiService.isAvailable || isAILoading"
              >
                <span>💡</span>
              </button>
              
              <button
                class="toolbar-btn ia-btn"
                @click="showAIInput('procedimiento', 'expand')"
                title="Expandir con IA"
                :disabled="!aiService.isAvailable || isAILoading"
              >
                <span>➕</span>
              </button>
            </div>
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
                  <td>{{ row.number || '&nbsp;' }}</td>
                  <td>{{ row.who || '&nbsp;' }}</td>
                  <td>{{ row.activity || '&nbsp;' }}</td>
                </tr>
                <tr v-if="generatedTable.length === 0">
                  <td colspan="3" style="text-align: center; color: #6c757d;">
                    La tabla se generará automáticamente al hacer clic en "Generar Tabla Automáticamente"
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="action-buttons">
          <button @click="parseProcedimiento" class="parse-btn"> 
            Generar Tabla Automáticamente
          </button>
          <button @click="loadExampleProcedimiento" class="sample-btn">
            Cargar Ejemplo con Subsecciones
          </button>
        </div>
      </div>

      <!-- Secciones restantes -->
      <div class="section" v-for="(section, index) in remainingSections" :key="index + 10">
        <div class="section-header">
          <h3>{{ section.title }}</h3>
          <div class="section-actions">
            <button 
              class="section-ai-btn"
              @click="quickImproveWithAI(section)"
              :disabled="!aiService.isAvailable || isAILoading"
              title="Mejorar con IA"
            >
              <span v-if="isAILoading && currentAISection === section">⏳</span>
              <span v-else>✨ Mejorar</span>
            </button>
            <button 
              class="section-ai-btn"
              @click="generateWithAI(section)"
              :disabled="!aiService.isAvailable || isAILoading"
              title="Generar con IA"
            >
              <span v-if="isAILoading && currentAISection === section">⏳</span>
              <span v-else>🚀 Generar</span>
            </button>
          </div>
        </div>
        <div class="section-description">
          <p>{{ section.description }}</p>
        </div>
        
        <div class="rich-text-editor">
          <div class="toolbar">
            <!-- Grupo de formato de texto -->
            <div class="toolbar-group">
              <button
                class="toolbar-btn"
                :class="{ 'active': section.editor?.isActive('bold') }"
                @click="section.editor?.chain().focus().toggleBold().run()"
                title="Negrita (Ctrl+B)"
              >
                <strong>B</strong>
              </button>
              
              <button
                class="toolbar-btn"
                :class="{ 'active': section.editor?.isActive('italic') }"
                @click="section.editor?.chain().focus().toggleItalic().run()"
                title="Cursiva (Ctrl+I)"
              >
                <em>I</em>
              </button>
              
              <button
                class="toolbar-btn"
                :class="{ 'active': section.editor?.isActive('underline') }"
                @click="section.editor?.chain().focus().toggleUnderline().run()"
                title="Subrayado (Ctrl+U)"
              >
                <u>U</u>
              </button>
              
              <button
                class="toolbar-btn"
                :class="{ 'active': section.editor?.isActive('strike') }"
                @click="section.editor?.chain().focus().toggleStrike().run()"
                title="Tachado (Ctrl+Shift+S)"
              >
                <s>S</s>
              </button>
            </div>
            
            <div class="toolbar-separator"></div>
            
            <!-- Grupo de estilos de párrafo -->
            <div class="toolbar-group">
              <select 
                class="style-select"
                @change="applyStyle(section.editor, $event.target.value)"
                :value="getCurrentStyle(section.editor)"
                title="Estilo de párrafo"
              >
                <option value="paragraph">Párrafo normal</option>
                <option value="h1">Título 1</option>
                <option value="h2">Título 2</option>
                <option value="h3">Título 3</option>
                <option value="blockquote">Cita</option>
                <option value="code">Código</option>
              </select>
              
              <button
                class="toolbar-btn"
                :class="{ 'active': section.editor?.isActive('paragraph') && !section.editor?.isActive('heading') && !section.editor?.isActive('blockquote') && !section.editor?.isActive('codeBlock') }"
                @click="section.editor?.chain().focus().setParagraph().run()"
                title="Párrafo normal"
              >
                <span class="icon-text">¶</span>
              </button>
            </div>
            
            <div class="toolbar-separator"></div>
            
            <!-- Grupo de alineación -->
            <div class="toolbar-group">
              <button
                class="toolbar-btn"
                :class="{ 'active': section.editor?.isActive({ textAlign: 'left' }) }"
                @click="section.editor?.chain().focus().setTextAlign('left').run()"
                title="Alinear a la izquierda"
              >
                <font-awesome-icon icon="align-left" />
              </button>
              
              <button
                class="toolbar-btn"
                :class="{ 'active': section.editor?.isActive({ textAlign: 'center' }) }"
                @click="section.editor?.chain().focus().setTextAlign('center').run()"
                title="Centrar"
              >
                <font-awesome-icon icon="align-center" />
              </button>
              
              <button
                class="toolbar-btn"
                :class="{ 'active': section.editor?.isActive({ textAlign: 'right' }) }"
                @click="section.editor?.chain().focus().setTextAlign('right').run()"
                title="Alinear a la derecha"
              >
                <font-awesome-icon icon="align-right" />
              </button>
              
              <button
                class="toolbar-btn"
                :class="{ 'active': section.editor?.isActive({ textAlign: 'justify' }) }"
                @click="section.editor?.chain().focus().setTextAlign('justify').run()"
                title="Justificar"
              >
                <font-awesome-icon icon="align-justify" />
              </button>
            </div>
            
            <div class="toolbar-separator"></div>
            
            <!-- Grupo de listas -->
            <div class="toolbar-group">
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
            </div>
            
            <div class="toolbar-separator"></div>
            
            <!-- Grupo de herramientas -->
            <div class="toolbar-group">
              <button
                class="toolbar-btn"
                @click="section.editor?.chain().focus().undo().run()"
                title="Deshacer (Ctrl+Z)"
              >
                ↶
              </button>
              
              <button
                class="toolbar-btn"
                @click="section.editor?.chain().focus().redo().run()"
                title="Rehacer (Ctrl+Y)"
              >
                ↷
              </button>
              
              <button
                class="toolbar-btn"
                @click="clearSection(section)"
                title="Limpiar sección"
              >
                ×
              </button>
            </div>
            
            <div class="toolbar-separator"></div>
            
            <!-- Grupo de IA -->
            <div class="toolbar-group">
              <button
                class="toolbar-btn ia-btn"
                @click="showAIInput(section, 'improve')"
                title="Mejorar con IA"
                :disabled="!aiService.isAvailable || isAILoading"
              >
                <span>✨</span>
              </button>
              
              <button
                class="toolbar-btn ia-btn"
                @click="showAIInput(section, 'suggest')"
                title="Sugerir con IA"
                :disabled="!aiService.isAvailable || isAILoading"
              >
                <span>💡</span>
              </button>
              
              <button
                class="toolbar-btn ia-btn"
                @click="showAIInput(section, 'expand')"
                title="Expandir con IA"
                :disabled="!aiService.isAvailable || isAILoading"
              >
                <span>➕</span>
              </button>
            </div>
          </div>
          
          <editor-content 
            :editor="section.editor" 
            class="editor-content"
          />
        </div>
      </div>
      
      <div class="document-controls">
        <button @click="generateWordDocument" class="generate-btn" :disabled="isGenerating">
          <font-awesome-icon icon="file-word" class="feature-icon" />
          Generar Documento Word
        </button>
        <button @click="resetDocument" class="reset-btn">
          <font-awesome-icon icon="trash" class="feature-icon" />
          Limpiar Todo
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { generateWordDocument } from '@/utils/docGenerator'
import { aiService } from '@/services/aiService'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'

export default {
  name: 'DocumentView',
  components: {
    EditorContent
  },
  data() {
    return {
      showResetModal: false,
      showAIModal: false,
      headerConfig: {
        manualName: '',
        policyName: '',
        codigo: '',
        area: '',
        unidad: '',
        revision: '',
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
      isAnalyzing: false,
      isAILoading: false,
      procedimientoEditor: null,
      
      // IA Modal state
      aiModalTitle: '',
      aiPrompt: '',
      aiActionType: '',
      currentSectionForAI: null,
      currentTextForAI: '',
      currentAISection: null,
      
      // AI Service instance
      aiService: aiService
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
      // Configuración base para todos los editores
      const commonExtensionsBase = [
        StarterKit.configure({
          hardBreak: {
            keepMarks: true,
          },
          bulletList: {
            HTMLAttributes: {
              class: 'bullet-list',
            },
          },
          codeBlock: {
            HTMLAttributes: {
              class: 'code-block',
            },
          },
        }),
        Underline,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
          alignments: ['left', 'center', 'right', 'justify'],
          defaultAlignment: 'left',
        })
      ];

      // Función auxiliar para crear editores
      const createEditor = (placeholder) => {
        const extensions = [
          ...commonExtensionsBase,
          Placeholder.configure({
            placeholder: ({ node }) => {
              if (node.type.name === 'heading') {
                return 'Título...';
              }
              if (node.type.name === 'codeBlock') {
                return 'Escribe tu código aquí...';
              }
              if (node.type.name === 'blockquote') {
                return 'Escribe una cita...';
              }
              return placeholder || 'Escribe tu contenido aquí...';
            }
          })
        ];

        return new Editor({
          content: '',
          extensions: extensions,
          onUpdate: () => {
            // Manejar actualizaciones si es necesario
          },
          onCreate: () => {
            console.log('Editor inicializado con opciones completas de Word');
          },
          editorProps: {
            attributes: {
              class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
              style: 'min-height: 120px; white-space: pre-line;'
            },
            handleKeyDown: (view, event) => {
              // Atajos de teclado comunes
              
              // Ctrl+B - Negrita
              if (event.ctrlKey && event.key === 'b') {
                event.preventDefault();
                view.dispatch(view.state.tr.setMark(view.state.selection.from, view.state.selection.to, view.state.schema.marks.bold));
                return true;
              }
              
              // Ctrl+I - Cursiva
              if (event.ctrlKey && event.key === 'i') {
                event.preventDefault();
                view.dispatch(view.state.tr.setMark(view.state.selection.from, view.state.selection.to, view.state.schema.marks.italic));
                return true;
              }
              
              // Ctrl+U - Subrayado
              if (event.ctrlKey && event.key === 'u') {
                event.preventDefault();
                view.dispatch(view.state.tr.setMark(view.state.selection.from, view.state.selection.to, view.state.schema.marks.underline));
                return true;
              }
              
              // Ctrl+Shift+S - Tachado
              if (event.ctrlKey && event.shiftKey && event.key === 's') {
                event.preventDefault();
                view.dispatch(view.state.tr.setMark(view.state.selection.from, view.state.selection.to, view.state.schema.marks.strike));
                return true;
              }
              
              // Ctrl+Z - Deshacer
              if (event.ctrlKey && event.key === 'z') {
                event.preventDefault();
                view.dispatch(view.state.tr.undo());
                return true;
              }
              
              // Ctrl+Y - Rehacer
              if (event.ctrlKey && event.key === 'y') {
                event.preventDefault();
                view.dispatch(view.state.tr.redo());
                return true;
              }
              
              // Atajo Ctrl+Alt+1 para título 1
              if (event.ctrlKey && event.altKey && event.key === '1') {
                event.preventDefault();
                const currentLevel = view.state.selection.$from.parent.type.name === 'heading' 
                  ? view.state.selection.$from.parent.attrs.level 
                  : null;
                
                if (currentLevel === 1) {
                  view.dispatch(view.state.tr.setBlockType(view.state.selection.from, view.state.selection.to, view.state.schema.nodes.paragraph));
                } else {
                  view.dispatch(view.state.tr.setBlockType(view.state.selection.from, view.state.selection.to, view.state.schema.nodes.heading, { level: 1 }));
                }
                return true;
              }
              
              // Atajo Ctrl+Alt+2 para título 2
              if (event.ctrlKey && event.altKey && event.key === '2') {
                event.preventDefault();
                const currentLevel = view.state.selection.$from.parent.type.name === 'heading' 
                  ? view.state.selection.$from.parent.attrs.level 
                  : null;
                
                if (currentLevel === 2) {
                  view.dispatch(view.state.tr.setBlockType(view.state.selection.from, view.state.selection.to, view.state.schema.nodes.paragraph));
                } else {
                  view.dispatch(view.state.tr.setBlockType(view.state.selection.from, view.state.selection.to, view.state.schema.nodes.heading, { level: 2 }));
                }
                return true;
              }
              
              // Atajo Ctrl+Alt+3 para título 3
              if (event.ctrlKey && event.altKey && event.key === '3') {
                event.preventDefault();
                const currentLevel = view.state.selection.$from.parent.type.name === 'heading' 
                  ? view.state.selection.$from.parent.attrs.level 
                  : null;
                
                if (currentLevel === 3) {
                  view.dispatch(view.state.tr.setBlockType(view.state.selection.from, view.state.selection.to, view.state.schema.nodes.paragraph));
                } else {
                  view.dispatch(view.state.tr.setBlockType(view.state.selection.from, view.state.selection.to, view.state.schema.nodes.heading, { level: 3 }));
                }
                return true;
              }
              
              // Ctrl+Enter para salto de línea suave
              if (event.ctrlKey && event.key === 'Enter') {
                event.preventDefault();
                view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.hardBreak.create()).scrollIntoView());
                return true;
              }
              
              return false;
            }
          }
        });
      };

      // Inicializar secciones principales
      this.sections.forEach((section, index) => {
        const editor = createEditor(section.placeholder);
        editor.on('update', () => {
          this.sections[index].content = editor.getHTML();
        });
        section.editor = editor;
      });

      // Inicializar secciones restantes
      this.remainingSections.forEach((section, index) => {
        const editor = createEditor(section.placeholder);
        editor.on('update', () => {
          this.remainingSections[index].content = editor.getHTML();
        });
        section.editor = editor;
      });

      // Inicializar editor de procedimiento
      this.procedimientoEditor = createEditor('Describe el procedimiento completo aquí en lenguaje natural...');
      this.procedimientoEditor.on('update', () => {
        // Actualizar contenido del procedimiento si es necesario
      });
    },

    // Método para aplicar estilos desde el select
    applyStyle(editor, style) {
      if (!editor) return;
      
      switch(style) {
        case 'paragraph':
          editor.chain().focus().setParagraph().run();
          break;
        case 'h1':
          editor.chain().focus().toggleHeading({ level: 1 }).run();
          break;
        case 'h2':
          editor.chain().focus().toggleHeading({ level: 2 }).run();
          break;
        case 'h3':
          editor.chain().focus().toggleHeading({ level: 3 }).run();
          break;
        case 'blockquote':
          editor.chain().focus().toggleBlockquote().run();
          break;
        case 'code':
          editor.chain().focus().toggleCodeBlock().run();
          break;
      }
    },

    // Método para obtener el estilo actual del cursor
    getCurrentStyle(editor) {
      if (!editor) return 'paragraph';
      
      if (editor.isActive('heading', { level: 1 })) return 'h1';
      if (editor.isActive('heading', { level: 2 })) return 'h2';
      if (editor.isActive('heading', { level: 3 })) return 'h3';
      if (editor.isActive('blockquote')) return 'blockquote';
      if (editor.isActive('codeBlock')) return 'code';
      
      return 'paragraph';
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

    // Método central para togglear viñetas normales y limpiar el atributo 'letter' si existe
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

    parseProcedimiento() {
      if (!this.procedimientoEditor) return;
      
      const textContent = this.procedimientoEditor.getText();
      
      if (!textContent.trim()) {
        this.showStatus('❌ Por favor ingresa la descripción del procedimiento', 'error');
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
        this.showStatus('✅ Tabla generada automáticamente desde la descripción', 'success');
      } catch (error) {
        this.showStatus('❌ Error al procesar la descripción: ' + error.message, 'error');
      }
    },

    // Analiza el texto del procedimiento usando el servicio de IA
    async analyzeWithAI() {
      if (!this.procedimientoEditor) return;
      const textContent = this.procedimientoEditor.getText();
      if (!textContent.trim()) {
        this.showStatus('❌ Por favor ingresa la descripción del procedimiento', 'error');
        return;
      }

      this.isAnalyzing = true;
      try {
        const result = await this.aiService.analyzeProcedimiento(textContent);
        const pasos = result.pasos || [];
        const table = [];
        let counter = 1;

        for (const paso of pasos) {
          const tipo = (paso.tipo || 'normal').toLowerCase();
          const who = paso.responsable ? this.capitalizeFirstLetter(paso.responsable) : '';
          const activity = paso.actividad || '';

          if (tipo === 'normal') {
            table.push({ number: `${counter}`, who, activity, level: 'normal' });
            counter++;
          } else if (tipo === 'decision') {
            table.push({ number: '', who, activity: activity, level: 'question' });
          } else if (tipo === 'alternative') {
            table.push({ number: '', who, activity: activity, level: 'alternative' });
          } else if (tipo === 'fin') {
            table.push({ number: '', who, activity: activity || 'Fin del Proceso', level: 'end' });
          } else {
            table.push({ number: `${counter}`, who, activity, level: 'normal' });
            counter++;
          }

          if (Array.isArray(paso.subpasos) && paso.subpasos.length) {
            for (const sub of paso.subpasos) {
              table.push({ number: '', who: sub.responsable ? this.capitalizeFirstLetter(sub.responsable) : who, activity: sub.actividad || '', level: 'sub' });
            }
          }
        }

        this.generatedTable = table;
        this.showStatus('✅ Tabla generada desde el análisis de IA', 'success');
      } catch (error) {
        console.error('Error analizando con IA:', error);
        this.showStatus('❌ Error al analizar con IA: ' + (error.message || error), 'error');
      } finally {
        this.isAnalyzing = false;
      }
    },

    // Métodos de IA
    showAIInput(section, actionType) {
      if (!this.aiService.isAvailable) {
        this.showStatus('❌ Servicio de IA no disponible. Configura las variables de entorno.', 'error');
        return;
      }
      
      this.currentSectionForAI = section;
      this.aiActionType = actionType;
      this.aiPrompt = '';
      
      // Establecer título según acción
      const titles = {
        improve: 'Mejorar Texto con IA',
        suggest: 'Generar Sugerencias con IA',
        expand: 'Expandir Contenido con IA'
      };
      
      this.aiModalTitle = titles[actionType] || 'Asistente de IA';
      
      // Obtener texto actual
      if (typeof section === 'object' && section.editor) {
        this.currentTextForAI = section.editor.getText();
      } else if (section === 'procedimiento' && this.procedimientoEditor) {
        this.currentTextForAI = this.procedimientoEditor.getText();
      } else {
        this.currentTextForAI = '';
      }
      
      this.showAIModal = true;
    },
    
    closeAIModal() {
      if (this.isAILoading) return;
      
      this.showAIModal = false;
      this.aiPrompt = '';
      this.currentSectionForAI = null;
      this.aiActionType = '';
      this.currentAISection = null;
    },
    
    setExamplePrompt(text) {
      this.aiPrompt = text;
    },
    
    async executeAICommand() {
      if (!this.aiService.isAvailable || !this.aiPrompt.trim() || this.isAILoading) {
        return;
      }
      
      this.isAILoading = true;
      this.currentAISection = this.currentSectionForAI;
      
      try {
        let editor;
        if (typeof this.currentSectionForAI === 'object') {
          editor = this.currentSectionForAI.editor;
        } else if (this.currentSectionForAI === 'procedimiento') {
          editor = this.procedimientoEditor;
        }
        
        if (!editor) {
          throw new Error('Editor no encontrado');
        }
        
        const currentText = editor.getText();
        
        // Construir prompt según el tipo de acción
        let prompt = '';
        
        switch (this.aiActionType) {
          case 'improve':
            prompt = `Mejora el siguiente texto para que sea más claro, profesional y apropiado para un documento empresarial. 
                    Reglas: 
                    1. Mantén el significado original
                    2. Usa lenguaje formal pero claro
                    3. Corrige errores gramaticales
                    4. Mejora la estructura de las oraciones
                    5. Hazlo conciso pero completo
                    
                    Texto a mejorar: "${currentText}"
                    
                    Instrucción adicional: ${this.aiPrompt}`;
            break;
            
          case 'suggest':
            prompt = `Genera sugerencias para mejorar el siguiente texto de un documento empresarial.
                    Texto: "${currentText}"
                    
                    Instrucción: ${this.aiPrompt}
                    
                    Formato: Lista de sugerencias claras y específicas.`;
            break;
            
          case 'expand':
            prompt = `Expande el siguiente texto añadiendo más detalles, ejemplos o información relevante para un documento empresarial.
                    Texto original: "${currentText}"
                    
                    Instrucción: ${this.aiPrompt}
                    
                    Mantén el tono profesional y formal.`;
            break;
            
          default:
            prompt = `${this.aiPrompt}\n\nTexto actual: "${currentText}"`;
        }
        
        // Llamar al servicio de IA
        const result = await this.aiService.sendPrompt(prompt, {
          temperature: 0.4,
          max_tokens: 1500
        });
        
        // Aplicar resultado según acción
        if (this.aiActionType === 'improve' || this.aiActionType === 'expand') {
          // Convertir el texto plano a HTML básico
          const htmlContent = result.split('\n').map(line => `<p>${line}</p>`).join('');
          editor.commands.setContent(htmlContent);
          this.showStatus('✅ Texto mejorado con IA aplicado', 'success');
        } else if (this.aiActionType === 'suggest') {
          // Mostrar sugerencias en una alerta
          alert(`Sugerencias de IA:\n\n${result}`);
          this.showStatus('✅ Sugerencias generadas con IA', 'success');
        }
        
        this.closeAIModal();
        
      } catch (error) {
        console.error('Error ejecutando IA:', error);
        this.showStatus(`❌ Error en IA: ${error.message}`, 'error');
      } finally {
        this.isAILoading = false;
        this.currentAISection = null;
      }
    },
    
    async quickImproveWithAI(section) {
      if (!this.aiService.isAvailable) {
        this.showStatus('❌ IA no disponible', 'error');
        return;
      }
      
      let editor;
      let sectionName;
      
      if (typeof section === 'object') {
        editor = section.editor;
        sectionName = section.title;
      } else if (section === 'procedimiento') {
        editor = this.procedimientoEditor;
        sectionName = 'Procedimiento';
      }
      
      if (!editor) return;
      
      const text = editor.getText();
      if (!text.trim()) {
        this.showStatus(`❌ No hay texto en ${sectionName} para mejorar`, 'error');
        return;
      }
      
      this.isAILoading = true;
      this.currentAISection = section;
      
      try {
        const prompt = `Mejora este texto para un documento empresarial. Hazlo más claro, profesional y bien estructurado: "${text}"`;
        const improved = await this.aiService.sendPrompt(prompt, {
          temperature: 0.3,
          max_tokens: 1000
        });
        
        // Convertir a HTML
        const htmlContent = improved.split('\n').map(line => `<p>${line}</p>`).join('');
        editor.commands.setContent(htmlContent);
        this.showStatus(`✅ ${sectionName} mejorado con IA`, 'success');
        
      } catch (error) {
        console.error('Error en mejora rápida:', error);
        this.showStatus('❌ Error al mejorar con IA', 'error');
      } finally {
        this.isAILoading = false;
        this.currentAISection = null;
      }
    },
    
    async generateWithAI(section) {
      if (!this.aiService.isAvailable) {
        this.showStatus('❌ IA no disponible', 'error');
        return;
      }
      
      if (!section.editor) return;
      
      this.isAILoading = true;
      this.currentAISection = section;
      
      try {
        const currentText = section.editor.getText();
        const prompt = `Genera contenido profesional para la sección "${section.title}" de un documento de procedimientos empresariales.
        Contexto actual: ${currentText || 'Ninguno'}
        
        El contenido debe ser:
        1. Profesional y formal
        2. Estructurado y claro
        3. Apropiado para un manual de procedimientos
        4. Incluye todos los elementos necesarios`;
        
        const content = await this.aiService.sendPrompt(prompt, {
          temperature: 0.5,
          max_tokens: 800
        });
        
        // Convertir a HTML
        const htmlContent = content.split('\n').map(line => `<p>${line}</p>`).join('');
        section.editor.commands.setContent(htmlContent);
        this.showStatus(`✅ Contenido generado para ${section.title}`, 'success');
        
      } catch (error) {
        console.error('Error generando con IA:', error);
        this.showStatus('❌ Error al generar con IA', 'error');
      } finally {
        this.isAILoading = false;
        this.currentAISection = null;
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
      
      // Si hay texto en el procedimiento pero no se ha generado la tabla, generarla
      if (procedimientoText && this.generatedTable.length === 0) {
        this.parseProcedimiento();
      }

      const documentData = {
        headerConfig: this.headerConfig,
        objetivo: this.sections[0].editor.getHTML(),
        alcance: this.sections[1].editor.getHTML(),
        responsabilidades: this.sections[2].editor.getHTML(),
        normativa: this.sections[3].editor.getHTML(),
        anexos: this.remainingSections[0].editor.getHTML(),
        terminos: this.remainingSections[1].editor.getHTML()
      };

      try {
        await generateWordDocument(documentData, this.generatedTable);
        this.showStatus('✅ Documento Word generado exitosamente!', 'success');
      } catch (error) {
        console.error('Error generating document:', error);
        this.showStatus('❌ Error al generar el documento: ' + error.message, 'error');
      } finally {
        this.isGenerating = false;
      }
    },

    resetDocument() {
      this.showResetModal = true;
    },

    closeResetModal() {
      this.showResetModal = false;
    },

    confirmReset() {
      this.showResetModal = false;
      this.executeReset();
      this.showStatus('🗑️ Todo el contenido ha sido resetado', 'info');
    },

    executeReset() {
      // Limpiar secciones de contenido
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
      
      // Limpiar configuración del encabezado
      this.headerConfig = {
        manualName: '',
        policyName: '',
        codigo: '',
        area: '',
        unidad: '',
        revision: '',
        fecha: this.getFormattedDate()
      };
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
/* Estilos para el modal mejorado */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 450px;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
  border: 1px solid #e1e8ed;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #fff9e6 0%, #ffeaa7 100%);
  border-bottom: 1px solid #fdcb6e;
}

.modal-title {
  margin: 0;
  color: #e67e22;
  font-size: 1.3rem;
  font-weight: 700;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #95a5a6;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background: #f8f9fa;
  color: #e74c3c;
}

.modal-content {
  padding: 24px;
  text-align: center;
}

.modal-message {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.modal-warning {
  font-size: 0.95rem;
  color: #e74c3c;
  margin: 0;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px;
  justify-content: center;
}

.modal-btn {
  flex: 1;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
}

.modal-btn-cancel {
  background-color: #ecf0f1;
  color: #2c3e50;
  border: 2px solid #bdc3c7;
}

.modal-btn-cancel:hover {
  background-color: #d5dbdb;
  border-color: #95a5a6;
  transform: translateY(-1px);
}

.modal-btn-confirm {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  border: 2px solid #c0392b;
}

.modal-btn-confirm:hover {
  background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

/* Estilos para IA */
.ai-indicator {
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 12px;
  margin-left: 10px;
  font-weight: 500;
}

.ai-indicator.available {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.ai-indicator.unavailable {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.section-actions {
  display: flex;
  gap: 8px;
}

.section-ai-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.section-ai-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  transform: translateY(-1px);
}

.section-ai-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #6c757d;
}

.ia-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #5a67d8;
}

.ia-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  transform: translateY(-1px);
}

.ia-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #6c757d;
}

/* Modal de IA */
.ai-modal {
  max-width: 700px;
}

.ai-status {
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-weight: 500;
  text-align: center;
}

.ai-status.available {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.ai-status.unavailable {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.ai-prompt-section {
  margin-bottom: 20px;
  text-align: left;
}

.ai-prompt-section label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.ai-prompt-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  margin-bottom: 8px;
}

.ai-prompt-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.ai-prompt-input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.ai-examples {
  color: #6c757d;
  font-size: 0.85rem;
}

.example-link {
  color: #3498db;
  cursor: pointer;
  text-decoration: underline;
  margin: 0 4px;
}

.example-link:hover {
  color: #2980b9;
}

.ai-preview {
  text-align: left;
  margin-top: 20px;
}

.ai-preview h4 {
  margin-bottom: 10px;
  color: #2c3e50;
  font-size: 1rem;
}

.current-text-preview {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  max-height: 150px;
  overflow-y: auto;
  font-size: 0.9rem;
  color: #495057;
}

.current-text-preview pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
}

.ai-execute-btn {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%) !important;
  border-color: #2980b9 !important;
}

.ai-execute-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2980b9 0%, #1f6398 100%) !important;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3) !important;
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Estilos existentes del documento */
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
  background-color: #2c5aa0; 
  color: white;
}

.generate-btn:hover:not(:disabled) {
  background-color: #15386c; 
  transform: translateY(-2px);
}

.reset-btn {
  background-color: red;
  color: white;
}

.reset-btn:hover {
  background-color: rgb(181, 20, 20);
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
  margin: 0;
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

.header-input::placeholder {
  color: #6c757d;
  opacity: 0.7;
  font-style: italic;
}

.header-input:focus::placeholder {
  opacity: 0.5;
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

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
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

/* Select de estilos */
.style-select {
  padding: 4px 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 11px;
  background: white;
  color: #495057;
  min-width: 120px;
  height: 28px;
  cursor: pointer;
  outline: none;
}

.style-select:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 1px rgba(52, 152, 219, 0.2);
}

.style-select option {
  padding: 4px;
}

/* Iconos especiales */
.icon-text {
  font-size: 14px;
  font-weight: bold;
}

.icon-align {
  font-size: 14px;
  font-weight: bold;
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

/* Estilos para títulos en el editor */
:deep(.ProseMirror h1) {
  font-size: 1.5rem !important;
  font-weight: 700 !important;
  color: #1F4E79 !important;
  margin: 1.5rem 0 1rem 0 !important;
  line-height: 1.2 !important;
  border-bottom: 2px solid #1F4E79 !important;
  padding-bottom: 0.5rem !important;
  font-family: 'Times New Roman', serif !important;
}

:deep(.ProseMirror h2) {
  font-size: 1.3rem !important;
  font-weight: 600 !important;
  color: #2C3E50 !important;
  margin: 1.3rem 0 0.8rem 0 !important;
  line-height: 1.3 !important;
  border-bottom: 1px solid #D4D4D4 !important;
  padding-bottom: 0.4rem !important;
  font-family: 'Times New Roman', serif !important;
}

:deep(.ProseMirror h3) {
  font-size: 1.1rem !important;
  font-weight: 600 !important;
  color: #34495E !important;
  margin: 1rem 0 0.5rem 0 !important;
  line-height: 1.4 !important;
  font-family: 'Times New Roman', serif !important;
}

/* Estilos para citas */
:deep(.ProseMirror blockquote) {
  border-left: 4px solid #3498db !important;
  padding-left: 1rem !important;
  margin: 1rem 0 !important;
  font-style: italic !important;
  color: #495057 !important;
  background: #f8f9fa !important;
  padding: 0.75rem 1rem !important;
  border-radius: 4px !important;
}

/* Estilos para código */
:deep(.ProseMirror pre) {
  background: #2c3e50 !important;
  color: #ecf0f1 !important;
  padding: 0.75rem 1rem !important;
  border-radius: 4px !important;
  font-family: 'Consolas', 'Monaco', monospace !important;
  font-size: 0.9rem !important;
  margin: 1rem 0 !important;
  overflow-x: auto !important;
}

:deep(.ProseMirror code) {
  background: #f8f9fa !important;
  color: #e74c3c !important;
  padding: 0.2rem 0.4rem !important;
  border-radius: 3px !important;
  font-family: 'Consolas', 'Monaco', monospace !important;
  font-size: 0.9rem !important;
}

/* Estilos para alineación de texto */
:deep(.ProseMirror .text-align-left) {
  text-align: left !important;
}

:deep(.ProseMirror .text-align-center) {
  text-align: center !important;
}

:deep(.ProseMirror .text-align-right) {
  text-align: right !important;
}

:deep(.ProseMirror .text-align-justify) {
  text-align: justify !important;
  text-justify: inter-word !important;
}

/* Estilos para texto tachado */
:deep(.ProseMirror s) {
  text-decoration: line-through !important;
  color: #95a5a6 !important;
}

:deep(.ProseMirror h1:first-child),
:deep(.ProseMirror h2:first-child),
:deep(.ProseMirror h3:first-child) {
  margin-top: 0;
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
  
  .style-select {
    min-width: 100px;
    font-size: 10px;
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
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .section-actions {
    width: 100%;
    justify-content: flex-start;
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
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .toolbar-group {
    flex-wrap: wrap;
  }

  .toolbar-btn {
    padding: 4px 6px;
    font-size: 11px;
    min-width: 24px;
    height: 24px;
  }
  
  .style-select {
    min-width: 80px;
    font-size: 9px;
    height: 24px;
    padding: 2px 4px;
  }

  /* Modal responsive */
  .modal-container {
    width: 95%;
    margin: 20px;
  }
  
  .modal-header {
    padding: 16px 20px;
  }
  
  .modal-content {
    padding: 20px;
  }
  
  .modal-actions {
    flex-direction: column;
    padding: 0 20px 20px;
  }
  
  .modal-btn {
    width: 100%;
  }
  
  .modal-title {
    font-size: 1.2rem;
  }
  
  .modal-message {
    font-size: 1rem;
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
  
  .style-select {
    min-width: 70px;
    font-size: 8px;
  }
}
</style>