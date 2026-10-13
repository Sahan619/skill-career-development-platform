
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const passwordChecks = {
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /\d/.test(password),
  special: /[^A-Za-z\d\s]/.test(password),
   noSpaces: !/\s/.test(password),
};

const isPasswordStrong = Object.values(passwordChecks).every(Boolean);

  
async function handleSubmit(e: FormEvent) {
  e.preventDefault();

  setErrorMessage('');
  setSuccessMessage('');

  if (!isPasswordStrong) {
    setErrorMessage(
      'Please choose a password that meets all the requirements.'
    );
    return;
  }

  try {
    setLoading(true);

    await axios.post(
      'http://localhost:5000/api/auth/register',
      {
        name: name.trim(),
        email: email.trim(),
        password,
      }
    );

    setSuccessMessage(
      'Your account has been created. You can now sign in.'
    );

    setName('');
    setEmail('');
    setPassword('');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      setErrorMessage(
        error.response?.data?.message ||
          'Registration failed. Please check your details and try again.'
      );
    } else {
      setErrorMessage('Something went wrong. Please try again.');
    }
  } finally {
    setLoading(false);
  }
}


  return (
    <main className="register-container">
      <section className="register-left">
        <div className="register-content">
          <Link to="/login" className="register-brand">
            Skill<span>Path</span>
          </Link>

          <div className="register-heading">
            <p className="register-eyebrow">GET STARTED</p>
            <h1>Create your account.</h1>
            <p className="register-subtitle">
              Start organizing your skills, tracking your progress,
              and building the future you want.
            </p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="register-field">
              <label htmlFor="register-name">Full name</label>
              <input
                id="register-name"
                type="text"
                placeholder="Your full name"
                value={name}
                autoComplete="name"
                onChange={(e) => {
                  setName(e.target.value);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                required
              />
            </div>

            <div className="register-field">
              <label htmlFor="register-email">Email address</label>
              <input
                id="register-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                autoComplete="email"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                required
              />
            </div>

            
<div className="register-field">
  <label htmlFor="register-password">Password</label>
  <input
    id="register-password"
    type="password"
    placeholder="Create a password"
    value={password}
    autoComplete="new-password"
    onChange={(e) => {
      setPassword(e.target.value);
      setErrorMessage('');
      setSuccessMessage('');
    }}
    required
  />

  <div className="password-requirements">
    <p>Password must contain:</p>
    <p className={passwordChecks.length ? 'valid' : ''}>
      ✓ At least 8 characters
    </p>
    <p className={passwordChecks.uppercase ? 'valid' : ''}>
      ✓ One uppercase letter (A–Z)
    </p>
    <p className={passwordChecks.lowercase ? 'valid' : ''}>
      ✓ One lowercase letter (a–z)
    </p>
    <p className={passwordChecks.number ? 'valid' : ''}>
      ✓ One number (0–9)
    </p>
    <p className={passwordChecks.special ? 'valid' : ''}>
      ✓ One special character (@, #, !)
    </p>
    <p className={passwordChecks.noSpaces ? 'valid' : ''}>
      ✓ No spaces
    </p>
  </div>
</div>


            {errorMessage && (
              <p className="register-error" role="alert">
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p className="register-success" role="status">
                {successMessage}
                {' '}
                <Link to="/login">Sign in</Link>
              </p>
            )}

            <button
              className="register-submit"
              type="submit"
              disabled={loading || !isPasswordStrong}
            >
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="register-login">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

          <p className="register-footer">
            Build your skills. Shape your future.
          </p>
        </div>
      </section>

      <aside className="register-right">
        <div className="register-art-glow" />
        <div className="register-art-circle register-circle-one" />
        <div className="register-art-circle register-circle-two" />

        <div className="register-art-content">
          <div className="register-art-icon" aria-hidden="true">
            <span>✦</span>
          </div>

          <p className="register-art-label">YOUR NEXT CHAPTER</p>
          <h2>
            Turn your ambition
            <br />
            into achievement.
          </h2>
          <p className="register-art-description">
            Set clear goals, map your learning journey, and keep
            track of every step toward your dream career.
          </p>

          <div className="register-art-card">
            <div className="register-art-card-icon">✓</div>
            <div>
              <strong>Your journey, organized.</strong>
              <p>Skills, projects, and progress in one place.</p>
            </div>
          </div>
        </div>

        <span className="register-decoration register-decoration-one">✳</span>
        <span className="register-decoration register-decoration-two">✦</span>
        <span className="register-decoration register-decoration-three">＋</span>
      </aside>
    </main>
  );
};

export default Register;
