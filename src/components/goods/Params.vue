<template>
  <div>
    <!--    面包屑导航区域-->
    <el-breadcrumb separator='/'>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card>
      <!--警示条-->
      <el-alert
        title='注意：只允许第三级分类设置相关参数'
        type='warning'
        :closable='false'
        show-icon
      >
      </el-alert>
      <!--选择商品分类区域-->
      <el-row class='cat_opt'>
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            expand-trigger='hover'
            v-model='selectKeys'
            :options='cateList'
            :props='cateProps'
            @change='handleChange'></el-cascader>
        </el-col>
      </el-row>
      <!--tabs页签区域-->
      <el-tabs v-model='activeTabsName' @tab-click='handleTabsClick'>
        <el-tab-pane label='动态参数' name='many'>
          <el-button type='primary' size='mini' :disabled='isBtnDisabled' @click='addDialogVisible=true'>添加参数
          </el-button>
          <!--动态表格数据-->
          <el-table :data='manyTabsData' border stripe>
            <el-table-column type='expand'>
              <template #default='scope'>
                <el-tag closable v-for='(item, i) in scope.row.attr_vals' :key='i' @close='removeTag(i, scope.row)'>
                  {{ item }}
                </el-tag>
                <!--标签添加按钮-->
                <el-input
                  class='input-new-tag'
                  v-if='scope.row.inputVisible'
                  v-model='scope.row.inputValue'
                  ref='saveTagInput'
                  size='small'
                  @keyup.enter.native='handleInputConfirm(scope.row)'
                  @blur='handleInputConfirm(scope.row)'
                >
                </el-input>
                <el-button v-else class='button-new-tag' size='small' @click='showInput(scope.row)'>+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type='index'></el-table-column>
            <el-table-column prop='attr_name' label='参数名称'></el-table-column>
            <el-table-column label='操作'>
              <template #default='scope'>
                <el-button type='primary' size='mini' icon='el-icon-edit' @click='edit(scope.row.attr_id)'>编辑
                </el-button>
                <el-button type='danger' size='mini' icon='el-icon-delete' @click='remove(scope.row.attr_id)'>删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label='静态属性' name='only'>
          <el-button type='primary' size='mini' :disabled='isBtnDisabled' @click='addDialogVisible=true'>添加属性
          </el-button>
          <!--静态表格数据-->
          <el-table :data='onlyTabsData' border stripe>
            <el-table-column type='expand'>
              <template #default='scope'>
                <el-tag closable v-for='(item, i) in scope.row.attr_vals' :key='i' @close='removeTag(i, scope.row)'>
                  {{ item }}
                </el-tag>
                <!--标签添加按钮-->
                <el-input
                  class='input-new-tag'
                  v-if='scope.row.inputVisible'
                  v-model='scope.row.inputValue'
                  ref='saveTagInput'
                  size='small'
                  @keyup.enter.native='handleInputConfirm(scope.row)'
                  @blur='handleInputConfirm(scope.row)'
                >
                </el-input>
                <el-button v-else class='button-new-tag' size='small' @click='showInput(scope.row)'>+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type='index'></el-table-column>
            <el-table-column prop='attr_name' label='属性名称'></el-table-column>
            <el-table-column label='操作'>
              <template #default='scope'>
                <el-button type='primary' size='mini' icon='el-icon-edit' @click='edit(scope.row.attr_id)'>编辑
                </el-button>
                <el-button type='danger' size='mini' icon='el-icon-delete' @click='remove(scope.row.attr_id)'>删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!--添加参数对话框-->
    <el-dialog
      :title='"提示：添加"+titleText'
      :visible.sync='addDialogVisible'
      width='40%'
      @close='addDialogClosed'
    >
      <el-form :model='addForm' :rules='addRules' ref='addFormRef' label-width='100px'>
        <el-form-item :label='titleText' prop='attr_name'>
          <el-input v-model='addForm.attr_name'></el-input>
        </el-form-item>
      </el-form>
      <span slot='footer' class='dialog-footer'>
    <el-button @click='addDialogVisible = false'>取 消</el-button>
    <el-button type='primary' @click='addParams'>确 定</el-button>
  </span>
    </el-dialog>
    <!--添加编辑对话框-->
    <el-dialog
      :title='"提示：修改"+titleText'
      :visible.sync='editDialogVisible'
      width='40%'
      @close='editDialogClosed'
    >
      <el-form :model='editForm' :rules='editRules' ref='editFormRef' label-width='100px'>
        <el-form-item :label='titleText' prop='attr_name'>
          <el-input v-model='editForm.attr_name'></el-input>
        </el-form-item>
      </el-form>
      <span slot='footer' class='dialog-footer'>
    <el-button @click='editDialogVisible = false'>取 消</el-button>
    <el-button type='primary' @click='editParams'>确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Params',
  data() {
    return {
      // 商品分类列表
      cateList: [],
      // 商品分类配置
      cateProps: {value: 'cat_id', label: 'cat_name', children: 'children'},
      // 选择的商品分类id
      selectKeys: [],
      // tabs标签激活
      activeTabsName: 'many',
      // tabs静态数据
      onlyTabsData: [],
      // tabs动态数据
      manyTabsData: [],
      // 控制添加参数对话框
      addDialogVisible: false,
      // 添加表单数据
      addForm: {attr_name: ''},
      // 表单数据验证对象
      addRules: {
        attr_name: [
          {required: true, message: '请输入参数', trigger: 'blur'}
        ]
      },
      // 控制编辑对话框显示和隐藏
      editDialogVisible: false,
      // 编辑对话框的数据对象
      editForm: {attr_name: ''},
      // 验证编辑对话框中的数据规则
      editRules: {
        attr_name: [
          {required: true, message: '请输入参数', trigger: 'blur'}
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    // 计算selectKeys是否选择三级商品分类以控制添加属性参数按钮
    isBtnDisabled() {
      if (this.selectKeys.length !== 3) {
        return true
      }
      return false
    },
    // 获取选择商品分类的第三级id
    cateId() {
      if (this.selectKeys.length === 3) {
        return this.selectKeys[2]
      }
      return null
    },
    // 动态显示添加提示信息
    titleText() {
      if (this.activeTabsName === 'only') {
        return '静态属性'
      }
      return '动态参数'
    }
  },
  methods: {
    // 获取商品分类列表
    async getCateList() {
      const {data: res} = await this.$http.get(`categories`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      this.cateList = res.data
      // console.log(res)
    },
    // 选择商品分类的改变事件
    handleChange() {
      this.getParamsDate()
    },
    // tabs切换事件
    handleTabsClick() {
      this.getParamsDate()
    },
    // 获取商品参数方法
    async getParamsDate() {
      if (this.selectKeys.length !== 3) {
        this.selectKeys = []
        this.manyTabsData = []
        this.onlyTabsData = []
        return 0
      }
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: {sel: this.activeTabsName}
      })
      // console.log(res.data)
      if (res.meta.status !== 200) {
        return this.$message.error('获取失败')
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputValue = ''
        item.inputVisible = false
      })
      if (this.activeTabsName === 'only') {
        this.onlyTabsData = res.data
      }
      if (this.activeTabsName === 'many') {
        this.manyTabsData = res.data
      }
    },
    // 点击添加按钮事件
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('验证不通过')
        }
        const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeTabsName
        })
        if (res.meta.status !== 201) {
          return this.$message.error('创建失败')
        }
        this.$message.success('创建成功')
        await this.getParamsDate()
        this.addDialogVisible = false
      })
    },
    // 监听添加参数对话框的关闭
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 编辑事件
    async edit(attrId) {
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, {
        params: {
          attr_sel: this.activeTabsName
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取失败')
      }
      this.$message.success('获取成功成功')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听编辑对话框关闭
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 编辑对话框的提交按钮事件
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('数据验证不通过')
        }
        const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.editForm.attr_sel
        })
        if (res.meta.status !== 200) {
          return this.$message.error('更新失败')
        }
        this.$message.success('更新成功')
        await this.getParamsDate()
        this.editDialogVisible = false
      })
    },
    // 删除操作
    async remove(attrId) {
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.error('删除失败')
      }
      const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      await this.getParamsDate()
    },
    // 标签输入框事件
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return 0
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      await this.saveAttrvals(row)
    },
    // 保存标签数据
    async saveAttrvals(row) {
      const {data: res} = await this.$http.put(`categories/${row.cat_id}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('更新失败')
      }
      this.$message.success('更新成功')
    },
    // 控制标签按钮切换并自动获得焦点
    showInput(row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除标签操作
    removeTag(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrvals(row)
    }
  }
}
</script>

<style lang='less' scoped>
.cat_opt {
  margin: 15px 0;
}

.el-tag {
  margin: 10px 10px;
}

.input-new-tag {
  width: 120px;
}

</style>
