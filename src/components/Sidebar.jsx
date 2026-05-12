import React, { useRef } from 'react';
import { Plus, Trash2, Download, Upload } from 'lucide-react';
import RegionSelector from './RegionSelector';

export default function Sidebar({ regions, setRegions, addRegion, updateRegion, deleteRegion, mapLevel, setMapLevel, geoData, activeGroupId, setActiveGroupId }) {
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ mapLevel, regions }, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "map-regions.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.regions) {
          setRegions(data.regions);
          if (data.regions.length > 0) setActiveGroupId(data.regions[0].id);
        }
        if (data.mapLevel) setMapLevel(data.mapLevel);
      } catch (err) {
        alert("유효하지 않은 JSON 파일입니다.");
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be selected again
    e.target.value = null;
  };

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

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button className="add-btn" style={{ flex: 1, marginBottom: 0 }} onClick={addRegion}>
          <Plus size={18} />
          그룹 추가
        </button>
        <button className="add-btn" style={{ flex: 0.5, marginBottom: 0, background: '#475569' }} onClick={handleExport} title="데이터 내보내기">
          <Download size={18} />
        </button>
        <button className="add-btn" style={{ flex: 0.5, marginBottom: 0, background: '#475569' }} onClick={() => fileInputRef.current?.click()} title="데이터 불러오기">
          <Upload size={18} />
        </button>
        <input 
          type="file" 
          accept=".json" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleImport} 
        />
      </div>

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
