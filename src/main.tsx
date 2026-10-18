import { createRoot } from 'react-dom/client'
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js'
import App from './App'
import '@fontsource/dm-sans/latin-400.css'
import '@fontsource/dm-sans/latin-500.css'
import '@fontsource/dm-sans/latin-600.css'
import '@fontsource/italiana/latin-400.css'
import './styles.css'

RectAreaLightUniformsLib.init()
createRoot(document.getElementById('root')!).render(<App />)
