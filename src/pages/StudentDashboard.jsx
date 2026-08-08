import React, { useState, useEffect } from 'react';
import { courseAPI, studentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BookOpen, CheckCircle, GraduationCap, PlusCircle, Trash2, ShieldAlert, Loader2 } from 'lucide-react';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth(); 
  const [availableCourses, setAvailableCourses] = useState([]); 
  const [myCourses, setMyCourses] = useState([]); 
  const [loading, setLoading] = useState(true);

  // 📡 核心數據加載
  const loadDashboardData = async () => {
    if (!user || !user.id) {
      console.warn("⚠️ 正在等待學員特徵識別碼載入...");
      return;
    }

    try {
      setLoading(true);
      
      // 1. 獲取開放課表
      const coursesRes = await courseAPI.getAllCourses();
      console.log("🛸 後端回傳的【全開放課表】原始資料結構:", coursesRes.data);
      setAvailableCourses(coursesRes.data || []);

      // 2. 獲取已選課表
      const studentsRes = await studentAPI.getAllStudents();
      const currentStudent = studentsRes.data.find(s => s.id == user.id);
      
      if (currentStudent && currentStudent.courses) {
        console.log("🎒 後端回傳的【個人已選課表】原始資料結構:", currentStudent.courses);
        setMyCourses(currentStudent.courses);
      } else {
        setMyCourses([]);
      }

    } catch (error) {
      console.error("調閱學員選課矩陣失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // 🎯 智慧追蹤函數：防止後端欄位名稱不一致，自動探測所有可能的屬性
  const getCourseName = (course) => {
    if (!course) return "無課程資料";
    
    // 🔍 自動掃描所有常見的後端欄位名稱
    const possibleName = course.name || course.title || course.courseName || course.subject || course.courseTitle;
    if (possibleName) return possibleName;

    // 🔬【終極防禦外掛】：如果以上皆非，自動幫你把物件裡「非 ID 且是字串」的欄位撈出來顯示
    const keys = Object.keys(course);
    const stringKey = keys.find(key => typeof course[key] === 'string' && key !== 'id' && key !== 'role');
    
    // 如果真的都挖不到，直接把物件轉 JSON 字串印出來，方便一眼看出欄位叫什麼
    return stringKey ? course[stringKey] : `未知課程 (除ID外的屬性: ${JSON.stringify(course)})`;
  };

  const handleEnroll = async (courseId) => {
    try {
      await courseAPI.enrollCourse(courseId);
      alert('⚡ 成功對準軌道！該課程已成功加選至你的選課中！');
      await loadDashboardData(); 
    } catch (error) {
      console.error("選課失敗詳細日誌:", error);
      alert(`選課失敗: ${error}`);
    }
  };

  const handleDrop = async (courseId) => {
    if (!user || !user.id) return;
    if (!window.confirm("⚠️ 確定要從你的記憶體中抹除這門課程嗎？")) return;
    
    try {
      await studentAPI.dropCourse(user.id, courseId);
      alert('🗑️ 該課程已成功退選！');
      await loadDashboardData(); 
    } catch (error) {
      console.error("退選失敗詳細日誌:", error);
      alert(`退選失敗: ${error}`);
    }
  };

  if (!user) {
    return (
      <div className="cosmic-loading-screen">
        <Loader2 className="spinner-icon" />
        <p>🛑 正在重新校準學生特徵身分...</p>
      </div>
    );
  }

  return (
    <div className="student-dashboard-container">
      <header className="student-header">
        <div className="header-logo">
          <GraduationCap className="logo-icon" />
          <span>DC CONTROL INC. <small>// 學員控制終端</small></span>
        </div>
        <div className="header-user-zone">
          <div className="user-badge">
            <span className="user-name">{user.username}</span>
            <span className="user-role-tag">STUDENT</span>
          </div>
          <button onClick={logout} className="logout-btn">登出</button>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* 左側：全銀河開放課表 */}
        <section className="dashboard-card">
          <div className="card-header-bar">
            <h2 className="card-title">
              <BookOpen className="title-icon text-cyan" /> 正在掃描：當季開放課表
            </h2>
            <span className="count-indicator">AVAILABLE: {availableCourses.length}</span>
          </div>
          
          {loading ? (
            <div className="inside-loading">
              <Loader2 className="spinner-icon" /> 同步星際課表資料流中...
            </div>
          ) : (
            <div className="table-responsive">
              <table className="cosmic-table">
                <thead>
                  <tr>
                    <th style={{ width: '15%' }}>軌道編號</th>
                    <th style={{ width: '45%' }}>課程知識名稱</th>
                    <th style={{ width: '20%' }}>能源消耗</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>加選操作</th>
                  </tr>
                </thead>
                <tbody>
                  {availableCourses.map(course => {
                    const isEnrolled = myCourses.some(my => my.id === course.id);
                    return (
                      <tr key={course.id} className={isEnrolled ? 'row-disabled' : ''}>
                        <td><span className="id-badge">#{course.id}</span></td>
                        {/* 🎯 使用智慧追蹤函數 */}
                        <td className="font-highlight">{getCourseName(course)}</td>
                        <td><span className="credits-text">⚡ {course.credits?.toLocaleString() || '30,000'}</span></td>
                        <td style={{ textAlign: 'center' }}>
                          {isEnrolled ? (
                            <span className="status-enrolled-tag"><CheckCircle size={13} /> 已在矩陣</span>
                          ) : (
                            <button onClick={() => handleEnroll(course.id)} className="btn-enroll">
                              <PlusCircle size={13} /> 申請加選
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 右側：學員已加選之原力矩陣清單 */}
        <section className="dashboard-card">
          <div className="card-header-bar">
            <h2 className="card-title">
              <CheckCircle className="title-icon text-green" /> 已載入之個人課程矩陣
            </h2>
            <span className="count-indicator success-indicator">MY COURSES: {myCourses.length}</span>
          </div>

          {loading ? (
            <div className="inside-loading">
              <Loader2 className="spinner-icon" /> 正在讀取個人原力核心...
            </div>
          ) : myCourses.length === 0 ? (
            <div className="empty-matrix">
              <ShieldAlert size={42} className="empty-icon" />
              <p>當前個人知識矩陣為空</p>
              <small>請從左側面板中掃描並加選全新知識軌道</small>
            </div>
          ) : (
            <div className="my-courses-list">
              {myCourses.map(course => (
                <div key={course.id} className="my-course-item">
                  <div className="course-item-info">
                    <span className="course-item-id">#{course.id}</span>
                    {/* 🎯 使用智慧追蹤函數 */}
                    <span className="course-item-name">{getCourseName(course)}</span>
                  </div>
                  <button onClick={() => handleDrop(course.id)} className="btn-drop" title="申請退選">
                    <Trash2 size={15} /> 取消選課
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard;