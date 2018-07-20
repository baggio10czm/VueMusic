<template>
    <transition name="slide">
        <div class="add-song" v-show="showFlag" @click.stop>
            <!-- 头部-->
            <div class="header">
                <h1 class="title">添加歌曲到列表</h1>
                <div class="close" @click="hide()">
                    <i class="icon-close"></i>
                </div>
            </div>
            <!-- 头部 end-->
            <!-- 搜索Box -->
            <div class="search-box-wrapper">
                <SearchBox @query="onQueryChange" placeholder="搜索歌曲" ref="searchBox"></SearchBox>
            </div>
            <!-- 搜索Box end-->
            <!--最近播放 搜索历史 tabs-->
            <div class="shortcut" v-show="!query">
                <Switches :switches="switches" :currentIndex="currentIndex" @switch="switchItem"></Switches>
                <div class="list-wrapper">
                    <Scroll ref="songList" class="list-scroll" v-show="currentIndex===0" :data="playHistory">
                        <div class="list-inner">
                            <SongList :songs="playHistory" @select="selectSong"></SongList>
                        </div>
                    </Scroll>
                    <Scroll ref="searchList"  class="list-scroll" v-show="currentIndex===1" :data="searchHistory" :refreshDelay="refreshDelay">
                        <div class="list-inner">
                            <SearchList @delete="deleteSearchHistory" @select="addQuery" :searches="searchHistory"></SearchList>
                        </div>
                    </Scroll>
                </div>
            </div>
            <!--最近播放 搜索历史 tabs END-->
            <!--搜索结果-->
            <div class="search-result" v-show="query">
                <Suggest :query="query" :showSinger="showSinger" @select="selectSuggest" @listScroll="blurInput" ref="suggest"></Suggest>
            </div>
            <!--搜索结果 end-->
            <!--顶部tips-->
            <TopTips ref="topTips">
                <div class="tip-title">
                    <i class="icon-ok"></i>
                    <span class="text">1首歌已添加到播放队列</span>
                </div>
            </TopTips>
            <!--顶部tips END-->
        </div>
    </transition>
</template>

<script>
    import SearchBox from '@/base/search-box/search-box'
    import Suggest from '@/components/suggest/suggest'
    import Switches from '@/base/switches/switches'
    import Scroll from '@/base/scroll/scroll'
    import {searchMixin} from '@/common/js/mixin'
    import {mapGetters,mapActions} from 'vuex'
    import SongList from '@/base/song-list/song-list'
    import Song from '@/common/js/song'
    import SearchList from '@/base/search-list/search-list'
    import TopTips from '@/base/top-tip/top-tip'

    export default {
        mixins: [searchMixin],
        name: "add-song",
        data(){
            return {
                showFlag:false,
                showSinger:false,
                currentIndex:0,
                switches : [{name:'最近播放'},{name:'搜索历史'}]
            }
        },
        methods:{
            show(){
                this.showFlag = true
                setTimeout(()=>{
                    if(this.currentIndex === 0){
                        this.$refs.songList.refresh()
                    }else {
                        this.$refs.searchList.refresh()
                    }
                },20)
            },
            hide(){
                this.showFlag = false
            },
            selectSuggest(){
                this.saveSearch()
                this.showTopTip()
            },
            switchItem(index){
                this.currentIndex = index
            },
            selectSong(song,index){
                if(index !== 0){  //历史第一首是当前播放歌曲，需排除
                    this.insertSong(new Song(song))  //插入的song 必须是实例化的
                    this.showTopTip()
                }
            },
            showTopTip(){     // tips显示
                this.$refs.topTips.show()
            },
            ...mapActions([
                'insertSong'
            ])
        },
        computed:{
            ...mapGetters([
                'playHistory'
            ])
        },
        components:{
            SearchBox,
            Suggest,
            Switches,
            Scroll,
            SongList,
            SearchList,
            TopTips
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~@/common/stylus/variable"
    @import "~@/common/stylus/mixin"

    .add-song
        position: fixed
        top: 0
        bottom: 0
        width: 100%
        z-index: 200
        background: $color-background
        &.slide-enter-active, &.slide-leave-active
            transition: all 0.3s
        &.slide-enter, &.slide-leave-to
            transform: translate3d(100%, 0, 0)
        .header
            position: relative
            height: 44px
            text-align: center
            .title
                line-height: 44px
                font-size: $font-size-large
                color: $color-text
            .close
                position: absolute
                top: 0
                right: 8px
                .icon-close
                    display: block
                    padding: 12px
                    font-size: 20px
                    color: $color-theme

        .search-box-wrapper
            margin: 20px
        .shortcut
            .list-wrapper
                position: absolute
                top: 165px
                bottom: 0
                width: 100%
                .list-scroll
                    height: 100%
                    overflow: hidden
                    .list-inner
                        padding: 0 30px
        .search-result
            position: fixed
            top: 124px
            bottom: 0
            width: 100%
        .tip-title
            text-align: center
            padding: 18px 0
            font-size: 0
            .icon-ok
                font-size: $font-size-medium
                color: $color-theme
                margin-right: 4px
            .text
                font-size: $font-size-medium
                color: $color-text
</style>
