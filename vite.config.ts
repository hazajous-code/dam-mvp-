import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 데모 배포 환경(GitHub Pages 등)에서도 동작하도록 상대 경로 base 사용
export default defineConfig({
  base: './',
  plugins: [react()],
})
