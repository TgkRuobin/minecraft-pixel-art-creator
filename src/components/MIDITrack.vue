<template>
  <div class="out-container">
    <div>
      <span class="track-name">{{ track.name }}</span>
      <span style="color:coral;"> --- > </span>
      <span class="mc-name">{{ showInstrument }}</span>
      <span class="showinfo">{{ showInfo }}</span>
    </div>
    <canvas ref="canvas" class="track-notes"></canvas>
  </div>
</template>

<script>
import { mapInstrumentToBlock } from '@/utils/MIDI'
export default {
  name: 'MIDITrack',
  props: ['track'],
  data() {
    return {
      MIN_NOTE: 43,
      MAX_NOTE: 67,
    }
  },
  mounted() {
    const canvas = this.$refs.canvas
    const ctx = canvas.getContext('2d')
    let x = 0,y = 0,h = 4,w = 0
    const xAB = 5
    canvas.style.width = this.tMax * xAB + 'px'

    const dpr = window.devicePixelRatio || 1
    canvas.width = this.tMax * xAB * dpr;
    canvas.height = 100 * dpr
    h = 4 * dpr
    ctx.imageSmoothingEnabled = false

    for (let i = 0;i < this.tLen;i++) {
      y = (100 - this.track.pitch[i] * 4) * dpr
      x = this.track.time[i] * xAB * dpr
      w = (this.track.duration[i] || 1) * xAB * dpr // duration默认为1
      ctx.fillStyle = this.colorMap[this.track.pitch[i]]
      ctx.fillRect(x, y, w, h)
    }
  },
  computed: {
    // 时间序列
    times() {
      return this.track.time.map(t => parseFloat(t))
    },
    tLen() {
      return this.times.length
    },
    tMin() {
      if (this.tLen === 0) return 0
      return Math.min(...this.times)
    },
    tMax() {
      if (this.tLen === 0) return 0
      return Math.max(...this.times)
    },
    // 显示信息
    showInfo() {
      const time = (this.tMax - this.tMin).toFixed(1)
      return `t=${time}s`
    },
    showInstrument() {
      return mapInstrumentToBlock(this.track.name)
    },
    // 0 ~ 24的颜色映射
    colorMap() {
      return [
    "rgb(0,0,255)",
    "rgb(11,0,244)",
    "rgb(21,0,234)",
    "rgb(32,0,223)",
    "rgb(43,0,213)",
    "rgb(53,0,202)",
    "rgb(64,0,191)",
    "rgb(74,0,181)",
    "rgb(85,0,170)",
    "rgb(96,0,159)",
    "rgb(106,0,149)",
    "rgb(117,0,138)",
    "rgb(128,0,128)",
    "rgb(138,0,117)",
    "rgb(149,0,106)",
    "rgb(159,0,96)",
    "rgb(170,0,85)",
    "rgb(181,0,74)",
    "rgb(191,0,64)",
    "rgb(202,0,53)",
    "rgb(213,0,42)",
    "rgb(223,0,32)",
    "rgb(234,0,21)",
    "rgb(244,0,11)",
    "rgb(255,0,0)"
]
    },
  },
  methods: {
  },
}
</script>

<style lang="less" scoped>
.out-container {
  border: 1px solid rgba(222, 222, 222, 0.753);
  box-sizing: border-box;
  border-radius: 10px;
  margin: 3px 0;
  padding: 10px;
  background-color: #2bab8fb5;

  width: max-content;
  transition: all .3s;
}

.out-container:hover {
  background-color: #d3d2d2ec;
}

@font-face {
  font-family: Minecraft;
  src: url('@/assets/font/Minecraft.woff2') format('woff2');
}
.track-name, .mc-name {
  font-family: Minecraft;
}
.mc-name {
  color: aqua;
}
.showinfo {
  margin: 0 20px;
}
.track-notes {
  // 高度是note的25倍
  height: 100px;
}
</style>