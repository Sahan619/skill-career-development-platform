import './Login.css';
import { useState ,type FormEvent  } from 'react';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (email === '') {
  console.log('Email is empty');
return}
  if (password === '') {
    console.log('Password is empty');
    return;
  
}
  console.log(email);
    console.log(password);
}






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
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Password"
             value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;