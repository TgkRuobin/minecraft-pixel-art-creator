<template>
  <div class="outer">
    <div class="nav">
      <div class="nav-box">
        <img src="@/assets/img/favicon.png" alt="PX" style="height: 48px;width: 48px;">
        <h4>{{ lang.title }}</h4>
        <div>
          <img src="@/assets/img/语言切换.svg" alt="中文/English" style="height: 32px;width: 32px;" title="中文/English" @click="changeLanguage()">
          <img 
            src="@/assets/img/邮箱.svg" 
            :alt="lang.con_mail" 
            style="height: 32px;width: 32px;" 
            :title="lang.con_mail" 
          >
          <a :href="lang.con_github" target="_blank">
            <img 
              src="@/assets/img/github.svg" 
              alt="github" 
              style="height: 32px;width: 32px;" 
              title="github" 
            >
          </a>
        </div>
        
      </div>  
    </div>
    <main>
      <div class="bgc"></div>
      <div class="container">
        <div class="box borderShade" @click="$router.push('/2d')">
          <img src="@/assets/img/flat.png">
          <div class="shade">
            <div><h3>2D</h3></div>
            <h6>{{ lang.d2 }}</h6>
          </div>
        </div>
        <div class="box borderShade" @click="$router.push('/3d')">
          <img src="@/assets/img/3d.png">
          <img src="@/assets/img/新.svg" id="new">
          <div class="shade">
            <div><h3>3D</h3></div>
            <h6>{{ lang.d3 }}</h6>
          </div>
        </div>
      </div>
    </main>
    <FootBar></FootBar>
  </div>
</template>

<script>
import FootBar from '../components/FootBar.vue'
import { mapGetters,mapMutations } from 'vuex';
export default {
  name: 'HomePage',
  components: {
    FootBar,
  },
  computed: {
    ...mapGetters(['lang']),
  },
  methods: {
    ...mapMutations(['changeLanguage']),
  }
}
</script>

<style scoped>
  .outer{
    width: 100%;
    height: 100vh;
    position: relative;
    overflow: hidden;
  }
  .nav{
    position: fixed;
    left: 50%;
    top: 20px;
    width: 60%;
    border-radius: 10px;
    transform: translateX(-50%);
    backdrop-filter: blur(10px);
    
    background-color: transparent;
    display: grid;
    place-items: center;
    user-select: none;

    box-sizing: border-box;

    z-index: 1;
  }
  .nav-box{
    display: flex;
    padding: 10px;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
    color: white;
    gap: 10px;
    white-space: nowrap;
    width: 100%;
  }
  main{
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @keyframes slide{
    0% {
      transform: translate(-160px,-160px);
    }
    100% {
      transform: translate(160px,160px);
    }
  }
  main .bgc{
    position: absolute;
    top: -160px;
    left: -160px;
    width: calc(100% + 320px);
    height: calc(100% + 320px);
    background-image: url("@/assets/img/bg_purpose.png");
    animation: slide 10s linear infinite;
    z-index: -1;
  }

  .container{
    width: auto;
    display: flex;
    justify-content: center;
    flex-flow: row wrap;
  }

  .box{
    margin: 40px;
    border: none;
    border-radius: 16px;
    width: 240px;
    height: 320px;
    position: relative;
    overflow: hidden;
    user-select: none;
    cursor: pointer;
  }

  .box img{
    width: 100%;
    height: 100%;
    transition: transform .3s ease;
  }
  .borderShade{
    box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.7)
  }

  .box:hover img{
    transform: scale(1.1);
  }

  .box:hover .shade{
    height: 50%;
    top: 50%;
  }
  
  .box .shade{
    top: 60%;
    left: 0;
    width: 100%;
    height: 40%;
    background: linear-gradient(to top, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
    position: absolute;
    z-index: 2;

    display: flex;
    flex-flow: column nowrap;
    justify-content: space-evenly;
    align-items: center;
    font-size: 36px;
    color: rgb(232, 232, 232);
    transition: all .3s ease;
  }

  #new {
    position: absolute;
    right: 0;
    top: 0;
    width: 64px;
    height: 64px;
  }
</style>
