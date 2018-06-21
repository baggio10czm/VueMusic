import {request} from '@/common/js/util'

export default {
    //获取推荐数据
    getData(data,resolve,reject) {
        request({
            url     : 'recommend.json',
            data    : data,
            success : resolve,
            error   : reject
        });
    }
}
