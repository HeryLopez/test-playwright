import { Route, Routes } from 'react-router-dom'
import FormPage from './pages/FormPage'
import ResultPage from './pages/ResultPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<FormPage />} />
      <Route path="/resultado" element={<ResultPage />} />
    </Routes>
  )
}

export default App
