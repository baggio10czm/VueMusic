import {request} from '@/common/js/util'

export default {
    //获取歌手详情数据
    getData(data,resolve,reject) {
        request({
            url     : 'singer.json',
            data    : data,
            success : resolve,
            error   : reject
        });
    },
    //获取歌手数据
    getDetail(data,resolve,reject) {
        request({
            url     : 'singerDetail.json',
            data    : data,
            success : resolve,
            error   : reject
        });
    },
    //获取歌词
    getLyricData(data,resolve,reject) {
        request({
            url     : 'lyric.json',
            data    : data,
            success : resolve,
            error   : reject
        });
    }
}
