import {mapGetters, mapMutations, mapActions} from 'vuex'
import {playMode} from '@/common/js/config'
import {shuffle} from '@/common/js/util'

// 多个组件复用的代码可以写一个 mixin
export const playListMixin = {
  computed: {
    ...mapGetters([
      'playList'
    ])
  },
  mounted() {
    this.handlePlaylist(this.playList)
  },
    // keep-alive 切换触发？
  activated() {
    this.handlePlaylist(this.playList)
  },
  watch: {
    playList(newVal) {
      this.handlePlaylist(newVal)
    }
  },
  methods: {
    // 设置一个 handlePlaylist 当调用 这个mixin 的组件没有使用这个方法时候 会抛出异常，如果使用了就不会抛出异常，会覆盖这个方法
    handlePlaylist() {
      throw new Error('component must implement handlePlaylist method')
    }
  }
}
