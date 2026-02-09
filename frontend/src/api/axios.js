import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động đính kèm Token vào mọi request gửi đi
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý dữ liệu trả về và bắt lỗi tập trung
axiosClient.interceptors.response.use(
  (response) => response.data, // Trả về data luôn, không cần .data ở phía sau
  (error) => {
    if (error.response && error.response.status === 401) {
      // Nếu token hết hạn, xóa token và đá user về trang login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;