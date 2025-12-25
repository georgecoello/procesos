import { createApp } from 'vue'
import App from './App.vue'
import { FontAwesomeIcon } from './plugins/fontawesome'

import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')
app.component('font-awesome-icon', FontAwesomeIcon)