import { useLocation, useNavigate } from 'react-router-dom'
import './ResultPage.css'

function ResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const data = location.state

  if (!data) {
    return (
      <div className="result-container">
        <h1>Sin datos</h1>
        <p>No se han enviado datos del formulario.</p>
        <button className="back-btn" onClick={() => navigate('/')}>
          Volver al formulario
        </button>
      </div>
    )
  }

  return (
    <div className="result-container">
      <h1>Datos Recibidos</h1>
      <div className="data-card" data-testid="result-card">
        <div className="data-row">
          <span className="label">Nombre:</span>
          <span data-testid="result-nombre">{data.nombre}</span>
        </div>
        <div className="data-row">
          <span className="label">Email:</span>
          <span data-testid="result-email">{data.email}</span>
        </div>
        <div className="data-row">
          <span className="label">Edad:</span>
          <span data-testid="result-edad">{data.edad}</span>
        </div>
        <div className="data-row">
          <span className="label">Mensaje:</span>
          <span data-testid="result-mensaje">{data.mensaje}</span>
        </div>
      </div>
      <button className="back-btn" onClick={() => navigate('/')}>
        Volver al formulario
      </button>
    </div>
  )
}

export default ResultPage
