<template>
  <footer>
    <div>
      <img src="@/assets/img/beian.png" class="police">
      <a href="https://beian.mps.gov.cn/#/query/webSearch?code=51012402001360" rel="noreferrer" target="_blank">川公网安备51012402001360</a>
    </div>
    <div>
      <a href="https://beian.miit.gov.cn" target="_blank">蜀ICP备2024071913号-2</a>
    </div>
    <div>
      <a href="https://mcpixelart.com/version.html">{{ `${lang.fb_version} ${version}` }}</a>
    </div>
    <div>
      <a href="https://mcpixelart.com/Privacy.html">{{ lang.fb_privacy }}</a>
    </div>
  </footer>
</template>

<script>
import { mapGetters,mapState } from 'vuex'
export default {
  name: 'FootBar',
  computed: {
    ...mapGetters(['lang']),
    ...mapState(['version']),
  },
}
</script>

<style scoped>
  footer{
    position: absolute;
    bottom: 5px;
    /* width: auto; */
    min-height: 32px;
    max-height: 64px;
    left: 50%;
    transform: translateX(-50%);

    padding: 0 16px;

    border-radius: 16px;

    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    align-items: center;
    background-color: #2f85fe70;

    gap: 10px;
  }

  .police{
    width: 16px;
    height: 16px;
  }

  a{
    color: inherit;
    text-decoration: none;
    background-color: transparent;
    border: none;
    transition: color .3s ease;
  }

  a:hover,a:focus{
    outline: none;
    color:rgb(238, 43, 137);
    text-decoration: none;
  }

  @media only screen and (max-width: 800px) {
    footer {
      left: auto;
      transform: none;
      height: auto;
      max-height: none;
    }
  }
  
</style>
