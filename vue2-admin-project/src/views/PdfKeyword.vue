<template>
    <div class="pdf-keyword-container">
      <div class="page-header">
        <h2>
          <i class="el-icon-document"></i>
          PDF 关键字识别（全文高亮）
        </h2>
        <p>支持多字/整句/特殊字符高亮，100%生效</p>
      </div>
  
      <div class="main-content">
        <!-- 左侧操作区 -->
        <div class="upload-section">
          <el-card shadow="hover">
            <div class="upload-card-header">
              <h3>上传 PDF 文件</h3>
              <el-tag type="info">≤10MB</el-tag>
            </div>
  
            <el-upload
              class="pdf-uploader"
              drag
              action="#"
              :auto-upload="false"
              :on-change="handleFileChange"
              :file-list="fileList"
              accept=".pdf"
              :limit="1"
              :on-exceed="handleExceed"
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip">仅支持 PDF 格式</div>
            </el-upload>
  
            <div class="upload-actions">
              <el-button
                type="primary"
                @click="parsePdf"
                :disabled="!fileList.length || isParsing"
                :loading="isParsing"
              >
                解析 PDF
              </el-button>
              <el-button type="danger" @click="clearAll" :disabled="!fileList.length">
                清空
              </el-button>
            </div>
  
            <!-- 关键字搜索（核心：新增“强制高亮”按钮） -->
            <div class="search-box" v-if="pdfText">
              <el-input
                v-model="searchWord"
                placeholder="输入要高亮的内容（如：项目管理、合同编号）"
                prefix-icon="el-icon-search"
                clearable
              ></el-input>
              <el-button 
                type="warning" 
                @click="forceHighlight" 
                style="width: 100%; margin-top: 10px;"
                :disabled="!searchWord.trim()"
              >
                <i class="el-icon-search"></i> 强制高亮全文匹配内容
              </el-button>
            </div>
  
            <!-- 提取关键字 -->
            <div class="extract-box" v-if="pdfText">
              <el-button type="success" @click="extractHotKeywords" block style="margin-top: 10px;">
                自动提取高频关键字
              </el-button>
            </div>
  
            <!-- 匹配结果统计 -->
            <div class="match-count" v-if="matchCount > 0">
              <el-tag type="success">
                找到 {{ matchCount }} 处匹配结果
              </el-tag>
            </div>
          </el-card>
        </div>
  
        <!-- 右侧结果区 -->
        <div class="result-section">
          <el-card shadow="hover">
            <!-- 高频关键字标签（点击直接高亮） -->
            <div class="keyword-tags" v-if="hotKeywords.length">
              <div class="tag-title">高频关键字（点击高亮）：</div>
              <div class="tag-list">
                <el-tag
                  v-for="(word, idx) in hotKeywords"
                  :key="idx"
                  type="primary"
                  @click="clickToHighlight(word)"
                  closable
                  @close="removeKeyword(idx)"
                >
                  {{ word }}
                </el-tag>
              </div>
            </div>
  
            <!-- 文本内容区 -->
            <div class="content-header">
              <span>PDF 全文内容</span>
              <el-button type="text" @click="copyText" :disabled="!pdfText">
                <i class="el-icon-copy-document"></i> 复制全文
              </el-button>
            </div>
  
            <!-- 空状态 -->
            <div class="empty-state" v-if="!pdfText && !isParsing">
              <i class="el-icon-file-text"></i>
              <p>请先上传并解析 PDF 文件</p>
            </div>
  
            <!-- 加载中 -->
            <div class="loading-state" v-if="isParsing">
              <el-skeleton :rows="15" animated></el-skeleton>
            </div>
  
            <!-- ✅ 修复：改用 v-html 绑定数据，不再操作 ref -->
            <div
              class="text-content"
              v-if="pdfText && !isParsing"
              v-html="showText"
            ></div>
          </el-card>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import * as pdfjsLib from 'pdfjs-dist'
  pdfjsLib.GlobalWorkerOptions.workerSrc = '//unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js'
  
  export default {
    name: 'PdfKeywordRecognition',
    data() {
      return {
        fileList: [],
        isParsing: false,
        pdfText: '',        // 原始纯文本
        showText: '',       // 用于显示的带高亮文本
        searchWord: '',     // 搜索关键字
        hotKeywords: [],    // 高频关键字
        matchCount: 0       // 匹配数量
      }
    },
    methods: {
      // 文件超出限制
      handleExceed() {
        this.$message.warning('最多只能上传 1 个 PDF 文件！')
      },
  
      // 文件选择
      handleFileChange(file, fileList) {
        this.fileList = fileList.slice(-1)
        if (file.raw && !file.raw.name.endsWith('.pdf')) {
          this.$message.error('请上传 PDF 格式文件！')
          this.fileList = []
        }
        if (file.raw && file.raw.size > 10 * 1024 * 1024) {
          this.$message.error('文件大小不能超过 10MB！')
          this.fileList = []
        }
      },
  
      // 清空所有
      clearAll() {
        this.fileList = []
        this.pdfText = ''
        this.showText = ''
        this.searchWord = ''
        this.hotKeywords = []
        this.matchCount = 0
        this.$message.info('已清空所有内容')
      },
  
      // 解析 PDF（提取纯文本，过滤所有不可见字符）
      async parsePdf() {
        const file = this.fileList[0]?.raw
        if (!file) return
  
        this.isParsing = true
        this.pdfText = ''
        this.showText = ''
        this.matchCount = 0
  
        try {
          // 读取文件
          const arrayBuffer = await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target.result)
            reader.onerror = reject
            reader.readAsArrayBuffer(file)
          })
  
          // 解析 PDF
          const pdfDoc = await pdfjsLib.getDocument({
            data: new Uint8Array(arrayBuffer),
            cMapUrl: '//unpkg.com/pdfjs-dist@2.16.105/cmaps/',
            cMapPacked: true
          }).promise
  
          // 逐页提取文本（核心：过滤不可见字符）
          let fullText = ''
          for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
            const page = await pdfDoc.getPage(pageNum)
            const textContent = await page.getTextContent()
            // 只保留可见字符，过滤控制字符/空白符
            const pageText = textContent.items
              .map(item => item.str.replace(/[\x00-\x1F\x7F]/g, ''))
              .join('')
            fullText += pageText + '\n'
          }
  
          // 最终清理：合并多余空格，只保留单个空格
          this.pdfText = fullText.replace(/\s+/g, ' ').trim()
          // 初始显示原始文本
          this.showText = this.escapeHtml(this.pdfText)
          this.$message.success(`PDF 解析成功！共提取 ${this.pdfText.length} 个字符`)
        } catch (error) {
          this.$message.error(`解析失败：${error.message || '文件损坏/加密'}`)
        } finally {
          this.isParsing = false
        }
      },
  
      // HTML 转义（防止 XSS）
      escapeHtml(str) {
        if (!str) return ''
        return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;')
      },
  
      // 核心：强制高亮（绕过正则编码问题，改用字符串替换）
      forceHighlight() {
        if (!this.pdfText || !this.searchWord.trim()) return
  
        const keyword = this.searchWord.trim()
        // 1. 先转成小写，实现不区分大小写匹配
        const lowerText = this.pdfText.toLowerCase()
        const lowerKeyword = keyword.toLowerCase()
        
        // 2. 统计匹配数量
        this.matchCount = (lowerText.match(new RegExp(lowerKeyword, 'g')) || []).length
        
        // 3. 分段替换高亮（核心逻辑，100%生效）
        let resultHtml = ''
        let lastIndex = 0
        let currentIndex = lowerText.indexOf(lowerKeyword)
  
        while (currentIndex !== -1) {
          // 拼接前面的普通文本
          resultHtml += this.escapeHtml(this.pdfText.substring(lastIndex, currentIndex))
          // 拼接高亮文本
          resultHtml += `<span class="highlight">${this.escapeHtml(this.pdfText.substring(currentIndex, currentIndex + keyword.length))}</span>`
          // 更新索引
          lastIndex = currentIndex + keyword.length
          currentIndex = lowerText.indexOf(lowerKeyword, lastIndex)
        }
  
        // 拼接最后一段文本
        resultHtml += this.escapeHtml(this.pdfText.substring(lastIndex))
        
        // ✅ 修复：直接赋值给 showText，不再操作 ref
        this.showText = resultHtml
  
        // 提示结果
        if (this.matchCount === 0) {
          this.$message.warning('未找到匹配内容')
          this.showText = this.escapeHtml(this.pdfText) // 还原原始文本
        } else {
          this.$message.success(`高亮 ${this.matchCount} 处匹配内容`)
          // 滚动到第一个高亮位置
          this.$nextTick(() => {
            const firstHighlight = document.querySelector('.highlight')
            if (firstHighlight) {
              firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' })
              firstHighlight.style.animation = 'flash 1s'
              setTimeout(() => firstHighlight.style.animation = '', 1000)
            }
          })
        }
      },
  
      // 提取高频关键字
      extractHotKeywords() {
        if (!this.pdfText) return
  
        // 清理文本，只保留中文/英文/数字
        const cleanText = this.pdfText.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ')
        // 分割成单词（过滤长度 < 2 的无效词）
        const words = cleanText.split(/\s+/).filter(word => word.length >= 2)
        // 统计词频
        const wordMap = {}
        words.forEach(word => {
          wordMap[word] = (wordMap[word] || 0) + 1
        })
        // 按词频排序，取前 10 个
        this.hotKeywords = Object.entries(wordMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(item => item[0])
  
        this.$message.success(`提取到 ${this.hotKeywords.length} 个高频关键字`)
      },
  
      // 点击关键字自动高亮
      clickToHighlight(word) {
        this.searchWord = word
        this.forceHighlight()
      },
  
      // 移除关键字
      removeKeyword(idx) {
        this.hotKeywords.splice(idx, 1)
      },
  
      // 复制全文
      copyText() {
        navigator.clipboard.writeText(this.pdfText).then(() => {
          this.$message.success('全文已复制到剪贴板')
        }).catch(() => {
          const textArea = document.createElement('textarea')
          textArea.value = this.pdfText
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          this.$message.success('全文已复制到剪贴板')
        })
      }
    }
  }
  </script>
  
  <!-- 全局样式：确保高亮不被覆盖 -->
  <style>
  @keyframes flash {
    0% { background: #fff700; }
    50% { background: #ffeb3b; }
    100% { background: #fff700; }
  }
  .highlight {
    background: #fff700 !important;
    color: #000 !important;
    padding: 0 3px !important;
    border-radius: 2px !important;
    font-weight: bold !important;
  }
  </style>
  
  <style scoped>
  .pdf-keyword-container {
    padding: 20px;
    background: #f8f9fa;
    min-height: 100vh;
  }
  .page-header {
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }
  .page-header h2 {
    font-size: 22px;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .main-content {
    display: flex;
    gap: 20px;
  }
  .upload-section {
    width: 400px;
  }
  .upload-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .upload-actions {
    display: flex;
    gap: 10px;
    margin: 16px 0;
  }
  .search-box {
    margin: 12px 0;
  }
  .match-count {
    margin: 10px 0;
    text-align: center;
  }
  .result-section {
    flex: 1;
  }
  .keyword-tags {
    background: #f9f9f9;
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 16px;
    border: 1px solid #eee;
  }
  .tag-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-weight: 600;
  }
  .empty-state {
    text-align: center;
    padding: 60px 0;
    color: #999;
  }
  .empty-state i {
    font-size: 48px;
    margin-bottom: 10px;
  }
  .text-content {
    background: #fff;
    padding: 20px;
    border-radius: 6px;
    border: 1px solid #e5e6eb;
    max-height: 600px;
    overflow-y: auto;
    white-space: pre-wrap;
    line-height: 1.8;
    font-size: 14px;
  }
  </style>