<template>
  <div class="image-outer">
    <div ref="imgsmallcon" class="image-small-container" @mousedown="mousedown" @mousemove="mousemove" @mouseup="mouseup">
      <!-- 小图显示全部 -->
      <img ref="imgsmall" class="image-small" :src="imageSrc">
      <!-- 遮罩表示大图显示的区域 -->
      <div 
        class="mask" 
        :style="`width:${mask.width}px;height:${mask.height}px;transform:translate(${mask.x}px,${mask.y}px)`">

      </div>
      <!-- 该遮罩表示当前显示的行 -->
      <div 
        class="selectedLine"
        :style="`transform:translateY(${selectedLine.ratio * 200}px);height:${selectedLine.height > 0 ? limit(200 / selectedLine,1,200) : 1}px;`"
      ></div>
    </div>
    <!-- 大图只显示一部分 -->
    <div 
      ref="imgbig" 
      class="image-big" 
      :style="`background-image: url('${imageSrc}');background-position: -${imageInfo.offsetX}px -${imageInfo.offsetY}px`">

    </div>
  </div>
  
</template>

<script>
export default {
  props: {
    imageSrc: {
      type: String,
      required: true
    },
    selectedLine: {
      type: Object,
      required: true
    }
  },
  created() {
    window.addEventListener('resize',this.calcMask)
  },
  data() {  
    return {
      //遮罩的尺寸和偏移量
      mask: {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
      },
      //大图片实际尺寸
      imageInfo: {
        width: 0,
        height: 0,
        //大图的偏移
        offsetX: 0,
        offsetY: 0,
        //宽度长度任一为0时不可用
        available: false
      },
      //鼠标拖动遮罩相关
      mouse: {
        //拖动的偏移量
        offsetX: 0,
        offsetY: 0,
        //鼠标按下的初始坐标
        initialX: 0,
        initialY: 0,
        //鼠标按下时img-small的初始偏移
        initialOffsetX: 0,
        initialOffsetY: 0,
        //最大拖动偏移量
        offsetXMax: 0,
        offsetYMax: 0,
        //是否在拖动
        dragging: false,
      },
    }
  },
  computed: {
    //返回小图和大图的dom实际宽高
    domInfo() {
      return {
        small: {
          width: this.$refs.imgsmall.offsetWidth,
          height: this.$refs.imgsmall.offsetHeight,
        },
        big: {
          width: this.$refs.imgbig.offsetWidth,
          height: this.$refs.imgbig.offsetHeight,
        }
      }
    }
  },
  methods: {
    //限幅函数
    limit(v,min,max) {
      if (v < min) return min
      if (v > max) return max
      return v
    },
    //适配mask的尺寸
    calcMask() {
      //确保图片已加载
      if (!this.imageInfo.available) return
      const di = this.domInfo
      const ratioX = this.limit(di.big.width / this.imageInfo.width, 0, 1)
      const ratioY = this.limit(di.big.height / this.imageInfo.height, 0, 1)
      this.mask.width = ratioX * di.small.width
      this.mask.height = ratioY * di.small.height
      this.mouse.offsetXMax = di.small.width - this.mask.width
      this.mouse.offsetYMax = di.small.height - this.mask.height
    },
    //鼠标按下
    mousedown(e) {
      if (!this.mouse.dragging && e.button === 0) {
        //鼠标点击后mask立刻移动到所指位置
        var rect = this.$refs.imgsmall.getBoundingClientRect()
        this.mask.x = this.limit(e.clientX - rect.left - this.mask.width / 2, 0, this.mouse.offsetXMax)
        this.mask.y = this.limit(e.clientY - rect.top - this.mask.height / 2, 0, this.mouse.offsetYMax)
        //记录鼠标初始按下的坐标
        this.mouse.initialX = e.clientX
        this.mouse.initialY = e.clientY
        this.mouse.initialOffsetX = this.mask.x
        this.mouse.initialOffsetY = this.mask.y
        this.mouse.dragging = true
      }
    },
    //鼠标拖动
    mousemove(e) {
      if (this.mouse.dragging && e.button === 0) {
        const di = this.domInfo
        //计算鼠标相对于初始按下点的偏移
        this.mouse.offsetX = e.clientX - this.mouse.initialX + this.mouse.initialOffsetX
        this.mouse.offsetY = e.clientY - this.mouse.initialY + this.mouse.initialOffsetY

        this.mask.x = this.limit(this.mouse.offsetX, 0, this.mouse.offsetXMax)
        this.mask.y = this.limit(this.mouse.offsetY, 0, this.mouse.offsetYMax)

        //大图移动到相应部分
        if (this.mouse.offsetXMax > 0) {
          const ratioX = this.mouse.offsetX / this.mouse.offsetXMax
          this.imageInfo.offsetX = ratioX * (this.imageInfo.width - di.big.width)
        }
        if (this.mouse.offsetYMax > 0) {
          const ratioY = this.mouse.offsetY / this.mouse.offsetYMax
          this.imageInfo.offsetY = ratioY * (this.imageInfo.height - di.big.height)
        }
        
      }
    },
    //鼠标抬起
    mouseup() {
      this.mouse.dragging = false
    },
  },
  watch: {
    //图片加载后更新图片的宽高
    imageSrc(base64Image) {
      const img = new Image() 
      img.src = base64Image
        
      img.onload = () => {  
        this.imageInfo.width = img.width
        this.imageInfo.height = img.height
        this.imageInfo.available = img.width * img.height > 0
        this.calcMask()
        img.remove()
      }
    },
  }
}
</script>  
  
<style scoped>
  .image-outer {
    width: 100%;
    display: flex;
    flex-flow: row nowrap;
    user-select: none;
  }

  .image-small-container {
    position: relative;
    overflow: hidden;
  }

  .image-small{
    width: 200px;
    height: 200px;
  }

  .selectedLine {
    position: absolute;
    width: 200px;
    height: 1px;
    top: 0;
    left: 0;
    background-color: rgba(255, 0, 0, 0.64);
    z-index: 1;
  }

  .mask {
    position: absolute;
    background-color: #3488b3a1;
    top: 0;
    left: 0;
    overflow: hidden;
    border: dashed 1px purple;
    z-index: 2;
  }

  .mask::before {  
    content: '';
    position: absolute;
    top: 0;  
    left: 0;  
    right: 0;  
    bottom: 0;  
    background: repeating-linear-gradient(  
      45deg,
      rgba(255, 255, 0, 0.4), /* 透明部分 */
      rgba(255, 255, 0, 0.4) 3px, /* 黄线部分 */
      rgba(0, 0, 0, 0) 3px, /* 黄线间隔部分 */
      rgba(0, 0, 0, 0) 10px /* 重复间距 */
    );
    pointer-events: none;
  }

  .image-big {
    height: 200px;
    /* width: 40vh; */
    flex-grow: 1;
    overflow: hidden;
    background-repeat: no-repeat;
  }
</style>