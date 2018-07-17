<template>
    <div class="suggest">
        <ul class="suggest-list">
            <li class="suggest-item" v-for="item in result">
                <div class="icon">
                    <i :class="getIconCls(item)"></i>
                </div>
                <div class="name">
                    <p class="text" v-html="getDisplayName(item)"></p>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
    import Search from '@/api/search'
    import {filterSinger} from '@/common/js/song'

    const TYPE_SINGER = 'singer'

    export default {
        name: "suggest",
        data() {
            return {
                pageIndex: 1,
                result:[]
            }
        },
        props: {
            query: {
                type: String,
                default: ''
            },
            showSinger:{
                type:Boolean,
                default:true
            }
        },
        created(){
        },
        methods: {
            search() {
                let _this = this
                Search.getSearchData({query:this.query,p: this.pageIndex},function (res) {
                    _this.result = _this._genResult(res)
                },function (err) {
                    console.log(err);
                })
            },
            _genResult(data){
                let ret = []
                if(data.zhida && data.zhida.singerid){
                    ret.push({...data.zhida,...{type: TYPE_SINGER}})
                }
                if(data.song){
                    ret = ret.concat(data.song.list)
                }
                return ret
            },
            getIconCls(item){
                if(item.type === TYPE_SINGER){
                    return 'icon-mine'
                }else {
                    return 'icon-music'
                }
            },
            getDisplayName(item){
                if(item.type === TYPE_SINGER){
                    return item.singername
                }else {
                    return `${item.songname}-${filterSinger(item.singer)}`
                }
            }
        },
        watch: {
            query() {
                this.search()
            }
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~@/common/stylus/variable"
    @import "~@/common/stylus/mixin"

    .suggest
        height: 100%
        overflow: hidden
        .suggest-list
            padding: 0 30px
            .suggest-item
                display: flex
                align-items: center
                padding-bottom: 20px
            .icon
                flex: 0 0 30px
                width: 30px
                [class^="icon-"]
                    font-size: 14px
                    color: $color-text-d
            .name
                flex: 1
                font-size: $font-size-medium
                color: $color-text-d
                overflow: hidden
                .text
                    no-wrap()
        .no-result-wrapper
            position: absolute
            width: 100%
            top: 50%
            transform: translateY(-50%)
</style>
