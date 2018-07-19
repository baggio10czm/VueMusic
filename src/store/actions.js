import * as types from './mutations-type'
import {playMode} from '@/common/js/config'
import {shuffle} from "@/common/js/util";
import {saveSearch, deleteSearch, clearSearch} from "@/common/js/cache";

// 找到 当前播放歌曲在 新的歌曲列表里面的index
function findIndex(list, song) {
    return list.findIndex((item) => {
        return item.id === song.id
    })
}

// 点击歌曲播放
export const selectPlay = function ({commit, state}, {list, index}) {
    commit(types.SET_SEQUENCE_LIST, list)
    if (state.mode === playMode.random) {              // 如果是 随机播放模式
        let randomList = shuffle(list)
        commit(types.SET_PLAYLIST, randomList)         // 播放列表变成 随机播放列表
        index = findIndex(randomList, list[index])     // 找到当前播放歌曲 在新的播放列表里的index
    } else {
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

// 添加一首歌 并播放
export const insertSong = function ({commit, state}, song) {
    let playList = state.playList.slice()           //  slice 创建一个副本，为了不修改原数组，
    let sequenceList = state.sequenceList.slice()
    let currentIndex = state.currentIndex
    //记录当前歌曲
    let cuurentSong = playList[currentIndex]
    //查找当前列表中，是否有当前待插入的歌曲并返回所以
    let findPlayIndex = findIndex(playList, song)
    //因为是插入歌曲，所以索引+1
    currentIndex++
    // 插入这首歌到当前索引+1的位置
    playList.splice(currentIndex, 0, song)
    // 如果已包含了这首歌
    if (findPlayIndex > -1) {
        // 如果当前插入的索引 大于插入歌曲所在索引
        if (currentIndex > findPlayIndex) {
            playList.splice(findPlayIndex, 1)
            currentIndex--   // 因为当前插入位置前面删了一首歌 所以 -1
        } else {
            playList.splice(findPlayIndex + 1, 1)   // 因为当前插入位置前面添加一首歌 所以 findPlayIndex + 1 才是正确索引位置
        }
    }
    // 得到当前 sequenceList 当前歌的索引   然后 +1
    let currentSIndex = findIndex(sequenceList, cuurentSong) + 1

    // 查找插入歌曲是否在 sequenceList 里
    let fsIndex = findIndex(sequenceList, song)

    // 在 sequenceList 添加插入歌曲
    sequenceList.splice(currentSIndex, 0, song)

    // 如果插入歌曲在 sequenceList 已存在
    if (fsIndex > -1) {
        if (currentSIndex > fsIndex) {
            sequenceList.splice(fsIndex, 1)
        } else {
            sequenceList.splice(fsIndex + 1, 1)
        }
    }
    commit(types.SET_PLAYLIST, playList)
    commit(types.SET_SEQUENCE_LIST, sequenceList)
    commit(types.SET_CURRENT_INDEX, currentIndex)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}

// 保存搜索结果
export const saveSearchHistory = function ({commit}, query) {
    commit(types.SET_SEARCH_HISTORY, saveSearch(query))   // saveSearch(query) 不仅实现了保存缓存，还会返回新的数据（数组）
}

// 删除搜索结果
export const deleteSearchHistory = function ({commit}, query) {
    commit(types.SET_SEARCH_HISTORY, deleteSearch(query))   // deleteSearch(query) 不仅实现了删除缓存，还会返回新的数据（数组）
}

// 清空搜索结果
export const clearSearchHistory = function ({commit}) {
    commit(types.SET_SEARCH_HISTORY, clearSearch())   // deleteSearch(query) 不仅实现了删除缓存，还会返回新的数据（数组）
}

// 删除歌曲
export const deleteSong = function ({commit, state}, song) {
    let playList = state.playList.slice()
    let sequenceList = state.sequenceList.slice()
    let currentIndex = state.currentIndex

    // 找到选择歌曲在播放列表的位置并删除
    let pIndex = findIndex(playList, song)
    playList.splice(pIndex, 1)

    // 找到选择歌曲在顺序列表的位置并删除
    let sIndex = findIndex(sequenceList, song)
    sequenceList.splice(sIndex, 1)

    // 当前播放的索引 大于 选定歌曲在播放列表序列 or 删除的是最后一首歌曲时：当前播放索引-1
    if (currentIndex > pIndex || currentIndex === playList.length) {
        currentIndex--
    }

    commit(types.SET_PLAYLIST, playList)
    commit(types.SET_SEQUENCE_LIST, sequenceList)
    commit(types.SET_CURRENT_INDEX, currentIndex)

    const playingState = playList.length > 0

    // 当删完以后停止播放
    commit(types.SET_PLAYING_STATE, playingState)
}

export const deleteSongList = function ({commit}) {
    commit(types.SET_PLAYLIST, [])
    commit(types.SET_SEQUENCE_LIST, [])
    commit(types.SET_CURRENT_INDEX, -1)
    commit(types.SET_PLAYING_STATE, false)
}
