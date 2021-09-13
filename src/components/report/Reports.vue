<template>
  <div id="reports">
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 为ECharts准备具备大小(宽高)的Dom ② -->
      <div id="main" style="width: 800px; height:500px;"></div>
    </el-card>
  </div>
</template>

<script>
var _ = require('lodash');           //导入Lodash完整的构建
import * as echarts from 'echarts'   //导入ECharts中所有的图表和组件 ①
export default {
  name: 'Reports',
  data() {
    return {
      //本地的options图表配置信息
      options: {
        title: {text: '用户来源'},
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {backgroundColor: '#E9EEF3'}
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [{boundaryGap: false}],
        yAxis: [{type: 'value'}]
      }
    }
  },
  //【async与await用来简化Promise对象】
  async mounted() {
    //基于准备好的Dom(页面元素渲染完成)初始化ECharts实例 ③
    var myChart = echarts.init(document.getElementById('main'));

    //向服务器请求图表数据与配置项 ④
    //*************解构赋值出服务器响应的data*************
    const {data} = await this.$http.get(`reports/type/1`);
    if(data.meta.status !== 200){
      return this.$message.error(data.meta.msg);
    }
    //使用lodash的merge方法合并本地与服务器的配置项
    const result = _.merge(data.data,this.options)   
    //*************【此时怎么获取到 res ??】*************
    /*this.$http.get('/reports/type/1').then(res=>{
      if(res.data.meta.status !== 200){
        return this.$message.error(res.data.meta.msg)
      }else{
        console.log(res.data.data)
      }
    })*/

    //展示数据 ⑤
    myChart.setOption(result);
  }
}
</script>

<style lang="less" scoped>
</style>