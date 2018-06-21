import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import store from './store/index'
import fastclick from 'fastclick'
import VueLazyLoad from 'vue-lazyload'

Vue.config.productionTip = false

import '@/common/stylus/index.styl'

fastclick.attach(document.body)

Vue.use(VueLazyLoad,{
    error: require('@/common/image/default.png'),
    loading: require('@/common/image/default.png')
})

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')
