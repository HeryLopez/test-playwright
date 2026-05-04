import { Route, Routes } from 'react-router-dom'
import EditorPage from './pages/EditorPage'
import PreviewPage from './pages/PreviewPage'
import ScrapingPage from './pages/ScrapingPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<EditorPage />} />
      <Route path="/preview" element={<PreviewPage />} />
      <Route path="/scraping" element={<ScrapingPage />} />
    </Routes>
  )
}

export default App
