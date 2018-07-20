<template>
    <div ref="wrapper">
        <slot></slot>
    </div>
</template>

<script>
    import BScroll from 'better-scroll'

    export default {
        name: "scroll",
        props: {
            probeType: {
                type: Number,
                default: 1
            },
            click: {
                type: Boolean,
                default: true
            },
            data: {
                type: Array,
                default: null
            },
            listenScroll: {
                type: Boolean,
                default: false
            },
            pullUp:{   //是否实现上拉刷新
                type:Boolean,
                default:false
            },
            beforeScroll:{
                type:Boolean,
                default:false
            },
            refreshDelay:{   // 有些动画显示需要时间才能正常显示，so刷新重置时间动态管理
                type:Number,
                default:20
            }
        },
        mounted() {
            setTimeout(()=>{
                this._initScroll();
            },this.refreshDelay)
        },
        methods: {
            _initScroll(){
                if(!this.$refs.wrapper){
                    return
                }
                this.scroll = new BScroll(this.$refs.wrapper,{
                    probeType:this.probeType,
                    click : this.click
                })
                if(this.listenScroll){   //当开启 滚动监听 就给派发一个 scroll 事件 并传POS
                    let _this = this;
                    this.scroll.on('scroll',(pos)=>{
                        _this.$emit('scroll',pos);
                    })
                }
                if(this.pullUp){   //当开启 上拉加载 监听滚动结束 当滚动距离为最大的Y轴距离- 50 时候 就派发一个 scrollToEnd 事件 提示可以加载下一页
                    this.scroll.on('scrollEnd',()=>{
                        if(this.scroll.y <= this.scroll.maxScrollY + 50){
                            this.$emit('scrollToEnd')
                        }
                    })
                }
                if(this.beforeScroll){   // 监听 scroll 滚动之前，派发事件 可触发 input Blur() 可隐藏手机键盘
                    this.scroll.on('beforeScrollStart',()=>{
                        this.$emit('beforeScroll')
                    })
                }
            },
            enable(){
                this.scroll && this.scroll.enable();
            },
            disable(){
                this.scroll && this.scroll.disable();
            },
            refresh(){  //重置Scroll
                this.scroll && this.scroll.refresh();
            },
            scrollTo(){
                this.scroll && this.scroll.scrollTo.apply(this.scroll,arguments);
            },
            scrollToElement(){
                this.scroll && this.scroll.scrollToElement.apply(this.scroll,arguments);
            }
        },
        watch:{
            //监听数据变化 重置 scroll
            data(){
                setTimeout(()=>{
                    this.refresh();
                },20)
            }
        }
    }
</script>

<style scoped>

</style>
