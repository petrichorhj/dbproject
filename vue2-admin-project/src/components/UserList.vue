<template>
  <div class="user-list-container" style="padding: 20px;">
    <el-card shadow="hover">
      <!-- 搜索和新增区域 -->
      <div class="search-bar" style="margin-bottom: 20px;">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="用户名">
            <el-input
              v-model="searchForm.username"
              placeholder="请输入用户名"
              clearable
              style="width: 200px;"
            ></el-input>
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 150px;"
            >
              <el-option label="启用" :value="1"></el-option>
              <el-option label="禁用" :value="0"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getUserList()">查询</el-button>
            <el-button @click="resetSearch()">重置</el-button>
            <el-button type="success" @click="openAddDialog()">新增</el-button>
            <el-button type="danger" icon="el-icon-delete" @click="batchDelete" :disabled="!selectedIds.length">
              批量删除
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 用户列表 -->
      <el-table
        :data="userList"
        border
        stripe
        v-loading="loading"
        style="width: 100%;"
        @selection-change="handleSelectionChange"
      >
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="username" label="用户名" width="150"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template v-slot="{ row }">
            <el-tag :type="row.status == 1 ? 'success' : 'danger'">
              {{ row.status == 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间"></el-table-column>
        <el-table-column label="操作" width="180">
          <template v-slot="{ row }">
            <el-button type="text" @click="openEditDialog(row)">编辑</el-button>
            <el-button type="text" danger @click="deleteUser(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.pageNum"
        :page-sizes="[10, 20, 50]"
        :page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        style="margin-top: 20px; text-align: right;"
      >
      </el-pagination>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      :title="dialogTitle"
      :visible="dialogVisible"
      width="500px"
      @close="resetForm()"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="启用" value="1"></el-option>
            <el-option label="禁用" value="0"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm()">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getUserList, addUser, editUser, deleteUser } from '@/api/user'

export default {
  name: 'UserList',
  data() {
    return {
      loading: false,
      userList: [],
      searchForm: {
        username: '',
        status: ''
      },
      pagination: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      dialogVisible: false,
      dialogTitle: '新增用户',
      // 新增：选中的用户ID
      selectedIds: [],
      form: {
        id: '',
        username: '',
        status: '1'
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      this.loading = true
      try {
        const params = {
          ...this.searchForm,
          pageNum: this.pagination.pageNum,
          pageSize: this.pagination.pageSize
        }
        const res = await getUserList(params)
        if (res.code === 200) {
          this.userList = res.data.list
          this.pagination.total = res.data.total
        }
      } catch (error) {
        console.error('获取用户列表失败：', error)
        this.$message.error('获取列表失败，请重试')
      } finally {
        this.loading = false
      }
    },
    resetSearch() {
      this.searchForm = {
        username: '',
        status: ''
      }
      this.pagination.pageNum = 1
      this.getUserList()
    },
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.getUserList()
    },
    handleCurrentChange(val) {
      this.pagination.pageNum = val
      this.getUserList()
    },
    openAddDialog() {
      this.dialogTitle = '新增用户'
      this.resetForm()
      this.dialogVisible = true
    },
    openEditDialog(row) {
      this.dialogTitle = '编辑用户'
      this.form = { ...row }
      this.dialogVisible = true
    }, 
    // 新增：多选框选中事件
    handleSelectionChange(val) {
      this.selectedIds = val.map(item => item.id)
    },
    // 新增：批量删除
    batchDelete() {
      this.$confirm('确定要删除选中的用户吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // 模拟批量删除接口请求
        await new Promise(resolve => setTimeout(resolve, 500))
        this.$message.success('批量删除成功！')
        this.getUserList()
        this.selectedIds = []
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    resetForm() {
      this.form = {
        id: '',
        username: '',
        status: '1'
      }
      if (this.$refs.formRef) {
        this.$refs.formRef.resetFields()
      }
    },
    async submitForm() {
      try {
        await this.$refs.formRef.validate()
        if (this.form.id) {
          const res = await editUser(this.form)
          if (res.code === 200) {
            this.$message.success('编辑用户成功！')
          }
        } else {
          const res = await addUser(this.form)
          if (res.code === 200) {
            this.$message.success('新增用户成功！')
          }
        }
        this.dialogVisible = false
        this.getUserList()
      } catch (error) {
        console.error('提交表单失败：', error)
        this.$message.error('操作失败，请重试')
      }
    },
    async deleteUser(id) {
      try {
        await this.$confirm('此操作将永久删除该用户，是否继续？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const res = await deleteUser({ id })
        if (res.code === 200) {
          this.$message.success('删除用户成功！')
          this.getUserList()
        }
      } catch (error) {
        this.$message.info('已取消删除')
      }
    }
  }
}
</script>

<style scoped>
.user-list-container {
  background: #f5f5f5;
  min-height: 100vh;
}
</style>