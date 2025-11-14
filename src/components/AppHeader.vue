<template>
  <header class="app-header">
    <div class="header-content">
        <div class="logo-section">
          <h1>{{ title }}</h1>
          <p v-if="subtitle">{{ subtitle }}</p>
        </div>
      <nav class="navigation">
        <router-link to="/" class="nav-link">Inicio</router-link>
        <router-link to="/document" class="nav-link">Generar Proceso</router-link>
      </nav>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  props: {
    title: {
      type: String,
      default: 'Sistema de Gestión de Procesos'
    },
    subtitle: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.logo-section h1 {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  margin-bottom: 5px;
}

.logo-section p {
  font-size: 0.9rem;
  margin: 0;
  opacity: 0.9;
}

.navigation {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .logo-section h1 {
    font-size: 1.5rem;
  }
}
</style>