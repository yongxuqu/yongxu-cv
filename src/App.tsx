import { type CSSProperties, useEffect, useRef, useState } from 'react'
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
const pageSequence: Page[] = ['home', 'videos', 'skills']
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
    desc: '使用 Xcode 完成移动端应用开发与调试，独立推进 ColorLog、LimU AI 两款 App 从需求分析、功能设计、前后端开发到测试上架的完整流程，也能把家装报价这种具体业务流程做成可运行工具。',
    tools: ['Xcode', '移动端开发', '前后端开发', '测试上架'],
    apps: [
      { name: 'Xcode', icon: '/icons/xcode.png', fallback: 'X', color: '#147efb' },
      { name: 'App Store', icon: '/icons/appstore.png', fallback: 'A', color: '#1f9cff' },
      { name: 'Swift', icon: 'https://cdn.simpleicons.org/swift', fallback: 'S', color: '#f05138' },
    ],
    color: '#ff8d30',
  },
  {
    id: 'ai',
    title: 'AI工具',
    label: 'AI TOOLCHAIN',
    metric: 'Claude Code / Codex / Cursor',
    desc: '熟悉用 AI 工具进行需求拆解、方案设计、代码实现与迭代调试，把想法快速变成可运行产品。当前工作方式以 Claude Code、Codex、Cursor 为核心，强调产品判断、实现速度和持续验证。',
    tools: ['Claude Code', 'Codex', 'Cursor', '快速原型'],
    apps: [
      { name: 'Claude Code', icon: 'https://cdn.simpleicons.org/claudecode', fallback: 'C', color: '#d97745' },
      { name: 'Codex', icon: '/icons/codex.png', fallback: 'Cd', color: '#101010' },
      { name: 'Cursor', icon: 'https://cdn.simpleicons.org/cursor', fallback: 'Cu', color: '#2f3138' },
    ],
    color: '#f26a1b',
  },
  {
    id: 'content',
    title: '设计',
    label: 'DESIGN',
    metric: 'Figma / PS / LR',
    desc: '具备设计表达和素材处理能力，使用 Figma 完成界面和视觉方案，使用 Photoshop、Lightroom 处理图片素材，也能配合内容运营完成封面、海报、视频视觉和数据复盘。',
    tools: ['Figma', 'Photoshop', 'Lightroom', '视觉设计'],
    apps: [
      { name: 'Figma', icon: '/icons/figma.png', fallback: 'F', color: '#a259ff' },
      { name: 'Photoshop', icon: 'https://www.svgrepo.com/show/91986/adobe-photoshop-logo.svg', fallback: 'Ps', color: '#001e36' },
      { name: 'Lightroom', icon: 'https://www.svgrepo.com/show/369710/adobe-lightroom.svg', fallback: 'Lr', color: '#001e36' },
    ],
    color: '#f08a24',
  },
  {
    id: 'engineering',
    title: '建模',
    label: 'MODELING',
    metric: 'SolidWorks / AutoCAD',
    desc: '掌握 SolidWorks、AutoCAD 等建模与工程表达工具，能够配合材料、实验和家装场景完成结构理解、尺寸整理、图纸表达和方案沟通。',
    tools: ['SolidWorks', 'AutoCAD', '尺寸整理', '图纸表达'],
    apps: [
      { name: 'SolidWorks', icon: 'https://www.svgrepo.com/show/508968/solidworks.svg', fallback: 'SW', color: '#d71920' },
      { name: 'AutoCAD', icon: 'https://cdn.simpleicons.org/autocad', fallback: 'A', color: '#df2027' },
    ],
    color: '#d8661a',
  },
  {
    id: 'office',
    title: '办公',
    label: 'OFFICE',
    metric: 'Office / Xmind',
    desc: '熟悉 Office 和 Xmind，能完成项目文档、竞赛材料、PPT 汇报、宣传稿件和结构化思维梳理，把复杂信息整理成清晰可执行的方案。',
    tools: ['Office', 'Xmind', 'PPT', '文档整理'],
    apps: [
      { name: 'Office', icon: 'https://www.svgrepo.com/show/303162/office-365-logo.svg', fallback: 'O', color: '#d83b01' },
      { name: 'Xmind', icon: 'https://icons.iconarchive.com/icons/papirus-team/papirus-apps/128/xmind-icon.png', fallback: 'X', color: '#0f9d58' },
      { name: 'PowerPoint', icon: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/PowerPoint_Logo_2025.svg', fallback: 'P', color: '#c43e1c' },
    ],
    color: '#ad4c14',
  },
]

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
          left: 31,
          bottom: 29,
          fontFamily: "'Oswald', sans-serif",
          fontSize: 42,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.94)',
          textShadow: '0 8px 22px rgba(92,37,6,0.2)',
        }}
      >
        {title}
      </div>
    </div>
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
  const pageRef = useRef<Page>('home')
  const wheelAccumRef = useRef(0)
  const wheelLockRef = useRef(false)
  const wheelResetTimerRef = useRef<number | null>(null)
  const wheelLockTimerRef = useRef<number | null>(null)
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
    const normalizeWheelDelta = (event: WheelEvent) => {
      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 16
      if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * window.innerHeight
      return event.deltaY
    }

    const switchByDirection = (direction: -1 | 1) => {
      wheelAccumRef.current = 0
      const currentIndex = pageSequence.indexOf(pageRef.current)
      const nextPage = pageSequence[Math.min(Math.max(currentIndex + direction, 0), pageSequence.length - 1)]
      if (!nextPage || nextPage === pageRef.current) return

      pendingWheelDirectionRef.current = 0
      lastWheelDirectionRef.current = direction
      wheelLockRef.current = true
      goToPage(nextPage)

      if (wheelLockTimerRef.current !== null) {
        window.clearTimeout(wheelLockTimerRef.current)
      }
      wheelLockTimerRef.current = window.setTimeout(() => {
        wheelLockRef.current = false
        wheelLockTimerRef.current = null

        const pendingDirection = pendingWheelDirectionRef.current
        pendingWheelDirectionRef.current = 0
        if (pendingDirection !== 0) {
          switchByDirection(pendingDirection)
        }
      }, wheelSwitchLockMs)
    }

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return

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

      switchByDirection(wheelAccumRef.current > 0 ? 1 : -1)
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
          displacementScale={42}
          blurAmount={0.08}
          saturation={150}
          aberrationIntensity={1.6}
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
              background: `radial-gradient(ellipse at 50% 102%, ${selectedSkill.color} 0%, rgba(255,139,42,0.84) 24%, ${hoodieOrangeDeep} 62%, ${hoodieOrangeDark} 100%)`,
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
            <LiquidGlass
              displacementScale={76}
              blurAmount={0.045}
              saturation={165}
              aberrationIntensity={2.2}
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
                style={{
                  width: 'min(1088px, calc(100vw - 80px))',
                  height: 'min(500px, calc(100vh - 160px))',
                  minHeight: 430,
                  position: 'relative',
                  borderRadius: 28,
                  overflow: 'hidden',
                }}
              >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(ellipse at 74% 38%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 42%, transparent 72%), linear-gradient(180deg, rgba(255,255,255,0.08), rgba(119,49,10,0.06))',
                  pointerEvents: 'none',
                }}
              />

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
                      textShadow: '0 8px 24px rgba(92,37,6,0.2)',
                    }}
                  >
                    {selectedSkill.title}
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.86)', fontSize: 13.2, lineHeight: 1.85, maxWidth: 620, margin: '0 0 20px', fontWeight: 500 }}>
                    {selectedSkill.desc}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, maxWidth: 560 }}>
                    {selectedSkill.tools.map((tool) => (
                      <span
                        key={tool}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          minHeight: 30,
                          padding: '7px 11px',
                          borderRadius: 999,
                          background: 'rgba(255,255,255,0.16)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: 'rgba(255,255,255,0.9)',
                          fontSize: 11.5,
                          fontWeight: 600,
                        }}
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.42)', marginBottom: 22 }} />
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 22 }}>
                    {skillGroups.map((skill, i) => {
                      const active = activeSkill === i
                      return (
                        <button
                          key={skill.id}
                          onClick={() => setActiveSkill(i)}
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
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  right: 58,
                  top: 74,
                  width: 318,
                  height: 332,
                  zIndex: 3,
                }}
              >
                <div
                  key={`${selectedSkill.id}-folder`}
                  style={{
                    position: 'absolute',
                    right: 18,
                    top: 92,
                    width: 246,
                    height: 186,
                    transform: 'perspective(720px) rotateX(5deg) rotateY(-10deg)',
                    transition: 'transform 0.32s ease',
                  }}
                >
                  <LargeLiquidFolder accent={selectedSkill.color} title={selectedSkill.title} />
                </div>

                {selectedSkill.apps.map((app, i) => (
                  <div
                    key={`${selectedSkill.id}-${app.name}`}
                    style={{
                      position: 'absolute',
                      right: i % 2 === 0 ? 20 + i * 26 : 132 + i * 12,
                      top: 14 + i * 72,
                      width: 72,
                      height: 82,
                      borderRadius: 18,
                      background: 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.38)',
                      backdropFilter: 'blur(18px) saturate(160%)',
                      WebkitBackdropFilter: 'blur(18px) saturate(160%)',
                      boxShadow: '0 18px 30px rgba(82,31,4,0.16), inset 0 1px 0 rgba(255,255,255,0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 7,
                      transform: `translate3d(0, 0, 0) rotate(${i % 2 === 0 ? -5 : 6}deg)`,
                      animation: `page-enter-up ${360 + i * 80}ms cubic-bezier(0.22, 1, 0.36, 1) both`,
                    }}
                  >
                    <span
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: 'rgba(255,255,255,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 8px 16px rgba(0,0,0,0.14)',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={app.icon}
                        alt=""
                        style={{
                          width: 30,
                          height: 30,
                          objectFit: 'contain',
                          display: 'block',
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
                          width: '100%',
                          height: '100%',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 12,
                          background: app.color,
                          color: 'white',
                          fontSize: app.fallback.length > 1 ? 13 : 19,
                          fontWeight: 800,
                        }}
                      >
                        {app.fallback}
                      </span>
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.88)', fontSize: 10.5, fontWeight: 700, textAlign: 'center', lineHeight: 1.15 }}>
                      {app.name}
                    </span>
                  </div>
                ))}
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
            </LiquidGlass>
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
