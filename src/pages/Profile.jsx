import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api'; 
import { useAuth } from '../context/AuthContext';
import { User, ShieldCheck, Cpu, Mail, Phone, BookOpen, Fingerprint, Loader2, Edit3, X } from 'lucide-react';
import './Profile.css'; // 🎯 確保引入 Profile.css

const Profile = () => {
  const { user } = useAuth(); 
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');

  // 📦 原始資料狀態機
  const [profileData, setProfileData] = useState({
    email: '',
    fullName: '',
    phoneNumber: '',
    bio: '',
    expertise: '' 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🖥️ 彈出視窗控制與表單暫存狀態機
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phoneNumber: '',
    bio: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // 📡 撈取核心數據
  const fetchDetailedProfile = async () => {
  try {
    setLoading(true);
    
    // 🎯 1. 優先從 localStorage 拿取當初登入成功時存進去的完整 user 物件
    const localUserJson = localStorage.getItem('user');
    const localUser = localUserJson ? JSON.parse(localUserJson) : null;
    
    // 🎯 2. 精準鎖定當前登入者的 ID (防禦：如果拿不到就去拿獨立的 userId)
    const userId = localUser?.id || localStorage.getItem('userId');
    
    // 🚨 【終極動態戰術點】：在控制台印出到底前端抓到誰的 ID
   console.log("🛰️ [前端戰術回報] 當前登入帳號是:", localUser?.username, "，準備請求的用戶 ID 是:", userId);
   
    
    if (!userId) {
      setError("⚠️ 無法獲取當前用戶識別碼，請重新登入！");
      return;
    }

    // ⭕ 呼叫真正的 getUserById，不寫死、不盲目傳 token (攔截器會全自動代勞)
    const res = await userAPI.getUserById(userId);
    
    console.log("📥 [後端回傳 DTO 數據庫]:", res.data);

    if (res && res.data) {
  // 🎯 用極度嚴格的防禦手段，防止 res.data.userProfile 是 null 而崩潰
  const fetchedData = {
    email: res.data.email || '',
    fullName: res.data.userProfile?.fullName || '未填寫姓名',
    phoneNumber: res.data.userProfile?.phoneNumber || '未填寫電話',
    bio: res.data.userProfile?.bio || '這個人很懶，什麼都沒寫。',
    expertise: res.data.teacher?.expertise || ''
  };
  
  setProfileData(fetchedData);
  setFormData({
    email: fetchedData.email,
    fullName: fetchedData.fullName,
    phoneNumber: fetchedData.phoneNumber,
    bio: fetchedData.bio
  });
} else {
  throw new Error("後端回傳的資料格式不正確或為空");
}
  } catch (err) {
    console.error("❌ 撈取個人檔案失敗：", err);
    setError(err.message || '無法載入個人檔案');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchDetailedProfile();
  }, [token, user]);

  // ✏️ 開啟彈窗並帶入最新緩存
  const openModal = () => {
    setFormData({
      email: profileData.email,
      fullName: profileData.fullName,
      phoneNumber: profileData.phoneNumber,
      bio: profileData.bio
    });
    setIsModalOpen(true);
  };

  // ⌨️ 即時偵測輸入變更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 🔒 送出變更進行核心資料覆寫
  const handleUpdateProfile = async (e) => {
  e.preventDefault();
  const userId = user?.id || localStorage.getItem('userId');
  
  try {
    setIsUpdating(true);
    
    // 🎯 包裝成後端 UserController / UserService 期待的嵌套物件結構
    
    const updatePayload = {
      email: formData.email,
      userProfile: {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        bio: formData.bio
      }
    };

    // ⭕ 改用 api.js 定義的 updateUser
    const res = await userAPI.updateUser(userId, updatePayload);
    
    if (res.status === 200) {
      alert('✨ 核心身分資料覆寫成功！');
      setProfileData(prev => ({ ...prev, ...formData }));
      setIsModalOpen(false);
    }
  } catch (err) {
    alert(err || '更新失敗，請檢查後端連線');
  } finally {
    setIsUpdating(false);
  }
};

  // ⏳ 緩衝動畫載入畫面
  if (loading) {
    return (
      <div className="profile-container-width sw-card-loading">
        <Loader2 className="sw-spinner" size={40} />
        <p>📡 正在與星中央數據庫進行加密連線...</p>
      </div>
    );
  }

  // 🚫 未授權攔截器
  if (!token) {
    return (
      <div className="profile-container-width dashboard-section sw-card-denied">
        <h2 className="sw-denied-title">🚨 ACCESS DENIED // 存取拒絕</h2>
        <p className="sw-denied-subtitle">尚未偵測到您的通行權限 Token，請先前往登入。</p>
      </div>
    );
  }

  return (
    <div className="profile-container-width">
      {/* 🚀 頂層左右 1:1 Flex 容器，釋放寬度 */}
      <div className="profile-cards-flex-wrapper">
        
        {/* ==================== 🛠️ 左側：原有的個人檔案資料卡 ==================== */}
        <div className="dashboard-section sw-profile-card-relative">
          {/* 頂部動態色彩條 */}
          <div className={`profile-top-bar ${
            role === 'ROLE_ADMIN' ? 'theme-admin' : 
            role === 'ROLE_TEACHER' ? 'theme-teacher' : 'theme-student'
          }`}></div>

          <div className="profile-title-flex">
            <h2 className="sw-card-title">
              <User size={20} /> 個人檔案中心
            </h2>
            <span className={`user-role-tag ${
              role === 'ROLE_ADMIN' ? 'theme-admin' : 
              role === 'ROLE_TEACHER' ? 'theme-teacher' : 'theme-student'
            }`}>
              {role === 'ROLE_ADMIN' ? 'ADMIN // 系統掌控者' : 
               role === 'ROLE_TEACHER' ? 'TEACHER // 學院導師' : 'STUDENT // 星際探險家'}
            </span>
          </div>

          <p className="sw-card-subtitle">
            歡迎回來，{username}。在此檢視並修訂您的身分核心編碼。
          </p>

          <div className="profile-grid-matrix">
            <div className="matrix-data-cell">
              <span className="cell-label"><Fingerprint size={12} /> DC帳號 ID</span>
              <span className="cell-value value-highlight">{username}</span>
            </div>
            <div className="matrix-data-cell">
              <span className="cell-label"><ShieldCheck size={12} /> 核心安全性角色</span>
              <span className="cell-value text-purple">{role}</span>
            </div>
            <div className="matrix-data-cell font-span-2">
              <span className="cell-label"><Mail size={12} /> 加密通訊信箱 (Email)</span>
              <span className="cell-value">{profileData.email || '未連結星際信箱'}</span>
            </div>
            <div className="matrix-data-cell font-span-2">
              <span className="cell-label"><Cpu size={12} /> 真實法定姓名</span>
              <span className="cell-value">{profileData.fullName || '未註冊'}</span>
            </div>
            <div className="matrix-data-cell font-span-2">
              <span className="cell-label"><Phone size={12} /> 加密通訊頻率 (電話)</span>
              <span className="cell-value">{profileData.phoneNumber || '未連結'}</span>
            </div>
            <div className="matrix-data-cell font-span-2">
              <span className="cell-label"><BookOpen size={12} /> 個人特徵備忘錄 (Bio)</span>
              <span className="cell-value font-bio-text">{profileData.bio || '這名宇宙探險家非常神秘，尚未留下任何備忘錄...'}</span>
            </div>
          </div>

          <div className="profile-footer-actions">
            <button className="btn-sw btn-sw-update" onClick={openModal}>
              <Edit3 size={15} /> 覆寫核心數據
            </button>
          </div>
        </div>

        {/* ==================== 🎯 右側：動態星戰特權角色卡 ==================== */}
        <div className={`dashboard-section sw-profile-card-relative starwars-role-card ${
          role === 'ROLE_ADMIN' ? 'matrix-admin' : 
          role === 'ROLE_TEACHER' ? 'matrix-teacher' : 'matrix-student'
        }`}>
          {/* 頂部動態色彩條同步 */}
          <div className={`profile-top-bar ${
            role === 'ROLE_ADMIN' ? 'theme-admin' : 
            role === 'ROLE_TEACHER' ? 'theme-teacher' : 'theme-student'
          }`}></div>

{/* 🔴 管理員身份卡：黑武士 達斯·維達 */}
{role === 'ROLE_ADMIN' && (
  <>
    <div className="role-card-header">
      <span className="role-badge badge-admin">LEVEL MAX // SITH LORD</span>
      <h3 className="role-main-title">最高管理員</h3>
    </div>
    {/* 🎯 變更此處 className，強制轉為垂直流，防止左右擠壓 */}
    <div className="role-card-body-vertical">
      <div className="starwars-avatar-frame glow-admin">
        <img src="https://media.gq.com.tw/photos/6143e953e5205adbb09e1d27/1:1/w_547,h_547,c_limit/a1902144519c81b49dbc2c77cbd83d0d.jpeg" alt="Darth Vader" />
      </div>
      <ul className="starwars-privilege-list">
        <li>⚡ 掌控終端全站最高權限</li>
        <li>🛠️ 擁有開拓、修剪、抹除任何課程權限</li>
        <li>🛡️ 即時監控全星系所有導師與學徒的動態連線</li>
      </ul>
    </div>
    <div className="role-card-footer">"I AM ALTERING THE DEAL. REBOOT SYSTEM."</div>
  </>
)}

          {/* 🟢 老師身份卡：尤達大師 */}
          {role === 'ROLE_TEACHER' && (
            <>
              <div className="role-card-header">
                <span className="role-badge badge-teacher">LEVEL 02 // JEDI MASTER</span>
                <h3 className="role-main-title">學院導師</h3>
              </div>
              <div className="role-card-body">
                <div className="starwars-avatar-frame glow-teacher">
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkvmv2Z8TWtxkc426C5RSdDdwQr83bBrJHJ7eSjrdTapRifsOF3kqiYK6D&s=10" alt="Yoda" />
                </div>
                <ul className="starwars-privilege-list">
                  <li>📚 傳授課程：全新課程與修訂教材內容</li>
                  <li>📊 查閱所有絕地學徒的修業名冊</li>
                  <li>🔒 無權干涉或刪除其餘大師之檔案庫</li>
                </ul>
              </div>
              <div className="role-card-footer">"DO. OR DO NOT. THERE IS NO TRY."</div>
            </>
          )}

          {/* 🔵 學生身份卡：絕地學徒 (帕達旺) */}
          {role === 'ROLE_STUDENT' && (
            <>
              <div className="role-card-header">
                <span className="role-badge badge-student">LEVEL 01 // PADAWAN</span>
                <h3 className="role-main-title">絕地學徒</h3>
              </div>
              <div className="role-card-body">
                <div className="starwars-avatar-frame glow-student">
                  <img src="https://cdn2.ettoday.net/images/4601/d4601855.jpg" alt="Padawan" />
                </div>
                <ul className="starwars-privilege-list">
                  <li>🛰️ 開啟選課：允許自由瀏覽並報名各項知識矩陣</li>
                  <li>💳 消耗點數，兌換各大導師之學分</li>
                  <li>🚫 防火牆禁制：全面隔絕任何修改或刪除之操作</li>
                </ul>
              </div>
              <div className="role-card-footer">"MAY THE FORCE BE WITH YOUR LEARNING PROTOCOL."</div>
            </>
          )}
        </div>

      </div>

      {/* 🖥️ 彈出式更新視窗 */}
      {isModalOpen && (
        <div className="sw-modal-overlay">
          <div className="sw-modal-content">
            <div className="modal-header-flex">
              <h3><Cpu size={18} /> 覆寫檔案系統核心編碼</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdateProfile}>
              <div className="sw-input-group">
                <label className="sw-input-label"><Mail size={14} /> 變更加密信箱 (Email)</label>
                <input 
                  type="email" 
                  name="email"
                  className="sw-input-field" 
                  placeholder="請輸入 Email"
                  value={formData.email} 
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="sw-input-group">
                <label className="sw-input-label"><Cpu size={14} /> 更新真實姓名 (Full Name)</label>
                <input 
                  type="text" 
                  name="fullName"
                  className="sw-input-field" 
                  placeholder="請輸入姓名"
                  value={formData.fullName} 
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="sw-input-group">
                <label className="sw-input-label"><Phone size={14} /> 加密通訊頻率 (電話)</label>
                <input 
                  type="text" 
                  name="phoneNumber"
                  className="sw-input-field" 
                  placeholder="請輸入聯絡電話"
                  value={formData.phoneNumber} 
                  onChange={handleInputChange}
                />
              </div>
              <div className="sw-input-group">
                <label className="sw-input-label"><BookOpen size={14} /> 個人特徵備忘錄 (Bio)</label>
                <textarea 
                  name="bio"
                  rows="4"
                  className="sw-input-field modal-textarea" 
                  placeholder="介紹一下你自己..."
                  value={formData.bio} 
                  onChange={handleInputChange}
                />
              </div>
              <div className="modal-btn-group">
                <button type="button" className="modal-btn-cancel" onClick={() => setIsModalOpen(false)}>放棄修訂</button>
                <button type="submit" className="modal-btn-save" disabled={isUpdating}>
                  {isUpdating ? "正在覆寫核心..." : "確認覆寫數據"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;