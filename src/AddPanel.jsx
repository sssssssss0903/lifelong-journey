export default function AddPanel({ onClose }) {
    return (
      <div className="add-panel">
        <h2 className="panel-title">➕ 添加足迹</h2>
  
        <label className="form-label">地点名称</label>
        <input
          type="text"
          placeholder="如：武汉大学"
          className="form-input"
        />
  
        <label className="form-label">图片上传</label>
        <div className="upload-area">
          点击或拖拽上传图片
        </div>
  
        <label className="form-label">日志内容</label>
        <textarea
          rows={4}
          placeholder="记录一些回忆..."
          className="form-input"
        />
  
        <button className="submit-button">提交</button>
  
        <button onClick={onClose} className="close-button">
          关闭
        </button>
      </div>
    );
  }
  