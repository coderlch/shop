<template>
  <div>
    <!--    面包屑导航区域-->
    <el-breadcrumb separator='/'>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href='#'>权限管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card>
      <!--添加角色按钮-->
      <el-row>
        <el-col>
          <el-button type='primary' @click='rolesDialogVisible=true'>添加角色</el-button>
        </el-col>
      </el-row>
      <el-table
        :data='rolesList'
        border
        stripe
      >
        <!--展开列-->
        <el-table-column type='expand'>
          <template #default='scope'>
            <el-row :class='["center","bdbottom",i1 === 0 ? "bdtop":""]' v-for='(item1,i1) in scope.row.children'
                    :key='item1.id'>
              <!--一级权限-->
              <el-col :span='5'>
                <el-tag
                  closable
                  @close='removeRight(scope.row, item1.id)'
                >{{ item1.authName }}
                </el-tag>
                <i class='el-icon-caret-right'></i>
              </el-col>
              <!--二、三级权限-->
              <el-col :span='19'>
                <el-row :class='["center",i2 === 0 ? "":"bdtop"]' v-for='(item2,i2) in item1.children' :key='item2.id'>
                  <!--二级权限-->
                  <el-col :span='6'>
                    <el-tag type='success'
                            closable
                            @close='removeRight(scope.row, item2.id)'
                    >{{ item2.authName }}
                    </el-tag>
                    <i class='el-icon-caret-right'></i>
                  </el-col>
                  <!--三级权限-->
                  <el-col :span='18'>
                    <el-tag type='warning' v-for='(item3) in item2.children' :key='item3.id'
                            closable
                            @close='removeRight(scope.row, item3.id)'
                    >{{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type='index'></el-table-column>
        <el-table-column label='角色名称' prop='roleName'></el-table-column>
        <el-table-column label='角色描述' prop='roleDesc'></el-table-column>
        <el-table-column label='操作' width='300px'>
          <template #default='scope'>
            <el-button type='primary' icon='el-icon-edit' size='mini'>编辑</el-button>
            <el-button type='danger' icon='el-icon-delete' size='mini' @click='deleteRole(scope.row.id)'>删除</el-button>
            <el-button type='warning' icon='el-icon-setting' size='mini' @click='showRightsDialog(scope.row)'>分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!--添加角色对话框-->
    <el-dialog
      title='添加角色'
      :visible.sync='rolesDialogVisible'
      width='30%'
      @close='rolesFormClosed'
    >
      <el-form :model='rolesForm' :rules='rolesRule' ref='rolesFormRef' label-width='100px'>
        <el-form-item label='角色名称' prop='roleName'>
          <el-input v-model='rolesForm.roleName'></el-input>
        </el-form-item>
        <el-form-item label='角色描述' prop='roleDesc'>
          <el-input v-model='rolesForm.roleDesc'></el-input>
        </el-form-item>
      </el-form>
      <span slot='footer' class='dialog-footer'>
    <el-button @click='rolesDialogVisible = false'>取 消</el-button>
    <el-button type='primary' @click='addRoles'>确 定</el-button>
  </span>
    </el-dialog>
    <!--权限分配对话框-->
    <el-dialog
      title='权限分配'
      :visible.sync='rightsDialogVisible'
      width='50%'
      @close='rightsDialogClosed'
    >
      <el-tree ref='treeRef' :data='rightsList' :props='treeProps' show-checkbox default-expand-all node-key='id'
               :default-checked-keys='havedRights'></el-tree>
      <span slot='footer' class='dialog-footer'>
    <el-button @click='rightsDialogVisible=false'>取 消</el-button>
    <el-button type='primary' @click='setRights'>确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data() {
    return {
      rolesList: [],
      // 控制角色对话框
      rolesDialogVisible: false,
      // 控制权限分配对话框
      rightsDialogVisible: false,
      // 角色表单数据
      rolesForm: {
        roleName: '',
        roleDesc: ''
      },
      // 角色表单数据验证规则
      rolesRule: {
        roleName: [
          {
            required: true,
            message: '请输入角色名',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 10,
            message: '请输入角色名在3到10个字符之间',
            trigger: 'blur'
          }
        ]
      },
      // 权限列表数据
      rightsList: [],
      // 树形控件展示
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 角色已有权限
      havedRights: [],
      // 获取当前角色的的id
      rightId: 0
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取角色列表
    async getRolesList() {
      const {data: res} = await this.$http.get(`roles`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
    },
    // 监听添加角色对话框关闭
    rolesFormClosed() {
      this.$refs.rolesFormRef.resetFields()
    },
    // 添加角色
    addRoles() {
      // 提交前的表单验证
      this.$refs.rolesFormRef.validate(async valid => {
        if (!valid) {
          return 0
        }
        const {data: res} = await this.$http.post(`roles`, this.rolesForm)
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        }
        this.rolesDialogVisible = false
        await this.getRolesList()
        this.$message.success('添加角色成功')
      })
    },
    // 删除角色
    async deleteRole(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
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
        return this.$message.error('删除角色失败')
      }
      const {data: res} = await this.$http.delete(`roles/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('角色删除失败')
      }
      await this.getRolesList()
      this.$message.success('角色删除成功')
    },
    // 删除角色对应的权限
    async removeRight(role, itemId) {
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('权限删除失败')
      }
      const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${itemId}`)
      if (res.meta.status !== 200) {
        return this.$message.info('取消权限失败')
      }
      this.$message.success('取消权限成功')
      role.children = res.data
    },
    // 权限分配设置
    async showRightsDialog(role) {
      this.rightId = role.id
      const {data: res} = await this.$http.get(`rights/tree`)
      if (res.meta.status !== 200) {
        return this.$message.error('权限列表获取失败')
      }
      this.rightsList = res.data
      this.getRights(role, this.havedRights)
      this.rightsDialogVisible = true
    },
    // 提交角色的权限设置
    async setRights() {
      const allRights = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const idStr = allRights.join(',')
      const {data: res} = await this.$http.post(`roles/${this.rightId}/rights`, {rids: idStr})
      if (res.meta.status !== 200) {
        return this.$message.error('权限更新失败')
      }
      this.$message.success('权限更新成功')
      await this.getRolesList()
      this.rightsDialogVisible = false
    },
    // 使用递归函数获取角色权限已拥有的权限
    getRights(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getRights(item, arr))
    },
    // 监听权限分配对话框关闭事件
    rightsDialogClosed() {
      this.havedRights = []
    }
  }
}
</script>

<style lang='less' scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.center {
  display: flex;
  align-items: center;
}
</style>
