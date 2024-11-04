<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import Cookies from 'js-cookie'
import { mapMutations } from 'vuex';
export default {
  created() {
    if (!Cookies.get('hist-id')) {
      Cookies.set('hist-id',this.generateId(), { expires: new Date('Sat, 01 Jan 2037 00:00:00 UTC') })
    }
    const lang = Cookies.get('hist-lang')
    //如果不是中文则切换到英文 (默认为中文)
    if (lang !== 'lang_cn') {
      this.changeLanguage()
    }
    
  },
  methods: {
    ...mapMutations(['changeLanguage']),
    generateId() {
      return `${Date.now()}_${Math.floor(Math.random() * 100000)}`
    }
  }
}
</script>

<style>
  *{
    margin: 0;
    padding: 0;
  }

  #app{
    position: relative;
    /* overflow: hidden */
  }
</style>
