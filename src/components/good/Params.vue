<template>
  <div id="params">
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告提示 -->
      <el-alert title="只允许为第三级分类设置相关参数" type="warning" show-icon :closable="false"></el-alert>
      <!-- 级联选择器: options指定数据源/props指定配置对象/v-model绑定数组/clearable可清空/提示/监听发生改变的事件 -->
      <div>
        <span>请选择商品分类 : </span>  
        <el-cascader :options="cateList"
                    :props="cascaderProps"
                    v-model="selectedKeys"
                    clearable
                    placeholder="请选择商品分类"
                    @change="cateChanged()">
        </el-cascader>
      </div>
      <!-- Tabs标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 动态参数页签 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="small" :disabled="isDisabled" @click="addBtn()">添加参数</el-button>
          <el-table :data="manyParams" border stripe>
            <!-- 扩展列 -->
            <el-table-column type="expand" width="50px">
              <template slot-scope="scope">
                <!-- tag标签显示 -->
                <el-tag type="success" 
                        v-for="(item,index) in scope.row.attr_vals" 
                        :key="index"
                        closable 
                        @close="deleteTag(index,scope.row)"
                        class="expend">
                  {{item}}
                </el-tag>
                <!-- 添加tag标签与显示文本框的切换 -->
                <el-input v-if="scope.row.inputVisible"
                          v-model="scope.row.inputValue"
                          ref="saveTagInput"
                          class="change-input"
                          size="small"
                          clearable
                          @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="change-tag" size="small" @click="addTag(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列与列标题 -->
            <el-table-column type="index" label="序号"  width="50px"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="small" @click="editBtn(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="small" @click="deleteWarnBtn(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性页签 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="small" :disabled="isDisabled" @click="addBtn()">添加属性</el-button>
          <el-table :data="onlyParams" border stripe>
            <!-- 扩展列 -->
            <el-table-column type="expand" width="50px">
              <template slot-scope="scope">
                <!-- tag标签显示 -->
                <el-tag type="success" 
                        v-for="(item,index) in scope.row.attr_vals" 
                        :key="index"
                        closable 
                        @close="deleteTag(index,scope.row)"
                        class="expend">
                  {{item}}
                </el-tag>
                <!-- 添加tag标签与显示文本框的切换 -->
                <el-input v-if="scope.row.inputVisible"
                          v-model="scope.row.inputValue"
                          ref="saveTagInput"
                          class="change-input"
                          size="small"
                          clearable
                          @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="change-tag" size="small" @click="addTag(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列与列标题 -->
            <el-table-column type="index" label="序号"  width="50px"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="small" @click="editBtn(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="small" @click="deleteWarnBtn(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <!-- 添加动态参数/静态属性弹出的对话框 -->
      <el-dialog :title="'添加' + titleText" :visible.sync="addVisible" width="40%" @close="addClosed()">
        <el-form :model="addForm" :rules="Rules" ref="addRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name" :placeholder="'请输入要添加的' + titleText"></el-input>
          </el-form-item>  
        </el-form>
        <span slot="footer">
          <el-button @click="addVisible=false">取消</el-button>
          <el-button type="primary" @click="sureAddBtn()">确定</el-button>
        </span>
      </el-dialog>
      <!-- 修改动态参数/静态属性弹出的对话框: 复用添加的规则 -->
      <el-dialog :title="'修改' + titleText" :visible.sync="editVisible" width="40%" @close="editClosed()">
        <el-form :model="editForm" :rules="Rules" ref="editRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name" :placeholder="'请输入要修改的' + titleText"></el-input>
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
  name: 'Params',
  data() {
    return {
      queryInfo: {         //get请求的参数: 分类列表的层数/当前页码/每页显示的条数
        type: 3, 
        pagenum: null, 
        pagesize: null
      },
      cateList:[],         //保存请求到的分类的列表(一级/二级/三级)
      cascaderProps:{      //级联选择器的配置对象: value真正选中的属性/label显示的属性/嵌套的属性
        value:"cat_id",
        label:"cat_name",
        children:"children",
        expandTrigger: "hover"
      },
      selectedKeys:[],     //保存选中的分类的id数组
      activeName: "many",  //指定被激活的Tabs页签名称
      isDisabled: true,    //设置添加参数/属性按钮是否禁用

      cateId: null,        //保存当前选中的三级分类分类的id
      manyParams: [],      //保存请求到的当前商品的动态参数
      onlyParams: [],      //保存请求到的当前商品的静态属性

      addVisible: false,   //设置添加参数/属性对话框是否显示
      addForm:{},          //保存添加的分类参数,服务器响应参数: attr_id/attr_name/attr_sel...
      attrID: null,        //当前修改的分类参数/属性ID
      editVisible: false,  //设置修改参数/属性对话框是否显示
      editForm:{},         //保存正在修改的分类参数,服务器响应参数: attr_id/attr_name/attr_sel...            
      Rules:{attr_name: [{required: true, message: '不能为空', trigger: 'blur'}]},  //添加/修改参数/属性规则
    }
  },
  created() {
    this.getCateList();
  },
  computed:{
    //动态显示当前添加动态参数还是添加静态属性
    titleText(){
      if(this.activeName === 'many'){
        return '动态参数'
      }else{
        return '静态属性'
      }
    }
  },
  methods: {
    //*************************显示页面基本信息*************************/
    //向服务器请求分类列表数据
    //Get请求: 路径:/categories 请求参数:type
    getCateList(){
      this.$http.get('/categories',{params: this.queryInfo}).then(res=>{
        if(res.data.meta.status !== 200){
          return this.$message.error(res.data.meta.msg)
        }
        else{
          this.cateList = res.data.data;     //保存请求的分类列表数据
        }
      }) 
    },
    //监听选择的商品分类改变事件
    //当保存选中的分类id的数组长度不为零,代表有选中分类; 反之没有选中;
    //最后一项的id即是当前选中的分类的id, level值等于选中的分类数组的长度
    cateChanged(){
      if(this.selectedKeys.length !== 3){   
        this.selectedKeys = [];             //清空保存选中分类key值的数组
        this.cateId = null;                 //清空选中商品分类的id      ②②
        this.manyParams = [];               //清空动态参数
        this.onlyParams = [];               //清空静态属性
      }
      else{
        this.cateId = this.selectedKeys[2]; //保存中的三级分类的id
        this.getParamsList();               //首次请求选中的商品参数数据 ①①
        this.isDisabled = false;            //设置选中商品分类时添加按钮可用
      }
    },
    //监听选中的Tabs页签改变事件
    //若在已经选中商品分类时Tabs标签页改变,二次请求选中的商品参数数据; ③③
    //只有在选中了商品分类时才能获取到id,若没有选中则无法请求;
    handleClick() {
      if(this.cateId){
        this.getParamsList();  
      }   
    },
    //向服务器请求商品参数数据
    //Get请求: 路径:/categories/:id/attributes  请求参数:sel(only/many)
    //将Tabs页签的名称与get请求的sell参数值保持一致,方便请求;
    getParamsList(){
      this.$http.get(`/categories/${this.cateId}/attributes`,{params: {sel:this.activeName}}).then(res=>{
        if(res.data.meta.status !== 200){
          return this.$message.error(res.data.meta.msg)
        }
        else{
          //给请求到的参数前添加一些配置项再进行保存
          //=============================================================
          res.data.data.forEach(item => {
            //将请求参数的attr_vals属性值由字符串描述转化为数组
            item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
            item.inputVisible = false;    //为每一项添加属性: 用于tag标签与input文本框的切换
            item.inputValue = '';         //为每一项添加属性: 用于保存作为文本框显示时输入的值
          })
          //=============================================================
          if(this.activeName === 'many'){
            this.manyParams = res.data.data;     //保存请求到的动态参数
          }else{
            this.onlyParams = res.data.data;     //保存请求到的静态属性
          } 
        }
      }) 
    },

    //*************************添加参数/属性*************************/
    //监听点击添加按钮: 显示对话框
    addBtn(){
      this.addVisible = true;
    },
    //监听关闭添加对话框事件: 重置对话框表单
    addClosed(){
      this.$refs.addRef.resetFields()
    },
    //监听添加的确定按钮: 预校验成功发送网络请求同步到服务器(真正添加)
    //Post请求: 路径:/categories/:id/attributes  请求参数: attr_name/attr_sell/(attr_vals)
    sureAddBtn(){
      this.$refs.addRef.validate(valid => {
        if (valid) {
          this.$http.post(`/categories/${this.cateId}/attributes`,
          {attr_name:this.addForm.attr_name,attr_sel:this.activeName}).then(res => {
            if (res.data.meta.status !== 201){
              return this.$message.error(res.data.meta.msg)
            }
            else{
              this.getParamsList();       //重新请求参数/属性列表数据
              this.addVisible = false;    //隐藏添加参数/属性的对话框
              this.$message.success(res.data.meta.msg)
            }
          })
        }
      })
    },

    //*************************编辑参数/属性*************************/
    //监听点击修改按钮: 通过id查询分类原有参数/属性 + 显示修改对话框
    //Get请求: 路径: categories/:id/attributes/:attrId  请求参数: attr_sel
    //id: 当前分类的ID已保存  attrId:当前修改的参数/属性ID
    editBtn(attrId){        
      this.$http.get(`categories/${this.cateId}/attributes/${attrId}`,
      {params:{attr_sel:this.activeName}}).then(res=>{
        console.log(res.data.data)
        if(res.data.meta.status !== 200){
          return this.$message.error(res.data.meta.msg)
        }
        else{
          this.editForm = res.data.data;   //保存当前正在修改的分类参数
          return this.$message.success(res.data.meta.msg)
        }
      })
      this.editVisible = true;
    },
    //监听关闭修改对话框事件: 重置对话框表单
   editClosed(){
      this.$refs.editRef.resetFields()
    },
    //监听修改的确定按钮: 预校验成功发送网络请求同步到服务器(真正修改)
    //Put请求: 路径: categories/:id/attributes/:attrId  请求参数: attr_name/attr_sell
    sureEditBtn(){
      this.$refs.editRef.validate(valid => {
        if (valid) {
          this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {attr_name:this.editForm.attr_name, attr_sel:this.activeName}).then(res => {
            if (res.data.meta.status !== 200){
              return this.$message.error(res.data.meta.msg)
            }
            else{
              this.getParamsList();       //重新请求参数/属性列表数据
              this.editVisible = false;   //隐藏添加参数/属性的对话框
              this.$message.success(res.data.meta.msg)
            }
          })
        }
      })
    },

    //*************************删除参数/属性*************************/
    //监听删除按钮: 发送网络请求同步到服务器(真正删除)
    //弹窗警告: ElementUI库给vue原型挂载的$confirm方法,返回Promise对象;
    //delete请求: 路径: categories/:id/attributes/:attrId
    deleteWarnBtn(attrId){
      this.$confirm('此操作将永久删除该角色,是否继续?','提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        //确定删除时发送网络请求
        this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`).then(res => {
          if(res.data.meta.status !== 200){
            return this.$message.error(res.data.meta.msg)
          }
          else{
            this.getParamsList();   //重新请求参数/属性列表数据
            return this.$message.success(res.data.meta.msg)
          }
        })
      }).catch(() => {
        this.$message.info('已取消删除');          
      });
    },

    //****************************扩展列****************************/
    //监听点击Tag标签删除事件: attr_vals数组中删除并提交到服务器中; (真正删除)
    deleteTag(i,sR){
      sR.attr_vals.splice(i,1);
      this.submitAttrVals(sR);
    },
    //监听添加tag标签按钮: 切换成文本框显示
    addTag(sR) {
      sR.inputVisible = true;
    },
    //监听文本框失去焦点事件: attr_vals数组中添加有效标签并提交到服务器 (真正修改)
    handleInputConfirm(sR) {
      if(sR.inputValue.trim().length){    //有效数据则Push到attr_vals数组
        sR.attr_vals.push(sR.inputValue);
        sR.inputValue = '';
        this.submitAttrVals(sR);
      }
      else{ sR.inputValue = '' }          //空字符串直接清空数组                      
      sR.inputVisible = false;            //显示为tag标签
    },
    //将对当前分类的attr_vals的操作同步到服务器中保存
    //Put请求: 路径: categories/:id/attributes/:attrId   请求参数: attr_name/attr_sell/attr_vals
    submitAttrVals(Info){
      let obj = {
          attr_name: Info.attr_name, 
          attr_sel: Info.attr_sel, 
          attr_vals: Info.attr_vals.join(' ')
        }
      this.$http.put(`categories/${this.cateId}/attributes/${Info.attr_id}`,obj).then(res => {
        if (res.data.meta.status !== 200){
          return this.$message.error(res.data.meta.msg)
        }else{
          this.$message.success(res.data.meta.msg)
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-alert{
  margin-bottom: 15px;
}
.expend{
  margin-left: 20px;
}
.change-tag{
  margin-left: 20px; 
}
.change-input{
  width: 150px;
  margin-left: 20px;
}
</style>