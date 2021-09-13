import Vue from 'vue'
import VueRouter from 'vue-router'
//页面视图
import Login from 'views/login/Login'
import Home from 'views/home/Home'
import Welcome from 'views/home/childComs/Welcome'
//Home页面子组件
import Users from 'components/user/Users'
import Roles from 'components/power/Roles'
import Rights from 'components/power/Rights'
import Goods from 'components/good/goods/Goods'
import Params from 'components/good/Params'
import Categories from 'components/good/Categories'
import Orders from 'components/order/Orders'
import Reports from 'components/report/Reports'
Vue.use(VueRouter)

//1.声明router实例
const router = new VueRouter({
  mode: 'history',
  routes : [
    { path: '/', redirect: '/login'},   //路由重定向
    { path: '/login', component: Login},
    { 
      path: '/home', 
      component: Home,
      children:[
        { path: '/', redirect: '/welcome'},
        { path: '/welcome', component: Welcome},
        { path: '/users', component: Users},
        { path: '/roles', component: Roles},
        { path: '/rights', component: Rights},
        { path: '/goods', component: Goods},
        { path: '/params', component: Params},
        { path: '/categories', component: Categories},
        { path: '/orders', component: Orders},
        { path: '/reports', component: Reports},
      ]
    },
  ]
})
//2.挂载路由导航守卫
/*******************************
 * to:代表即将访问的路径;   
 * from:代表从那个路径跳转而来;
 * next: 回调函数
   -next() 直接放行  
   -next('/login') 强制跳转到路由
********************************/
router.beforeEach((to,from,next)=>{
  if(to.path == '/login') next()
  else{
    if(window.sessionStorage.getItem('token')) next()
    else next('/login')
  }
})

//3.导出router实例
export default router
