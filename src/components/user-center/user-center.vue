<template>
    <transition name="slide">
        <div class="user-center">
            <div class="back" @click="back()">
                <i class="icon-back"></i>
            </div>
            <div class="switches-wrapper">
                <Switcher :switches="switches" :currentIndex="currentIndex" @switch="switchItem"></Switcher>
            </div>
            <div class="play-btn" ref="playBtn" @click="random">
                <i class="icon-play"></i>
                <span class="text">随机播放全部</span>
            </div>
            <div class="list-wrapper" ref="listWrapper">
                <Scroll ref="favoriteList" class="list-scroll" v-if="currentIndex===0" :data="favoriteList">
                    <div class="list-inner">
                        <SongList :songs="favoriteList" @select="selectSong"></SongList>
                    </div>
                </Scroll>
                <Scroll ref="playList" class="list-scroll" v-if="currentIndex===1" :data="playHistory">
                    <div class="list-inner">
                        <SongList :songs="playHistory" @select="selectSong"></SongList>
                    </div>
                </Scroll>
            </div>
            <div class="no-result-wrapper" v-show="noResult">
                <NoResult :title="noResultDesc"></NoResult>
            </div>
        </div>
    </transition>
</template>

<script>
    import Switcher from '@/base/switches/switches'
    import {mapGetters, mapActions} from 'vuex'
    import SongList from '@/base/song-list/song-list'
    import Scroll from '@/base/scroll/scroll'
    import Song from '@/common/js/song'
    import NoResult from '@/base/no-result/no-result'
    import {playListMixin} from "@/common/js/mixin";

    export default {
        mixins: [playListMixin],
        name: "user-center",
        data() {
            return {
                currentIndex: 0,
                switches: [
                    {name: '我喜欢的'},
                    {name: '最近听的'}
                ]
            }
        },
        computed: {
            noResult() {
                if (this.currentIndex === 0) {
                    return !this.favoriteList.length
                } else {
                    return !this.playHistory.length
                }
            },
            noResultDesc() {
                if (this.currentIndex === 0) {
                    return '暂无收藏歌曲'
                } else {
                    return '无播放记录'
                }
            },
            ...mapGetters([
                'favoriteList',
                'playHistory',
            ])
        },
        methods: {
            handlePlaylist(playList) {
                const bottom = playList.length > 0 ? '60px' : 0
                this.$refs.listWrapper.style.bottom = bottom
                this.currentIndex === 0 && this.$refs.favoriteList.refresh()
                this.currentIndex === 1 && this.$refs.playList.refresh()
            },
            switchItem(index) {
                this.currentIndex = index
            },
            selectSong(song) {
                this.insertSong(new Song(song))
            },
            back() {
                this.$router.back()
            },
            random() {
                // 随机播放列表 根据 currentIndex 判断
                let list = this.currentIndex === 0 ? this.favoriteList : this.playHistory
                if (list.length === 0) {
                    return
                }
                // list 必须是 Song 实例化 才有对应的 各种方法（歌词等）
                list = list.map((song) => {
                    return new Song(song)
                })
                // 调用 mapActions 随机播放方法
                this.randomPlay({
                    list
                })
            },
            ...mapActions([
                'insertSong',
                'randomPlay'
            ])
        },
        components: {
            Switcher,
            SongList,
            Scroll,
            NoResult
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~@/common/stylus/variable"

    .user-center
        position: fixed
        top: 0
        bottom: 0
        z-index: 100
        width: 100%
        background: $color-background
        &.slide-enter-active, &.slide-leave-active
            transition: all 0.3s
        &.slide-enter, &.slide-leave-to
            transform: translate3d(100%, 0, 0)
        .back
            position absolute
            top: 0
            left: 6px
            z-index: 50
            .icon-back
                display: block
                padding: 10px
                font-size: $font-size-large-x
                color: $color-theme
        .switches-wrapper
            margin: 10px 0 30px 0
        .play-btn
            box-sizing: border-box
            width: 135px
            padding: 7px 0
            margin: 0 auto
            text-align: center
            border: 1px solid  $color-text-l
            color: $color-text-l
            border-radius: 100px
            font-size: 0
            .icon-play
                display: inline-block
                vertical-align: middle
                margin-right: 6px
                font-size: $font-size-medium-x
            .text
                display: inline-block
                vertical-align: middle
                font-size: $font-size-small
        .list-wrapper
            position: absolute
            top: 110px
            bottom: 0
            width: 100%
            .list-scroll
                height: 100%
                overflow: hidden
                .list-inner
                    padding: 20px 30px
        .no-result-wrapper
            position: absolute
            width: 100%
            top: 50%
            transform: translateY(-50%)
</style>
