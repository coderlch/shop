<template>
  <div>
    <!--    面包屑导航区域-->
    <el-breadcrumb separator='/'>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href='#'>权限管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--    卡片试图-->
    <el-card>
      <!--      权限列表区域-->
      <el-table
        :data='rightsList'
        border
        stripe
      >
        <el-table-column type='index'></el-table-column>
        <el-table-column label='权限名称' prop='authName'></el-table-column>
        <el-table-column label='路径' prop='path'></el-table-column>
        <el-table-column label='权限等级' prop='level'>
          <template #default='scope'>
            <el-tag v-if='scope.row.level==="0"'>一级</el-tag>
            <el-tag type='success' v-else-if='scope.row.level==="1"'>二级</el-tag>
            <el-tag type='info' v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>

    </el-card>

  </div>
</template>

<script>
export default {
  name: 'Rights',
  data() {
    return {
      // 权限列表
      rightsList: []
    }
  },
  created() {
    this.getRightsList()
  },
  methods: {
    // 获取权限列表数据
    async getRightsList() {
      const {data: res} = await this.$http.get(`rights/list`)
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('权限列表获取失败')
      }
      this.rightsList = res.data
    }
  }
}
</script>

<style lang='less' scoped>

</style>
