import React, { useState } from 'react';
import axios from 'axios';

const apiUrl = 'http://localhost:5500'; // Update with your API URL

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${apiUrl}/login`, {
        email: 'test@example.com',
        password: 'password123'
      });
  
      if (response.data.sessionId) {
        sessionStorage.setItem('sessionId', response.data.sessionId); // Store session ID
        alert('Login successful!');
      }
    } catch (error) {
      console.error('Login failed', error.response?.data?.message || error.message);
    }
  };
  

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
        {errorMessage && <p>{errorMessage}</p>}
      </form>
    </div>
  );
};

export default LoginForm;
