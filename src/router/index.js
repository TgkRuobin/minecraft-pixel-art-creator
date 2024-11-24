import Vue from 'vue'
import VueRouter from 'vue-router'

const HomePage = ()=> import('@/views/HomePage.vue')
const DimTwo   = ()=> import('@/views/DimTwo.vue')
const DimThree = ()=> import('@/views/DimThree.vue')
const BedRock  = ()=> import('@/views/BedRock.vue')
const Page404  = ()=> import('@/views/NotFound.vue')

Vue.use(VueRouter)

const router = new VueRouter({
  routes:[
    {path: '/', component: HomePage},
    {path: '/2d', component: DimTwo},
    {path: '/3d', component: DimThree},
    {path: '/bedrock', component: BedRock},
    {path: '*', component: Page404},
  ]
})

export default router