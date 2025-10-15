import { useState } from "react";
import { uploadFileWithResume } from "../utils/uploader";
import api from '../api/request.js'

export default function AddPanel({ onClose, coord, city, refreshLogs }) {
  const [location, setLocation] = useState(city || "");
  const [images, setImages] = useState([]);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const username = localStorage.getItem("username");

  // 上传逻辑
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files]);
  };

  const handleRemove = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (files) => {
    const urls = [];
    for (const f of files) {
      const res = await uploadFileWithResume(api, f, {
        onProgress: (ratioOrDone) => {
          setUploadProgress((p) => ({
            ...p,
            [f.name]: typeof ratioOrDone === "number" ? ratioOrDone : 1,
          }));
        },
      });
      urls.push(res.url);
    }
    return urls;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!location.trim() || !content.trim()) {
      alert("地点或日志内容不能为空");
      return;
    }

    try {
      setSubmitting(true);
      const imageUrls = images.length ? await uploadImages(images) : [];
      const payload = {
        username,
        location_name: city,
        location_display_name: location.trim(),
        longitude: coord?.[0],
        latitude: coord?.[1],
        content,
        images: imageUrls,
      };
      const res = await api.post(`/api/users/${username}/logs`, payload);
      alert(res.data.message || "提交成功");
      await refreshLogs?.();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="add-panel"
      style={{
        width: 420, //   固定宽度
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
        boxSizing: "border-box",
        borderLeft: "1px solid #f1f5f9",
        borderRight: "1px solid #f1f5f9",
        position: "relative",
      }}
    >
      {/* 可滚动内容区 */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 20px 96px",
        }}
      >
        {/* 标题 */}
        <h2
          className="panel-title"
          // style={{
          //   display: "flex",
          //   alignItems: "center",
          //   gap: 8,
          //   fontSize: 22,
          //   fontWeight: 700,
    
          // }}
        >
          添加足迹
        </h2>

        {/* 城市与经纬度 */}
        <div style={{ marginTop: 16 }}>
          <p style={{ marginBottom: 6 }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="#ef4444"
              style={{ marginRight: 6, verticalAlign: "middle" }}
              viewBox="0 0 16 16"
            >
              <path d="M8 0a5 5 0 0 0-5 5c0 4 5 11 5 11s5-7 5-11a5 5 0 0 0-5-5zM8 7a2 2 0 1 1 2-2A2 2 0 0 1 8 7z" />
            </svg>
            <strong>城市：</strong>{city}
          </p>
          <p style={{ marginBottom: 12 }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="#ef4444"
              style={{ marginRight: 6, verticalAlign: "middle" }}
              viewBox="0 0 16 16"
            >
              <path d="M8 16a8 8 0 1 0-8-8 8.009 8.009 0 0 0 8 8zM7.5 4.5A.5.5 0 0 1 8 4h.01a.5.5 0 0 1 .49.5v3.793l2.146 2.147a.5.5 0 0 1-.708.708L7.5 8.707z" />
            </svg>
            <strong>经纬度：</strong>{coord?.[0]}, {coord?.[1]}
          </p>
        </div>

        {/* 地点名称 */}
        <label
          className="form-label"
          style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="#ef4444"
            viewBox="0 0 16 16"
          >
            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0-3-3 3 3 0 0 0 3 3z" />
          </svg>
          地点名称（可自定义）
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="form-input"
          style={{
            marginBottom: 20,
            width: "100%",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            padding: "8px 12px",
          }}
        />

        {/* 图片上传 */}
        <label
          className="form-label"
          style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="#ef4444"
            viewBox="0 0 16 16"
          >
            <path d="M4.502 1a.5.5 0 0 0-.5.5v2.001H1.5a.5.5 0 0 0-.5.5v10.001a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5V4.002a.5.5 0 0 0-.5-.5h-2.5V1.5a.5.5 0 0 0-.5-.5h-7zM8 5.5a2.5 2.5 0 1 1 0 5.001A2.5 2.5 0 0 1 8 5.5z" />
          </svg>
          图片上传
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          style={{ marginBottom: images.length ? 12 : 20 }}
        />

        {/* 图片预览 */}
        {images.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {images.map((file, index) => (
              <div
                key={index}
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  border: "1px solid #eee",
                  borderRadius: 6,
                  overflow: "hidden",
                  position: "relative",
                  background: "#fafafa",
                }}
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                {uploadProgress[file.name] > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      height: 4,
                      width: `${uploadProgress[file.name] * 100}%`,
                      background:
                        uploadProgress[file.name] < 1 ? "#f87171" : "#22c55e",
                      transition: "width .2s ease",
                    }}
                  />
                )}
                <button
                  onClick={() => handleRemove(index)}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    border: "none",
                    background: "rgba(239,68,68,0.8)",
                    color: "#fff",
                    borderRadius: "50%",
                    width: 22,
                    height: 22,
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 日志内容 */}
        <label
          className="form-label"
          style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="#ef4444"
            viewBox="0 0 16 16"
          >
            <path d="M2 2h12v12H2z" fill="none" />
            <path d="M3 4h10v1H3zm0 2h10v1H3zm0 2h10v1H3z" />
          </svg>
          日志内容
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="记录一些回忆..."
          style={{
            minHeight: 220,
            resize: "vertical",
            width: "100%",
            padding: "12px 14px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            boxSizing: "border-box",
            lineHeight: 1.6,
            fontSize: 15,
          }}
        />
      </div>

      {/* 底部按钮 */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "12px 16px",
          borderTop: "1px solid #f1f5f9",
          backgroundColor: "#fff",
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "#f3f4f6",
            border: "none",
            padding: "10px 16px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          关闭
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            background: submitting
              ? "#9aa5b1"
              : "linear-gradient(180deg,#ef4444,#b91c1c)",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: 8,
            cursor: submitting ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "提交中..." : "提交"}
        </button>
      </div>
    </div>
  );
}
