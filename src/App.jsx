import { Route, Routes } from 'react-router-dom'
import EditorPage from './pages/EditorPage'
import PreviewPage from './pages/PreviewPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<EditorPage />} />
      <Route path="/preview" element={<PreviewPage />} />
    </Routes>
  )
}

export default App
