<template>
    <Scroll class="suggest"
            :data="result"
            :pullUp="pullUp"
            :beforeScroll="beforeScroll"
            @scrollToEnd="searchMore"
            @beforeScroll="listScroll"
            ref="suggest">
        <ul class="suggest-list">
            <li class="suggest-item" v-for="item in result" @click="selectItem(item)">
                <div class="icon">
                    <i :class="getIconCls(item)"></i>
                </div>
                <div class="name">
                    <p class="text" v-html="getDisplayName(item)"></p>
                </div>
            </li>
            <Loading v-show="hasMore" title=""></Loading>
        </ul>
        <div class="no-result-wrapper" v-show="!hasMore && !result.length">
            <NoResult title="抱歉，暂无搜索结果"></NoResult>
        </div>
    </Scroll>
</template>

<script>
    import Search from '@/api/search'
    import Scroll from '@/base/scroll/scroll'
    import {createSong} from '@/common/js/song'
    import Loading from '@/base/loading/loading'
    import Singer from '@/common/js/singer'
    import NoResult from '@/base/no-result/no-result'
    import {mapMutations,mapActions} from 'vuex'

    const TYPE_SINGER = 'singer'

    export default {
        name: "suggest",
        data() {
            return {
                pageIndex: 1,
                result: [],
                pullUp: true,
                hasMore: true,
                beforeScroll:true
            }
        },
        props: {
            query: {
                type: String,
                default: ''
            },
            showSinger: {
                type: Boolean,
                default: true
            }
        },
        created() {
        },
        methods: {
            search() {
                let _this = this
                this.hasMore = true    // 重置 hasMore 为 可加载更多
                this.pageIndex = 1    // 重置 pageIndex 为 1
                this.$refs.suggest.scrollTo(0, 0)   // 每次重新搜索需重置 scroll 位置到顶部
                Search.getSearchData({query: this.query, p: this.pageIndex}, function (res) {
                    _this.result = _this._genResult(res)
                    _this._checkMore(res)  //在这里没啥用 ，因为不是调接口的
                }, function (err) {
                    console.log(err);
                })
            },
            searchMore() {
                if (!this.hasMore) {
                    return false
                }
                this.pageIndex++
                let _this = this
                Search.getSearchData({query: this.query, p: this.pageIndex}, function (res) {
                    _this.result = _this.result.concat(_this._genResult(res))
                    if (_this.pageIndex === 3) {   // 因为项目数据是 死的 json 文件 只有3个 加载文件名字为 固定名+pageIndex.json 所以等于3时 就不能加载更多了
                        _this.hasMore = false
                    }
                }, function (err) {
                    console.log(err);
                })
            },
            _checkMore(data) {  //验证是否还有更多页码  当index * size 大于或 等于 歌曲总数的时候 就没有加载更多了
                const song = data.song
                if (!song.list.length || (song.curnum + song.curpage * 20) >= song.totalnum) {
                    this.hasMore = false
                }
            },
            _genResult(data) {  // 处理获取的搜索数据
                let ret = []
                if (data.zhida && data.zhida.singerid) {
                    ret.push({...data.zhida, ...{type: TYPE_SINGER}})
                }
                if (data.song) {
                    ret = ret.concat(this._normalizeSongs(data.song.list))
                }
                return ret
            },
            getIconCls(item) {  // 根据是否是歌手数据  设置不同 class
                if (item.type === TYPE_SINGER) {
                    return 'icon-mine'
                } else {
                    return 'icon-music'
                }
            },
            getDisplayName(item) {  // 根据是否是歌手数据 返回不同数据
                if (item.type === TYPE_SINGER) {
                    return item.singername
                } else {
                    return `${item.name}-${item.singer}`
                }
            },
            _normalizeSongs(list) {   // 处理歌曲数据
                let ret = []
                list.forEach((musicData) => {
                    if (musicData.songid && musicData.albumid) {
                        ret.push(createSong(musicData))
                    }
                })
                return ret
            },
            selectItem(item){   // 点击结果处理
                //如果是歌手数据 就跳歌手页 并更新 vuex 歌手数据
                if(item.type === TYPE_SINGER){
                    const singer = new Singer({
                        id: item.singermid,
                        name:item.singername
                    })
                    this.$router.push({
                        path: `/search/${singer.id}`
                    })
                    this.setSinger(singer)
                }else {
                    //如果是歌曲数据 就调用 vuex actions 的 insertSong 插入歌曲到播放列表并全屏播放
                    this.insertSong(item)
                }
                this.$emit('select')
            },
            ...mapMutations({
                setSinger:'SET_SINGER'    // 设置歌手
            }),
            ...mapActions([
                'insertSong'     //插入歌曲
            ]),
            listScroll(){   // 当列表滚动前，派发listScroll事件处理 input Blur() 手机键盘隐藏，改善手机体验
                this.$emit('listScroll')
            },
            refresh(){
                this.$refs.suggest.refresh()
            }
        },
        watch: {
            query() {  //监听 query 变化以后触发search方法
                this.search()
            }
        },
        components: {
            Scroll,
            Loading,
            NoResult
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
