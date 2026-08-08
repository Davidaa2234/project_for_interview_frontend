import React, { useEffect, useState } from 'react';
import { studentAPI, courseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, Search, PlusCircle, Trash2, ShieldAlert, Loader2, RefreshCw } from 'lucide-react';
import './EnrollmentManagement.css';

const EnrollmentManagement = () => {
  const { role } = useAuth();
  const currentLoginUsername = localStorage.getItem('username'); // 取得當前登入者名字 (如 Teacher01)

  // 數據儲存狀態機
  const [enrollments, setEnrollments] = useState([]);
  const [coursesList, setCoursesList] = useState([]); // 供管理員手動加選的課程下拉選單
  const [isDataLoading, setIsDataLoading] = useState(true);

  // 🔍 搜尋篩選狀態機
  const [searchStudent, setSearchStudent] = useState('');
  const [searchCourse, setSearchCourse] = useState('');

  // 🛠️ 管理員代辦加選表單狀態機
  const [targetStudentId, setTargetStudentId] = useState('');
  const [targetCourseId, setTargetCourseId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAllEnrollmentMatrix();
  }, [role]);

  // 📡 調閱全站學生數據並進行維度轉換與過濾
  const loadAllEnrollmentMatrix = async () => {
    try {
      setIsDataLoading(true);
      
      // 1. 同步全體學生及內嵌的選修清單
      const studentRes = await studentAPI.getAllStudents();
      const allStudents = studentRes.data || [];

      // 如果是管理員，順便拉取現有課程，方便手動代辦加選時選擇
      if (role === 'ROLE_ADMIN') {
        const courseRes = await courseAPI.getAllCourses();
        setCoursesList(courseRes.data || []);
      }

      // ⚡ 量子結構攤平：把 [學生 -> 課程陣列] 攤平成直觀的一條條選課流水行
      const flattenedData = allStudents.flatMap((student) => {
        if (!student.courses || student.courses.length === 0) return [];

        return student.courses.map((course) => ({
          id: `${student.id}-${course.id}`, // 複合式唯一識別碼
          studentId: student.id,
          studentName: student.name,
          courseId: course.id,
          courseTitle: course.title,
          teacherName: course.teacher?.name || '未分派專家'
        }));
      });

      // 🎯 依據身分實施視野安全隔離
      if (role === 'ROLE_ADMIN') {
        setEnrollments(flattenedData);
      } else if (role === 'ROLE_TEACHER') {
        // 老師登入：只篩選出負責導師名字等於自己當前登入 username 的紀錄
        const filteredByTeacher = flattenedData.filter(
          (item) => item.teacherName === currentLoginUsername
        );
        setEnrollments(filteredByTeacher);
      }
    } catch (error) {
      console.error('調閱修業快照失敗:', error);
    } finally {
      setIsDataLoading(false);
    }
  };

  // 🛠️ 執行代辦加選 (限管理員)
  const handleAdminEnroll = async (e) => {
    e.preventDefault();
    if (!targetStudentId || !targetCourseId) {
      alert('請輸入完整的學徒 ID 與課程 ID！');
      return;
    }

    try {
      setIsSubmitting(true);
      // 直接呼叫 api.js 封裝好的真實端點
      await studentAPI.enrollCourse(Number(targetStudentId), Number(targetCourseId));
      alert('⚡ 遠端選課關聯封裝成功！後端已被強制覆寫。');
      setTargetStudentId('');
      setTargetCourseId('');
      loadAllEnrollmentMatrix(); // 刷新表格
    } catch (error) {
      console.error('代辦選課失敗:', error);
      alert(error.response?.data || '選課執行失敗，請檢查 ID 是否正確或重複選課。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 💥 執行代辦退選 (限管理員)
  const handleAdminDrop = async (studentId, courseId, studentName, courseTitle) => {
    const confirmMessage = `🚨 警告：您正以最高管理員權限強行介入！\n\n確定要強制退選學徒 [ ${studentName} ] 的 [ ${courseTitle} ] 課程嗎？`;
    if (window.confirm(confirmMessage)) {
      try {
        await studentAPI.dropCourse(studentId, courseId);
        alert('💥 關聯斷開成功，該學徒修業學籍已安全除名。');
        loadAllEnrollmentMatrix(); // 刷新表格
      } catch (error) {
        console.error('代辦退選失敗:', error);
        alert(error.response?.data || '強制退選遭到後端核心攔截。');
      }
    }
  };

  // 🔍 前端即時多條件模糊搜尋過濾
  const filteredEnrollments = enrollments.filter((item) => {
    const matchStudent = item.studentName.toLowerCase().includes(searchStudent.toLowerCase()) || String(item.studentId).includes(searchStudent);
    const matchCourse = item.courseTitle.toLowerCase().includes(searchCourse.toLowerCase()) || String(item.courseId).includes(searchCourse);
    return matchStudent && matchCourse;
  });

  return (
    <div className="enroll-mgmt-container dc-dashboard-layout">
      {/* 🌌 控制艙頂部大標題 */}
      <div className="em-title-section">
        <h2 className="em-main-title">
          <Users className="em-icon animate-pulse" /> 全星系學徒選課調度中心
        </h2>
        <button className="btn-refresh-em" onClick={loadAllEnrollmentMatrix} title="即時刷新數據">
          <RefreshCw size={14} /> 刷新數據庫
        </button>
      </div>
      <p className="em-subtitle">
        當前管理權限節點：<span className="em-badge-role">{role}</span> // 當前連線身分：<span className="em-badge-name">{currentLoginUsername}</span>
      </p>

      {/* 🛠️ 【上半部】管理員限定的加選表單面版 */}
      {role === 'ROLE_ADMIN' && (
        <div className="em-admin-form-box dc-panel-box animate-fade-in">
          <h3 className="em-form-title">
            <PlusCircle size={16} /> 最高議會強制越權加選
          </h3>
          <p className="em-form-subtitle">管理員可繞過前端驗證，直接幫任意學徒 ID 與指定課程 ID 建立多對多資料庫綁定。</p>
          
          <form onSubmit={handleAdminEnroll} className="em-horizontal-form">
            <div className="em-input-field-group">
              <label>輸入學徒識別碼 (Student ID)</label>
              <input
                type="number"
                placeholder="例如: 47"
                value={targetStudentId}
                onChange={(e) => setTargetStudentId(e.target.value)}
                required
              />
            </div>

            <div className="em-input-field-group">
              <label>指派綁定課程 (Select Course)</label>
              <select
                value={targetCourseId}
                onChange={(e) => setTargetCourseId(e.target.value)}
                required
              >
                <option value="">-- 請選擇要強制加入的知識核心 --</option>
                {coursesList.map(c => (
                  <option key={c.id} value={c.id}>ID: {c.id} | {c.title} (負責導師: {c.teacher?.name || '無'})</option>
                ))}
              </select>
            </div>

            <button type="submit" className="em-btn-submit" disabled={isSubmitting}>
              {isSubmitting ? '正在寫入節點...' : '⚡ 強制寫入選課資料表'}
            </button>
          </form>
        </div>
      )}

      {/* 🔍 【中部】多功能查詢與過濾控制艙 */}
      <div className="em-search-bar-box">
        <div className="em-search-item">
          <Search size={14} className="text-purple" />
          <input
            type="text"
            placeholder="依學徒姓名 / ID 檢索..."
            value={searchStudent}
            onChange={(e) => setSearchStudent(e.target.value)}
          />
        </div>
        <div className="em-search-item">
          <Search size={14} className="text-purple" />
          <input
            type="text"
            placeholder="依課程名稱 / ID 檢索..."
            value={searchCourse}
            onChange={(e) => setSearchCourse(e.target.value)}
          />
        </div>
        <div className="em-counter-text">
          目前篩選出：<strong>{filteredEnrollments.length}</strong> 筆有效紀錄
        </div>
      </div>

      {/* 📊 【下半部】真實修業快照數據矩陣表格 */}
      <div className="em-table-card-container">
        <div className="em-table-wrapper-scroller">
          <table className="em-custom-data-table">
            <thead>
              <tr>
                <th>學徒 ID</th>
                <th>學徒姓名 (Student Name)</th>
                <th>修習課程 ID</th>
                <th>課程核心主題 (Course Title)</th>
                <th>指派授課導師</th>
                {role === 'ROLE_ADMIN' && <th style={{ textAlign: 'right' }}>特權介入操作</th>}
              </tr>
            </thead>
            <tbody>
              {isDataLoading ? (
                <tr>
                  <td colSpan={role === 'ROLE_ADMIN' ? 6 : 5} className="em-table-loading">
                    <Loader2 className="em-spinner" size={16} /> 正在執行多維關聯反序列化，同步後台修業快照...
                  </td>
                </tr>
              ) : filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={role === 'ROLE_ADMIN' ? 6 : 5} style={{ padding: '30px', textAlignment: 'center', color: '#64748b' }}>
                    📡 當前通訊範圍內，查無符合檢索條件的選課對接數據。
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((row) => (
                  <tr key={row.id}>
                    <td className="em-td-mono">#{row.studentId}</td>
                    <td className="em-td-name">🧬 {row.studentName}</td>
                    <td className="em-td-mono">#{row.courseId}</td>
                    <td className="em-td-title">🛰️ {row.courseTitle}</td>
                    <td>
                      <span className={`em-teacher-tag ${row.teacherName === currentLoginUsername ? 'tag-highlight-me' : ''}`}>
                        👤 {row.teacherName} {row.teacherName === currentLoginUsername ? '(您自己)' : ''}
                      </span>
                    </td>
                    {role === 'ROLE_ADMIN' && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="em-btn-drop-action"
                          onClick={() => handleAdminDrop(row.studentId, row.courseId, row.studentName, row.courseTitle)}
                        >
                          <Trash2 size={11} /> 強制退選
                        </button>
                      </td>
                    )}
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

export default EnrollmentManagement;