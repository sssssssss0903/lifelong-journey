import { useState } from 'react';
import axios from 'axios';

export default function AddPanel({ onClose }) {
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);
  const [content, setContent] = useState('');

  const username = localStorage.getItem('username');

  const handleSubmit = async () => {
    if (!location.trim() || !content.trim()) {
      alert('地点或日志内容不能为空');
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('location_name', location);
    formData.append('content', content);
    if (image) formData.append('image', image);

    try {
      const res = await axios.post('/api/upload-log', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(res.data.message);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || '提交失败');
    }
  };

  return (
    <div className="add-panel">
      <h2 className="panel-title">➕ 添加足迹</h2>

      <label className="form-label">地点名称</label>
      <input
        type="text"
        value={location}
        onChange={e => setLocation(e.target.value)}
        placeholder="如：武汉"
        className="form-input"
      />

      <label className="form-label">图片上传</label>
      <input
        type="file"
        accept="image/*"
        onChange={e => setImage(e.target.files[0])}
        className="form-input"
      />

      <label className="form-label">日志内容</label>
      <textarea
        rows={8}
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="记录一些回忆..."
        className="form-input"
      />

      <button className="submit-button" onClick={handleSubmit}>提交</button>
      <button onClick={onClose} className="close-button">关闭</button>
    </div>
  );
}
