import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import { ShieldAlert, Edit3, UserCheck, Lock, Unlock, CreditCard, X, UserPlus, KeyRound, Shield, FileText } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

 // 🛸 【修改視窗狀態組】全面擴充欄位結構
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState({
    id: '',
    username: '',
    email: '',
    password: '', // 留空代表不修改密碼
    role: 'ROLE_STUDENT',
    fullName: '',
    phoneNumber: '',
    bio: ''
  });

  // 🌟 【核心新增：建立新會員狀態組】
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'ROLE_STUDENT', // 預設權限為絕地學徒
    fullName: '',
    email: '',
    phoneNumber: '',
    bio: ''
  });

  useEffect(() => {
    loadAllUsers();
  }, []);

  const loadAllUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      alert(`聯絡中央資料庫失敗：${error}`);
    } finally {
      setLoading(false);
    }
  };

 // 🛠️ 開啟修改視窗，並注入當前列的原始數值與 Profile 特徵
  const openEditModal = (user) => {
    setSelectedUser({
      id: user.id,
      username: user.username,
      email: user.email || '',
      password: '', // 每次開啟都先清空密碼輸入欄
      role: user.role || 'ROLE_STUDENT',
      // 💡 智慧防禦：如果後端撈出來的 userProfile 是 null，就用空字串墊底
      fullName: user.userProfile?.fullName || '',
      phoneNumber: user.userProfile?.phoneNumber || '',
      bio: user.userProfile?.bio || ''
    });
    setIsModalOpen(true);
  };

  // 💾 提交全面更新：呼叫後端修改端點
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      // 💡 智慧封裝：完全對齊後端 User Entity 與巢狀 Profile 結構
      const userPayload = {
        username: selectedUser.username,
        email: selectedUser.email,
        role: selectedUser.role,
        password: selectedUser.password || "", // 有填寫才覆寫密碼，沒填傳空字串後端會略過
        
        // 🎯 關鍵聯動：打包 Profile 物件送過去
        userProfile: {
          fullName: selectedUser.fullName,
          phoneNumber: selectedUser.phoneNumber,
          bio: selectedUser.bio
        }
      };

      // 🚀 正式調用 adminAPI 寫入後端
      await adminAPI.updateUser(selectedUser.id, userPayload);
      
      alert(`使用者編號 #${selectedUser.id} 全盤特徵值修改成功，光量子矩陣同步完畢！✨`);
      setIsModalOpen(false);
      loadAllUsers(); // 重新刷新大廳列表
    } catch (error) {
      console.error("修改用戶發生錯誤:", error);
      alert(`修改失敗: ${error.response?.data || error}`);
    }
  };
  // ⚡【核心新增：處理新會員表單輸入變更】
  const handleAddUserInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  // 📡【核心新增：發送建立新會員請求】
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      // 🚀 串接後端建立會員 API，將帳密、身分與 Profile 封裝一併發出
      await adminAPI.createUser(newUser);
      
      alert(`⚡ 全新憑證已成功寫入星系數據庫！新成員「${newUser.username}」初始化完畢。`);
      
      // 初始化表單並關閉彈窗
      setNewUser({
        username: '',
        password: '',
        role: 'ROLE_STUDENT',
        fullName: '',
        email: '',
        phoneNumber: '',
        bio: ''
      });
      setIsAddModalOpen(false);
      loadAllUsers(); // 刷新控制大廳列表
    } catch (error) {
      alert(`開拓人員失敗: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔐 帳號啟用 / 停權切換[cite: 8]
  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = !currentStatus;
    try {
      await adminAPI.toggleStatus(id, nextStatus);
      alert(`防衛盾狀態變更成功！🔓`);
      loadAllUsers();
    } catch (error) {
      alert(`變更帳號狀態失敗: ${error}`);
    }
  };

  // 💳 金流狀態切換[cite: 8]
  const handleTogglePayment = async (id, currentUser) => {
    const currentPaymentStatus = currentUser.isPaid || currentUser.paid || false;
    const nextPaymentStatus = !currentPaymentStatus;
    try {
      await adminAPI.togglePayment(id, nextPaymentStatus);
      alert(`金流核心頻率已調校！狀態已變更為：${nextPaymentStatus ? '🟢 已繳費' : '🔴 擋修中'}`);
      loadAllUsers();
    } catch (error) {
      console.error("金流操作失敗詳細日誌:", error);
      alert(`金流操作失敗: ${error}`);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#00f2fe' }}>正在對準全息投影資料庫...</div>;

  return (
    <div className="admin-container">
      {/* 頂部標題與核心開拓按鈕區 */}
      <div className="admin-header-flex">
        <div>
          <h2 className="admin-title">⚡ 系統最高管理員(ADMIN) 控制大廳</h2>
          <p className="admin-subtitle">具有全站使用者特徵校正、金流充能、帳密頻率重設等權限。操作受帝國 AOP 軌道日誌全程審查。</p>
        </div>
        
        {/* 🌟 新增：開拓新會員之功能鈕 */}
        <button 
          className="btn-sw-control create-user"
          onClick={() => setIsAddModalOpen(true)}
        >
          <UserPlus size={14} style={{ marginRight: '6px' }} /> 開拓全新人員憑證
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>編號 (ID)</th>
            <th>星際帳號</th>
            <th>通訊信箱 (Email)</th>
            <th>特權等級 (Role)</th>
            <th>通訊頻率 (Status)</th>
            <th>金流狀態 (Payment)</th>
            <th>戰術改寫核心 (Actions)</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>#{user.id}</td>
              <td><strong>{user.username}</strong></td>
              <td>{user.email || 'N/A // 未註冊'}</td>
              <td>
                <span className="badge-role">{user.role?.replace('ROLE_', '')}</span>
              </td>
              <td>
                {user.enabled ? (
                  <span className="badge-active">ACTIVE // 運行中</span>
                ) : (
                  <span className="badge-suspended">FROZEN // 已凍結</span>
                )}
              </td>
              <td className="sw-table-cell">
                {(user.isPaid || user.paid) ? (
                  <span className="badge-active">🟢 已繳費</span>
                ) : (
                  <span className="badge-suspended" style={{ color: '#ff3366', background: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.3)' }}>
                    🔴 擋修中
                  </span>
                )}
              </td>
              <td>
                <div className="btn-action-panel">
                  <button onClick={() => openEditModal(user)} className="btn-sw-control edit">
                    <Edit3 size={12} style={{ marginRight: '4px' }} /> 修改用戶
                  </button>

                  <button 
                    onClick={() => handleToggleStatus(user.id, user.enabled)}
                    className={user.enabled ? "btn-sw-control toggle-off" : "btn-sw-control toggle-on"}
                  >
                    {user.enabled ? <Lock size={12} /> : <Unlock size={12} />} {user.enabled ? "停權" : "啟用"}
                  </button>

                  {"ROLE_STUDENT" === user.role && (
                    <button 
                      onClick={() => handleTogglePayment(user.id, user)}
                      className="btn-sw-action"
                      style={{ 
                        background: 'rgba(112, 128, 176, 0.1)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: (user.isPaid || user.paid) ? '#ffaa00' : '#00ff88',
                        border: '1px solid',
                        borderColor: (user.isPaid || user.paid) ? 'rgba(255,170,0,0.4)' : 'rgba(0,255,136,0.4)'
                      }}
                    >
                      <CreditCard size={12} style={{ marginRight: '4px', display: 'inline', verticalAlign: 'middle' }} />
                      {(user.isPaid || user.paid) ? "關閉金流" : "開通金流"}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🛸 【彈出式 1】：全面重構升級版 - 星際戰術特徵全面改寫表單 (Modal) */}
      {isModalOpen && (
        <div className="sw-modal-overlay">
          <div className="sw-modal-box sw-modal-wide">
            <div className="sw-modal-header-with-close">
              <h3 className="sw-modal-title" style={{ borderBottom: 'none', paddingBottom: 0, margin: 0 }}>
                <Edit3 size={18} style={{ marginRight: '6px', color: '#00f2fe', display: 'inline', verticalAlign: 'middle' }} /> 
                重構編號 #{selectedUser.id} 核心特徵值
              </h3>
              <button className="sw-modal-close-icon" onClick={() => setIsModalOpen(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleUpdateUser} style={{ marginTop: '15px' }}>
              
              {/* 🔑 核心帳據變更 */}
              <div className="sw-form-divider"><KeyRound size={12} /> 核心帳據金鑰變更</div>
              
              <div className="sw-form-row">
                <div className="sw-form-group">
                  <label className="sw-form-label">修改使用者名稱</label>
                  <input
                    type="text"
                    className="sw-form-input"
                    value={selectedUser.username}
                    onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                    required
                  />
                </div>

                <div className="sw-form-group">
                  <label className="sw-form-label">強制重設密碼（留空則維持原密碼）</label>
                  <input
                    type="password"
                    className="sw-form-input"
                    placeholder="輸入新密碼以強制覆寫..."
                    value={selectedUser.password}
                    onChange={(e) => setSelectedUser({ ...selectedUser, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="sw-form-group">
                <label className="sw-form-label">變更特權等級 (Role Identity)</label>
                <select
                  className="sw-form-input sw-form-select"
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                >
                  <option value="ROLE_STUDENT">🔵 LEVEL 01 // PADAWAN (絕地學徒)</option>
                  <option value="ROLE_TEACHER">🟢 LEVEL 02 // JEDI MASTER (學院導師)</option>
                  <option value="ROLE_ADMIN">🔴 LEVEL MAX // SITH LORD (最高管理員)</option>
                </select>
              </div>

              {/* 👤 Profile 連動變更 */}
              <div className="sw-form-divider" style={{ color: '#a855f7', borderColor: 'rgba(168,85,247,0.2)' }}><FileText size={12} /> 連動變更 Profile 基礎特徵</div>

              <div className="sw-form-row">
                <div className="sw-form-group">
                  <label className="sw-form-label">真實姓名 (Full Name)</label>
                  <input
                    type="text"
                    className="sw-form-input"
                    placeholder="輸入真實姓名..."
                    value={selectedUser.fullName}
                    onChange={(e) => setSelectedUser({ ...selectedUser, fullName: e.target.value })}
                  />
                </div>

                <div className="sw-form-group">
                  <label className="sw-form-label">通訊信箱 (Email)</label>
                  <input
                    type="email"
                    className="sw-form-input"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="sw-form-group">
                <label className="sw-form-label">加密通訊頻率 (Phone Number)</label>
                <input
                  type="text"
                  className="sw-form-input"
                  placeholder="輸入聯絡電話..."
                  value={selectedUser.phoneNumber}
                  onChange={(e) => setSelectedUser({ ...selectedUser, phoneNumber: e.target.value })}
                />
              </div>

              <div className="sw-form-group">
                <label className="sw-form-label">人員特徵備忘錄描述 (Bio)</label>
                <textarea
                  rows="2"
                  className="sw-form-input"
                  style={{ resize: 'none' }}
                  placeholder="輸入此節點變更備註..."
                  value={selectedUser.bio}
                  onChange={(e) => setSelectedUser({ ...selectedUser, bio: e.target.value })}
                />
              </div>

              <div className="sw-modal-actions" style={{ marginTop: '20px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="btn-sw-control"
                  style={{ borderColor: '#ff0055', color: '#ff0055' }}
                >
                  取消改寫
                </button>
                <button type="submit" className="btn-sw-control edit">
                  確認寫入資料庫
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* 🪐 【核心新增 - 彈出式 2】：量子維度人員開拓視窗 (Add User Modal) */}
      {isAddModalOpen && (
        <div className="sw-modal-overlay">
          <div className="sw-modal-box sw-modal-wide">
            <div className="sw-modal-header-with-close">
              <h3 className="sw-modal-title" style={{ borderBottom: 'none', paddingBottom: 0, margin: 0 }}>
                <UserPlus size={18} style={{ marginRight: '6px', color: '#a855f7', display: 'inline', verticalAlign: 'middle' }} /> 
                注入全星系全新人員憑證
              </h3>
              <button className="sw-modal-close-icon" onClick={() => setIsAddModalOpen(false)}><X size={16} /></button>
            </div>
            
            <form onSubmit={handleCreateUser} style={{ marginTop: '15px' }}>
              
              {/* 🔑 核心登入與權限資料 */}
              <div className="sw-form-divider"><KeyRound size={12} /> 核心帳據金鑰設定</div>
              
              <div className="sw-form-row">
                <div className="sw-form-group">
                  <label className="sw-form-label">人員識別代號 (Username)</label>
                  <input
                    type="text"
                    name="username"
                    className="sw-form-input"
                    placeholder="輸入註冊帳號..."
                    value={newUser.username}
                    onChange={handleAddUserInputChange}
                    required
                  />
                </div>

                <div className="sw-form-group">
                  <label className="sw-form-label">量子加密金鑰 (Password)</label>
                  <input
                    type="password"
                    name="password"
                    className="sw-form-input"
                    placeholder="輸入初始密碼..."
                    value={newUser.password}
                    onChange={handleAddUserInputChange}
                    required
                  />
                </div>
              </div>

              <div className="sw-form-group">
                <label className="sw-form-label">權限層級指定 (Role Identity)</label>
                <select
                  name="role"
                  className="sw-form-input sw-form-select"
                  value={newUser.role}
                  onChange={handleAddUserInputChange}
                >
                  <option value="ROLE_STUDENT">🔵 LEVEL 01 // PADAWAN (絕地學徒)</option>
                  <option value="ROLE_TEACHER">🟢 LEVEL 02 // JEDI MASTER (學院導師)</option>
                  <option value="ROLE_ADMIN">🔴 LEVEL MAX // SITH LORD (最高管理員)</option>
                </select>
              </div>

              {/* 👤 Profile 個人檔案資料 */}
              <div className="sw-form-divider" style={{ color: '#00f2fe', borderColor: 'rgba(0,242,254,0.2)' }}><FileText size={12} /> 基礎通訊特徵 Profile 設定</div>

              <div className="sw-form-row">
                <div className="sw-form-group">
                  <label className="sw-form-label">真實姓名 (Full Name)</label>
                  <input
                    type="text"
                    name="fullName"
                    className="sw-form-input"
                    placeholder="例如: 歐比王"
                    value={newUser.fullName}
                    onChange={handleAddUserInputChange}
                  />
                </div>

                <div className="sw-form-group">
                  <label className="sw-form-label">數據信箱 (Email)</label>
                  <input
                    type="email"
                    name="email"
                    className="sw-form-input"
                    placeholder="obiwan@jedi.com"
                    value={newUser.email}
                    onChange={handleAddUserInputChange}
                  />
                </div>
              </div>

              <div className="sw-form-group">
                <label className="sw-form-label">加密通訊頻率 (Phone Number)</label>
                <input
                  type="text"
                  name="phoneNumber"
                  className="sw-form-input"
                  placeholder="輸入聯絡電話..."
                  value={newUser.phoneNumber}
                  onChange={handleAddUserInputChange}
                />
              </div>

              <div className="sw-form-group">
                <label className="sw-form-label">人員特徵備忘錄描述 (Bio)</label>
                <textarea
                  name="bio"
                  rows="2"
                  className="sw-form-input"
                  style={{ resize: 'none' }}
                  placeholder="輸入此節點簡介、原力脈衝評級..."
                  value={newUser.bio}
                  onChange={handleAddUserInputChange}
                />
              </div>

              <div className="sw-modal-actions" style={{ marginTop: '20px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)} 
                  className="btn-sw-control"
                  style={{ borderColor: '#ff0055', color: '#ff0055' }}
                >
                  取消封存
                </button>
                <button type="submit" className="btn-sw-control edit" disabled={isSubmitting}>
                  {isSubmitting ? "寫入矩陣中..." : "確認開拓新會員"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;