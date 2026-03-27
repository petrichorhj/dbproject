<template>
  <div class="note-container">
    <!-- 左侧边栏 -->
    <div class="left-sidebar">
      <div class="sidebar-header">
        <div class="logo">网易云笔记</div>
      </div>

      <div class="menu-list">
        <div class="menu-item" :class="{ active: tab === 'note' }" @click="switchTab('note')">
          <i class="el-icon-notebook-1"></i>
          <span>全部笔记</span>
        </div>
        <div class="menu-item" :class="{ active: tab === 'trash' }" @click="switchTab('trash')">
          <i class="el-icon-delete"></i>
          <span>回收站</span>
        </div>
      </div>

      <div class="folder-section">
        <div class="folder-title">
          <span>笔记本</span>
          <i class="el-icon-plus" @click="addFolder"></i>
        </div>
        <div class="folder-item"
             v-for="item in folderList"
             :key="item.id"
             :class="{ active: currentFolderId === item.id }"
             @click="switchFolder(item.id)">
          <i class="el-icon-folder"></i>
          <span>{{ item.name }}</span>
        </div>
      </div>

      <div class="new-note-btn" @click="createNote">
        <i class="el-icon-edit"></i>
        新建笔记
      </div>
    </div>

    <!-- 中间笔记列表 -->
    <div class="middle-list">
      <div class="search-bar">
        <el-input v-model="kw" placeholder="搜索笔记" size="mini" clearable>
          <i slot="prefix" class="el-icon-search"></i>
        </el-input>
      </div>

      <div class="note-item"
           v-for="note in showList"
           :key="note.id"
           :class="{ active: currentNoteId === note.id }"
           @click="openNote(note)"
           @contextmenu.prevent="openCtx($event, note)">
        <div class="note-title">{{ note.title || '无标题' }}</div>
        <div class="note-content">{{ cleanContent(note.content) | cut }}</div>
        <div class="note-time">{{ fmt(note.update_time) }}</div>
      </div>

      <div class="empty" v-if="showList.length === 0">
        {{ tab === 'trash' ? '回收站为空' : '暂无笔记' }}
      </div>
    </div>

    <!-- 右侧编辑器 -->
    <div class="right-editor">
      <div class="editor-empty" v-if="!currentNoteId">
        <i class="el-icon-edit"></i>
        <p>选择笔记开始编辑</p>
      </div>

      <div v-else>
        <div class="editor-top">
          <div class="save-status" :class="{ ok: saved }">
            {{ saved ? '已保存' : '未保存' }}
          </div>
          <div class="top-btns">
            <el-button size="mini" type="text" @click="openMoveDialog">移动到</el-button>
            <el-button type="primary" size="mini" @click="manualSave">保存</el-button>
          </div>
        </div>

        <el-input class="editor-title" placeholder="请输入标题" v-model="form.title" />
        <mavon-editor v-model="form.content" class="md-editor" @change="onContentChange" />
      </div>
    </div>

    <!-- 右键菜单 -->
    <div class="ctx-menu" v-show="ctxShow" :style="{ left: ctxX + 'px', top: ctxY + 'px' }">
      <div v-if="tab === 'trash'" class="ctx-item" @click="recoverNote">恢复笔记</div>
      <div class="ctx-item" @click="openMoveDialog">移动到笔记本</div>
      <div class="ctx-item" @click="toTrash">
        {{ tab === 'trash' ? '永久删除' : '移入回收站' }}
      </div>
      <div class="ctx-item" @click="ctxShow = false">取消</div>
    </div>

    <!-- 移动笔记弹窗 -->
    <el-dialog title="移动到笔记本" :visible.sync="moveDialogVisible" width="360px">
      <el-radio-group v-model="moveTargetFolderId">
        <el-radio v-for="folder in folderList" :key="folder.id" :label="folder.id" border style="margin:6px 10px 6px 0">
          {{ folder.name }}
        </el-radio>
      </el-radio-group>
      <div slot="footer" class="dialog-footer">
        <el-button @click="moveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="doMoveNote">确定移动</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import {
  getNoteList, getNoteDetail, saveNote, deleteNote,
  getTrashList, recoverNote, destroyNote
} from '@/api/note'

export default {
  data() {
    return {
      tab: 'note',
      folderList: [
        { id: 1, name: '工作' },
        { id: 2, name: '学习' },
        { id: 3, name: '生活' }
      ],
      noteList: [],
      kw: '',
      currentFolderId: null,
      currentNoteId: null,
      form: { title: '', content: '', folder_id: null },
      saved: true,
      moveDialogVisible: false,
      moveTargetFolderId: null,
      moveNoteId: null,
      ctxShow: false, ctxX: 0, ctxY: 0, ctxNote: null
    }
  },
  created() {
    this.getList()
  },
  computed: {
    showList() {
      let arr = this.noteList
      // ✅ 真正根据数据库 folder_id 筛选分类
      if (this.tab === 'note' && this.currentFolderId) {
        arr = arr.filter(n => n.folder_id === this.currentFolderId)
      }
      if (this.kw) {
        const s = this.kw.toLowerCase()
        arr = arr.filter(i =>
          (i.title || '').toLowerCase().includes(s) ||
          (i.content || '').toLowerCase().includes(s)
        )
      }
      return arr
    }
  },
  filters: {
    cut(s) {
      if (!s) return ''
      return s.length > 30 ? s.slice(0, 30) + '…' : s
    }
  },
  methods: {
    fmt(t) { return dayjs(t).format('YYYY-MM-DD HH:mm') },
    cleanContent(s) {
      if (!s) return ''
      return s.replace(/#|\*|`|_|\n/g, '').trim()
    },
    async getList() {
      const res = await getNoteList()
      // ✅ 直接读取数据库 folder_id，不模拟111
      this.noteList = res.data || []
    },
    async switchTab(t) {
      this.tab = t
      this.currentFolderId = null
      this.currentNoteId = null
      if (t === 'trash') {
        const res = await getTrashList()
        this.noteList = res.data || []
      } else {
        this.getList()
      }
    },
    switchFolder(id) {
      // ✅ 点击分类 → 立刻筛选
      this.currentFolderId = id
      this.currentNoteId = null
    },
    addFolder() {
      this.$prompt('输入笔记本名称').then(({ value }) => {
        this.folderList.push({ id: Date.now(), name: value })
      })
    },
    async createNote() {
      // ✅ 新建笔记自动绑定当前分类
      await saveNote({
        title: '无标题',
        content: '# 开始记录',
        folder_id: this.currentFolderId
      })
      this.$message.success('新建成功')
      this.getList()
    },
    async openNote(note) {
      this.currentNoteId = note.id
      const res = await getNoteDetail(note.id)
      // ✅ 读取数据库 folder_id
      this.form = { ...res.data, folder_id: res.data.folder_id }
      this.saved = true
      this.ctxShow = false
    },
    onContentChange() { this.saved = false },
    async manualSave() {
      if (!this.currentNoteId) return
      // ✅ 保存时携带 folder_id
      await saveNote({ id: this.currentNoteId, ...this.form })
      this.saved = true
      this.$message.success('保存成功')
      this.getList()
    },
    openMoveDialog() {
      const note = this.ctxNote || { id: this.currentNoteId, folder_id: this.form.folder_id }
      this.moveNoteId = note.id
      this.moveTargetFolderId = note.folder_id
      this.moveDialogVisible = true
      this.ctxShow = false
    },
    async doMoveNote() {
      // ✅ 移动笔记 = 修改数据库 folder_id
      await saveNote({ id: this.moveNoteId, folder_id: this.moveTargetFolderId })
      this.moveDialogVisible = false
      this.$message.success('移动成功')
      this.getList()
    },
    openCtx(e, note) {
      this.ctxNote = note
      this.ctxShow = true
      this.ctxX = e.clientX
      this.ctxY = e.clientY
    },
    async toTrash() {
      if (this.tab === 'trash') {
        await destroyNote(this.ctxNote.id)
        this.$message.success('已永久删除')
      } else {
        await deleteNote(this.ctxNote.id)
        this.$message.success('已移入回收站')
      }
      this.getList()
      this.ctxShow = false
    },
    async recoverNote() {
      await recoverNote(this.ctxNote.id)
      this.$message.success('已恢复')
      this.getList()
      this.ctxShow = false
    }
  }
}
</script>

<style scoped>
.note-container {
  display: flex;
  height: 100vh;
  background: #f7fffa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.left-sidebar { width: 240px; background: #f5f7fa; border-right: 1px solid #e5e6eb; display: flex; flex-direction: column; }
.sidebar-header { padding: 20px; text-align: center; }
.logo { font-size: 18px; font-weight: 600; color: #e6322c; }
.menu-list { padding: 0 12px; }
.menu-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 6px; font-size: 14px; color: #4e5969; cursor: pointer; margin-bottom: 4px; }
.menu-item.active { background: #edeef0; color: #1d2129; font-weight: 500; }
.folder-section { margin-top: 20px; padding: 0 12px; }
.folder-title { display: flex; justify-content: space-between; padding: 8px 12px; font-size: 12px; color: #86909c; }
.folder-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; font-size: 14px; color: #4e5969; border-radius: 6px; cursor: pointer; }
.folder-item.active { background: #edeef0; color: #1d2129; font-weight: 500; }
.new-note-btn { margin: auto 20px 24px; height: 40px; background: #e6322c; color: #fff; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 14px; cursor: pointer; }
.middle-list { width: 360px; background: #fff; border-right: 1px solid #e5e6eb; overflow-y: auto; }
.search-bar { padding: 16px 20px; border-bottom: 1px solid #f2f3f5; }
.note-item { padding: 16px 20px; border-bottom: 1px solid #f2f3f5; cursor: pointer; }
.note-item:hover { background: #fafafa; }
.note-item.active { background: #f5f7fa; }
.note-title { font-size: 15px; font-weight: 500; color: #1d2129; margin-bottom: 4px; }
.note-content { font-size: 13px; color: #86909c; line-height: 1.4; margin-bottom: 6px; }
.note-time { font-size: 12px; color: #c9cdd4; }
.empty { text-align: center; padding: 60px 0; color: #c9cdd4; }
.right-editor { flex: 1; background: #fff; padding: 24px 40px; }
.editor-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #c9cdd4; }
.editor-empty i { font-size: 48px; margin-bottom: 12px; }
.editor-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.top-btns { display: flex; gap: 8px; }
.save-status { font-size: 12px; color: #86909c; }
.save-status.ok { color: #07c160; }
.editor-title { margin-bottom: 20px; }
.editor-title ::v-deep .el-input__inner { border: none; font-size: 26px; font-weight: 600; padding: 0; color: #1d2129; }
.md-editor { height: calc(100vh - 180px); border: none !important; }
.ctx-menu { position: fixed; width: 160px; background: #fff; box-shadow: 0 4px 16px rgba(0,0,0,0.1); border-radius: 8px; z-index: 9999; overflow: hidden; }
.ctx-item { padding: 12px 16px; font-size: 14px; cursor: pointer; }
.ctx-item:hover { background: #f5f7fa; }
.dialog-footer { text-align: right; }
</style>