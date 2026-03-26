<template>
  <div class="doubao-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>
        <i class="el-icon-chat-line-round"></i>
        豆包 AI 助手
      </h2>
      <p>快速获取编程解答、业务建议，助力初创公司高效开发</p>
    </div>

    <!-- 聊天区域 -->
    <div class="chat-wrapper">
      <!-- 历史消息列表 -->
      <div class="chat-history" ref="chatHistory">
        <!-- 系统欢迎语 -->
        <div class="message-item system">
          <div class="avatar">🤖</div>
          <div class="content">
            <div class="text">你好！我是豆包 AI 助手，有什么可以帮助你的？</div>
            <div class="time">{{ formatTime(new Date()) }}</div>
          </div>
        </div>

        <!-- 动态渲染消息 -->
        <div 
          v-for="(msg, index) in messageList" 
          :key="index" 
          :class="['message-item', msg.role]"
        >
          <div class="avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</div>
          <div class="content">
            <div class="text">{{ msg.content }}</div>
            <div class="time">{{ formatTime(msg.time) }}</div>
          </div>
        </div>

        <!-- 加载中状态 -->
        <div v-if="isLoading" class="message-item assistant">
          <div class="avatar">🤖</div>
          <div class="content">
            <div class="loading-text">
              <span>豆包正在思考</span>
              <span class="dot">●</span>
              <span class="dot">●</span>
              <span class="dot">●</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="chat-input">
        <el-form @submit.prevent="sendMessage">
          <el-input
            v-model="inputContent"
            type="textarea"
            placeholder="请输入你的问题（例如：如何优化Vue项目性能？）"
            :rows="4"
            class="input-area"
            @keyup.enter.native="handleEnterSend"
          ></el-input>
          <div class="input-footer">
            <el-button 
              type="text" 
              @click="clearHistory"
              :disabled="messageList.length === 0"
            >
              <i class="el-icon-delete"></i> 清空历史
            </el-button>
            <el-button 
              type="primary" 
              @click="sendMessage"
              :loading="isLoading"
              class="send-btn"
            >
              <i class="el-icon-send"></i> 发送
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Doubao',
  data() {
    return {
      // 输入框内容
      inputContent: '',
      // 消息列表
      messageList: [],
      // 加载状态
      isLoading: false
    }
  },
  mounted() {
    // 滚动到最新消息
    this.scrollToBottom()
  },
  methods: {
    // 格式化时间
    formatTime(time) {
      return new Date(time).toLocaleString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },

    // 滚动到消息底部
    scrollToBottom() {
      setTimeout(() => {
        const chatHistory = this.$refs.chatHistory
        if (chatHistory) {
          chatHistory.scrollTop = chatHistory.scrollHeight
        }
      }, 100)
    },

    // 回车发送（按住shift换行）
    handleEnterSend(e) {
      if (!e.shiftKey) {
        e.preventDefault()
        this.sendMessage()
      }
    },

    // 发送消息（纯前端模拟，无真实API调用）
    async sendMessage() {
      // 空消息校验
      const content = this.inputContent.trim()
      if (!content) {
        this.$message.warning('请输入要提问的内容！')
        return
      }

      // 添加用户消息到列表
      const userMsg = {
        role: 'user',
        content,
        time: new Date()
      }
      this.messageList.push(userMsg)
      this.inputContent = ''
      this.isLoading = true
      this.scrollToBottom()

      try {
        // 模拟API延迟（1.5秒）
        await new Promise(resolve => setTimeout(resolve, 1500))

        // 模拟豆包回答（根据问题类型返回不同回复）
        let answer = ''
        if (content.includes('Vue') || content.includes('前端')) {
          answer = `关于「${content}」的解答：
1. 路由懒加载：使用import()动态导入组件，减少首屏体积；
2. 图片懒加载：使用v-lazy指令，只加载可视区域图片；
3. 缓存组件：使用keep-alive缓存频繁切换的组件；
4. 减少DOM操作：使用Vue的响应式数据，避免直接操作DOM。`
        } else if (content.includes('初创公司') || content.includes('企业')) {
          answer = `关于「${content}」的解答：
1. 轻量化运营：优先聚焦核心业务，避免盲目扩张；
2. 成本控制：使用开源工具替代付费软件，降低研发成本；
3. 合规性：尽早完成工商、财税登记，规避法律风险；
4. 团队管理：扁平化架构，提升沟通效率。`
        } else {
          answer = `你问的「${content}」是个很好的问题！
这是模拟豆包AI的回复，实际对接火山引擎API后，会返回真实的AI回答。
你可以：
1. 在火山引擎方舟部署模型；
2. 获取Endpoint ID和ResourcePool-ID；
3. 替换模拟代码为真实API调用即可。`
        }

        // 添加AI回答到列表
        this.messageList.push({
          role: 'assistant',
          content: answer,
          time: new Date()
        })
      } catch (error) {
        // 模拟错误提示
        this.messageList.push({
          role: 'assistant',
          content: `模拟调用失败：${error.message || '网络异常，请重试'}`,
          time: new Date()
        })
        this.$message.error('豆包 AI 调用失败，请稍后重试')
      } finally {
        this.isLoading = false
        this.scrollToBottom()
      }
    },

    // 清空历史记录
    clearHistory() {
      this.$confirm('确定要清空聊天历史吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.messageList = []
        this.$message.success('历史记录已清空')
      })
    }
  }
}
</script>

<style scoped>
/* 页面容器 */
.doubao-container {
  width: 100%;
  height: calc(100vh - 80px);
  padding: 20px;
  box-sizing: border-box;
  background: #f8f9fa;
}

/* 页面标题 */
.page-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e6e6e6;
}
.page-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}
.page-header p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* 聊天区域 */
.chat-wrapper {
  width: 100%;
  height: calc(100% - 60px);
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 聊天历史 */
.chat-history {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 消息项 */
.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  width: 100%;
}
.message-item.user {
  flex-direction: row-reverse;
}
.message-item.user .content {
  text-align: right;
}

/* 头像 */
.avatar {
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border-radius: 50%;
  background: #f0f2f5;
  font-size: 20px;
  flex-shrink: 0;
}
.message-item.user .avatar {
  background: #409eff;
  color: #fff;
}

/* 消息内容 */
.content {
  max-width: 70%;
}
.text {
  padding: 10px 15px;
  border-radius: 8px;
  line-height: 1.6;
  font-size: 14px;
  white-space: pre-wrap;
}
.message-item.system .text {
  background: #f5f7fa;
  color: #333;
}
.message-item.user .text {
  background: #409eff;
  color: #fff;
}
.message-item.assistant .text {
  background: #f0f2f5;
  color: #333;
}
.time {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

/* 加载中 */
.loading-text {
  padding: 10px 15px;
  background: #f0f2f5;
  border-radius: 8px;
  font-size: 14px;
}
.dot {
  animation: blink 1s infinite;
}
.dot:nth-child(2) {
  animation-delay: 0.2s;
}
.dot:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes blink {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

/* 输入区域 */
.chat-input {
  padding: 20px;
  border-top: 1px solid #e6e6e6;
}
.input-area {
  border-radius: 6px;
  margin-bottom: 15px;
}
.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.send-btn {
  width: 100px;
}
</style>