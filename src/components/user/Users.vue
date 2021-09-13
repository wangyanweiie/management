<template>
  <div id="users">
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 查询添加区域 -->
      <el-row :gutter="10">
        <el-col :span="8">
          <el-input placeholder="请输入用户姓名" v-model="queryInfo.query" clearable @clear="getUserList()">
            <el-button slot="append" icon="el-icon-search" @click="getUserList()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4"><el-button type="primary" @click="addUserBtn()">添加用户</el-button></el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column label="序号" width="50px" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <!-- 作用域插槽: scope.row可以读取到当前行对象的全部数据 -->
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="changeState(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width='200px'>
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" circle size="small" @click="editUserBtn(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" circle size="small" @click="deleteUserWarn(scope.row.id)"></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top-start" :enterable="false">
              <el-button type="info" icon="el-icon-setting" circle size="small" @click="assignBtn(scope.row)"></el-button>
            </el-tooltip>
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
      <!-- 添加用户弹出的对话框 -->
      <el-dialog title="添加用户" :visible.sync="addVisible" width="40%" @close="addClosed()">
        <el-form :model="addForm" :rules="Rules" ref="addFormRef" label-width="100px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="电子邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号码" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="addVisible=false">取消</el-button>
          <el-button type="primary" @click="sureAddBtn()">确定</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户信息弹出的对话框: 验证规则可以复用添加用户时的验证规则 -->
      <el-dialog title="修改用户信息" :visible.sync="editVisible" width="40%" @close="editClosed()">
        <el-form :model="editForm" :rules="Rules" ref="editFormRef" label-width="100px">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="电子邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号码" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="editVisible=false">取消</el-button>
          <el-button type="primary" @click="sureEditBtn()">确定</el-button>
        </span>
      </el-dialog>
      <!-- 分配角色弹出的对话框 -->
      <el-dialog title="分配角色" :visible.sync="assignVisible" width="40%" @close="assignClosed()">
        <div id="assign">
          <p>当前的用户 : {{userInfo.username}}</p>
          <p>当前的角色 : {{userInfo.role_name}}</p>
          <p>分配角色 : 
            <el-select v-model="selectedRoleId" placeholder="请选择角色">
              <el-option v-for="item in roleInfo" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
            </el-select>
          </p>
        </div>
        <span slot="footer">
          <el-button @click="assignVisible=false">取消</el-button>
          <el-button type="primary" @click="sureAssignBtn()">确定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Users',
  data() {
    //验证手机号码的规则: 正则表达式
    var checkMobile = (rule,value,callback)=>{
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return callback()
      }else{
        callback(new Error('请输入合法的手机号码'))
      }
    }
    return {
      //get请求的参数: 查询关键字/当前页码/每页显示的条数
      queryInfo: {query: '', pagenum: 1, pagesize: 5},
      userList: [],        //保存用户列表信息: 服务器响应参数: username/email/mobile/role_name/mg_state
      total: 0,            //数据总条数
      addVisible: false,   //设置添加用户对话框是否显示
      addForm: {},         //保存添加新用户的信息: 服务器响应参数: id/rid/username/email/mobile
      editVisible: false,  //设置修改用户信息对话框是否显示
      editForm: {},        //保存当前修改的用户的信息: 服务器响应参数: id/role_id/email/mobile
      //添加/修改用户的验证规则
      Rules: {             
        username: [{required: true, message: '请输入用户名', trigger: 'blur'},
                  {min: 3, max: 10, message: '用户名的长度应在3~10个字符之间',trigger: 'blur'}],
        password: [{required: true, message: '请输入密码', trigger: 'blur'},
                  {min: 6, max: 15, message: '用户名的长度应在6~15个字符之间', trigger: 'blur'}],
        email: [{required: true, message: '请输入邮箱地址', trigger: 'blur'},
                {type:'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change']}],
        mobile: [{required: true, message: '请输入手机号码', trigger: 'blur'},
                {validator: checkMobile, trigger: 'blur'}]
      },
      assignVisible: false,   //设置分配角色对话框是否显示
      userInfo: {},           //保存分配的角色的用户信息: 服务器响应参数: id/role_id/email/mobile....
      roleInfo: {},           //保存所有可分配的角色列表: 服务器响应三层数据: 角色信息/权限说明/children
      selectedRoleId:''       //保存分配角色时选中的角色id
    }
  },
  //在Home/User页面创建立即获取用户列表数据进行显示
  created() {
    this.getUserList();
  },
  methods: {
    //*************************显示页面基本信息*************************/
    //向服务器请求用户列表数据
    //Get请求: 路径:/users  请求参数:query/pagenum/pagesize
    getUserList(){
      this.$http.get('/users',{params: this.queryInfo}).then(res=>{
        if(res.data.meta.status !== 200){
          return this.$message.error(res.data.meta.msg)
        }
        else{
          this.userList = res.data.data.users;  //保存请求的用户列表数据
          this.total = res.data.data.total;     //保存请求的数据总条数
        }
      }) 
    },
    //监听pagesize改变: 重新向服务器请求数据
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    //监听页码值改变: 重新向服务器请求当前页码的数据
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    //**************************更新用户的状态**************************/
    //监听用户的状态的改变: 同步到服务器中的用户状态
    //Put请求: 路径:users/:id/state/:type
    changeState(userInfo){
      this.$http.put(`/users/${userInfo.id}/state/${userInfo.mg_state}`).then(res=>{
        if(res.data.meta.status !== 200){
          userInfo.mg_state = !userInfo.mg_state;   //用户状态还原成修改前的状态
          return this.$message.error(res.data.meta.msg)
        }
        else{
          return this.$message.success(res.data.meta.msg)
        }
      })
    },
    //****************************添加新用户****************************/
    //监听点击添加用户按钮: 显示对话框
    addUserBtn(){
      this.addVisible = true;
    },
    //监听关闭添加用户对话框事件: 重置对话框表单
    addClosed(){
      this.$refs.addFormRef.resetFields()
    },
    //监听添加用户信息的确定按钮: 预校验成功发送网络请求同步到服务器(真正添加)
    //Post请求: 路径:/users  请求参数:username/password/email/mobile
    sureAddBtn(){
      this.$refs.addFormRef.validate(valid => {
        if (valid) {
          this.$http.post('/users', this.addForm).then(res => {
            if (res.data.meta.status !== 201){
              return this.$message.error(res.data.meta.msg)
            }
            else{
              this.getUserList();       //重新请求用户列表数据
              this.addVisible = false;  //隐藏添加用户的对话框
              this.$message.success(res.data.meta.msg)
            }
          })
        }
      })
    },
    //****************************修改用户信息****************************/
    //监听修改用户信息按钮: 通过id查询用户原有信息 + 显示修改用户信息对话框
    //Get请求: 路径:/users/:id
    editUserBtn(id){
      this.$http.get(`/users/${id}`).then(res=>{
        if(res.data.meta.status !== 200){
          return this.$message.error(res.data.meta.msg)
        }
        else{
          this.editForm = res.data.data;   //保存查询到的当前用户信息
          return this.$message.success(res.data.meta.msg)
        }
      })
      this.editVisible = true;
    },
    //监听关闭修改用户信息对话框事件: 重置对话框表单
    editClosed(){
      this.$refs.editFormRef.resetFields()
    },
    //监听修改用户信息的确定按钮: 预校验成功发送网络请求同步到服务器(真正修改)
    //Put请求: 路径:/users/:id  请求参数: email/mobile
    sureEditBtn(){
      this.$refs.editFormRef.validate(valid => {
        if (valid) {
          this.$http.put(`/users/${this.editForm.id} `,this.editForm).then(res => {
            if (res.data.meta.status !== 200){
              return this.$message.error(res.data.meta.msg)
            }
            else{
              this.getUserList();        //重新请求用户列表数据
              this.editVisible = false;  //隐藏修改用户信息的对话框
              this.$message.success(res.data.meta.msg)
            }
          })
        }
      })
    },
    //****************************删除用户信息****************************/
    //监听删除用户按钮:发送网络请求同步到服务器(真正删除)
    //弹窗警告: ElementUI库给vue原型挂载的$confirm方法,返回Promise对象;
    //delete请求: 路径:/users/:id
    deleteUserWarn(id) {
      this.$confirm('此操作将永久删除该用户,是否继续?','提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        //确定删除时发送网络请求
        this.$http.delete(`/users/${id}`).then(res=>{
          if(res.data.meta.status !== 200){
            return this.$message.error(res.data.meta.msg)
          }
          else{
            this.getUserList();   //重新请求用户列表数据
            return this.$message.success(res.data.meta.msg)
          }
        })
      }).catch(() => {
        this.$message.info('已取消删除');          
      });
    },
    //******************************【分配角色】******************************/
    //监听点击分配角色按钮: 保存分配角色的用户信息 + 查询所有的角色列表 + 显示对话框
    //Get请求: 路径: /roles
    assignBtn(userInfo){
      this.userInfo = userInfo;     //保存分配角色的用户信息
      this.$http.get('/roles').then(res=>{
        if(res.data.meta.status !== 200){
          return this.$message.error(res.data.meta.msg)
        }
        else{                      //保存查询到的可分配角色列表
          this.roleInfo = res.data.data;   
          return this.$message.success(res.data.meta.msg)
        }
      })
      this.assignVisible = true;
    },
    //监听关闭分配角色对话框事件: 清空selectedRoleId
    assignClosed(){
      this.selectedRoleId = ''
    },
    //监听分配角色的确定按钮: 预校验成功发送网络请求同步到服务器(真正分配)
    //Put请求: 路径: /users/:id/role  请求参数: rid(角色id)
    sureAssignBtn(){
      let ID = this.selectedRoleId;
      if(ID){
        this.$http.put(`/users/${this.userInfo.id}/role`,{rid:ID}).then(res=>{
          if (res.data.meta.status !== 200){
              return this.$message.error(res.data.meta.msg)
            }
            else{
              this.getUserList();         //重新请求用户列表数据
              this.assignVisible = false; //隐藏修改用户信息的对话框
              this.$message.success(res.data.meta.msg)
            }
        })
      }else{
        this.$message.error("请选择需要分配的角色")
      }
    }
  }
}
</script>

<style lang="less" scoped>
#assign{
  padding: 0 20px;
}
</style>