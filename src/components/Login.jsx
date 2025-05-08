import React, { useState } from 'react';
import './login.css';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // 从环境变量中读取正确的用户名和密码
  const correctUsername = process.env.NEXT_PUBLIC_LOGIN_USERNAME;
  const correctPassword = process.env.NEXT_PUBLIC_LOGIN_PASSWORD;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === correctUsername && password === correctPassword) {
      setError('');
      onLoginSuccess();
    } else {
      setError('无效的用户名或密码');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>登录</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label htmlFor="username">用户名:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">密码:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">登录</button>
      </form>
    </div>
  );
}

export default Login; 