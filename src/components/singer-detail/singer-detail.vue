<template>
    <transition name="slide">
        <MusicList :title="title" :bgImage="bgImage" :songs="songs"></MusicList>
    </transition>
</template>

<script>
    import {mapGetters} from 'vuex'
    import singer from "@/api/singer"
    import {createSong} from "@/common/js/song"
    import MusicList from "@/components/music-list/music-list"

    export default {
        data() {
            return {
                songs: []
            }
        },
        computed: {
            title() {
                return this.singer.name
            },
            bgImage() {
                return this.singer.avatar
            },
            ...mapGetters([
                'singer'
            ])
        },
        created() {
            this.getDetail();
        },
        methods: {
            getDetail() {
                let _this = this;
                // 用户刷新页面没有 歌手ID 就返回歌手列表
                if (!this.singer.id) {
                    this.$router.push('/singer')
                    return
                }
                // 歌手详情
                singer.getDetail({singerId: this.singer.id}, function (res) {
                    _this.songs = _this._normalizeSongs(res.list)
                }, function (err) {
                    console.log(err);
                })
            },
            // 处理 歌手歌曲数据
            _normalizeSongs(list) {
                let ret = []
                list.forEach((item) => {
                    let {musicData} = item
                    if (musicData.songid && musicData.albummid) {
                        //  createSong 依赖 song 里面的 类 （减少了很多代码）
                        ret.push(createSong(musicData))
                    }
                })
                return ret;
            }
        },
        components: {
            MusicList
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~@/common/stylus/variable"

    .slide-enter-active, .slide-leave-active
        transition: all 0.3s

    .slide-enter, .slide-leave-to
        transform: translate3d(100%, 0, 0)
</style>