import singer from '@/api/singer'
import {ERR_OK} from '@/api/config'
import {Base64} from 'js-base64'

export default class Song {
    constructor({id, mid, singer, name, album, duration, image, url}) {
        this.id = id
        this.mid = mid
        this.singer = singer
        this.name = name
        this.album = album
        this.duration = duration
        this.image = image
        this.url = url
    }

    getLyric() {
        if (this.lyric) {    // 当有歌词时候 直接返回 防止 currentSong 变化重复请求
            return Promise.resolve(this.lyric)
        }
        return new Promise((resolve, reject) => {
            singer.getLyricData({mid:this.mid},function (res) {
                this.lyric = Base64.decode(res)// 数据需调用 Base64 转换成字符串
                resolve(this.lyric );
            },function (err) {
                reject('歌词出错！');
            })
        })
    }
}

export function createSong(musicData) {
    return new Song({
        id: musicData.songid,
        mid: musicData.songmid,
        singer: filterSinger(musicData.singer),
        name: musicData.songname,
        album: musicData.albumname,
        duration: musicData.interval,
        image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
        url: `http://ws.stream.qqmusic.qq.com/C100${musicData.songmid}.m4a?fromtag=0&guid=126548448`
    })
}

export function filterSinger(singer) {
    let ret = []
    if (!singer) {
        return ''
    }
    singer.forEach((s) => {
        ret.push(s.name)
    })
    return ret.join('/')
}

