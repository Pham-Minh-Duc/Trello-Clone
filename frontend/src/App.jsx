
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Boards from './pages/Board';
import BoardDetail from './pages/BoardDetail';
import InvitationPage from './pages/InvitationPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Boards />} />
        <Route path="/board/:boardId" element={<BoardDetail />} />
        <Route path="/invitation/:inviteId" element={<InvitationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
