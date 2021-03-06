<template>
    <div class="progress-bar" ref="progressBar" @click="progressClick">
        <div class="bar-inner">
            <div class="progress" ref="progress"></div>
            <div class="progress-btn-wrapper" ref="progressBtn"
                 @touchstart.prevent="progressTouchStart"
                 @touchmove.prevent="progressTouchMove"
                 @touchend.prevent="progressTouchEnd">
                <div class="progress-btn"></div>
            </div>
        </div>
    </div>
</template>

<script>
    import {prefixStyle} from '@/common/js/dom'

    const transform = prefixStyle('transform')

    const progressBtnWidth = 16

    export default {
        name: "progress-bar",
        props: {
            percent: {
                type: Number,
                default: 0
            }
        },
        watch: {
            percent(newPercent) {
                if (newPercent > 0 && !this.touch.initiated) {
                    // 需要减掉 进度条按钮(小球)的宽度 以免按钮最后会脱离进度条
                    const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
                    // 偏移距离  = 歌曲百分比 * 进度条长度
                    const offsetWidth = newPercent * barWidth
                    this._offset(offsetWidth)
                }
            }
        },
        created() {
            this.touch = {}  //申明一个对象记录
        },
        methods: {
            progressTouchStart(e) {
                this.touch.initiated = true;                   // touch开始
                this.touch.startX = e.touches[0].pageX;          // 记录touch起始点
                this.touch.left = this.$refs.progress.clientWidth    // 记录progress 宽度 = 偏移量
            },
            progressTouchMove(e) {
                //判断touch是否开始
                if (!this.touch.initiated) {
                    return
                }
                // touch  结束点 - 起始点  = touch 距离
                const deltaX = e.touches[0].pageX - this.touch.startX
                // Math.max 防止是0以下的值； Math.min 防止 touch 距离 + 原来偏移量超出 进度条宽度
                const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX))
                this._offset(offsetWidth)
            },
            // 进度条触摸结束
            progressTouchEnd() {
                this.touch.initiated = false;                     // touch 结束
                this._triggerPercent()
            },
            // 派发进度条百分比，更新播放器播放时间
            _triggerPercent() {
                const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth      // 进度条宽度
                const percent = this.$refs.progress.clientWidth / barWidth                  // 播放歌曲百分比
                this.$emit('percentChange', percent)                                         // 派发 百分比改变事件
            },
            // 点击进度条 先设置偏移再派发进度条百分比，让播放器调整播放当前时间
            progressClick(e) {
                // 点击 progressBtn 的时 e.offsetX 获取不对    所以放弃使用 this._offset(e.offsetX)
                const rect = this.$refs.progressBar.getBoundingClientRect()  //   getBoundingClientRect 返回元素的大小及其相对于视口的位置。
                const offsetWidth = e.pageX - rect.left     // e.pageX 相对视口X轴坐标 - 进度条相对视口X轴的位置
                this._offset(offsetWidth)
                this._triggerPercent()
            },
            // 播放进度条 与 播放进度条按钮 偏移设置
            _offset(offsetWidth) {
                // 设置播放进度条宽度
                this.$refs.progress.style.width = `${offsetWidth}px`
                // 进度条按钮(小球)偏移位置
                this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
            }
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~@/common/stylus/variable"

    .progress-bar
        height: 30px
        .bar-inner
            position: relative
            top: 13px
            height: 4px
            background: rgba(0, 0, 0, 0.3)
            .progress
                position: absolute
                height: 100%
                background: $color-theme
            .progress-btn-wrapper
                position: absolute
                left: -8px
                top: -13px
                width: 30px
                height: 30px
                .progress-btn
                    position: relative
                    top: 7px
                    left: 7px
                    box-sizing: border-box
                    width: 16px
                    height: 16px
                    border: 3px solid $color-text
                    border-radius: 50%
                    background: $color-theme
</style>
