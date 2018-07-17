import {request} from '@/common/js/util'

export default {
    //获取搜索热词
    getHotKey(data,resolve,reject) {
        request({
            url     : 'hotKey.json',
            data    : data,
            success : resolve,
            error   : reject
        });
    },
    //获取搜索热词
    getSearchData(data,resolve,reject) {
        request({
            url     : `searchRes${data.p}.json`,
            data    : data,
            success : resolve,
            error   : reject
        });
    }
}
