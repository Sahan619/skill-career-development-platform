import './Login.css';
import { useState ,type FormEvent  } from 'react';
import axios from'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (email === '') {
  setEmailError('Email is required');
return}
  if (password === '') {
  setPasswordError('Password is required');
    return;
  
}
 if (!emailPattern.test(email)) {
    setEmailError('Please enter a valid email');
    return;
  }


try{
  const response = await axios.post('http://localhost:5000/api/auth/login', 
    { email, password });
  console.log(response.data);
}
 catch (error){
  console.error(error);
};}




  return (
    <div className="login-container">
      <div className="login-card">
        <h1 style={{ color: 'black' }}>Login</h1>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {setEmail(e.target.value);
              setEmailError('');
            }}
            
          />{emailError}

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Password"
             value={password}
            onChange={(e) => {setPassword(e.target.value);
              setPasswordError('');
            }}
          />
          {passwordError}

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;