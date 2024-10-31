<template>
  <div class="outer">
    <AlertModal 
      :visible="status.showAlert"
      :msg="status.alertMsg"
      :icon="status.alertIcon"
      @hide="status.showAlert = false"
    >
    </AlertModal>
    <!-- 版心 -->
    <div class="core">
      <div class="core-title">
        <img class="logo" src="@/assets/img/favicon.png">
        <span>
          {{ lang.h3title }}
        </span>
        <button type="button" class="btn btn-warning" style="float:right;" @click="showHelp">
          <img 
            src="@/assets/img/帮助_白色.svg" 
            :alt="lang.help" 
            style="height: 28px;width: 28px;" 
            :title="lang.help"
          >
          {{ lang.help_howtouse }}
        </button>
      </div>
      <div class="input-box">
        <input type="file" accept=".obj,*.*" @change="handlerFileChoose($event)">
      </div>
      <div class="model-show-box">
        <div class="model-origin">
          <div class="t-shirt" ref="modelOrigin">
          </div>
          {{ lang.imgori }}
        </div>
        <div class="model-result">
          <div class="t-shirt" ref="modelResult">
          </div>
          {{ lang.imgres }}
        </div>
      </div>
      <div class="control-box">
        <div class="input-group">
          <span class="input-group-text">{{ lang.long }}</span>
          <input 
            type="text" 
            name="wi" 
            :class="['form-control', checkTargetVaild.invaild.includes('x') ? 'is-invalid' : 'is-valid']" 
            v-model="targetInfo.x" 
            value 
            required 
          >

          <span class="input-group-text">{{ lang.width }}</span>
          <input 
            type="text" 
            name="he" 
            :class="['form-control', checkTargetVaild.invaild.includes('z') ? 'is-invalid' : 'is-valid']" 
            v-model="targetInfo.z" 
            value 
            required 
          >
          <span class="input-group-text">{{ lang.height }}</span>
          <input 
            type="text" 
            name="de" 
            :class="['form-control', checkTargetVaild.invaild.includes('y') ? 'is-invalid' : 'is-valid']" 
            v-model="targetInfo.y" 
            value 
            required 
          >
          <button @click="generateVoxel" type="button" class="btn btn-primary">{{ lang.make }}</button>
          <button @click="getLitematic" type="button" class="btn btn-info" :disabled="status.liteMaking">
            <span v-show="status.liteMaking" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
            <span v-show="status.liteMaking" role="status">{{ this.lang.loading }}</span>
            <span v-show="!status.liteMaking">{{ lang.dlite }}</span>
          </button>
          <!-- <div class="input-group-text">
            <input class="form-check-input mt-0" type="checkbox" v-model="targetInfo.lockAspect" id="lockAspect">
            <label for="lockAspect">保持比例</label>
          </div> -->

        </div>
      </div>
    </div>

    <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasHelp3" aria-labelledby="offcanvasHelpLabel">
        <div class="offcanvas-header">
          <h4 class="offcanvas-title"><b>{{ lang.help }}</b></h4>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
          <h5><i>{{ lang.help_contact }}</i></h5>
          <p>
            {{ lang.help_desp }}
            <br>
            {{ lang.help_mail }}
            <br>
            {{ lang.help_wechat }}
          </p>
          <h5><i>{{ lang.help_step }}</i></h5>
          <p>
            <ol>
              <li v-for="(step,stepIndex) in lang.help_steps_3" :key="'helpStep'+stepIndex" v-html="step">
              </li>
            </ol>
          </p>
        </div>
      </div>
  </div>
</template>

<script>
import { mapGetters,mapState } from 'vuex'
import AlertModal from '@/components/AlertModal.vue'
import axios from 'axios'
import * as THREE from 'three'
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js" 
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
export default {
  name: 'DimThree',
  components: {
    AlertModal,
  },
  data() {
    return {
      //原模型点集
      originPoints: [],
      //原模型信息
      originInfo: {
        //模型三个坐标最小值
        minCorner: this.getMin3(),
        //模型三个坐标最大值
        maxCorner: this.getMin3(),
      },
      //目标信息
      targetInfo: {
        x: 1,
        y: 1,
        z: 1,
        lockAspect: true,
        voxelPoints: [],
      },
      sceneOrigin: {
        scene: null,
        camera: null,
        renderer: null,
        controls: null,
      },
      sceneTarget: {
        scene: null,
        camera: null,
        renderer: null,
        controls: null,
      },
      status: {
        alertMsg: '',
        alertIcon: 1,
        showAlert: false,
        liteMaking: false,
      },
    }
  },
  created() {
    //有效数字
    Number.prototype.significant = function(precision) {  
      let result = this.toPrecision(precision)
      if (result.includes('e')) {  
        let [mantissa, exponent] = result.split('e')
        let sign = exponent[0] === '-' ? -1 : 1
        let exp = parseInt(exponent.slice(1), 10)
        let magnitude = Math.pow(10, sign * exp)

        let rawNumber = parseFloat(mantissa) * magnitude
      
        let str = rawNumber.toString()
        let [integerPart, fractionalPart] = str.split('.')
      

        let decimalPlaces = precision - integerPart.length
        if (decimalPlaces < 0) decimalPlaces = 0
      
        let formattedFractionalPart = fractionalPart ? fractionalPart.slice(0, decimalPlaces) : ''
      
        let formattedNumber = integerPart
        if (formattedFractionalPart) {  
          formattedNumber += '.' + formattedFractionalPart
        }  
      
        formattedNumber = formattedNumber.replace(/\.?0+$/, function(tail) {  
          return tail === '.' ? tail : ''
        })
      
        return formattedNumber
      }  
      return result
    }
    this.animateOrigin()
    this.animateTarget()
  },
  methods: {
    //自动下载 手动点击下载
    downloadFile(fname){
      //隐藏的a标签用于触发自动下载
      const a = document.createElement('a')
      const href = 'https://mcpixelart.com/scu/' + fname
      a.href = href
      a.style.display = 'none'
      document.querySelector('body').appendChild(a)
      a.click()
      a.remove()
      //模态框里的a标签为手动下载
      this.alert(`${this.lang.autodl} <br><a href="${href}">${href}</a><br> ${this.lang.dldesp}`,1)
    },
    //显示帮助
    showHelp() {
      const a = document.createElement('a')
      a.setAttribute('data-bs-toggle','offcanvas')
      a.href = '#offcanvasHelp3'
      document.querySelector('body').appendChild(a)
      a.click()
      a.remove()
    },
    //显示模态框
    alert(msg = '',icon = 0) {
      this.status.alertMsg = msg
      this.status.alertIcon = icon
      this.status.showAlert = true
    },
    //渲染
    animateOrigin() {
      requestAnimationFrame(this.animateOrigin)
      if (this.sceneOrigin.scene)
        this.sceneOrigin.renderer.render(this.sceneOrigin.scene, this.sceneOrigin.camera)
    },
    animateTarget() {
      requestAnimationFrame(this.animateTarget)
      if (this.sceneTarget.scene)
        this.sceneTarget.renderer.render(this.sceneTarget.scene, this.sceneTarget.camera)
    },
    //合并Float32Array
    mergeFloat32Arrays(...arrays) {  
      let totalLength = arrays.reduce((sum, array) => sum + array.length, 0)
      let mergedArray = new Float32Array(totalLength)
    
      let offset = 0
      for (let array of arrays) {  
        mergedArray.set(array, offset)
        offset += array.length
      }  
    
      return mergedArray
    },
    //获得正无穷向量
    getMax3() {
      return new THREE.Vector3(Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY)
    },
    //获得负无穷向量
    getMin3() {
      return new THREE.Vector3(Number.NEGATIVE_INFINITY,Number.NEGATIVE_INFINITY,Number.NEGATIVE_INFINITY)
    },
    //加载.obj文件
    handlerFileChoose(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const fileContent = e.target.result
          const loader = new OBJLoader()
          const obj3D = loader.parse(fileContent)

          //设置场景
          const scene = new THREE.Scene()
          const camera = new THREE.PerspectiveCamera(75,1,0.01,1000)
          
          const renderer = new THREE.WebGLRenderer()
          // 光源  
          const ambientLight = new THREE.AmbientLight(0x404040)
          scene.add(ambientLight)

          const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
          directionalLight.position.set(1, 2, 3).normalize()
          scene.add(directionalLight)
          //30vw
          const vw30 = window.innerWidth * 0.3
          renderer.setSize(vw30,vw30)
          this.$refs.modelOrigin.innerHTML = ''
          this.$refs.modelOrigin.appendChild(renderer.domElement)
          scene.add(obj3D)
          const controls = new OrbitControls(camera, renderer.domElement)
          controls.addEventListener('change', function () {
            renderer.render(scene, camera)
          })

          this.sceneOrigin.scene = scene
          this.sceneOrigin.camera = camera
          this.sceneOrigin.renderer = renderer
          this.sceneOrigin.controls = controls

          //遍历点集
          this.originPoints.splice(0)
          this.originInfo.minCorner = this.getMax3()
          this.originInfo.maxCorner = this.getMin3()

          for (let children of obj3D.children) {
            let array = children.geometry.attributes.position.array
            let count = children.geometry.attributes.position.count
            for (let i = 0;i < count;i += 3) {
              //.obj文件的点坐标
              const v3 = new THREE.Vector3(array[i * 3],array[i * 3 + 1],array[i * 3 + 2])
              this.originPoints.push(v3)
              //不断比较 得到模型框的两个角点
              this.originInfo.minCorner.min(v3)
              this.originInfo.maxCorner.max(v3)
            }
          }
          camera.position.z = this.originSize.z
        }
        
        reader.onerror = () => {
          this.alert('Error reading file:')
        }
        reader.readAsText(file)
      } else {
        this.alert('Please select a valid .obj file.')
      }
    },
    //生成体素
    generateVoxel() {
      if (!this.originPoints || this.originPoints.length === 0) {
        this.alert(this.lang.a_uploadpic)
        return
      }
      //体素单元集合
      let voxelPoints = new Set()
      //放大倍数
      let mag = this.magnification
      for (let point of this.originPoints) {
        const p = new THREE.Vector3()
        //每个维度放大对应倍数
        for (let dim in mag) {
          p[dim] = point[dim] * mag[dim]
        }
        //向下取整
        p.floor()
        //转换为字符串存入Set
        voxelPoints.add([p.x,p.y,p.z].join(' '))
      }
      
      // console.log(this.originPoints.length,voxelPoints.size)
      //字符串转换回Vector3
      voxelPoints = [...voxelPoints].map(vp => vp.split(' ').map(vps => Number.parseInt(vps)))
      this.targetInfo.voxelPoints = voxelPoints
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(75,1,0.01,1000)

      const renderer = new THREE.WebGLRenderer()
      // 光源  
      const ambientLight = new THREE.AmbientLight(0x404040)
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
      directionalLight.position.set(1, 2, 3).normalize()
      scene.add(directionalLight)
      // 30vw
      const vw30 = window.innerWidth * 0.3
      renderer.setSize(vw30,vw30)

      this.$refs.modelResult.innerHTML = ''
      this.$refs.modelResult.appendChild(renderer.domElement)

      // 石头材质的体素
      const geometry = new THREE.BoxGeometry(1,1,1)
      const texture = new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABA0lEQVR4nH2TqZIFIQxFz1Th0gaF4X/7RzFRGKLnia7kBapn4lhyt8DPfd+/pJpzYmYAiAhmxlqL67piL1eZcwJgZtGQL4lIrFU1wPxu8ea1Vhy6gswM0Frb2EXkARAReu9hodbKnBMRodYa+15OAFBccvae7QDUWgMonwMUZ3HGUyLAGGOztNYCoPf+KPDKLGOMsOV3PDwHnnPuIapqMFzXxRgjGk57kYGznAGeit7KzL7v4Ew7N/8HWFSV1lrIdamquvnOWW1j9Mfhvv6avZ/7SN1uORFzwvlPuKoctJlRMqKZbWBZsojQWttG2nt/QjyZTjW58tSA7194Y33LxAm95wPTW9rwXQ/lWgAAAABJRU5ErkJggg==')
      texture.magFilter = THREE.NearestFilter
      const material = new THREE.MeshLambertMaterial({ map:texture })
      const cube = new THREE.Mesh(geometry, material)
      for (let pos of voxelPoints) {
        const cube_instance = cube.clone()
        cube_instance.position.set(pos[0],pos[1],pos[2])
        scene.add(cube_instance)
      }

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.addEventListener('change', function () {
        renderer.render(scene, camera)
      })

      camera.position.z = this.targetInfoN.z

      this.sceneTarget.scene = scene
      this.sceneTarget.camera = camera
      this.sceneTarget.renderer = renderer
      this.sceneTarget.controls = controls
    },
    //下载投影
    getLitematic() {
      //得到dim维度最小最大值
      const getDimMinMax = function(data,dim) {
        const singleDimData = data.map(d => d[dim])
        return [Math.min(...singleDimData),Math.max(...singleDimData)]
      }

      const voxel = this.targetInfo.voxelPoints
      let formattedVoxel = []
      //三个元素 代表三个维度的最小最大值
      let minmax = []
      if (voxel && voxel.length > 0) {
        this.status.liteMaking = true
        for (let dim in [0,1,2]) {
          minmax.push(getDimMinMax(voxel,dim))
        }
        //每个体素的坐标非负
        formattedVoxel = voxel.map(v => [v[0] - minmax[0][0],v[1] - minmax[1][0],v[2] - minmax[2][0]])
        const postData = {
          scu: formattedVoxel,
          size: minmax.map(m => m[1] - m[0])
        }
        // axios.post('http://localhost:9969/sculpture',
        axios.post('https://mcpixelart.com/sculpture',
          postData,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
        .then(response => {
          if (response.data && response.data.url) {
            this.downloadFile(response.data.url)
          } else {
            this.alert(this.lang.a_500, 3)
          }
        })
        .catch(error => {
          this.alert(this.lang.a_400+'\n'+error, 3)
        })
        .finally(() => {
          this.status.liteMaking = false
        })
      } else {
        this.alert(this.lang.a_makepic)
      }
    },
  },
  computed: {
    ...mapGetters(['lang']),
    ...mapState(['mcblocks','lang_now']),
    //放大倍数
    magnification() {
      const os = this.originSize
      let mag = {x: 1, y: 1,z: 1}
      for (let dim in mag) {
        mag[dim] = this.targetInfo[dim] / os[dim]
      }
      return mag
    },
    //计算原模型尺寸
    originSize() {
      return this.originInfo.maxCorner.clone().sub(this.originInfo.minCorner)
    },
    //目标模型尺寸的数字格式
    targetInfoN() {
      return {
        x: Number.parseInt(this.targetInfo.x),
        y: Number.parseInt(this.targetInfo.y),
        z: Number.parseInt(this.targetInfo.z),
      }
    },
    //检查用户输入的target尺寸是否有误 输出有误的维度名称和原因 如['x','z'] ['不是数字','数字太大']
    checkTargetVaild() {
      //用来记录有误的维度
      let invaild = new Set()
      //用来记录每个维度的错误信息
      let invaildDesp = {}
      //int化后的三维尺寸
      const os = this.targetInfoN
      //每个维度最大长度
      const MAX = 1000

      for (let dim in os) {
        if (!Number.isInteger(os[dim])) {
          invaild.add(dim)
          invaildDesp[dim] = '请输入正整数'
        }
        if (os[dim] <= 0) {
          invaild.add(dim)
          invaildDesp[dim] = '长度必须为正'
        }
        if (os[dim] > MAX) {
          invaild.add(dim)
          invaildDesp[dim] = '长度不超过200'
        }
      }
      return {
        invaild: [...invaild],
        invaildDesp
      }
    },
  },
  watch: {
    //加载新obj文件后 长宽高一栏显示模型原本的尺寸
    originSize(os) {
      //有效数字位数
      const sig = 3
      if(os && os.x && os.y && os.z) {
        this.targetInfo.x = os.x.significant(sig)
        this.targetInfo.y = os.y.significant(sig)
        this.targetInfo.z = os.z.significant(sig)
      }
    },
  }
}
</script>

<style scoped>
  .outer {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .core {
    background-color: rgb(216, 216, 216);
    width: 80%;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    user-select: none;

    .core-title {
      width: 100%;
      padding: 20px;
      /* display: flex; */
      /* flex-flow: row nowrap; */

      .logo {
        width: 42px;
        height: 36px;
      }

      span {
        font-size: 26px;
      }
    }
  }

  .input-box {
    padding: 20px;
    box-sizing: border-box;
  }

  .model-show-box canvas,.t-shirt{
    width: 30vw;
    height: 30vw;
  }

  .model-show-box {
    display: flex;
    flex-flow: row nowrap;
    width: 100%;
    justify-content: space-around;
  }

  .model-origin,.model-result {
    display: flex;
    flex-flow: column nowrap;
    background-color: #4a5f9c;
    justify-content: center;
    text-align: center;
  }

  .control-box {
    display: flex;
    flex-flow: row nowrap;
    padding: 20px;
    width: 100%;

    .input-group {
      max-width: 60%;
    }
  }

  #offcanvasHelp3 {
    h5{
      color:rgb(22, 177, 255)
    }
    p{
      line-height: 1.8rem;
    }
  }
</style>