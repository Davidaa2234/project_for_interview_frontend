import React, { useEffect, useState } from 'react';
import { courseAPI, teacherAPI } from '../services/api'; 
import { useAuth } from '../context/AuthContext'; 
import { Orbit, PlusCircle, Trash2, Loader2 } from 'lucide-react'; 
import './Courses.css'; 

const Courses = () => {
  const { role , user} = useAuth(); 
  const [courses, setCourses] = useState([]); 
  const [teachers, setTeachers] = useState([]); 
  
// === 📡 新增選課數據監控狀態 ===
  const [monitorData, setMonitorData] = useState([]);        // 存儲選課明細列表
  const [totalSelections, setTotalSelections] = useState(0);   // 存儲總選課人次統計

  // 表單欄位狀態
  const [title, setTitle] = useState(''); 
  const [price, setPrice] = useState(''); 
  const [teacherId, setTeacherId] = useState(''); 
  const [isDataLoading, setIsDataLoading] = useState(true);

  // 動態排版：全站已發布課程的 Grid 比例
  const gridLayoutTemplate = role === 'ROLE_ADMIN' 
    ? { gridTemplateColumns: '1fr 2fr 1.5fr 1.5fr 1.2fr' } 
    : { gridTemplateColumns: '1fr 2.5fr 2fr 2fr' };     

  useEffect(() => {
    loadAllMatrixData();
  }, [role]); 

// 📡 同步全站課程、特聘講師名冊與選課情資
  const loadAllMatrixData = async () => {
    try {
      setIsDataLoading(true);
      
      // 1. 讀取全站已發布課程
      const courseRes = await courseAPI.getAllCourses(); 
      setCourses(courseRes.data || []);

      // 2. 如果是管理員，加載特聘導師清單與【管理員全站選課監控】
      if (role === 'ROLE_ADMIN') {
        const teacherRes = await teacherAPI.getAllTeachers(); 
        setTeachers(teacherRes.data || []);
        
        // 🎯 呼叫管理員專屬選課監控 API
        const monitorRes = await courseAPI.getAdminSelectionMonitor(); // 註：若無封裝在 courseAPI，可改用 axios.get('/api/courses/monitor/admin')
        setMonitorData(monitorRes.data?.matrixData || []);
        setTotalSelections(monitorRes.data?.totalSelections || 0);
      } 
      // 3. 如果是老師，加載【開課老師專屬選課監控】
      else if (role === 'ROLE_TEACHER') {
        const currentTeacherId = user?.id || localStorage.getItem('userId');
        
        // 🎯 呼叫老師專屬選課監控 API，帶入當前登入的 ID
        const monitorRes = await courseAPI.getTeacherSelectionMonitor(currentTeacherId); // 註：或 axios.get(`/api/courses/monitor/teacher/${currentTeacherId}`)
        setMonitorData(monitorRes.data?.matrixData || []);
        setTotalSelections(monitorRes.data?.totalSelections || 0);
      }
    } catch (error) {
      console.error('同步課程或選課監控數據失敗:', error);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    
    if (!title || !price) {
      alert('請填寫課程名稱與點數欄位！');
      return;
    }

    try {
      // 🎯【核心智能識別】：如果是管理員就看下拉選單；如果是老師，就自動帶入當前登入者的 user.id！
      let targetTeacherId = null;
      
      if (role === 'ROLE_ADMIN') {
        targetTeacherId = teacherId === '' ? null : Number(teacherId);
      } else if (role === 'ROLE_TEACHER') {
        // 確保有拿到 user.id 或 localStorage 的 userId
        targetTeacherId = user?.id || Number(localStorage.getItem('userId'));
      }

      // Body 只封裝基礎數據
      const courseData = {
        title,
        price: Number(price)
      };

      // 🚀 正式調用，這時候 targetTeacherId 就會有 Jackson 老師的真 ID 了！
      await courseAPI.createCourse(targetTeacherId, courseData);
      alert('⚡ 課程光譜封裝成功，已廣播至全星系主網！');
      
      setTitle('');
      setPrice('');
      setTeacherId('');
      
      loadAllMatrixData(); 
    } catch (error) {
      console.error('創建課程發生錯誤:', error);
      const errorMsg = error.response?.data || '創建失敗，請重新檢視權限節點。';
      alert(`創建失敗：${errorMsg}`);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm('🚨 確定要抹除此項核心課程數據嗎？此操作不可逆！')) {
      try {
        await courseAPI.deleteCourse(id);
        alert('💥 數據抹除成功。');
        loadAllMatrixData(); 
      } catch (error) {
        console.error('抹除課程錯誤:', error);
        alert('抹除失敗，權限可能遭防火牆阻擋。');
      }
    }
  };

  return (
    <div className="courses-container dc-dashboard-layout">
      {/* 🌌 控制台頂部大標題 */}
      <h2 className="courses-title">
        <Orbit className="orbit-icon animate-spin-slow" /> DC 課程發布中心
      </h2>
      <p className="courses-subtitle">
        當前身份權限等級：{role || 'GUEST'} // 允許開拓與維護全站知識核心矩陣。
      </p>

      {/* 🚀 Flex 1:1 左右並排佈局 */}
      <div className="dc-top-flex-wrapper">
        
        {/* ==================== 🛠️ 左側：創建課程表單面板 ==================== */}
        <div className="create-course-card dc-panel-box">
          <h3 className="cosmic-form-title">
            <PlusCircle size={16} /> 初始化全新課程矩陣
          </h3>
          <p className="cosmic-form-subtitle">填入量子參數以發布全新學能</p>

          <form onSubmit={handleCreateCourse}>
            <div className="cosmic-input-group">
              <label className="cosmic-label">課程核心主題 (Title)</label>
              <input
                type="text"
                className="cosmic-input"
                placeholder="例如：Java OCP 認證核心特訓"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="cosmic-input-group">
              <label className="cosmic-label">所需費用 (Credits)</label>
              <input
                type="number"
                className="cosmic-input"
                placeholder="例如：15000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            {role === 'ROLE_ADMIN' && (
              <div className="cosmic-input-group">
                <label className="cosmic-label">指派特聘大師 (Teacher)</label>
                <select
                  className="cosmic-select"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                >
                  {/* 🎯 關鍵：維持此選項時值就是空字串 ""，傳給後端就會被轉成 null */}
                  <option value="">-- 暫不指派（尚未指派講師） --</option>
                  
                    {teachers.map((t) => (
                    // 💡 防呆：如果遇到之前資料庫裡面 id 是 4 的占位符，直接跳過不顯示
                    t.id !== 4 && (
                      <option key={t.id} value={t.id}>
                        ID: {t.id} | {t.name} ({t.expertise || '全領域原力'})
                      </option>
                    )
                  ))}
                </select>
              </div>
            )}

            <button type="submit" className="btn-create-course-cosmic">
              ⚡ 封裝並發布核心課程
            </button>
          </form>
        </div>

        {/* ==================== 🎯 右側：全站已發布課程矩陣 ==================== */}
        <div className="cosmic-matrix-container dc-panel-box dc-scroll-list">
          <div className="cosmic-matrix-header-bar">
            <span className="cosmic-matrix-header-title">📡 全站已同步知識集群</span>
            <span className="dc-counter-badge">{courses.length} ACTIVE</span>
          </div>

          <div className="cosmic-matrix-table">
            {/* 標題行 */}
            <div className="cosmic-matrix-header" style={gridLayoutTemplate}>
              <div className="matrix-header-cell">課程編號</div>
              <div className="matrix-header-cell">課程名稱</div>
              <div className="matrix-header-cell">指派講師</div>
              <div className="matrix-header-cell">學費</div>
              {role === 'ROLE_ADMIN' && <div className="matrix-header-cell" style={{ textAlign: 'right' }}>權限操作</div>}
            </div>

            {/* 數據串流渲染行 */}
            {isDataLoading ? (
              <div className="dc-loading-text"><Loader2 className="sw-spinner-mini" size={14} /> 正在解密同步星際網絡...</div>
            ) : courses.length === 0 ? (
              <div style={{ padding: '20px', color: '#64748b', fontSize: '13px' }}>📡 當前主網尚無已同步的課程數據...</div>
            ) : (
              courses.map((course) => (
                <div key={course.id} className="cosmic-matrix-row" style={gridLayoutTemplate}>
                  <div className="cell-course-id"># {course.id}</div> 
                  <div className="cell-course-title">{course.title}</div> 
                  <div className="cell-course-teacher">{course.teacher?.name || '未分派特聘專家'}</div> 
                  <div className="cell-course-price">⚡ {course.price?.toLocaleString()} CREDITS</div> 
                  {role === 'ROLE_ADMIN' && (
                    <div style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDeleteCourse(course.id)}  
                        className="btn-delete-course-cosmic"
                      >
                        <Trash2 size={12} /> 刪除
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

       {/* ==================== 🔒 下方：資料庫真實選課狀況監控矩陣 ==================== */}
      <div className="dc-bottom-monitor-section" style={{ marginTop: '35px' }}>
        <div className="dc-monitor-header">
          <h3 className="dc-monitor-title">
            📡 {role === 'ROLE_ADMIN' ? '全星系主網選課情資矩陣' : '個人授權核心選課監控'}
          </h3>
          <span className="dc-secure-badge">
            ⚡ 當前累計有效選課人次：<strong style={{ color: '#00ff88', fontSize: '16px' }}>{totalSelections}</strong> 人
          </span>
        </div>
        <p className="dc-monitor-subtitle">
          {role === 'ROLE_ADMIN' 
            ? '核心權限：實時串流全站多對多(ManyToMany)資料表扣連狀態。' 
            : '講師權限：僅同步您名下所開設核心課程之學員名冊。'}
        </p>

        <div className="dc-table-wrapper">
          <table className="dc-matrix-table-element">
            <thead>
              <tr>
                <th>課程編號</th>
                <th>核心課程名稱</th>
                {role === 'ROLE_ADMIN' && <th>開課講師</th>}
                <th>已選課學員名冊 (學員ID)</th>
                <th>單科報名人數</th>
              </tr>
            </thead>
            <tbody>
              {monitorData.length === 0 ? (
                <tr>
                  <td colSpan={role === 'ROLE_ADMIN' ? 5 : 4} style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                    📡 當前無任何學員選課數據記錄。
                  </td>
                </tr>
              ) : (
                monitorData.map((item) => (
                  <tr key={item.courseId}>
                    <td className="dc-td-id"># {item.courseId}</td>
                    <td className="dc-td-course" style={{ fontWeight: 'bold' }}>{item.courseTitle}</td>
                    {role === 'ROLE_ADMIN' && <td>{item.teacherName}</td>}
                    <td>
                      {item.students.length === 0 ? (
                        <span style={{ color: '#64748b', fontSize: '12px' }}>-- 暫無學生選修 --</span>
                      ) : (
                        item.students.map(s => (
                          <span key={s.studentId} style={{
                            display: 'inline-block',
                            background: 'rgba(168, 85, 247, 0.15)',
                            color: '#e9d5ff',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            marginRight: '6px',
                            fontSize: '12px',
                            border: '1px solid rgba(168, 85, 247, 0.3)'
                          }}>
                            {s.studentName} ({s.studentId})
                          </span>
                        ))
                      )}
                    </td>
                    <td>
                      <span className={`dc-status-tag ${item.studentCount > 0 ? 'status-ok' : 'status-pending'}`}>
                        {item.studentCount} 人已鎖定
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Courses;