<template>
    <div class="singer">
        <ListView :data="singers"></ListView>
    </div>
</template>

<script>
    import singer from "@/api/singer.js";
    import singerClass from "@/common/js/singer.js";
    import ListView from "@/base/listview/listview";

    const HOT_NAME = '热门'
    const HOT_SINGER_IEN = 10

    export default {
        name: "singer",
        data(){
            return{
                singers:[]
            }
        },
        created(){
            this._getSingerList();
        },
        methods:{
            _getSingerList(){
                let _this = this;
                singer.getData({},function (res) {
                    _this.singers = _this._normalizeSinger(res.singerlist);
                },function (err) {
                    console.log(err);
                })
            },
            _normalizeSinger(list){
                let map = {
                    hot : {
                        title:HOT_NAME,
                        items:[]
                    }
                };
                list.forEach((item,index)=>{
                    if(index < HOT_SINGER_IEN){
                        map.hot.items.push(new singerClass({
                            id:item.singer_mid,
                            name:item.singer_name
                        }))
                    }
                    let key = item.Findex
                    if(!map[key]){
                        map[key] = {
                            title:key,
                            items:[]
                        }
                    }
                    map[key].items.push(new singerClass({
                        id:item.singer_mid,
                        name:item.singer_name
                    }))
                })
                //为了得到有序列表，需要处理 map
                let hot = []
                let ret = []
                for(let key in map){
                    let val = map[key]
                    if (val.title.match(/[a-zA-Z]/)) {
                        ret.push(val)
                    } else if (val.title === HOT_NAME) {
                        hot.push(val)
                    }
                }
                // 排序处理  charCodeAt() 方法可返回指定位置的字符的 Unicode 编码
                ret.sort((a,b)=>{
                    return a.title.charCodeAt(0) - b.title.charCodeAt(0)
                })
                return hot.concat(ret);
            }
        },
        components:{
            ListView
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    .singer
        position: fixed
        top: 88px
        bottom: 0
        width: 100%
</style>
