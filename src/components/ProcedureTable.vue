<template>
  <div class="procedure-table">
    <div class="table-header">
      <h3>Procedimiento</h3>
      <button @click="addRow" class="add-row-btn">Agregar Fila</button>
    </div>
    
    <div class="table-container">
      <table class="procedure-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Quién</th>
            <th>Actividad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in rows" :key="index">
            <td>
              <input 
                v-model="row.number" 
                type="text" 
                class="table-input"
                placeholder="Ej: 5.7"
              >
            </td>
            <td>
              <input 
                v-model="row.who" 
                type="text" 
                class="table-input"
                placeholder="Ej: Administrador(a)"
              >
            </td>
            <td>
              <textarea 
                v-model="row.activity" 
                class="table-textarea"
                placeholder="Describe la actividad..."
              ></textarea>
            </td>
            <td>
              <button @click="removeRow(index)" class="remove-btn">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProcedureTable',
  data() {
    return {
      rows: [
        { number: '', who: '', activity: '' }
      ]
    }
  },
  methods: {
    addRow() {
      this.rows.push({ number: '', who: '', activity: '' });
    },
    removeRow(index) {
      if (this.rows.length > 1) {
        this.rows.splice(index, 1);
      }
    },
    getTableData() {
      return this.rows;
    },
    setTableData(data) {
      this.rows = data || [{ number: '', who: '', activity: '' }];
    }
  }
}
</script>

<style scoped>
.procedure-table {
  margin-bottom: 30px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.add-row-btn {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
}

th, td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
}

.table-input {
  width: 100%;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 3px;
}

.table-textarea {
  width: 100%;
  min-height: 60px;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 3px;
  resize: vertical;
  font-family: inherit;
}

.remove-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
}

.remove-btn:hover {
  background-color: #c0392b;
}
</style>