import { type CSSProperties, type PointerEvent, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import LiquidGlass from 'liquid-glass-react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js'
import WarpText from './components/WarpText'

type Page = 'home' | 'videos' | 'skills'
type PageMotion = 'none' | 'up' | 'down'

const pageOrder: Record<Page, number> = {
  home: 0,
  videos: 1,
  skills: 2,
}
const wheelSwitchThreshold = 22
const wheelBackSwitchThreshold = 10
const wheelSwitchLockMs = 590
const wheelResetMs = 240

const hoodieOrange = '#f26a1b'
const hoodieOrangeDeep = '#d8661a'
const hoodieOrangeDark = '#ad4c14'
const hoodieOrangeGlow = 'rgba(242,106,27,0.18)'
const liquidFolderAsset = '/assets/liquid-glass-folder.png'
THREE.Cache.enabled = true
const homeGlbPromise = new GLTFLoader().loadAsync('/me.glb')

const projects = [
  {
    id: 1,
    title: 'ColorLog',
    year: '2024.11 - 至今',
    label: '独立开发者 / APP PROJECT 01',
    desc: '一款从需求分析、功能设计到前后端开发、测试上架完整推进的移动端产品。项目重点在于把用户记录、数据整理与轻量化体验做成可稳定发布的 App。',
    highlights: ['独立完成产品需求、交互流程和核心功能开发', '推进 App Store 上架流程与版本迭代', '沉淀移动端产品从 0 到 1 的完整落地经验'],
    poster: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=360&h=520&fit=crop&auto=format',
  },
  {
    id: 2,
    title: 'LimU AI',
    year: '2024.11 - 至今',
    label: '独立开发者 / AI APP PROJECT 02',
    desc: '围绕 AI 工具使用场景设计和开发的移动端应用。项目更关注 AI 能力与具体用户任务之间的衔接，包括功能结构、前端体验和发布流程。',
    highlights: ['完成 AI 产品功能拆解、界面组织与开发实现', '处理从开发测试到上架发布的完整链路', '与 ColorLog 共同形成累计 1700+ 用户的产品基础'],
    poster: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=360&h=520&fit=crop&auto=format',
  },
  {
    id: 3,
    title: '久长时',
    year: '2025 - 至今',
    label: '个人产品 / PROJECT 03',
    desc: '一个围绕时间、长期记录和个人记忆表达的产品项目。重点是把抽象的时间跨度、重要节点和长期陪伴感转化成更直观、更可感知的产品体验。',
    highlights: ['梳理产品概念、核心用户场景和信息结构', '探索时间记录、节点表达和情绪化交互方式', '作为个人产品方向持续打磨视觉与功能体验'],
    poster: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=360&h=520&fit=crop&auto=format',
  },
  {
    id: 4,
    title: '家装报价工具',
    year: '2025 - 至今',
    label: '独立开发者 / TOOL PROJECT 04',
    desc: '面向家装报价场景开发的效率工具，通过扫描识别、数据整理、价格计算和报价单生成，减少重复录入与人工核算成本。',
    highlights: ['围绕真实业务流程拆解报价、材料和客户信息结构', '实现扫描识别后的数据整理与计算流程', '将复杂重复工作封装成可复用的报价生成工具'],
    poster: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=360&h=520&fit=crop&auto=format',
  },
  {
    id: 5,
    title: '中国国际大学生创新大赛',
    year: '2024.07 - 2025.07',
    label: '项目负责人、核心成员 / COMPETITION PROJECT 05',
    desc: '赛事攻坚：参与《石墨烯生产工艺创新与应用产品开发》项目，围绕技术路线、产品应用、市场价值及商业化方案开展调研、方案梳理和内容优化，并完成核心竞赛及答辩材料（PPT、视频），推动团队连续两年获奖，其中 2024 年获山东省金奖，2025 年获山东省银奖。',
    highlights: ['负责技术路线、产品应用和商业化方案梳理', '参与竞赛 PPT、视频和答辩材料优化', '推动团队获得 2024 山东省金奖、2025 山东省银奖'],
    poster: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=360&h=520&fit=crop&auto=format',
  },
  {
    id: 6,
    title: '大学生创新创业训练计划项目',
    year: '2024.10 - 2026.4',
    label: '项目负责人 / RESEARCH PROJECT 06',
    desc: '科研探索：参与《燃烧的二氧化碳甲基化硫脲氢化反应》课题研究，负责文献调研、实验测试与数据整理；在项目推进中基于课题组原有研究方向进行延伸与创新，熟悉有机合成实验流程，提升了科研思维、实验操作和问题分析能力。',
    highlights: ['负责文献调研、实验测试和阶段性数据整理', '围绕课题组方向做反应流程理解与方案延伸', '提升科研思维、实验操作和问题分析能力'],
    poster: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=360&h=520&fit=crop&auto=format',
  },
]

const skillGroups = [
  {
    id: 'development',
    title: '开发',
    label: 'DEVELOPMENT',
    metric: 'Xcode',
    desc: '熟练使用 Xcode 开发 iOS 应用，掌握 Swift 语言，曾独立完成多款 App 的设计、开发与迭代，熟悉从编码调试、上传 App Store Connect 到测试分发与版本发布的完整流程。',
    tools: ['Xcode', '移动端开发', '前后端开发', '测试上架'],
    apps: [
      { name: 'Xcode', icon: '/icons/uniform/xcode.png', fallback: 'X', color: '#147efb' },
      { name: 'App Store', icon: '/icons/uniform/appstore.png', fallback: 'A', color: '#1f9cff' },
      { name: 'Swift', icon: '/icons/uniform/swift.png', fallback: 'S', color: '#f05138' },
    ],
    color: '#ff8d30',
  },
  {
    id: 'ai',
    title: 'AI工具',
    label: 'AI TOOLCHAIN',
    metric: 'Claude Code / Codex / Cursor',
    desc: '熟悉 AI Coding 工具，从 Claude 3.5 Sonnet 阶段开始使用 Cursor 参与编程实践，持续跟进国内外编程软件与大模型能力的快速演进。日常会用 AI 辅助完成 PRD 梳理、技术架构、前端实现、后端逻辑和迭代调试。',
    tools: ['Claude Code', 'Codex', 'Cursor', '快速原型'],
    apps: [
      { name: 'Claude Code', icon: '/icons/uniform/claude-code.png', fallback: 'C', color: '#d97745' },
      { name: 'Codex', icon: '/icons/uniform/codex.png', fallback: 'Cd', color: '#101010' },
      { name: 'Cursor', icon: '/icons/uniform/cursor.png', fallback: 'Cu', color: '#2f3138' },
    ],
    color: '#f26a1b',
  },
  {
    id: 'content',
    title: '设计',
    label: 'DESIGN',
    metric: 'Figma / PS / AI / LR',
    desc: '熟练使用 Figma 完成 UI、UX 与 Logo 设计，使用 Illustrator 绘制 Logo 和矢量图形，能够用 Photoshop 完成素材处理与海报制作，并用 Lightroom 进行图片调色和后期优化。',
    tools: ['Figma', 'Photoshop', 'Illustrator', 'Lightroom', '视觉设计'],
    apps: [
      { name: 'Figma', icon: '/icons/uniform/figma.png', fallback: 'F', color: '#a259ff' },
      { name: 'Photoshop', icon: '/icons/uniform/photoshop.png', fallback: 'Ps', color: '#001e36' },
      { name: 'Illustrator', icon: '/icons/uniform/illustrator.png', fallback: 'Ai', color: '#ff9a00' },
      { name: 'Lightroom', icon: '/icons/uniform/lightroom.png', fallback: 'Lr', color: '#001e36' },
    ],
    color: '#f08a24',
  },
  {
    id: 'engineering',
    title: '建模',
    label: 'MODELING',
    metric: 'SolidWorks / AutoCAD',
    desc: '系统学习过 CAD 相关课程并以高分通过，能够使用 SolidWorks 和 AutoCAD 完成基础 2D、3D 建模、尺寸标注与工程图绘制，具备结构表达和图纸沟通能力。',
    tools: ['SolidWorks', 'AutoCAD', '尺寸整理', '图纸表达'],
    apps: [
      { name: 'SolidWorks', icon: '/icons/uniform/solidworks.png', fallback: 'SW', color: '#d71920' },
      { name: 'AutoCAD', icon: '/icons/uniform/autocad.png', fallback: 'A', color: '#df2027' },
    ],
    color: '#d8661a',
  },
  {
    id: 'office',
    title: '办公',
    label: 'OFFICE',
    metric: 'Office / Xmind',
    desc: '熟练掌握 Office 办公套件，能够高效使用 Word、PPT、Excel 完成文档、汇报和表格处理；同时熟悉 Xmind 与 Markdown，可完成思维导图绘制和结构化内容整理。',
    tools: ['Office', 'Xmind', '汇报材料', '文档整理'],
    apps: [
      { name: 'Office', icon: '/icons/uniform/office.png', fallback: 'O', color: '#d83b01' },
      { name: 'Xmind', icon: '/icons/uniform/xmind.png', fallback: 'X', color: '#0f9d58' },
    ],
    color: '#ad4c14',
  },
  {
    id: 'editing',
    title: '剪辑',
    label: 'VIDEO EDITING',
    metric: '剪映 / After Effects',
    desc: '能够使用剪映完成短视频剪辑、字幕包装、节奏卡点和基础调色，也能使用 After Effects 制作动效、转场和视觉特效，支持视频内容从素材整理到成片输出。',
    tools: ['剪映', 'After Effects', '视频剪辑', '动效包装'],
    apps: [
      { name: '剪映', icon: '/icons/uniform/jianying.png', fallback: '剪', color: '#111111' },
      { name: 'After Effects', icon: '/icons/uniform/after-effects.png', fallback: 'Ae', color: '#2d1b69' },
    ],
    color: '#b9471b',
  },
]

const skillWalls = [
  { title: '软件技能', displayTitle: '个人技能', label: 'SOFTWARE', color: hoodieOrange },
  { title: '读书感悟', displayTitle: '读书感悟', label: 'READING', color: '#d87922' },
  { title: '观点见解', displayTitle: '观点见解', label: 'THOUGHTS', color: '#c9571a' },
]

type ReadingShelfBook = {
  title: string
  label: string
  note: string
  color: string
  accent: string
  coverTexture?: string
  backTexture?: string
  spineTexture?: string
  spineTextureTrimX?: number
  spineTextureTrimY?: number
  coverEdgeColor?: string
  spineEdgeColor?: string
  spineDepthScale?: number
  coverDepthGap?: number
  detailCoverRotationY?: number
  coverSpineOverlapScale?: number
  hingeBridgeColor?: string
  pageSpineInsetRatio?: number
  pageForeInsetRatio?: number
  foreEdgeStripScale?: number
  dimensionsMm?: {
    coverWidth: number
    coverHeight: number
    spineDepth: number
  }
}

const defaultBookDimensionsMm = {
  coverWidth: 153.9,
  coverHeight: 230.9,
  spineDepth: 32,
}

const getBookMetrics = (baseDisplayHeight: number, dimensions = defaultBookDimensionsMm, spineDepthScale = 1) => {
  const height = baseDisplayHeight * (dimensions.coverHeight / defaultBookDimensionsMm.coverHeight)
  const coverWidth = height * (dimensions.coverWidth / dimensions.coverHeight)
  const depth = coverWidth * (dimensions.spineDepth / dimensions.coverWidth) * spineDepthScale

  return {
    height,
    width: coverWidth,
    depth,
    spineWidth: Math.max(coverWidth * 0.024, height * 0.012),
  }
}

const trimTexture = (texture: THREE.Texture | null, trimX = 0, trimY = 0) => {
  if (!texture || (trimX <= 0 && trimY <= 0)) return

  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.offset.set(trimX, trimY)
  texture.repeat.set(Math.max(0.04, 1 - trimX * 2), Math.max(0.04, 1 - trimY * 2))
  texture.needsUpdate = true
}

const getBookRendererPixelRatio = () => Math.min(window.devicePixelRatio || 1, 3)

const prepareBookTexture = (texture: THREE.Texture, maxAnisotropy: number) => {
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.anisotropy = Math.max(1, maxAnisotropy)
  texture.needsUpdate = true
  return texture
}

const readingShelfBooks: ReadingShelfBook[] = [
  {
    title: '埃隆·马斯克传',
    label: 'BIOGRAPHY',
    note: '把一个极端目标如何穿过技术、组织和现实压力，放在同一条时间线里看。',
    color: '#f4f6f8',
    accent: '#111827',
    coverTexture: '/assets/books/elon-musk-cover.png',
    backTexture: '/assets/books/elon-musk-back.png',
    spineTexture: '/assets/books/elon-musk-spine.png',
    spineTextureTrimX: 0.018,
    spineTextureTrimY: 0.012,
    coverEdgeColor: '#090604',
    spineEdgeColor: '#eef0ec',
    spineDepthScale: 0.68,
    coverDepthGap: -0.018,
    detailCoverRotationY: -0.24,
    coverSpineOverlapScale: 1.08,
    hingeBridgeColor: '#090604',
    pageSpineInsetRatio: 0.004,
    pageForeInsetRatio: 0.024,
    foreEdgeStripScale: 0,
    dimensionsMm: defaultBookDimensionsMm,
  },
  {
    title: '额尔古纳河右岸',
    label: 'LITERATURE',
    note: '在河流、森林和部族记忆里，看见时间怎样带走一切，也留下些什么。',
    color: '#005ba8',
    accent: '#ed1024',
    coverTexture: '/assets/books/ergun-river-cover.png',
    backTexture: '/assets/books/ergun-river-back.png',
    spineTexture: '/assets/books/ergun-river-spine.png',
    coverEdgeColor: '#005ba8',
    spineEdgeColor: '#ed1024',
    coverDepthGap: 0.002,
    detailCoverRotationY: -0.26,
    pageSpineInsetRatio: 0.006,
    pageForeInsetRatio: 0.024,
    foreEdgeStripScale: 0.65,
    dimensionsMm: { coverWidth: 150, coverHeight: 220, spineDepth: 14 },
  },
  {
    title: '瓦尔登湖',
    label: 'CLASSIC',
    note: '在湖畔独处与简朴生活里，看见人和自然重新对齐的可能。',
    color: '#0b5638',
    accent: '#b99a46',
    coverTexture: '/assets/books/walden-cover.jpeg',
    backTexture: '/assets/books/walden-back.png',
    spineTexture: '/assets/books/walden-spine.png',
    spineTextureTrimX: 0.014,
    spineTextureTrimY: 0.014,
    coverEdgeColor: '#0b3f2a',
    spineEdgeColor: '#0b4f32',
    coverDepthGap: 0.002,
    detailCoverRotationY: -0.25,
    pageSpineInsetRatio: 0.006,
    pageForeInsetRatio: 0.024,
    foreEdgeStripScale: 0.68,
    dimensionsMm: { coverWidth: 155, coverHeight: 220, spineDepth: 24 },
  },
  {
    title: '解忧杂货店',
    label: 'FICTION',
    note: '把犹疑、遗憾和温柔的回答，放进一间会连接过去与未来的旧杂货店。',
    color: '#0f5d76',
    accent: '#f0c329',
    coverTexture: '/assets/books/miracles-cover.png',
    backTexture: '/assets/books/miracles-back.png',
    spineTexture: '/assets/books/miracles-spine.png',
    spineTextureTrimX: 0.006,
    spineTextureTrimY: 0.004,
    coverEdgeColor: '#0a4055',
    spineEdgeColor: '#0a4055',
    coverDepthGap: 0.002,
    detailCoverRotationY: -0.25,
    pageSpineInsetRatio: 0.006,
    pageForeInsetRatio: 0.024,
    foreEdgeStripScale: 0.65,
    dimensionsMm: { coverWidth: 150, coverHeight: 220, spineDepth: 14 },
  },
  {
    title: '天才在左 疯子在右',
    label: 'PSYCHOLOGY',
    note: '用访谈进入那些偏离常识的精神世界，重新分辨疯狂、天才和正常的边界。',
    color: '#050505',
    accent: '#ddb75e',
    coverTexture: '/assets/books/genius-cover.png',
    backTexture: '/assets/books/genius-back.png',
    spineTexture: '/assets/books/genius-spine.png',
    spineTextureTrimX: 0.006,
    spineTextureTrimY: 0.004,
    coverEdgeColor: '#050505',
    spineEdgeColor: '#050505',
    coverDepthGap: 0.002,
    detailCoverRotationY: -0.25,
    pageSpineInsetRatio: 0.006,
    pageForeInsetRatio: 0.024,
    foreEdgeStripScale: 0.6,
    dimensionsMm: { coverWidth: 168, coverHeight: 235, spineDepth: 21 },
  },
  {
    title: '月亮与六便士',
    label: 'CLASSIC',
    note: '在体面生活和执拗创作之间，看见一个人怎样被内心的月亮牵引。',
    color: '#e4d8bd',
    accent: '#f5f0e4',
    coverTexture: '/assets/books/moon-sixpence-cover.png',
    backTexture: '/assets/books/moon-sixpence-back.png',
    spineTexture: '/assets/books/moon-sixpence-spine.png',
    spineTextureTrimX: 0.008,
    spineTextureTrimY: 0.006,
    coverEdgeColor: '#ded0b4',
    spineEdgeColor: '#ded0b4',
    coverDepthGap: 0.002,
    detailCoverRotationY: -0.25,
    pageSpineInsetRatio: 0.006,
    pageForeInsetRatio: 0.024,
    foreEdgeStripScale: 0.66,
    dimensionsMm: { coverWidth: 148, coverHeight: 210, spineDepth: 20 },
  },
  {
    title: '山茶文具店',
    label: 'FICTION',
    note: '把那些说不出口的感谢、歉意和想念，交给一封被认真写下的信。',
    color: '#f3ead8',
    accent: '#6b4a24',
    coverTexture: '/assets/books/stationery-cover.png',
    backTexture: '/assets/books/stationery-back.png',
    spineTexture: '/assets/books/stationery-spine.png',
    spineTextureTrimX: 0.006,
    spineTextureTrimY: 0.006,
    coverEdgeColor: '#efe4d2',
    spineEdgeColor: '#efe4d2',
    coverDepthGap: 0.002,
    detailCoverRotationY: -0.25,
    pageSpineInsetRatio: 0.006,
    pageForeInsetRatio: 0.024,
    foreEdgeStripScale: 0.66,
    dimensionsMm: { coverWidth: 148, coverHeight: 210, spineDepth: 20 },
  },
  {
    title: '许三观卖血记',
    label: 'FICTION',
    note: '在一次次卖血和苦难的日常里，看见一个普通人笨拙却结实的活法。',
    color: '#050505',
    accent: '#c41625',
    coverTexture: '/assets/books/xu-sanguan-cover.png',
    backTexture: '/assets/books/xu-sanguan-back.png',
    spineTexture: '/assets/books/xu-sanguan-spine.png',
    spineTextureTrimX: 0.008,
    spineTextureTrimY: 0.006,
    coverEdgeColor: '#050505',
    spineEdgeColor: '#050505',
    coverDepthGap: 0.002,
    detailCoverRotationY: -0.25,
    pageSpineInsetRatio: 0.006,
    pageForeInsetRatio: 0.024,
    foreEdgeStripScale: 0.62,
    dimensionsMm: { coverWidth: 148, coverHeight: 210, spineDepth: 20 },
  },
  {
    title: '东京奇谭集',
    label: 'STORIES',
    note: '把城市里忽然偏移的一瞬，写成介于现实和异闻之间的短篇入口。',
    color: '#f5ded4',
    accent: '#df543d',
    coverTexture: '/assets/books/tokyo-tales-cover.png',
    backTexture: '/assets/books/tokyo-tales-back.png',
    spineTexture: '/assets/books/tokyo-tales-spine.png',
    spineTextureTrimX: 0.006,
    spineTextureTrimY: 0.006,
    coverEdgeColor: '#f0d8cf',
    spineEdgeColor: '#f0d8cf',
    coverDepthGap: 0.002,
    detailCoverRotationY: -0.25,
    pageSpineInsetRatio: 0.006,
    pageForeInsetRatio: 0.024,
    foreEdgeStripScale: 0.7,
    dimensionsMm: { coverWidth: 135, coverHeight: 195, spineDepth: 9 },
  },
  {
    title: '苏东坡传',
    label: 'BIOGRAPHY',
    note: '从仕途起落、诗词书画和旷达精神里，看见一个人怎样活成文化本身。',
    color: '#f1f2ef',
    accent: '#3f8f68',
    coverTexture: '/assets/books/su-dongpo-cover.png',
    backTexture: '/assets/books/su-dongpo-back.png',
    spineTexture: '/assets/books/su-dongpo-spine.png',
    spineTextureTrimX: 0.006,
    spineTextureTrimY: 0.006,
    coverEdgeColor: '#ecefed',
    spineEdgeColor: '#ecefed',
    coverDepthGap: 0.002,
    detailCoverRotationY: -0.25,
    pageSpineInsetRatio: 0.006,
    pageForeInsetRatio: 0.024,
    foreEdgeStripScale: 0.66,
    dimensionsMm: { coverWidth: 148, coverHeight: 210, spineDepth: 22 },
  },
  {
    title: '纳瓦尔宝典',
    label: 'LEVERAGE',
    note: '把时间放到复利处，而不是消耗在反复开始。',
    color: '#ffdd8a',
    accent: '#e68127',
    dimensionsMm: { coverWidth: 145, coverHeight: 216, spineDepth: 23 },
  },
  {
    title: '设计心理学',
    label: 'DESIGN',
    note: '好体验来自对场景、反馈和心智模型的尊重。',
    color: '#ffb15e',
    accent: '#d96120',
    dimensionsMm: { coverWidth: 150, coverHeight: 228, spineDepth: 27 },
  },
  {
    title: '被讨厌的勇气',
    label: 'COURAGE',
    note: '分清自己的课题，减少被评价牵引的内耗。',
    color: '#ffd28b',
    accent: '#f08b2c',
    dimensionsMm: { coverWidth: 140, coverHeight: 210, spineDepth: 20 },
  },
  {
    title: '刻意练习',
    label: 'PRACTICE',
    note: '成长需要目标、反馈和重复修正，而不是重复消耗。',
    color: '#ff9852',
    accent: '#c9571a',
    dimensionsMm: { coverWidth: 152, coverHeight: 225, spineDepth: 25 },
  },
  {
    title: '置身事内',
    label: 'REALITY',
    note: '把宏观判断落到真实系统、约束和行动。',
    color: '#f6b65a',
    accent: '#b9471b',
    dimensionsMm: { coverWidth: 148, coverHeight: 218, spineDepth: 31 },
  },
  {
    title: '黑客与画家',
    label: 'MAKING',
    note: '创作不是等待灵感，而是持续把想法做成作品。',
    color: '#ffca7a',
    accent: '#d8661a',
    dimensionsMm: { coverWidth: 155, coverHeight: 230, spineDepth: 26 },
  },
  {
    title: '有限与无限的游戏',
    label: 'PLAY',
    note: '把输赢之外的长期参与感，变成更稳定的动力。',
    color: '#ffab65',
    accent: '#ad4c14',
    dimensionsMm: { coverWidth: 135, coverHeight: 205, spineDepth: 22 },
  },
  {
    title: '人类简史',
    label: 'STORIES',
    note: '叙事塑造协作，也塑造我们理解世界的方式。',
    color: '#f9d48a',
    accent: '#c15a19',
    dimensionsMm: { coverWidth: 160, coverHeight: 240, spineDepth: 34 },
  },
  {
    title: '金字塔原理',
    label: 'STRUCTURE',
    note: '先搭结构，再填内容，表达才会更有抓手。',
    color: '#ffbc6f',
    accent: '#e37021',
    dimensionsMm: { coverWidth: 148, coverHeight: 210, spineDepth: 18 },
  },
]

const insightNotes = [
  { title: '产品', note: '产品判断先于功能堆叠，先回答为什么存在。', rotation: -5 },
  { title: 'AI', note: 'AI 是原型速度的放大器，关键仍是提出好问题。', rotation: 4 },
  { title: '学习', note: '学习要落到作品、验证和复盘，才会真正留下来。', rotation: -2 },
  { title: '工具', note: '好工具应该降低下一次行动成本，而不是增加流程。', rotation: 5 },
  { title: '长期', note: '长期记录会把灵感变成资产，也能校准判断。', rotation: -4 },
]

const insightNoteSlots = [
  { left: 12, top: 34 },
  { left: 150, top: 8 },
  { left: 288, top: 52 },
  { left: 68, top: 200 },
  { left: 238, top: 188 },
]

const appSpreadSlots = [
  { left: 18, top: 22, rotation: -13 },
  { left: 124, top: 2, rotation: 4 },
  { left: 230, top: 22, rotation: 13 },
]

const appSpreadSlotsFour = [
  { left: 4, top: 34, rotation: -10 },
  { left: 84, top: 8, rotation: -4 },
  { left: 164, top: 8, rotation: 4 },
  { left: 244, top: 34, rotation: 10 },
]

const appIconSize = 56
const skillIconCollapseMs = 300
const skillIconExpandDelayMs = 35
const skillPageAutoExpandDelayMs = 180
const skillWallTransitionMs = 560
function LiquidFolderIcon({ active, label }: { active: boolean; accent: string; label: string }) {
  return (
    <span style={{ display: 'block', width: 92 }}>
      <span
        style={{
          position: 'relative',
          display: 'block',
          width: 92,
          height: 76,
        }}
      >
        <img
          src={liquidFolderAsset}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            left: -10,
            top: -17,
            width: 112,
            height: 112,
            objectFit: 'contain',
            opacity: active ? 1 : 0.74,
            transform: active ? 'translate3d(0, -2px, 0) scale(1.04)' : 'translate3d(0, 0, 0) scale(0.98)',
            transition: 'opacity 0.22s ease, transform 0.24s ease, filter 0.24s ease',
            filter: active
              ? 'saturate(1.12) contrast(1.05) drop-shadow(0 14px 18px rgba(92,37,6,0.22))'
              : 'saturate(0.96) contrast(0.98) drop-shadow(0 9px 12px rgba(92,37,6,0.12))',
            pointerEvents: 'none',
          }}
        />
      </span>
      <span
        style={{
          display: 'block',
          marginTop: 6,
          color: 'white',
          fontSize: 13,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: 0.5,
          textAlign: 'center',
          textShadow: '0 2px 8px rgba(82,31,4,0.34)',
        }}
      >
        {label}
      </span>
    </span>
  )
}

function LargeLiquidFolder({ accent, title }: { accent: string; title: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '8px 0 0',
          borderRadius: 34,
          background: `radial-gradient(ellipse at 52% 72%, ${accent}22 0%, rgba(255,255,255,0) 66%)`,
          filter: 'blur(18px)',
          opacity: 0.76,
        }}
      />
      <img
        src={liquidFolderAsset}
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          left: -26,
          top: -28,
          width: 300,
          height: 240,
          objectFit: 'contain',
          filter: 'saturate(1.12) contrast(1.04) drop-shadow(0 24px 34px rgba(82,31,4,0.2))',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 12,
          right: 18,
          top: 104,
          fontFamily: "'Oswald', sans-serif",
          fontSize: 42,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.94)',
          lineHeight: 1,
          textAlign: 'center',
          textShadow: '0 8px 22px rgba(92,37,6,0.2)',
        }}
      >
        {title}
      </div>
    </div>
  )
}

function ImmersiveBookDetail({
  book,
  selectedIndex,
  onClose,
}: {
  book: (typeof readingShelfBooks)[number]
  selectedIndex: number
  onClose: () => void
}) {
  const canvasHostRef = useRef<HTMLDivElement | null>(null)
  const [copyVisible, setCopyVisible] = useState(false)
  const [backdropVisible, setBackdropVisible] = useState(false)

  useEffect(() => {
    setCopyVisible(false)
    setBackdropVisible(false)
    const frame = window.requestAnimationFrame(() => setBackdropVisible(true))
    const timer = window.setTimeout(() => setCopyVisible(true), 1680)
    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [book])

  useEffect(() => {
    const host = canvasHostRef.current
    if (!host) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
    camera.position.set(0, 0.08, 7.35)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    })
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.88
    renderer.setClearColor(0x000000, 0)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.cursor = 'grab'
    renderer.domElement.style.touchAction = 'none'
    host.appendChild(renderer.domElement)

    const textures: THREE.Texture[] = []
    const materials: THREE.Material[] = []
    const geometries: THREE.BufferGeometry[] = []
    const makeMaterial = (material: THREE.Material) => {
      materials.push(material)
      return material
    }
    const makeGeometry = (geometry: THREE.BufferGeometry) => {
      geometries.push(geometry)
      return geometry
    }
    const textureLoader = new THREE.TextureLoader()
    const maxBookTextureAnisotropy = renderer.capabilities.getMaxAnisotropy()
    const loadTexture = (url?: string) => {
      if (!url) return null

      const texture = textureLoader.load(url)
      prepareBookTexture(texture, maxBookTextureAnisotropy)
      textures.push(texture)
      return texture
    }

    const makeBookTexture = (kind: 'cover' | 'spine') => {
      const canvas = document.createElement('canvas')
      canvas.width = kind === 'cover' ? 1200 : 320
      canvas.height = 1800
      const ctx = canvas.getContext('2d')
      if (!ctx) return null

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, book.color)
      gradient.addColorStop(0.62, book.accent)
      gradient.addColorStop(1, '#4f1606')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = 'rgba(255,255,255,0.14)'
      ctx.fillRect(0, 0, canvas.width, 24)
      ctx.fillStyle = 'rgba(62,21,4,0.28)'
      ctx.fillRect(kind === 'cover' ? 0 : canvas.width - 42, 0, kind === 'cover' ? 104 : 42, canvas.height)

      ctx.fillStyle = 'rgba(255,255,255,0.92)'
      ctx.textBaseline = 'top'
      if (kind === 'cover') {
        ctx.font = '800 34px Arial, sans-serif'
        ctx.fillStyle = 'rgba(255,255,255,0.7)'
        ctx.fillText(book.label, 132, 86)
        ctx.font = '800 78px Arial, sans-serif'
        ctx.fillStyle = 'rgba(255,255,255,0.93)'
        const titleChars = [...book.title]
        titleChars.forEach((char, index) => {
          ctx.fillText(char, 132 + (index % 4) * 82, 148 + Math.floor(index / 4) * 92)
        })
        ctx.font = '700 30px Arial, sans-serif'
        ctx.fillStyle = 'rgba(255,255,255,0.82)'
        const words = book.note.split('')
        let line = ''
        let y = 760
        words.forEach((char) => {
          const nextLine = line + char
          if (ctx.measureText(nextLine).width > 430) {
            ctx.fillText(line, 132, y)
            line = char
            y += 44
            return
          }
          line = nextLine
        })
        if (line) ctx.fillText(line, 132, y)
      } else {
        ctx.save()
        ctx.translate(canvas.width / 2 + 24, canvas.height / 2)
        ctx.rotate(Math.PI / 2)
        ctx.font = '800 46px Arial, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(book.title, 0, -26)
        ctx.restore()
      }

      const texture = new THREE.CanvasTexture(canvas)
      prepareBookTexture(texture, maxBookTextureAnisotropy)
      textures.push(texture)
      return texture
    }

    const displayGroup = new THREE.Group()
    scene.add(displayGroup)

    const bookMetrics = getBookMetrics(3.15, book.dimensionsMm, book.spineDepthScale)
    const bookHeight = bookMetrics.height
    const bookWidth = bookMetrics.width
    const bookDepth = bookMetrics.depth
    const spineWidth = bookMetrics.spineWidth
    const coverLeafWidth = bookWidth
    const coverSpineOverlap = spineWidth * (book.coverSpineOverlapScale ?? 0)
    const coverPanelWidth = coverLeafWidth + coverSpineOverlap
    const coverPanelCenterX = (coverLeafWidth - coverSpineOverlap) / 2
    const coverHingeX = 0
    const frontCoverThickness = 0.052
    const backCoverThickness = 0.046
    const coverDepthGap = book.coverDepthGap ?? 0.04
    const detailCoverRotationY = book.detailCoverRotationY ?? -0.34
    const pageSpineInset = bookWidth * (book.pageSpineInsetRatio ?? 0.024)
    const pageForeInset = bookWidth * (book.pageForeInsetRatio ?? 0.024)
    const pageBlockWidth = bookWidth - pageSpineInset - pageForeInset
    const pageBlockCenterX = pageSpineInset + pageBlockWidth / 2
    const spineOuterDepth = bookDepth + Math.max(frontCoverThickness, backCoverThickness) + coverDepthGap * 2
    const coverTexture = loadTexture(book.coverTexture) ?? makeBookTexture('cover')
    const backTexture = loadTexture(book.backTexture)
    const spineTexture = loadTexture(book.spineTexture) ?? makeBookTexture('spine')
    trimTexture(spineTexture, book.spineTextureTrimX, book.spineTextureTrimY)

    const paperMaterial = makeMaterial(
      new THREE.MeshStandardMaterial({
        color: 0xf2dcc0,
        roughness: 0.96,
        metalness: 0,
      }),
    )
    const pageEdgeMaterial = makeMaterial(
      new THREE.MeshStandardMaterial({
        color: 0xe7c99a,
        roughness: 0.98,
        metalness: 0,
      }),
    )
    const coverEdgeMaterial = makeMaterial(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(book.coverEdgeColor ?? book.accent),
        roughness: 0.72,
        metalness: 0.01,
      }),
    )
    const coverSpineSideMaterial =
      coverSpineOverlap > 0.001
        ? makeMaterial(
            new THREE.MeshBasicMaterial({
              transparent: true,
              opacity: 0,
              depthWrite: false,
            }),
          )
        : coverEdgeMaterial
    const spineEdgeMaterial = makeMaterial(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(book.spineEdgeColor ?? book.accent),
        roughness: 0.72,
        metalness: 0.01,
      }),
    )
    const coverMaterial = makeMaterial(
      new THREE.MeshStandardMaterial({
        map: coverTexture ?? undefined,
        color: 0xffffff,
        roughness: 0.58,
        metalness: 0.02,
        envMapIntensity: 0.2,
      }),
    )
    const backCoverMaterial = makeMaterial(
      new THREE.MeshStandardMaterial({
        map: backTexture ?? undefined,
        color: backTexture ? 0xffffff : new THREE.Color(book.accent),
        roughness: 0.62,
        metalness: 0.02,
      }),
    )
    const spineMaterial = makeMaterial(
      new THREE.MeshStandardMaterial({
        map: spineTexture ?? undefined,
        color: 0xffffff,
        roughness: 0.55,
        metalness: 0.02,
      }),
    )
    const hingeBridgeMaterial = book.hingeBridgeColor
      ? makeMaterial(
          new THREE.MeshBasicMaterial({
            color: new THREE.Color(book.hingeBridgeColor),
            side: THREE.DoubleSide,
            polygonOffset: true,
            polygonOffsetFactor: -1,
            polygonOffsetUnits: -1,
          }),
        )
      : null

    const pivot = new THREE.Group()
    pivot.position.set(-bookWidth / 2, 0, 0)
    displayGroup.add(pivot)

    const pages = new THREE.Mesh(makeGeometry(new THREE.BoxGeometry(pageBlockWidth, bookHeight - 0.14, bookDepth * 1.03)), paperMaterial)
    pages.position.set(pageBlockCenterX, 0, 0)
    pages.castShadow = true
    pages.receiveShadow = true
    pivot.add(pages)

    const frontCoverHinge = new THREE.Group()
    frontCoverHinge.position.set(coverHingeX, 0, bookDepth / 2 + frontCoverThickness / 2 + coverDepthGap)
    frontCoverHinge.rotation.y = detailCoverRotationY
    pivot.add(frontCoverHinge)

    const frontCover = new THREE.Mesh(makeGeometry(new THREE.BoxGeometry(coverPanelWidth, bookHeight, frontCoverThickness)), [
      coverEdgeMaterial,
      coverSpineSideMaterial,
      coverEdgeMaterial,
      coverEdgeMaterial,
      coverMaterial,
      coverEdgeMaterial,
    ])
    frontCover.position.set(coverPanelCenterX, 0, 0)
    frontCover.castShadow = true
    frontCover.receiveShadow = true
    frontCoverHinge.add(frontCover)

    let updateHingeBridge = (_rotationY: number) => {}
    if (hingeBridgeMaterial) {
      const hingeBridgeGeometry = makeGeometry(new THREE.BufferGeometry())
      const hingeBridgeVertices = new Float32Array(12)
      const hingeBridgePosition = new THREE.BufferAttribute(hingeBridgeVertices, 3)
      hingeBridgeGeometry.setAttribute('position', hingeBridgePosition)
      hingeBridgeGeometry.setIndex([0, 1, 2, 0, 2, 3])

      const hingeBridge = new THREE.Mesh(hingeBridgeGeometry, hingeBridgeMaterial)
      hingeBridge.frustumCulled = false
      hingeBridge.renderOrder = 4
      pivot.add(hingeBridge)

      updateHingeBridge = (rotationY: number) => {
        const spineX = coverHingeX - spineWidth * 0.08
        const spineZ = bookDepth / 2 + 0.006
        const coverFaceZ = frontCoverThickness / 2 + 0.006
        const coverX = coverHingeX + coverFaceZ * Math.sin(rotationY)
        const coverZ = frontCoverHinge.position.z + coverFaceZ * Math.cos(rotationY)
        const topY = bookHeight / 2 - 0.012
        const bottomY = -bookHeight / 2 + 0.012

        hingeBridgeVertices.set([spineX, bottomY, spineZ, coverX, bottomY, coverZ, coverX, topY, coverZ, spineX, topY, spineZ])
        hingeBridgePosition.needsUpdate = true
      }
      updateHingeBridge(frontCoverHinge.rotation.y)
    }

    const backCover = new THREE.Mesh(makeGeometry(new THREE.BoxGeometry(coverPanelWidth, bookHeight, backCoverThickness)), [
      coverEdgeMaterial,
      coverSpineSideMaterial,
      coverEdgeMaterial,
      coverEdgeMaterial,
      coverEdgeMaterial,
      backCoverMaterial,
    ])
    backCover.position.set(coverPanelCenterX, 0, -bookDepth / 2 - backCoverThickness / 2 - coverDepthGap)
    backCover.castShadow = true
    pivot.add(backCover)

    const spine = new THREE.Mesh(makeGeometry(new THREE.BoxGeometry(spineWidth, bookHeight, spineOuterDepth)), [
      spineEdgeMaterial,
      spineMaterial,
      spineEdgeMaterial,
      spineEdgeMaterial,
      spineEdgeMaterial,
      spineEdgeMaterial,
    ])
    spine.position.set(-spineWidth / 2, 0, 0)
    spine.castShadow = true
    spine.receiveShadow = true
    pivot.add(spine)

    const foreEdgeStripScale = book.foreEdgeStripScale ?? 1
    const foreEdgeWidth = 0.11 * foreEdgeStripScale
    if (foreEdgeWidth > 0.001) {
      const edge = new THREE.Mesh(makeGeometry(new THREE.BoxGeometry(foreEdgeWidth, bookHeight - 0.22, bookDepth * 0.94)), pageEdgeMaterial)
      edge.position.set(bookWidth - pageForeInset + foreEdgeWidth / 2, 0, 0)
      edge.castShadow = true
      pivot.add(edge)
    }

    const topPages = new THREE.Mesh(makeGeometry(new THREE.BoxGeometry(Math.max(0.1, pageBlockWidth - 0.06), 0.055, bookDepth * 0.94)), pageEdgeMaterial)
    topPages.position.set(pageBlockCenterX, bookHeight / 2 - 0.078, 0)
    pivot.add(topPages)

    const bottomPages = new THREE.Mesh(makeGeometry(new THREE.BoxGeometry(Math.max(0.1, pageBlockWidth - 0.06), 0.055, bookDepth * 0.94)), pageEdgeMaterial)
    bottomPages.position.set(pageBlockCenterX, -bookHeight / 2 + 0.078, 0)
    pivot.add(bottomPages)

    const contactShadow = new THREE.Mesh(
      makeGeometry(new THREE.PlaneGeometry(2.8, 0.62)),
      makeMaterial(
        new THREE.MeshBasicMaterial({
          color: 0x230904,
          transparent: true,
          opacity: 0.18,
          depthWrite: false,
        }),
      ),
    )
    contactShadow.position.set(-0.04, -1.76, -0.14)
    contactShadow.rotation.x = -Math.PI / 2.45
    displayGroup.add(contactShadow)

    scene.add(new THREE.HemisphereLight(0xffffff, 0x1f0c36, 0.76))

    const keyLight = new THREE.DirectionalLight(0xfff1d7, 1.8)
    keyLight.position.set(3.6, 4.2, 5.4)
    keyLight.castShadow = true
    keyLight.shadow.bias = -0.00008
    keyLight.shadow.normalBias = 0.04
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0x7b5cff, 0.74)
    fillLight.position.set(-4.2, 1.8, 3.1)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.78)
    rimLight.position.set(-2.8, 2.4, -3.6)
    scene.add(rimLight)

    let frameId = 0
    let disposed = false
    let dragging = false
    let startX = 0
    let startY = 0
    let startYaw = 0
    let startPitch = 0
    let targetYaw = -0.2
    let targetPitch = -0.04
    let currentYaw = -0.72
    let currentPitch = -0.04
    const introStart = performance.now()
    const introDuration = 1280
    const introStartX = THREE.MathUtils.clamp(-1.72 + selectedIndex * 0.2, -1.72, -0.62)
    let introComplete = false

    const easeOutCubic = (progress: number) => 1 - Math.pow(1 - progress, 3)

    const handlePointerDown = (event: globalThis.PointerEvent) => {
      if (!introComplete) return
      event.preventDefault()
      dragging = true
      startX = event.clientX
      startY = event.clientY
      startYaw = targetYaw
      startPitch = targetPitch
      renderer.domElement.style.cursor = 'grabbing'
      try {
        host.setPointerCapture?.(event.pointerId)
      } catch {
        // Some scripted pointer events do not register with browser pointer capture.
      }
    }

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      if (!dragging) return
      event.preventDefault()
      targetYaw = THREE.MathUtils.clamp(startYaw + (event.clientX - startX) * 0.008, -Math.PI * 1.18, Math.PI * 1.18)
      targetPitch = THREE.MathUtils.clamp(startPitch + (event.clientY - startY) * 0.003, -0.32, 0.28)
    }

    const stopDragging = (event: globalThis.PointerEvent) => {
      if (!dragging) return
      dragging = false
      renderer.domElement.style.cursor = 'grab'
      try {
        host.releasePointerCapture?.(event.pointerId)
      } catch {
        // Matching the guarded pointer capture above.
      }
    }

    const resize = () => {
      const rect = host.getBoundingClientRect()
      const width = Math.max(1, Math.floor(rect.width))
      const height = Math.max(1, Math.floor(rect.height))
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setPixelRatio(getBookRendererPixelRatio())
      renderer.setSize(width, height, false)
    }

    const settle = (current: number, target: number, factor: number) => {
      const next = current + (target - current) * factor
      return Math.abs(next - target) < 0.0008 ? target : next
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    resize()

    host.addEventListener('pointerdown', handlePointerDown)
    host.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', stopDragging)
    window.addEventListener('pointercancel', stopDragging)

    const animate = () => {
      frameId = window.requestAnimationFrame(animate)
      if (disposed) return

      const elapsed = performance.now() - introStart
      const introProgress = THREE.MathUtils.clamp(elapsed / introDuration, 0, 1)
      currentYaw = settle(currentYaw, targetYaw, 0.13)
      currentPitch = settle(currentPitch, targetPitch, 0.13)

      if (introProgress < 1) {
        const introEase = easeOutCubic(introProgress)
        displayGroup.position.x = THREE.MathUtils.lerp(introStartX, 0.05, introEase)
        displayGroup.position.y = THREE.MathUtils.lerp(-0.68, 0.02, introEase)
        displayGroup.rotation.x = THREE.MathUtils.lerp(-0.02, currentPitch, introEase)
        displayGroup.rotation.y = THREE.MathUtils.lerp(0.32, currentYaw, introEase)
        displayGroup.rotation.z = THREE.MathUtils.lerp(0.04, 0, introEase)
        displayGroup.scale.setScalar(THREE.MathUtils.lerp(0.44, 0.84, introEase))
      } else {
        introComplete = true
        displayGroup.position.x = 0.05
        displayGroup.position.y = 0.02
        displayGroup.rotation.x = currentPitch
        displayGroup.rotation.y = currentYaw
        displayGroup.rotation.z = 0
        displayGroup.scale.setScalar(0.84)
        frontCoverHinge.rotation.y = settle(frontCoverHinge.rotation.y, detailCoverRotationY, 0.12)
      }

      updateHingeBridge(frontCoverHinge.rotation.y)
      renderer.render(scene, camera)
    }

    animate()

    return () => {
      disposed = true
      window.cancelAnimationFrame(frameId)
      host.removeEventListener('pointerdown', handlePointerDown)
      host.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', stopDragging)
      window.removeEventListener('pointercancel', stopDragging)
      resizeObserver.disconnect()
      textures.forEach((texture) => texture.dispose())
      materials.forEach((material) => material.dispose())
      geometries.forEach((geometry) => geometry.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [book, selectedIndex])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      data-allow-scroll="true"
      onWheel={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        overflow: 'hidden',
        backgroundColor: backdropVisible ? book.accent : 'rgba(0,0,0,0)',
        transition: 'background-color 920ms cubic-bezier(0.22, 1, 0.36, 1)',
        color: 'white',
      }}
    >
      <button
        type="button"
        aria-label="关闭书籍详情"
        onClick={onClose}
        style={{
          position: 'absolute',
          right: 28,
          top: 24,
          zIndex: 6,
          width: 44,
          height: 44,
          borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.32)',
          background: 'rgba(20,12,8,0.26)',
          color: 'rgba(255,255,255,0.92)',
          fontSize: 30,
          lineHeight: '40px',
          cursor: 'pointer',
          backdropFilter: 'blur(14px)',
        }}
      >
        ×
      </button>

      <div
        ref={canvasHostRef}
        aria-label={`${book.title} 3D 书籍`}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '56%',
          zIndex: 3,
          touchAction: 'none',
        }}
      />

      <section
        style={{
          position: 'absolute',
          right: '8.5%',
          top: '30%',
          width: '34%',
          maxWidth: 520,
          zIndex: 4,
          textShadow: '0 10px 28px rgba(22,10,8,0.18)',
          opacity: copyVisible ? 1 : 0,
          transform: copyVisible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 420ms ease, transform 420ms ease',
          pointerEvents: copyVisible ? 'auto' : 'none',
        }}
      >
        <div style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>
          READING NOTE
        </div>
        <h3
          style={{
            margin: 0,
            fontFamily: "'Oswald', sans-serif",
            fontSize: 'clamp(40px, 5vw, 74px)',
            lineHeight: 0.95,
            fontWeight: 700,
            letterSpacing: 0,
          }}
        >
          {book.title}
        </h3>
        <p style={{ margin: '24px 0 0', fontSize: 15, lineHeight: 1.86, fontWeight: 800, color: 'rgba(255,255,255,0.9)' }}>
          {book.note}
        </p>
        <p style={{ margin: '24px 0 0', fontSize: 13, lineHeight: 1.82, fontWeight: 650, color: 'rgba(255,255,255,0.68)' }}>
          把读到的概念放回真实场景里，留下可被再次验证的判断。
        </p>
      </section>
    </div>,
    document.body,
  )
}

function ReadingBookDetailOverlay({ book, onClose }: { book: (typeof readingShelfBooks)[number]; onClose: () => void }) {
  const [copyVisible, setCopyVisible] = useState(false)
  const [backdropVisible, setBackdropVisible] = useState(false)

  useEffect(() => {
    setCopyVisible(false)
    setBackdropVisible(false)
    const frame = window.requestAnimationFrame(() => setBackdropVisible(true))
    const timer = window.setTimeout(() => setCopyVisible(true), 1460)
    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [book])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <>
      <div
        data-allow-scroll="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9996,
          backgroundColor: backdropVisible ? book.accent : 'rgba(0,0,0,0)',
          transition: 'background-color 1120ms cubic-bezier(0.22, 1, 0.36, 1)',
          pointerEvents: 'none',
        }}
      />
      <div
        data-allow-scroll="true"
        onWheel={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <button
          type="button"
          aria-label="关闭书籍详情"
          onClick={onClose}
          style={{
            position: 'absolute',
            right: 28,
            top: 24,
            zIndex: 2,
            width: 44,
            height: 44,
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.32)',
            background: 'rgba(20,12,8,0.26)',
            color: 'rgba(255,255,255,0.92)',
            fontSize: 30,
            lineHeight: '40px',
            cursor: 'pointer',
            backdropFilter: 'blur(14px)',
            pointerEvents: 'auto',
          }}
        >
          ×
        </button>

        <section
          style={{
            position: 'absolute',
            right: '8.5%',
            top: '30%',
            width: '34%',
            maxWidth: 520,
            zIndex: 1,
            color: 'white',
            textShadow: '0 10px 28px rgba(22,10,8,0.18)',
            opacity: copyVisible ? 1 : 0,
            transform: copyVisible ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 420ms ease, transform 420ms ease',
            pointerEvents: copyVisible ? 'auto' : 'none',
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>
            READING NOTE
          </div>
          <h3
            style={{
              margin: 0,
              fontFamily: "'Oswald', sans-serif",
              fontSize: 'clamp(40px, 5vw, 74px)',
              lineHeight: 0.95,
              fontWeight: 700,
              letterSpacing: 0,
            }}
          >
            {book.title}
          </h3>
          <p style={{ margin: '24px 0 0', fontSize: 15, lineHeight: 1.86, fontWeight: 800, color: 'rgba(255,255,255,0.9)' }}>
            {book.note}
          </p>
          <p style={{ margin: '24px 0 0', fontSize: 13, lineHeight: 1.82, fontWeight: 650, color: 'rgba(255,255,255,0.68)' }}>
            把读到的概念放回真实场景里，留下可被再次验证的判断。
          </p>
        </section>
      </div>
    </>,
    document.body,
  )
}

function ReadingShelf3D({ active, books }: { active: boolean; books: typeof readingShelfBooks }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const activeRef = useRef(active)
  const closeDetailSceneRef = useRef<(() => void) | null>(null)
  const [selectedBookIndex, setSelectedBookIndex] = useState<number | null>(null)

  const selectedBook = selectedBookIndex === null ? null : books[selectedBookIndex]

  useEffect(() => {
    activeRef.current = active
  }, [active])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 100)
    camera.position.set(0, 0.14, 5)
    camera.lookAt(0, -0.16, 0)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    })
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.86
    renderer.setClearColor(0x000000, 0)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.inset = '0'
    renderer.domElement.style.zIndex = '2'
    renderer.domElement.style.cursor = 'grab'
    renderer.domElement.style.touchAction = 'none'
    container.appendChild(renderer.domElement)

    const baseShelfBookHeight = getBookMetrics(2.26).height
    const closedSpacing = 0.72
    const openRightSpace = 1.56
    const openLeftSpace = 0.82
    const baseStart = -2.92
    const shelfDepth = 0.44
    const closedBookRotation = Math.PI / 2
    const hoverBookRotation = 0
    const maxScroll = Math.max(0, books.length * closedSpacing - 3.08)

    const textures: THREE.Texture[] = []
    const materials: THREE.Material[] = []
    const geometries: THREE.BufferGeometry[] = []
    const interactiveMeshes: THREE.Object3D[] = []
    const shelfGroup = new THREE.Group()
    shelfGroup.position.z = shelfDepth
    scene.add(shelfGroup)
    const textureLoader = new THREE.TextureLoader()
    const maxBookTextureAnisotropy = renderer.capabilities.getMaxAnisotropy()
    const loadTexture = (url?: string) => {
      if (!url) return null

      const texture = textureLoader.load(url)
      prepareBookTexture(texture, maxBookTextureAnisotropy)
      textures.push(texture)
      return texture
    }

    const makeLabelTexture = (book: (typeof readingShelfBooks)[number], kind: 'cover' | 'spine') => {
      const canvas = document.createElement('canvas')
      canvas.width = kind === 'cover' ? 1024 : 320
      canvas.height = 1536
      const ctx = canvas.getContext('2d')
      if (!ctx) return null

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, book.color)
      gradient.addColorStop(0.68, book.accent)
      gradient.addColorStop(1, '#74320e')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.fillRect(0, 0, canvas.width, 18)
      ctx.fillStyle = 'rgba(77,30,5,0.22)'
      ctx.fillRect(kind === 'cover' ? 0 : canvas.width - 34, 0, kind === 'cover' ? 78 : 34, canvas.height)

      ctx.fillStyle = 'rgba(255,255,255,0.92)'
      ctx.textBaseline = 'top'
      if (kind === 'cover') {
        ctx.font = '700 64px Arial, sans-serif'
        const titleChars = [...book.title]
        titleChars.forEach((char, index) => {
          ctx.fillText(char, 110 + (index % 4) * 68, 96 + Math.floor(index / 4) * 78)
        })
        ctx.font = '700 28px Arial, sans-serif'
        ctx.fillStyle = 'rgba(255,255,255,0.72)'
        ctx.fillText(book.label, 112, 54)
        ctx.font = '600 25px Arial, sans-serif'
        ctx.fillStyle = 'rgba(255,255,255,0.82)'
        const words = book.note.split('')
        let line = ''
        let y = 566
        words.forEach((char) => {
          const nextLine = line + char
          if (ctx.measureText(nextLine).width > 330) {
            ctx.fillText(line, 112, y)
            line = char
            y += 38
            return
          }
          line = nextLine
        })
        if (line) ctx.fillText(line, 112, y)
      } else {
        ctx.save()
        ctx.translate(canvas.width / 2 + 18, canvas.height / 2)
        ctx.rotate(Math.PI / 2)
        ctx.font = '800 42px Arial, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(book.title, 0, -24)
        ctx.restore()
      }

      const texture = new THREE.CanvasTexture(canvas)
      prepareBookTexture(texture, maxBookTextureAnisotropy)
      textures.push(texture)
      return texture
    }

    const makeMaterial = (material: THREE.Material) => {
      materials.push(material)
      return material
    }

    const makeGeometry = (geometry: THREE.BufferGeometry) => {
      geometries.push(geometry)
      return geometry
    }

    const paperMaterial = makeMaterial(
      new THREE.MeshStandardMaterial({
        color: 0xffecd0,
        roughness: 0.92,
        metalness: 0.02,
      }),
    )
    const pageEdgeMaterial = makeMaterial(
      new THREE.MeshStandardMaterial({
        color: 0xf4d7a5,
        roughness: 0.98,
        metalness: 0,
      }),
    )
    const bookEntries = books.map((book, index) => {
      const shelfBookMetrics = getBookMetrics(2.26, book.dimensionsMm, book.spineDepthScale)
      const bookHeight = shelfBookMetrics.height
      const bookWidth = shelfBookMetrics.width
      const bookDepth = shelfBookMetrics.depth
      const spineWidth = shelfBookMetrics.spineWidth
      const coverLeafWidth = bookWidth
      const coverSpineOverlap = spineWidth * (book.coverSpineOverlapScale ?? 0)
      const coverPanelWidth = coverLeafWidth + coverSpineOverlap
      const coverPanelCenterX = (coverLeafWidth - coverSpineOverlap) / 2
      const coverHingeX = 0
      const frontCoverThickness = 0.045
      const backCoverThickness = 0.04
      const coverDepthGap = book.coverDepthGap ?? 0.028
      const pageSpineInset = bookWidth * (book.pageSpineInsetRatio ?? 0.024)
      const pageForeInset = bookWidth * (book.pageForeInsetRatio ?? 0.024)
      const pageBlockWidth = bookWidth - pageSpineInset - pageForeInset
      const pageBlockCenterX = pageSpineInset + pageBlockWidth / 2
      const spineOuterDepth = bookDepth + Math.max(frontCoverThickness, backCoverThickness) + coverDepthGap * 2
      const pivotBaseY = -0.04 + (bookHeight - baseShelfBookHeight) / 2
      const pivot = new THREE.Group()
      pivot.position.set(baseStart + index * closedSpacing, pivotBaseY, 0)
      pivot.rotation.y = closedBookRotation
      pivot.userData.targetX = pivot.position.x
      pivot.userData.baseY = pivotBaseY
      pivot.userData.targetY = pivotBaseY
      pivot.userData.targetRotationY = pivot.rotation.y
      shelfGroup.add(pivot)

      const coverTexture = loadTexture(book.coverTexture) ?? makeLabelTexture(book, 'cover')
      const backTexture = loadTexture(book.backTexture)
      const spineTexture = loadTexture(book.spineTexture) ?? makeLabelTexture(book, 'spine')
      trimTexture(spineTexture, book.spineTextureTrimX, book.spineTextureTrimY)
      const coverMaterial = makeMaterial(
        new THREE.MeshStandardMaterial({
          map: coverTexture ?? undefined,
          color: coverTexture ? 0xffffff : new THREE.Color(book.color),
          roughness: 0.56,
          metalness: 0.02,
          envMapIntensity: 0.22,
        }),
      )
      const backCoverMaterial = makeMaterial(
        new THREE.MeshStandardMaterial({
          map: backTexture ?? undefined,
          color: backTexture ? 0xffffff : new THREE.Color(book.accent),
          roughness: 0.62,
          metalness: 0.02,
        }),
      )
      const spineMaterial = makeMaterial(
        new THREE.MeshStandardMaterial({
          map: spineTexture ?? undefined,
          color: spineTexture ? 0xffffff : new THREE.Color(book.accent),
          roughness: 0.54,
          metalness: 0.02,
          envMapIntensity: 0.18,
        }),
      )
      const coverEdgeMaterial = makeMaterial(
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(book.coverEdgeColor ?? book.accent),
          roughness: 0.72,
          metalness: 0.01,
        }),
      )
      const coverSpineSideMaterial =
        coverSpineOverlap > 0.001
          ? makeMaterial(
              new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: 0,
                depthWrite: false,
              }),
            )
          : coverEdgeMaterial
      const spineEdgeMaterial = makeMaterial(
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(book.spineEdgeColor ?? book.accent),
          roughness: 0.72,
          metalness: 0.01,
        }),
      )
      const hingeBridgeMaterial = book.hingeBridgeColor
        ? makeMaterial(
            new THREE.MeshBasicMaterial({
              color: new THREE.Color(book.hingeBridgeColor),
              side: THREE.DoubleSide,
              polygonOffset: true,
              polygonOffsetFactor: -1,
              polygonOffsetUnits: -1,
            }),
          )
        : null

      const pages = new THREE.Mesh(makeGeometry(new THREE.BoxGeometry(pageBlockWidth, bookHeight - 0.12, bookDepth * 1.02)), paperMaterial)
      pages.position.set(pageBlockCenterX, 0, 0)
      pages.castShadow = true
      pages.receiveShadow = true
      pivot.add(pages)

      const frontCoverHinge = new THREE.Group()
      frontCoverHinge.position.set(coverHingeX, 0, bookDepth / 2 + frontCoverThickness / 2 + coverDepthGap)
      frontCoverHinge.userData.targetRotationY = 0
      pivot.add(frontCoverHinge)

      const frontCover = new THREE.Mesh(makeGeometry(new THREE.BoxGeometry(coverPanelWidth, bookHeight, frontCoverThickness)), [
        coverEdgeMaterial,
        coverSpineSideMaterial,
        coverEdgeMaterial,
        coverEdgeMaterial,
        coverMaterial,
        coverEdgeMaterial,
      ])
      frontCover.position.set(coverPanelCenterX, 0, 0)
      frontCover.castShadow = true
      frontCover.receiveShadow = true
      frontCoverHinge.add(frontCover)

      let updateHingeBridge = (_rotationY: number) => {}
      if (hingeBridgeMaterial) {
        const hingeBridgeGeometry = makeGeometry(new THREE.BufferGeometry())
        const hingeBridgeVertices = new Float32Array(12)
        const hingeBridgePosition = new THREE.BufferAttribute(hingeBridgeVertices, 3)
        hingeBridgeGeometry.setAttribute('position', hingeBridgePosition)
        hingeBridgeGeometry.setIndex([0, 1, 2, 0, 2, 3])

        const hingeBridge = new THREE.Mesh(hingeBridgeGeometry, hingeBridgeMaterial)
        hingeBridge.frustumCulled = false
        hingeBridge.renderOrder = 4
        pivot.add(hingeBridge)

        updateHingeBridge = (rotationY: number) => {
          const spineX = coverHingeX - spineWidth * 0.08
          const spineZ = bookDepth / 2 + 0.005
          const coverFaceZ = frontCoverThickness / 2 + 0.005
          const coverX = coverHingeX + coverFaceZ * Math.sin(rotationY)
          const coverZ = frontCoverHinge.position.z + coverFaceZ * Math.cos(rotationY)
          const topY = bookHeight / 2 - 0.01
          const bottomY = -bookHeight / 2 + 0.01

          hingeBridgeVertices.set([spineX, bottomY, spineZ, coverX, bottomY, coverZ, coverX, topY, coverZ, spineX, topY, spineZ])
          hingeBridgePosition.needsUpdate = true
        }
        updateHingeBridge(frontCoverHinge.rotation.y)
      }

      const backCover = new THREE.Mesh(makeGeometry(new THREE.BoxGeometry(coverPanelWidth, bookHeight, backCoverThickness)), [
        coverEdgeMaterial,
        coverSpineSideMaterial,
        coverEdgeMaterial,
        coverEdgeMaterial,
        coverEdgeMaterial,
        backCoverMaterial,
      ])
      backCover.position.set(coverPanelCenterX, 0, -bookDepth / 2 - backCoverThickness / 2 - coverDepthGap)
      backCover.castShadow = true
      pivot.add(backCover)

      const spine = new THREE.Mesh(makeGeometry(new THREE.BoxGeometry(spineWidth, bookHeight, spineOuterDepth)), [
        spineEdgeMaterial,
        spineMaterial,
        spineEdgeMaterial,
        spineEdgeMaterial,
        spineEdgeMaterial,
        spineEdgeMaterial,
      ])
      spine.position.set(-spineWidth / 2, 0, 0)
      spine.castShadow = true
      spine.receiveShadow = true
      pivot.add(spine)

      const foreEdgeStripScale = book.foreEdgeStripScale ?? 1
      const foreEdgeWidth = 0.09 * foreEdgeStripScale
      const edge =
        foreEdgeWidth > 0.001
          ? new THREE.Mesh(makeGeometry(new THREE.BoxGeometry(foreEdgeWidth, bookHeight - 0.18, bookDepth * 0.94)), pageEdgeMaterial)
          : null
      if (edge) {
        edge.position.set(bookWidth - pageForeInset + foreEdgeWidth / 2, 0, 0)
        edge.castShadow = true
        pivot.add(edge)
      }

      const topPages = new THREE.Mesh(makeGeometry(new THREE.BoxGeometry(Math.max(0.1, pageBlockWidth - 0.05), 0.045, bookDepth * 0.94)), pageEdgeMaterial)
      topPages.position.set(pageBlockCenterX, bookHeight / 2 - 0.065, 0)
      pivot.add(topPages)

      const bottomPages = new THREE.Mesh(makeGeometry(new THREE.BoxGeometry(Math.max(0.1, pageBlockWidth - 0.05), 0.045, bookDepth * 0.94)), pageEdgeMaterial)
      bottomPages.position.set(pageBlockCenterX, -bookHeight / 2 + 0.065, 0)
      pivot.add(bottomPages)

      ;[pages, frontCover, backCover, spine, topPages, bottomPages, edge].forEach((mesh) => {
        if (!mesh) return
        mesh.userData.bookIndex = index
        interactiveMeshes.push(mesh)
      })

      return { pivot, frontCoverHinge, updateHingeBridge }
    })

    const ambientLight = new THREE.HemisphereLight(0xffffff, 0x9b3b10, 0.76)
    scene.add(ambientLight)

    const frontFillLight = new THREE.DirectionalLight(0xffffff, 0.72)
    frontFillLight.position.set(0, 1.2, 4.8)
    scene.add(frontFillLight)

    const keyLight = new THREE.DirectionalLight(0xfff4dd, 1.65)
    keyLight.position.set(3.8, 4.6, 5.8)
    keyLight.castShadow = true
    keyLight.shadow.bias = -0.00008
    keyLight.shadow.normalBias = 0.045
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xff8b42, 0.52)
    fillLight.position.set(-3.6, 1.6, 3.4)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.82)
    rimLight.position.set(-2.8, 2.4, -3.6)
    scene.add(rimLight)

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2(10, 10)
    let hoveredIndex: number | null = null
    let scrollTarget = 0
    let scrollCurrent = 0
    let frameId = 0
    let disposed = false
    let transitionBookIndex: number | null = null
    let detailBookIndex: number | null = null
    let transitionStart = 0
    let detailStartScroll = 0
    let detailSettled = false
    let detailInteractionReady = false
    let promotedCanvas = false
    let promotionStartRect = { left: 0, top: 0, width: 1, height: 1 }
    let currentCanvasRect = { left: 0, top: 0, width: 1, height: 1 }
    let detailDragging = false
    let detailStartX = 0
    let detailStartY = 0
    let detailStartYaw = 0
    let detailStartPitch = 0
    let detailTargetYaw = -0.08
    let detailTargetPitch = -0.04
    let detailCurrentYaw = -0.08
    let detailCurrentPitch = -0.04

    const easeInCubic = (progress: number) => progress * progress * progress
    const easeOutCubic = (progress: number) => 1 - Math.pow(1 - progress, 3)

    const applyTargets = () => {
      const activeBookIndex = hoveredIndex
      bookEntries.forEach(({ pivot }, index) => {
        let targetX = baseStart + index * closedSpacing
        const targetY = pivot.userData.baseY ?? -0.04
        let targetZ = 0
        let targetRotationY = closedBookRotation

        if (activeBookIndex !== null) {
          if (index < activeBookIndex) targetX -= openLeftSpace
          if (index > activeBookIndex) targetX += openRightSpace
          if (activeBookIndex === index) {
            targetZ = 0.24
            targetRotationY = hoverBookRotation
          }
        }
        pivot.visible = true
        pivot.userData.targetX = targetX
        pivot.userData.targetY = targetY
        pivot.userData.targetZ = targetZ
        pivot.userData.targetRotationY = targetRotationY
        pivot.userData.targetCoverRotationY = 0
        pivot.userData.targetRotationZ = 0
        pivot.userData.targetScale = 1
      })
    }

    const resizeRendererTo = (width: number, height: number) => {
      const nextWidth = Math.max(1, Math.floor(width))
      const nextHeight = Math.max(1, Math.floor(height))
      camera.aspect = nextWidth / nextHeight
      camera.updateProjectionMatrix()
      renderer.setPixelRatio(getBookRendererPixelRatio())
      renderer.setSize(nextWidth, nextHeight, false)
    }

    const placePromotedCanvas = (rect: { left: number; top: number; width: number; height: number }) => {
      currentCanvasRect = rect
      renderer.domElement.style.left = `${rect.left}px`
      renderer.domElement.style.top = `${rect.top}px`
      renderer.domElement.style.width = `${rect.width}px`
      renderer.domElement.style.height = `${rect.height}px`
      resizeRendererTo(rect.width, rect.height)
    }

    const restoreCanvasToShelf = () => {
      if (!promotedCanvas) return
      container.appendChild(renderer.domElement)
      promotedCanvas = false
      renderer.domElement.style.position = 'absolute'
      renderer.domElement.style.inset = '0'
      renderer.domElement.style.left = ''
      renderer.domElement.style.top = ''
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      renderer.domElement.style.zIndex = '2'
      renderer.domElement.style.pointerEvents = 'auto'
      renderer.domElement.style.cursor = 'grab'
      resizeRendererTo(container.getBoundingClientRect().width, container.getBoundingClientRect().height)
    }

    const promoteCanvasToBody = () => {
      const rect = container.getBoundingClientRect()
      promotionStartRect = {
        left: rect.left,
        top: rect.top,
        width: Math.max(1, rect.width),
        height: Math.max(1, rect.height),
      }
      promotedCanvas = true
      renderer.domElement.style.position = 'fixed'
      renderer.domElement.style.inset = 'auto'
      renderer.domElement.style.zIndex = '9998'
      renderer.domElement.style.pointerEvents = 'none'
      renderer.domElement.style.cursor = 'default'
      renderer.domElement.style.touchAction = 'none'
      document.body.appendChild(renderer.domElement)
      placePromotedCanvas(promotionStartRect)
    }

    const closeDetailScene = () => {
      transitionBookIndex = null
      detailBookIndex = null
      detailSettled = false
      detailInteractionReady = false
      detailDragging = false
      pointer.set(10, 10)
      hoveredIndex = null
      renderer.domElement.style.cursor = 'grab'
      renderer.domElement.style.pointerEvents = 'auto'
      shelfGroup.position.x = -scrollCurrent
      bookEntries.forEach(({ pivot, frontCoverHinge, updateHingeBridge }) => {
        pivot.visible = true
        pivot.rotation.x = 0
        pivot.rotation.z = 0
        pivot.scale.setScalar(1)
        frontCoverHinge.rotation.y = 0
        updateHingeBridge(frontCoverHinge.rotation.y)
      })
      restoreCanvasToShelf()
      applyTargets()
    }

    closeDetailSceneRef.current = closeDetailScene

    const resize = () => {
      if (promotedCanvas) {
        placePromotedCanvas(currentCanvasRect)
        return
      }
      const rect = container.getBoundingClientRect()
      const width = Math.max(1, Math.floor(rect.width))
      const height = Math.max(1, Math.floor(rect.height))
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setPixelRatio(getBookRendererPixelRatio())
      renderer.setSize(width, height, false)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    resize()
    applyTargets()

    const updatePointer = (event: PointerEvent) => {
      if (transitionBookIndex !== null || detailBookIndex !== null) return
      const rect = container.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObjects(interactiveMeshes, false)[0]
      const nextIndex = typeof hit?.object.userData.bookIndex === 'number' ? hit.object.userData.bookIndex : null
      if (nextIndex !== hoveredIndex) {
        hoveredIndex = nextIndex
        renderer.domElement.style.cursor = hoveredIndex === null ? 'grab' : 'pointer'
        applyTargets()
      }
    }

    const handlePointerDown = (event: PointerEvent) => {
      event.preventDefault()
      event.stopPropagation()
      if (transitionBookIndex !== null || detailBookIndex !== null) return
      updatePointer(event)
      if (hoveredIndex === null) {
        renderer.domElement.style.cursor = 'grab'
        applyTargets()
        return
      }

      const clickedIndex = hoveredIndex
      transitionBookIndex = clickedIndex
      detailBookIndex = clickedIndex
      transitionStart = performance.now()
      detailStartScroll = scrollCurrent
      detailSettled = false
      detailInteractionReady = false
      bookEntries.forEach(({ pivot }) => {
        pivot.userData.transitionStartX = pivot.position.x
        pivot.userData.transitionStartY = pivot.position.y
        pivot.userData.transitionStartZ = pivot.position.z
        pivot.userData.transitionStartRotationX = pivot.rotation.x
        pivot.userData.transitionStartRotationY = pivot.rotation.y
        pivot.userData.transitionStartRotationZ = pivot.rotation.z
      })
      const selectedPivot = bookEntries[clickedIndex].pivot
      detailCurrentYaw = selectedPivot.rotation.y
      detailCurrentPitch = selectedPivot.rotation.x
      detailTargetYaw = -0.08
      detailTargetPitch = -0.04
      promoteCanvasToBody()
      setSelectedBookIndex(clickedIndex)
      renderer.domElement.style.cursor = 'default'
      applyTargets()
    }

    const clearPointer = () => {
      if (transitionBookIndex !== null || detailBookIndex !== null) return
      pointer.set(10, 10)
      hoveredIndex = null
      renderer.domElement.style.cursor = 'grab'
      applyTargets()
    }

    const handleWheel = (event: WheelEvent) => {
      if (detailBookIndex !== null) {
        event.preventDefault()
        event.stopPropagation()
        return
      }
      event.preventDefault()
      event.stopPropagation()
      scrollTarget = THREE.MathUtils.clamp(scrollTarget + (event.deltaX + event.deltaY) * 0.006, 0, maxScroll)
    }

    const handleDetailPointerDown = (event: globalThis.PointerEvent) => {
      if (detailBookIndex === null || !detailInteractionReady) return
      event.preventDefault()
      event.stopPropagation()
      detailDragging = true
      detailStartX = event.clientX
      detailStartY = event.clientY
      detailStartYaw = detailTargetYaw
      detailStartPitch = detailTargetPitch
      renderer.domElement.style.cursor = 'grabbing'
      try {
        renderer.domElement.setPointerCapture?.(event.pointerId)
      } catch {
        // Synthetic pointer events may not be capturable.
      }
    }

    const handleDetailPointerMove = (event: globalThis.PointerEvent) => {
      if (detailBookIndex === null || !detailInteractionReady) return
      if (!detailDragging) {
        renderer.domElement.style.cursor = 'grab'
        return
      }
      event.preventDefault()
      event.stopPropagation()
      detailTargetYaw = THREE.MathUtils.clamp(detailStartYaw + (event.clientX - detailStartX) * 0.008, -Math.PI * 1.18, Math.PI * 1.18)
      detailTargetPitch = THREE.MathUtils.clamp(detailStartPitch + (event.clientY - detailStartY) * 0.003, -0.32, 0.28)
    }

    const stopDetailDragging = (event: globalThis.PointerEvent) => {
      if (!detailDragging) return
      detailDragging = false
      renderer.domElement.style.cursor = 'default'
      try {
        renderer.domElement.releasePointerCapture?.(event.pointerId)
      } catch {
        // Matching guarded pointer capture above.
      }
    }

    container.addEventListener('pointermove', updatePointer)
    container.addEventListener('pointerdown', handlePointerDown)
    container.addEventListener('pointerleave', clearPointer)
    container.addEventListener('wheel', handleWheel, { passive: false })
    renderer.domElement.addEventListener('pointerdown', handleDetailPointerDown)
    renderer.domElement.addEventListener('pointermove', handleDetailPointerMove)
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('pointerup', stopDetailDragging)
    window.addEventListener('pointercancel', stopDetailDragging)

    const animate = () => {
      frameId = window.requestAnimationFrame(animate)
      if (!activeRef.current) return

      const settle = (current: number, target: number, factor: number) => {
        const next = current + (target - current) * factor
        return Math.abs(next - target) < 0.0008 ? target : next
      }

      scrollCurrent = settle(scrollCurrent, scrollTarget, 0.16)
      shelfGroup.position.x = detailBookIndex === null ? -scrollCurrent : -detailStartScroll

      if (detailBookIndex !== null) {
        const elapsed = performance.now() - transitionStart
        const selectedIndex = detailBookIndex
        const selectedMoveDelay = 70
        const selectedMoveDuration = 1180
        const canvasMoveDelay = 40
        const canvasMoveDuration = 1040
        const detailMoveProgress = easeOutCubic(THREE.MathUtils.clamp((elapsed - selectedMoveDelay) / selectedMoveDuration, 0, 1))
        const canvasProgress = easeOutCubic(THREE.MathUtils.clamp((elapsed - canvasMoveDelay) / canvasMoveDuration, 0, 1))
        const selectedLiftProgress = easeOutCubic(THREE.MathUtils.clamp(elapsed / 260, 0, 1))
        const fullRect = {
          left: 0,
          top: 0,
          width: Math.max(1, window.innerWidth),
          height: Math.max(1, window.innerHeight),
        }

        if (promotedCanvas) {
          placePromotedCanvas({
            left: THREE.MathUtils.lerp(promotionStartRect.left, fullRect.left, canvasProgress),
            top: THREE.MathUtils.lerp(promotionStartRect.top, fullRect.top, canvasProgress),
            width: THREE.MathUtils.lerp(promotionStartRect.width, fullRect.width, canvasProgress),
            height: THREE.MathUtils.lerp(promotionStartRect.height, fullRect.height, canvasProgress),
          })
        }

        detailCurrentYaw = settle(detailCurrentYaw, detailTargetYaw, detailInteractionReady ? 0.13 : 0.2)
        detailCurrentPitch = settle(detailCurrentPitch, detailTargetPitch, detailInteractionReady ? 0.13 : 0.2)

        bookEntries.forEach(({ pivot, frontCoverHinge, updateHingeBridge }, index) => {
          const startX = pivot.userData.transitionStartX ?? pivot.position.x
          const startY = pivot.userData.transitionStartY ?? pivot.position.y
          const startZ = pivot.userData.transitionStartZ ?? pivot.position.z
          const startRotationX = pivot.userData.transitionStartRotationX ?? pivot.rotation.x
          const startRotationY = pivot.userData.transitionStartRotationY ?? pivot.rotation.y
          const startRotationZ = pivot.userData.transitionStartRotationZ ?? pivot.rotation.z

          if (index === selectedIndex) {
            const selectedDetailCoverRotationY = books[index].detailCoverRotationY ?? -0.24
            const holdX = startX
            const holdY = startY + 0.04 * selectedLiftProgress
            const holdZ = startZ + 0.18 * selectedLiftProgress
            const holdRotationY = THREE.MathUtils.lerp(startRotationY, startRotationY - 0.18, selectedLiftProgress)
            const targetX = -1.08 + detailStartScroll
            const targetY = -0.01
            const targetZ = 0.08
            const counterClockwiseRoll = -0.38 * Math.sin(detailMoveProgress * Math.PI)
            pivot.visible = true
            pivot.position.x = THREE.MathUtils.lerp(holdX, targetX, detailMoveProgress)
            pivot.position.y = THREE.MathUtils.lerp(holdY, targetY, detailMoveProgress)
            pivot.position.z = THREE.MathUtils.lerp(holdZ, targetZ, detailMoveProgress)
            pivot.rotation.x = THREE.MathUtils.lerp(startRotationX, detailCurrentPitch, detailMoveProgress)
            pivot.rotation.y = THREE.MathUtils.lerp(holdRotationY, detailCurrentYaw, detailMoveProgress)
            pivot.rotation.z = THREE.MathUtils.lerp(startRotationZ, -0.06, detailMoveProgress) + counterClockwiseRoll
            pivot.scale.setScalar(THREE.MathUtils.lerp(1, 0.56, detailMoveProgress))
            frontCoverHinge.rotation.y = settle(frontCoverHinge.rotation.y, selectedDetailCoverRotationY * detailMoveProgress, 0.18)
            updateHingeBridge(frontCoverHinge.rotation.y)
            return
          }

          const fallDelay = index * 46
          const fallProgress = easeInCubic(THREE.MathUtils.clamp((elapsed - fallDelay) / 640, 0, 1))
          pivot.visible = fallProgress < 0.995
          pivot.position.x = startX
          pivot.position.y = startY - 4.7 * fallProgress
          pivot.position.z = THREE.MathUtils.lerp(startZ, startZ - 0.34, fallProgress)
          pivot.rotation.y = startRotationY
          pivot.rotation.z = startRotationZ + (index % 2 === 0 ? -0.1 : 0.12) * fallProgress
          pivot.scale.setScalar(1)
          frontCoverHinge.rotation.y = settle(frontCoverHinge.rotation.y, 0, 0.22)
          updateHingeBridge(frontCoverHinge.rotation.y)
        })

        if (detailMoveProgress >= 1 && !detailSettled) {
          transitionBookIndex = null
          detailSettled = true
          detailInteractionReady = true
          renderer.domElement.style.pointerEvents = 'auto'
          renderer.domElement.style.cursor = 'grab'
        }

        renderer.render(scene, camera)
        return
      }

      bookEntries.forEach(({ pivot, frontCoverHinge, updateHingeBridge }) => {
        pivot.position.x = settle(pivot.position.x, pivot.userData.targetX, 0.16)
        pivot.position.y = settle(pivot.position.y, pivot.userData.targetY ?? -0.04, 0.16)
        pivot.position.z = settle(pivot.position.z, pivot.userData.targetZ ?? 0, 0.14)
        pivot.rotation.y = settle(pivot.rotation.y, pivot.userData.targetRotationY, 0.14)
        pivot.rotation.z = settle(pivot.rotation.z, pivot.userData.targetRotationZ ?? 0, 0.14)
        const nextScale = settle(pivot.scale.x, pivot.userData.targetScale ?? 1, 0.16)
        pivot.scale.setScalar(nextScale)
        frontCoverHinge.rotation.y = settle(frontCoverHinge.rotation.y, pivot.userData.targetCoverRotationY ?? 0, 0.16)
        updateHingeBridge(frontCoverHinge.rotation.y)
      })

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      disposed = true
      closeDetailSceneRef.current = null
      window.cancelAnimationFrame(frameId)
      container.removeEventListener('pointermove', updatePointer)
      container.removeEventListener('pointerdown', handlePointerDown)
      container.removeEventListener('pointerleave', clearPointer)
      container.removeEventListener('wheel', handleWheel)
      renderer.domElement.removeEventListener('pointerdown', handleDetailPointerDown)
      renderer.domElement.removeEventListener('pointermove', handleDetailPointerMove)
      renderer.domElement.removeEventListener('wheel', handleWheel)
      window.removeEventListener('pointerup', stopDetailDragging)
      window.removeEventListener('pointercancel', stopDetailDragging)
      resizeObserver.disconnect()
      textures.forEach((texture) => texture.dispose())
      materials.forEach((material) => material.dispose())
      geometries.forEach((geometry) => geometry.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [books])

  return (
    <>
      <div
        ref={containerRef}
        data-allow-scroll="true"
        aria-label="3D 书架"
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          touchAction: 'none',
        }}
      />
      {selectedBook ? (
        <ReadingBookDetailOverlay
          book={selectedBook}
          onClose={() => {
            closeDetailSceneRef.current?.()
            setSelectedBookIndex(null)
          }}
        />
      ) : null}
    </>
  )
}

function HomeGlbModel({ active = true, style }: { active?: boolean; style?: CSSProperties }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const activeRef = useRef(active)

  useEffect(() => {
    activeRef.current = active
  }, [active])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
    camera.position.set(0, 0.45, 7)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    })
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.78
    renderer.setClearColor(0x000000, 0)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'
    container.appendChild(renderer.domElement)
    const maxTextureAnisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8)

    const stabilizeTexture = (texture?: THREE.Texture | null) => {
      if (!texture) return
      texture.anisotropy = maxTextureAnisotropy
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.needsUpdate = true
    }

    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    let environmentMap: THREE.Texture | null = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = environmentMap
    scene.environmentIntensity = 0.72

    new RGBELoader().load(
      '/textures/env.hdr',
      (texture) => {
        if (disposed) {
          texture.dispose()
          return
        }

        texture.mapping = THREE.EquirectangularReflectionMapping
        const hdrEnvironment = pmremGenerator.fromEquirectangular(texture).texture
        texture.dispose()
        environmentMap?.dispose()
        environmentMap = hdrEnvironment
        scene.environment = environmentMap
        scene.environmentIntensity = 0.64
      },
      undefined,
      () => {
        container.dataset.environmentLoaded = 'fallback'
      },
    )

    const ambientLight = new THREE.HemisphereLight(0xffffff, 0x7d1a14, 0.72)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xfff2df, 1.38)
    keyLight.position.set(3.6, 4.6, 5.2)
    keyLight.castShadow = true
    keyLight.shadow.bias = -0.00005
    keyLight.shadow.normalBias = 0.04
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xff725f, 0.36)
    fillLight.position.set(-2.8, 1.2, 2)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.68)
    rimLight.position.set(-3, 2, -2.8)
    scene.add(rimLight)

    const mouse = { x: 0, y: 0 }
    const bodyMouse = { x: 0 }
    const eyes: Array<{
      base: THREE.Quaternion
      object: THREE.Object3D
      sx: number
      x: number
    }> = []
    let model: THREE.Object3D | null = null
    let frameId = 0
    let disposed = false

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      const nextWidth = Math.max(1, Math.floor(width))
      const nextHeight = Math.max(1, Math.floor(height))
      camera.aspect = nextWidth / nextHeight
      camera.updateProjectionMatrix()
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(nextWidth, nextHeight, false)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    resize()

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      mouse.x = THREE.MathUtils.clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -2.2, 1.4)
      mouse.y = THREE.MathUtils.clamp(-(((event.clientY - rect.top) / rect.height) * 2 - 1), -1.45, 1.45)
      bodyMouse.x = THREE.MathUtils.clamp((event.clientX / window.innerWidth) * 2 - 1, -1, 1)
      container.dataset.eyeX = mouse.x.toFixed(3)
      container.dataset.eyeY = mouse.y.toFixed(3)
      container.dataset.bodyX = bodyMouse.x.toFixed(3)
    }

    window.addEventListener('pointermove', handlePointerMove)

    homeGlbPromise
      .then((gltf) => {
        if (disposed) return

        model = cloneSkeleton(gltf.scene) as THREE.Object3D
        model.rotation.y = -0.24
        scene.add(model)

        model.traverse((child) => {
          if ('isMesh' in child) {
            const mesh = child as THREE.Mesh
            const isEyeMesh = /eye/i.test(mesh.name)
            mesh.frustumCulled = false
            mesh.castShadow = true
            mesh.receiveShadow = false
            if (isEyeMesh) {
              mesh.geometry.computeVertexNormals()
            }
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
            materials.forEach((material) => {
              if (isEyeMesh) {
                material.flatShading = false
              } else if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhysicalMaterial) {
                stabilizeTexture(material.map)
                stabilizeTexture(material.roughnessMap)
                stabilizeTexture(material.metalnessMap)
                stabilizeTexture(material.aoMap)
                material.normalMap = null
                material.roughness = Math.max(material.roughness ?? 0.45, 0.48)
                material.metalness = Math.min(material.metalness ?? 0, 0.04)
                material.envMapIntensity = 0.58
              }
              material.needsUpdate = true
            })
            if (isEyeMesh) {
              eyes.push({ object: mesh, base: mesh.quaternion.clone(), x: mesh.position.x, sx: 0 })
            }
          }
        })

        if (eyes.length > 1) {
          const xs = eyes.map((eye) => eye.x)
          const mid = (Math.min(...xs) + Math.max(...xs)) / 2
          eyes.forEach((eye) => {
            eye.sx = eye.x < mid ? -1 : 1
          })
        }

        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())
        const targetHeight = 3.95
        const scale = targetHeight / Math.max(size.y, 0.001)
        model.scale.setScalar(scale)
        model.position.set(-center.x * scale - 0.7, -center.y * scale + 0.22, -0.15)

        container.dataset.modelLoaded = 'true'
        container.dataset.eyesFound = String(eyes.length)
      })
      .catch(() => {
        if (!disposed) {
          container.dataset.modelLoaded = 'error'
        }
      })

    const targetQuat = new THREE.Quaternion()
    const desiredQuat = new THREE.Quaternion()
    const eyeEuler = new THREE.Euler(0, 0, 0, 'YXZ')
    const projectedEye = new THREE.Vector3()

    const animate = () => {
      frameId = window.requestAnimationFrame(animate)

      if (!activeRef.current) return

      if (model) {
        model.rotation.y += (-0.24 + bodyMouse.x * 0.03 - model.rotation.y) * 0.05
      }

      if (eyes.length > 0) {
        let averageX = 0
        let averageY = 0
        eyes.forEach(({ object }) => {
          object.getWorldPosition(projectedEye).project(camera)
          averageX += projectedEye.x
          averageY += projectedEye.y
        })
        averageX /= eyes.length
        averageY /= eyes.length

        const mx = mouse.x - averageX
        const my = mouse.y - averageY
        const yawBase = THREE.MathUtils.clamp(
          mx * THREE.MathUtils.degToRad(15) * 3,
          THREE.MathUtils.degToRad(-45),
          THREE.MathUtils.degToRad(45),
        )
        const pitch = THREE.MathUtils.clamp(
          -my * THREE.MathUtils.degToRad(8) * 3,
          THREE.MathUtils.degToRad(-24),
          THREE.MathUtils.degToRad(24),
        )
        const distance = Math.hypot(mx, my)
        const convergeWeight = THREE.MathUtils.clamp(1 - distance / 0.22, 0, 1)
        const convergeRadians = THREE.MathUtils.degToRad(24) * convergeWeight

        eyes.forEach(({ object, base, sx }) => {
          const yaw = yawBase - sx * convergeRadians
          eyeEuler.set(pitch, yaw, 0)
          targetQuat.setFromEuler(eyeEuler)
          desiredQuat.copy(targetQuat).multiply(base)
          object.quaternion.slerp(desiredQuat, 0.44)
        })

        container.dataset.eyeAimX = averageX.toFixed(3)
        container.dataset.eyeAimY = averageY.toFixed(3)
        container.dataset.eyeYaw = THREE.MathUtils.radToDeg(yawBase).toFixed(2)
        container.dataset.eyePitch = THREE.MathUtils.radToDeg(pitch).toFixed(2)
      }

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      disposed = true
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('pointermove', handlePointerMove)
      resizeObserver.disconnect()
      renderer.dispose()
      environmentMap?.dispose()
      pmremGenerator.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      aria-label="3D 人物模型"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 3,
        pointerEvents: 'none',
        filter: 'drop-shadow(0 14px 18px rgba(55,38,28,0.08))',
        ...style,
      }}
    />
  )
}

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [pageMotion, setPageMotion] = useState<PageMotion>('none')
  const [activeProject, setActiveProject] = useState(0)
  const [activeSkill, setActiveSkill] = useState(0)
  const [activeSkillWall, setActiveSkillWall] = useState(0)
  const [skillWallTrackIndex, setSkillWallTrackIndex] = useState(0)
  const [skillWallTransitionEnabled, setSkillWallTransitionEnabled] = useState(true)
  const [skillAppsExpanded, setSkillAppsExpanded] = useState(false)
  const pageRef = useRef<Page>('home')
  const activeSkillWallRef = useRef(0)
  const skillAppsExpandedRef = useRef(false)
  const skillWallPointerRef = useRef<{ x: number; y: number } | null>(null)
  const skillWallNavLockedRef = useRef(false)
  const wheelAccumRef = useRef(0)
  const wheelLockRef = useRef(false)
  const wheelResetTimerRef = useRef<number | null>(null)
  const wheelLockTimerRef = useRef<number | null>(null)
  const skillExpandTimerRef = useRef<number | null>(null)
  const skillWallWrapTimerRef = useRef<number | null>(null)
  const skillWallNavTimerRef = useRef<number | null>(null)
  const lastWheelDirectionRef = useRef<-1 | 0 | 1>(0)
  const pendingWheelDirectionRef = useRef<-1 | 0 | 1>(0)

  const goToPage = (nextPage: Page) => {
    const currentPage = pageRef.current
    if (nextPage === currentPage) return

    pageRef.current = nextPage
    setPageMotion(pageOrder[nextPage] > pageOrder[currentPage] ? 'up' : 'down')
    setPage(nextPage)
  }

  useEffect(() => {
    pageRef.current = page
  }, [page])

  useEffect(() => {
    activeSkillWallRef.current = activeSkillWall
  }, [activeSkillWall])

  useEffect(() => {
    skillAppsExpandedRef.current = skillAppsExpanded
  }, [skillAppsExpanded])

  useEffect(() => {
    if (page !== 'skills') {
      if (skillExpandTimerRef.current !== null) {
        window.clearTimeout(skillExpandTimerRef.current)
        skillExpandTimerRef.current = null
      }
      if (skillWallWrapTimerRef.current !== null) {
        window.clearTimeout(skillWallWrapTimerRef.current)
        skillWallWrapTimerRef.current = null
      }
      if (skillWallNavTimerRef.current !== null) {
        window.clearTimeout(skillWallNavTimerRef.current)
        skillWallNavTimerRef.current = null
      }
      skillWallNavLockedRef.current = false
      setActiveSkillWall(0)
      activeSkillWallRef.current = 0
      setSkillWallTransitionEnabled(false)
      setSkillWallTrackIndex(0)
      window.requestAnimationFrame(() => {
        setSkillWallTransitionEnabled(true)
      })
      setSkillAppsExpanded(false)
      skillAppsExpandedRef.current = false
      return
    }

    if (skillExpandTimerRef.current !== null) {
      window.clearTimeout(skillExpandTimerRef.current)
      skillExpandTimerRef.current = null
    }

    setActiveSkill(0)
    setActiveSkillWall(0)
    activeSkillWallRef.current = 0
    setSkillWallTransitionEnabled(false)
    setSkillWallTrackIndex(0)
    setSkillAppsExpanded(false)
    skillAppsExpandedRef.current = false

    window.requestAnimationFrame(() => {
      setSkillWallTransitionEnabled(true)
    })

    skillExpandTimerRef.current = window.setTimeout(() => {
      setSkillAppsExpanded(true)
      skillExpandTimerRef.current = null
    }, skillPageAutoExpandDelayMs)
  }, [page])

  useEffect(() => {
    if (activeSkillWall !== 0) {
      setSkillAppsExpanded(false)
    }
  }, [activeSkillWall])

  useEffect(() => {
    return () => {
      if (skillExpandTimerRef.current !== null) {
        window.clearTimeout(skillExpandTimerRef.current)
      }
      if (skillWallWrapTimerRef.current !== null) {
        window.clearTimeout(skillWallWrapTimerRef.current)
      }
      if (skillWallNavTimerRef.current !== null) {
        window.clearTimeout(skillWallNavTimerRef.current)
      }
    }
  }, [])

  const selectSkill = (index: number) => {
    const waitForCollapse = skillAppsExpandedRef.current || skillExpandTimerRef.current !== null

    if (skillExpandTimerRef.current !== null) {
      window.clearTimeout(skillExpandTimerRef.current)
      skillExpandTimerRef.current = null
    }

    setSkillAppsExpanded(false)
    skillExpandTimerRef.current = window.setTimeout(() => {
      setActiveSkill(index)
      skillExpandTimerRef.current = window.setTimeout(() => {
        setSkillAppsExpanded(true)
        skillExpandTimerRef.current = null
      }, skillIconExpandDelayMs)
    }, waitForCollapse ? skillIconCollapseMs : skillIconExpandDelayMs)
  }

  const resetSkillWallTrackAfterWrap = (index: number) => {
    if (skillWallWrapTimerRef.current !== null) {
      window.clearTimeout(skillWallWrapTimerRef.current)
    }

    skillWallWrapTimerRef.current = window.setTimeout(() => {
      setSkillWallTransitionEnabled(false)
      setSkillWallTrackIndex(index)
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setSkillWallTransitionEnabled(true)
        })
      })
      skillWallWrapTimerRef.current = null
    }, skillWallTransitionMs)
  }

  const lockSkillWallNavigation = () => {
    skillWallNavLockedRef.current = true
    if (skillWallNavTimerRef.current !== null) {
      window.clearTimeout(skillWallNavTimerRef.current)
    }
    skillWallNavTimerRef.current = window.setTimeout(() => {
      skillWallNavLockedRef.current = false
      skillWallNavTimerRef.current = null
    }, skillWallTransitionMs)
  }

  const changeSkillWallByDirection = (direction: -1 | 1) => {
    if (skillWallNavLockedRef.current) return

    const currentIndex = activeSkillWallRef.current
    const nextIndex = (currentIndex + direction + skillWalls.length) % skillWalls.length

    lockSkillWallNavigation()
    activeSkillWallRef.current = nextIndex
    setActiveSkillWall(nextIndex)
    setSkillWallTransitionEnabled(true)

    if (currentIndex === skillWalls.length - 1 && direction === 1) {
      setSkillWallTrackIndex(skillWalls.length)
      resetSkillWallTrackAfterWrap(nextIndex)
      return
    }

    if (currentIndex === 0 && direction === -1) {
      setSkillWallTrackIndex(-1)
      resetSkillWallTrackAfterWrap(nextIndex)
      return
    }

    setSkillWallTrackIndex(nextIndex)
  }

  const handleSkillWallPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null
    if (target?.closest('[data-allow-scroll="true"]')) return

    skillWallPointerRef.current = { x: event.clientX, y: event.clientY }
  }

  const handleSkillWallPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null
    if (target?.closest('[data-allow-scroll="true"]')) {
      skillWallPointerRef.current = null
      return
    }

    const start = skillWallPointerRef.current
    skillWallPointerRef.current = null
    if (!start) return

    const deltaX = event.clientX - start.x
    const deltaY = event.clientY - start.y
    if (Math.abs(deltaX) < 54 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return

    changeSkillWallByDirection(deltaX < 0 ? 1 : -1)
  }

  useEffect(() => {
    const normalizeWheelDelta = (event: WheelEvent) => {
      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 16
      if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * window.innerHeight
      return event.deltaY
    }

    const switchSkillWallByDirection = (direction: -1 | 1) => {
      wheelAccumRef.current = 0

      pendingWheelDirectionRef.current = 0
      lastWheelDirectionRef.current = direction
      wheelLockRef.current = true
      changeSkillWallByDirection(direction)

      if (wheelLockTimerRef.current !== null) {
        window.clearTimeout(wheelLockTimerRef.current)
      }
      wheelLockTimerRef.current = window.setTimeout(() => {
        wheelLockRef.current = false
        wheelLockTimerRef.current = null

        const pendingDirection = pendingWheelDirectionRef.current
        pendingWheelDirectionRef.current = 0
        if (pendingDirection !== 0) {
          switchSkillWallByDirection(pendingDirection)
        }
      }, wheelSwitchLockMs)
    }

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return
      if (pageRef.current !== 'skills') return

      const target = event.target instanceof Element ? event.target : null
      if (target?.closest('input, textarea, select, [data-allow-scroll="true"]')) return

      event.preventDefault()

      const deltaY = normalizeWheelDelta(event)
      if (Math.abs(deltaY) < 0.5) return
      const direction = deltaY > 0 ? 1 : -1

      if (wheelLockRef.current) {
        if (direction !== lastWheelDirectionRef.current) {
          pendingWheelDirectionRef.current = direction
        }
        return
      }

      wheelAccumRef.current += deltaY
      if (wheelResetTimerRef.current !== null) {
        window.clearTimeout(wheelResetTimerRef.current)
      }
      wheelResetTimerRef.current = window.setTimeout(() => {
        wheelAccumRef.current = 0
        wheelResetTimerRef.current = null
      }, wheelResetMs)

      const threshold = wheelAccumRef.current < 0 ? wheelBackSwitchThreshold : wheelSwitchThreshold
      if (Math.abs(wheelAccumRef.current) < threshold) return

      switchSkillWallByDirection(wheelAccumRef.current > 0 ? 1 : -1)
    }

    window.addEventListener('wheel', handleWheel, { passive: false, capture: true })

    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true })
      if (wheelResetTimerRef.current !== null) {
        window.clearTimeout(wheelResetTimerRef.current)
      }
      if (wheelLockTimerRef.current !== null) {
        window.clearTimeout(wheelLockTimerRef.current)
      }
    }
  }, [])

  const pageClassName = `page-screen ${pageMotion === 'up' ? 'page-enter-up' : pageMotion === 'down' ? 'page-enter-down' : ''}`
  const selectedSkill = skillGroups[activeSkill]
  const activeSkillWallData = skillWalls[activeSkillWall]
  const activeSkillColor = activeSkillWall === 0 ? selectedSkill.color : activeSkillWallData.color
  const selectedAppSlots =
    selectedSkill.apps.length === 2
      ? [
          { left: 72, top: 14, rotation: -10 },
          { left: 184, top: 14, rotation: 10 },
        ]
      : selectedSkill.apps.length === 4
        ? appSpreadSlotsFour
        : appSpreadSlots

  return (
    <div className="app-shell" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* NAV */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          padding: '68px 40px 18px',
        }}
      >
        <div style={{ flex: 1 }} />

        {/* Nav pills — absolutely centered */}
        <LiquidGlass
          displacementScale={64}
          blurAmount={0.1}
          saturation={130}
          aberrationIntensity={2}
          elasticity={0}
          cornerRadius={999}
          padding="8px"
          mode="polar"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
          }}
        >
          <div style={{ display: 'flex', gap: 2 }}>
            {(['home', 'videos', 'skills'] as Page[]).map((p, i) => {
              const labels = ['主页', '项目', '技能']
              const active = page === p
              return (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  style={{
                    padding: '14px 32px',
                    borderRadius: 999,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    transition: 'all 0.2s',
                    outline: 'none',
                    background: active ? 'rgba(255,255,255,0.28)' : 'transparent',
                    color: 'rgba(255,255,255,0.94)',
                    boxShadow: active ? 'inset 0 1px 0 rgba(255,255,255,0.34), 0 2px 8px rgba(0,0,0,0.22)' : 'none',
                    letterSpacing: 0.5,
                    textShadow: '0 1px 2px rgba(0,0,0,0.42), 0 2px 8px rgba(92,37,6,0.34)',
                  }}
                >
                  {labels[i]}
                </button>
              )
            })}
          </div>
        </LiquidGlass>

        {/* Right spacer to balance logo */}
        <div style={{ flex: 1 }} />
      </nav>

      {/* HOME PAGE */}
      <div
        className={page === 'home' ? pageClassName : 'page-screen'}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          overflow: 'hidden',
          opacity: page === 'home' ? 1 : 0,
          visibility: page === 'home' ? 'visible' : 'hidden',
          pointerEvents: page === 'home' ? 'auto' : 'none',
        }}
      >
          {/* Left orange panel */}
          <div
            style={{
              flex: '0 0 56%',
              background: `linear-gradient(155deg, #ff8d30 0%, ${hoodieOrange} 44%, ${hoodieOrangeDeep} 74%, ${hoodieOrangeDark} 100%)`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '100px clamp(48px, 5vw, 72px) 64px',
              position: 'relative',
              minWidth: 0,
            }}
          >
            <div style={{ position: 'relative', zIndex: 2 }}>
              <WarpText
                text="曲勇旭"
                color="#ffffff"
                warpStrength={0.06}
                warpScale={1.55}
                speed={0.42}
                pointerInfluence={0.34}
                pointerStrength={0.3}
                refraction={0.012}
                ripple
                fontSize="clamp(48px, 5.5vw, 74px)"
                fontWeight={800}
                fontFamily="'Oswald', 'PingFang SC', 'Microsoft YaHei', sans-serif"
                letterSpacing="0"
                lineHeight={0.95}
                textAlign="left"
                style={{
                  width: 'min(460px, 100%)',
                  height: 104,
                  margin: '0 0 16px',
                  filter: 'drop-shadow(0 2px 20px rgba(0,0,0,0.3))',
                }}
              />

              <div style={{ width: 48, height: 2, background: 'rgba(255,255,255,0.45)', marginBottom: 22 }} />

              <div style={{ maxWidth: 440, color: 'white' }}>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: 3.2,
                    color: 'rgba(255,255,255,0.52)',
                    fontWeight: 800,
                    marginBottom: 13,
                  }}
                >
                  EDUCATION
                </div>

                <div style={{ display: 'grid', gap: 10 }}>
                  {[
                    ['学校', '中国石油大学（华东）'],
                    ['专业', '材料化学（高分子方向）'],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '46px minmax(0, 1fr)',
                        alignItems: 'baseline',
                        gap: 14,
                      }}
                    >
                      <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 700 }}>{label}</span>
                      <span style={{ color: 'rgba(255,255,255,0.92)', fontSize: 15, fontWeight: 800, letterSpacing: 0.2 }}>{value}</span>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))',
                    gap: 12,
                    marginTop: 16,
                    paddingTop: 15,
                    borderTop: '1px solid rgba(255,255,255,0.24)',
                  }}
                >
                  {[
                    ['状态', '本科在读'],
                    ['成绩', '89.06'],
                    ['排名', '5 / 48'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div style={{ color: 'rgba(255,255,255,0.52)', fontSize: 11, fontWeight: 700, marginBottom: 5 }}>{label}</div>
                      <div style={{ color: 'rgba(255,255,255,0.94)', fontSize: 17, fontWeight: 800, lineHeight: 1 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right panel — soft silver-white gradient */}
          <div
            style={{
              flex: '1 1 44%',
              position: 'relative',
              overflow: 'hidden',
              background: '#f3f1ed',
              boxShadow: 'inset 10px 0 20px rgba(202,96,24,0.05)',
              minWidth: 0,
            }}
          >
            {/* Base gradient: warmer at the seam, brighter through the middle, darker at the far edge */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(100deg, #e0d9d1 0%, #f4f1ec 24%, #ffffff 54%, #f5f4f2 82%, #ebe9e6 100%)',
              }}
            />
            {/* Soft central bloom keeps the white side luminous without becoming flat */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at 44% 42%, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.72) 34%, rgba(255,255,255,0) 68%)',
              }}
            />
            {/* Seam and edge shading blend the panels together */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to right, rgba(202,96,24,0.08) 0%, rgba(150,111,83,0.04) 12%, rgba(255,255,255,0) 34%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at 100% 52%, rgba(218,214,207,0.05) 0%, rgba(255,255,255,0) 62%)',
              }}
            />
          </div>
      </div>

      {/* PROJECTS PAGE */}
      {page === 'videos' && (
        <div className={pageClassName} style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
          {/* Background */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <img
              src={projects[activeProject].poster}
              alt="background"
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(60px) brightness(0.3)', transform: 'scale(1.1)' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.7)' }} />
          </div>

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '100px 0 0' }}>
            {/* Project detail */}
            <div style={{ padding: '0 60px', maxWidth: 500 }}>
              <div style={{ fontSize: 11, letterSpacing: 4, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 8 }}>
                {projects[activeProject].label}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
                {projects[activeProject].year}
              </div>
              <h2
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 'clamp(32px, 5vw, 60px)',
                  fontWeight: 700,
                  color: 'white',
                  margin: '0 0 24px',
                  lineHeight: 1.1,
                }}
              >
                {projects[activeProject].title}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 1.75, margin: '0 0 18px' }}>
                {projects[activeProject].desc}
              </p>
              <div style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
                {projects[activeProject].highlights.map((item) => (
                  <div
                    key={item}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '8px minmax(0, 1fr)',
                      alignItems: 'start',
                      gap: 10,
                      color: 'rgba(255,255,255,0.72)',
                      fontSize: 12.5,
                      lineHeight: 1.55,
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: hoodieOrange,
                        marginTop: 7,
                        boxShadow: `0 0 12px ${hoodieOrangeGlow}`,
                      }}
                    />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{ width: 40, height: 3, background: hoodieOrange }} />
            </div>

            {/* Project poster strip */}
            <div
              style={{
                overflowX: 'auto',
                display: 'flex',
                gap: 12,
                padding: '24px 60px 48px',
                scrollbarWidth: 'none',
              }}
              className="scrollbar-hide"
            >
              {projects.map((project, i) => (
                <div
                  key={project.id}
                  onClick={() => setActiveProject(i)}
                  style={{
                    flex: '0 0 140px',
                    height: 200,
                    borderRadius: 12,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    position: 'relative',
                    border: activeProject === i ? `2px solid ${hoodieOrange}` : '2px solid transparent',
                    transition: 'all 0.25s',
                    transform: activeProject === i ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: activeProject === i ? `0 8px 32px ${hoodieOrangeGlow}` : '0 4px 16px rgba(0,0,0,0.4)',
                  }}
                >
                  <img
                    src={project.poster}
                    alt={project.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: activeProject === i ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.45)',
                      transition: 'all 0.25s',
                      display: 'flex',
                      alignItems: 'flex-end',
                      padding: 10,
                    }}
                  >
                    <div style={{ color: 'white', lineHeight: 1.25 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 4 }}>
                        {project.title}
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.72)', fontWeight: 600 }}>
                        {project.year}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SKILLS PAGE */}
      {page === 'skills' && (
        <div className={pageClassName} style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(ellipse at 50% 102%, ${activeSkillColor} 0%, rgba(255,139,42,0.84) 24%, ${hoodieOrangeDeep} 62%, ${hoodieOrangeDark} 100%)`,
              transition: 'background 0.4s',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: '30%',
              background: 'radial-gradient(ellipse at 50% 100%, rgba(255,137,36,0.52) 0%, rgba(255,137,36,0.16) 34%, transparent 72%)',
              filter: 'blur(18px)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'relative',
              zIndex: 1,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
	              justifyContent: 'center',
	              padding: '96px clamp(40px, 6vw, 86px) 48px',
	            }}
	          >
	            <div
	              style={{
	                position: 'absolute',
	                left: '50%',
	                top: 'calc(50% - max(215px, min(250px, calc((100vh - 160px) / 2))) - 48px)',
	                width: 'min(1088px, calc(100vw - 80px))',
	                transform: 'translateX(-50%)',
	                zIndex: 7,
	                display: 'flex',
	                alignItems: 'center',
	                justifyContent: 'space-between',
	                pointerEvents: 'none',
	              }}
	            >
	              <div
	                style={{
	                  display: 'flex',
	                  alignItems: 'baseline',
	                  gap: 12,
	                  color: 'rgba(255,255,255,0.92)',
	                  textShadow: '0 3px 12px rgba(82,31,4,0.22)',
	                }}
	              >
	                <span
	                  style={{
	                    fontFamily: "'Oswald', sans-serif",
	                    fontSize: 18,
	                    fontWeight: 700,
	                    lineHeight: 1,
	                    letterSpacing: 0,
	                  }}
	                >
	                  {String(activeSkillWall + 1).padStart(2, '0')}
	                </span>
	                <span style={{ width: 30, height: 1, background: 'rgba(255,255,255,0.58)' }} />
	                <span
	                  style={{
	                    fontSize: 15,
	                    fontWeight: 850,
	                    letterSpacing: 1.2,
	                  }}
	                >
	                  {activeSkillWallData.displayTitle}
	                </span>
	              </div>
	              <div
	                style={{
	                  color: 'rgba(255,255,255,0.58)',
	                  fontSize: 11,
	                  fontWeight: 800,
	                  letterSpacing: 3.2,
	                  textTransform: 'uppercase',
	                  textShadow: '0 2px 8px rgba(82,31,4,0.18)',
	                }}
	              >
	                {activeSkillWallData.label} WALL
	              </div>
	            </div>

	            <LiquidGlass
              displacementScale={100}
              blurAmount={1.0}
              saturation={140}
              aberrationIntensity={2}
              elasticity={0}
              cornerRadius={28}
              padding="0"
              mode="prominent"
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
              }}
            >
	              <div
	                onPointerDown={handleSkillWallPointerDown}
	                onPointerUp={handleSkillWallPointerUp}
	                onPointerCancel={() => {
	                  skillWallPointerRef.current = null
	                }}
	                style={{
	                  width: 'min(1088px, calc(100vw - 80px))',
	                  height: 'min(500px, calc(100vh - 160px))',
	                  minHeight: 430,
	                  position: 'relative',
	                  borderRadius: 28,
	                  overflow: 'hidden',
	                  touchAction: 'pan-y',
	                }}
	              >
	              <div
	                style={{
	                  position: 'absolute',
	                  inset: 0,
	                  transform: `translate3d(${-skillWallTrackIndex * 100}%, 0, 0)`,
	                  transition: skillWallTransitionEnabled ? `transform ${skillWallTransitionMs}ms cubic-bezier(0.22, 1, 0.36, 1)` : 'none',
	                  willChange: 'transform',
	                }}
	              >
              <div
                style={{
                  position: 'absolute',
                  left: skillWallTrackIndex > skillWalls.length - 1 ? '300%' : '0%',
                  top: 0,
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                }}
              >
              <section
                style={{
                  position: 'relative',
                  zIndex: 2,
                  width: '61%',
                  height: '100%',
                  padding: '46px 52px 38px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: 11, letterSpacing: 4, color: 'rgba(255,255,255,0.62)', textTransform: 'uppercase', marginBottom: 14 }}>
                    SOFTWARE SKILLS / {selectedSkill.label}
                  </div>
                  <h2
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: 'clamp(42px, 5vw, 62px)',
                      fontWeight: 700,
                      color: 'white',
                      margin: '0 0 18px',
                      lineHeight: 1,
                    }}
                  >
                    {selectedSkill.title}
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.86)', fontSize: 13.2, lineHeight: 1.85, maxWidth: 620, margin: 0, fontWeight: 500 }}>
                    {selectedSkill.desc}
                  </p>
                </div>

                <div>
                  <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.42)', marginBottom: 22 }} />
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 13 }}>
                    {skillGroups.map((skill, i) => {
                      const active = activeSkill === i
                      return (
                        <button
                          key={skill.id}
                          onClick={() => selectSkill(i)}
                          aria-label={skill.title}
                          title={skill.title}
                          style={{
                            width: 92,
                            height: 112,
                            border: 'none',
                            padding: 0,
                            background: 'transparent',
                            cursor: 'pointer',
                            position: 'relative',
                            outline: 'none',
                            opacity: active ? 1 : 0.82,
                            transform: active ? 'translateY(-8px) scale(1.06)' : 'translateY(0) scale(1)',
                            transition: 'transform 0.26s ease, opacity 0.22s ease, filter 0.22s ease',
                            filter: active ? 'drop-shadow(0 16px 18px rgba(92,37,6,0.24))' : 'drop-shadow(0 8px 10px rgba(92,37,6,0.12))',
                          }}
                        >
                          <LiquidFolderIcon active={active} accent={skill.color} label={skill.title} />
                        </button>
                      )
                    })}
                  </div>
                </div>
              </section>

              <div
                style={{
                  position: 'absolute',
                  right: 58,
                  top: 74,
                  width: 318,
                  height: 332,
                  zIndex: 3,
                }}
              >
                {selectedSkill.apps.map((app, i) => {
                  const spreadSlot = selectedAppSlots[i] ?? appSpreadSlots[i % appSpreadSlots.length]
                  const collapsedLeft = 136 + i * 5
                  const collapsedTop = 154 + i * 4

                  return (
                    <div
                      key={`${selectedSkill.id}-${app.name}`}
                      style={{
                        position: 'absolute',
                        left: skillAppsExpanded ? spreadSlot.left : collapsedLeft,
                        top: skillAppsExpanded ? spreadSlot.top : collapsedTop,
                        width: 70,
                        height: 82,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: 6,
                        zIndex: skillAppsExpanded ? 6 + i : 1,
                        opacity: skillAppsExpanded ? 1 : 0.24,
                        pointerEvents: skillAppsExpanded ? 'auto' : 'none',
                        transform: skillAppsExpanded
                          ? `translate3d(0, 0, 0) rotate(${spreadSlot.rotation}deg) scale(1)`
                          : `translate3d(0, 20px, 0) rotate(${-18 + i * 11}deg) scale(0.58)`,
                        transformOrigin: '50% 110%',
                        transition: `left 460ms cubic-bezier(0.16, 1.2, 0.3, 1) ${i * 34}ms, top 460ms cubic-bezier(0.16, 1.2, 0.3, 1) ${i * 34}ms, opacity 240ms ease ${i * 26}ms, transform 480ms cubic-bezier(0.16, 1.2, 0.32, 1) ${i * 34}ms, filter 260ms ease`,
                        filter: skillAppsExpanded
                          ? 'drop-shadow(0 16px 18px rgba(82,31,4,0.2))'
                          : 'drop-shadow(0 10px 14px rgba(82,31,4,0.08))',
                      }}
                    >
                      <span
                        style={{
                          width: 60,
                          height: 60,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'visible',
                        }}
                      >
                        <img
                          src={app.icon}
                          alt=""
                          style={{
                            width: appIconSize,
                            height: appIconSize,
                            objectFit: 'contain',
                            display: 'block',
                            filter: 'drop-shadow(0 6px 9px rgba(74,28,4,0.2))',
                          }}
                          onError={(event) => {
                            event.currentTarget.style.display = 'none'
                            const fallback = event.currentTarget.nextElementSibling as HTMLElement | null
                            if (fallback) fallback.style.display = 'flex'
                          }}
                        />
                        <span
                          style={{
                            display: 'none',
                            width: 48,
                            height: 48,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 12,
                            background: app.color,
                            color: 'white',
                            fontSize: app.fallback.length > 1 ? 13 : 19,
                            fontWeight: 800,
                            boxShadow: '0 8px 14px rgba(74,28,4,0.16)',
                          }}
                        >
                          {app.fallback}
                        </span>
                      </span>
                      <span
                        style={{
                          color: 'rgba(255,255,255,0.9)',
                          fontSize: 10.5,
                          fontWeight: 800,
                          textAlign: 'center',
                          lineHeight: 1.12,
                          textShadow: '0 2px 8px rgba(82,31,4,0.32)',
                          maxWidth: 84,
                        }}
                      >
                        {app.name}
                      </span>
                    </div>
                  )
                })}

                <button
                  key={`${selectedSkill.id}-folder`}
                  type="button"
                  onClick={() => setSkillAppsExpanded((expanded) => !expanded)}
                  aria-label={skillAppsExpanded ? `收起${selectedSkill.title}应用` : `展开${selectedSkill.title}应用`}
                  style={{
                    position: 'absolute',
                    right: 18,
                    top: skillAppsExpanded ? (selectedSkill.apps.length === 4 ? 146 : 112) : 92,
                    width: 246,
                    height: 186,
                    border: 'none',
                    padding: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                    zIndex: 4,
                    outline: 'none',
                    WebkitTapHighlightColor: 'transparent',
                    transform: skillAppsExpanded
                      ? 'perspective(720px) rotateX(9deg) rotateY(13deg) rotateZ(-4deg) translate3d(-6px, 14px, 0)'
                      : 'perspective(720px) rotateX(5deg) rotateY(-10deg) translate3d(0, 0, 0)',
                    transformOrigin: '46% 70%',
                    transition: 'top 340ms cubic-bezier(0.2, 0.9, 0.22, 1), transform 420ms cubic-bezier(0.16, 1.12, 0.32, 1), filter 240ms ease',
                    filter: skillAppsExpanded
                      ? 'drop-shadow(0 26px 28px rgba(82,31,4,0.18))'
                      : 'drop-shadow(0 16px 20px rgba(82,31,4,0.12))',
                  }}
                >
                  <LargeLiquidFolder accent={selectedSkill.color} title={selectedSkill.title} />
                </button>
              </div>

		              <div
		                style={{
		                  position: 'absolute',
		                  right: 56,
	                  bottom: 42,
	                  width: 260,
	                  height: 38,
	                  borderRadius: '50%',
	                  background: 'radial-gradient(ellipse, rgba(92,37,6,0.13) 0%, rgba(92,37,6,0.05) 48%, transparent 72%)',
	                  filter: 'blur(6px)',
		                  zIndex: 1,
		                }}
			              />
              </div>

		              <div
		                style={{
		                  position: 'absolute',
	                  left: '100%',
	                  top: 0,
	                  width: '100%',
	                  height: '100%',
		                  overflow: 'hidden',
		                }}
		              >
		                <div
		                  data-allow-scroll="true"
		                  style={{
		                    position: 'absolute',
		                    left: 12,
		                    right: 12,
		                    top: 48,
		                    bottom: 48,
		                    zIndex: 3,
		                    overflow: 'hidden',
		                    borderRadius: 22,
		                    WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 1.5%, black 98.5%, transparent 100%)',
		                    maskImage: 'linear-gradient(90deg, transparent 0%, black 1.5%, black 98.5%, transparent 100%)',
		                  }}
		                >
		                  <ReadingShelf3D active={page === 'skills' && activeSkillWall === 1} books={readingShelfBooks} />
		                </div>
	              </div>

	              <div
	                style={{
	                  position: 'absolute',
	                  left: skillWallTrackIndex < 0 ? '-100%' : '200%',
	                  top: 0,
	                  width: '100%',
	                  height: '100%',
		                  overflow: 'hidden',
		                }}
		              >
			                <section
	                  style={{
	                    position: 'relative',
	                    zIndex: 2,
	                    width: '47%',
	                    height: '100%',
	                    padding: '46px 52px 38px',
	                    display: 'flex',
	                    flexDirection: 'column',
	                    justifyContent: 'space-between',
	                  }}
	                >
	                  <div>
	                    <div style={{ fontSize: 11, letterSpacing: 4, color: 'rgba(255,255,255,0.62)', textTransform: 'uppercase', marginBottom: 14 }}>
	                      THOUGHT NOTES / STICKY WALL
	                    </div>
	                    <h2
	                      style={{
	                        fontFamily: "'Oswald', sans-serif",
	                        fontSize: 'clamp(42px, 5vw, 62px)',
	                        fontWeight: 700,
	                        color: 'white',
	                        margin: '0 0 18px',
	                        lineHeight: 1,
	                      }}
	                    >
	                      观点见解
	                    </h2>
	                    <p style={{ color: 'rgba(255,255,255,0.86)', fontSize: 13.2, lineHeight: 1.85, maxWidth: 520, margin: 0, fontWeight: 500 }}>
	                      我会把对产品、AI、学习和工具的观察先写成短句，再不断用项目实践验证它们。这里更像一面便利贴墙，保留那些值得反复提醒自己的判断。
	                    </p>
	                  </div>

	                  <div>
	                    <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.42)', marginBottom: 18 }} />
	                    <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 12, lineHeight: 1.7, maxWidth: 420, margin: 0, fontWeight: 600 }}>
	                      把抽象想法写成一句能执行的话，再回到作品里检验。
	                    </p>
	                  </div>
	                </section>

	                <div
	                  style={{
	                    position: 'absolute',
	                    right: 52,
	                    top: 62,
	                    width: 450,
	                    height: 350,
	                    zIndex: 3,
	                  }}
	                >
	                  {insightNotes.map((note, i) => {
	                    const slot = insightNoteSlots[i]
	                    return (
	                      <div
	                        key={note.title}
	                        style={{
	                          position: 'absolute',
	                          left: slot.left,
	                          top: slot.top,
	                          width: 132,
	                          minHeight: 124,
	                          padding: '18px 16px 16px',
	                          borderRadius: 9,
	                          background: 'linear-gradient(160deg, rgba(255,246,184,0.88), rgba(255,178,84,0.72))',
	                          border: '1px solid rgba(255,255,255,0.42)',
	                          boxShadow: '0 22px 26px rgba(82,31,4,0.2), inset 0 1px 0 rgba(255,255,255,0.44)',
	                          color: 'rgba(93,39,6,0.88)',
	                          transform: `rotate(${note.rotation}deg)`,
	                        }}
	                      >
	                        <div
	                          style={{
	                            position: 'absolute',
	                            left: '50%',
	                            top: -10,
	                            width: 46,
	                            height: 18,
	                            borderRadius: 5,
	                            background: 'rgba(255,255,255,0.34)',
	                            border: '1px solid rgba(255,255,255,0.24)',
	                            transform: 'translateX(-50%)',
	                          }}
	                        />
	                        <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>{note.title}</div>
	                        <div style={{ fontSize: 11.2, lineHeight: 1.48, fontWeight: 700 }}>{note.note}</div>
	                      </div>
	                    )
	                  })}
	                </div>
	              </div>
	              </div>

		            </div>
	            </LiquidGlass>
	            <div
	              style={{
	                position: 'absolute',
	                left: '50%',
	                top: 'calc(50% + max(215px, min(250px, calc((100vh - 160px) / 2))) + 28px)',
	                transform: 'translateX(-50%)',
	                zIndex: 8,
	                display: 'flex',
	                flexDirection: 'column',
	                alignItems: 'center',
	                gap: 9,
	                pointerEvents: 'none',
	              }}
	            >
	              <div
	                aria-hidden="true"
	                style={{
	                  display: 'flex',
	                  alignItems: 'center',
	                  justifyContent: 'center',
	                  gap: 9,
	                }}
	              >
	                {skillWalls.map((wall, index) => {
	                  const active = activeSkillWall === index
	                  return (
	                    <span
	                      key={wall.title}
	                      style={{
	                        width: 8,
	                        height: 8,
	                        borderRadius: 999,
	                        background: active ? 'rgba(255,255,255,0.94)' : 'rgba(255,255,255,0.38)',
	                        transition: 'background 220ms ease',
	                      }}
	                    />
	                  )
	                })}
	              </div>
	              <div
	                style={{
	                  color: 'rgba(255,255,255,0.76)',
	                  fontSize: 13,
	                  fontWeight: 800,
	                  lineHeight: 1.4,
	                  textShadow: '0 2px 10px rgba(82,31,4,0.26)',
	                  whiteSpace: 'nowrap',
	                }}
	              >
	                滚动鼠标滚轮切换下一页
	              </div>
	            </div>
		          </div>
        </div>
      )}

      <HomeGlbModel
        active={page === 'home'}
        style={{
          top: 54,
          left: '43%',
          right: '-5%',
          bottom: 0,
          opacity: page === 'home' ? 1 : 0,
          visibility: page === 'home' ? 'visible' : 'hidden',
          transition: 'opacity 160ms ease',
        }}
      />
    </div>
  )
}
