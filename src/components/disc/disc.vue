<template>
    <transition name="slide">
        <MusicList :title="title" :bg-image="bgImage" :songs="songs"></MusicList>
    </transition>
</template>

<script>
    import MusicList from '@/components/music-list/music-list'
    import {mapGetters} from 'vuex'
    import {createSong} from "@/common/js/song"
    import singer from "@/api/singer"

    export default {
        name: "disc",
        data(){
            return{
                songs : []
            }
        },
        created(){
          this._getSongList();
        },
        computed:{
            title(){
              return this.disc.title
            },
            bgImage(){
                return this.disc.cover
            },
            ...mapGetters([
                'disc'
            ])
        },
        methods:{
          _getSongList(){
              // 用户刷新页面 如没有推荐id 就返回推荐列表
              if (!this.disc.content_id) {
                  this.$router.push('/recommend')
                  return
              }
              let _this = this;
              singer.getDetail({dissid: this.disc.content_id}, function (res) {
                  _this.songs = _this._normalizeSongs(res.list)
              }, function (err) {
                  console.log(err);
              })
          },
            // 处理 歌曲数据
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
        components:{
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
