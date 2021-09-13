<template>
  <div id="right">
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 权限列表区域 -->
    <el-card>
      <el-table :data="rightForm" border stripe>
        <el-table-column label="序号" width="50px" type="index"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'" >一级</el-tag>
            <el-tag v-if="scope.row.level === '1'" type="success">二级</el-tag>
            <el-tag v-if="scope.row.level === '2'" type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script>
export default {
  name: 'Right',
  data() {
    return {
      rightForm:[],  //保存获取到的所有权限列表: 服务器响应参数: id/authName/level/pid/path
    }
  },
  created() {
    this.getRightList();
  },
  methods: {
    //向服务器请求权限列表数据
    //Get请求: 路径:/rights/:list(tree)
    getRightList(){
      this.$http.get('/rights/list').then(res=>{
        if(res.data.meta.status !== 200){
          return this.$message.error(res.data.meta.msg)
        }
        else{
          this.rightForm = res.data.data; //保存请求的权限列表数据
        }
      }) 
    }
  }
}
</script>

<style lang="less" scoped>
</style>