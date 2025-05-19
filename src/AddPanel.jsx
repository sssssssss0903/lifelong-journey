import { useState, useRef } from 'react';
import axios from 'axios';

export default function AddPanel({ onClose, setMarkedRegions, coord, city }) {
    const [location, setLocation] = useState(city || '');
    const [image, setImage] = useState([]);
    const [content, setContent] = useState('');

    const username = localStorage.getItem('username');

    const refreshMarkers = async () => {
        try {
            const res = await axios.get(`/api/user-logs?username=${username}`);
            setMarkedRegions(res.data.logs || []);
        } catch (err) {
            console.error('刷新标记区域失败:', err.message);
        }
    };

    const handleSubmit = async () => {
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
            image.forEach((file) => {
                formData.append('images', file);
            });
        }

        try {
            const res = await axios.post('/api/upload-log', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            alert(res.data.message);

            await refreshMarkers();

            onClose();
        } catch (err) {
            alert(err.response?.data?.message || '提交失败');
        }
    };

    // 拖拽宽度逻辑
    const [width, setWidth] = useState(400); // 初始宽度
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

        const deltaX = e.clientX - startX.current;
        let newWidth = startWidth.current + deltaX;

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
                userSelect: dragging.current ? 'none' : 'auto', // 拖动时防止选中内容
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
            <button className="submit-button" onClick={handleSubmit}>提交</button>
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
