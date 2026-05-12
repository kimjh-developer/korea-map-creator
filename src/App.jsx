import React, { useState, useEffect } from 'react';
import * as topojson from 'topojson-client';
import Sidebar from './components/Sidebar';
import Map from './components/Map';
import './index.css';

function App() {
  const [mapLevel, setMapLevel] = useState(() => {
    const saved = localStorage.getItem('mapCreatorLevel');
    return saved || 'province';
  });
  const [regions, setRegions] = useState(() => {
    const saved = localStorage.getItem('mapCreatorRegions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse regions from local storage');
      }
    }
    return [{ id: Date.now(), names: ['서울특별시'], color: '#3b82f6' }];
  });
  
  const [provinceData, setProvinceData] = useState([]);
  const [municipalData, setMunicipalData] = useState([]);
  const [allFeatures, setAllFeatures] = useState([]);

  const [activeGroupId, setActiveGroupId] = useState(null);

  useEffect(() => {
    localStorage.setItem('mapCreatorLevel', mapLevel);
  }, [mapLevel]);

  useEffect(() => {
    localStorage.setItem('mapCreatorRegions', JSON.stringify(regions));
  }, [regions]);

  useEffect(() => {
    if (regions.length > 0 && activeGroupId === null) {
      setActiveGroupId(regions[0].id);
    }
  }, [regions, activeGroupId]);

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.BASE_URL}skorea_provinces_topo_simple.json`).then(res => res.json()),
      fetch(`${import.meta.env.BASE_URL}skorea_municipalities_topo_simple.json`).then(res => res.json())
    ]).then(([provTopo, muniTopo]) => {
      const provGeo = topojson.feature(provTopo, provTopo.objects.skorea_provinces_geo).features;
      const muniGeo = topojson.feature(muniTopo, muniTopo.objects.skorea_municipalities_geo).features;
      
      // Inject Dokdo into province and municipal data
      const dokdoProv = {
        type: "Feature", properties: { name: '경상북도', name_eng: 'Gyeongsangbuk-do', code: '37' },
        geometry: { type: "Polygon", coordinates: [[[131.85, 37.25], [131.89, 37.25], [131.89, 37.21], [131.85, 37.21], [131.85, 37.25]]] }
      };
      const dokdoMuni = {
        type: "Feature", properties: { name: '울릉군', name_eng: 'Ulleung-gun', code: '37240' },
        geometry: { type: "Polygon", coordinates: [[[131.85, 37.25], [131.89, 37.25], [131.89, 37.21], [131.85, 37.21], [131.85, 37.25]]] }
      };
      
      provGeo.push(dokdoProv);
      muniGeo.push(dokdoMuni);

      // Prepend province name to municipal names to resolve duplicate "Gu" names and provide context
      const provCodeMap = {};
      provGeo.forEach(p => {
        provCodeMap[p.properties.code] = p.properties.name;
      });

      muniGeo.forEach(m => {
        const provCode = m.properties.code.substring(0, 2);
        const provName = provCodeMap[provCode];
        if (provName) {
          m.properties.name = `${provName} ${m.properties.name}`;
        }
      });

      setProvinceData(provGeo);
      setMunicipalData(muniGeo);
      setAllFeatures([...provGeo, ...muniGeo]);
    });
  }, []);

  const addRegion = () => {
    const newId = Date.now();
    setRegions([
      ...regions,
      { id: newId, names: [], color: '#ff5722' }
    ]);
    setActiveGroupId(newId);
  };

  const updateRegion = (id, field, value) => {
    setRegions(
      regions.map((region) =>
        region.id === id ? { ...region, [field]: value } : region
      )
    );
  };

  const deleteRegion = (id) => {
    setRegions(regions.filter((region) => region.id !== id));
    if (activeGroupId === id) {
      setActiveGroupId(regions.length > 1 ? regions.find(r => r.id !== id).id : null);
    }
  };

  const handleRegionClick = (regionName) => {
    if (!activeGroupId) return;

    setRegions(prevRegions => {
      return prevRegions.map(region => {
        if (region.id === activeGroupId) {
          const names = region.names || [];
          const newNames = names.includes(regionName)
            ? names.filter(n => n !== regionName)
            : [...names, regionName];
          return { ...region, names: newNames };
        }
        return region;
      });
    });
  };

  const currentGeoData = mapLevel === 'province' ? provinceData : municipalData;

  return (
    <>
      <Sidebar 
        regions={regions}
        addRegion={addRegion}
        updateRegion={updateRegion}
        deleteRegion={deleteRegion}
        mapLevel={mapLevel}
        setMapLevel={setMapLevel}
        geoData={allFeatures}
        activeGroupId={activeGroupId}
        setActiveGroupId={setActiveGroupId}
        setRegions={setRegions}
      />
      <Map 
        regions={regions} 
        geoData={currentGeoData} 
        allFeatures={allFeatures} 
        onRegionClick={handleRegionClick}
      />
    </>
  );
}

export default App;


