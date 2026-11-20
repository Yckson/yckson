import { useEffect, useRef, useState } from 'react'
import { readPreference, remember, type Language } from './catalog'

function useDisplayPreference(key: string, query: string) {
  const [choice, setChoice] = useState(() => readPreference(key))
  const [system, setSystem] = useState(() => typeof matchMedia === 'function' && matchMedia(query).matches)
  useEffect(() => {
    const media = matchMedia(query)
    const change = () => setSystem(media.matches)
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [query])
  const value = choice === null ? system : choice === 'true'
  function update(next: boolean) {
    remember(key, String(next))
    setChoice(String(next))
  }
  return [value, update] as const
}
export function useDisplayPreferences() {
  const [contrast, setContrast] = useDisplayPreference('contrast', '(prefers-contrast: more)')
  const [reduced, setReduced] = useDisplayPreference('motion', '(prefers-reduced-motion: reduce)')
  return {contrast, setContrast, reduced, setReduced}
}
export function Accessibility({language, prefs}: { language:Language; prefs: ReturnType<typeof useDisplayPreferences> }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const pt = language === 'pt'
  const title = pt ? 'Acessibilidade' : 'Accessibility'
  return <><button className="settings" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>{title}</button>
    <dialog ref={dialog} aria-labelledby="access-title"><h2 id="access-title">{title}</h2>
      <label><input type="checkbox" checked={prefs.contrast} onChange={e => prefs.setContrast(e.target.checked)}/>{pt ? 'Alto contraste' : 'High contrast'}</label>
      <label><input type="checkbox" checked={prefs.reduced} onChange={e => prefs.setReduced(e.target.checked)}/>{pt ? 'Reduzir movimento' : 'Reduce motion'}</label>
      <button onClick={() => dialog.current?.close()}>{pt ? 'Concluir' : 'Done'}</button>
    </dialog></>
}
