// src/components/UserHeader.jsx
import avatarImg from '../assets/avatar.png';

export default function UserHeader({ username, onLogout, onChart }) {
  return (
    <div className="user-info">
      <div className="user-avatar"><img src={avatarImg} alt="avatar" /></div>
      <div className="username">{username}</div>
      <div className="user-buttons">
        <button className="logout-button" onClick={onLogout}>退出登录</button>
        <button className="chart-button" onClick={onChart}>可视分析</button>
      </div>
    </div>
  );
}
