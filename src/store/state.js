import {playMode} from '@/common/js/config'
import {loadSearch,loadPlay,loadFavorite} from "../common/js/cache";

const state = {
    singer: {},
    playing: false,
    fullScreen: false,
    playList: [],
    sequenceList: [],
    mode: playMode.sequence,
    currentIndex: -1,
    disc:{},
    topList:{},
    searchHistory: loadSearch(), //每次初始值从缓存中拿,就比较真实提现了数据的变化,不会每次刷新页面 prev state 都是 searchHistory:[]
    playHistory: loadPlay(),
    favoriteList:loadFavorite()
}

export default state
