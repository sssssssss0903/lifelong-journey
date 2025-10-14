// src/components/MedalPanel.jsx
import medalBronze from '../assets/medal_bronze.png';
import medalBronzeGray from '../assets/medal_bronze_gray.png';
import medalSilver from '../assets/medal_silver.png';
import medalSilverGray from '../assets/medal_silver_gray.png';
import medalGold from '../assets/medal_gold.png';
import medalGoldGray from '../assets/medal_gold_gray.png';

import locationBronze from '../assets/location_bronze.png';
import locationBronzeGray from '../assets/location_bronze_gray.png';
import locationSilver from '../assets/location_silver.png';
import locationSilverGray from '../assets/location_silver_gray.png';
import locationGold from '../assets/location_gold.png';
import locationGoldGray from '../assets/location_gold_gray.png';

/**
 * 勋章展示面板
 * @param {object} props
 * @param {object} props.stats - 用户统计（logs_count, marked_count）
 * @param {function} props.onBack - 点击“返回”回调
 */
export default function MedalPanel({ stats, onBack }) {
  if (!stats) return <div>暂无数据</div>;

  // 计算勋章
  const logCount = stats.logs_count || 0;
  const markedCount = stats.marked_count || 0;

  const logMedals = [
    { name: '初学者', earned: logCount >= 1, image: logCount >= 1 ? medalBronze : medalBronzeGray, desc: '上传 1 条日志即可获得此勋章' },
    { name: '熟练旅者', earned: logCount >= 10, image: logCount >= 10 ? medalSilver : medalSilverGray, desc: '上传 10 条日志即可获得此勋章' },
    { name: '足迹大师', earned: logCount >= 50, image: logCount >= 50 ? medalGold : medalGoldGray, desc: '上传 50 条日志即可获得此勋章' },
  ];

  const locationMedals = [
    { name: '探索者', earned: markedCount >= 1, image: markedCount >= 1 ? locationBronze : locationBronzeGray, desc: '标记 1 个地点即可获得此勋章' },
    { name: '探险家', earned: markedCount >= 5, image: markedCount >= 5 ? locationSilver : locationSilverGray, desc: '标记 5 个地点即可获得此勋章' },
    { name: '地图征服者', earned: markedCount >= 20, image: markedCount >= 20 ? locationGold : locationGoldGray, desc: '标记 20 个地点即可获得此勋章' },
  ];

  const allMedals = [...logMedals, ...locationMedals];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px' }}>
      <button onClick={onBack} className="btn-return">返回</button>
      <h4 style={{ marginBottom: '10px' }}>🏅 我的勋章</h4>

      {allMedals.length > 0 ? (
        <div
          className="medal-grid-container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
          }}
        >
          {allMedals.map((medal, idx) => (
            <div
              key={idx}
              className={`medal-item ${medal.earned ? 'earned' : 'unearned'}`}
              style={{
                borderRadius: '12px',
                background: medal.earned ? '#f0fff0' : '#f8f8f8',
                border: medal.earned ? '2px solid #5cb85c' : '2px dashed #ccc',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                padding: '12px',
                transition: 'transform 0.2s',
                cursor: 'default',
              }}
              title={medal.desc}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1.0)')}
            >
              <img
                src={medal.image}
                alt={medal.name}
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  filter: medal.earned ? 'none' : 'grayscale(100%)',
                  marginBottom: '8px',
                }}
              />
              <div
                style={{
                  fontWeight: 'bold',
                  fontSize: '14px',
                  color: medal.earned ? '#333' : '#aaa',
                }}
              >
                {medal.name}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                {medal.desc}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>暂无勋章</p>
      )}
    </div>
  );
}
