<template>
  <div class="outer">
    <nav class="navbar" style="background-color: #e3f2fd;user-select: none;">
      <div class="container-fluid" style="justify-content: left;">
        <!-- brand  -->
        <div class="navbar-brand">
          <img src="@/assets/img/favicon.png" alt="PX" width="30" height="24" class="d-inline-block align-text-top">
          {{ lang.bd_title }}
        </div>
        <!-- 提交区 -->
        <form class="d-flex" role="search" style="flex-grow: 1;">
          <input 
            :class="['form-control', 'me-2', UrlValid.valid]" 
            style="flex-grow: 1;" 
            type="search" 
            :placeholder="lang.bd_inputlink" 
            aria-label="Search" 
            v-model="url" 
            required
          >
          <button 
            class="btn btn-outline-success" 
            type="submit" 
            style="white-space: nowrap;" 
            :disabled="status.getting" 
            @click.prevent="submit"
          >
            <span v-show="status.getting" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
            <span v-show="status.getting" role="status">{{ lang.loading }}</span>
            <span v-show="!status.getting">{{ lang.bd_get }}</span>
          </button>
        </form>
      </div>
    </nav>
    <!-- 类似购物网站的小图和大图显示 -->
    <ImageCropper
      :imageSrc="imageSrc"
      :selectedLine="{ratio: edit.lineMax > 0 ? edit.line / edit.lineMax : 0,lines: size.height}"
    />
    <!-- 单行读取 -->
    <div class="edit-outer">
      <!-- 控制区 -->
      <div class="edit-ctl">
        <!-- 现在显示的第几行 -->
        <span>{{ lang.bd_nowline }}</span>
        <button @click="edit.line = limit(edit.line - 1,edit.lineMin,edit.lineMax)">-</button>
        <input type="number" v-model="edit.line" :min="edit.lineMin" :max="edit.lineMax">
        <button @click="edit.line = limit(edit.line + 1,edit.lineMin,edit.lineMax)">+</button>
        <!-- 二维表每行显示个数 -->
        <span>{{ lang.bd_eachline }}</span>
        <input type="number" v-model="edit.ns" min="0">
        <!-- 图片尺寸 -->
        <span>{{ `${lang.bd_size}:${size.height}×${size.width}` }}</span>
        <!-- 鼠标点击小方块后显示详情信息 -->
        <span style="color:coral;">{{ status.selectedBlock }}</span>
      </div>
      <!-- 工作区 -->
      <!-- 区域分为四块 区域间距8px -->
      <!-- 小区域里的小方块间距都是8px  -->
      <div class="edit-wk">
        <div class="edit-yoko">
          <!-- 左上角的占位空间 -->
          <div class="edit-lt"><img style="width: 32px;height: 32px;"></div>
          <!-- 右上角显示列标签 -->
          <div class="edit-rt" :style="`width: ${edit.n * 40 - 8}px;`">
            <div class="block" v-for="r in getRow" :key="'r'+r">
              {{ r }}
            </div>
          </div>
        </div>
        <div class="edit-yoko">
          <!-- 左下角显示行标签 -->
          <div class="edit-lb">
            <div class="block" v-for="c in getCol" :key="'c'+c">
              {{ c }}
            </div>
          </div>
          <!-- 右下角显示oneline -->
          <div class="edit-rb">
            <div class="tableLine" v-for="(tLine,tLineIndex) in onelineToTable" :key="`tl${tLineIndex}`">
              <!-- 每个方块32*32大小 -->
              <div 
                class="colorShow" 
                v-for="(item,index) in tLine" 
                :key="`block${item}${index}`" 
                :style="`background-position: -${offsetMap[item].x}px -${offsetMap[item].y}px;`"
                @click="status.selectedBlock=`${lang.bd_index}:${index+1+tLineIndex*edit.n} ${lang.bd_name}:${lang_now === 'lang_cn' ? nameMap[item] : item}`"
              >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <AlertModal 
      :visible="status.showAlert"
      :msg="status.alertMsg"
      :icon="status.alertIcon"
      @hide="status.showAlert = false"
    >
    </AlertModal>
  </div>
</template>

<script>
import { mapGetters,mapState } from 'vuex'
import axios from 'axios'
import Cookies from 'js-cookie'
import ImageCropper from '@/components/ImageCropper.vue'
import blockcss from '@/assets/img/BlockCSS.png'
import AlertModal from '@/components/AlertModal.vue'
export default {
  name: 'BedRock',
  components: {
    ImageCropper,
    AlertModal,
  },
  data() {
    return {
      //搜索框
      url: '',
      //图片的二维数组
      imageArray: [],
      //原始图
      imageSrc: '',
      //方块名到BlockCSS偏移量的映射
      offsetMap: {},
      //方块中英文名映射
      nameMap: {},
      status: {
        //正在获取文件
        getting: false,
        selectedBlock: '',
        //alert
        showAlert: false,
        alertMsg: '',
        alertIcon: 0,
      },
      //edit区域
      edit: {
        //当前显示第line行
        line: 0,
        lineMin: 0,
        lineMax: 0,
        //一行显示n个 输入框绑定ns watch块中验证无误后同步到n
        ns: 16,
        n: 16,
      },
    }
  },
  created() {
    //创建映射
    for (let kind of this.mcblocks) {
      for (let bc of kind.bclass) {
        this.offsetMap[bc.minecraft] = {
          x: bc.x * 32,
          y: bc.y * 32
        }
        this.nameMap[bc.minecraft] = bc.name
      }
    }
    this.offsetMap['air'] = {
      x: 47 * 32,
      y: 47 * 32
    }
    this.nameMap['air'] = 'None'
    this.status.selectedBlock = this.lang.bd_specific
    //加载上次访问的url
    const histUrl = Cookies.get('hist-bd-url')
    if (histUrl) {
      this.url = histUrl
    }
  },
  methods: {
    //显示模态框
    alert(msg = '',icon = 0) {
      this.status.alertMsg = msg
      this.status.alertIcon = icon
      this.status.showAlert = true
    },
    //根据二维数组生成图片
    generateImage() {
      const spriteImage = new Image()
      spriteImage.src = blockcss
      spriteImage.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        canvas.width = this.imageArray[0].length * 8
        canvas.height = this.imageArray.length * 8

        // 遍历二维数组，绘制每个小图
        this.imageArray.forEach((row, rowIndex) => {
          row.forEach((tileName, colIndex) => {
            const offset = this.offsetMap[tileName]
            if (offset) {
              // 绘制小图到canvas上，并缩放
              ctx.drawImage(
                spriteImage, // 精灵图
                offset.x / 2, offset.y / 2, //注意offsetMap是32倍关系 这里需要16倍
                16, 16, // 小图的原始尺寸
                colIndex * 8, rowIndex * 8, // canvas上的起始位置
                8, 8 // canvas上的尺寸
              )
            }
          })
        })
        this.imageSrc = canvas.toDataURL()
        canvas.remove()
      }

    },
    //提交文件链接
    submit() {
      const valid = this.UrlValid
      //通过格式验证
      if (valid.fname) {
        axios.get('https://mcpixelart.com/reload', {
          params: {
            fname: valid.fname
          }
        })
        .then(response => {
          //检测服务器返回的数据是否包含image字段
          if (response.data && response.data.image) {
            //动态将image添加到this.image
            this.imageArray.splice(0)
            for (const line of response.data.image) {
              this.imageArray.push(line)
            }
            this.generateImage()
            this.edit.lineMax = this.imageArray.length - 1
          } else {
            //服务器没有传回image
            this.alert(this.lang.a_505,3)
          }
        })
        .catch(err => {
          if (err.response) {
            switch (err.response.status) {
              case 400:
                //fname包含了非法的字符或未指定fname
                this.alert(this.lang.wrongfmt,2)
                break
              case 404:
                //链接不存在
                this.alert(this.lang.bd_404,2)
                break
              default:
              this.alert('' + err.response.status + ' <br> ' + err.response.data)
            }
          }else if (err.request) {
            //没有收到响应
            this.alert(this.lang.bd_nores + err.request,2)
          } else {
            //请求错误
            this.alert(this.lang.bd_wrong + err.message,3)
          }  
        })
      } else {
        //没有填写链接
        this.alert(this.lang.bd_correctlink,2)
      }
    },
    //限幅函数
    limit(v,min,max) {
      if (Number.parseInt(v) < Number.parseInt(min)) return Number.parseInt(min)
      if (Number.parseInt(v) > Number.parseInt(max)) return Number.parseInt(max)
      return Number.parseInt(v)
    },
  },
  computed: {
    ...mapGetters(['lang']),
    ...mapState(['mcblocks','lang_now']),
    //得到图片的尺寸
    size() {
      return {
        width: this.imageArray.length,
        height: this.imageArray[0] ? this.imageArray[0].length : 0
      }
    },
    //检查输入的Url合法性 格式化输出文件地址、搜索框样式
    UrlValid() {
      //识别形如 https://mcpixelart.com/lite/9937-1ae5bdae0b8b.litematic 可以忽略域名、扩展名
      //1730032686651c8f5f24f-941e-4a8b-85fe-b6a82878415a
      const reg1 = /lite\/(?<fname>[0-9a-zA-Z-]+)\.?/
      //识别形如 9937-1ae5bdae0b8b.litematic 可以忽略扩展名
      const reg2 = /^(?<fname>[0-9a-zA-Z-]+)\.?/
      
      const mt = this.url.match(reg1) || this.url.match(reg2)
      if (mt) {
        const fname = mt.groups.fname
        return {
          valid: 'is-valid',
          fname,
        }
      } else {
        if (this.url.trim() === '') {
          //空内容
          return {
            valid: '',
          }
        } else {
          //非法内容
          return {
            valid: 'is-invalid',
          }
        }
        
      }
    },
    //得到一行的方块
    oneline() {
      const size = this.size
      if (size.width > 0) {
        //图片不为空
        const lineNum = this.limit(this.edit.line,this.edit.lineMin,this.edit.lineMax)
        //得到该行
        const thisline = this.imageArray[lineNum]
        return thisline
      } else {
        return []
      }
    },
    //把oneline转换为宽度为edit.n的二维数组
    onelineToTable() {
      //原始数据
      const oneline = this.oneline
      //二维表
      const table = []
      //记录二维表中的一行
      let tableLine = []
      //计数器 每次满edit.n后都将tableLine添加到table中
      let count = 0
      for (let element of oneline) {
        tableLine.push(element)
        count = (count + 1) % this.edit.n
        if (count === 0) {
          table.push(tableLine)
          tableLine = []
        }
      }
      if (tableLine.length > 0) {
        // 最后一行剩余的也要push进去
        table.push(tableLine)
      }
      return table
    },
    //得到oneline的行数height和列数width(即edit.n)
    onelineSize() {
      const ol = this.oneline
      if (ol.length > 0) {
        return {
          height: ol.length / this.edit.n,
          width: this.edit.n
        }
      } else {
        return {
          height: 0,
          width: 0
        }
      }
    },
    //得到edit区横向内容
    getRow() {
      const res = []
      for (let i = 0;i < this.edit.n;i++) {
        res.push(i+1)
      }
      return res
    },
    //得到edit区纵向内容
    getCol() {
      const res = []
      for (let i = 0;i < this.onelineSize.height;i++) {
        res.push(i * this.edit.n)
      }
      return res
    },
  },
  watch: {
    url(u) {
      Cookies.set('hist-bd-url',u, { expires: new Date('Sat, 01 Jan 2037 00:00:00 UTC') })
    },
    'edit.ns'(ns) {
      if (ns > 0) {
        //必须为正整数
        this.edit.n = ns
      }
    }
  }
}
</script>

<style lang="less" scoped>
  outer {
    width: 100%;
  }

  .edit-ctl {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    gap: 8px;
    margin: 10px 0;
    white-space: nowrap;
    
    button {
      border: solid 1px slateblue;
      padding: 2px 8px;
      border-radius: 4px;
    }
    
  }

  .edit-wk {
    display: flex;
    flex-flow: column nowrap;
    gap: 8px;
    user-select: none;

    .edit-yoko {
      display: flex;
      flex-flow: row nowrap;
      gap: 8px;

      .edit-lt {
        height: 32px;
        width: 32px;
      }

      .edit-rt {
        height: 32px;
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        gap: 8px;
      }

      .edit-lb {
        width: 32px;
        display: flex;
        flex-flow: column nowrap;
        justify-content: space-between;
        gap: 8px;
      }

      .edit-rb {
        display: flex;
        flex-flow: column nowrap;
        justify-content: space-between;
        gap: 8px;
        background-color: #ffdec3;
      }

      .tableLine {
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-around;
        gap: 8px;
      }

      .block {
        width: 32px;
        height: 32px;
      }
    }
  }

  .colorShow {
    display: inline-block;
    width: 32px;
    height: 32px;
    background-image: url('@/assets/img/BlockCSS2.png');
    border: solid 1px black;
    box-sizing: border-box;
  }

  @media only screen and (max-width: 800px) {
    .navbar-brand {
      font-size: 16px;
    }
  }
</style>