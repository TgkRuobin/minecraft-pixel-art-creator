<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import Cookies from 'js-cookie'
export default {
  created() {
    if (!Cookies.get('hist-id')) {
      Cookies.set('hist-id',this.generateId())
    }
  },
  methods: {
    generateId() {
      return `${Date.now()}_${Math.floor(Math.random() * 100000)}`
    }
  }
}
</script>

<style>
  *{
    margin: 0;
    padding: 0;
  }

  #app{
    position: relative;
    /* overflow: hidden */
  }
</style>
