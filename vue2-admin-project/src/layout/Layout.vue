<template>
  <el-container style="height: 100vh;">
    <!-- 侧边栏 -->
    <el-aside 
        :width="isCollapse ? '64px' : '200px'"
        style="background-color: #2e3b4e; transition: width 0.2s ease-in-out;overflow:hidden"  >
          <div class="sidebar-header" style="display: flex; align-items: center; justify-content: space-between; padding: 0 20px; height: 60px; color: white; border-bottom: 1px solid #1f2d3d;">
          <!-- 折叠时隐藏标题，展开时显示 -->
          <span v-show="!isCollapse" style="font-size: 18px; font-weight: bold;">用户管理系统</span>
          <el-button 
            :disabled="isBtnDisabled"
            icon="el-icon-menu" 
            circle 
            size="mini" 
            @click="toggleCollapse" 
            style="color: white; background: #1f2d3d; border-color: #1f2d3d;"
          ></el-button>
        </div>

        <!-- 菜单部分：关闭默认过渡，用自定义动画 -->
        <el-menu
          :collapse="isCollapse"
          :collapse-transition="false" 
          default-active="/user"
          class="el-menu-vertical-demo"
          background-color="#2e3b4e"
          text-color="#fff"
          active-text-color="#ffd04b"
          router
          style="border-right: none; height: calc(100% - 60px);" 
        >
          <el-menu-item index="/user">
            <i class="el-icon-user"></i>
            <template v-slot:title>用户列表</template>
          </el-menu-item>
          <el-menu-item index="/setting">
            <i class="el-icon-setting"></i>
            <template v-slot:title>系统设置</template>
          </el-menu-item>
          <el-menu-item index="/chart">
            <i class="el-icon-s-data"></i>
            <template v-slot:title>数据统计</template>
          </el-menu-item>
          <el-menu-item index="/doubao">
            <i class="el-icon-chat-line-round"></i>
            <span slot="title">豆包 AI 助手</span>
          </el-menu-item>
          <el-menu-item index="/pdf-keyword">
            <i class="el-icon-document"></i>
            <span slot="title">PDF 关键字识别</span>
          </el-menu-item>
          <!-- 新增 M Stand 点餐系统菜单 -->
          <el-menu-item index="/mstand">
            <i class="el-icon-coffee-cup"></i>
            <span slot="title">M Stand 点餐系统</span>
          </el-menu-item>
          <el-menu-item index="/note">
            <i class="el-icon-edit-outline"></i>
            <span slot="title">网易云笔记</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

    <el-container>
      <!-- 顶部导航 -->
      <el-header style="text-align: right; font-size: 12px; background: #fff; border-bottom: 1px solid #e6e6e6;">
        <el-dropdown>
          <i class="el-icon-setting" style="margin-right: 15px"></i>
          <span>欢迎您，{{ username }}</span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-header>

      <!-- 主内容区 -->
      <el-main>
        <router-view /> <!-- 路由出口，显示不同页面内容 -->
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Layout',
  data() {
    return {
      isCollapse: false,
      isBtnDisabled: false,
      username: "", // 登录用户名
    }
  },
  mounted() {
    // 初始化时获取本地存储的用户名
    this.username = localStorage.getItem("username") || "管理员";
  },
  methods: {
  // 用方法触发折叠，添加防抖，避免快速点击卡顿
    toggleCollapse() {
    // 用数据变量控制禁用，避免操作 DOM
    this.isBtnDisabled = true
    setTimeout(() => {
      this.isBtnDisabled = false
    }, 200)
    
    this.isCollapse = !this.isCollapse
  },
  // 退出登录
  handleLogout() {
    this.$confirm("确定要退出登录吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }).then(() => {
      // 清除登录状态
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      this.$message.success("退出成功！");
      // 跳登录页
      this.$router.push("/login");
    }).catch(() => {
      this.$message.info("已取消退出");
    });
  },
}
}
</script>

<style scoped>
.el-header {
  background-color: #fff;
  color: #333;
  line-height: 60px;
  border-bottom: 1px solid #e6e6e6;
}
.el-aside {
  color: #333;
}
/* 给 el-menu 添加自定义样式，增强选中效果 */
  .el-menu-vertical-demo {
  border-right: none; /* 去掉右侧边框 */
  }
  .el-menu-item.is-active {
  background-color: #1f2d3d !important; /* 选中背景色加深 */
  }
  /* 优化菜单item的渲染，避免文字换行卡顿 */
  .el-menu-item {
    overflow: hidden;
    white-space: nowrap;
    transition: all 0.15s ease; /* 给菜单项添加轻量过渡 */
  }

  /* 折叠时图标居中 */
  .el-menu--collapse .el-menu-item {
    text-align: center;
  }

  /* 优化按钮hover效果，避免卡顿 */
  .el-button {
    transition: background-color 0.1s ease !important;
  }

  /* 新增：优化咖啡图标样式（可选） */
  .el-icon-coffee-cup {
    font-size: 16px;
  }
</style>