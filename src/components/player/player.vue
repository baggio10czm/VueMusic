<template>
    <div class="player" v-show="playList.length > 0">
        <!-- vue 提供的js 动画钩子-->
        <transition name="normal"
                    @enter="enter"
                    @after-enter="afterEnter"
                    @leave="leave"
                    @after-leave="afterLeave"
        >
            <div class="normal-player" v-show="fullScreen">
                <div class="background">
                    <img :src="currentSong.image" width="100%" height="100%">
                </div>
                <div class="top">
                    <div class="back" @click="back()">
                        <i class="icon-back"></i>
                    </div>
                    <h1 class="title" v-html="currentSong.name"></h1>
                    <h2 class="subtitle" v-html="currentSong.singer"></h2>
                </div>
                <div class="middle">
                    <div class="middle-l">
                        <div class="cd-wrapper" ref="cdWrapper">
                            <div class="cd" :class="cdCls">
                                <img :src="currentSong.image" class="image">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bottom">
                    <div class="progress-wrapper">
                        <span class="time time-l">{{format(currentTime)}}</span>
                        <div class="progress-bar-wrapper">
                            <ProgressBar :percent="percent" @percentChange="onProgressBarChange"></ProgressBar>
                        </div>
                        <span class="time time-r">{{format(currentSong.duration)}}</span>
                    </div>
                    <div class="operators">
                        <div class="icon i-left" @click="changeMode()">
                            <i :class="iconMode"></i>
                        </div>
                        <div class="icon i-left" :class="disableCls">
                            <i @click="prev" class="icon-prev"></i>
                        </div>
                        <div class="icon i-center" :class="disableCls">
                            <i @click="togglePlaying" :class="playIcon"></i>
                        </div>
                        <div class="icon i-right" :class="disableCls">
                            <i @click="next" class="icon-next"></i>
                        </div>
                        <div class="icon i-right">
                            <i class="icon-not-favorite"></i>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
        <transition name="mini">
            <div class="mini-player" v-show="!fullScreen" @click="open()">
                <div class="icon">
                    <img :src="currentSong.image" :class="cdCls" width="40" height="40" alt="">
                </div>
                <div class="text">
                    <h2 class="name" v-html="currentSong.name"></h2>
                    <p class="desc" v-html="currentSong.singer"></p>
                </div>
                <div class="control">
                    <!--32是宽度设置 跟图标一致   percent 是百分比-->
                    <ProgressCircle :radius="32" :percent="percent">
                        <i :class="miniIcon" @click.stop="togglePlaying()" class="icon-mini"></i>
                    </ProgressCircle>
                </div>
                <div class="control">
                    <i class="icon-playlist"></i>
                </div>
            </div>
        </transition>
        <!-- audio 会派发 canplay 事件(在播放器准备好时)  error事件（当播放器出错时） timeupdate 更新播放时间 end事件代表歌曲播放完  -->
        <audio ref="audio" :src="currentSong.url" @canplay="ready" @error="error" @timeupdate="updateTime" @ended="end"></audio>
    </div>
</template>

<script>
    import {mapGetters, mapMutations} from 'vuex'
    import animations from 'create-keyframe-animation'   // create-keyframe-animation 用js实现css3动画
    import {prefixStyle} from '@/common/js/dom'
    import ProgressBar from '@/base/progress-bar/progress-bar'
    import ProgressCircle from '@/base/progress-circle/progress-circle'
    import {playMode} from '@/common/js/config'
    import {shuffle} from '@/common/js/util'

    const transform = prefixStyle('transform')

    export default {
        name: "player",
        data() {
            return {
                songReady: false,    //播放器是否准备好
                currentTime: 0       //播放时间
            }
        },
        computed: {
            cdCls() {
                return this.playing ? 'play' : 'play pause';   // 控制 cd 图片 是否转动的Class
            },
            playIcon() {
                return this.playing ? 'icon-pause' : 'icon-play';   // 控制 播放按钮图标 显示播放暂定状态
            },
            iconMode() {
                return this.mode === playMode.sequence ? 'icon-sequence':this.mode === playMode.loop ?'icon-loop':'icon-random'; // 控制 mini版播放按钮图标 显示播放暂定状态
            },
            miniIcon() {
                return this.playing ? 'icon-pause-mini' : 'icon-play-mini'; // 控制 mini版播放按钮图标 显示播放暂定状态
            },
            disableCls() {
                return this.songReady ? '' : 'disable';     // 当播放器没准备好时 显示 disable 的样式
            },
            percent() {
                return this.currentTime / this.currentSong.duration        // 歌曲播放时间比例
            },
            ...mapGetters([   // mapGetters 魔法糖语句 得到vux的各种值
                'fullScreen',  // 全屏
                'playList',    // 播放列表
                'currentSong',  // 当前歌曲
                'playing',      // 播放状态
                'currentIndex',  // 当前歌曲索引
                'mode',  // 播放模式
                'sequenceList'  // 原始播放列表
            ])
        },
        methods: {
            open() {
                this.setFullScreen(true)   // 控制播放器 是否全屏显示
            },
            back() {
                this.setFullScreen(false)
            },
            ...mapMutations({                            // 利用Mutations 魔法糖语句 改变vux值
                setFullScreen: 'SET_FULL_SCREEN',        // 设置播放器全屏的值
                setPlayingState: 'SET_PLAYING_STATE',    // 设置播放器播放状态的值
                setCurrentIndex: 'SET_CURRENT_INDEX',    // 设置播放器当前播放歌曲索引的值
                setPlayMode: 'SET_PLAY_MODE',
                setPlayList: 'SET_PLAYLIST',
            }),
            enter(el, done) {
                // 得到 起始动画物体 要移动到的 x，y坐标 与缩放比例
                const {x, y, scale} = this._getPosAndScale();
                // 为 create-keyframe-animation 设置动画
                let animation = {
                    0: {
                        transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
                    },
                    60: {
                        transform: `translate3d(0,0,0) scale(1.2)`
                    },
                    100: {
                        transform: `translate3d(0,0,0) scale(1)`
                    },
                }
                // 为 create-keyframe-animation 注册动画
                animations.registerAnimation({
                    name: 'move',
                    animation,
                    presets: {
                        duration: 600,
                        easing: 'linear'
                    }
                })
                //  create-keyframe-animation 运行动画
                animations.runAnimation(this.$refs.cdWrapper, 'move', done)
            },
            afterEnter() {
                // 注销动画
                animations.unregisterAnimation('move')
                // 清空动画样式
                this.$refs.cdWrapper.style.animation = ''
            },
            leave(el, done) {
                // 当播放器变成mini版本时候的动画
                this.$refs.cdWrapper.style.transition = 'all 0.6s'
                const {x, y, scale} = this._getPosAndScale()
                this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
                // 监听 当动画过度结束时候 执行 done
                this.$refs.cdWrapper.addEventListener('transitionend', done)
            },
            afterLeave() {
                // 清除动画过渡 和 transform
                this.$refs.cdWrapper.style.transition = ''
                this.$refs.cdWrapper.style[transform] = ''
            },
            // 得到起始 动画物体 要移动的x，y值 和缩放值
            _getPosAndScale() {
                const targetWidth = 40          // 目标图片宽度
                const paddingLeft = 40          // 目标图片中心点 到 屏幕最左边的距离
                const paddingBottom = 30        // 目标图片中心点 到 屏幕最底边的距离
                const paddingTop = 80           // 动画物体中小点 到顶部的距离
                const width = window.innerWidth * 0.8     // 动画物体宽度
                const scale = targetWidth / width         //  目标图片直径 除以 动画物体直径 得到缩放比例
                const x = -(window.innerWidth / 2 - paddingLeft)   // 动画物体需要移动的 X 坐标值  是负数
                const y = window.innerHeight - paddingTop - width / 2 - paddingBottom   // 动画物体需要移动的 Y坐标值
                return {
                    x,
                    y,
                    scale
                }
            },
            // 切换播放状态
            togglePlaying() {
                this.setPlayingState(!this.playing)
            },
            // 上一曲
            prev() {
                //当播放器没有准备好 就 return
                if (!this.songReady) {
                    return
                }
                // 当前播放索引 -1
                let index = this.currentIndex - 1
                if (index === -1) { // 当播放索引 = -1 切换到歌曲列表的最后一首
                    index = this.playList.length - 1
                }
                this.setCurrentIndex(index)        // 设置 VUX 的 SET_CURRENT_INDEX
                if (!this.playing) {                 // 当播放是暂停时 执行  togglePlaying() 更新播放按钮状态 和 cd盘转动效果
                    this.togglePlaying()
                }
                this.songReady = false             // 每次操作完毕设置 songReady = false 更新播放器状态为未准备好，disable就会生效
            },
            // 下一曲
            next() {
                //当播放器没有准备好 就 return
                if (!this.songReady) {
                    return
                }
                // 当前播放索引 +1
                let index = this.currentIndex + 1
                if (index === this.playList.length) { // 当播放索引 超过最后一首 切换到歌曲列表的第一首
                    index = 0
                }
                this.setCurrentIndex(index)        // 设置 VUX 的 SET_CURRENT_INDEX
                if (!this.playing) {                // 当播放是暂停时 执行togglePlaying() 更新播放按钮状态 和 cd盘转动效果
                    this.togglePlaying()
                }
                this.songReady = false       // 每次操作完毕设置 songReady = false 更新播放器状态为未准备好，disable就会生效
            },
            ready() {                        //当 播放器准备好 设置 songReady 为true
                this.songReady = true;
            },
            error() {                       //当 播放器出错时 设置 songReady 为true ,以免出错时，影响播放器运行
                this.songReady = true;
            },
            //播放器时间更新
            updateTime(e) {
                this.currentTime = e.target.currentTime
            },
            format(interval) {            // 分秒格式化
                interval = interval | 0
                const minute = interval / 60 | 0
                const second = (interval % 60 | 0).toString().padStart(2, '0')
                return `${minute}:${second}`
            },
            // 进度条操作触发 改变播放时间
            onProgressBarChange(percent) {
                this.$refs.audio.currentTime = this.currentSong.duration * percent
                if (!this.playing) {   // 如果是暂停状态，就开始播放
                    this.togglePlaying()
                }
            },
            // 改变播放模式
            changeMode(){
                // 保证 mode 在0 - 2之间
                const mode = (this.mode + 1 ) % 3
                // 调用 mapMutations 设置播放模式
                this.setPlayMode(mode)
                let list = []
                if(mode === playMode.random){
                    // 当是随机播放时 重新洗牌列表
                    list = shuffle(this.sequenceList)
                }else {
                    // 当是其他播放时 列表等于默认播放列表
                    list = this.sequenceList
                }
                // 切换模式后 保持播放当前歌曲
                this.resetCurrentIndex(list)
                // // 调用 mapMutations 设置 当前播放列表
                this.setPlayList(list)
            },
            // 在播放模式更改后，保持播放当前歌曲，调用mapMutations，设置当前歌曲索引
            resetCurrentIndex(list){
                this.setCurrentIndex(list.findIndex((item)=>{
                    return item.id === this.currentSong.id
                }))
            },
            // 当播放结束，如果循环单曲就跳下一曲
            end(){
                if(this.mode === playMode.loop){
                    this.loop()
                }else {
                    this.next()
                }
            },
            // 循环单曲播放
            loop(){
                this.$refs.audio.currentTime = 0
                this.$refs.audio.play()
            }
        },
        watch: {
            // 监听 当前歌曲变化  触发播放器 play
            currentSong(newSong,oldSong) {
                if(newSong.id === oldSong.id){
                    return
                }
                this.$nextTick(() => {          // 数据异步获取 + $nextTick 防止出错
                    this.$refs.audio.play()
                })
            },
            // 监听 当前播放器播放状态变化  选择是 paly 还是 pause
            playing(newPlaying) {
                const audio = this.$refs.audio
                this.$nextTick(() => {
                    newPlaying ? audio.play() : audio.pause();
                })
            }
        },
        components: {
            ProgressBar,
            ProgressCircle
        }
    }
</script>


<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~@/common/stylus/variable"
    @import "~@/common/stylus/mixin"

    .player
        .normal-player
            position: fixed
            left: 0
            right: 0
            top: 0
            bottom: 0
            z-index: 150
            background: $color-background
            .background
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                z-index: -1
                opacity: 0.6
                filter: blur(20px)
            .top
                position: relative
                margin-bottom: 25px
                .back
                    position absolute
                    top: 0
                    left: 6px
                    z-index: 50
                    .icon-back
                        display: block
                        padding: 9px
                        font-size: $font-size-large-x
                        color: $color-theme
                        transform: rotate(-90deg)
                .title
                    width: 70%
                    margin: 0 auto
                    line-height: 40px
                    text-align: center
                    no-wrap()
                    font-size: $font-size-large
                    color: $color-text
                .subtitle
                    line-height: 20px
                    text-align: center
                    font-size: $font-size-medium
                    color: $color-text
            .middle
                position: fixed
                width: 100%
                top: 80px
                bottom: 170px
                white-space: nowrap
                font-size: 0
                .middle-l
                    display: inline-block
                    vertical-align: top
                    position: relative
                    width: 100%
                    height: 0
                    padding-top: 80%
                    .cd-wrapper
                        position: absolute
                        left: 10%
                        top: 0
                        width: 80%
                        height: 100%
                        .cd
                            width: 100%
                            height: 100%
                            box-sizing: border-box
                            border: 10px solid rgba(255, 255, 255, 0.1)
                            border-radius: 50%
                            &.play
                                animation: rotate 20s linear infinite
                            &.pause
                                animation-play-state: paused
                            .image
                                position: absolute
                                left: 0
                                top: 0
                                width: 100%
                                height: 100%
                                border-radius: 50%

                    .playing-lyric-wrapper
                        width: 80%
                        margin: 30px auto 0 auto
                        overflow: hidden
                        text-align: center
                        .playing-lyric
                            height: 20px
                            line-height: 20px
                            font-size: $font-size-medium
                            color: $color-text-l
                .middle-r
                    display: inline-block
                    vertical-align: top
                    width: 100%
                    height: 100%
                    overflow: hidden
                    .lyric-wrapper
                        width: 80%
                        margin: 0 auto
                        overflow: hidden
                        text-align: center
                        .text
                            line-height: 32px
                            color: $color-text-l
                            font-size: $font-size-medium
                            &.current
                                color: $color-text
            .bottom
                position: absolute
                bottom: 50px
                width: 100%
                .dot-wrapper
                    text-align: center
                    font-size: 0
                    .dot
                        display: inline-block
                        vertical-align: middle
                        margin: 0 4px
                        width: 8px
                        height: 8px
                        border-radius: 50%
                        background: $color-text-l
                        &.active
                            width: 20px
                            border-radius: 5px
                            background: $color-text-ll
                .progress-wrapper
                    display: flex
                    align-items: center
                    width: 80%
                    margin: 0px auto
                    padding: 10px 0
                    .time
                        color: $color-text
                        font-size: $font-size-small
                        flex: 0 0 30px
                        line-height: 30px
                        width: 30px
                        &.time-l
                            text-align: left
                        &.time-r
                            text-align: right
                    .progress-bar-wrapper
                        flex: 1
                .operators
                    display: flex
                    align-items: center
                    .icon
                        flex: 1
                        color: $color-theme
                        &.disable
                            color: $color-theme-d
                        i
                            font-size: 30px
                    .i-left
                        text-align: right
                    .i-center
                        padding: 0 20px
                        text-align: center
                        i
                            font-size: 40px
                    .i-right
                        text-align: left
                    .icon-favorite
                        color: $color-sub-theme
            &.normal-enter-active, &.normal-leave-active
                transition: all 0.4s
                .top, .bottom
                    transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
            &.normal-enter, &.normal-leave-to
                opacity: 0
                .top
                    transform: translate3d(0, -100px, 0)
                .bottom
                    transform: translate3d(0, 100px, 0)
        .mini-player
            display: flex
            align-items: center
            position: fixed
            left: 0
            bottom: 0
            z-index: 180
            width: 100%
            height: 60px
            background: $color-highlight-background
            &.mini-enter-active, &.mini-leave-active
                transition: all 0.4s
            &.mini-enter, &.mini-leave-to
                opacity: 0
            .icon
                flex: 0 0 40px
                width: 40px
                padding: 0 10px 0 20px
                img
                    border-radius: 50%
                    &.play
                        animation: rotate 10s linear infinite
                    &.pause
                        animation-play-state: paused
            .text
                display: flex
                flex-direction: column
                justify-content: center
                flex: 1
                line-height: 20px
                overflow: hidden
                .name
                    margin-bottom: 2px
                    no-wrap()
                    font-size: $font-size-medium
                    color: $color-text
                .desc
                    no-wrap()
                    font-size: $font-size-small
                    color: $color-text-d
            .control
                flex: 0 0 30px
                width: 30px
                padding: 0 10px
                .icon-play-mini, .icon-pause-mini, .icon-playlist
                    font-size: 30px
                    color: $color-theme-d
                .icon-mini
                    font-size: 32px
                    position: absolute
                    left: 0
                    top: 0

    @keyframes rotate
        0%
            transform: rotate(0)
        100%
            transform: rotate(360deg)
</style>
