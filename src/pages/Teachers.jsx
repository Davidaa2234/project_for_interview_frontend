import React, { useEffect, useState } from 'react';
import { teacherAPI } from '../services/api'; // 🎯 專注操作 teacherAPI 即可
import { Compass, Cpu, Mail, ShieldCheck, Edit3, X, Loader2 } from 'lucide-react';
import './PublicExplore.css';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]); // 修正命名變數更直覺
  const [loading, setLoading] = useState(true);

  // 🔐 安全憑證核對：抓取當前登入者的身分權限
  const role = localStorage.getItem('role');
  const canEdit = role === 'ROLE_ADMIN' || role === 'ROLE_TEACHER';

  // 🖥️ 彈出視窗與修訂暫存器狀態 (修改導師專用)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    expertise: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // ➕ 彈出視窗與新聘暫存器狀態 (管理員新增導師專用)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    username: '',
    password: '',
    email: '',
    name: '',
    expertise: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  // 📡 調閱中央講師資料鏈結
  const fetchTeachers = () => {
    setLoading(true);
    teacherAPI.getAllTeachers()
      .then(res => {
        console.log("🛸 成功拉取講師 DTO 扁平數據:", res.data);
        setTeachers(res.data);
      })
      .catch(err => console.error("無法調閱講師資料鏈結", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // 🛠️ 啟動修改程序：開啟 Modal 並注入預填數據
  const openEditModal = (teacher) => {
    setSelectedTeacherId(teacher.id);
    setFormData({
      id: teacher.id,
      name: teacher.name || '',
      email: teacher.email || '', // 🎯 乾淨俐落，直接點名欄位
      expertise: teacher.expertise || ''
    });
    setIsModalOpen(true);
  };

  // 💾 處理修改表單輸入變更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 💾 處理新增表單輸入變更
  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData(prev => ({ ...prev, [name]: value }));
  };

  // 📡 發送覆寫請求至後端資料庫 (PUT /api/teachers/{id})
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeacherId) {
      alert("❌ 無法識別該導師的核心識別碼 (ID)！");
      return;
    }
    
    try {
      setIsUpdating(true);
      
      // 🎯 完全對齊後端 TeacherDTO 接收的扁平結構
      const updatePayload = {
        id: selectedTeacherId,
        name: formData.name, // 雖然名稱唯讀，但還是帶回去
        email: formData.email,
        expertise: formData.expertise
      };

      // 🎯 關鍵修正：呼叫原本專門修改講師的 API
      await teacherAPI.updateTeacher(selectedTeacherId, updatePayload);
      alert("🛸 該導師之核心特徵與專業敘述矩陣覆寫成功！");
      
      setIsModalOpen(false);
      fetchTeachers(); // 重新整理列表，更新畫面數據
    } catch (error) {
      console.error("❌ 覆寫講師 DTO 數據失敗:", error);
      alert("❌ 變更失敗：安全協議拒絕寫入。");
    } finally {
      setIsUpdating(false);
    }
  };

  // 📡 發送連動建立請求至後端資料庫 (POST /api/teachers)
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsCreating(true);
      // 🎯 直攻後端升級後接收 Map Payload 的一體化建立接口
      await teacherAPI.createTeacher(createFormData);
      alert("🚀 新聘特聘導師檔案建檔成功，且已核發系統登入憑證！");
      
      setIsCreateModalOpen(false);
      // 初始化建立表單
      setCreateFormData({
        username: '',
        password: '',
        email: '',
        name: '',
        expertise: ''
      });
      fetchTeachers(); // 重新拉取最新的講師清單
    } catch (error) {
      console.error("❌ 新聘講師資料發行失敗:", error);
      alert("❌ 建檔失敗：帳號可能已被佔用，或防禦協議拒絕寫入。");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="explore-container teachers-page-wrapper">
      
      <h2 className="explore-title">
        <Compass size={24} className="explore-title-icon" /> 👨‍🏫 學院特聘講師名冊
      </h2>
      
      <p className="explore-subtitle" style={{ marginBottom: role === 'ROLE_ADMIN' ? '15px' : '30px' }}>
        正在連線通訊網... 成功找出最強講師。
      </p>

      {/* 👑 管理者專屬戰術按鈕：新聘講師建檔入口 */}
      {role === 'ROLE_ADMIN' && (
        <button 
          className="teacher-action-edit-btn" 
          style={{ 
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
            padding: '10px 20px', 
            marginBottom: '25px', 
            fontSize: '14px', 
            borderRadius: '8px',
            color: '#ffffff',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            border: 'none',
            cursor: 'pointer'
          }}
          onClick={() => setIsCreateModalOpen(true)}
        >
          ➕ 新聘特聘導師資料建檔
        </button>
      )}

      {loading ? (
        <div className="explore-loading-box">
          <Loader2 className="explore-spinner" size={20} /> 正在解密講師特徵鏈結...
        </div>
      ) : (
        <div className="teachers-grid-layout">
          {teachers.map(t => {
            // 🎯 受惠於 DTO 扁平化，Email 再也不會漏接了！
            const teacherEmail = t.email;

            return (
              <div key={t.id} className="teacher-cosmic-card">
                
                <div className="teacher-card-body">
                  <div className="teacher-card-header">
                    【首席導師】 {t.name}
                  </div>
                  
                  {/* 📧 聯絡資訊 (Email) */}
                  <div className="teacher-info-row">
                    <Mail size={14} className="info-icon" /> 
                    <span className="info-label">聯絡資訊:</span> 
                    <span className="info-value" style={{ color: teacherEmail ? '#22c55e' : '#ef4444' }}>
                      {teacherEmail || 'SIGNAL_HIDDEN // 未公開'}
                    </span>
                  </div>

                  {/* 💡 核心專業領域 (Expertise) */}
                  <div className="teacher-info-section">
                    <div className="info-section-label">
                      <Cpu size={14} /> 核心專業領域 (EXPERT MATRIX)
                    </div>
                    <div className="teacher-expertise-block">
                      {t.expertise || "尚未指派核心專業特徵"}
                    </div>
                  </div>
                </div>

                <div className="teacher-card-footer">
                  <div className="secure-badge">
                    <ShieldCheck size={14} /> ✓ 已通過安全資格審查
                  </div>

                  {/* 🛠️ 權限感知按鈕：僅限老師 & 管理員顯示修改入口 */}
                  {canEdit && (
                    <button 
                      className="teacher-action-edit-btn" 
                      onClick={() => openEditModal(t)}
                    >
                      <Edit3 size={12} /> 修訂特徵
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ==========================================================================
          🪐 戰術跳出視窗：修訂特徵 (Update Modal)
          ========================================================================== */}
      {isModalOpen && (
        <div className="cosmic-modal-overlay">
          <div className="cosmic-modal-window">
            <div className="modal-top-accent theme-teacher"></div>
            
            <div className="modal-header">
              <h3 className="modal-title-text">
                <Edit3 size={18} style={{ color: '#a855f7' }} /> REWRITE TEACHER SPEC
              </h3>
              <button className="modal-close-icon-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSubmit} className="modal-form-body">
              <div className="sw-input-group">
                <label className="sw-input-label">導師稱號 (唯讀識別)</label>
                <input 
                  type="text" 
                  className="sw-input-field" 
                  value={formData.name} 
                  disabled 
                />
              </div>

              <div className="sw-input-group">
                <label className="sw-input-label">修訂通訊信箱 (Email)</label>
                <input 
                  type="email" 
                  name="email"
                  className="sw-input-field" 
                  placeholder="請輸入電子信箱，例如: name@example.com"
                  value={formData.email} 
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="sw-input-group">
                <label className="sw-input-label">修訂授課核心專業 (Expertise)</label>
                <textarea 
                  name="expertise"
                  rows="3"
                  className="sw-input-field modal-textarea" 
                  placeholder="請輸入專業敘述，例如：JavaOCP 認證、JavaWeb開發"
                  value={formData.expertise} 
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="modal-btn-group">
                <button type="button" className="modal-btn-cancel" onClick={() => setIsModalOpen(false)}>
                  放棄修訂
                </button>
                <button type="submit" className="modal-btn-save" disabled={isUpdating}>
                  {isUpdating ? "寫入資料庫中..." : "確認覆寫數據"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================================================
          🪐 戰術跳出視窗：管理員專屬 - 新聘特聘導師資料建檔 (Create Modal)
          ========================================================================== */}
      {isCreateModalOpen && (
        <div className="cosmic-modal-overlay">
          <div className="cosmic-modal-window">
            <div className="modal-top-accent" style={{ background: '#2563eb' }}></div>
            
            <div className="modal-header">
              <h3 className="modal-title-text">
                <Edit3 size={18} style={{ color: '#2563eb' }} /> REGISTER NEW TEACHER
              </h3>
              <button className="modal-close-icon-btn" onClick={() => setIsCreateModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="modal-form-body">
              
              {/* 帳號與密碼欄位併排 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="sw-input-group">
                  <label className="sw-input-label">登入帳號 (Username)</label>
                  <input 
                    type="text" 
                    name="username" 
                    className="sw-input-field" 
                    placeholder="例如: vincent_tuan" 
                    value={createFormData.username} 
                    onChange={handleCreateInputChange} 
                    required 
                  />
                </div>
                <div className="sw-input-group">
                  <label className="sw-input-label">初始密碼 (Password)</label>
                  <input 
                    type="password" 
                    name="password" 
                    className="sw-input-field" 
                    placeholder="請設定登入密碼" 
                    value={createFormData.password} 
                    onChange={handleCreateInputChange} 
                    required 
                  />
                </div>
              </div>

              <div className="sw-input-group">
                <label className="sw-input-label">通訊信箱 (Email)</label>
                <input 
                  type="email" 
                  name="email" 
                  className="sw-input-field" 
                  placeholder="例如: vincent@platform.com" 
                  value={createFormData.email} 
                  onChange={handleCreateInputChange} 
                  required 
                />
              </div>

              <div className="sw-input-group">
                <label className="sw-input-label">導師真實姓名 / 稱號 (Full Name)</label>
                <input 
                  type="text" 
                  name="name" 
                  className="sw-input-field" 
                  placeholder="例如: Vincent Tuan" 
                  value={createFormData.name} 
                  onChange={handleCreateInputChange} 
                  required 
                />
              </div>

              <div className="sw-input-group">
                <label className="sw-input-label">核心授課專業 (Expertise)</label>
                <textarea 
                  name="expertise" 
                  rows="3" 
                  className="sw-input-field modal-textarea" 
                  placeholder="例如：Java Web 核心開發、Spring Boot 微服務" 
                  value={createFormData.expertise} 
                  onChange={handleCreateInputChange} 
                  required 
                />
              </div>

              <div className="modal-btn-group">
                <button type="button" className="modal-btn-cancel" onClick={() => setIsCreateModalOpen(false)}>
                  取消建檔
                </button>
                <button type="submit" className="modal-btn-save" style={{ background: '#2563eb' }} disabled={isCreating}>
                  {isCreating ? "同步寫入中..." : "核發憑證並確認建檔"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Teachers;