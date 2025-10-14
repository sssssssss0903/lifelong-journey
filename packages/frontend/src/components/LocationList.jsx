// src/components/LocationList.jsx
export default function LocationList({ locations, onBack }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px' }}>
      <button onClick={onBack} className="btn-return">返回</button>
      <h4>📍 已标记地点</h4>
      {locations.map((loc, idx) => (
        <div key={idx} className="log-item"
          style={{ cursor: 'pointer', padding: '8px', borderBottom: '1px solid #eee' }}>
          {loc.location_display_name || loc.location_name}
        </div>
      ))}
    </div>
  );
}
