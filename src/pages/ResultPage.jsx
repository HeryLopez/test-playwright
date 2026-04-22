import { useLocation, useNavigate } from 'react-router-dom'
import './ResultPage.css'

function ResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const data = location.state

  if (!data) {
    return (
      <div className="result-container">
        <h1>No Data</h1>
        <p>No form data has been submitted.</p>
        <button className="back-btn" onClick={() => navigate('/')}>
          Back to form
        </button>
      </div>
    )
  }

  return (
    <div className="result-container">
      <h1>Received Data</h1>
      <div className="data-card" data-testid="result-card">
        <div className="data-row">
          <span className="label">Name:</span>
          <span data-testid="result-name">{data.name}</span>
        </div>
        <div className="data-row">
          <span className="label">Email:</span>
          <span data-testid="result-email">{data.email}</span>
        </div>
        <div className="data-row">
          <span className="label">Age:</span>
          <span data-testid="result-age">{data.age}</span>
        </div>
        <div className="data-row">
          <span className="label">Message:</span>
          <span data-testid="result-message">{data.message}</span>
        </div>
      </div>
      <button className="back-btn" onClick={() => navigate('/')}>
        Back to form
      </button>
    </div>
  )
}

export default ResultPage
