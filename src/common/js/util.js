import axios from 'axios'
import {ERR_OK, ERR_LOGIN, ERR_ERROR} from '@/api/config'

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

// 洗牌函数
export function shuffle(arr) {
    let _arr = arr.slice()      // _arr 等于arr副本，不影响原数组
    for (let i = 0; i < _arr.length; i++) {
        let j = getRandomInt(0, i)
        let t = _arr[i]
        _arr[i] = _arr[j]
        _arr[j] = t
    }
    return _arr
}

export function debounce(func, delay) {
    let timer

    return function (...args) {
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            func.apply(this, args)
        }, delay)
    }
}

export function request(param) {
    axios({
        method: param.methods || 'get',
        url: param.url,
        data: param.data || '',
    })
        .then(function (res) {
            if (ERR_OK === res.data.code) {
                typeof param.success === 'function' && param.success(res.data.data);
            } else if (ERR_LOGIN === res.data.code) {
                console.log('重新登录');
            } else if (ERR_ERROR === res.data.code) {
                typeof param.error === 'function' && param.error('出错鸟');
            }
        })
        .catch(function (err) {
            typeof param.error === 'function' && param.error(err);
        })
}
