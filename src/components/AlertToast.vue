<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div class="toast" role="alert" aria-live="assertive" aria-atomic="true" ref="toast">
      <div class="toast-header">
        <div class="icon" :style="iconBgc"></div>
        <strong class="me-auto">{{ title }}</strong>
        <small>{{ subhead }}</small>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        {{ msg }}
      </div>
    </div>
  </div>
</template>

<script>
import { Toast } from 'bootstrap'
export default {
  name: 'AlertToast',
  
  data() {
    return {
      title: 'mcpixelart',
      subhead: '',
      type: 'info', // 'error' | 'alert' | 'info' | 'success'
      msg: '',
      toastInstance: null
    }
  },
  mounted() {
    this.toastInstance = new Toast(this.$refs.toast)
  },
  computed: {
    iconBgc() {
      const typeMap = {
        'error': '#d91b14',
        'alert': '#d95c14',
        'info': '#14bfd9',
        'success': '#1ee01e',
      }
      return { backgroundColor: typeMap[this.type] || '#14bfd9' }
    }
  },
  methods: {
    show(type, msg, title = 'mcpixelart', subhead = '') {
      this.type = type
      this.msg = msg
      this.title = title
      this.subhead = subhead
      this.toastInstance.show()
    }
  }
}
</script>

<style scoped>
.icon {
  height: 20px;
  width: 20px;
  border-radius: 4px;
  margin: 0 5px;
}
</style>