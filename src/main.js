import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
// 引入Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 引入中文语言包
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

// 创建Vue应用实例
const app = createApp(App)

// 使用Element Plus插件
app.use(ElementPlus, {
  locale: zhCn
})

// 挂载应用到DOM
app.mount('#app')