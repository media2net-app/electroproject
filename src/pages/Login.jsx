import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const DUMMY_EMAIL = 'demo@electroproject.nl'
const DUMMY_PASSWORD = 'A9!xZ7#qLp2@'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState(DUMMY_EMAIL)
  const [password, setPassword] = useState(DUMMY_PASSWORD)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    setTimeout(() => {
      const isValid = email.trim().toLowerCase() === DUMMY_EMAIL && password === DUMMY_PASSWORD
      if (isValid) {
        navigate('/dashboard')
      } else {
        setError('Onjuiste inloggegevens. Probeer opnieuw.')
      }
      setIsSubmitting(false)
    }, 500)
  }

  return (
    <div className="login-root">
      <div className="login-overlay" />
      <form className="login-card" onSubmit={handleSubmit}>
        <img
          className="login-logo"
          src="/logo/EQUANS-logo-white-Electroproject.svg"
          alt="Electroproject logo"
        />
        <h1 className="login-title">Inloggen</h1>

        <label className="login-label" htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          className="login-input"
          placeholder="jij@bedrijf.nl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="login-label" htmlFor="password">Wachtwoord</label>
        <input
          id="password"
          type="password"
          className="login-input"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <div className="login-error">{error}</div>}

        <button className="login-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Bezig...' : 'Inloggen'}
        </button>
      </form>
    </div>
  )
}

export default Login


