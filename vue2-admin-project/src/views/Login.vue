<template>
  <div class="login-wrapper">
    <!-- 粒子背景容器 -->
    <div id="particles-js" class="particles-container"></div>

    <!-- 左侧品牌区 -->
    <div class="login-brand">
      <div class="brand-content">
        <h1 class="brand-title">
          <span class="logo">🚀</span>
          Nova Startup
        </h1>
        <p class="brand-desc">面向初创团队的轻量化管理平台<br>让协作更高效，让决策更简单</p>
        <div class="brand-features">
          <div class="feature-item">
            <i class="el-icon-check-circle"></i>
            <span>极简操作 · 开箱即用</span>
          </div>
          <div class="feature-item">
            <i class="el-icon-check-circle"></i>
            <span>数据安全 · 稳定可靠</span>
          </div>
          <div class="feature-item">
            <i class="el-icon-check-circle"></i>
            <span>按需扩展 · 成本可控</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录区（样式完全对齐） -->
    <div class="login-form-wrap">
      <div class="login-card">
        <div class="login-header">
          <h2>账号登录</h2>
          <p>Login to your account</p>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          label-width="0"
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              prefix-icon="el-icon-user"
              size="large"
              class="form-input"
              autocomplete="username"
            ></el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
              size="large"
              show-password
              class="form-input"
              autocomplete="current-password"
            ></el-input>
          </el-form-item>

          <el-form-item prop="code">
            <div class="code-group">
              <el-input
                v-model="loginForm.code"
                placeholder="验证码"
                prefix-icon="el-icon-key"
                size="large"
                class="code-input"
                autocomplete="off"
              ></el-input>
              <div 
                class="code-box" 
                @click="refreshCode"
                :style="{background: codeBoxBg}"
              >
                {{ verifyCode }}
              </div>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              class="login-btn"
              @click="handleLogin"
              :loading="isLoading"
              size="large"
            >
              登录系统
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <span class="footer-link">忘记密码？</span>
          <span class="footer-link">联系管理员</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'UserLogin',
  data() {
    return {
      loginForm: {
        username: '',
        password: '',
        code: ''
      },
      loginRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 32, message: '密码长度在 6 到 32 个字符', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { len: 4, message: '验证码长度为4个字符', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value?.toUpperCase() !== this.verifyCode) {
                callback(new Error('验证码不正确'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      },
      verifyCode: '',
      isLoading: false,
      codeBoxBg: '#f5f7fa' // 验证码背景色
    }
  },
  created() {
    // 初始化验证码
    this.refreshCode()
    // 如果已有token，自动跳转到首页
    if (localStorage.getItem('token')) {
      this.$router.push('/user')
    }
  },
  mounted() {
    // 粒子背景初始化
    if (window.particlesJS && typeof window.particlesJS === 'function') {
      window.particlesJS('particles-js', {
        particles: {
          number: { value: 60, density: { enable: true, value_area: 800 } },
          color: { value: '#ffffff' },
          opacity: { value: 0.4, random: true },
          size: { value: 2, random: true },
          line_linked: {
            enable: true,
            distance: 100,
            color: '#ffffff',
            opacity: 0.2,
            width: 1
          },
          move: {
            enable: true,
            speed: 0.6,
            direction: 'none',
            random: true,
            straight: false,
            out_mode: 'out'
          }
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
            onhover: { enable: true, mode: 'grab' },
            onclick: { enable: true, mode: 'push' },
            resize: true
          },
          modes: {
            grab: { distance: 120, line_linked: { opacity: 0.3 } },
            push: { particles_nb: 2 }
          }
        },
        retina_detect: true
      })
    } else {
      console.warn('particles.js 未加载，跳过粒子背景（不影响登录功能）')
    }
  },
  beforeUnmount() {
    // 清理粒子实例，防止内存泄漏
    if (window.pJSDom && window.pJSDom.length) {
      window.pJSDom[0].pJS.fn.vendors.destroy()
    }
  },
  methods: {
    // 生成随机验证码（增强随机性，添加干扰色）
    refreshCode() {
      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      let code = ''
      for (let i = 0; i < 4; i++) {
        code += chars[Math.floor(Math.random() * chars.length)]
      }
      this.verifyCode = code
      this.loginForm.code = ''
      // 验证码点击切换背景色（提升交互体验）
      this.codeBoxBg = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}33`
    },
    // 登录处理（替换为真实接口请求）

async handleLogin() {
  const valid = await this.$refs.loginFormRef.validate().catch(() => false)
  if (!valid) return

  this.isLoading = true
  try {
    const res = await request({
      url: '/api/login',
      method: 'post',
      data: {
        username: this.loginForm.username,
        password: this.loginForm.password
      }
    })

    if (res.code === 200) {
      // localStorage.setItem('token', res.token)
      localStorage.setItem('token', res.data.token)
      this.$message.success('登录成功')
      this.$router.push('/user')
    } else {
      this.$message.error(res.msg || '登录失败')
      this.refreshCode()
    }
  } catch (e) {
    console.log(e);
    this.$message.error('登录失败，无法连接服务器')
    this.refreshCode()
  } finally {
    this.isLoading = false
  }
}
  }
}
</script>

<style scoped>
/* 全局容器：双栏布局 + 渐变背景 */
.login-wrapper {
  width: 100vw;
  height: 100vh;
  display: flex;
  position: relative;
  background: linear-gradient(135deg, #3a86ff 0%, #8338ec 100%);
  overflow: hidden;
}

/* 粒子背景：底层不遮挡内容 */
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* 左侧品牌区：大屏显示，小屏隐藏 */
.login-brand {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  padding: 0 60px;
  z-index: 2;
}
.brand-content {
  max-width: 450px;
}
.brand-title {
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo {
  font-size: 48px;
}
.brand-desc {
  font-size: 18px;
  line-height: 1.6;
  opacity: 0.9;
  margin-bottom: 40px;
}
.brand-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
}
.feature-item i {
  color: #ffbe0b;
  font-size: 20px;
}

/* 右侧登录区：固定宽度，白色背景，阴影 */
.login-form-wrap {
  width: 480px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: -5px 0 25px rgba(0, 0, 0, 0.1);
}
.login-card {
  width: 380px;
  padding: 60px 0;
}

/* 登录标题 */
.login-header {
  margin-bottom: 40px;
}
.login-header h2 {
  font-size: 30px;
  font-weight: 600;
  color: #222;
  margin: 0 0 8px 0;
}
.login-header p {
  font-size: 14px;
  color: #999;
  margin: 0;
}

/* 表单样式：统一对齐，无错位 */
.login-form {
  width: 100%;
}
.form-input {
  width: 100%;
}
.login-form .el-form-item {
  margin-bottom: 24px;
}

/* 验证码行：严格对齐 */
.code-group {
  display: flex;
  gap: 12px;
  align-items: center;
}
.code-input {
  flex: 1;
}
.code-box {
  width: 120px;
  height: 44px;
  line-height: 44px;
  text-align: center;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 3px;
  color: #333;
  user-select: none;
  transition: background 0.3s ease;
}
.code-box:hover {
  opacity: 0.9;
}

/* 登录按钮：全屏宽度，渐变背景 */
.login-btn {
  width: 100%;
  height: 48px;
  line-height: 48px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(90deg, #3a86ff 0%, #8338ec 100%);
  border: none;
  border-radius: 6px;
  transition: opacity 0.3s ease;
}
.login-btn:hover {
  opacity: 0.95;
}

/* 底部链接：两端对齐，样式统一 */
.login-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  font-size: 14px;
}
.footer-link {
  color: #666;
  cursor: pointer;
  transition: color 0.3s ease;
}
.footer-link:hover {
  color: #3a86ff;
}

/* 响应式适配：小屏幕隐藏品牌区，登录区居中 */
@media (max-width: 768px) {
  .login-brand {
    display: none;
  }
  .login-form-wrap {
    width: 100%;
    box-shadow: none;
  }
}

/* 适配深色模式（可选） */
@media (prefers-color-scheme: dark) {
  .login-form-wrap {
    background: #1e1e1e;
  }
  .login-header h2 {
    color: #fff;
  }
  .login-header p {
    color: #ccc;
  }
  .footer-link {
    color: #ccc;
  }
}
</style>