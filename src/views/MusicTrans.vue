<template>
  <div class="outer">
    <main>
      <div class="alert alert-info" role="alert">
        请上传.mid音乐文件，可从 <a href="https://midishow.com" target="_blank" rel="noopener noreferrer">MidiShow</a>等网站下载
      </div>
      <input type="file" @change="handlerMidiFile" accept=".mid" />
      <div class="buttons">
        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#helpModal">
          <img 
            src="@/assets/img/帮助_白色.svg" 
            class="icon"
          >
          如何制作
        </button>
        <button type="button" class="btn btn-success" @click="download">
          <div v-if="isLoading">
            <div class="spinner-border text-light icon" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            制作中
          </div>
          <div v-else>
            <img 
              src="@/assets/img/下载.svg" 
              class="icon"
            >
            下载投影
          </div>
        </button>
      </div>
      <div class="tracks-info" v-if="tracks.length > 0">
        <span>合并后音轨共{{ tracks.length }}条</span>
      </div>
      <div class="tracks">
        <MIDITrack v-for="track in tracks" :key="`track-${track.name}`" :track="track"></MIDITrack>
      </div>
    </main>
    <AlertToast ref="toast"></AlertToast>

    <div class="modal fade" id="helpModal" tabindex="-1" aria-labelledby="helpModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="helpModalLabel">红石音乐制作说明</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" style="line-height: 2rem;">
            上传<span class="badge text-bg-info">.mid格式</span>音乐后点击下载您将会得到一份投影文件 <br>
            使用投影mod粘贴到游戏中 <br>
            将所有音轨的开头使用等时红石线连接即可启动 
            <hr>
            MIDI音乐标准包含128种乐器,MC中只有16种 <br>
            MIDI标准音高有128种,MC中只有25种音高 <br>
            因此红石音乐难免会有失真,本站尽可能还原音乐的质量
            <hr>
            有任何疑问/建议 欢迎加微信<span class="badge text-bg-success">15891653276</span>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { Midi } from '@tonejs/midi'
import MIDITrack from '@/components/MIDITrack.vue'
import AlertToast from '@/components/AlertToast.vue'
import { mapNoteToRange, mapInstrumentToBlock } from '@/utils/MIDI'
import { autoDownload } from '@/utils/download'
export default {
  name: 'MusicTrans',
  components: {
    MIDITrack,
    AlertToast
  },
  data() {
    return {
      // 正在下载
      isLoading: false,
      // 原始音轨
      tracksOrigin: [],
    }
  },
  computed: {
    tracks() {
      // 合并名称相同的轨道
      // trackSet k=乐器名 v=时间音高持续时长键值对
      const trackSet = {}
      this.tracksOrigin.forEach(t => {
        const name = t.instrument.name
        if (!(name in trackSet)) {
          trackSet[name] = {}  
        }
        t.notes.forEach(note => {
          trackSet[name][note.time] = {midi: mapNoteToRange(note.midi), dur: note.duration}
        })
      })
      // 把trackSet转换为对象数组
      const ts = []
      const trackSetNames = Object.keys(trackSet)
      for(const tName of trackSetNames) {
        if(Object.keys(trackSet[tName]).length === 0) continue // 去掉空音轨
        ts.push({
          name: tName,
          pitch: Object.values(trackSet[tName]).map(o => o.midi),
          duration: Object.values(trackSet[tName]).map(o => o.duration),
          time: Object.keys(trackSet[tName]),
        })
      }
      return ts
    }
  },
  methods: {
    help() {
      
    },
    async handlerMidiFile(event) {
      const file = event.target.files[0]
      if (!file) return

      const arrayBuffer = await file.arrayBuffer()
      const midi = new Midi(arrayBuffer)

      this.tracksOrigin.splice(0)
      midi.tracks.forEach(track => this.tracksOrigin.push(track))
    },
    // 下载投影
    download() {
      if (this.isLoading) return
      this.isLoading = true

      const ts = [] // 音轨
      this.tracks.forEach(track => {
        // 获取最大时间
        const maxTime = Math.max(...track.time)

        // 生成步长为0.1秒的新时间数组
        const newTimeArray = []
        for (let t = 0; t <= maxTime; t = parseFloat((t + 0.1).toFixed(1))) {
          newTimeArray.push(t)
        }

        // 根据新时间数组生成目标数组
        const result = newTimeArray.map((t) => {
          // 检查 time 数组中是否有接近 t 的时间点
          const index = track.time.findIndex(origTime => Math.abs(origTime - t) < 0.1)

          if (index !== -1) {
            return {
              play: true,
              pitch: track.pitch[index] // 如果有多个重复 pitch，任意取一个
            }
          } else {
            return {
              play: false
            }
          }
        })

        ts.push({
          name: mapInstrumentToBlock(track.name),
          arr: result
        })
      })

      axios.post('https://mcpixelart.com/musicGen', ts)
      .then(res => res.data)
      .then(data => {
        autoDownload('https://mcpixelart.com/music/' + data.url)
        this.$refs.toast.show('success', '制作成功\n' + 'https://mcpixelart.com/music/' + data.url)
      })
      .catch(reason => {
        const error = reason.response.data.error || `制作出错了\n${reason}`
        this.$refs.toast.show('error', error, 'mcpixelart', '下载失败')
      })
      .finally(() => {
        this.isLoading = false
      })
    },
  }
}
</script>

<style lang="less" scoped>
.outer {
  width: 100%;
  background-image: url('@/assets/img/yellow.png');
  height: 100vh;
  overflow-x: hidden;
  display: flex;
  justify-content: center;
}
main {
  width: 70%;
  height: 100%;
  background-color: #ffffff8c;
  overflow-y: auto;
  display: flex;
  flex-flow: column nowrap;
  gap: 10px;
  box-sizing: border-box;
  padding: 15px;
}
.icon {
  height: 24px;
  width: 24px;
}
input {
  width: 100%;
  padding: 10px;
  border: 2px dashed gray;
}
.buttons {
  display: flex;
  flex-flow: row nowrap;
  gap: 10px;
}
.tracks {
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  overflow: auto;
}
.tracks-info {
  padding: 10px;
  width: 100%;
  border-radius: 10px;
  background-color: #65ef46b5;
}
@media (max-width: 800px) {
  main {
    width: 100%;
  }
}
</style>