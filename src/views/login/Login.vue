<template>
  <div id="login">
    <div class="login-box">
      <!-- 头像区域 -->
      <div class="avatar"><img src="~assets/img/logo.png" alt="" /></div>
      <!-- 登录区域:ElementUI -->
      <el-form class="text" :model="loginForm" :rules="loginFormRules" ref="loginFormRef">
        <!--动态绑定验证规则-->
        <el-form-item prop="username">
          <!--props属性设置为需要校验的字段名-->
          <el-input
            prefix-icon="el-icon-user-solid"
            placeholder="请输入需要登录的账号"
            v-model="loginForm.username"
          >
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            prefix-icon="el-icon-lock"
            placeholder="请输入账号密码"
            v-model="loginForm.password"
            show-password
          >
          </el-input
        ></el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="submitBtn()">登录</el-button>
          <el-button type="info" @click="resetBtn()">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      //登录表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      //登录表单验证规则
      loginFormRules: {
        username: [{min: 3,max: 10,message: '用户名的长度应在 3~10 个字符之间',trigger: 'blur'}],
        password: [{min: 6,max: 15,message: '密码的长度应在 6~15 个字符之间',trigger: 'blur'}]
      }
    }
  },
  methods: {
    //监听重置按钮点击: 重置表单
    resetBtn() {
      this.$refs.loginFormRef.resetFields()
    },
    //监听登录按钮点击: 预校验 validate((valid)=>{回调函数})
    //当valid值为真时发送网络请求,返回的是Promise对象,调用then方法处理数据;
    //Post请求: 路径:/login  请求参数:username/password
    submitBtn() {
      this.$refs.loginFormRef.validate(valid => {
        if (valid) {
          this.$http.post('/login', this.loginForm).then(res => {
            if (res.data.meta.status !== 200){
              return this.$message.error(res.data.meta.msg)
            }
            else this.$message.success(res.data.meta.msg)
            /*******************************************************
             1.将登录成功之后的token保存到客户端的sessionStorage
              * 项目中除了登录之外的其他API接口,必须在登录之后才能访问;
              * token只应在当前网站打开期间生效,所以保存在sessionStorage
            *********************************************************/
            window.sessionStorage.setItem('token',res.data.data.token)
            //2.通过编程式导航实现跳转到后台主页,路由地址是/home;
            this.$router.push('/home')
          })
        } else return
      })
    }
  }
}
</script>

<style lang="less" scoped>
#login {
  height: 100%;
  color: #fff;
  background-color: #2b4b6b;
}
.login-box {
  width: 450px;
  height: 350px;
  background-color: #fff;
  border-radius: 3px;
  box-sizing: border-box;
  padding: 20px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
//头像区域样式
.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  padding: 2px;
  border: 1px solid #ddd;
  box-shadow: 0 0 5px #ddd;
  margin: 0 auto;
}
.avatar > img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
//登录区域样式
.text {
  margin-top: 40px;
}
.btns {
  //float: right;
  display: flex;
  justify-content: flex-end;
}
</style>
