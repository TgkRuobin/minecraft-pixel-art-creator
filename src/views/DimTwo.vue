<template>
  <div class="outer">
    <!-- 背景 -->
    <div class="bgc"></div>
    <!-- 导航栏 -->
    <NavBar @help="showHelp"></NavBar>
    <AlertModal 
      :visible="status.showAlert"
      :msg="status.alertMsg"
      :icon="status.alertIcon"
      @hide="status.showAlert = false"
    >
    </AlertModal>
    <!-- 设置图片位置方向模态框 -->
    <Modal2D 
      :visible="status.showModal2D" 
      :url="imgPreview" 
      @hide="status.showModal2D = false" 
      @mirror="mirrorImage"
      @change="changeImgInfo"
    >
    </Modal2D>
    <!-- 预览大图 -->
    <ShowImage :visible="status.showImage" :url="imgPreview" @hide="status.showImage = false"></ShowImage>
    <!-- 版心 -->
    <div class="core">
      <!-- 选择文件 -->
      <div class="img-select">
        <input type="file" @change="handleFileChange" accept="image/*">
        <div class="can-container">
          <div class="preview">
            <!-- 原图 -->
             <div class="preview-canvas">
              <canvas ref="cori" @click="canvasClick"></canvas>
             </div>
             <div class="preview-desp">{{ lang.imgori }}</div>
          </div>
          <div class="preview">
            <!-- 效果图 -->
             <div class="preview-canvas">
              <canvas ref="cmc" @click="canvasClick"></canvas>
             </div>
             <div class="preview-desp">{{ lang.imgres }}</div>
          </div>
        </div>
      </div>

      <!-- 操作区 -->
      <div class="color-select">
        <!-- 编辑宽高区 -->
        <div class="input-group">
          <span class="input-group-text">{{ lang.width }}</span>
          <input type="text" name="w" class="form-control" v-model="width">
          <span class="input-group-text">{{ lang.height }}</span>
          <input type="text" name="h" class="form-control" v-model="height">
          <!-- 抖动算法复选框 -->
          <div class="input-group-text">
            <input class="form-check-input mt-0" type="checkbox" v-model="status.dither" id="isDither">
            <label for="isDither">{{ lang.dither }}</label>
          </div>
          <!-- 加强地图画复选框 -->
          <div class="input-group-text">
            <input class="form-check-input mt-0" type="checkbox" v-model="status.enhance" id="isEnhance">
            <label for="isEnhance">{{ lang.enhance }}</label>
          </div>
        </div>
        <!-- 操作按钮区 -->
        <div class="buttons-group">
          <!-- 基岩版/网易版/手动搭建 -->
          <button type="button" class="btn btn-outline-info" @click="$router.push('/bedrock')">
            {{ lang.bd_switch }}
          </button>
          &nbsp;
          <!-- 下载投影 -->
          <button type="button" class="btn btn-outline-success" @click="getLitematica" :disabled="status.liteMaking">
            <!-- 根据状态决定是否显示“加载中” -->
            <span v-show="status.liteMaking" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
            <span v-show="status.liteMaking" role="status">{{ lang.loading }}</span>
            <span v-show="!status.liteMaking">{{ lang.dlite }}</span>
          </button>
          &nbsp;
          <!-- 制作像素画 -->
          <button type="button" class="btn btn-outline-primary" @click="status.enhance ? makeBd() : make()" :disabled="status.artMaking">
            <span v-show="status.artMaking" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
            <span v-show="status.artMaking" role="status">{{ lang.loading }}</span>
            <span v-show="!status.artMaking">{{ lang.make }}</span>
          </button>
          &nbsp;
          <!-- 选择方块 -->
          <button class="btn btn-outline-warning" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasBlockSelect" aria-controls="offcanvasBlockSelect">
            {{ lang.block }}
          </button>
          &nbsp;
          <!-- 设置 -->
          <button type="button" class="btn btn-setting" @click="openSetting">
            <svg t="1729768660793" class="svg-setting" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4540" width="26" height="26"><path d="M919.6 405.6l-57.2-8c-12.7-1.8-23-10.4-28-22.1-11.3-26.7-25.7-51.7-42.9-74.5-7.7-10.2-10-23.5-5.2-35.3l21.7-53.5c6.7-16.4 0.2-35.3-15.2-44.1L669.1 96.6c-15.4-8.9-34.9-5.1-45.8 8.9l-35.4 45.3c-7.9 10.2-20.7 14.9-33.5 13.3-14-1.8-28.3-2.8-42.8-2.8-14.5 0-28.8 1-42.8 2.8-12.8 1.6-25.6-3.1-33.5-13.3l-35.4-45.3c-10.9-14-30.4-17.8-45.8-8.9L230.4 168c-15.4 8.9-21.8 27.7-15.2 44.1l21.7 53.5c4.8 11.9 2.5 25.1-5.2 35.3-17.2 22.8-31.7 47.8-42.9 74.5-5 11.8-15.3 20.4-28 22.1l-57.2 8C86 408 72.9 423 72.9 440.8v142.9c0 17.7 13.1 32.7 30.6 35.2l57.2 8c12.7 1.8 23 10.4 28 22.1 11.3 26.7 25.7 51.7 42.9 74.5 7.7 10.2 10 23.5 5.2 35.3l-21.7 53.5c-6.7 16.4-0.2 35.3 15.2 44.1L354 927.8c15.4 8.9 34.9 5.1 45.8-8.9l35.4-45.3c7.9-10.2 20.7-14.9 33.5-13.3 14 1.8 28.3 2.8 42.8 2.8 14.5 0 28.8-1 42.8-2.8 12.8-1.6 25.6 3.1 33.5 13.3l35.4 45.3c10.9 14 30.4 17.8 45.8 8.9l123.7-71.4c15.4-8.9 21.8-27.7 15.2-44.1l-21.7-53.5c-4.8-11.8-2.5-25.1 5.2-35.3 17.2-22.8 31.7-47.8 42.9-74.5 5-11.8 15.3-20.4 28-22.1l57.2-8c17.6-2.5 30.6-17.5 30.6-35.2V440.8c0.2-17.8-12.9-32.8-30.5-35.2z m-408 245.5c-76.7 0-138.9-62.2-138.9-138.9s62.2-138.9 138.9-138.9 138.9 62.2 138.9 138.9-62.2 138.9-138.9 138.9z" fill="" p-id="4541"></path>
            </svg>
          </button>
        </div>

        <!-- 地图画enhance+dither功能的提示 -->
        <div class="alert alert-info" role="alert">
          {{ lang.enhance_info }}
        </div>
        <div class="alert alert-warning" role="alert">
          {{ lang.enhance_alert }}
        </div>
        <div class="alert alert-secondary" role="alert">
          {{ lang.dither_info }}
        </div>


      </div> 

      <!-- 方块选择侧边栏 -->
      <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasBlockSelect" aria-labelledby="offcanvasExampleLabel">
        <div class="offcanvas-header">
          <h4 class="offcanvas-title">{{ lang.selectblocks }}</h4>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
          <!-- 同色方块可以替换的提示 -->
          <div class="alert alert-warning" role="alert" v-html="lang.selectAlert"></div>
          <div class="accordion" id="accordionBlocks">
            <!-- 同一类的方块 -->
            <div class="accordion-item" v-for="block in this.blocks" :key="block.bid">
              <h2 class="accordion-header">
                <!-- 种类名 -->
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="'#'+block.bname_eng" aria-expanded="false" :aria-controls="block.bname_eng">
                  {{ lang_now == 'lang_cn' ? block.bname : block.bname_eng }}
                </button>
              </h2>
              <div :id="block.bname_eng" class="accordion-collapse collapse" data-bs-parent="#accordionBlocks">
                <div class="accordion-body">
                  <!-- 全选和全不选 -->
                  <span class="btn btn-outline-success btn-sm" @click="block.bclass.map(bc=>bc.select=true)">{{ lang.selectall }}</span>
                  |
                  <span class="btn btn-outline-danger btn-sm" @click="block.bclass.map(bc=>bc.select=false)">{{ lang.selectnone }}</span>
                  <ul class="list-group">
                    <li class="list-group-item" v-for="c in block.bclass" :key="`${block.bname_eng}-${c.name_eng}`">
                      <input class="form-check-input me-1" type="checkbox" v-model="c.select" :id="`${block.bname_eng}-${c.name_eng}`">
                      <!-- 方块图标和名称 -->
                      <label class="form-check-label" :for="`${block.bname_eng}-${c.name_eng}`">
                        <div class="colorShow" :style="`background-position: ${c.offset};`"></div>
                        {{ lang_now === 'lang_cn' ?  c.name : c.name_eng }}
                      </label>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 方块数量统计 -->
      <div class="counter" v-if="usedBlock.length > 0">
        <!-- 标题栏 -->
        <div style="display: flex;flex-flow: wrap row;gap: 10px;">
          <h4>{{ lang.info }}</h4>
          <img @click="sortByNumber" src="@/assets/img/排序.svg" alt="数量降序" title="按方块数量降序">
        </div>
        
        <div style="display: flex;flex-flow: wrap row;gap: 10px;">
          <div class="blockinfo" v-for="b in usedBlock" :key="b.name">
            <div class="colorShow" :style="`background-position: ${b.offset};`"></div>
            <strong>{{ lang_now === 'lang_cn' ?  b.name : b.name_eng}}</strong>
            <br>
            <!-- 数量：个 -->
            <i>{{b.count}} </i> <span>{{ lang.i_ge }}</span>
            <br>
            <!-- 数量：组、个 -->
            <span v-if="b.count>63">
              <i>{{Math.floor(b.count/64)}}</i> <span>{{ lang.i_zu }}</span> <i>{{b.count%64}}</i> <span>{{ lang.i_ge }}</span> 
            </span>
            <br>
            <!-- 数量：盒、组、个 -->
            <span v-if="Math.floor(b.count/64) > 27">
              <i>{{Math.floor(b.count/64/27)}}</i> <span>{{ lang.i_he }}</span> <i>{{Math.floor((b.count/64)%27)}}</i> <span>{{ lang.i_zu }}</span> <i>{{b.count%64}}</i> <span>{{ lang.i_ge }}</span> 
            </span>
          </div>
        </div>
      </div>
      <!-- 显示帮助 -->
      <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasHelp2" aria-labelledby="offcanvasHelpLabel">
        <div class="offcanvas-header">
          <h4 class="offcanvas-title"><b>{{ lang.help }}</b></h4>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
          <!-- 联系方式 -->
          <h5><i>{{ lang.help_contact }}</i></h5>
          <p>
            {{ lang.help_desp }}
            <br>
            {{ lang.help_mail }}
            <br>
            {{ lang.help_wechat }}
          </p>
          <!-- 操作步骤 -->
          <h5><i>{{ lang.help_step }}</i></h5>
          <p>
            <ol>
              <li v-for="(step,stepIndex) in lang.help_steps_2" :key="'helpStep'+stepIndex">
                {{ step }}
              </li>
            </ol>
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { mapGetters,mapState } from 'vuex'
import NavBar from '@/components/NavBar.vue'
import ShowImage from '@/components/ShowImage.vue'
import AlertModal from '@/components/AlertModal.vue'
import Modal2D from '@/components/Modal2D.vue'
import Cookies from 'js-cookie'
import axios from 'axios'
export default {
  name: 'DimTwo',
  components: {
    NavBar,
    ShowImage,
    AlertModal,
    Modal2D,
  },
  data(){
    return {
      // 原图
      image: null,
      // 放缩后的图片
      imageData: null,
      // 像素画宽高
      width: 128,
      height: 128,
      // 方块的状态
      blocks: [],
      // 发送给服务器的方块位置数据包
      posInfo: [],
      // 统计信息
      usedBlock: [],
      // 状态信息
      status: {
        // 是否在生成像素画
        artMaking: false,
        // 是否在生成投影
        liteMaking: false,
        // 是否展示大图
        showImage: false,
        // 是否显示模态框
        showModal2D: false,
        // 是否显示alert模态框
        showAlert: false,
        // alert模态框提示信息
        alertMsg: '提示',
        // 服务器是否已保留
        sent: false,
        // alert模态框图标种类
        // 0.info
        // 1.ok
        // 2.alert
        // 3.error
        alertIcon: 0,
        // 是否采用加强地图画
        enhance: false,
        // 是否采用抖动算法
        dither: false,
      },
      // 提供给子组件的图片数据
      imgPreview: '',
      // 图像旋转和放置面的信息
      imgInfo: {
        direct: 'z',
        degree: 0,
      },
      // 方块颜色和方块的映射
      enhancedColors: {},
      // 颜色修饰记录表
      modifiedInfo: [],
      
    }
  },
  created() {
    // 复制vuex中的mcblocks到data里的blocks
    for (let kind of this.mcblocks){
      this.blocks.push(kind)
    }
    // 为blocks添加count、转换16进制颜色为rgb值
    this.mcblocks.map(block=>block.bclass.map(bc=>{
      bc.count = 0
      bc.color_rgb = this.hexToRgb(bc.color)

      // 创建方块颜色和方块的映射
      this.enhancedColors[bc.minecraft] = {
        low: this.hexToRgb(bc.low),
        normal: this.hexToRgb(bc.normal),
        high: this.hexToRgb(bc.high),
      }
    }))

    // 加载历史习惯数据
    this.loadHist()
  },
  methods: {
    // 显示模态框
    alert(msg = '',icon = 0) {
      this.status.alertMsg = msg
      this.status.alertIcon = icon
      this.status.showAlert = true
    },
    // 从cookie加载持久化信息
    loadHist() {
      let hist_bs = Cookies.get('hist-bs')
      if (hist_bs) {
        hist_bs = JSON.parse(hist_bs)
        this.mcblocks.map(block => block.bclass.map(bc => {
          if (hist_bs.includes(bc.name_eng)) {
            bc.select = true
          }
        }))
      }

      let hist_sz = Cookies.get('hist-sz')
      if (hist_sz) {
        hist_sz = JSON.parse(hist_sz)
        this.height = hist_sz.height
        this.width = hist_sz.width
      }
    },
    // 显示帮助
    showHelp() {
      const a = document.createElement('a')
      a.setAttribute('data-bs-toggle','offcanvas')
      a.href = '#offcanvasHelp2'
      document.querySelector('body').appendChild(a)
      a.click()
      a.remove()
    },
    // 根据方块数量排序
    sortByNumber() {
      this.usedBlock.sort((a,b)=>b.count-a.count)
    },
    // canvas点击后显示大图
    canvasClick(e) {
      this.imgPreview = e.srcElement.toDataURL("image/png")
      this.status.showImage = true
    },
    changeImgInfo(dir,rot){
      this.imgInfo.direct = dir
      this.imgInfo.degree = rot
    },
    // 打开图片设置
    openSetting(){
      this.imgPreview = this.$refs.cori.toDataURL('image/png')
      this.status.showModal2D = true
    },
    // 图像左右镜像
    mirrorImage(){
      const img = new Image()
      // 镜像的是原图
      img.src = this.$refs.cori.toDataURL("image/png")
      img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
 
          canvas.width = img.width
          canvas.height = img.height

          ctx.scale(-1, 1)
          ctx.translate(-img.width, 0)
          ctx.drawImage(img, 0, 0)
 
          canvas.toBlob((blob) => {
            const reader = new FileReader()
            reader.readAsDataURL(blob)
            reader.onloadend = () => {
              
              this.imgPreview = reader.result
              this.$refs.cori.getContext('2d').drawImage(canvas,0,0)
              this.imageData = ctx.getImageData(0,0,canvas.width,canvas.height)

              canvas.remove()
            }
          }, 'image/png')
        }
    },
    // 用户选择图片后原图加载到image中
    handleFileChange(event) {
      if ((!event.target.files.length) || (event.target.files.length < 1)) {
        return
      }
      const file = event.target.files[0]
      if (!file.type.startsWith('image/')) {
        this.alert(this.lang.a_selectpic)
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        this.image = new Image()
        this.image.onload = () => {
          this.resizeImage(this.image)
        }
        this.status.sent = false
        this.image.src = e.target.result
      }
      reader.readAsDataURL(file)
    },
    // 图片放缩 存储到imageData里
    resizeImage(img) {
      const canvas = this.$refs.cori
      const ctx = canvas.getContext('2d')
      canvas.width = this.width
      canvas.height = this.height
      // 绘制缩放后的图片
      ctx.drawImage(img, 0, 0, this.width, this.height)
      this.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    },
    // 像素抖动
    applyFloydSteinbergDithering() {
      if (!this.status.dither) return
      // 使用原始图片重构imageData
      this.resizeImage(this.image)
      const width = this.imageData.width
      const height = this.imageData.height
      const data = this.imageData.data
  
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = (y * width + x) * 4
          const r = data[index]
          const g = data[index + 1]
          const b = data[index + 2]

          let closestColor
          if (this.status.enhance) {
            const {bc, modify} = this.closestColorBd({r, g, b})
            closestColor = this.enhancedColors[bc.minecraft][modify]
          } else {
            closestColor = this.closestColor(r, g, b).color_rgb
          }
          const {r: cr, g: cg, b:cb} = closestColor

          data[index] = cr
          data[index + 1] = cg
          data[index + 2] = cb

          // Floyd-Steinberg 抖动算法
          const oldGray = 0.299 * r + 0.587 * g + 0.114 * b
          const newGray = 0.299 * cr + 0.587 * cg + 0.114 * cb
          const error = oldGray - newGray

          if (x < width - 1) {
            data[(y * width + (x + 1)) * 4 + 2] += error * 7 / 16
          }
          if (x > 0 && y < height - 1) {
            data[((y + 1) * width + (x - 1)) * 4 + 2] += error * 3 / 16
          }
          if (y < height - 1) {
            data[((y + 1) * width + x) * 4 + 2] += error * 5 / 16
          }
          if (x < width - 1 && y < height - 1) {
            data[((y + 1) * width + (x + 1)) * 4 + 2] += error * 1 / 16
          }
        }
      }

      const canvas = this.$refs.cmc
      canvas.width = parseInt(this.width)
      canvas.height = parseInt(this.height)
      const ctx = canvas.getContext('2d')
      ctx.putImageData(this.imageData, 0, 0)
    },
    // 从mcblocks中找到最接近给定颜色的方块
    closestColor(r,g,b) {
      let minDistance = 9999999
      let closestBClass = null
      for (let mcb of this.mcblocks) {
        for (let bc of mcb.bclass) {
          if (!bc.select) continue
          let color = bc.color_rgb
          let distance = Math.sqrt(
            Math.pow(r - color.r, 2) +  
            Math.pow(g - color.g, 2) +  
            Math.pow(b - color.b, 2)  
          )
          if (distance < minDistance) { 
            //选出最小色差的方块
            minDistance = distance
            closestBClass = bc
          }
        }
      }
      return closestBClass
    },
    // 加强地图画版 找到最接近给定颜色的方块和修饰
    closestColorBd(color) {
      // 比较c1(low),c2(normal),c3(high)颜色 返回最接近c的色差距离和修饰
      const compare = (c, c1, c2, c3) => {
        let d1 = Math.sqrt(
          Math.pow(c.r - c1.r, 2) +  
          Math.pow(c.g - c1.g, 2) +  
          Math.pow(c.b - c1.b, 2)  
        )
        let d2 = Math.sqrt(
          Math.pow(c.r - c2.r, 2) +  
          Math.pow(c.g - c2.g, 2) +  
          Math.pow(c.b - c2.b, 2)  
        )
        let d3 = Math.sqrt(
          Math.pow(c.r - c3.r, 2) +  
          Math.pow(c.g - c3.g, 2) +  
          Math.pow(c.b - c3.b, 2)  
        )
        if (d2 <= d1 && d2 <= d3) return {distance: d2,modify: 'normal'}
        if (d1 <= d2 && d1 <= d3) return {distance: d1,modify: 'low'}
        if (d3 <= d2 && d3 <= d1) return {distance: d3,modify: 'high'}
      }

      let minDistance = 9999999
      let closestBClass = null
      let closestModify = ''
      for (let mcb of this.mcblocks) {
        for (let bc of mcb.bclass) {
          if (!bc.select) continue
          const ec = this.enhancedColors[bc.minecraft]
          const cmp = compare(color,ec.low,ec.normal,ec.high)
          if (cmp.distance < minDistance) { 
            //选出最小色差的方块
            minDistance = cmp.distance
            closestModify = cmp.modify
            closestBClass = bc
          }
        }
      }
      return {bc: closestBClass, modify: closestModify}
    },
    // 保存图片 减小服务器端后续分析压力
    server() {
      if (this.status.sent) return
      if (this.image) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = this.image.width;
          canvas.height = this.image.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(this.image, 0, 0)

          canvas.toBlob((blob) => {
            const formData = new FormData()
            formData.append('image', blob, 'image.png')
            this.status.sent = true
            axios.post('https://mcpixelart.com/serv', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            })
            .then(() => canvas.remove())
          }, 'image/png')
        } catch (error) {
          return
        }
      }
    },
    // 加强地图画版 制作
    makeBd() {
      this.server()
      // 至少选择一个方块
      if(!this.isBlockSelected){
        this.alert(this.lang.a_selectblock)
        return
      }
      if (parseInt(this.width)*parseInt(this.height) > 128*3*128*2) {
        this.alert(this.lang.enhance_sizealt)
      }
      // 必须已经读取本地图片 并且选中了enhance复选框
      if(this.imageData && this.status.enhance){
        this.resizeImage(this.image)
        this.status.artMaking = true
        const canvas = this.$refs.cmc
        canvas.width = parseInt(this.width)
        canvas.height = parseInt(this.height)
        const ctx = canvas.getContext('2d')
        // 创建一样大小的图用来显示预览图
        let newImage = ctx.createImageData(this.imageData.width,this.imageData.height)
        // 创建一个和原图一样大小的矩阵用来存储方块种类
        this.posInfo = Array.from({ length: parseInt(this.height) }, () =>
          Array(parseInt(this.width)).fill('')
        )
        // 用来存储修饰符
        this.modifiedInfo = Array.from({ length: parseInt(this.height) }, () =>
          Array(parseInt(this.width)).fill('')
        )
        // 重置计数
        for(let mcb of this.mcblocks){
          for(let bc of mcb.bclass){
            bc.count = 0
          }
        }
        // 遍历原图每个像素
        for (let y = 0; y < newImage.height; y++) {
          for (let x = 0; x < newImage.width; x++) {
            const index = (y * newImage.width + x) * 4 
            const r = this.imageData.data[index]
            const g = this.imageData.data[index + 1]
            const b = this.imageData.data[index + 2]

            let ccbd = this.closestColorBd({r,g,b})
            this.modifiedInfo[y][x] = ccbd.modify
            // 通过ccbd给的方块名和修饰找到最终的rgb色值
            const newcolor = this.enhancedColors[ccbd.bc.minecraft][ccbd.modify]
            newImage.data[index] = newcolor.r
            newImage.data[index + 1] = newcolor.g
            newImage.data[index + 2] = newcolor.b
            newImage.data[index + 3] = 255
            ccbd.bc.count++
            this.posInfo[y][x] = ccbd.bc.minecraft
          }
        }
        ctx.putImageData(newImage, 0, 0)

        // 统计方块
        this.usedBlock.splice(0)
        for(let mcb of this.mcblocks){
          for(let bc of mcb.bclass){
            if(!bc.select || bc.count === 0) continue
            this.usedBlock.push(bc)
          }
        }
        this.alert(this.lang.a_finish,1)
      }else{
        this.alert(this.lang.a_uploadpic)
      }
      this.status.artMaking = false
    },
    // 十六进制颜色转rgb
    hexToRgb(hex) {  
      hex = hex.replace('#', '') 
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
      }
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)
      return {r, g, b}
    },
    // 制作像素画
    make() {
      this.server()
      // 至少选择一个方块
      if (!this.isBlockSelected) {
        this.alert(this.lang.a_selectblock)
        return
      }
      if (this.imageData) {
        this.resizeImage(this.image)
        this.status.artMaking = true
        // 调用抖动算法
        this.applyFloydSteinbergDithering()

        const canvas = this.$refs.cmc
        canvas.width = parseInt(this.width)
        canvas.height = parseInt(this.height)
        const ctx = canvas.getContext('2d')
        let newImage = ctx.createImageData(this.imageData.width,this.imageData.height)

        this.posInfo = Array.from({ length: parseInt(this.height) }, () =>
          Array(parseInt(this.width)).fill('')
        )
        // 重置计数
        for (let mcb of this.mcblocks) {
          for (let bc of mcb.bclass) {
            bc.count = 0
          }
        }
        // 遍历原图每个像素
        for (let y = 0; y < newImage.height; y++) {
          for (let x = 0; x < newImage.width; x++) {
            const index = (y * newImage.width + x) * 4 
            const r = this.imageData.data[index]
            const g = this.imageData.data[index + 1]
            const b = this.imageData.data[index + 2]
            const a = this.imageData.data[index + 3]
            
            // 透明阈值
            const a_ = 100
            // 透明方块为空气
            if (a <= a_){
              this.posInfo[y][x] = 'air'
              continue
            }
            let newcolor = this.closestColor(r,g,b)
            
            newImage.data[index] = newcolor.color_rgb.r
            newImage.data[index + 1] = newcolor.color_rgb.g
            newImage.data[index + 2] = newcolor.color_rgb.b
            newImage.data[index + 3] = 255
            newcolor.count++
            this.posInfo[y][x] = newcolor.name_eng
          }
        }
        ctx.putImageData(newImage, 0, 0)

        // 统计方块
        this.usedBlock.splice(0)
        for(let mcb of this.mcblocks){
          for(let bc of mcb.bclass){
            if(!bc.select || bc.count === 0) continue
            this.usedBlock.push(bc)
          }
        }
        this.alert(this.lang.a_finish,1)
      }else{
        this.alert(this.lang.a_uploadpic)
      }
      this.status.artMaking = false
    },
    downloadFile(href){
      // 隐藏的a标签用于触发自动下载
      const a = document.createElement('a')
      a.href = href
      a.style.display = 'none'
      document.querySelector('body').appendChild(a)
      a.click()
      a.remove()
      // 模态框里的a标签为手动下载
      this.alert(`${this.lang.autodl} <br><a href="${href}">${href}</a><br> ${this.lang.dldesp}`, 1)
    },
    // 结合posInfo方块信息和modifiedInfo修饰符 得到3D的方块位置信息 发送给服务器的3D转换接口
    getEnhancedPostData() {
      // 每行有多少方块
      const oneLineNum = this.posInfo[0].length
      // 记录y坐标上的相对位置
      // 从南向北开始记录
      // 最南边的一行y固定为0
      let relativeY = [new Array(oneLineNum).fill(0)]
      for (let y = this.posInfo.length - 2;y >= 0;y--) {
        // 根据y+1这一行 确定y这一行应该+1还是-1还是0
        const relativeOneline = this.modifiedInfo[y + 1].map(v => {
          switch (v) {
            case 'low': return 1
            case 'high': return -1
            default: return 0
          }
        })
        // 在y+1这一行的基础上加上y这一行的增量
        relativeY.push(relativeOneline.map((rv,ri) => rv + relativeY[relativeY.length - 1][ri]))
      }
      
      // 记录每一列(从南向北)的最低方块和最高方块高度值
      let colMin = new Array(oneLineNum).fill(0),colMax = new Array(oneLineNum).fill(0)
      relativeY.map(rl => {
        rl.map((r,i) => {
          colMin[i] = Math.min(colMin[i], r)
          colMax[i] = Math.max(colMax[i], r)
        })
      })
      // 得到每一列的高度
      const colHeight = colMax.map((max,i) => max - colMin[i])
      // 每一列的方块y值必须大于等于0 因此需要减去该列坐标最小值
      relativeY = relativeY.map(rl => rl.map((h,i) => h - colMin[i]))
      // 上面是从南向北生成的地图 因此需要反向
      relativeY.reverse()
      // 原本发送给服务器方块信息art 高度图rel 尺寸size
      const middle = {
        rel: relativeY,
        art: this.posInfo,
        size: {
          width: this.posInfo[0].length,
          length: this.posInfo.length,
          height: Math.max(...colHeight) + 1
        }
      }
      // 进行预处理后再发送给服务器 减少服务器压力
      // 将三维数据化为一维流
      let pipe = []
      for (let x = 0;x < middle.size.length;x++) {
        for (let y = 0;y < middle.size.width;y++) {
          const pos = [y, middle.rel[x][y], x]
          pipe.push([pos,'minecraft:' + middle.art[x][y]])
        }
      }
      return {
        size: middle.size,
        pipe,
      }
    },
    // 上传服务器 下载投影文件
    getLitematica(){
      if (this.posInfo.length > 0) {
        let postData = {}
        // 根据enhance决定发送的数据
        if (this.status.enhance) {
          // 再次确认尺寸
          if (this.posInfo.length * this.posInfo[0].length > 128*3*128*2) {
            this.alert(this.lang.enhance_sizeout)
            return
          }
          this.status.liteMaking = true
          postData = this.getEnhancedPostData()
        } else {
          this.status.liteMaking = true
          postData = {
            art: this.posInfo,
            dir: this.imgInfo.direct,
            rot: this.imgInfo.degree,
          }
        }
        // 根据enhance决定post的url
        // const postURL = this.status.enhance ? 'http://localhost:9969/pixelartEnhance' : 'https://mcpixelart.com/pixelart'
        const postURL = this.status.enhance ? 'https://mcpixelart.com/pixelartEnhance' : 'https://mcpixelart.com/pixelart'
        axios.post(postURL,postData,{
        // axios.post('http://localhost:9969/pixelart',postData,{
          headers:{
            'Content-Type': 'application/json'
          }
        })
        .then(response=>{
          if(response.data && response.data.url){
            // 服务器返回数据格式正确
            const href = this.status.enhance ? 'https://mcpixelart.com/enhance/' : 'https://mcpixelart.com/lite/'
            this.downloadFile(href + response.data.url)
          }else{
            // 服务器返回了错误的格式
            this.alert(this.lang.a_500 + ' <br> ' + this.lang.con_mail,3)
          }
        })
        .catch(error=>{
          const status = error.response.status
          if (status) {
            if (status >= 400 && status < 500) {
              // 数据格式出错
              this.alert(this.lang.a_400 + ' <br> ' + error, 3)
            } else if (status >= 500) {
              // 服务器出错
              this.alert(this.lang.a_500 + ' <br> ' + error, 3)
            } else {
              this.alert(error, 3)
            }
          } else {
            this.alert(error, 3)
          }
          
        })
        .finally(() => {
          this.status.liteMaking = false
        })
      }else{
        this.alert(this.lang.a_makepic)
      }
    },
    
  },
  
  computed: {
    ...mapGetters(['lang']),
    ...mapState(['mcblocks','lang_now']),
    // 是否已经选择了方块
    isBlockSelected() {
      for (let kind of this.mcblocks) {
        for (let block of kind.bclass) {
          if (block.select) return true
        }
      }
      return false
    },
    size() {
      return {
        width: this.width,
        height: this.height
      }
    },
    selectedBlocks() {
      let s = []
      this.mcblocks.map(block => block.bclass.map(bc => {
        if (bc.select) s.push(bc.name_eng)
      }))
      return s
    },
  },

  watch:{
    width(){
      if (this.imageData) this.resizeImage(this.image)
    },
    height(){
      if (this.imageData) this.resizeImage(this.image)
    },
    selectedBlocks: {
      handler(stb) {
        Cookies.set('hist-bs',JSON.stringify(stb), { expires: new Date('Sat, 01 Jan 2037 00:00:00 UTC') })
      }
    },
    size: {
      deep: true,
      handler(sz) {
        Cookies.set('hist-sz',JSON.stringify(sz), { expires: new Date('Sat, 01 Jan 2037 00:00:00 UTC') })
      }
    },
  },
}
</script>

<style lang="less" scoped>
  .outer{
   width: 100%;
   display: flex;
   justify-content: center; 
   position: relative;
  }
  @keyframes slide{
    0% {
      transform: translateX(160px);
    }
    100% {
      transform: translateX(-160px);
    }
  }
  .bgc{
    position: fixed;
    top: -160px;
    left: -160px;
    width: calc(100% + 320px);
    height: calc(100% + 320px);
    background-image: url("@/assets/img/bg_pink.png");
    animation: slide 20s linear infinite;
    z-index: -1;
  }
  .core{
    width: 800px;
    margin-top: 112px;
    padding: 16px;
    background-color: #ffffffd2;
  }
  .img-select{
    display: flex;
    justify-content: center;
    flex-flow: nowrap column;
  }
  .can-container{
    width: 100%;
    height: 240px;
    margin: 15px 0;
    display: flex;
    flex-flow: nowrap row;
    justify-content: space-between;
  }
  .preview{
    width: 48%;
    height: 100%;
    border: dashed 2px gray;
    border-radius: 16px;
    transition: border .5s;
    padding: 4px;
  }
  .preview:hover{
    border-color: rgb(22, 177, 255);
  }
  .preview-canvas{
    width: 100%;
    height: calc(100% - 28px);
    overflow: auto;
  }
  .preview-desp{
    width: 100%;
    height: 28px;
    display: grid;
    user-select: none;
    white-space: nowrap;
    place-items: center;
  }
  canvas{
    cursor: zoom-in;
  }

  .img-select input[type="file"]{
    border: solid 2px gray;
    border-radius: 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    transition: border .5s;
  }
  .img-select input[type="file"]:hover{
    border-color: rgb(22, 177, 255);
  }
  .color-select{
    display: flex;
    flex-flow: column nowrap;
    position: relative;
    gap: 10px;

    .buttons-group {
      display: flex;
      flex-flow: row-reverse wrap;
      white-space: nowrap;
    }
    
    .input-group {
      span, label {
        user-select: none;
        white-space: nowrap;
      }
    }
  }
  .btn-setting:hover svg{
    transform: rotate(60deg);
  }
  .svg-setting{
    fill :rgb(255, 22, 255);
    transition: transform .3s ease;
  }
  .input-group{
    flex-grow: 1;
    height: 90%;
    width: 100%;
    left: 0;
  }
  .colorShow{
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-right: 6px;
    background-image: url('@/assets/img/BlockCSS.png');
    transform: translateY(calc(50% - 4px));
  }
  #offcanvasHelp2 {
    h5{
      color:rgb(22, 177, 255)
    }
    p{
      line-height: 1.8rem;
    }
  }

  @media only screen and (max-width: 800px) {

    .core {
      width: 100%;
    }

    .color-select {
      flex-flow: row-reverse wrap;
    }

    
  }
</style>