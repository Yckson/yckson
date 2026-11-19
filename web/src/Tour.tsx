import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { Euler, Object3D, Vector3, MathUtils } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { Link, useSearchParams } from 'react-router-dom'
import { portfolios, type Language } from './catalog'

const labels = {
  en: { title:'Museum tour', reception:'Reception', terminal:'Computer terminal', wing:'Computer Science wing', left:'Look left', right:'Look right', open:'Enter portfolio', index:'View portfolios', hint:'Choose a stop. Drag to look around.', loading:'Loading the hall…' },
  pt: { title:'Passeio pelo museu', reception:'Recepção', terminal:'Terminal de computador', wing:'Ala de Ciência da Computação', left:'Olhar à esquerda', right:'Olhar à direita', open:'Entrar no portfólio', index:'Ver portfólios', hint:'Escolha uma parada. Arraste para olhar ao redor.', loading:'Carregando o hall…' }
}
const stops = ['reception','terminal','wing'] as const
type Stop = typeof stops[number]
type View = { stop: Stop; yaw: number; pitch: number; reduced: boolean }

function Hall({ view, onReady, onLoss }: { view: View; onReady: () => void; onLoss: () => void }) {
  const { scene } = useLoader(GLTFLoader, import.meta.env.BASE_URL + 'museum/hall.glb')
  const { camera, gl, invalidate } = useThree()
  const first = useRef(true)
  const target = useMemo(() => {
    const pose = new Object3D()
    const eye = scene.getObjectByName('eye_' + view.stop)
    const aim = scene.getObjectByName('aim_' + view.stop)
    if (!eye || !aim) throw new Error('Missing museum viewpoint')
    eye.getWorldPosition(pose.position)
    // Cameras look along their negative Z axis.
    const direction = pose.position.clone().sub(aim.getWorldPosition(new Vector3()))
    pose.lookAt(pose.position.clone().add(direction))
    const rotation = new Euler().setFromQuaternion(pose.quaternion, 'YXZ')
    rotation.y += view.yaw
    rotation.x += view.pitch
    pose.rotation.copy(rotation)
    return pose
  }, [scene, view.stop, view.yaw, view.pitch])
  useEffect(() => { invalidate() }, [target, view.reduced, invalidate])
  useEffect(() => {
    onReady()
    const canvas = gl.domElement
    canvas.addEventListener('webglcontextlost', onLoss)
    return () => canvas.removeEventListener('webglcontextlost', onLoss)
  }, [gl, onReady, onLoss])
  useFrame((_, delta) => {
    const factor = view.reduced || first.current ? 1 : 1 - Math.exp(-8 * Math.min(delta, .08))
    first.current = false
    camera.position.lerp(target.position, factor)
    camera.quaternion.slerp(target.quaternion, factor)
    if (camera.position.distanceToSquared(target.position) > .000001 || camera.quaternion.angleTo(target.quaternion) > .0001) invalidate()
  })
  return <><hemisphereLight intensity={2} color="#fff5db" groundColor="#62675c"/><directionalLight position={[-3,6,4]} intensity={2.4}/><directionalLight position={[4,4,-2]} intensity={1.3}/><primitive object={scene}/></>
}
export default function Tour({ language, reduced, onLoss }: { language: Language; reduced: boolean; onLoss: () => void }) {
  const [params, setParams] = useSearchParams()
  const stop = stops.find(s => s === params.get('stop')) ?? 'reception'
  const [look, setLook] = useState({ yaw:0, pitch:0 })
  const [ready, setReady] = useState(false)
  const onReady = useMemo(() => () => setReady(true), [])
  const drag = useRef<{ x:number; y:number } | null>(null)
  const t = labels[language]
  const root = '/' + language
  const area = portfolios.find(item => item.stop === stop)
  return <section className="tour"><div className="tour-heading"><h1>{t.title}</h1><Link to={root + '/portfolios'}>{t.index} ↗</Link></div>
    <div className="viewport" onPointerDown={e => { drag.current = {x:e.clientX,y:e.clientY}; e.currentTarget.setPointerCapture(e.pointerId) }}
      onPointerMove={e => { if (!drag.current) return
        const dx = e.clientX - drag.current.x, dy = e.clientY - drag.current.y
        drag.current = { x:e.clientX, y:e.clientY }
        setLook(v => ({yaw:v.yaw + dx * .005, pitch:MathUtils.clamp(v.pitch + dy * .004,-.6,.6)}))
      }} onLostPointerCapture={() => { drag.current = null }}>
      <Canvas aria-hidden="true" frameloop="demand" dpr={[1,1.5]} camera={{fov:54,near:.08,far:55}}>
        <color attach="background" args={['#b5bbb0']}/><Suspense fallback={null}><Hall view={{stop,...look,reduced}} onReady={onReady} onLoss={onLoss}/></Suspense>
      </Canvas>
      {!ready && <span className="loading" role="status">{t.loading}</span>}
    </div>
    <div className="controls"><p>{t.hint}</p><div className="stop-row">{stops.map(s => <button key={s} aria-pressed={s === stop} onClick={() => {setLook({yaw:0,pitch:0});setParams({stop:s},{replace:true})}}>{t[s]}</button>)}</div>
    <div className="stop-row"><button onClick={() => setLook(v => ({...v,yaw:v.yaw+.3}))}>← {t.left}</button><button onClick={() => setLook(v => ({...v,yaw:v.yaw-.3}))}>{t.right} →</button>{area && <Link className="primary" to={root+'/portfolio/'+area.slug+'?from='+stop}>{t.open} ↗</Link>}</div></div>
  </section>
}
