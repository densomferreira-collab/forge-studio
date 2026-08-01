
import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const initialProjects = [
  { id: 1, name: 'Porta-copo Mundial', status: 'Concluído', time: 'Hoje, 18:42', icon: '🏆' },
  { id: 2, name: 'Vaso geométrico', status: 'Concluído', time: 'Ontem, 21:17', icon: '🏺' },
  { id: 3, name: 'Suporte 473 ml', status: 'Rascunho', time: '28 jul, 16:03', icon: '🥤' },
]

const steps = [
  'Analisando imagens',
  'Estimando profundidade',
  'Reconstruindo geometria',
  'Fechando a malha',
  'Ajustando espessuras',
  'Preparando o STL',
]

function Icon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
  const paths = {
    home: <><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    folder: <><path d="M3.5 6.5h6l2 2H20.5v10h-17z"/></>,
    cube: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
    upload: <><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 14v5h14v-5"/></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m4 17 4.5-4 3 2.5 3.5-4 5 5"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    download: <><path d="M12 4v11"/><path d="m7.5 11.5 4.5 4.5 4.5-4.5"/><path d="M5 20h14"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  }
  return <svg {...common}>{paths[name]}</svg>
}

function RealSTLViewer({ mode = 'Sólido' }) {
  const mountRef = useRef(null)
  const rendererRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0b0f18)

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 2000)
    camera.position.set(115, 90, 145)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer
    mount.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.autoRotate = true
    controls.autoRotateSpeed = 1.4
    controls.enablePan = false
    controls.minDistance = 90
    controls.maxDistance = 330
    controls.target.set(0, 0, 4)

    scene.add(new THREE.HemisphereLight(0xb9c8ff, 0x151020, 2.5))
    const key = new THREE.DirectionalLight(0xdcc8ff, 4.2)
    key.position.set(80, 120, 100)
    key.castShadow = true
    scene.add(key)
    const rim = new THREE.DirectionalLight(0x6c7dff, 3)
    rim.position.set(-110, 55, -70)
    scene.add(rim)
    const fill = new THREE.PointLight(0x9a5cff, 55, 260)
    fill.position.set(20, 15, 90)
    scene.add(fill)

    const grid = new THREE.GridHelper(300, 30, 0x493880, 0x20273a)
    grid.position.y = -53
    grid.material.opacity = 0.28
    grid.material.transparent = true
    scene.add(grid)

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(120, 64),
      new THREE.MeshStandardMaterial({ color: 0x111625, roughness: 0.95, metalness: 0.05 })
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -52.5
    floor.receiveShadow = true
    scene.add(floor)

    let mesh
    let disposed = false
    const loader = new STLLoader()
    loader.load('/models/copa-do-mundo.stl', geometry => {
      if (disposed) return
      geometry.computeVertexNormals()
      geometry.center()
      const box = new THREE.Box3().setFromBufferAttribute(geometry.attributes.position)
      const size = new THREE.Vector3()
      box.getSize(size)
      const scale = 105 / Math.max(size.x, size.y, size.z)
      geometry.scale(scale, scale, scale)
      geometry.rotateX(-Math.PI / 2)
      geometry.computeBoundingBox()
      const postBox = geometry.boundingBox
      geometry.translate(0, -(postBox.min.y + 52), 0)

      const wireframe = mode === 'Malha'
      const xray = mode === 'Raio-X'
      const material = new THREE.MeshPhysicalMaterial({
        color: wireframe ? 0x66d7ff : 0x8c68e8,
        roughness: wireframe ? 0.55 : 0.22,
        metalness: wireframe ? 0.15 : 0.72,
        clearcoat: 0.65,
        clearcoatRoughness: 0.2,
        wireframe,
        transparent: xray,
        opacity: xray ? 0.38 : 1,
        side: xray ? THREE.DoubleSide : THREE.FrontSide,
      })
      mesh = new THREE.Mesh(geometry, material)
      mesh.castShadow = true
      mesh.receiveShadow = true
      scene.add(mesh)
    })

    const resize = () => {
      const width = mount.clientWidth || 640
      const height = mount.clientHeight || 560
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(mount)

    let frame
    const animate = () => {
      controls.update()
      renderer.render(scene, camera)
      frame = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      ro.disconnect()
      controls.dispose()
      scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
          mats.forEach(m => m.dispose())
        }
      })
      renderer.dispose()
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement)
    }
  }, [mode])

  return <div ref={mountRef} className="real-stl-viewer" aria-label="Visualizador 3D do modelo STL real" />
}

function App() {
  const [view, setView] = useState('home')
  const [projects, setProjects] = useState(initialProjects)
  const [files, setFiles] = useState([])
  const [stage, setStage] = useState('upload')
  const [progress, setProgress] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)
  const [projectName, setProjectName] = useState('Novo porta-copo')
  const [objectType, setObjectType] = useState('Suporte para copo')
  const [height, setHeight] = useState('250')
  const [mobileOpen, setMobileOpen] = useState(false)
  const inputRef = useRef(null)

  const selectedProject = useMemo(() => projects[0], [projects])

  const acceptFiles = async (list) => {
    const selected = Array.from(list).filter(f => f.type.startsWith('image/')).slice(0, 8)
    if (!selected.length) return

    const next = await Promise.all(selected.map(file => new Promise(resolve => {
      const url = URL.createObjectURL(file)
      const image = new Image()
      image.onload = () => resolve({
        file,
        url,
        name: file.name,
        size: file.size,
        width: image.naturalWidth,
        height: image.naturalHeight,
      })
      image.onerror = () => resolve({ file, url, name: file.name, size: file.size, width: 0, height: 0 })
      image.src = url
    })))

    setFiles(next)
    setStage('configure')
  }

  const generate = () => {
    setStage('processing')
    setProgress(0)
    setStepIndex(0)
    let value = 0
    const timer = setInterval(() => {
      value += Math.floor(Math.random() * 8) + 4
      if (value >= 100) {
        value = 100
        clearInterval(timer)
        setProgress(100)
        setStepIndex(steps.length - 1)
        setTimeout(() => {
          setStage('result')
          setProjects(prev => [
            { id: Date.now(), name: projectName || 'Novo modelo', status: 'Concluído', time: 'Agora', icon: objectType.includes('copo') ? '🥤' : '🧊' },
            ...prev,
          ])
        }, 650)
      } else {
        setProgress(value)
        setStepIndex(Math.min(steps.length - 1, Math.floor(value / (100 / steps.length))))
      }
    }, 240)
  }

  const resetProject = () => {
    setFiles([])
    setStage('upload')
    setProgress(0)
    setView('new')
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">F</div>
          <div><strong>Forge Studio</strong><span>PROTÓTIPO BETA</span></div>
          <button className="mobile-close" onClick={() => setMobileOpen(false)}><Icon name="close"/></button>
        </div>

        <button className="new-project" onClick={() => { resetProject(); setMobileOpen(false) }}>
          <Icon name="plus"/> Novo projeto
        </button>

        <nav className="side-nav">
          <button className={view === 'home' ? 'active' : ''} onClick={() => { setView('home'); setMobileOpen(false) }}><Icon name="home"/> Início</button>
          <button className={view === 'projects' ? 'active' : ''} onClick={() => { setView('projects'); setMobileOpen(false) }}><Icon name="folder"/> Projetos</button>
          <button className={view === 'library' ? 'active' : ''} onClick={() => { setView('library'); setMobileOpen(false) }}><Icon name="cube"/> Biblioteca 3D</button>
        </nav>

        <div className="sidebar-section">
          <p>RECENTES</p>
          {projects.slice(0, 3).map(p => (
            <button key={p.id} className="recent-item" onClick={() => { setView('projects'); setMobileOpen(false) }}>
              <span>{p.icon}</span><div><strong>{p.name}</strong><small>{p.time}</small></div>
            </button>
          ))}
        </div>

        <div className="sidebar-bottom">
          <button><Icon name="settings"/> Configurações</button>
          <div className="profile">
            <div className="avatar">MF</div>
            <div><strong>Marlon Ferreira</strong><span>Acesso de demonstração</span></div>
            <span>•••</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setMobileOpen(true)}><Icon name="menu"/></button>
          <div>
            <span className="crumb">Forge Studio</span>
            <Icon name="chevron" size={14}/>
            <strong>{view === 'new' ? 'Novo projeto' : view === 'projects' ? 'Projetos' : view === 'library' ? 'Biblioteca 3D' : 'Visão geral'}</strong>
          </div>
          <div className="top-actions">
            <span className="status-dot">Sistema operacional</span>
            <button className="ghost-btn">Ajuda</button>
          </div>
        </header>

        <section className="content">
          {view === 'home' && <Home projects={projects} onNew={resetProject} setView={setView}/>}
          {view === 'new' && (
            <NewProject
              stage={stage}
              files={files}
              inputRef={inputRef}
              acceptFiles={acceptFiles}
              projectName={projectName}
              setProjectName={setProjectName}
              objectType={objectType}
              setObjectType={setObjectType}
              height={height}
              setHeight={setHeight}
              generate={generate}
              progress={progress}
              stepIndex={stepIndex}
              resetProject={resetProject}
            />
          )}
          {view === 'projects' && <Projects projects={projects} onNew={resetProject}/>}
          {view === 'library' && <Library/>}
        </section>
      </main>
    </div>
  )
}

function Home({ projects, onNew, setView }) {
  return (
    <div className="page">
      <div className="welcome-row">
        <div>
          <span className="eyebrow">PAINEL DE CRIAÇÃO 3D</span>
          <h1>Boa noite, Marlon.</h1>
          <p>Transforme imagens de referência em uma demonstração de modelo 3D pronta para apresentar.</p>
        </div>
        <button className="primary-btn" onClick={onNew}><Icon name="plus"/> Criar novo projeto</button>
      </div>

      <div className="stats-grid">
        <article><span>Projetos criados</span><strong>{projects.length}</strong><small>+1 nesta semana</small></article>
        <article><span>Modelos concluídos</span><strong>{projects.filter(p => p.status === 'Concluído').length}</strong><small>Taxa de sucesso 100%</small></article>
        <article><span>Tempo economizado</span><strong>14h</strong><small>Estimativa do protótipo</small></article>
        <article><span>Créditos beta</span><strong>92</strong><small>Renovação em 12 dias</small></article>
      </div>

      <div className="home-grid">
        <article className="quick-card">
          <div className="card-heading"><div><span className="eyebrow">COMEÇAR AGORA</span><h2>Novo modelo por imagens</h2></div><div className="glow-icon"><Icon name="cube" size={28}/></div></div>
          <p>Envie fotos de frente, laterais, traseira e topo. O protótipo simula o processamento e exibe um resultado 3D.</p>
          <div className="flow-line"><span>📷 Fotos</span><b>→</b><span>◆ Reconstrução</span><b>→</b><span>🧊 STL</span></div>
          <button className="primary-btn full" onClick={onNew}>Começar projeto <Icon name="chevron"/></button>
        </article>

        <article className="activity-card">
          <div className="section-title"><div><span className="eyebrow">ATIVIDADE</span><h2>Projetos recentes</h2></div><button onClick={() => setView('projects')}>Ver todos</button></div>
          <div className="activity-list">
            {projects.slice(0, 3).map(p => (
              <div className="activity-item" key={p.id}>
                <div className="project-icon">{p.icon}</div>
                <div><strong>{p.name}</strong><span>{p.time}</span></div>
                <em className={p.status === 'Concluído' ? 'done' : ''}>{p.status}</em>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="insight-card">
        <div>
          <span className="eyebrow">PRONTO PARA APRESENTAR</span>
          <h2>Mostre a experiência, sem afirmar que a geração real já está pronta.</h2>
          <p>Este painel é um protótipo navegável para validar interesse de clientes. O processamento e o download são demonstrativos.</p>
        </div>
        <div className="mini-model"><div className="model-body"></div><div className="model-stem"></div><div className="model-base"></div></div>
      </article>
    </div>
  )
}

function NewProject({ stage, files, inputRef, acceptFiles, projectName, setProjectName, objectType, setObjectType, height, setHeight, generate, progress, stepIndex, resetProject }) {
  const onDrop = (e) => {
    e.preventDefault()
    acceptFiles(e.dataTransfer.files)
  }

  return (
    <div className="page project-page">
      <div className="project-header">
        <div><span className="eyebrow">NOVO PROJETO</span><h1>{stage === 'result' ? 'Seu modelo está pronto.' : 'Crie uma nova demonstração 3D.'}</h1><p>Fluxo navegável para apresentar a proposta do Forge Studio.</p></div>
        {stage !== 'upload' && <button className="ghost-btn bordered" onClick={resetProject}>Recomeçar</button>}
      </div>

      {stage === 'upload' && (
        <div className="upload-layout">
          <div className="upload-zone"
            onDragOver={e => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}>
            <input ref={inputRef} type="file" multiple accept="image/*" hidden onChange={e => acceptFiles(e.target.files)}/>
            <div className="upload-symbol"><Icon name="upload" size={30}/></div>
            <h2>Arraste as fotos do objeto aqui</h2>
            <p>Use de 4 a 8 imagens com ângulos diferentes para uma demonstração mais convincente.</p>
            <button className="primary-btn" type="button"><Icon name="image"/> Selecionar imagens</button>
            <small>JPG, PNG e WEBP · até 8 arquivos</small>
          </div>
          <div className="tips-card">
            <span className="eyebrow">FOTOS RECOMENDADAS</span>
            {['Frente do objeto', 'Traseira', 'Lado esquerdo', 'Lado direito', 'Vista superior'].map((t, i) => <div key={t}><b>{i + 1}</b><span>{t}</span></div>)}
          </div>
        </div>
      )}

      {stage === 'configure' && (
        <div className="config-layout">
          <div className="image-panel">
            <div className="section-title"><div><span className="eyebrow">REFERÊNCIAS</span><h2>{files.length} imagens adicionadas</h2></div><button onClick={() => inputRef.current?.click()}>Adicionar</button></div>
            <input ref={inputRef} type="file" multiple accept="image/*" hidden onChange={e => acceptFiles(e.target.files)}/>
            <div className="upload-summary">
              <div><strong>{files.length}</strong><span>fotos prontas</span></div>
              <div><strong>{(files.reduce((total, item) => total + item.size, 0) / 1024 / 1024).toFixed(1)} MB</strong><span>tamanho total</span></div>
              <div><strong>{files.filter(item => item.width >= 1000).length}/{files.length}</strong><span>alta resolução</span></div>
            </div>
            <div className="thumb-grid">
              {files.map((f, i) => (
                <div className="thumb-card" key={`${f.name}-${i}`}>
                  <div className="thumb"><img src={f.url} alt={f.name}/><span>{i + 1}</span><i>✓</i></div>
                  <div className="thumb-info">
                    <strong title={f.name}>{f.name}</strong>
                    <small>{f.width && f.height ? `${f.width} × ${f.height}px` : 'Resolução indisponível'} · {(f.size / 1024 / 1024).toFixed(1)} MB</small>
                  </div>
                </div>
              ))}
            </div>
            <div className="photo-check">
              <b>Qualidade das referências</b>
              <span className={files.length >= 4 ? 'good' : 'warn'}>{files.length >= 4 ? 'Boa para demonstração' : 'Adicione pelo menos 4 fotos'}</span>
            </div>
          </div>

          <div className="settings-panel">
            <span className="eyebrow">CONFIGURAÇÃO</span>
            <h2>Dados do modelo</h2><p className="settings-help">Revise as imagens e informe uma medida real antes de continuar.</p>
            <label>Nome do projeto<input value={projectName} onChange={e => setProjectName(e.target.value)}/></label>
            <label>Tipo de objeto
              <select value={objectType} onChange={e => setObjectType(e.target.value)}>
                <option>Suporte para copo</option>
                <option>Troféu</option>
                <option>Vaso decorativo</option>
                <option>Boneco</option>
                <option>Peça mecânica</option>
              </select>
            </label>
            <label>Altura conhecida<div className="input-unit"><input type="number" value={height} onChange={e => setHeight(e.target.value)}/><span>mm</span></div></label>
            <div className="check-row"><Icon name="check"/><span>Otimizar para impressão FDM</span></div>
            <div className="check-row"><Icon name="check"/><span>Fechar automaticamente a malha</span></div>
            <button className="primary-btn full" onClick={generate}>Gerar demonstração 3D <Icon name="chevron"/></button>
          </div>
        </div>
      )}

      {stage === 'processing' && (
        <div className="processing-card">
          <div className="scan-stage">
            <div className="scan-grid"></div>
            <div className="floating-cube"><span></span><i></i><b></b></div>
            <div className="scanner"></div>
          </div>
          <div className="processing-info">
            <span className="eyebrow">PROCESSANDO PROJETO</span>
            <h2>{steps[stepIndex]}</h2>
            <p>Esta animação simula o fluxo do produto para apresentação comercial.</p>
            <div className="progress-head"><strong>{progress}%</strong><span>Etapa {stepIndex + 1} de {steps.length}</span></div>
            <div className="progress-bar"><span style={{ width: `${progress}%` }}></span></div>
            <div className="step-list">
              {steps.map((s, i) => <div className={i < stepIndex ? 'complete' : i === stepIndex ? 'current' : ''} key={s}><b>{i < stepIndex ? '✓' : i + 1}</b><span>{s}</span></div>)}
            </div>
          </div>
        </div>
      )}

      {stage === 'result' && <Result projectName={projectName} height={height}/>}
    </div>
  )
}

function Result({ projectName, height }) {
  const [mode, setMode] = useState('Sólido')
  const downloadDemo = () => {
    const text = `Forge Studio — arquivo demonstrativo\\nProjeto: ${projectName}\\nAltura: ${height} mm\\nEste arquivo comprova o funcionamento visual do protótipo.`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName.toLowerCase().replace(/\\s+/g, '-')}-demo.txt`
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <div className="result-layout">
      <div className="viewer-card">
        <div className="viewer-toolbar">
          <div>{['Sólido','Malha','Raio-X'].map(m => <button className={mode === m ? 'active' : ''} onClick={() => setMode(m)} key={m}>{m}</button>)}</div>
          <span>Arraste para rotacionar</span>
        </div>
        <div className="model-view real-view">
          <RealSTLViewer mode={mode} />
          <div className="real-model-badge"><span></span> STL real carregado</div>
          <div className="axis"><span>X</span><span>Y</span><span>Z</span></div>
        </div>
      </div>

      <div className="properties-card">
        <span className="eyebrow">RESULTADO</span>
        <h2>{projectName}</h2>
        <p>Modelo demonstrativo processado com sucesso.</p>
        <div className="health-score"><div><strong>98</strong><span>/100</span></div><p><b>Excelente para impressão</b><br/>Nenhum problema crítico detectado.</p></div>
        <div className="property-list">
          <div><span>Altura</span><strong>{height} mm</strong></div>
          <div><span>Largura estimada</span><strong>92 mm</strong></div>
          <div><span>Espessura mínima</span><strong>2,6 mm</strong></div>
          <div><span>Malha</span><strong className="green">Fechada</strong></div>
          <div><span>Formato</span><strong>STL / 3MF</strong></div>
          <div><span>Compatibilidade</span><strong>Bambu Studio</strong></div>
        </div>
        <div className="validation-list">
          {['Sem buracos na malha','Paredes verificadas','Escala aplicada','Base nivelada'].map(t => <div key={t}><Icon name="check"/><span>{t}</span></div>)}
        </div>
        <div className="beta-badge">DEMONSTRAÇÃO · RESULTADO SIMULADO</div>
        <button className="primary-btn full" onClick={downloadDemo}><Icon name="download"/> Baixar arquivo demonstrativo</button>
        <small className="prototype-note">Protótipo: o download real de STL será implementado após validação.</small>
      </div>
      <div className="compare-card">
        <div className="compare-head">
          <div><span className="eyebrow">VISÃO DO PRODUTO</span><h2>Referência → Modelo imprimível</h2></div>
          <span className="beta-pill">Beta demonstrativo</span>
        </div>
        <div className="compare-grid">
          <div className="compare-side">
            <span>01 · ENTRADA</span>
            <div className="reference-demo"><b>📷</b><strong>Fotos de referência</strong><small>Frente · Laterais · Traseira · Topo</small></div>
          </div>
          <div className="compare-arrow">→</div>
          <div className="compare-side">
            <span>02 · SAÍDA PLANEJADA</span>
            <div className="output-demo"><b>🧊</b><strong>Modelo 3D</strong><small>Escala · Malha · Preparação FDM</small></div>
          </div>
        </div>
        <p className="compare-note">Esta tela demonstra o fluxo pretendido. A reconstrução automática ainda não está implementada.</p>
      </div>
    </div>
  )
}

function Projects({ projects, onNew }) {
  return (
    <div className="page">
      <div className="welcome-row"><div><span className="eyebrow">ARQUIVOS</span><h1>Seus projetos</h1><p>Organize as demonstrações criadas no Forge Studio.</p></div><button className="primary-btn" onClick={onNew}><Icon name="plus"/> Novo projeto</button></div>
      <div className="projects-table">
        <div className="table-head"><span>Projeto</span><span>Status</span><span>Modificado</span><span></span></div>
        {projects.map(p => <div className="table-row" key={p.id}><div><div className="project-icon">{p.icon}</div><strong>{p.name}</strong></div><em className={p.status === 'Concluído' ? 'done' : ''}>{p.status}</em><span>{p.time}</span><button>•••</button></div>)}
      </div>
    </div>
  )
}

function Library() {
  const items = [
    ['🏆','Troféu clássico','Modelo de exemplo'],
    ['🥤','Suporte 473 ml','Encaixe funcional'],
    ['🏺','Vaso orgânico','Decoração'],
    ['⚙️','Peça técnica','Protótipo mecânico'],
  ]
  return (
    <div className="page">
      <div className="welcome-row"><div><span className="eyebrow">BIBLIOTECA 3D</span><h1>Modelos de demonstração</h1><p>Exemplos para apresentar a visão do produto.</p></div></div>
      <div className="library-grid">{items.map(([icon,title,sub]) => <article key={title}><div className="lib-preview">{icon}</div><h3>{title}</h3><p>{sub}</p><button className="ghost-btn bordered">Abrir modelo</button></article>)}</div>
    </div>
  )
}

export default App
