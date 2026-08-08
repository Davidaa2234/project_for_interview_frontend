import React, { createContext, useState, useEffect, useContext } from 'react';

// 📡 建立全域身分通訊頻道
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [username, setUsername] = useState(localStorage.getItem('username'));
  
  // 🚀 宣告全域 user 狀態機，並在初始化時嘗試從本地緩存解鎖
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 🔄 當本地緩存被修改時，即時同步記憶體狀態
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
      setRole(localStorage.getItem('role'));
      setUsername(localStorage.getItem('username'));
      const savedUser = localStorage.getItem('user');
      setUser(savedUser ? JSON.parse(savedUser) : null);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 🔐 登入成功時的廣播發射器，精準接收 4 個戰術參數
  const login = (jwtToken, userRole, name, userId) => {
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('role', userRole);
    localStorage.setItem('username', name);
    localStorage.setItem('userId', userId); // 💾 儲存原始 ID 字串以利備用
    
    // 🌟 建立完整的 user 識別物件
    const userObj = {
      id: userId,        
      username: name,
      role: userRole
    };
    
    // 💾 轉成 JSON 字串，寫入 localStorage 供全系統追蹤
    localStorage.setItem('user', JSON.stringify(userObj));

    // 📡 精準同步 React 記憶體變數
    setToken(jwtToken);
    setRole(userRole);
    setUsername(name);
    setUser(userObj); 
  };

  // 📥 登出時的斷能裝置
  const logout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
    setUsername(null);
    setUser(null);
  };

  // 🚀 將 user 物件實體一同封裝進 Provider 的廣播頻道中
  return (
    <AuthContext.Provider value={{ token, role, username, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 🛰️ 提供給其他頁面呼叫的快捷接收器
export const useAuth = () => useContext(AuthContext);