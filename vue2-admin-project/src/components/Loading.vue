<template>
    <div class="loading-mask" v-show="visible">
      <div class="loading-box">
        <el-spinner type="double-circle" size="large"></el-spinner>
        <div style="margin-top: 10px;">{{ text }}</div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Loading',
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      text: {
        type: String,
        default: '加载中...'
      }
    }
  }
  </script>
  
  <style scoped>
  .loading-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }
  .loading-box {
    background: white;
    padding: 30px;
    border-radius: 8px;
    text-align: center;
  }
  </style>