<template>
  <div class="document-section">
    <div class="section-header">
      <h3>{{ title }}</h3>
      <button @click="toggleEdit" class="edit-btn">
        {{ isEditing ? 'Guardar' : 'Editar' }}
      </button>
    </div>
    
    <div class="section-content">
      <template v-if="isEditing">
        <textarea 
          v-model="localContent" 
          class="edit-textarea"
          :placeholder="`Escribe el contenido para ${title}...`"
        ></textarea>
      </template>
      <template v-else>
        <div class="content-display" v-html="formattedContent"></div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DocumentSection',
  props: {
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isEditing: false,
      localContent: this.content
    }
  },
  computed: {
    formattedContent() {
      return this.localContent || `<em>No hay contenido para ${this.title}. Haz clic en Editar para agregar información.</em>`;
    }
  },
  methods: {
    toggleEdit() {
      if (this.isEditing) {
        this.$emit('update:content', this.localContent);
      }
      this.isEditing = !this.isEditing;
    }
  },
  watch: {
    content(newVal) {
      this.localContent = newVal;
    }
  }
}
</script>

<style scoped>
.document-section {
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
}

.section-header {
  background-color: #3498db;
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.edit-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 5px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.edit-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.section-content {
  padding: 20px;
}

.edit-textarea {
  width: 100%;
  min-height: 150px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
}

.content-display {
  line-height: 1.6;
  white-space: pre-wrap;
}
</style>