import axios from 'axios'           //导入axios框架
import NProgress from 'nprogress'   //导入加载进度条组件
import 'nprogress/nprogress.css'    //导入进度条组件样式

  //1.创建axios的实例
  const instance = axios.create({
    baseURL: 'http://www.ysqorz.top:8888/api/private/v1',
    timeout: 5000
  })

  //2.拦截器 (config是需要传入的参数)
  //请求拦截器: 为请求头对象添加token验证的Authorization字段保证拥有获取数据的权限;
  instance.interceptors.request.use(config => {
    config.headers.Authorization = window.sessionStorage.getItem('token');
    NProgress.start();    //显示加载进度条效果
    return config
  }, err => {
    console.log(err);
  })
  //响应拦截器
  instance.interceptors.response.use(result => {
    NProgress.done();     //隐藏加载进度条效果
    return result;
  }, err => {
    console.log(err.message);
  })

  //3.导出axios请求实例到main.js中
  export default instance
