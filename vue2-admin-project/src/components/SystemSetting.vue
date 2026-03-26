<template>
    <div style="padding: 20px;">
      <el-card title="系统基础设置">
        <el-form :model="settingForm" label-width="100px">
          <el-form-item label="系统名称">
            <el-input v-model="settingForm.systemName" placeholder="请输入系统名称"></el-input>
          </el-form-item>
          <el-form-item label="接口地址">
            <el-input v-model="settingForm.apiUrl" placeholder="请输入后台接口地址"></el-input>
          </el-form-item>
          <el-form-item label="每页显示条数">
            <el-select v-model="settingForm.pageSize" placeholder="请选择">
              <el-option label="10条/页" value="10"></el-option>
              <el-option label="20条/页" value="20"></el-option>
              <el-option label="50条/页" value="50"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="是否开启缓存">
            <el-switch v-model="settingForm.cacheEnabled"></el-switch>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveSetting">保存设置</el-button>
            <el-button @click="resetSetting">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </template>
  
  <script>
  export default {
    name: 'SystemSetting',
    data() {
      return {
        settingForm: {
          systemName: '用户管理系统',
          apiUrl: 'http://localhost:3000/api',
          pageSize: '10',
          cacheEnabled: true
        }
      }
    },
    methods: {
      saveSetting() {
        this.$message.success('设置保存成功！')
        // 实际项目中可将设置存入 localStorage 或调用接口保存
        localStorage.setItem('systemSetting', JSON.stringify(this.settingForm))
      },
      resetSetting() {
        this.settingForm = {
          systemName: '用户管理系统',
          apiUrl: 'http://localhost:3000/api',
          pageSize: '10',
          cacheEnabled: true
        }
      }
    },
    created() {
      // 从 localStorage 加载设置
      const setting = localStorage.getItem('systemSetting')
      if (setting) {
        this.settingForm = JSON.parse(setting)
      }
    }
  }
  </script>