import api from '../api/request.js';

export default function LogDetail({ log, onBack, onExport }) {
  if (!log) return null;

  // 安全解析图片路径
  const imgs = (() => {
    try {
      return Array.isArray(log.image_path)
        ? log.image_path
        : JSON.parse(log.image_path || '[]');
    } catch {
      return [];
    }
  })();

  return (
    <>
      <button className="close-btn" onClick={onBack}>←</button>
      <div
        className="panel-content"
        style={{
          padding: '12px 16px',
          maxWidth: '520px', //   固定最大宽度（防止内容太宽）
          wordWrap: 'break-word', // 长单词自动换行
          overflowY: 'auto',
        }}
      >
        <h3 style={{ marginBottom: '8px' }}>
          📍 {log.location_display_name || log.location_name}
        </h3>

        <p><strong>🕒 时间：</strong>{new Date(log.created_at).toLocaleString()}</p>

        <div
          style={{
            marginTop: '12px',
            padding: '8px 10px',
            borderRadius: '6px',
            background: '#f9fafb',
            whiteSpace: 'pre-wrap', //  自动换行 + 保留换行符
            wordBreak: 'break-word', //  单词太长时也能换行
            lineHeight: '1.6',
            minHeight: '100px', //  视觉固定高度
          }}
        >
          <strong>📝 日志内容：</strong>
          <div style={{ marginTop: '4px' }}>{log.content}</div>
        </div>

        {imgs.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <strong>🖼 图片：</strong>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '8px',
                marginTop: '8px',
              }}
            >
              {imgs.map((src, idx) => {
                const fullSrc = src.startsWith('http')
                  ? src
                  : `${api.defaults.baseURL}${src}`;
                return (
      <img
  key={idx}
  src={fullSrc}
  alt={`图片${idx + 1}`}
  style={{
    width: '100%',
    height: 'auto',          
    objectFit: 'contain',    
    borderRadius: '6px',
    border: '1px solid #eee',
    backgroundColor: '#fafafa',
  }}
/>
                );
              })}
            </div>
          </div>
        )}

        <button
          className="export1-btn"
          onClick={onExport}
          style={{
            marginTop: '16px',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          导出此日志（PDF）
        </button>
      </div>
    </>
  );
}
