<template>
  <div>
    <el-breadcrumb separator='/'>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href='#'>用户管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class='box-card'>
      <!--搜索添加-->
      <el-row :gutter='20'>
        <el-col :span='6'>
          <el-input placeholder='请输入内容' v-model='queryInfo.query' clearable @clear='getUserList'>
            <el-button slot='append' icon='el-icon-search' @click='getUserList'></el-button>
          </el-input>
        </el-col>
        <el-col :span='6'>
          <el-button type='primary' @click='addDialogVisible=true'>添加用户</el-button>
        </el-col>
      </el-row>
      <!--用户列表区域-->
      <el-table
        :data='usersList'
        border
        stripe
      >
        <el-table-column type='index'></el-table-column>
        <el-table-column label='姓名' prop='username'></el-table-column>
        <el-table-column label='邮箱' prop='email'></el-table-column>
        <el-table-column label='电话' prop='mobile'></el-table-column>
        <el-table-column label='角色' prop='role_name'></el-table-column>
        <el-table-column label='状态'>
          <template slot-scope='scope'>
            <el-switch v-model='scope.row.mg_state' @change='userStateChanged(scope.row)'></el-switch>
          </template>
        </el-table-column>
        <el-table-column label='操作' width='180px'>
          <template #default='scope'>
            <el-button type='primary' icon='el-icon-edit' size='mini' @click='editUser(scope.row.id)'></el-button>
            <el-button type='danger' icon='el-icon-delete' size='mini' @click='deleteUser(scope.row.id)'></el-button>
            <el-tooltip class='item' effect='dark' content='分配角色' placement='top' :enterable='false'>
              <el-button type='warning' icon='el-icon-setting' size='mini'></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination
        @size-change='handleSizeChange'
        @current-change='handleCurrentChange'
        :current-page='queryInfo.pagenum'
        :page-sizes='[1, 2, 4, 8]'
        :page-size='queryInfo.pagesize'
        layout='total, sizes, prev, pager, next, jumper'
        :total='total'>
      </el-pagination>
    </el-card>
    <!--添加用户对话框-->
    <el-dialog
      title='添加用户'
      :visible.sync='addDialogVisible'
      width='40%'
      @close='addFormClosed'
    >
      <el-form :model='addForm' :rules='addRules' ref='addFormRef' label-width='100px'>
        <el-form-item label='用户名称' prop='username'>
          <el-input v-model='addForm.username'></el-input>
        </el-form-item>
        <el-form-item label='用户密码' prop='password'>
          <el-input v-model='addForm.password'></el-input>
        </el-form-item>
        <el-form-item label='用户邮箱' prop='email'>
          <el-input v-model='addForm.email'></el-input>
        </el-form-item>
        <el-form-item label='用户电话' prop='mobile'>
          <el-input v-model='addForm.mobile'></el-input>
        </el-form-item>
      </el-form>
      <span slot='footer' class='dialog-footer'>
    <el-button @click='addDialogVisible = false'>取 消</el-button>
    <el-button type='primary' @click='addUser'>确 定</el-button>
  </span>
    </el-dialog>
    <!--编辑用户对话框-->
    <el-dialog
      title='修改用户信息'
      :visible.sync='editDialogVisible'
      width='40%'
      @close='editDialogClosed'
    >
      <el-form :model='editForm' :rules='editRules' ref='editFormRef' label-width='100px'>
        <el-form-item label='用户名' prop='name'>
          <el-input v-model='editForm.username' disabled></el-input>
        </el-form-item>
        <el-form-item label='邮箱' prop='email'>
          <el-input v-model='editForm.email'></el-input>
        </el-form-item>
        <el-form-item label='手机' prop='mobile'>
          <el-input v-model='editForm.mobile'></el-input>
        </el-form-item>
      </el-form>
      <span slot='footer' class='dialog-footer'>
    <el-button @click='editDialogVisible = false'>取 消</el-button>
    <el-button type='primary' @click='editUserInfo'>确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Users',
  data() {
    let checkEmail = (rule, value, callback) => {
      const emailRule = /^[_a-z0-9_-]+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (emailRule.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的邮箱'))
    }
    let checkPhone = (rule, value, callback) => {
      const phoneRule = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (phoneRule.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的手机号码'))
    }
    return {
      // 用户列表
      usersList: [],
      // 用户列表总条数
      total: 0,
      // 查询数据
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      // 控制用户添加对话框
      addDialogVisible: false,
      // 控制编辑用户对话框
      editDialogVisible: false,
      // 添加用户表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 编辑用户表单数据
      editForm: {},
      // 对添加用户的表单数据进行验证
      addRules: {
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '用户名在3到10个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入用户密码',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '用户密码在3到10个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          {
            required: true,
            message: '请输入用户邮箱',
            trigger: 'blur'
          },
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入用户电话号码',
            trigger: 'blur'
          },
          {
            validator: checkPhone,
            trigger: 'blur'
          }
        ]
      },
      editRules: {
        email: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {validator: checkEmail, trigger: 'blur'}
        ],
        mobile: [
          {required: true, message: '请输入电话号码', trigger: 'blur'},
          {validator: checkPhone, trigger: 'blur'}

        ]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    // 获取用户列表数据
    async getUserList() {
      const {data: res} = await this.$http.get('users', {params: this.queryInfo})
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.usersList = res.data.users
      this.total = res.data.total
    },
    // 选择单页显示的数据条数
    handleSizeChange(pageSize) {
      this.queryInfo.pagesize = pageSize
      this.getUserList()
    },
    // 当前页面数
    handleCurrentChange(pageNum) {
      this.queryInfo.pagenum = pageNum
      this.getUserList()
    },
    // 监听用户状态的改变
    async userStateChanged(userInfo) {
      const {data: res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('用户状态更新失败')
      }
      this.$message.success('用户状态更新成功')
    },
    // 监听添加用户对话框关闭
    addFormClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 提交添加用户对话框的表单数据
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return 0
        }
        const {data: res} = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('用户添加失败')
        }
        this.$message.success('用户添加成功')
        this.dialogVisible = false
      })
      this.getUserList()
    },
    // 查询编辑用户的信息
    async editUser(id) {
      const {data: res} = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户信息失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听编辑用户对话框关闭
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 提交编辑用户信息
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return 0
        }
        const {data: res} = await this.$http.put(`users/${this.editForm.id}`, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (res.meta.status !== 200) {
          return this.$message.error('用户信息更新失败')
        }
        this.editDialogVisible = false
        await this.getUserList()
        this.$message.success('用户信息更新成功')
      })
    },
    // 删除用户信息
    async deleteUser(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
      if (confirmResult !== 'confirm') {
        return this.$message.info('删除用户失败')
      }
      const {data: res} = await this.$http.delete(`users/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }
      this.$message.success('删除用户成功')
      await this.getUserList()
    }
  }
}
</script>

<style lang='less' scoped>

</style>
