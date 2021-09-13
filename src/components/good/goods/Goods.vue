<template>
  <div id="goods">
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 查询添加区域 -->
      <el-row :gutter="10">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList()">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4"><el-button type="primary" @click="addGoodsBtn()">添加商品</el-button></el-col>
      </el-row>
      <!-- 商品列表区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column label="序号" width="50px" type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" width='110px' prop="goods_price"></el-table-column>
        <el-table-column label="商品重量" width='110px' prop="goods_weight"></el-table-column>
        <el-table-column label="创建时间" width="200px">
          <template slot-scope="scope">
            {{scope.row.add_time | showDate}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width='110px'>
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" circle size="small" @click="editGoodsBtn(scope.row.goods_id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" circle size="small" @click="deletGoodsWarn(scope.row.goods_id)"></el-button>
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
      <!-- 添加商品弹出的对话框 (子组件) -->
      <add-goods ref="addGoods" @refreshGoods="refreshGoods()"></add-goods>
      <!-- 修改商品信息弹出的对话框: 验证规则复用 -->
      <el-dialog title="修改用户信息" :visible.sync="editVisible" width="40%" @close="editClosed()">
        <el-form :model="editForm" :rules="Rules" ref="editFormRef" label-width="100px">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="editForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input v-model="editForm.goods_price" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <el-input v-model="editForm.goods_number" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input v-model="editForm.goods_weight" type="number"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="editVisible=false">取消</el-button>
          <el-button type="primary" @click="sureEditBtn()">确定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import {formatDate} from 'common/utils'     //导入日期格式化文件
import AddGoods from './AddGoods.vue' //导入添加商品页面子组件
export default {
  name: 'Goods',
  components:{
    AddGoods
  },
  data() {
    return {
      //get请求的参数: 查询关键字/当前页码/每页显示的条数
      queryInfo: {query: '', pagenum: 1, pagesize: 10},
      goodsList: [],      //保存请求到的商品列表数据,服务器请求参数: add_time/goods_name/goods_id/....
      total: 0,           //数据总条数
      editVisible: false, //设置修改商品信息对话框是否显示
      editForm: {},       //保存当前修改的商品的信息: 服务器响应参数: add_time/goods_name/goods_id/...
      //添加/修改商品信息的验证规则
      Rules: {             
        goods_name: [{required: true, message: '请输入商品名称', trigger: 'blur'}],
        goods_price: [{required: true, message: '请输入商品价格', trigger: 'blur'}],
        goods_number: [{required: true, message: '请输入商品数量', trigger: 'blur'}],
        goods_weight: [{required: true, message: '请输入商品重量', trigger: 'blur'}],
        goods_cates: [{required: true, message: '请选中商品分类', trigger: 'blur'}]
      }
    }
  },
  created() {
    this.getGoodsList();    //请求商品列表数据
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
    //向服务器请求商品列表数据
    //Get请求: 路径:/goods  请求参数:query/pagenum/pagesize
    getGoodsList(){
      this.$http.get('/goods',{params: this.queryInfo}).then(res=>{
        if(res.data.meta.status !== 200){
          return this.$message.error(res.data.meta.msg)
        }
        else{
          this.goodsList = res.data.data.goods;   //保存请求的商品列表数据
          this.total = res.data.data.total;       //保存请求的数据总条数
        }
      }) 
    },
    //监听pagesize改变: 重新向服务器请求数据
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    //监听页码值改变: 重新向服务器请求当前页码的数据
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getGoodsList();
    },

    //*************************修改商品数据*************************/
    //监听修改商品信息按钮: 通过id查询商品原有信息 + 显示修改商品信息对话框
    //Get请求: 路径:/goods/:id
    editGoodsBtn(id){
      this.$http.get(`/goods/${id}`).then(res=>{
        if(res.data.meta.status !== 200){
          return this.$message.error(res.data.meta.msg)
        }
        else{
          this.editForm = res.data.data;   //保存查询到的当前商品信息
          return this.$message.success(res.data.meta.msg)
        }
      })
      this.editVisible = true;
    },
    //监听关闭修改商品信息对话框事件: 重置对话框表单
    editClosed(){
      this.$refs.editFormRef.resetFields()
    },
    //监听修改用户信息的确定按钮: 预校验成功发送网络请求同步到服务器(真正修改)
    //Put请求: 路径:/goods/:id  请求参数: editForm
    sureEditBtn(){
      this.$refs.editFormRef.validate(valid => {
        if (valid) {
          this.$http.put(`/goods/${this.editForm.goods_id} `,this.editForm).then(res => {
            if (res.data.meta.status !== 200){
              return this.$message.error(res.data.meta.msg)
            }
            else{
              this.getGoodsList();       //重新请求商品列表数据
              this.editVisible = false;  //隐藏修改商品信息的对话框
              this.$message.success(res.data.meta.msg)
            }
          })
        }
      })
    },

    //*************************删除商品数据*************************/
    //监听删除商品按钮:发送网络请求同步到服务器(真正删除)
    //弹窗警告: ElementUI库给vue原型挂载的$confirm方法,返回Promise对象;
    //delete请求: 路径:/goods/:id
    deletGoodsWarn(id) {
      this.$confirm('此操作将永久删除该用户,是否继续?','提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        //确定删除时发送网络请求
        this.$http.delete(`/goods/${id}`).then(res=>{
          if(res.data.meta.status !== 200){
            return this.$message.error(res.data.meta.msg)
          }
          else{
            this.getGoodsList();   //重新请求商品列表数据
            return this.$message.success(res.data.meta.msg)
          }
        })
      }).catch(() => {
        this.$message.info('已取消删除');          
      });
    },
 
    //*************************添加商品数据*************************/
    //监听点击添加商品按钮: 显示对话框
    addGoodsBtn(){
      this.$refs.addGoods.addVisible = true;
    },
    //监听点击确认添加发出的自定义事件: 重新请求商品列表进行显示
    refreshGoods(){
      this.getGoodsList();
    }
  }
}
</script>

<style lang="less" scoped></style>