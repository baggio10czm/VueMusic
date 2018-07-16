import {request} from '@/common/js/util'

export default {
    //获取排行列表
    getData(data,resolve,reject) {
        request({
            url     : 'rank.json',
            data    : data,
            success : resolve,
            error   : reject
        });
    },
    //获取排行详情歌单
    getRankSongs(data,resolve,reject) {
        request({
            url     : 'rankSongs.json',
            data    : data,
            success : resolve,
            error   : reject
        });
    }
}
