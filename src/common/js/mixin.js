import {mapGetters, mapMutations, mapActions} from 'vuex'
import {playMode} from '@/common/js/config'
import {shuffle} from '@/common/js/util'

// 多个组件复用的代码可以写一个 mixin
// playListMixin 可以用来解决 底部播放器存在与否 跟 滚动列表的底部bottom 距离问题
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


// 共用 playerMixin 更改播放模式相关操作
export const playerMixin = {
  methods:{
      // 改变播放模式
      changeMode() {
          // 保证 mode 在0 - 2之间
          const mode = (this.mode + 1) % 3
          // 调用 mapMutations 设置播放模式
          this.setPlayMode(mode)
          let list = []
          if (mode === playMode.random) {
              // 当是随机播放时 重新洗牌列表
              list = shuffle(this.sequenceList)
          } else {
              // 当是其他播放时 列表等于默认播放列表
              list = this.sequenceList
          }
          // 切换模式后 保持播放当前歌曲
          this.resetCurrentIndex(list)
          // // 调用 mapMutations 设置 当前播放列表
          this.setPlayList(list)
      },
      // 在播放模式更改后，保持播放当前歌曲，调用mapMutations，设置当前歌曲索引
      resetCurrentIndex(list) {
          this.setCurrentIndex(list.findIndex((item) => {
              return item.id === this.currentSong.id
          }))
      },
      getFavoriteIcon(song){
        if(this.isFavorite(song)){
            return 'icon-favorite'
        }
        return 'icon-not-favorite'
      },
      toggleFavorite(song){
          if(this.isFavorite(song)){
              this.deleteFavoriteList(song)
          }else {
              this.saveFavoriteList(song)
          }
      },
      isFavorite(song){
         const index = this.favoriteList.findIndex((item)=>{
             return item.id === song.id
         })
          return index > -1
      },
      ...mapMutations({                            // 利用Mutations 魔法糖语句 改变vux值
          setPlayingState: 'SET_PLAYING_STATE',    // 设置播放器播放状态的值
          setCurrentIndex: 'SET_CURRENT_INDEX',    // 设置播放器当前播放歌曲索引的值
          setPlayMode: 'SET_PLAY_MODE',
          setPlayList: 'SET_PLAYLIST',
      }),
      ...mapActions([
          'saveFavoriteList',
          'deleteFavoriteList'
      ])
  },
  computed:{
      iconMode() {
          return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'; // 控制 mini版播放按钮图标 显示播放暂定状态
      },
      ...mapGetters([
          'mode',  // 播放模式
          'sequenceList',  // 原始播放列表
          'playList',    // 播放列表
          'currentSong',  // 当前歌曲
          'favoriteList'  // 收藏歌曲列表
      ])
  }
}


// 共用 searchMixin 搜索相关
export const searchMixin = {
  data(){
      return{
          query:'',
          refreshDelay:100
      }
  },
  computed:{
      ...mapGetters([    // 搜索记录
          'searchHistory'
      ])
  },
    methods:{
        addQuery(query) {   // 点击 热词时触发searchBox方法 更新搜索词
            this.$refs.searchBox.setQuery(query)
        },
        onQueryChange(query) {
            this.query = query  // 搜索词改变更新 并传给 Suggest 组件
        },
        blurInput() {
            this.$refs.searchBox.blur() // input blur() 手机键盘就会隐藏，优化手机体验
        },
        saveSearch() { // 调用mapActions 保存搜索结果到vuex 和 缓存
            this.saveSearchHistory(this.query)
        },
        ...mapActions([    // 可以直接调用这里面的方法 tips: deleteSearchHistory 在 @delete 执行会自动得到派发出来的参数
            'saveSearchHistory',
            'deleteSearchHistory'
        ])
    }
}
