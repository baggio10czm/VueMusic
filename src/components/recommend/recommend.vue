<template>
    <div>
        <div class="recommend">
            <Scroll class="recommend-content">
                <div>
                    <div v-if="sliderData.length" class="slider-wrapper" ref="sliderWrapper">
                        <Slider>
                            <div v-for="item in sliderData">
                                <a :href="item.linkUrl">
                                    <img :src="item.picUrl" alt="">
                                    <!--当BScroll跟 fastclick 冲突时 可以用 class="needsclick" 解决 @load="loadImage" 当图片加载完毕调用方法-->
                                    <!--<img class="needsclick" @load="loadImage" :src="item.picUrl">-->
                                </a>
                            </div>
                        </Slider>
                    </div>
                    <div class="recommend-list">
                        <h1 class="list-title">热门歌单推荐</h1>
                        <ul>
                            <li v-for="item in discList" class="item">
                                <div class="icon">
                                    <img width="60" height="60" v-lazy="item.cover">
                                </div>
                                <div class="text">
                                    <h2 class="name" v-html="item.username"></h2>
                                    <p class="desc" v-html="item.title"></p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="loading-container" v-show="!discList.length">
                    <Loading></Loading>
                </div>
            </Scroll>
        </div>
    </div>
</template>

<script>
    import recommend from '@/api/recommend.js'
    import Slider from '@/base/slider/slider.vue'
    import Scroll from '@/base/scroll/scroll.vue'
    import Loading from '@/base/loading/loading.vue'

    export default {
        name: "recommend",
        data() {
            return {
                sliderData: [],
                discList: [],
            }
        },
        created() {
            this._getSliderData();
        },
        methods: {
            _getSliderData() {
                let _this = this;
                recommend.getData({}, function (res) {
                    _this.sliderData = res.slider;
                    _this.discList = res.songList;
                }, function (error) {
                    console.log(error);
                });
            },
            //等图片加载完毕，重置scroll，解决BScroll获取容器高度出问题， 但是现在好像不用了 <img……@load="loadImage" :src="item.picUrl">
            loadImage() {
                if (!this.checkloaded) {
                    this.checkloaded = true
                    this.$refs.scroll.refresh()
                }
            },
        },
        components: {
            Slider,
            Scroll,
            Loading
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~@/common/stylus/variable"

    .recommend
        position: fixed
        width: 100%
        top: 88px
        bottom: 0
        .recommend-content
            height: 100%
            overflow: hidden
            .slider-wrapper
                position: relative
                width: 100%
                overflow: hidden
            .recommend-list
                .list-title
                    height: 65px
                    line-height: 65px
                    text-align: center
                    font-size: $font-size-medium
                    color: $color-theme
                .item
                    display: flex
                    box-sizing: border-box
                    align-items: center
                    padding: 0 20px 20px 20px
                    .icon
                        flex: 0 0 60px
                        width: 60px
                        padding-right: 20px
                    .text
                        display: flex
                        flex-direction: column
                        justify-content: center
                        flex: 1
                        line-height: 20px
                        overflow: hidden
                        font-size: $font-size-medium
                        .name
                            margin-bottom: 10px
                            color: $color-text
                        .desc
                            color: $color-text-d
            .loading-container
                position: absolute
                width: 100%
                top: 50%
                transform: translateY(-50%)
</style>
