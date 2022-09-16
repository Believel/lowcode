import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // 开发或生产环境服务的公共基础路径
  base: '/lowcode',
  server: {
    port: 3001
  },
  plugins: [react()],
  css: {
    // css模块化: 文件以.module.[css|less|scss]结尾
    modules: {
      generateScopedName: '[name]_[local]_[hash:base64:5]',
      hashPrefix: 'prefix'
    },
    // 预编译支持less
    preprocessorOptions: {
      less: {
        // 支持内联 javaScript
        javascriptEnabled: true
      }
    }
  }
})
