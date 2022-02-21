<template>
  <el-container class='home-container'>
    <el-header>
      <div>
        <img src='../assets/heima.png' alt=''>
        <span>电商后台管理系统</span>
      </div>
      <el-button type='info' @click='logout'>退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class='btn-collapse' @click='collapse'>|||</div>
        <el-menu background-color='#333744' text-color='#fff' active-text-color='#0866d7'
                 :unique-opened='true'
                 :collapse='isCollapse'
                 :collapse-transition='false'
                 :router='true'
                 :default-active='activePath'
        >
          <el-submenu :index='item.id+""' v-for='item in menuList' :key='item.id'>
            <template slot='title'>
              <i id='icon' :class='icons[item.id]'></i>
              <span>{{ item.authName }}</span>
            </template>
            <el-menu-item
              :index='subItem.path + ""'
              v-for='subItem in item.children'
              :key='subItem.id'
              @click='activeNavState(subItem.path)'
            >
              <template slot='title'>
                <i class='el-icon-menu'></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main class='main'>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  data() {
    return {
      menuList: [],
      icons: {
        '125': 'iconfont icon-users',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList() {
      const {data: res} = await this.$http.get('menus')
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.menuList = res.data
    },
    collapse() {
      this.isCollapse = !this.isCollapse
    },
    activeNavState(path) {
      window.sessionStorage.setItem('activePath', path)
      this.activePath = path
    }
  }
}
</script>

<style lang='less' scoped>
.home-container {
  height: 100%;
}

.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  color: #ffffff;
  font-size: 20px;

  > div {
    display: flex;
    align-items: center;

    span {
      padding-left: 15px;
    }
  }

}

.el-aside {
  background-color: #333744;
}

.el-main {
  background-color: #eaedf1;
}

#icon {
  padding-right: 10px;
}

.el-menu {
  border-right: none;
}

.btn-collapse {
  background-color: #ccc;
  height: 35px;
  text-align: center;
  line-height: 35px;
  cursor: pointer;
}
</style>
