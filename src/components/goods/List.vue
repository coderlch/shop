<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator='/'>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card>
      <!--搜索框和添加商品按钮-->
      <el-row>
        <!--搜索框-->
        <el-col :span='6'>
          <el-input placeholder='请输入内容' v-model='queryInfo.query' clearable @clear='getGoodsList'>
            <el-button slot='append' icon='el-icon-search' @click='getGoodsList'></el-button>
          </el-input>
        </el-col>
        <!--添加商品按钮-->
        <el-col :span='6'>
          <el-button class='btnAddGoods' type='primary' @click='addGoods'>添加商品</el-button>
        </el-col>
      </el-row>
      <!--商品列表区域-->
      <el-table :data='goodsList' border stripe>
        <el-table-column type='index'></el-table-column>
        <el-table-column label='商品名称' prop='goods_name' width='600px'></el-table-column>
        <el-table-column label='商品价格（元）' prop='goods_price' width='80px'></el-table-column>
        <el-table-column label='商品重量' prop='goods_weight' width='80'></el-table-column>
        <el-table-column label='创建时间' prop='add_time' width='150px'>
          <template #default='scope'>
            {{scope.row.add_time | dataFormat}}
          </template>
        </el-table-column>
        <el-table-column label='操作'>
          <template #default='scope'>
            <el-button type='primary' icon='el-icon-edit' size='mini'>编辑</el-button>
            <el-button type='danger' icon='el-icon-delete' size='mini' @click='delGoods(scope.row.goods_id)'>删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination
        @size-change='handleSizeChange'
        @current-change='handleCurrentChange'
        :current-page='queryInfo.pagenum'
        :page-sizes='[1, 4, 8, 16]'
        :page-size='queryInfo.pagesize'
        layout='total, sizes, prev, pager, next, jumper'
        :total=total>
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'List',
  data() {
    return {
      // 查询参数
      queryInfo: {query: '', pagenum: 1, pagesize: 4},
      // 商品列表总条数
      total: 0,
      // 商品列表数据
      goodsList: []
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表事件
    async getGoodsList() {
      const {data: res} = await this.$http.get(`goods`, {params: this.queryInfo})
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // 监听pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 监听pagenum改变
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getGoodsList()
    },
    // 删除商品事件
    async delGoods(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return null
      }
      const {data: res} = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除商品失败')
      }
      this.$message.success('删除商品成功')
      await this.getGoodsList()
    },
    // 添加商品
    addGoods() {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang='less' scoped>
.btnAddGoods {
  margin-left: 30px;
}
</style>
