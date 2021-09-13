<template>
  <div id="add-goods">
    <el-dialog :visible.sync="addVisible" width="60%" height="60%" @close="addClosed()">
      <!-- 提示条 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条 -->
      <el-steps :active="activeIndex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
      </el-steps>
      <!-- Tag标签页 -->
      <el-form :model="addForm" :rules="Rules" ref="addFormRef" label-width="100px">
        <el-tabs :tab-position="tabPosition"
                 v-model="activeIndex" 
                 :before-leave="changeTabs" 
                 @tab-click="tabsClick()">
          <!---------- 基本信息标签页 ---------->
          <el-tab-pane label="基本信息" name="0">
            <!-- 级联选择器: options指定数据源/props指定配置对象/v-model绑定存储的数组(必须是数组) --> 
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader :options="cateList"
                          :props="cascaderProps"
                          v-model="addForm.goods_cat"
                          clearable
                          placeholder="请选择商品分类"
                          @change="cateChanged()">
              </el-cascader>
            </el-form-item>
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!---------- 商品参数标签页 ---------->
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyParams" :key="item.attr_id" :label="item.attr_name">
              <!-- 多选框 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="i in item.attr_vals" :key="i" :label="i" border size="mini"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!---------- 商品属性标签页 ---------->
          <el-tab-pane label="商品属性" name="2">           
            <el-form-item v-for="item in onlyParams" :key="item.attr_id" :label="item.attr_name" label-width="150px">
                <el-input v-model="item.attr_vals[0]"></el-input>   <!-- 控制台告警: 原因需要绑定到字符串 -->
            </el-form-item>
          </el-tab-pane>
          <!---------- 商品图片标签页 ---------->
          <el-tab-pane label="商品图片" name="3">
            <!-- 上传图片: action上传地址/on-preview预览事件/on-remove删除事件/list-type设置文件列表样式 
            由于上传图片使用的是组件内部的请求,没有使用axios请求,所以登录时获取到的token此时无法访问,需要再配置headers -->
            <el-upload :action="actionURL"
                      :on-preview="handlePreview"
                      :on-remove="handleRemove"
                      list-type="picture"
                      :headers="headerObj"
                      :on-success="handleSuccess">
                <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <!---------- 商品内容标签页 ---------->
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <div class="addBtn">
              <el-button @click="addVisible=false">取消</el-button>
              <el-button type="primary" @click="sureAddBtn()">确定</el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <!-- ============================================================================ -->
      <!-- 图片预览对话框【服务器图片路径不可访问】 -->
      <el-dialog title="图片预览" width="30%" :visible.sync="imageVisible" append-to-body>
        <img :src="previewPath" class="imagePreview"/>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script>
var _ = require('lodash');     //导入lodash进行深拷贝
export default {
  name: 'AddGoods',
  data() {
    return {
      tabPosition: 'left',    //设置Tag标签页所在的位置
      activeIndex: '0',       //当前活跃的步骤索引值
      addVisible: false,      //设置添加商品对话框是否显示
      addForm: {              //保存需要添加的商品信息
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_cat: [],        //保存选中的分类的id数组 (==selectedKeys)
        pics:[],              //保存服务器中图片存放的地址
        goods_introduce: "",  //保存商品的介绍信息
        attrs: []             //组合动态参数与静态属性
      },
      Rules: {             
        goods_name: [{required: true, message: '请输入商品名称', trigger: 'blur'}],
        goods_price: [{required: true, message: '请输入商品价格', trigger: 'blur'}],
        goods_number: [{required: true, message: '请输入商品数量', trigger: 'blur'}],
        goods_weight: [{required: true, message: '请输入商品重量', trigger: 'blur'}],
        goods_cat: [{required: true, message: '请选中商品分类', trigger: 'blur'}]
      },
      cateList: [],         //保存请求到的分类数据(一级/二级/三级)
      cascaderProps:{       //级联选择器的配置对象: value真正选中的属性/label显示的属性/嵌套的属性
        value:"cat_id",
        label:"cat_name",
        children:"children",
        expandTrigger: "hover"
      },
      cateId: 0,            //保存选中的三级分类的id
      manyParams: [],       //保存请求到的当前商品的参数
      onlyParams: [],       //保存请求到的当前商品的属性
      actionURL: 'http://www.ysqorz.top:8888/api/private/v1/upload',      //图片上传的完整地址 (baseURL + API)
      headerObj: {Authorization: window.sessionStorage.getItem("token")}, //图片上传组件headers的请求头对象 (添加token)
      imageVisible: false,  //图片预览对话框 (嵌套)
      previewPath: "",      //需要预览的图片路径
    }
  },
  created() {
    this.getCateList();     //请求分类列表数据
  },
  methods: {
    //======================= 配置项 =======================
    //监听关闭添加商品对话框事件: 重置
    addClosed(){
      this.activeIndex = '0';               //回到第一个页签
      this.addForm.goods_cat = [];          //清空级联选择框选中的分类id
      this.manyParams = [];                 //清空请求的商品参数数据
      this.onlyParams = [];                 //清空请求的商品属性数据
      this.$refs.addFormRef.resetFields();  //重置表单输入框
    },
    //监听标签页的切换事件: 当未选择商品分类时阻值标签页的切换;
    changeTabs(activeName,oldActiveName){
      if(oldActiveName === '0' && this.addForm.goods_cat.length !== 3){
        this.$message.error("请先选择商品分类!")
        return false;
      }
    },
    //监听标签页被点击事件: 点击不同的标签页请求不同的数据
    tabsClick(){
      if(this.activeIndex == '1'){
        this.getParamsList('many');     //请求商品参数
      }
      else if(this.activeIndex === '2'){
        this.getParamsList('only');     //请求商品属性
      }
    },
    //======================= 基本信息页面 =======================
    //向服务器请求分类列表数据: 用于显示分类的级联选择框
    //Get请求: 路径:/categories  请求参数:type
    getCateList(){
      this.$http.get('/categories',{params: {type:3}}).then(res=>{
        if(res.data.meta.status !== 200){
          return this.$message.error(res.data.meta.msg)
        }
        else{
          this.cateList = res.data.data;     //保存请求的分类列表数据
        }
      }) 
    },

    //监听级联选择器中选择的商品分类改变事件: 设置只能选择三级分类
    cateChanged(){
      if(this.addForm.goods_cat.length !== 3){   
        this.addForm.goods_cat = [];             //清空保存选中分类key值的数组
        this.cateId = null;                        //清空选中商品分类的id
      }
      else{
        this.cateId = this.addForm.goods_cat[2]; //保存中的三级分类的id
      }
    },
    //======================= 商品参数/属性页面 =======================
    //向服务器请求商品参数与静态属性数据
    //Get请求: 路径:/categories/:id/attributes  请求参数: sel(only/many)
    getParamsList(sel){
      this.$http.get(`/categories/${this.cateId}/attributes`,{params: {sel:sel}}).then(res=>{
        if(res.data.meta.status !== 200){
          return this.$message.error(res.data.meta.msg)
        }
        else{
          //给请求到的参数前添加一些配置项再进行保存
          res.data.data.forEach(item => {
            //将请求参数的attr_vals属性值由字符串描述转化为数组
            item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          })
          if(sel === 'many'){
            this.manyParams = res.data.data;     //保存请求到的动态参数
          }else{
            this.onlyParams = res.data.data;     //保存请求到的静态属性
          } 
        }
      }) 
    },
    //======================= 商品图片页面 =======================
    //监听图片上传成功事件
    handleSuccess(response,file,fileList){
      const picPath = {pic : response.data.tmp_path}; //拼接得到一个图片路径对象
      this.addForm.pics.push(picPath);                //将图片对象Push到addForm.pics中
    },
    //监听图片删除事件
    handleRemove(file){
      const filePath = file.response.data.tmp_path    //在file中获取需要删除图片的临时路径
      //在addForm.pics数组中查询寻到图片路径的索引值
      const index = this.addForm.pics.findIndex(item => item.pic === filePath);
      this.addForm.pics.splice(index,1);              //删除查找到的索引值对应的图片路径
    },
    //监听图片预览事件【服务器图片路径不可访问】
    handlePreview(file,fileList){
      //this.imageVisible = true;
      //this.previewPath = file.response.data.url;
    },
    //======================= 添加商品确认 =======================
    //处理静态参数以及静态属性,转为指定的格式存入attrs中;
    handleAttrs(){
      this.manyParams.forEach(item => {
        const newInfo = {attr_id: item.attr_id, attr_value: item.attr_vals.join(' ')};
        this.addForm.attrs.push(newInfo)
      });
      this.onlyParams.forEach(item => {
        const newInfo = {attr_id: item.attr_id, attr_value: item.attr_vals.join(' ')};
        this.addForm.attrs.push(newInfo)
      });
    },
    //监听添加商品信息的确定按钮: 预校验成功发送网络请求同步到服务器(真正添加)
    //Post请求: 路径:/goods  请求参数: addForm
    sureAddBtn(){
      this.$refs.addFormRef.validate(valid => {
        if (valid) {
          //------------------------------完善请求参数配置项------------------------------
          //1.需要将goods_cat转为字符串,而级联选择器v-model绑定的必须数组,直接转换会冲突报错;
          //2.缺少attrs数组存放动态参数与静态属性;
          const form = _.cloneDeep(this.addForm)       //使用lodash 进行深拷贝,绑定原数组,操作新数组;
          form.goods_cat = form.goods_cat.join(',')    //将goods_cat由数组转化成字符串
          this.handleAttrs;                            //生成addForm.attrs并赋值给form.attrs上
          form.attrs = this.addForm.attrs;
          //----------------------------------------------------------------------------
          this.$http.post('/goods',form).then(res => {
            if (res.data.meta.status !== 201){
              return this.$message.error(res.data.meta.msg)
            }
            else{
              this.$emit('refreshGoods')    //通知重新请求商品列表
              this.addVisible = false;      //隐藏添加商品的对话框
              this.$message.success(res.data.meta.msg)
            }
          })
        }
        else{
          return this.$message.error("请填写必要的商品信息")
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
  .el-steps{
    margin-bottom: 15px;
  }
  .el-checkbox{
    margin: 5px !important;
  }
  .imagePreview{
    width: 100%;
  }
  .addBtn{
    margin-top: 15px;
  }
</style>