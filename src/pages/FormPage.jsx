import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './FormPage.css'

function FormPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    edad: '',
    mensaje: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/resultado', { state: formData })
  }

  return (
    <div className="form-container">
      <h1>Formulario de Contacto</h1>
      <form onSubmit={handleSubmit} data-testid="contact-form">
        <div className="form-group">
          <label htmlFor="nombre">Nombre</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            placeholder="Tu nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email 2</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="edad">Edad</label>
          <input
            type="number"
            id="edad"
            name="edad"
            placeholder="Tu edad"
            value={formData.edad}
            onChange={handleChange}
            required
            min="1"
            max="120"
          />
        </div>

        <div className="form-group">
          <label htmlFor="mensaje">Mensaje</label>
          <textarea
            id="mensaje"
            name="mensaje"
            placeholder="Escribe tu mensaje..."
            value={formData.mensaje}
            onChange={handleChange}
            required
            rows={4}
          />
        </div>

        <button type="submit" className="submit-btn">Enviar</button>
      </form>
    </div>
  )
}

export default FormPage
