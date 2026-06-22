import type { MetadataField } from '../types'

// Template & Metadata 화면에서 사용하는 메타데이터 정의표
export const METADATA_FIELDS: MetadataField[] = [
  {
    key: 'assetCreatedYear',
    label: 'Asset Created Year',
    group: '이관 시점 확정 값',
    example: '2026',
    required: true,
    templates: ['*'],
  },
  {
    key: 'region',
    label: 'Region',
    group: 'DAM 필수 전송 값',
    example: 'Global / EU / NA',
    required: true,
    templates: ['*'],
  },
  {
    key: 'locale',
    label: 'Locale',
    group: 'DAM 필수 전송 값',
    example: 'ko-KR / en-US',
    required: true,
    templates: ['*'],
  },
  {
    key: 'bu',
    label: 'BU',
    group: '자동 입력 가능 값',
    example: 'MS / HS / ES',
    required: true,
    templates: ['*'],
  },
  {
    key: 'pimCategoryLv2',
    label: 'PIM Category LV2',
    group: '자동 입력 가능 값',
    example: 'TV',
    required: true,
    templates: ['Product PDP Template', 'Feature Asset Template'],
  },
  {
    key: 'pimCategoryLv3',
    label: 'PIM Category LV3',
    group: '자동 입력 가능 값',
    example: 'OLED TV',
    required: false,
    templates: ['Product PDP Template'],
  },
  {
    key: 'pimCategoryLv4',
    label: 'PIM Category LV4',
    group: '프로젝트 참고 값',
    example: 'OLED evo G5',
    required: false,
    templates: ['Product PDP Template'],
  },
  {
    key: 'modelTool',
    label: 'Model / Tool',
    group: 'DAM 필수 전송 값',
    example: 'OLED65G5',
    required: true,
    templates: ['*'],
  },
  {
    key: 'pimColor',
    label: 'PIM Color',
    group: '추천 입력 값',
    example: 'Black / Silver',
    required: false,
    templates: ['Product PDP Template', 'Gallery Template'],
  },
  {
    key: 'inch',
    label: 'Inch',
    group: '추천 입력 값',
    example: '65"',
    required: false,
    templates: ['Product PDP Template'],
  },
  {
    key: 'factoryModel',
    label: 'Factory Model',
    group: '프로젝트 참고 값',
    example: 'OLED65G5PSA',
    required: false,
    templates: ['*'],
  },
  {
    key: 'marketType',
    label: 'B2C / B2B',
    group: 'DAM 필수 전송 값',
    example: 'B2C',
    required: true,
    templates: ['*'],
  },
  {
    key: 'publishingChannel',
    label: 'Publishing Channel',
    group: 'DAM 필수 전송 값',
    example: 'LG.com',
    required: true,
    templates: ['*'],
  },
  {
    key: 'assetType',
    label: 'Asset Type',
    group: 'DAM 필수 전송 값',
    example: 'Hero Image',
    required: true,
    templates: ['*'],
  },
  {
    key: 'searchTag',
    label: 'Search Tag',
    group: '추천 입력 값',
    example: 'oled, premium, 2026',
    required: false,
    templates: ['*'],
  },
  {
    key: 'transferTarget',
    label: 'Transfer Target (목표 이관일)',
    group: '이관 시점 확정 값',
    example: '2026-07-31 (날짜) · +60일 후 삭제 알림',
    required: true,
    templates: ['*'],
  },
  {
    key: 'archiveRule',
    label: 'Archive Rule',
    group: '이관 시점 확정 값',
    example: '신규 등록',
    required: true,
    templates: ['*'],
  },
  {
    key: 'qaRequired',
    label: 'QA Required',
    group: '프로젝트 참고 값',
    example: 'true',
    required: false,
    templates: ['*'],
  },
  {
    key: 'localizationRequired',
    label: 'Localization Required',
    group: '프로젝트 참고 값',
    example: 'true',
    required: false,
    templates: ['*'],
  },
]

export const ARCHIVE_RULE_OPTIONS = [
  '기존 자산 대체',
  '기존 자산과 병존',
  '신규 등록',
] as const

export const METADATA_GROUPS = [
  'DAM 필수 전송 값',
  '프로젝트 참고 값',
  '자동 입력 가능 값',
  '추천 입력 값',
  '이관 시점 확정 값',
] as const

// PIM2.0 카테고리 계층: BU(=LV1) → LV2 → LV3 → LV4
// 예) MS > Home Entertainment > TV > OLED evo G5
export const PIM_CATEGORY_TREE = {
  MS: {
    'Home Entertainment': {
      TV: ['OLED evo G5', 'OLED evo C5', 'QNED93'],
      Soundbar: ['S95TR', 'SG10TY'],
      Projector: ['CineBeam Q', 'CineBeam S'],
    },
    IT: {
      Monitor: ['UltraGear 32GS95UE', 'UltraFine 32U', 'gram View'],
      Laptop: ['gram Pro 17', 'gram 16'],
    },
  },
  HS: {
    'Living Appliance': {
      'Cordless Vacuum': ['CordZero A9T', 'CordZero ThinQ'],
      Styler: ['Styler Objet', 'Styler S5'],
      'Air Care': ['PuriCare 360', 'PuriCare AeroTower'],
    },
    'Kitchen Appliance': {
      Refrigerator: ['InstaView M623', 'Objet Fridge'],
      Dishwasher: ['TrueSteam DUBJ', 'Objet Dishwasher'],
      Oven: ['NeoChef', 'WolfPro Range'],
    },
  },
  ES: {
    'Air Solution': {
      'Air Purifier': ['PuriCare 360', 'PuriCare Mini'],
      'Residential AC': ['DUALCOOL', 'Whisen'],
      HVAC: ['Multi V i', 'Multi V 5'],
    },
    Energy: {
      ESS: ['ESS Home 10', 'ESS Grid'],
      Chiller: ['Centrifugal Chiller', 'Screw Chiller'],
    },
  },
} as const

export const CHANNELS = [
  'LG.com',
  'B2B',
  'Retailer',
  'Criteo',
  'Contents Hub',
] as const

export const LOCALES = [
  'ko-KR',
  'en-US',
  'en-GB',
  'de-DE',
  'fr-FR',
  'ja-JP',
  'es-ES',
] as const

export const REGIONS = ['Global', 'NA', 'EU', 'KR', 'APAC'] as const
