import {request} from '@/common/js/util'

export default {
    //获取歌手数据
    getData(data,resolve,reject) {
        request({
            url     : 'singer.json',
            data    : data,
            success : resolve,
            error   : reject
        });
    }
}
