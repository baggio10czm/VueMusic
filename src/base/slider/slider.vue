<template>
    <div class="slider" ref="slider">
        <div class="slider-group" ref="sliderGroup">
            <slot></slot>
        </div>
        <div class="dots">
            <span class="dot" v-for="(item,index) in dots" :class="{active:currentPageIndex === index}"></span>
        </div>
    </div>
</template>

<script>
    import BScroll from 'better-scroll'
    import {addClass} from '@/common/js/dom'
    export default {
        name: "slider",
        props:{
            loop: {
                type: Boolean,
                default: true
            },
            autoPlay: {
                type: Boolean,
                default: true
            },
            interval: {
                type: Number,
                default: 4000
            }
        },
        data(){
            return {
                dots:[],
                currentPageIndex:0
            }
        },
        mounted(){
            setTimeout(() =>{
                this._setSliderWidth();
                this._initDots();
                this._initSlider();
                if(this.autoPlay){
                    this._paly();
                }
            },20);
            window.addEventListener('resize',()=>{
                if(!this.slider){
                    return
                }
                this._setSliderWidth(true);
                this.slider.refresh();
            })
        },
        methods:{
            _setSliderWidth(isResize){
                this.children = this.$refs.sliderGroup.children;
                let width = 0;
                let sliderWidth = this.$refs.slider.clientWidth;
                for (let i = 0; i < this.children.length; i++) {
                    let child = this.children[i];
                    addClass(child,'slider-item');
                    child.style.width = sliderWidth + 'px';
                    width += sliderWidth;
                }
                if(this.loop && !isResize){  // 重置以后 width 会是真实的数量 7  所以不需要 + 2 了
                    width += 2 * sliderWidth;
                }
                this.$refs.sliderGroup.style.width = width + 'px';
            },
            _initDots(){
                this.dots = new Array(this.children.length);
            },
            _initSlider(){
                this.slider = new BScroll(this.$refs.slider,{
                    scrollX : true,
                    scrollY : false,
                    momentum : false,
                    snap : {  // BScroll 新版本写法
                        loop: true
                    },
                    click : true
                });
                this.slider.on('scrollEnd',()=>{
                    this.currentPageIndex = this.slider.getCurrentPage().pageX;
                    if(this.autoPlay){
                        clearTimeout(this.timer);
                        this._paly();
                    }
                })
            },
            _paly(){
                let pageIndex = this.currentPageIndex + 1;
                if (pageIndex >= 5) {
                    pageIndex = 0;
                }
                this.timer = setTimeout(()=>{
                    this.slider.goToPage(pageIndex,0,400)
                },this.interval)
            }
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~@/common/stylus/variable"

  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>
