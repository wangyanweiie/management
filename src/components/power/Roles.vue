<template>
  <div id="roles">
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 添加角色按钮 -->
    <el-row>
      <el-col :span="4">
        <el-button type="primary" @click="addRoleBtn()" class="addRoleBtn">添加角色</el-button>
      </el-col>
    </el-row>
    <!-- 角色列表区域 -->
    <el-card>
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand" width="50px">
          <template slot-scope="scope">
            <div class="areas">
              <!-- 渲染权限: 栅格布局区域 -->
              <el-row v-for="(item1,i1) in scope.row.children" 
                      :key="item1.id" 
                      :class="['bdBottom',i1===0 ? 'boTop' : '','vcenter']">
                <!-- 渲染一级权限 -->
                <el-col :span="5" >
                  <el-tag  closable @close='deleteRightWarn(scope.row.id,item1.id)'>
                    {{item1.authName}}
                  </el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 渲染二级与三级权限 -->
                <el-col :span="19">
                  <el-row v-for="(item2,i2) in item1.children" 
                          :key="item2.id" 
                          :class="[i2===0 ? '' : 'boTop','vcenter']">
                    <!-- 二级权限 -->
                    <el-col :span="5">
                      <el-tag type="success" closable @close='deleteRightWarn(scope.row.id,item2.id)'>
                        {{item2.authName}}
                      </el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <!-- 三级权限 -->
                    <el-col :span="14">
                      <el-tag type="warning" 
                              closable 
                              v-for="item3 in item2.children" 
                              :key="item3.id"
                              @close='deleteRightWarn(scope.row.id,item3.id)'>
                        {{item3.authName}}
                      </el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </div>
          </template>
        </el-table-column>
        <!-- 索引列与信息列 -->
        <el-table-column label="序号" type="index" width="50px"></el-table-column>
        <el-table-column label="角色" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width='300px'>
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="small" @click="editRoleBtn(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="small" @click="deleteRoleWarn(scope.row.id)">删除</el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top-start" :enterable="false">
              <el-button type="info" icon="el-icon-setting" size="small" @click="assignBtn(scope.row)">分配权限</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 添加角色弹出的对话框 -->
      <el-dialog title="添加角色" :visible.sync="addVisible" width="40%" @close="addClosed()">
        <el-form :model="addRoleForm" :rules="Rules" ref="addRoleRef" label-width="100px">
          <!-- 服务器会自动生成ID -->
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="addVisible=false">取消</el-button>
          <el-button type="primary" @click="sureAddBtn()">确定</el-button>
        </span>
      </el-dialog>
      <!-- 修改角色信息弹出的对话框: 复用添角色的规则 -->
      <el-dialog title="修改角色信息" :visible.sync="editVisible" width="40%" @close="editClosed()">
        <el-form :model="editRoleForm" :rules="Rules" ref="editRoleRef" label-width="100px">
          <el-form-item label="ID">
            <el-input v-model="editRoleForm.roleId" disabled></el-input>
          </el-form-item>
          <el-form-item label="角色" prop="roleName">
            <el-input v-model="editRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="editVisible=false">取消</el-button>
          <el-button type="primary" @click="sureEditBtn()">确定</el-button>
        </span>
      </el-dialog>
      <!-- 分配权限弹出的对话框 -->
      <el-dialog title="分配权限" :visible.sync="assignVisible" width="40%" @close="assignClosed()">
        <!-- 树形控件 -->
        <el-tree :data="rightForm" 
                 :props="treeProps" 
                 show-checkbox 
                 node-key="id" 
                 default-expand-all
                 :default-checked-keys="defaultKeys"
                 ref="treeRef">
        </el-tree>
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
  name: 'Roles',
  data() {
    return {
      roleList: [],       //角色列表数据
      addVisible:false,   //设置添加角色对话框是否显示
      addRoleForm: {},    //保存当前添加的角色的信息: 服务器响应参数: roleId/roleName/roleDesc
      Rules:{             //添加/修改角色信息的规则
          roleName: [{required: true, message: '请输入角色名称', trigger: 'blur'}],
          roleDesc: [{required: true, message: '请输入角色描述', trigger: 'blur'}]
      },
      editVisible: false,     //设置修改角色对话框是否显示
      editRoleForm: {},       //保存当前修改的角色的信息: 服务器响应参数: roleId/roleName/roleDesc
      assignVisible: false,   //设置分配权限对话框是否显示
      rightForm:{},           //保存获取到的所有权限列表: 服务器响应参数: id/authName/level/pid/path
      treeProps: {children: 'children', label:'authName'},   //树形控件的树形绑定对象
      defaultKeys:[],         //默认选中的节点id值数组
      assignRoleId:''         //保存当前分配权限的角色id
    }
  },
  created() {
    this.getRoleList();
  },
  methods:{
    //**************************显示页面基本信息**************************/
    //向服务器请求角色列表数据
    //Get请求: 路径:/roles
    getRoleList(){
      this.$http.get('/roles').then(res=>{
        if(res.data.meta.status !== 200){
          return this.$message.error(res.data.meta.msg)
        }
        else{
          this.roleList = res.data.data; //保存请求的角色列表数据
        }
      }) 
    },

    //****************************添加新角色****************************/
    //监听点击添加角色按钮: 显示对话框
    addRoleBtn(){
      this.addVisible = true;
    },
    //监听关闭添加角色对话框事件: 重置对话框表单
    addClosed(){
      this.$refs.addRoleRef.resetFields()
    },
    //监听添加角色的确定按钮: 预校验成功发送网络请求同步到服务器(真正添加)
    //Post请求: 路径:/roles  请求参数: roleName/roleDesc
    sureAddBtn(){
      this.$refs.addRoleRef.validate(valid => {
        if (valid) {
          this.$http.post('/roles',this.addRoleForm).then(res => {
            if (res.data.meta.status !== 201){
              return this.$message.error("添加角色失败")
            }
            else{
              this.addVisible = false;  //隐藏添加角色的对话框
              this.getRoleList();       //重新请求角色列表数据
              this.$message.success(res.data.meta.msg)
            }
          })
        }
      })
    },

    //****************************修改角色信息****************************/
    //监听修改角色信息按钮: 通过id查询角色原有信息 + 显示修改角色信息对话框
    //Get请求: 路径:/roles/:uid
    editRoleBtn(id){
      this.$http.get(`/roles/${id}`).then(res=>{
        if(res.data.meta.status !== 200){
          return this.$message.error(res.data.meta.msg)
        }
        else{
          this.editRoleForm = res.data.data;   //保存当前正在修改的角色信息
          return this.$message.success(res.data.meta.msg)
        }
      })
      this.editVisible = true;
    },
    //监听关闭修改角色信息对话框事件: 重置对话框表单
    editClosed(){
      this.$refs.editRoleRef.resetFields()
    },
    //监听修改角色信息的确定按钮: 预校验成功发送网络请求同步到服务器(真正修改)
    //Put请求: 路径:/roles/:id  请求参数: roleName/roleDesc
    sureEditBtn(){
      this.$refs.editRoleRef.validate(valid => {
        if (valid) {
          this.$http.put(`/roles/${this.editRoleForm.roleId} `,this.editRoleForm).then(res => {
            if (res.data.meta.status !== 200){
              return this.$message.error("修改角色信息失败")
            }
            else{
              this.editVisible = false;  //隐藏修改角色信息的对话框
              this.getRoleList();        //重新请角色列表数据
              this.$message.success(res.data.meta.msg)
            }
          })
        }
      })
    },

    //****************************删除角色信息****************************/
    //监听删除角色按钮: 发送网络请求同步到服务器(真正删除)
    //弹窗警告: ElementUI库给vue原型挂载的$confirm方法,返回Promise对象;
    //delete请求: 路径:/roles/: id
    deleteRoleWarn(id) {
      this.$confirm('此操作将永久删除该角色,是否继续?','提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        //确定删除时发送网络请求
        this.$http.delete(`/roles/${id}`).then(res=>{
          if(res.data.meta.status !== 200){
            return this.$message.error(res.data.meta.msg)
          }
          else{
            this.getRoleList();   //重新请求角色列表数据
            return this.$message.success(res.data.meta.msg)
          }
        })
      }).catch(() => {
        this.$message.info('已取消删除');          
      });
    },

    //*********************删除角色权限(一级/二级/三级)*********************/
    //监听删除角色权限的叉号: 发送网络请求同步到服务器(真正删除)
    //弹窗警告: ElementUI库给vue原型挂载的$confirm方法,返回Promise对象;
    //delete请求: 路径:/roles/:roleId/rights/:rightId
    deleteRightWarn(userId,rightId) {
      this.$confirm('此操作将永久删除该权限,是否继续?','提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        //确定删除时发送网络请求
        this.$http.delete(`/roles/${userId}/rights/${rightId}`).then(res=>{
          if(res.data.meta.status !== 200){
            return this.$message.error(res.data.meta.msg)
          }
          else{
            this.getRoleList();   //重新请求角色列表数据
            return this.$message.success(res.data.meta.msg)
          }
        })
      }).catch(() => {
        this.$message.info('已取消删除');          
      });
    },

    //******************************【分配权限】******************************/
    //监听点击分配权限按钮: 通过id查询角色原有权限 + 显示分配权限对话框
    //Get请求: 路径: roles/tree
    assignBtn(role){
      this.assignRoleId = role.id;  //保存当前进行权限分配的角色id
      this.$http.get('rights/tree',).then(res=>{
        if(res.data.meta.status !== 200){
          return this.$message.error(res.data.meta.msg)
        }
        else{
          this.getLeafKeys(role,this.defaultKeys) //调用递归获取三级节点id
          this.rightForm = res.data.data;         //保存查询到所有权限列表
          return this.$message.success(res.data.meta.msg)
        }
      })
      this.assignVisible = true;
    },
    //通过递归获取当前角色下三级节点的id保存到defaultKeys数组中,实现默认显示;
    getLeafKeys(node,arr){
      if(!node.children){
        return arr.push(node.id);
      }
      //如果当前节点不是三级节点则进行遍历+递归调用
      else{
        node.children.forEach(item => {
          this.getLeafKeys(item,arr)
        })
      }
    },
    //监听分配权限表单中确认按钮: 预校验成功发送网络请求同步到服务器(真正分配)
    //Post请求: 路径: roles/:roleId/rights   请求参数: rids(权限id列表字符串)
    //先通过el-tree控件的方法获取到全选/半选状态按钮的id保存在数组中,再将其转化为逗号分隔的字符串 <==> rids;
    sureAssignBtn(){
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()];
      const strKeys = keys.join(',');
      this.$http.post(`/roles/${this.assignRoleId}/rights`,{rids:strKeys}).then(res => {
        if (res.data.meta.status !== 200){
          return this.$message.error('分配权限失败')
        }
        else{
          this.assignVisible = false;  //隐藏修改角色信息的对话框
          this.getRoleList();         //重新请角色列表数据
          this.$message.success(res.data.meta.msg)
        }
      })
    },
    //监听分配权限对话框关闭事件: 清空数组defaultKeys
    assignClosed(){
      this.defaultKeys = [];
    }
  }
}
</script>

<style lang="less" scoped>
.navRow{
  margin-bottom: 15px;
}
.addRoleBtn{
  margin-bottom: 15px;
}
.areas{
  padding: 20px 50px;
}
.boTop{
  border-top: 1px solid #eee;
}
.bdBottom{
  border-bottom: 1px solid #eee;
}
.el-tag{
  margin: 7px;
}
.vcenter{
  display: flex;
  align-items: center;
}
</style>