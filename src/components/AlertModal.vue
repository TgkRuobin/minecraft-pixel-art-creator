<template>
  <!-- 0.3秒动画结束后点击模态框外围才能触发关闭 防止鼠标连点直接关掉模态框  -->
  <div 
    ref="alertbg" 
    :class="{'modal-background':visible,'modal-hide':!visible}" 
    v-show="visible" 
    @click="handlerClose($event)"
  >
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{lang.am_title}}</h3>
        <!-- 点击关闭键强制关闭 -->
        <span class="close-btn" @click="forceHide">&times;</span>  
      </div>
      <hr>
      <div class="modal-body">

        <img :src="getIcon" class="modal-icon">
        <p v-html="msg"></p>
      </div>
      <div class="modal-footer">
        <!-- 点击确认按钮也是强制关闭 -->
        <button type="button" class="btn" @click="forceHide">{{lang.am_ok}}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters,mapState } from 'vuex'
export default {
  name: 'AlertModal',
  props: {
    //是否显示
    visible: {
      type: Boolean,
      required: true
    },
    msg: {
      type: String,
      default: '提示信息'
    },
    icon: {
      type: Number,
      default: 0
      // 0.info
      // 1.ok
      // 2.alert
      // 3.error
    }
  },
  data(){
    return {
      //防止连点直接关掉模态框
      canHide: false,
    }
  },
  computed: {
    ...mapGetters(['lang']),
    ...mapState(['lang_now']),
    //根据icon属性返回icon的url
    getIcon(){
      const icons = [
        require('@/assets/img/提示.svg'),
        require('@/assets/img/完成.svg'),
        require('@/assets/img/警告.svg'),
        require('@/assets/img/错误.svg'),
      ]
      return icons[this.icon]
    },
  },
  methods: {
    //强制关闭
    forceHide() {
      this.canHide = false
      this.$emit('hide')
    },
    //关闭
    emitHide() {
      if (this.canHide){
        //退出模态框 重置canHide
        this.canHide = false
        this.$emit('hide')
      }
    },
    //模态框外围点击
    handlerClose(e) {
      if (!e.target.closest('.modal-content')) {
        console.log('e')
        this.emitHide()
      }
    },
  },
  watch: {
    //在打开模态框0.3秒后允许关闭
    visible(vis) {
      if (vis) {
        setTimeout(()=>{
          this.canHide = true
        },300)
      }
    }
  }
}
</script>

<style scoped>
  .modal-hide {
    display: none;
  }
  .modal-background {  
    position: fixed;  
    top: 0;  
    left: 0;  
    width: 100%;  
    height: 100%;  
    background-color: rgba(0, 0, 0, 0.5);  
    display: flex; 
    justify-content: center;  
    align-items: center;  
    z-index: 1000;
    animation: fadeIn 0.3s ease-in-out;  
  }  
  
/* 模态框内容 */  
  .modal-content {  
    background-color: #fff;  
    border-radius: 8px;  
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);  
    width: auto;  
    max-width: 50%;  
    padding: 20px;  
    text-align: center;  
    position: relative;  
    z-index: 1001;  
  }  
  
/* 模态框头部 */  
  .modal-header {  
    display: flex;  
    justify-content: space-between;  
    align-items: center;
    user-select: none;
  }  
  h3 {
    margin: 0;
  }
  hr {
    height: 1px;

  }
  
  .close-btn {  
    float: right;
    font-size: 24px;  
    cursor: pointer;  
    color: #aaa;  
    transition: color 0.3s ease;
  }  
  
  .close-btn:hover {  
    color: red;  
  }  
  
  .modal-header h2 {  
    margin: 0;  
  }  
  
  /* 模态框主体 */  
  .modal-body {
    display: flex;
    flex-flow: row nowrap;
    margin-bottom: 40px;
    align-items: center;
    justify-content: space-around;
  }
  .modal-icon {
    height: 48px;
    width: 48px;
  }
  .modal-body p {
    margin: 0;
  }
  
  /* 模态框底部 */  
  .modal-footer {  
    display: flex;  
    justify-content: right;  
  }   
  
  /* 动画效果 */  
  @keyframes fadeIn {  
    from {  
      opacity: 0;  
    }  
    to {  
      opacity: 1;  
    }  
  }

  button {
    --bs-btn-font-weight: 600;
    --bs-btn-color: var(--bs-white);
    --bs-btn-bg: var(--bd-violet-bg);
    --bs-btn-border-color: var(--bd-violet-bg);

    --bs-btn-bg: #6528e0;
    --bs-btn-border-color: #6528e0;

    --bs-btn-hover-color: var(--bs-white);
    --bs-btn-hover-bg: #8040ea;
    --bs-btn-hover-border-color: #8040ea;

    --bs-btn-focus-shadow-rgb: var(--bd-violet-rgb);
    --bs-btn-active-color: var(--bs-btn-hover-color);
    --bs-btn-active-bg: #5a23c8;
    --bs-btn-active-border-color: #5a23c8;
  }
</style>