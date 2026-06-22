import type { TemplateDef } from '../types'

export const TEMPLATES: TemplateDef[] = [
  {
    id: 'product-pdp',
    name: 'Product PDP Template',
    description: '제품 상세 페이지(PDP)용 표준 자산 패키지',
  },
  {
    id: 'feature-asset',
    name: 'Feature Asset Template',
    description: '핵심 기능 소구 이미지 세트',
  },
  {
    id: 'gallery',
    name: 'Gallery Template',
    description: '갤러리/라이프스타일 이미지 묶음',
  },
  {
    id: 'video',
    name: 'Video Template',
    description: '제품/브랜드 영상 자산',
  },
  {
    id: 'retailer-package',
    name: 'Retailer Package Template',
    description: '리테일러 배포용 패키지(규격 다중)',
  },
  {
    id: 'contents-hub',
    name: 'Contents Hub Share Template',
    description: 'Contents Hub 공유/다운로드용 패키지',
  },
]

export const TEMPLATE_NAMES = TEMPLATES.map((t) => t.name)
