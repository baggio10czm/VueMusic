<template>
    <transition name="slide">
        <MusicList :rank="rank" :title="title" :bg-image="bgImage" :songs="songs"></MusicList>
    </transition>
</template>

<script>
    import MusicList from '@/components/music-list/music-list'
    import { mapGetters } from 'vuex'
    import Rank from '@/api/rank'
    import {createSong} from '@/common/js/song'

    export default {
        name: "top-list",
        data() {
            return {
                songs: [],
                rank : true
            }
        },
        created() {
            this._getSongs()
        },
        methods: {
            _getSongs() {
                let _this = this;
                // 用户刷新页面没有 歌手ID 就返回歌手列表
                if (!this.topList.id) {
                    this.$router.push('/rank')
                    return
                }
                Rank.getRankSongs({data: {id: this.topList.id}}, function (res) {
                    _this.songs = _this._normalizeSongs(res.songlist);
                }, function (err) {
                    console.log(err);
                })
            },
            _normalizeSongs(list) {
                let ret = []
                list.forEach((item) => {
                    const musicData = item.data
                    if (musicData.songid && musicData.albummid) {
                        //  createSong 依赖 song 里面的 类 （减少了很多代码）
                        ret.push(createSong(musicData))
                    }
                })
                return ret;
            }
        },
        computed: {
            title() {
                return this.topList.topTitle
            },
            bgImage() {
                if(this.songs.length){
                    return this.songs[0].image
                }
            },
            ...mapGetters([
                'topList'
            ])
        },
        components: {
            MusicList
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    .slide-enter-active, .slide-leave-active
        transition: all 0.3s

    .slide-enter, .slide-leave-to
        transform: translate3d(100%, 0, 0)
</style>
