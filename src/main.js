import Vue from 'vue'
import App from './App.vue'
import router from './router'
import elementUI from 'element-ui'
import './assets/fonts/iconfont.css'
import './assets/css/global.css'
import axios from 'axios'
import ZkTable from 'vue-table-with-tree-grid'

Vue.use(elementUI)
Vue.use(ZkTable)

// 配置请求的跟路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(conifg => {
  conifg.headers.Authorization = window.sessionStorage.getItem('token')
  return conifg
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
