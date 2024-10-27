import Vue from 'vue'
import VueRouter from 'vue-router'

import HomePage from '@/views/HomePage.vue'
import DimTwo from '@/views/DimTwo.vue'
import DimThree from '@/views/DimThree.vue'
import Page404 from '@/views/NotFound.vue'
Vue.use(VueRouter)

const router = new VueRouter({
  routes:[
    {path: '/', component: HomePage},
    {path: '/2d', component: DimTwo},
    {path: '/3d', component: DimThree},
    {path: '*', component: Page404},
  ]
})

export default router