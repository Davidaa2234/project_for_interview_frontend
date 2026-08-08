import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { User, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // 🛰️ 引入全域身分接收器
import './AuthAndProfile.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  // 🚀 從全域狀態網中取得 login 廣播功能
  const { login } = useAuth(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 1. 向後端請求驗證密鑰
      const response = await authAPI.login({ username, password });
      
      // 2. 解析後端回傳的 DTO 數據
      const jwtToken = response.data.token;
      const role = response.data.role;
      
      // 🎯【精準對齊】：直接拿取後端 LoginResponseDTO 剛補上的動態 id
      const userId = response.data.id; 

      // 3. 📡 呼叫 Context 廣播發射，把這個真正的 userId 灌注進去！
      login(jwtToken, role, username, userId); 

      alert(`身分特徵比對通過！驗證角色：[${role.replace('ROLE_', '')}] 🛸`);

      // 4. 🔀 依據身份乾淨利落地切換戰術面板
      if (role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else if (role === 'ROLE_TEACHER') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }

    } catch (error) {
      alert(`❌ 拒絕存取：身分驗證特徵與帝國核心資料庫不符！\n錯誤: ${error}`);
    }
  };

  return (
    <div className="sw-card-container">
      <div className="sw-cosmic-card">
        <h2 className="sw-card-title">ACCESS TERMINAL</h2>
        <p className="sw-card-subtitle">連接選課系統</p>
        
        <form onSubmit={handleLogin}>
          <div className="sw-input-group">
            <label className="sw-input-label"><User size={14} /> 使用者識別碼</label>
            <input 
              type="text" 
              className="sw-input-field" 
              placeholder="ENTER USERNAME"
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
            />
          </div>

          <div className="sw-input-group">
            <label className="sw-input-label"><Key size={14} /> 安全防護密鑰</label>
            <input 
              type="password" 
              className="sw-input-field" 
              placeholder="ENTER PASSWORD"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="sw-btn-submit">驗證帳號密碼</button>
        </form>

        <p className="sw-redirect-text">
          尚未註冊帳號密碼？ <Link to="/register" className="sw-redirect-link">啟動自主註冊 ➔</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;