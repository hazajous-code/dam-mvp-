import { fileURLToPath } from 'node:url'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// 이 프로젝트가 부모 디렉터리에서 `vite dam-mvp`로 실행될 때도
// Tailwind가 dam-mvp의 config를 사용하도록 경로를 명시적으로 고정한다.
// (Tailwind PostCSS 플러그인은 기본적으로 process.cwd() 기준으로 config를 찾는다)
const config = fileURLToPath(new URL('./tailwind.config.js', import.meta.url))

export default {
  plugins: [tailwindcss({ config }), autoprefixer()],
}
