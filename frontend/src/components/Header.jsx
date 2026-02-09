import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  // Giả sử ta lấy email từ token hoặc localStorage
  const userEmail = localStorage.getItem('email') || 'User'; 

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <header className="h-14 px-6 bg-blue-700 flex items-center justify-between text-white shadow-md">
      <div className="text-xl font-bold italic tracking-tighter">TRELLO CLONE</div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center font-bold">
            {userEmail[0].toUpperCase()}
          </div>
          <span className="text-sm font-medium hidden md:block">{userEmail}</span>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm font-semibold transition"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
};

export default Header;