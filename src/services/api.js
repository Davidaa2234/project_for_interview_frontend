import axios from 'axios';

// 🚀 開發階段(前後端分離運作)：指定後端 Spring Boot 的絕對路徑與 Port 號
const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

/**
 * 🔒 1. 請求攔截器：實作「身份保持」規範
 * 每次前端發送 API 請求前，會自動去 localStorage 撈取 Token
 * 如果存在，就自動在 Header 附掛 Authorization: Bearer <TOKEN>
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 🚨 2. 回應攔截器：實作「未繳費擋修精準報錯」
 * 當後端回傳 400 且訊息為 "未繳費" 時，精準識別並向上拋出，以便 UI 彈出警告視窗
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // 🎯 核心攔截點：學生選課若未繳費，後端回傳 400 Bad Request 搭配 "未繳費" 文字
      if (status === 400 && data === '未繳費') {
        return Promise.reject('未繳費');
      }
      
      if (status === 401 || status === 403) {
        return Promise.reject(data || '您無權執行此操作或認證已過期！');
      }
      
      return Promise.reject(data || '伺服器發生錯誤');
    }
    return Promise.reject('網路連線異常，請確認後端 Spring Boot 是否正常啟動！');
  }
);

// 🌍 導出各模組封裝的 API 呼叫方法
export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
};

export const adminAPI = {
  // 1. 調閱全星系人員名冊
  getAllUsers: () => api.get('/api/admin/users'),
  
  // 2. 帳號啟用 / 停權狀態調校
  toggleStatus: (id, enabled) => api.put(`/api/api/admin/users/${id}/status?enabled=${enabled}`),
  
  // 3. 金流防護盾狀態切換
  togglePayment: (id, isPaid) => api.put(`/api/admin/users/${id}/payment?isPaid=${isPaid}`),

  // ==================== 🌟 核心新增 1：開拓全新人員憑證 (對應後端 POST) ====================
  // 將前端包裝好的 { username, password, role, fullName, email, phoneNumber, bio } 封裝一併打入後端管理端點
  createUser: (userData) => api.post('/api/admin/users', userData),

  // ==================== 🌟 核心新增 2：修復既有組件的 updateUser 呼叫 ====================
  // 配合你的 AdminDashboard.jsx 修改現有用戶功能，將數據對準後端管理更新端點
  updateUser: (id, userData) => api.put(`/api/admin/users/${id}`, userData)
  
};

export const courseAPI = {
  getAllCourses: () => api.get('/api/courses'),

  // 🎯【選課終極簡化版】：交給攔截器自動附掛 Token，避免手動覆寫 Headers 出錯
  enrollCourse: (courseId) => {
    // 💡 從 localStorage 拿取登入時儲存的用戶資料
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    const studentId = user ? user.id : null;

    if (!studentId) {
      return Promise.reject(new Error("⚠️ 無法獲取當前學員識別碼，請重新登入！"));
    }

    // 🚀 乾乾淨淨地發送請求，Axios 攔截器會自動在背後幫你補上正確的 Bearer Token！
    return api.post(`/api/students/${studentId}/courses/${courseId}`, {});
  },
  // ==================== 🌟 核心修正：管理員獨立創建新課程 ====================
  // 完美適配後端的 @RequestParam(required = false) 與 @RequestBody
  createCourse: (teacherId, courseData) => {
    // 如果 teacherId 是 null 或空字串，URL 就不帶參數，或者帶上空值
    const url = teacherId ? `/api/courses?teacherId=${teacherId}` : '/api/courses';
    return api.post(url, courseData);
  },

  /** 📡 獲取管理員全站選課情資矩陣 */
  getAdminSelectionMonitor: () => api.get('/api/courses/monitor/admin'),

  /** 📡 獲取特聘講師名下專屬選課情資 */
  getTeacherSelectionMonitor: (teacherId) => api.get(`/api/courses/monitor/teacher/${teacherId}`)
};

export const studentAPI = {
  getAllStudents: () => api.get('/api/students'),
  enrollCourse: (studentId, courseId) => api.post(`/api/students/${studentId}/courses/${courseId}`),
  dropCourse: (studentId, courseId) => api.delete(`/api/students/${studentId}/courses/${courseId}`),
};

export const teacherAPI = {
  // 1. 調閱特聘講師名冊
  getAllTeachers: () => api.get('/api/teachers'),

  // 🎯 補上這一段：管理員新聘特聘導師一體化建檔 (對應後端 POST /api/teachers)
  createTeacher: (createPayload) => api.post('/api/teachers', createPayload),

  // 🎯 補上這一段：修訂導師核心特徵矩陣 (對應後端 PUT /api/teachers/{id})
  updateTeacher: (id, updatePayload) => api.put(`/api/teachers/${id}`, updatePayload),

  // 2. 講師發布新課程
  publishCourse: (teacherId, courseData) => api.post(`/api/teachers/${teacherId}/courses`, courseData),

  // 3. 調閱該講師名下的修課學生矩陣
  getMyStudents: (teacherId) => api.get(`/api/teachers/${teacherId}/students`),
};



// 📡 注入用戶中心專用戰術路由
export const userAPI = {
  // 透過 ID 撈取安全去密碼化的用戶 DTO 資料 (對應 /api/users/{id})
  getUserById: (id) => api.get(`/api/users/${id}`),
  
  // 🎯 【精準對齊修正】：將原本不小心寫錯的 api.get 改回正確的 api.put，才能完美觸發後端 @PutMapping
  updateUser: (id, userData) => api.put(`/api/users/${id}`, userData)
};

export default api;