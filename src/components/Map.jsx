import React, { useEffect, useState, useRef, useMemo } from 'react';
import * as d3 from 'd3';

export default function Map({ regions, mapLevel, geoData, allFeatures }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: '' });

  const nameToCode = useMemo(() => {
    const map = {};
    if (allFeatures) {
      allFeatures.forEach(f => {
        if (f.properties.name) map[f.properties.name] = f.properties.code;
        if (f.properties.name_eng) map[f.properties.name_eng] = f.properties.code;
      });
    }
    return map;
  }, [allFeatures]);

  useEffect(() => {
    if (!geoData || !svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    const { width, height } = containerRef.current.getBoundingClientRect();

    svg.selectAll('*').remove(); // Clear previous render
    
    // Create a projection centered on South Korea
    const projection = d3.geoMercator()
      .center([127.5, 36])
      .scale(height * 6)
      .translate([width / 2, height / 2]);

    const pathGenerator = d3.geoPath().projection(projection);

    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', (e) => {
        g.attr('transform', e.transform);
      });

    svg.call(zoom);

    const g = svg.append('g');

    // Draw paths
    g.selectAll('path')
      .data(geoData)
      .enter()
      .append('path')
      .attr('d', pathGenerator)
      .attr('class', 'region-path')
      .attr('id', (d) => `region-${d.properties.name}`)
      .on('mousemove', (e, d) => {
        setTooltip({
          visible: true,
          x: e.clientX,
          y: e.clientY,
          text: d.properties.name
        });
      })
      .on('mouseleave', () => {
        setTooltip((prev) => ({ ...prev, visible: false }));
      });

  }, [geoData]);

  // Apply colors and borders when regions prop changes
  useEffect(() => {
    if (!geoData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);

    // Reset all
    svg.selectAll('.region-path')
      .style('fill', null)
      .classed('highlighted', false);

    // Apply colors for matched regions
    regions.forEach((region) => {
      if (region.names && region.names.length > 0) {
        svg.selectAll('.region-path')
          .filter((d) => {
            const dCode = d.properties.code;
            return region.names.some(name => {
              const rCode = nameToCode[name];
              return d.properties.name === name || 
                     d.properties.name_eng === name || 
                     (d.properties.name && d.properties.name.startsWith(name)) ||
                     (rCode && dCode && dCode.startsWith(rCode));
            });
          })
          .style('fill', region.color)
          .classed('highlighted', true);
      }
    });
  }, [regions, geoData, nameToCode]);

  return (
    <div className="map-container" ref={containerRef}>
      <svg ref={svgRef} className="map-svg"></svg>
      {tooltip.visible && (
        <div 
          className="map-tooltip visible"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
