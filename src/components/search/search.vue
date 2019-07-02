<template>
    <div class="search">
        <!-- 搜索Box -->
        <div class="search-box-wrapper">
            <SearchBox ref="searchBox" @query="onQueryChange"></SearchBox>
        </div>
        <!-- 搜索Box -->
        <!--热门搜索 + 搜索历史 -->
        <div class="shortcut-wrapper" v-show="!query" ref="shortcutWrapper">
            <Scroll class="shortcut" :data="shortCut" :refreshDelay="refreshDelay" ref="shortCutRef">
                <!-- Scroll 是根据 第一个子元素来计算的 所有要包一层div -->
                <div>
                    <div class="hot-key">
                        <h1 class="title">热门搜素</h1>
                        <ul>
                            <li class="item" v-for="item in hotKey" @click="addQuery(item.k)">
                                {{item.k}}
                            </li>
                        </ul>
                    </div>
                    <div class="search-history" v-show="searchHistory.length">
                        <h1 class="title">
                            <span class="text">搜索历史</span>
                            <span class="clear" @click="showConfirm()">
                            <i class="icon-clear"></i>
                            </span>
                        </h1>
                        <SearchList :searches="searchHistory" @select="addQuery" @delete="deleteSearchHistory"></SearchList>
                    </div>
                </div>
            </Scroll>
        </div>
        <!--热门搜索 + 搜索历史 end-->
        <!-- 搜索结果 -->
        <div class="search-result" v-show="query"  ref="shortcutResult">
            <Suggest :query="query" @listScroll="blurInput" @select="saveSearch" ref="suggest"></Suggest>
        </div>
        <!-- 搜索结果 end-->
        <Confirm ref="confirm" text="是否清空所有历史？" confirmBtnText="清空" @confirm="clearSearchHistory"></Confirm>
        <!--点击搜索结果为歌手页面的路由显示-->
        <router-view></router-view>
    </div>
</template>

<script>
    import SearchBox from '@/base/search-box/search-box'
    import Suggest from '@/components/suggest/suggest'
    import Search from '@/api/search'
    import SearchList from '@/base/search-list/search-list'
    import Confirm from '@/base/confirm/confirm'
    import Scroll from '@/base/scroll/scroll'
    import {mapActions} from 'vuex'
    import {playListMixin,searchMixin} from '@/common/js/mixin'

    export default {
        mixins: [playListMixin,searchMixin],
        name: "search",
        data() {
            return {
                hotKey: []
            }
        },
        created() {
            this._getHotKey();
        },
        methods: {
            handlePlaylist(playList) {
                const bottom = playList.length > 0 ? '60px' : ''
                this.$refs.shortcutWrapper.style.bottom = bottom
                this.$refs.shortCutRef.refresh()
                // 搜索结果同样处理
                this.$refs.shortcutResult.style.bottom = bottom
                this.$refs.suggest.refresh()   // 直接调用组件里的 refresh 方法
            },
            _getHotKey() {   // 搜索热词数据
                let _this = this
                Search.getHotKey({}, function (res) {
                    _this.hotKey = res.hotKey.slice(0, 10)
                }, function (err) {
                    console.log(err)
                })
            },
            showConfirm() {  // 确认弹框显示
                this.$refs.confirm.show()
            },
            ...mapActions([    // 可以直接调用这里面的方法 tips: deleteSearchHistory 在 @delete 执行会自动得到派发出来的参数
                'clearSearchHistory'
            ])
        },
        computed: {
            shortCut(){  // 把 Scroll 组件里面的 两种动态数据拼接给 Scroll 计算高度
                return this.hotKey.concat(this.searchHistory)
            }
        },
        watch:{
          query(newQuery){
              if(!newQuery){  // 当搜索文字清空时候 刷新 搜索热词 + 搜索历史 Scroll
                  setTimeout(()=>{
                      this.$refs.shortCutRef.refresh()
                  },20)
              }
          }
        },
        components: {
            SearchBox,
            Suggest,
            SearchList,
            Confirm,
            Scroll
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import "~@/common/stylus/variable"
    @import "~@/common/stylus/mixin"

    .search
        .search-box-wrapper
            margin: 20px
        .shortcut-wrapper
            position: fixed
            top: 178px
            bottom: 0
            width: 100%
            .shortcut
                height: 100%
                overflow: hidden
                .hot-key
                    margin: 0 20px 20px 20px
                    .title
                        margin-bottom: 20px
                        font-size: $font-size-medium
                        color: $color-text-l
                    .item
                        display: inline-block
                        padding: 5px 10px
                        margin: 0 20px 10px 0
                        border-radius: 6px
                        background: $color-highlight-background
                        font-size: $font-size-medium
                        color: $color-text-d
                .search-history
                    position: relative
                    margin: 0 20px
                    .title
                        display: flex
                        align-items: center
                        height: 40px
                        font-size: $font-size-medium
                        color: $color-text-l
                        .text
                            flex: 1
                        .clear
                            extend-click()
                            .icon-clear
                                font-size: $font-size-medium
                                color: $color-text-d
        .search-result
            position: fixed
            width: 100%
            top: 178px
            bottom: 0
</style>
