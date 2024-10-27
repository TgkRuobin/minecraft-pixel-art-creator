<template>
  <nav>
    <!-- 背景图 走马灯 -->
    <img src="@/assets/img/navbg50.png" :class="{'stop-anim': pause,bg: true}">
    <!-- logo -->
    <div style="display: flex;flex-flow: row nowrap;align-items: center;" class="blur">
      <img src="@/assets/img/favicon.png" alt="PX" style="height: 48px;width: 48px;">
      <h4>{{ lang.title }}</h4>
    </div>
    <div class="blur right-bottom">
      <img 
        src="@/assets/img/帮助中心.svg" 
        :alt="lang.help" 
        style="height: 28px;width: 28px;" 
        :title="lang.help"
        @click="handlerHelp"
      >
      <img 
        src="@/assets/img/语言切换.svg" 
        alt="中文/English" 
        style="height: 32px;width: 32px;" 
        title="中文/English" 
        @click="changeLanguage()"
      >
      
    </div>
  </nav>
</template>

<script>
import { mapGetters,mapMutations } from 'vuex';
export default {
  name: 'NavBar',
  methods: {
    ...mapMutations(['changeLanguage']),
    handlerHelp(){
      this.$emit('help')
    }
  },
  computed: {
    ...mapGetters(['lang']),
  },
  props: {
    //是否播放走马灯
    pause: {
      type: Boolean,
      default: false,
    },
  }
}
</script>

<style scoped>
  @font-face {
    font-family: Minecraft;
    src: url('@/assets/font/Minecraft.woff2') format('woff2');
  }
  nav{
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 800px;
    height: 112px;

    display: flex;
    flex-flow: row nowrap;

    align-items: center;

    z-index: 2;
    overflow: hidden;

    color: rgb(226, 226, 226);
    user-select: none;
    font-family: Minecraft,serif;
  }
  .blur{
    backdrop-filter: blur(2px);
    padding: 5px;
    border-radius: 10px;
  }
  .bg{
    position: absolute;
    /* object-position: left; */
    z-index: -1;
    height: 112px;
    animation: slide 30s infinite linear;
  }
  .right-bottom{
    position: absolute;
    bottom: 0;
    right: 0;
  }
  .stop-anim{
    animation-play-state: paused;
  }
  @keyframes slide{
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-1120px);
    }
  }
</style>
