<template>
  <el-container id="home">
    <!-- 顶部区域 -->
    <el-header>
      <div class="title">
        <img src="~assets/img/heima.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="danger" @click="quitBtn()">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 左侧侧边栏 -->
      <el-aside  :width="isCollapse ? '64px' : '200px'" >
      <div class="toggleButton" @click="toggleCollapse()">|||</div>  
        <el-menu  background-color="#333744"
                  text-color="#fff"
                  active-text-color="#409eff"
                  unique-opened
                  :collapse="isCollapse"
                  :collapse-transition='false'
                  router
                  :default-active='$route.path'>  <!--点前活跃的路由路径高亮-->
          <!-- 一级菜单:index="" 唯一的index保证可以单独展开,但是只接收字符串 -->
          <el-submenu :index="item.id+''" v-for="item in menusList" :key="item.id">
            <template slot="title">
              <i :class="iconList[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/'+i.path" v-for="i in item.children" :key="i.id">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{i.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      menusList:[],   //保存左侧菜单列表数据
      iconList:{      //菜单列表id对应的的icon图标
        '125': 'el-icon-user-solid',
        '103': 'el-icon-s-cooperation',
        '101': 'el-icon-s-goods',
        '102': 'el-icon-s-order',
        '145': 'el-icon-s-marketing'
      },
      isCollapse: false,  //设置左侧菜单列表是否折叠
    }
  },
  //当页面创建立即就调用请求方法
  created(){
    this.getMenusList();
  },
  methods: {
    //退出原理:清空token+路由跳转
    quitBtn() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    //向服务器请求左侧菜单列表
    getMenusList(){
      this.$http.get('/menus').then(res=>{
        if(res.data.meta.status !== 200){
          return this.$message.error(res.meta.msg)
        }
        else this.menusList = res.data.data;
      }) 
    },
    //左侧菜单的折叠与展开
    toggleCollapse(){
      this.isCollapse = ! this.isCollapse
    }
  }
}
</script>

<style lang="less" scoped>
  #home{
    height: 100%;
    width: 100%;
  }
  //头部样式
 .el-header{
    background-color: #373c49;
    color: #fff;
    box-sizing: content-box;
    padding: 10px;
    display: flex;        //开启Flex布局
    align-items: center;  //上下居中
    justify-content: space-between;  //左右贴边布局
  }
  .el-header .title{
    display: flex;
    align-items: center;
    font-size: 20px;
  }
  .el-header .title>span{
    margin-left: 15px;
  }
  //左侧边栏样式
  .el-aside {
    background-color: #333744;
    color: #fff;
  }
  .el-aside .toggleButton{
    color: fff;
    background-color: #484d5e;
    font-size: 10px;
    text-align: center;
    line-height: 24px;
    cursor: pointer;
  }
  .el-aside .el-menu {
    border-right: 0;
  }
  //右侧内容样式
  .el-main {
    background-color: #eaedf1;
    color: #333;
  }

</style>
