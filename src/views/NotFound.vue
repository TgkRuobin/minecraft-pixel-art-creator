<template>
  <div class="outer">
    <div class="container">  
      <div class="image-404">  
        <img src="@/assets/img/404.svg" alt="404">  
      </div>  
      <h1>404 - 页面未找到</h1>  
      <p>
        对不起，您访问的页面不存在。<br>
        Sorry,page not found.
      </p>
      <router-link to="/">返回 Return</router-link>
    </div>
  </div>
  
</template>

<script>
export default {
  name: 'NotFound',
}
</script>

<style scoped>
  .outer {  
    font-family: consolas,Arial, sans-serif;  
    margin: 0;  
    padding: 0;  
    display: flex;  
    justify-content: center;  
    align-items: center;  
    height: 100vh;  
    background-color: #f0f4f8;  
  }  
  .container {  
    text-align: center;  
    background-color: #fff;  
    padding: 40px;  
    border-radius: 8px;  
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);  
  }  
  .container h1 {  
    margin: 0;  
    font-size: 48px;  
    color: #333;  
  }  
  .container p {  
    font-size: 18px;  
    color: #666;  
    margin: 20px 0;  
  }  
  .container a {  
    display: inline-block;  
    padding: 10px 20px;  
    background-color: #007bff;  
    color: #fff;  
    text-decoration: none;  
    border-radius: 4px;  
    transition: background-color 0.3s;  
  }  
  .container a:hover {  
    background-color: #0056b3;  
  }  
  .image-404 {  
    margin-bottom: 20px;  
  }  
  .image-404 img {  
    width: 100px;  
    height: auto;  
  }  
</style>