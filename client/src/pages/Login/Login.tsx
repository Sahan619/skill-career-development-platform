
import './Login.css';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setEmailError('');
    setPasswordError('');
    setLoginError('');

    if (!email.trim()) {
      setEmailError('Email is required.');
      return;
    }

    if (!emailPattern.test(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setPasswordError('Password is required.');
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        { email, password }
      );

      localStorage.setItem('token', response.data.token);
      localStorage.setItem(
        'user',
        JSON.stringify(response.data.user)
      );

      navigate('/dashboard');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setLoginError(
          error.response?.data?.message ||
            'Login failed. Please check your details and try again.'
        );
      } else {
        setLoginError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-container">
      <section className="login-left">
        <div className="login-content">
          <Link to="/login" className="login-brand">
            Skill<span>Path</span>
          </Link>

          <div className="login-heading">
            <p className="login-eyebrow">WELCOME BACK</p>
            <h1>Continue your journey.</h1>
            <p className="login-subtitle">
              Sign in to track your skills, build projects, and
              move closer to your career goals.
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                autoComplete="email"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                  setLoginError('');
                }}
                aria-invalid={Boolean(emailError)}
              />
              {emailError && (
                <p className="login-field-error">{emailError}</p>
              )}
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                autoComplete="current-password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                  setLoginError('');
                }}
                aria-invalid={Boolean(passwordError)}
              />
              {passwordError && (
                <p className="login-field-error">{passwordError}</p>
              )}
            </div>

            {loginError && (
              <p className="login-error" role="alert">
                {loginError}
              </p>
            )}

            <button
              className="login-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="login-register">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>

          <p className="login-footer">
            Build your skills. Shape your future.
          </p>
        </div>
      </section>

      <aside className="login-right">
        <div className="login-art-glow" />
        <div className="login-art-circle login-art-circle-one" />
        <div className="login-art-circle login-art-circle-two" />

        <div className="login-art-content">
          <div className="login-art-icon" aria-hidden="true">
            <span>✦</span>
          </div>

          <p className="login-art-label">YOUR FUTURE STARTS HERE</p>
          <h2>
            Learn with purpose.
            <br />
            Grow with confidence.
          </h2>
          <p className="login-art-description">
            Organize your learning, develop practical skills, and
            turn your career ambitions into achievable steps.
          </p>

          <div className="login-art-card">
            <div className="login-art-card-icon">↗</div>
            <div>
              <strong>Small steps. Real progress.</strong>
              <p>Keep moving toward your goals.</p>
            </div>
          </div>
        </div>

        <span className="login-art-decoration decoration-one">✳</span>
        <span className="login-art-decoration decoration-two">✦</span>
        <span className="login-art-decoration decoration-three">＋</span>
      </aside>
    </main>
  );
};

export default Login;
