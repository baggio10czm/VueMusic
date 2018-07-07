<template>
    <div class="music-list">
        <div class="back" @click="$router.back()">
            <i class="icon-back"></i>
        </div>
        <h1 class="title" v-html="title"></h1>
        <div class="bg-image" :style="bgStyle" ref="bgImage">
            <div class="play-wrapper">
                <div class="play" v-show="songs.length > 0" ref="playBtn">
                    <i class="icon-play"></i>
                    <span class="text">随机播放全部</span>
                </div>
            </div>
            <div class="filter" ref="filter"></div>
        </div>
        <!--遮罩层-->
        <div class="bg-layer" ref="layer"></div>
        <Scroll @scroll="scroll" :data="songs" :probe-type="probeType" :listen-scroll="listenScroll" class="list" ref="list">
            <div class="song-list-wrapper">
                <song-list :songs="songs"></song-list>
            </div>
            <div class="loading-container" v-show="!songs.length">
                <Loading></Loading>
            </div>
        </Scroll>
    </div>
</template>

<script>
    import Scroll from '@/base/scroll/scroll'
    import SongList from '@/base/song-list/song-list'
    import Loading from '@/base/loading/loading'
    import {prefixStyle} from '@/common/js/dom'

    // 顶部预留高度
    const RESERVED_HEIGHT = 40
    // prefixStyle 做各种浏览器兼容处理
    const transform = prefixStyle('transform')
    const backdrop = prefixStyle('backdrop-filter')

    export default {
        name: "music-list",
        data() {
            return {
                scrollY: 0
            }
        },
        props: {
            bgImage: {
                type: String,
                default: ''
            },
            songs: {
                type: Array,
                default: function () {
                    return []
                }
            },
            title: {
                type: String,
                default: ''
            }
        },
        created() {
            // probeType 为 3 的时候，不仅在屏幕滑动的过程中，而且在 momentum 滚动动画运行过程中实时派发 scroll 事件。
            this.probeType = 3
            this.listenScroll = true;
        },
        computed: {
            bgStyle() {
                return `background-image:url(${this.bgImage})`
            }
        },
        mounted() {
            // 得到图片高度 因为样式是： width: 100%  height: 0  padding-top: 70% 所以高度在加载页面时候就确定了，不用等图片加载完毕
            this.imageHeight = this.$refs.bgImage.clientHeight
            // bg-layer 遮罩层 最多向上移动距离
            this.minTransLateY = -this.imageHeight + RESERVED_HEIGHT
            // list top值等于 图片高度
            this.$refs.list.$el.style.top = `${this.imageHeight}px`
        },
        methods: {
            scroll(pos) {
                this.scrollY = pos.y
            }
        },
        watch: {
            scrollY(newY) {
                // 遮罩层向上移动的值， 取最大的 就是 图片高度- 40
                let tranlateY = Math.max(this.minTransLateY,newY)
                let zIndex = 0  // zIndex 层级值
                let scale = 1  // 缩放值
                let blur = 0  // 模糊值
                // 遮罩层 移动动画
                this.$refs.layer.style[transform] =  `translate3d(0,${tranlateY}px,0)`
                //缩放公式 滚动值/ 图片高度
                const percent = Math.abs( newY / this.imageHeight)
                // 当往下拉的时候 放大图片
                if(newY > 0){
                    scale = 1 + percent
                    zIndex = 10
                }else {
                    blur = Math.min(20 * percent,20)
                }
                this.$refs.filter.style[backdrop] = `blur(${blur}px)`    // IOS 才有效

                // 当滚到顶部时
                if(newY < this.minTransLateY){
                    zIndex = 10
                    // 图片高度层设置为0
                    this.$refs.bgImage.style.paddingTop = '0'
                    // 图片高度设置为 预留顶部高度
                    this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
                    // 播放按钮隐藏
                    this.$refs.playBtn.style.display = 'none'
                }else {
                    // 当滚动大小 小于 最大允许高度时 恢复  1:0.7 的高度 并显示播放按钮
                    this.$refs.bgImage.style.paddingTop = '70%'
                    this.$refs.bgImage.style.height = '0'
                    this.$refs.playBtn.style.display = ''
                }
                // 图片层级设置
                this.$refs.bgImage.style.zIndex = zIndex
                // 图片缩放
                this.$refs.bgImage.style[transform] =  `scale(${scale})`
            }
        },
        components: {
            Scroll,
            SongList,
            Loading
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~@/common/stylus/variable"
    @import "~@/common/stylus/mixin"

    .music-list
        position: fixed
        z-index: 100
        top: 0
        left: 0
        bottom: 0
        right: 0
        background: $color-background
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
        .title
            position: absolute
            top: 0
            left: 10%
            z-index: 40
            width: 80%
            no-wrap()
            text-align: center
            line-height: 40px
            font-size: $font-size-large
            color: $color-text
        .bg-image
            position: relative
            width: 100%
            height: 0
            padding-top: 70%
            transform-origin: top
            background-size: cover
            .play-wrapper
                position: absolute
                bottom: 20px
                z-index: 50
                width: 100%
                .play
                    box-sizing: border-box
                    width: 135px
                    padding: 7px 0
                    margin: 0 auto
                    text-align: center
                    border: 1px solid $color-theme
                    color: $color-theme
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
            .filter
                position: absolute
                top: 0
                left: 0
                width: 100%
                height: 100%
                background: rgba(7, 17, 27, 0.4)
        .bg-layer
            position: relative
            height: 100%
            background: $color-background
        .list
            position: fixed
            top: 0
            bottom: 0
            width: 100%
            background: $color-background
            .song-list-wrapper
                padding: 20px 30px
            .loading-container
                position: absolute
                width: 100%
                top: 50%
                transform: translateY(-50%)
</style>