<template>
  <div class="home-view">
    <div class="welcome-section">
      <h2>Bienvenido al Sistema de Gestión de Procesos</h2>
      <p>Esta aplicación te permite crear y personalizar documentos y procedimientos.</p>
      
      <div class="features">
        <div class="feature-card">
          <h3>
            <font-awesome-icon icon="pen-to-square" class="feature-icon" />
            Documentos Editables
          </h3>
          <p>Todas las secciones del documento son completamente editables</p>
        </div>
        <div class="feature-card">
          <h3>
            <font-awesome-icon icon="file-word" class="feature-icon" />
            Exportar a Word
          </h3>
          <p>Genera archivos Word listos para usar</p>
        </div>
      </div>
      
      <router-link to="/document" class="cta-button">
        <font-awesome-icon icon="right-to-bracket" class="button-icon" />
        Comenzar a Crear Documento
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.home-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

.welcome-section {
  text-align: center;
}

.welcome-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.welcome-section p {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
}

.feature-card {
  background: white;
  padding: 30px 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.feature-card h3 {
  color: #3498db;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.feature-icon {
  color: #2c5aa0; 
  font-size: 1.4rem;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background-color: #2c5aa0; 
  color: white;
  padding: 15px 30px;
  text-decoration: none;
  border-radius: 5px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.cta-button:hover {
  background-color: #1e3d72;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(44, 90, 160, 0.3);
}

.button-icon {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .home-view {
    padding: 20px 15px;
  }
  
  .features {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .feature-card h3 {
    flex-direction: column;
    gap: 8px;
  }
}
</style>