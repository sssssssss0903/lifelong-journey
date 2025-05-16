import { useState } from 'react';
import axios from 'axios';
import { LOCATION_MAPPING } from './utils/locationMapping';

export default function AddPanel({ onClose, setMarkedRegions, coord, city }) {

const [location, setLocation] = useState(city || '');
  const [image, setImage] = useState(null);
  const [content, setContent] = useState('');

  const username = localStorage.getItem('username');

  const handleSubmit = async () => {
    const trimmedLocation = location.trim();

    if (!trimmedLocation || !content.trim()) {
      alert('地点或日志内容不能为空');
      return;
    }

    const formData = new FormData();
formData.append('username', username);
formData.append('location_name', city); // 自动城市名，用于打点标识
formData.append('location_display_name', trimmedLocation); // 用户填写的显示名
formData.append('longitude', coord?.[0]);
formData.append('latitude', coord?.[1]);
formData.append('content', content);
if (image) formData.append('image', image);


    try {
      const res = await axios.post('/api/upload-log', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert(res.data.message);
      onClose();

      // 上传成功后刷新标记点
      const refreshMarkers = async () => {
        try {
          const res = await axios.get(`/api/user-log?username=${username}`);
          setMarkedRegions(res.data.marked_locations || []);
        } catch (err) {
          console.error('刷新标记区域失败:', err.message);
        }
      };
      refreshMarkers();
    } catch (err) {
      alert(err.response?.data?.message || '提交失败');
    }
  };

  return (
    <div className="add-panel">
      <h2 className="panel-title">➕ 添加足迹</h2>
      <p><strong>城市：</strong>{city}</p>
<p><strong>经纬度：</strong>{coord?.[0]}, {coord?.[1]}</p>

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
