import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import store from './store/index'
import axios from 'axios'
import './assets/css/global.css'                //引入全局样式
import ElementUI from 'element-ui';             //完整引入ElementUI库
import 'element-ui/lib/theme-chalk/index.css';  //完整引入ElementUI样式
import ZkTable from 'vue-table-with-tree-grid'  //导入树形列表结构组件

import VueQuillEditor from 'vue-quill-editor'   //导入文本编辑器组件
import 'quill/dist/quill.core.css'              //导入文本编辑器的样式
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.use(ElementUI);     //使用ElementUI库
Vue.use(ZkTable)        //使用ZkTable组件
Vue.use(VueQuillEditor) //使用文本编辑器组件
Vue.config.productionTip = false
//***********************************************************************
//1.配置请求的根路径
axios.defaults.baseURL = 'http://www.ysqorz.top:8888/api/private/v1'

//2.给axios设置拦截器
//请求拦截器:为请求头对象添加token验证的Authorization字段保证拥有获取数据的权限;
axios.interceptors.request.use(config=>{
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config;
})
axios.interceptors.response.use(result=>{
  return result;
})
//3.将axios请求挂载到Vue原型上
Vue.prototype.$http = axios
//**********************************************************************     
//声明vue实例
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
