<template>
  <div id="app">
    <m-Header></m-Header>
    <tab></tab>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <player></player>
  </div>
</template>

<script>
import MHeader from '@/components/m-header/m-header'
import Tab from '@/components/tab/tab'
import Player from '@/components/player/player'

export default {
  name: 'app',
  components: {
      MHeader,
      Tab,
      Player
  }
}
</script>

<style lang="stylus">
  @import "~@/common/stylus/variable.styl"

  #app
    color: $color-theme
</style>
