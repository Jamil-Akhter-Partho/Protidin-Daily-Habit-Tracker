import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/nunito'
import '@fontsource-variable/fredoka'
import './index.css'
import './garden.css'
import './noor.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
