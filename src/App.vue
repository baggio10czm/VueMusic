<template>
  <div id="app">
    <m-Header></m-Header>
    <tab></tab>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
import MHeader from '@/components/m-header/m-header'
import Tab from '@/components/tab/tab'

export default {
  name: 'app',
  components: {
      MHeader,
      Tab,
  }
}
</script>

<style lang="stylus">
  @import "~@/common/stylus/variable.styl"

  #app
    color: $color-theme
</style>
