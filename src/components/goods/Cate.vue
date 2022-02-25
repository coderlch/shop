<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator='/'>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card>
      <!--添加分类按钮区域-->
      <el-row>
        <el-col :span='24'>
          <el-button type='primary' @click='addCateDialog'>添加分类</el-button>
        </el-col>
      </el-row>
      <!--商品列表区域-->
      <zk-table
        class='treeTable'
        :show-index='true'
        index-text='#'
        :data='cateList'
        :columns='columns'
        :expand-type='false'
        :selection-type='false'
        border
        :show-row-hover='false'
      >
        <!--是否有效-->
        <template
          slot='isOk'
          scope='scope'
        >
          <i class='el-icon-success' v-if='scope.row.cat_deleted === false' style='color: lightgreen'></i>
          <i class='el-icon-error' v-else style='color: red'></i>
        </template>
        <!--排序-->
        <template slot='order' scope='scope'>
          <el-tag v-if='scope.row.cat_level === 0'>一级</el-tag>
          <el-tag type='success' v-else-if='scope.row.cat_level === 1'>二级</el-tag>
          <el-tag type='warning' v-else-if='scope.row.cat_level === 2'>三级</el-tag>
        </template>
        <!--操作-->
        <template slot='opt' scope='scope'>
          <el-button type='primary' icon='el-icon-edit' size='mini' @click='edit(scope.row.cat_id)'>编辑</el-button>
          <el-button type='danger' icon='el-icon-delete' size='mini' @click='deleteCate(scope.row.cat_id)'>删除
          </el-button>
        </template>
      </zk-table>
      <!--分页区域-->
      <el-pagination
        @size-change='handleSizeChange'
        @current-change='handleCurrentChange'
        :current-page='queryInfo.pagenum'
        :page-sizes='[5, 2, 4, 8]'
        :page-size='queryInfo.pagesize'
        layout='total, sizes, prev, pager, next, jumper'
        :total='total'>
      </el-pagination>
    </el-card>
    <!--添加分类对话框-->
    <el-dialog
      title='添加分类'
      :visible.sync='addCateDialogVisible'
      width='40%'
      @close='addCateDialogClosed'
    >
      <el-form :model='addCate' :rules='addCateRules' ref='addCateFormRef' label-width='100px'>
        <el-form-item label='分类名称：' prop='cat_name'>
          <el-input v-model='addCate.cat_name'></el-input>
        </el-form-item>
        <el-form-item label='父级分类：'>
          <el-cascader
            expand-trigger='hover'
            :value='selectKeys'
            :options='parentCateList'
            :props='cascaderProps'
            :clearable='true'
            :change-on-select='true'
            @change='parentCateChange'
          >
          </el-cascader>
        </el-form-item>

      </el-form>
      <span slot='footer' class='dialog-footer'>
    <el-button @click='addCateDialogVisible=false'>取 消</el-button>
    <el-button type='primary' @click='submitCate'>确 定</el-button>
  </span>
    </el-dialog>
    <!--编辑对话框-->
    <el-dialog
      title='修改分类'
      :visible.sync='editDialogVisible'
      width='40%'
      @close='editDialogClosed'
    >
      <el-form :model='editForm' :rules='editRules' ref='editFormRef' label-width='100px'>
        <el-form-item label='分类名称：' prop='cat_name'>
          <el-input v-model='editForm.cat_name'></el-input>
        </el-form-item>
      </el-form>
      <span slot='footer' class='dialog-footer'>
    <el-button @click='editDialogVisible = false'>取 消</el-button>
    <el-button type='primary' @click='editSubmit'>确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Cate',
  data() {
    return {
      // 查询参数
      queryInfo: {type: '', pagenum: 1, pagesize: 5},
      // 商品列表数据
      cateList: [],
      // 数据总条数
      total: 0,
      // 商品列表中列设置
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isOk'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      // 控制添加分类对话框
      addCateDialogVisible: false,
      // 控制编辑对话框
      editDialogVisible: false,
      // 添加分类的数据对象
      addCate: {cat_pid: 0, cat_name: '', cat_level: 0},
      // 父级分类数据列表
      parentCateList: [],
      // 父级分类数据的配置对象
      cascaderProps: {value: 'cat_id', label: 'cat_name', children: 'children'},
      // 添加分类的验证规则
      addCateRules: {
        cat_name: [
          {required: true, message: '请输入分类名称', trigger: 'blur'}
        ]
      },
      // 分类数据绑定
      selectKeys: [],
      // 编辑表单数据
      editForm: {cat_name: '', cat_id: ''},
      // 编辑表单数据的验证规则
      editRules: {
        cat_name: {required: true, message: '请输入分类名称', trigger: 'blur'}
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品列表数据
    async getCateList() {
      const {data: res} = await this.$http.get(`categories`, {params: this.queryInfo})
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 监听pageSize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pageNum改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 添加分类事件
    async addCateDialog() {
      const {data: res} = await this.$http.get(`categories`, {params: {type: 2, pagenum: '', pagesize: ''}})
      if (res.meta.status !== 200) {
        return this.$message.error('获取失败')
      }
      this.parentCateList = res.data
      this.addCateDialogVisible = true
    },
    // 选中分类改变事件
    parentCateChange(value) {
      this.selectKeys = value
      if (this.selectKeys.length > 0) {
        this.addCate.cat_pid = this.selectKeys[this.selectKeys.length - 1]
        this.addCate.cat_level = this.selectKeys.length
      } else {
        this.addCate.cat_pid = 0
        this.addCate.cat_level = 0
      }
    },
    // 提交分类表单
    submitCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('数据有误')
        }
        const {data: res} = await this.$http.post(`categories`, this.addCate)
        if (res.meta.status !== 201) {
          return this.$message.error('分类添加失败')
        }
        this.$message.success('分类添加成功')
        this.addCateDialogVisible = false
        await this.getCateList()
      })
    },
    // 监听关闭添加分类对话框
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectKeys = []
      this.addCate.cat_name = ''
      this.addCate.cat_pid = 0
      this.addCate.cat_level = 0
    },
    // 编辑按钮事件
    async edit(id) {
      const {data: res} = await this.$http.get(`categories/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败')
      }
      this.editForm.cat_name = res.data.cat_name
      this.editForm.cat_id = res.data.cat_id
      this.editDialogVisible = true
    },
    // 编辑提交事件
    editSubmit() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('验证不通过')
        }
        const {data: res} = await this.$http.put(`categories/${this.editForm.cat_id}`, {cat_name: this.editForm.cat_name})
        if (res.meta.status !== 200) {
          return this.$message.error('更新失败')
        }
        this.$message.success('更新成功')
        await this.getCateList()
        this.editDialogVisible = false
      })
    },
    // 监听编辑对话框关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
      this.editForm.cat_id = ''
      this.editForm.cat_name = ''
    },
    // 删除分类
    async deleteCate(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
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
        return this.$message.error('删除失败')
      }
      const {data: res} = await this.$http.delete(`categories/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      await this.getCateList()
    }
  }
}
</script>

<style lang='less' scoped>
.treeTable {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>
