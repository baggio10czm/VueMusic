import * as types from './mutations-type'
import {playMode} from '@/common/js/config'
import {shuffle} from "@/common/js/util";

// 找到 当前播放歌曲在 新的歌曲列表里面的index
function findIndex(list, song) {
    return list.findIndex((item) => {
        return item.id === song.id
    })
}

// 选择歌曲播放
export const selectPlay = function ({commit, state}, {list, index}) {
    commit(types.SET_SEQUENCE_LIST, list)
    if (state.mode === playMode.random) {              // 如果是 随机播放模式
        let randomList = shuffle(list)
        commit(types.SET_PLAYLIST, randomList)         // 播放列表变成 随机播放列表
        index = findIndex(randomList, list[index])     // 找到当前播放歌曲 在新的播放列表里的index
    }else {
        commit(types.SET_PLAYLIST, list)
    }
    commit(types.SET_CURRENT_INDEX, index)               // 播放选择的歌曲
    commit(types.SET_FULL_SCREEN, true)                 //  全屏播放
    commit(types.SET_PLAYING_STATE, true)               //  开始播放
}

// 全部歌曲随机播放
export const randomPlay = function ({commit}, {list}) {
    commit(types.SET_PLAY_MODE, playMode.random)     // 设置播放模式为随机
    commit(types.SET_SEQUENCE_LIST, list)            // 设置原播放列表数据
    let randomList = shuffle(list)                   // 生成随机播放列表
    commit(types.SET_PLAYLIST, randomList)
    commit(types.SET_CURRENT_INDEX, 0)               // 播放第一首
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}