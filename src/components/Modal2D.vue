<template>
  <div v-show="visible" class="outer-2d">
    <svg t="1729738484620" @click="handlerClose" class="close-2d" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4264" width="48" height="48">
      <path d="M512 0C229.2992 0 0.11776 229.18144 0.11776 511.88224c0 282.69568 229.18656 511.88224 511.88224 511.88224 282.7008 0 511.88224-229.18656 511.88224-511.88224C1023.88224 229.18144 794.7008 0 512 0z m263.23968 725.72928l-49.33632 49.39264L512 561.21856l-213.90336 213.90336-49.33632-49.39264 213.888-213.8624-213.888-213.888 49.33632-49.33632L512 462.52032l213.90336-213.87776 49.33632 49.33632-213.888 213.888 213.888 213.8624z" p-id="4265"></path>
    </svg>
    <!-- 根据语言选择tip -->
    <img :src="lang_now === 'lang_cn' ? require('@/assets/img/modal2d-tip.png') : require('@/assets/img/modal2d-tip-en.png')" class="d2d-tip">
    <div class="wall-corner">
      <div class="arrow-2d-scale arrow-2d-scale-x">
        <img src="@/assets/img/箭头.svg" class="arrow-2d-img">
      </div>
      <div class="arrow-2d-scale arrow-2d-scale-y">
        <img src="@/assets/img/箭头.svg" class="arrow-2d-img">
      </div>
      <div class="arrow-2d-scale arrow-2d-scale-z">
        <img src="@/assets/img/箭头.svg" class="arrow-2d-img">
      </div>
      
      <div 
        class="wall"
        :class="{'wall-selected': direction === 'x'}"
        :style="direction === 'x' ? `background-image: url('${url}');transform: translate3d(0,-20px,120px) rotate3d(0,0,1,${rotate.x}deg)` : 'transform: translate3d(0,-20px,120px);'"
        @mousedown="handlerMosueDown($event,'x')"
        @contextmenu.prevent
      >
      </div>  
      <div 
        class="wall"
        :class="{'wall-selected': direction === 'y'}"
        :style="direction === 'y' ? `background-image: url('${url}');transform: rotateY(-90deg) translate3d(0,-20px,120px) rotate3d(0,0,1,${rotate.y}deg);` : 'transform: rotateY(-90deg) translate3d(0,-20px,120px);'"
        @mousedown="handlerMosueDown($event,'y')"
        @contextmenu.prevent
      >
      </div>  
      <div 
        class="wall"
        :class="{'wall-selected': direction === 'z'}"
        :style="direction === 'z' ? `background-image: url('${url}');transform: rotateX(-90deg) translate3d(0,0,100px) rotate3d(0,0,1,${rotate.z}deg);` : 'transform: rotateX(-90deg) translate3d(0,0,100px);'"
        @mousedown="handlerMosueDown($event,'z')"
        @contextmenu.prevent
      >
      </div>  
    </div> 
  </div>
</template>

<script>
import { mapGetters,mapState } from 'vuex'
export default {
  name: 'Modal2D',
  props: {
    //是否显示
    visible: {
      type: Boolean,
      required: true
    },
    //图片url
    url: {
      type: String,
      required: true
    }
  },
  data(){
    return {
      //选择哪个方向
      direction: 'z',
      //每个方向图片的旋转角度
      rotate: {
        x: 0,
        y: 0,
        z: 0
      },
    }
  },
  computed: {
    ...mapGetters(['lang']),
    ...mapState(['lang_now']),
  },
  methods: {
    //点击隐藏
    handlerClose() {
      this.$emit('hide')
    },
    handlerMosueDown(e,name) {
      e.preventDefault()
      switch(e.buttons){
        case 1:
          //左键
          this.direction = name
          //切换到其他平面时 所有面的旋转角度都归零
          for (let dir in this.rotate){
            this.rotate[dir] = 0
          }
          break
        case 2:
          //右键
          this.rotate[name] = (this.rotate[name] + 90) % 360
          break
        case 4:
          //中键
          this.$emit('mirror')
          break
      }
    },
  },
  watch: {
    direction(newDir) {
      this.$emit('change',newDir,this.rotate[newDir])
    },
    'rotate': {
      deep: true,
      handler(newRot) {
        this.$emit('change',this.direction,newRot[this.direction])
      },
    }
  }
}
</script>

<style scoped>
  .outer-2d{
    position: fixed;
    width: 100%;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.75);
    display: grid;
    place-items: center;
    z-index: 5;
  }

  .d2d-tip{
    position: absolute;
    top: 0;
    left: 0;
    width: 350px;
    height: 115px;
  }

  .close-2d{
    position: absolute;
    right: 20%;
    top: 20%;
    fill: rgb(255, 255, 255);
    transition: fill .3s ease;
  }

  .close-2d:hover {
    fill: red;
  }

  .wall-corner {
    position: relative;
    width: 200px;
    height: 200px;
    transform-style: preserve-3d;
    transform: rotateX(30deg) rotateY(30deg);
  }
  
  .wall {
    position: absolute;
    width: 200px;
    height: 200px;
    border-radius: 10px;
    border: dotted 3px rgb(225, 255, 0);
    transition: all .3s;
    background-size: 100% 100%;
  }

  .wall:hover {
    border-color: orange;
  }

  .wall-selected {
    border-color: blue;
    border-style: solid;
  }
    
  .wall1 {
    transform: translateZ(100px) translateZ(20px) translateY(-20px);
  }
    
  .wall2 {
    transform: rotateY(-90deg) translateZ(100px) translateZ(20px) translateY(-20px);
  }
    
  .wall3 {
    transform: rotateX(-90deg) translateZ(100px);
  }

  .arrow-2d-scale {
    position: absolute;
  }
  .arrow-2d-scale::after {
    position: absolute;
    top: -10px;
    left: -10px;
    font-size: 32px;
    color:rgb(0, 179, 255);
  }

  .arrow-2d-img{
    width: 48px;
    height: 48px;
  }

  .arrow-2d-scale-x {
    transform: rotateZ(-90deg) rotateY(-30deg) translate3d(-75px,275px,0px);
  }
  .arrow-2d-scale-x::after {
    content: '+x 东east';
  }

  .arrow-2d-scale-y {
    transform: rotateY(-45deg) rotateZ(180deg) translate3d(-25px,120px,-5px);
  }
  .arrow-2d-scale-y::after {
    content: '+y 上up';
    transform: rotateZ(180deg);
  }

  .arrow-2d-scale-z {
    transform: rotateX(-90deg) rotateY(-60deg) translate3d(135px,100px,135px);
  }
  .arrow-2d-scale-z::after {
    content: '+z 南south';
  }
</style>