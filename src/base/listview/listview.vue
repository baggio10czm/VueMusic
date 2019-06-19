<template>
    <Scroll class="listview"
            :data="data"
            ref="listView"
            :listenScroll="listenScroll"
            :probeType="probeType"
            @scroll="scroll">
        <!--歌手列表-->
        <ul>
            <!-- ref="listGroup" 方便后面获取所有li的dom 并用 scrollToElement 指向跳转 -->
            <li v-for="group in data" class="list-group" ref="listGroup">
                <h2 class="list-group-title">{{group.title}}</h2>
                <ul>
                    <li @click="selectItem(item)" v-for="item in group.items" class="list-group-item">
                        <img class="avatar" v-lazy="item.avatar">
                        <span class="name">{{item.name}}</span>
                    </li>
                </ul>
            </li>
        </ul>
        <!--歌手列表 end-->
        <!--字幕导航-->
        <!-- @touchstart="" 移动端点击;  @touchmove="" 移动端移动 .stop 阻止冒泡  .prevent 阻止浏览器默认行为  -->
        <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
            <ul>
                <!-- :data-index="index" 记录index值,方便跳转使用-->
                <li v-for="(item,index) in shortcutList" :class="['item',currentIndex===index?'current':'']" :data-index="index">
                    {{item}}
                </li>
            </ul>
        </div>
        <!--字幕导航 end-->
        <!--固定标题-->
        <div class="list-fixed" v-show="fixedTitle" ref="fixed">
            <h1 class="fixed-title">{{fixedTitle}}</h1>
        </div>
        <!--固定标题 end-->
        <!--loading-->
        <div v-show="!data.length" class="loading-container">
            <loading></loading>
        </div>
        <!--loading end-->
    </Scroll>
</template>

<script>
    import Scroll from '@/base/scroll/scroll'
    import Loading from '@/base/loading/loading'
    import {getData} from '@/common/js/dom'

    const ANCHOR_HEIGHT = 18
    const TITLE_HEIGHT = 30

    export default {
        name: "listview",
        data() {
            return {
                scrollY: -1,
                currentIndex: 0,
                diff:0
            }
        },
        props: {
            data: {
                type: Array,
                default: []
            }
        },
        created() {
            // 这些不写在data 里面申明 是因为不需要给vue监听值变化
            this.touch = {};
            this.listenScroll = true;  // 是否监听 scroll
            this.listHeight = [];    // 保存 listGroup 的 scrollY 值
            this.probeType = 3;  //需要实时监听 scroll 返回数据 必须设置3
        },
        computed: {
            // 字母导航内容数组
            shortcutList() {
                return this.data.map((item) => {
                    return item.title.substring(0, 1); //有些内容长度大于2 所以需要截取
                })
            },
            // 固定title 显示内容
            fixedTitle(){
                //固定title 当上拉时 scrollY 小于0 时不固定
                if(this.scrollY > 0 ){
                    return ''
                }
                // 三元判断防止报错,获得当前 title 内容展示在 title 里
                return this.data[this.currentIndex]? this.data[this.currentIndex].title:'';
            }
        },
        methods: {
            onShortcutTouchStart(e) {
                let anchorIndex = getData(e.target, 'index'); // Touch点击时候获得 当前索引值
                this.touch.y1 = e.touches[0].pageY;  //  起始点击坐标 记录在 touch.y1
                this.touch.anchorIndex = anchorIndex; // 通过getData得到的index值是 字符串 后面需要 parseInt 再相加
                this._scrollTo(anchorIndex);
            },
            onShortcutTouchMove(e) {
                this.touch.y2 = e.touches[0].pageY;  // Touch 移动后的Y坐标记录在 touch.y2
                let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0; // 坐标相减 除以 每个高度;  | 0 等于向下取整
                let anchorIndex = parseInt(this.touch.anchorIndex) + delta;  //当前index 等于原来的+ 最新计算出来的
                this._scrollTo(anchorIndex);
            },
            refresh(){
                this.$refs.listView.refresh()
            },
            // scroll 组件暴露出来 pos 得到实时的Y坐标
            scroll(pos) {
                this.scrollY = pos.y;
            },
            // 字母导航 跳转用
            _scrollTo(index) {
                if(!index && index !== 0){  //index 等于null 又不是0的时候 return
                    return
                }
                //当 toucheMove 在 字母导航时, 同步计算时 index 可能小于0,可能大于 this.listHeight.length - 2
                if(index < 0 ){
                    index = 0
                }else if(index > this.listHeight.length - 2){
                    index = this.listHeight.length - 2
                }
                this.scrollY = -this.listHeight[index];     //点击时,把 scrollY 的值更新,让 this.currentIndex 更新
                this.$refs.listView.scrollToElement(this.$refs.listGroup[index], 0)   //调用scroll 组件封装好的方法
            },
            // 把所有 listGroup 的滚动值保存在数组
            _calculateHeight() {
                this.listHeight = [];
                const list = this.$refs.listGroup;
                let height = 0;
                this.listHeight.push(height);
                for (let i = 0; i < list.length; i++) {
                    height += list[i].clientHeight;
                    this.listHeight.push(height);
                }
            },
            //点击歌手 派发事件
            selectItem(item){
                this.$emit('select',item)
            }
        },
        watch: {
            //数据更新 重置所有 listGroup 的滚动值
            data() {
                setTimeout(() => {
                    this._calculateHeight();
                }, 20)
            },
            // 监听 scrollY 变化
            scrollY(newY) {
                const listHeight = this.listHeight;
                //当滚动到底部 ,newY >0
                if(newY > 0){
                    this.currentIndex = 0;
                    return
                }
                //当滚动到中间
                for (let i = 0; i < listHeight.length - 1; i++) {
                    let height1 = listHeight[i];
                    let height2 = listHeight[i + 1];
                    //  newY是负值 需要加- 来判断在哪个 listGroup 区间
                    if (-newY >= height1 && -newY < height2) {
                        this.currentIndex = i;          //满足条件 当前index更新
                        this.diff = height2 + newY;   //diff 是用来判断 是否需要做title移动动画, newY是负值 (下个区间高度-当前高度)
                        return
                    }
                }
                //当滚动到底部 且 -newY 大于最后一个元素的上限, -2 是因为 listHeight + 一个初始值0,
                this.currentIndex = listHeight.length - 2;
            },
            diff(newVal){
                // 当 newVal 大于0 且 小于标题高度时 做偏移动画
                let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT)? newVal - TITLE_HEIGHT : 0;
                // 再不需要偏移的时候 return 不做下面的dom操作 性能提升…… 个人觉得在上一步 0 哪里就可以return？
                if (this.fixedTop === fixedTop) {
                    return
                }
                this.fixedTop = fixedTop;
                this.$refs.fixed.style.transform =`translate3d(0,${fixedTop}px,0)`
            }
        },
        components: {
            Scroll,
            Loading
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~@/common/stylus/variable"

    .listview
        position: relative
        width: 100%
        height: 100%
        overflow: hidden
        background: $color-background
        .list-group
            padding-bottom: 30px
            .list-group-title
                height: 30px
                line-height: 30px
                padding-left: 20px
                font-size: $font-size-small
                color: $color-text-l
                background: $color-highlight-background
            .list-group-item
                display: flex
                align-items: center
                padding: 20px 0 0 30px
                .avatar
                    width: 50px
                    height: 50px
                    border-radius: 50%
                .name
                    margin-left: 20px
                    color: $color-text-l
                    font-size: $font-size-medium
        .list-shortcut
            position: absolute
            z-index: 30
            right: 0
            top: 50%
            transform: translateY(-50%)
            width: 20px
            padding: 20px 0
            border-radius: 10px
            text-align: center
            background: $color-background-d
            font-family: Helvetica
            .item
                padding: 3px
                line-height: 1
                color: $color-text-l
                font-size: $font-size-small
                &.current
                    color: $color-theme
        .list-fixed
            position: absolute
            top: 0
            left: 0
            width: 100%
            .fixed-title
                height: 30px
                line-height: 30px
                padding-left: 20px
                font-size: $font-size-small
                color: $color-text-l
                background: $color-highlight-background
        .loading-container
            position: absolute
            width: 100%
            top: 50%
            transform: translateY(-50%)
</style>
