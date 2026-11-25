import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import AppComponent from './AppComponent.vue'

createApp(App).mount('#app-core')
createApp(AppComponent).mount('#app-component')
