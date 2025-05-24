import { useState, useRef } from 'react';
import api from './api';

export default function AddPanel({ onClose, coord, city, refreshLogs }) {
  const [location, setLocation] = useState(city || '');
  const [image, setImage] = useState([]);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const username = localStorage.getItem('username');

  const handleSubmit = async () => {
    if (submitting) return;

    const trimmedLocation = location.trim();
    if (!trimmedLocation || !content.trim()) {
      alert('地点或日志内容不能为空');
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('location_name', city);
    formData.append('location_display_name', trimmedLocation);
    formData.append('longitude', coord?.[0]);
    formData.append('latitude', coord?.[1]);
    formData.append('content', content);

    if (image && Array.isArray(image)) {
      image.forEach(file => formData.append('images', file));
    }

    try {
      setSubmitting(true);
      const res = await api.post('/api/upload-log', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert(res.data.message);
      await refreshLogs?.();  // 更新地图和日志列表
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  // 拖拽宽度逻辑
  const [width, setWidth] = useState(400);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const dragging = useRef(false);

  const minWidth = 300;
  const maxWidth = 800;

  const onMouseDown = (e) => {
    dragging.current = true;
    startX.current = e.clientX;
    startWidth.current = width;

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    e.preventDefault();
  };

  const onMouseMove = (e) => {
    if (!dragging.current) return;
    let newWidth = startWidth.current + (e.clientX - startX.current);
    if (newWidth < minWidth) newWidth = minWidth;
    if (newWidth > maxWidth) newWidth = maxWidth;
    setWidth(newWidth);
  };

  const onMouseUp = () => {
    dragging.current = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      className="add-panel"
      style={{
        width,
        border: '1px solid #ccc',
        padding: '16px',
        position: 'relative',
        backgroundColor: 'white',
        borderRadius: 6,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        userSelect: dragging.current ? 'none' : 'auto',
      }}
    >
      <h2 className="panel-title">➕ 添加足迹</h2>
      <p><strong>城市：</strong>{city}</p>
      <p><strong>经纬度：</strong>{coord?.[0]}, {coord?.[1]}</p>

      <label className="form-label">地点名称（可自定义）</label>
      <input
        type="text"
        value={location}
        onChange={e => setLocation(e.target.value)}
        className="form-input"
      />

      <label className="form-label">图片上传</label>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={e => setImage([...e.target.files])}
      />

      <label className="form-label">日志内容</label>
      <textarea
        rows={8}
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="记录一些回忆..."
        className="form-input"
      />

      <button
        className="submit-button"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? '提交中...' : '提交'}
      </button>
      <button onClick={onClose} className="close-button">关闭</button>

      {/* 拖动条 */}
      <div
        onMouseDown={onMouseDown}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '8px',
          height: '100%',
          cursor: 'ew-resize',
          userSelect: 'none',
          backgroundColor: 'transparent',
          zIndex: 10,
        }}
        title="拖动调整宽度"
      />
    </div>
  );
}
