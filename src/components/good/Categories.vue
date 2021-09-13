<template>
  <div id="category">
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 添加分类按钮 -->
    <el-row>
      <el-col :span="4">
        <el-button type="primary" @click="addCateBtn()" class="addCateBtn">添加分类</el-button>
      </el-col>
    </el-row>
    <!-- 卡片视图 -->
    <el-card>
    <!-- 引用表格组件【需要理解】 -->
      <zk-table :data="cateList" 
                :columns="columns" 
                :selection-type="false" 
                :expand-type="false" 
                :style="{fontSize:'14px',color:'#777'}" 
                show-index
                index-text="#" 
                border>
        <template slot="valid" slot-scope="scope">
          <i v-if="scope.row.cat_deleted === false" class="el-icon-success" :style="{color:'green'}" ></i>
          <i v-else class="el-icon-error" :style="{color:'red'}"></i>
        </template>
        <template slot="sort" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="small">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" type="success" size="small">二级</el-tag>
          <el-tag v-else type="warning" size="small">三级</el-tag>
        </template>
        <template slot="operation" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="small" @click="editCateBtn(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="small" @click="deleteCateWarn(scope.row.cat_id)">删除</el-button>
        </template>
      </zk-table>
      <!-- 分页提示区域: size-change与current-change事件会传递默认的参数 ?-->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page= "queryInfo.pagenum"
                     :page-sizes="[1,5,10,20]"
                     :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>
      <!-- 添加分类弹出的对话框 -->
      <el-dialog title="添加分类" :visible.sync="addVisible" width="40%" @close="addClosed()">
        <el-form :model="addCateForm" :rules="Rules" ref="addCateRef" label-width="100px">
          <!-- 级联选择器: options指定数据源/props指定配置对象/v-model绑定数组/clearable可清空/提示/监听发生改变的事件 -->
          <el-form-item label="父级分类">
            <el-cascader :options="parentList"
                        :props="cascaderProps"
                        v-model="selectedKeys"
                        clearable
                        placeholder="请选择父级分类"
                        @change="parentChanged()">
            </el-cascader>
          </el-form-item>
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name" placeholder="请输入分类名称"></el-input>
          </el-form-item>  
        </el-form>
        <span slot="footer">
          <el-button @click="addVisible=false">取消</el-button>
          <el-button type="primary" @click="sureAddBtn()">确定</el-button>
        </span>
      </el-dialog>
      <!--编辑分类弹出框-->
      <el-dialog title="修改分类"  :visible="editVisible" @close="editClose()" width="40%">
          <el-form :model="editCateForm" :rules="Rules" ref="editCateRef" label-width="100px">
            <el-form-item label="分类名称" prop="cat_name">
              <el-input v-model="editCateForm.cat_name"></el-input>
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
export default {
  name: 'Categories',
  data() {
    return {
      queryInfo: {      //get请求的参数: 分类列表的层数/当前页码/每页显示的条数
        type: 3, 
        pagenum: 1, 
        pagesize: 10
      },
      cateList: [],     //保存分类列表信息: 服务器响应参数: cat_id/cat_name/cat_pid/cat_level  
      total: 0,         //保存请求的数据总条数           
      columns: [{       //表格每列的数据: label列标题/props列内容对应的属性名/type列类型/template模板对应的作用域插槽名
          label: '分类名称',
          prop: 'cat_name' 
        },
        {
          label: '是否有效',    
          type: 'template', 
          template: 'valid'
        },
        {
          label: '排序',
          type: 'template',
          template: 'sort'      
        },
        {
          label: '操作',
          type: 'template',
          template: 'operation'
        }],
     
      addVisible:false,   //设置添加分类对话框是否显示  
      addCateForm:{       //添加的分类请求的参数: 分类名称/父级分类的id/分类等级 (不能为空)
        cat_name: '', 
        cat_pid: 0, 
        cat_level: 0
      },
      parentList:[],     //父级分类的列表(一级/二级)
      cascaderProps:{    //级联选择器的配置对象: value真正选中的属性/label显示的属性/children嵌套的属性/悬停触发/可单选
        value:"cat_id",
        label:"cat_name",
        children:"children",
        expandTrigger: "hover",
        checkStrictly: true,

      },
      selectedKeys:[],  //保存选中的父级分类的id数组
      Rules:{           //添加/修改分类信息的规则
          cat_name: [{required: true, message: '请输入分类名称', trigger: 'blur'}],
      },
      editVisible: false,
      editCateForm:{},  //保存正在修改的分类名与id

    }
  },
  created() {
    this.getCateList();
  },
  methods: {
    //*************************显示页面基本信息*************************/
    //向服务器请求分类列表数据
    //Get请求: 路径:/categories  请求参数:type/pagenum/pagesize
    getCateList(){
      this.$http.get('/categories',{params: this.queryInfo}).then(res=>{
        if(res.data.meta.status !== 200){
          return this.$message.error(res.data.meta.msg)
        }
        else{
          this.cateList = res.data.data.result;     //保存请求的分类列表数据
          this.total = res.data.data.total;         //保存请求的数据总条数
        }
      }) 
    },
    //监听pagesize改变: 重新向服务器请求数据
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    //监听页码值改变: 重新向服务器请求当前页码的数据
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },

    //****************************添加分类****************************/
    //监听点击添加分类按钮: 请求父级分类列表 + 显示对话框
    addCateBtn(){
      this.parentList = this.getParentList();   //保存请求的父级分类列表
      this.addVisible = true
    },
    //监听关闭添加分类对话框事件: 重置对话框表单 + 清空选择的父级分类列表
    addClosed(){
      this.$refs.addCateRef.resetFields();
      this.selectedKeys = [];
    },
    //监听添加分类的确定按钮: 预校验成功发送网络请求同步到服务器(真正添加)
    //Post请求: 路径:/categories  请求参数: cat_pid/cat_name/cat_level
    sureAddBtn(){
      this.$refs.addCateRef.validate(valid => {
        if (valid) {
          this.$http.post('/categories',this.addCateForm).then(res => {
            if (res.data.meta.status !== 201){
              return this.$message.error(res.data.meta.msg)
            }
            else{
              this.addVisible = false;  //隐藏添加角色的对话框
              this.getCateList();       //重新请求角色列表数据
              this.$message.success(res.data.meta.msg)
            }
          })
        }
      })
    },

    //****************************请求父级分类****************************/
    //向服务器请求父级分类列表数据(一级/二级)
    //Get请求: 路径:/categories  请求参数:type
    getParentList(){
      this.$http.get('/categories',{params:{type:2}}).then(res=>{
        if(res.data.meta.status !== 200){
          return this.$message.error(res.data.meta.msg)
        }
        else{
          this.parentList = res.data.data;    //保存请求的父级分类列表
        }
      }) 
    },
    //当选择中的父级分类改变时,在添加分类的表单中,添加的分类的id与等级也应该动态改变
    //当保存选中的父级分类id的数组长度不为零,代表有选中父级分类; 反之没有选中重置为0
    //最后一项的id即是当前选中的父级分类的id, level值等于选中的父级分类数组的长度
    parentChanged(){
      if(this.selectedKeys.length){      
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length-1];
        this.addCateForm.cat_level = this.selectedKeys.length;
      }else{
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },

    //****************************编辑分类****************************/
    //监听修改分类按钮: 通过id查询分类原有信息 + 显示修改分类信息对话框
    //Get请求: 路径:/categories/:uid
    editCateBtn(id){
      this.$http.get(`/categories/${id}`).then(res=>{
        if(res.data.meta.status !== 200){
          return this.$message.error(res.data.meta.msg)
        }
        else{
          this.editCateForm = res.data.data;   //保存当前正在修改的分类信息
          return this.$message.success(res.data.meta.msg)
        }
      })
      this.editVisible = true;
    },
    //监听关闭修改分类信息对话框事件: 重置对话框表单
    editClosed(){
      this.$refs.editCateRef.resetFields();
    },
    //监听修改分类信息的确定按钮: 预校验成功发送网络请求同步到服务器(真正修改)
    //Put请求: 路径:/categories/:id  请求参数: cat_name
    sureEditBtn(){
      this.$refs.editCateRef.validate(valid => {
        if (valid) {
          this.$http.put(`/categories/${this.editCateForm.cat_id}`,this.editCateForm).then(res => {
            if (res.data.meta.status !== 200){
              return this.$message.error(res.data.meta.msg)
            }
            else{
              this.editVisible = false; //隐藏修改分类的对话框
              this.getCateList();       //重新请求分类列表数据
              this.$message.success(res.data.meta.msg)
            }
          })
        }
      })
    },

    //****************************删除分类****************************/
    //监听删除分类按钮: 发送网络请求同步到服务器(真正删除)
    //弹窗警告: ElementUI库给vue原型挂载的$confirm方法,返回Promise对象;
    //delete请求: 路径:/categories/:id
    deleteCateWarn(id) {
      this.$confirm('此操作将永久删除该分类,是否继续?','提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        //确定删除时发送网络请求
        this.$http.delete(`/categories/${id}`).then(res=>{
          if(res.data.meta.status !== 200){
            return this.$message.error(res.data.meta.msg)
          }
          else{
            this.getCateList();   //重新请求角色列表数据
            return this.$message.success(res.data.meta.msg)
          }
        })
      }).catch(() => {
        this.$message.info('已取消删除');          
      });
    }
  }
}
</script>

<style lang="less" scoped>
.addCateBtn{
  margin-bottom: 15px;
}
</style>