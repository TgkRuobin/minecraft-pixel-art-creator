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
    if (lang) {
      this.changeLanguage(lang)
    } else {
      // 如果cookie里没有hist-lang 需要进行初始化
      const browserLang = navigator.language || navigator.userLanguage
      if (!browserLang) {
        //如果浏览器不支持navigtor.language 设置为中文
        this.changeLanguage('lang_cn')
      }else if (browserLang.toLowerCase().includes('zh')) {
        //如果包含zh字样为中文
        this.changeLanguage('lang_cn')
      }else {
        // 其他情况都为英文
        this.changeLanguage('lang_en')
      }
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
    width: 100%;
  }
</style>
