import { fileURLToPath } from 'node:url'

// 부모 디렉터리에서 `vite dam-mvp`로 실행될 때 cwd가 reporting이 되어
// content glob이 어긋나는 문제를 막기 위해 절대경로로 고정한다.
const here = fileURLToPath(new URL('.', import.meta.url)).replace(/\\/g, '/')

/** @type {import('tailwindcss').Config} */
export default {
  content: [`${here}index.html`, `${here}src/**/*.{ts,tsx}`],
  theme: {
    extend: {
      colors: {
        // Claude/Anthropic 시그니처 클레이(코랄) 액센트
        brand: {
          50: '#fbf3ee',
          100: '#f5e1d6',
          200: '#ecc6b3',
          500: '#c96442', // Claude clay
          600: '#b5512f',
          700: '#8f3f24',
        },
        // 따뜻한 크림 배경 계열 (ivory)
        cream: {
          50: '#faf9f5',
          100: '#f4f3ec',
          200: '#f0eee6', // Anthropic ivory medium
          300: '#e9e6db',
        },
        // 따뜻한 중립 텍스트/보더 (stone 기반 보강)
        ink: {
          900: '#2b2a27',
          700: '#44423d',
          500: '#6b6862',
          300: '#a8a49b',
        },
      },
      fontFamily: {
        sans: [
          'Pretendard Variable',
          'Pretendard',
          'Apple SD Gothic Neo',
          'Malgun Gothic',
          'system-ui',
          'sans-serif',
        ],
        display: [
          '"Noto Serif KR"',
          'ui-serif',
          'Georgia',
          '"Times New Roman"',
          'serif',
        ],
      },
    },
  },
  plugins: [],
}
