<template>
  <div>
    <!--面包屑区域-->
    <el-breadcrumb separator='/'>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card>
      <!--搜索框-->
      <el-row>
        <el-col :span='10'>
          <el-input placeholder='请输入内容'>
            <el-button slot='append' icon='el-icon-search'></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!--订单列表-->
      <el-table :data='orderList' border stripe>
        <el-table-column type='index'></el-table-column>
        <el-table-column label='订单编号' prop='order_number' width='400px'></el-table-column>
        <el-table-column label='订单价格' prop='order_price' width='80px'></el-table-column>
        <el-table-column label='是否付款' prop='pay_status' width='80px'>
          <template #default='scope'>
            <el-tag type='success' v-if='scope.row.pay_status === "1"'>已付款</el-tag>
            <el-tag type='danger' v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label='是否发货' prop='is_send' width='80px'></el-table-column>
        <el-table-column label='下单时间' prop='create_time' width='150px'>
          <template #default='scope'>{{ scope.row.create_time | dataFormat }}</template>
        </el-table-column>
        <el-table-column label='操作'>
          <template #default='scope'>
            <el-button type='primary' icon='el-icon-edit' @click='edit' size='mini'>修改地址</el-button>
            <el-button type='success' icon='el-icon-location' @click='showProcessBox' size='mini'>查看物流信息</el-button>
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
    <!--编辑对话框-->
    <el-dialog
      title='修改地址'
      :visible.sync='editDialogVisible'
      width='40%'
      @close='closedEditDialog'
    >
      <el-form :model='editForm' :rules='editRules' ref='editFormRef' label-width='100px'>
        <el-form-item label='选择省市区' prop='address1'>
          <el-cascader
            expand-trigger='hover'
            v-model='editForm.address1'
            :options='citydata'
            :props='cascaderProps'
            @change='handleChange'></el-cascader>
        </el-form-item>
        <el-form-item label='详细地址' prop='address2'>
          <el-input v-model='editForm.address2'></el-input>
        </el-form-item>
      </el-form>
      <span slot='footer' class='dialog-footer'>
    <el-button @click='editDialogVisible = false'>取 消</el-button>
    <el-button type='primary' @click='editDialogVisible = false'>确 定</el-button>
  </span>
    </el-dialog>
    <!--查看物流信息对话框-->
    <el-dialog
      title="物流信息"
      :visible.sync="processDialogVisible"
      width="50%"
      >
      <span>这是一段信息</span>
    </el-dialog>
  </div>
</template>

<script>
import citydata from '@/components/order/citydata.js'

export default {
  name: 'Order',
  data() {
    return {
      // 查询参数
      queryInfo: {
        pagenum: 1,
        pagesize: 4
      },
      // 订单列表数据
      orderList: [],
      // 订单总条数
      total: 0,
      // 控制编辑对话框显示与隐藏
      editDialogVisible: false,
      // 编辑表单数据
      editForm: {
        address1: [],
        address2: ''
      },
      // 编辑表单验证数据规则
      editRules: {
        address1: [
          {required: true, message: '请选择省市区', trigger: 'blur'}
        ],
        address2: [
          {required: true, message: '请输入详细地址', trigger: 'blur'}
        ]
      },
      // 中国省市区数据
      citydata,
      // 级联选择器配置
      cascaderProps: {},
      // 控制物流信息对话框
      processDialogVisible: false
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    // 获取订单列表函数
    async getOrderList() {
      const {data: res} = await this.$http.get(`orders`, {params: this.queryInfo})
      if (res.meta.status !== 200) {
        return this.$message.error('订单列表获取失败')
      }
      // console.log(res)
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    // 监听分页中选择页面显示条数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 监听当前分页中的当前页
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getOrderList()
    },
    // 编辑事件
    edit() {
      this.editDialogVisible = true
    },
    // 级联选择器选中事件
    handleChange(val) {
      this.editForm.address1 = val
    },
    // 监听编辑对话框关闭事件
    closedEditDialog() {
      this.$refs.editFormRef.resetFields()
    },
    // 查看物流信息
    async showProcessBox() {
      this.processDialogVisible = true
    }
  }
}
</script>

<style lang='less' scoped>
.el-cascader {
  width: 100%;
}
</style>
