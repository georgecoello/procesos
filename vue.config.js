const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  
  // Solo la configuración esencial para evitar errores
  configureWebpack: {
    devServer: {
      // Configuración básica sin watchOptions problemático
    }
  },
  
  chainWebpack: config => {
    // Solo el plugin para ignorar archivos temporales
    config.plugin('watch-ignore')
      .use(require('webpack').WatchIgnorePlugin, [{ 
        paths: [
          /~WRD.*\.tmp$/,
          /\~\$.*/,
          /\.tmp$/,
          /~.*/
        ]
      }]);
  }
})