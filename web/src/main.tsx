import { createRoot } from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'

if (/^#\/(en|pt)(?:[/?]|$)/.test(location.hash)) {
  history.replaceState(history.state, '', location.hash.slice(1))
}
createRoot(document.getElementById('root')!).render(<BrowserRouter><App /></BrowserRouter>)
