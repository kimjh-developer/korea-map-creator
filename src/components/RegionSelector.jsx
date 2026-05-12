import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';

export default function RegionSelector({ names, onChange, geoData }) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef(null);

  const availableRegions = useMemo(() => {
    if (!geoData) return [];
    const uniqueNames = new Set();
    geoData.forEach(d => {
      const name = d.properties.name;
      if (name) {
        uniqueNames.add(name);
        const match = name.match(/^(.+시)(.+구)$/);
        if (match) {
          uniqueNames.add(match[1]); // Add virtual city (e.g. 수원시 from 수원시팔달구)
        }
      }
    });
    return Array.from(uniqueNames);
  }, [geoData]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    
    if (val.trim()) {
      const searchTerms = val.toLowerCase().trim().split(/\s+/);
      const filtered = availableRegions.filter(
        (region) => {
          const lowerRegion = region.toLowerCase();
          return searchTerms.every(term => lowerRegion.includes(term)) && !names.includes(region);
        }
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (regionName) => {
    onChange([...names, regionName]);
    setInputValue('');
    setSuggestions([]);
    setIsFocused(false);
  };

  const removeName = (nameToRemove) => {
    onChange(names.filter(n => n !== nameToRemove));
  };

  return (
    <div className="region-selector" ref={wrapperRef}>
      <div className="region-tags">
        {names.map(name => (
          <span key={name} className="region-tag">
            {name}
            <button className="tag-remove" onClick={() => removeName(name)}>
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          className="region-input"
          placeholder={names.length === 0 ? "지역 검색..." : ""}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
        />
      </div>
      
      {isFocused && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion) => (
            <li 
              key={suggestion} 
              onClick={() => handleSelect(suggestion)}
              className="suggestion-item"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
