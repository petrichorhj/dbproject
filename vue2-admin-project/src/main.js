import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import router from './router' // 新增
import Loading from '@/components/Loading'
import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'

// 1. 引入 particles.js
import particles from 'particles.js'
// 2. 全局挂载到 window，所有组件都能访问
window.particlesJS = particles
Vue.use(ElementUI)
Vue.use(mavonEditor)
Vue.component('Loading', Loading)
Vue.config.productionTip = false

new Vue({
    router, // 新增
    render: h => h(App)
}).$mount('#app')