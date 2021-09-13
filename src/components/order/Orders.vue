<template>
  <div id="orders">
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
    <!-- 查询添加区域: 【当前查询功能无效 ?】 -->
      <el-row :gutter="10">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList()">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList()"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="orderList" border stripe>
        <el-table-column label="序号" width="50px" type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" width='150px' prop="order_price"></el-table-column>
        <el-table-column label="是否付款" width='150px'>
          <template slot-scope="scope">
            <el-tag type="success" v-show="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-show="scope.row.pay_status === '0'">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" width='150px' prop="is_send"></el-table-column>
        <el-table-column label="下单时间" width='250px'>
          <template slot-scope="scope">
            {{scope.row.create_time | showDate}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width='150px'>
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" circle size="small" @click="editOrderBtn(scope.row.order_id)"></el-button>
            <el-button type="success" icon="el-icon-location" circle size="small" @click="logisticBtn()"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页提示区域: size-change与current-change事件会传递默认的参数 ?-->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page= "queryInfo.pagenum"
                     :page-sizes="[1,5,10,20]"
                     :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>
      <!-- 修改订单地址信息弹出的对话框 -->
      <el-dialog title="修改订单地址信息" :visible.sync="editVisible" width="40%" @close="editClosed()">
        <el-form :model="addressForm" :rules="Rules" ref="editFormRef" label-width="100px">
          <el-form-item label="省市区/县 : " prop="city">
          <!-- 级联选择器: 悬停触发 -->
            <el-cascader :options="CityData" 
                         v-model="addressForm.city"
                         expandTrigger='hover'
                         clearable>
            </el-cascader>
          </el-form-item>
          <el-form-item label="详细地址 : " prop="address">
            <el-input v-model="addressForm.address" placeholder="请输入详细地址"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="editVisible=false">取消</el-button>
          <el-button type="primary" @click="sureEditBtn()">确定</el-button>
        </span>
      </el-dialog>
      <!-- 查询物流信息对话框: logistic(物流) -->
      <el-dialog title="查询物流信息" :visible.sync="logisticVisible" width="40%" @close="logisticClosed()">
        <!-- 时间线: 【此处选择从本地导入物流信息进行展示】-->
        <el-timeline>
          <el-timeline-item v-for="(item,index) in Logistic" :key="index" :timestamp="item.time">
            {{item.context}}
          </el-timeline-item>
        </el-timeline>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import {formatDate} from 'common/utils'   //导入日期格式化文件
import CityData from 'common/citydata'    //导入城市数据文件
import Logistic from 'common/logistic'    //导入物流信息文件

export default {
  name: 'Orders',
  data() {
    return {
      //get请求的参数: 查询关键字/当前页码/每页显示的条数
      queryInfo: {query: '', pagenum: 1, pagesize: 10},
      orderList: [],        //保存订单列表信息: 服务器响应参数: user_id/order_number/order_price/pay_status...
      total: 0,             //保存列表信息的总条数值
      editVisible: false,   //设置修改订单地址对话框是否显示
      CityData,             //导入文件中的地区数据对象
      addressForm:{city:[], address:''},  //保存正在修改的订单地址(双向绑定)
      Rules:{               //修改订单地址的规则 
          city: [{required: true, trigger: 'blur'}],
          address: [{required: true, message: '请输入详细地址', trigger: 'blur'}]
      },
      logisticVisible: false,  //设置查询物流信息对话框是否显示
      logisticInfo:'',         //保存当前查询到的物流信息
      Logistic,                //导入文件中的物流信息数据对象
    }
  },
  //在Home/Order页面创建立即获取订单列表数据进行显示
  created() {
    this.getOrderList();
  },
  //过滤器: 订单创建事件格式化
  filters: {
    showDate: function (value) {
      let date = new Date(value * 1000);
      return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
    }
  },
  methods: {
    //*************************显示页面基本信息*************************/
    //向服务器请求用户列表数据 
    //Get请求: 路径:/orders  请求参数:query/pagenum/pagesize
    getOrderList(){
      this.$http.get('/orders',{params: this.queryInfo}).then(res=>{
        if(res.data.meta.status !== 200){
          return this.$message.error(res.data.meta.msg)
        }else{
          this.orderList = res.data.data.goods;  //保存请求的订单列表数据
          this.total = res.data.data.total;      //保存请求的订单列表数据
        }
      }) 
    },
    //监听pagesize改变: 重新向服务器请求数据
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    //监听页码值改变: 重新向服务器请求当前页码的数据
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getOrderList();
    },

    //*************************修改订单地址信息*************************/
    //监听修改订单地址按钮: 通过id查询订单原有信息 + 显示修改订单信息对话框
    //Put请求: 路径:/orders/:id
    editOrderBtn(orderId){
      this.editVisible = true;
    },
    //监听关闭修改订单地址对话框事件: 重置对话框表单
    editClosed(){
      this.$refs.editFormRef.resetFields()
    },
    //监听修改订单地址的确定按钮: 预校验成功发送网络请求同步到服务器(真正修改)  【当前没有实现真正修改】
    sureEditBtn(){
      console.log('确定修改订单地址')
    },
    
    //*************************查询物流进度信息*************************/   【当前物流单号不可用: 无数据】
    //监听查询物流信息按钮: 通过运单号查询物流信息 + 显示查询物流信息对话框
    //Get请求: 路径:/kuaidi/:id (供测试的物流单号替换id的位置)   
    logisticBtn(){
      this.logisticVisible = true;
      /*this.$http.get('/kuaidi/1106975712662').then(res=>{
        console.log(res.data.data)
        if(res.data.meta.status !== 200){
          return this.$message.error(res.data.meta.msg)
        }else{
          this.logisticInfo = res.data.data;  //保存查询的物流信息数据
          this.logisticVisible = true;        //显示查询物流对话框
        }
      })*/ 
    },
    //监听关闭查询物流信息对话框事件: 清空查询的物流信息
    logisticClosed(){
      this.logisticInfo = '';
    }
  }
}
</script>

<style lang="less" scoped></style>