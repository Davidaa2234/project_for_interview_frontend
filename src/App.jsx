import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Teachers from './pages/Teachers';
import Courses from './pages/Courses'; // 🚀 剛剛補上的頁面
import './components/Navbar.css';
import EnrollmentManagement from './pages/EnrollmentManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* 🌌 星戰橫向置頂總控制選單 */}
        <Navbar />
        
        {/* 🖥️ 中央數據顯示主螢幕 */}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/enrollments" element={<EnrollmentManagement />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;