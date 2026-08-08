import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { User, Mail, Key } from 'lucide-react';
import './AuthAndProfile.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await authAPI.register({ username, email, password });
      alert('🎉 註冊成功！新學員已成功寫入資料庫，預設金流狀態為 [LOCK]。');
      navigate('/login');
    } catch (error) {
      alert(`❌ 寫入失敗: ${error}`);
    }
  };

  return (
    <div className="sw-card-container">
      <div className="sw-cosmic-card">
        <h2 className="sw-card-title">INITIALIZE REGISTRATION</h2>
        <p className="sw-card-subtitle">錄入新學員資料</p>
        
        <form onSubmit={handleRegister}>
          <div className="sw-input-group">
            <label className="sw-input-label"><User size={14} /> 設定帳號</label>
            <input 
              type="text" 
              className="sw-input-field"
              placeholder="SET USERNAME"
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
            />
          </div>

          <div className="sw-input-group">
            <label className="sw-input-label"><Mail size={14} /> 通訊信箱 (Email)</label>
            <input 
              type="email" 
              className="sw-input-field"
              placeholder="ENTER EMAIL ADDRESS"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="sw-input-group">
            <label className="sw-input-label"><Key size={14} /> 設定密碼</label>
            <input 
              type="password" 
              className="sw-input-field"
              placeholder="SET PASSWORD"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="sw-btn-submit">封裝資料並發送</button>
        </form>

        <p className="sw-redirect-text">
          已註冊？ <Link to="/login" className="sw-redirect-link">返回登入端點 ➔</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;