import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 🚀 改用訂閱機制
import { ShieldAlert, User, Compass, Orbit, Radio, LogOut, LogIn, Users } from 'lucide-react'; // 🎯 修正：在此補上 Users 圖標
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 🛰️ 從全域狀態網中即時擷取當前身分（只要狀態一變，Navbar 自動重繪！）
  const { token, role, username, logout } = useAuth();

  const handleLogout = () => {
    logout(); // 呼叫全域登出
    alert('成功登出。👋');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'navbar-link-item active-top-tab' : 'navbar-link-item';

  return (
    <nav className="navbar-top-container">
      <div className="navbar-logo-zone">
        <Orbit size={28} color="#a855f7\" />
        <span className="navbar-logo-text">DC Control Inc.</span>
      </div>

      <div className="navbar-menu-links">
        {token ? (
          <>
            {role === 'ROLE_ADMIN' && (
              <Link to="/admin" className={isActive('/admin')}>
                <ShieldAlert size={16} /> 監控中樞
              </Link>
            )}

            <Link to="/profile" className={isActive('/profile')}>
              <Compass size={16} /> 個人檔案
            </Link>

            <Link to="/courses" className={isActive('/courses')}>
              <Orbit size={16} /> 課程發布中心
            </Link>

            {/* 🎯 完美嵌入現有星際控制艙選單 */}
            {(role === 'ROLE_ADMIN' || role === 'ROLE_TEACHER') && (
                <Link to="/enrollments" className={isActive('/enrollments')}>
                  <Users size={16} /> 選課調度中心
                  {/* 如果當前使用者是 Admin，可以在按鈕旁加個高亮警示小點 */}
                  {role === 'ROLE_ADMIN' && <span className="admin-status-dot"></span>}
                </Link>
              )}

            {role === 'ROLE_STUDENT' && (
              <Link to="/student" className={isActive('/student')}>
                <Radio size={16} /> 選課頁面
              </Link>
            )}
          </>
        ) : (
          <>
            <Link to="/login" className={isActive('/login')}>
              <LogIn size={16} /> 學員登入頁面
            </Link>
            <Link to="/register" className={isActive('/register')}>
              <Radio size={16} /> 新學員註冊
            </Link>
          </>
        )}
      </div>

      <div className="navbar-right-zone">
        <div className="navbar-user-badge-card">
          <div className="user-badge-avatar">
            <User size={16} />
          </div>
          <div className="user-badge-info">
            <span className="user-badge-name">{token ? username : 'GUEST // 訪客'}</span>
            <span className={`user-badge-status ${token ? 'status-online' : 'status-offline'}`}>\r
              {token ? `ONLINE // ${role?.replace('ROLE_', '')}` : 'OFFLINE'}\r
            </span>
          </div>
        </div>

        {token && (
          <button onClick={handleLogout} className="navbar-logout-top-btn">
            <LogOut size={14} /> 安全中斷連線
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;