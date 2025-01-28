import React, { useState } from 'react';
import axios from 'axios';

const apiUrl = 'http://localhost:5500'; // Update with your API URL

const SignupForm = ({ onSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await axios.post(`${apiUrl}/signup`, { email, password });
      if (response.ok){
        console.log("User created");
        return;
      } else{
        console.log(response);
        return;
      }
    } catch (error) {
      setErrorMessage('Signup failed, please try again.');
    }
  };

  return (
    <div className="form-container">
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
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
        <button type="submit">Signup</button>
        {errorMessage && <p>{errorMessage}</p>}
      </form>
    </div>
  );
};

export default SignupForm;
