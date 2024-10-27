<template>
  <div v-show="visible" class="outer-img" @click="handlerClick">
    <img :src="url" ref="imgPreview">
  </div>
</template>

<script>
export default {
  name: 'ShowImage',
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
  methods: {
    //点击隐藏
    handlerClick() {
      this.$emit('hide')
    }
  },
  watch: {
    //使得图片能保持原比例 并以最大70%屏幕宽高的尺寸显示
    visible(newV){
      if(newV){
        const img = this.$refs.imgPreview
        const w = img.naturalWidth | 100
        const h = img.naturalHeight | 100
        if(w > h){
          img.style.width = '70%'
          img.style.height = 'auto'
        }else{
          img.style.height = '70%'
          img.style.width = 'auto'
        }
      }
    }
  }
}
</script>

<style scoped>
  .outer-img{
    position: fixed;
    width: 100%;
    height: 100vh;
    background-color: rgba(0,0,0,0.5);
    display: grid;
    place-items: center;
    z-index: 5;
  }
</style>