export default function LogList({
  logs,
  page,
  totalPages,
  keyword,
  city,
  onKeywordChange,
  onCityChange,
  onSearch,
  onReset,
  onSelectLog,
  onDeleteLog,
  onPageChange,
  onBack,
  onExport,
}) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px' }}>
      <button onClick={onBack} className="btn-return">返回</button>
      <h4>📓 日志列表</h4>

      {/* 搜索栏 */}
      <div style={{ marginBottom: '10px' }}>
        <div className="search-bar">
          <input className="search-input" placeholder="关键词" value={keyword} onChange={onKeywordChange} />
          <input className="search-input" placeholder="城市" value={city} onChange={onCityChange} />
          <button className="search-btn" onClick={onSearch}>搜索</button>
          <button className="reset-btn" onClick={onReset}>重置</button>
        </div>
      </div>

      <button className="export-btn" onClick={onExport}>导出全部日志（CSV）</button>

      {/* 日志卡片 */}
      {logs.map((log, idx) => (
        <div
          key={idx}
          className="log-item"
          onClick={() => onSelectLog(log)}
          style={{
            cursor: 'pointer',
            borderBottom: '1px solid #ccc',
            marginBottom: '8px',
            paddingBottom: '6px',
            position: 'relative',
          }}
        >
          <div className="log-content" style={{ paddingRight: 60, wordBreak: 'break-word' }}>
            <div><strong>📍 地点：</strong>{log.location_display_name || log.location_name}</div>

            {/*   限制为一行预览 + 不超宽度 */}
    <div
  style={{
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2, // 最多显示2行
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    wordBreak: 'break-word',
    color: '#333',
    maxWidth: '100%',
    lineHeight: '1.4em',
  }}
  title={log.content}
>
  <span style={{ fontWeight: 700 }}>📝 内容：</span>
  {log.content}
</div>


            <div style={{ color: '#555' }}>
              <strong>🕒 时间：</strong>{new Date(log.created_at).toLocaleString()}
            </div>
          </div>

          {/* 删除按钮右上角浮动 */}
          <button
            className="delete-button"
            onClick={e => {
              e.stopPropagation();
              onDeleteLog(log.id);
            }}
            style={{
        border: 'none',
      background: '#ef4444',
      color: '#fff',
      borderRadius: 6,
      padding: '6px 12px',
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: 600,
      transition: 'background 0.2s',
            }}
          >
            删除
          </button>
        </div>
      ))}

      {/* 分页 */}
      <div className="pagination" style={{ textAlign: 'center', marginTop: 10 }}>
        <button disabled={page === 1} onClick={() => onPageChange(page - 1)}>上一页</button>
        <span style={{ margin: '0 10px' }}>{page} / {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>下一页</button>
      </div>
    </div>
  );
}
