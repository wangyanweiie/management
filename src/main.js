import Vue from 'vue'
import App from './App.vue'
import router from './router/index'             //导入vue-router
import store from './store/index'               //导入vuex的实例
import request from 'network/request'           //导入axios请求实例
import './assets/css/global.css'                //引入全局样式
import ElementUI from 'element-ui';             //完整引入ElementUI库
import 'element-ui/lib/theme-chalk/index.css';  //完整引入ElementUI样式
import ZkTable from 'vue-table-with-tree-grid'  //导入树形列表结构组件

import VueQuillEditor from 'vue-quill-editor'   //导入文本编辑器组件
import 'quill/dist/quill.core.css'              //导入文本编辑器的样式
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.use(ElementUI);               //使用ElementUI库
Vue.use(ZkTable)                  //使用ZkTable组件
Vue.use(VueQuillEditor)           //使用文本编辑器组件
Vue.prototype.$http = request     //axios实例挂载到Vue原型上
Vue.config.productionTip = false  //阻止启动生产消息提示

//声明vue实例
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
