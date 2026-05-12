import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import RegionSelector from './RegionSelector';

export default function Sidebar({ regions, addRegion, updateRegion, deleteRegion, mapLevel, setMapLevel, geoData, activeGroupId, setActiveGroupId }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>수거히어로권역</h1>
        <p>수거히어로 대리점 계약 권역</p>
      </div>

      <div className="level-toggle">
        <button
          className={`toggle-btn ${mapLevel === 'province' ? 'active' : ''}`}
          onClick={() => setMapLevel('province')}
        >
          시/도 단위
        </button>
        <button
          className={`toggle-btn ${mapLevel === 'municipal' ? 'active' : ''}`}
          onClick={() => setMapLevel('municipal')}
        >
          시/군/구 단위
        </button>
      </div>

      <button className="add-btn" onClick={addRegion}>
        <Plus size={18} />
        그룹 추가
      </button>

      <div className="region-list">
        {regions.map((region) => (
          <div 
            key={region.id} 
            className={`region-item ${activeGroupId === region.id ? 'active-group' : ''}`}
            onClick={() => setActiveGroupId(region.id)}
          >
            <div onClick={(e) => e.stopPropagation()} style={{ flex: 1, display: 'flex' }}>
              <RegionSelector
                names={region.names}
                onChange={(newNames) => updateRegion(region.id, 'names', newNames)}
                geoData={geoData}
              />
            </div>
            <input
              type="color"
              className="color-picker"
              value={region.color}
              onChange={(e) => updateRegion(region.id, 'color', e.target.value)}
            />
            <button
              className="delete-btn"
              onClick={() => deleteRegion(region.id)}
              title="삭제"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
