<template>
    <div class="search">
        <div class="search-box-wrapper">
            <SearchBox ref="searchBox" @query="onQueryChange"></SearchBox>
        </div>
        <div class="shortcut-wrapper" v-show="!query">
            <div class="shortcut">
                <div class="hot-key">
                    <h1 class="title">热门搜素</h1>
                    <ul>
                        <li class="item" v-for="item in hotKey" @click="addQuery(item.k)">
                            {{item.k}}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="search-result" v-show="query">
            <Suggest :query="query" @listScroll="blurInput"></Suggest>
        </div>
        <!--点击搜索结果为歌手页面的路由显示-->
        <router-view></router-view>
    </div>
</template>

<script>
    import SearchBox from '@/base/search-box/search-box'
    import Suggest from '@/components/suggest/suggest'
    import Search from '@/api/search'

    export default {
        name: "search",
        data() {
            return {
                hotKey: [],
                query: ""
            }
        },
        created() {
            this._getHotKey();
        },
        methods: {
            _getHotKey() {   // 搜索热词数据
                let _this = this
                Search.getHotKey({}, function (res) {
                    _this.hotKey = res.hotKey.slice(0, 10)
                }, function (err) {
                    console.log(err)
                })
            },
            addQuery(query) {   // 点击 热词时触发searchBox方法 更新搜索词
                this.$refs.searchBox.setQuery(query)
            },
            onQueryChange(query){
                this.query = query  // 搜索词改变更新 并传给 Suggest 组件
            },
            blurInput(){
                this.$refs.searchBox.blur() // input blur() 手机键盘就会隐藏，优化手机体验
            }
        },
        components: {
            SearchBox,
            Suggest
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
