import * as types from './mutations-type'

const matutaions  = {
    [types.SET_SINGER](state,singer){
        state.singer = singer
    }
}
export default matutaions