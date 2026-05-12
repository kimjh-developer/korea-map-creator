const fs = require('fs');
const topojson = require('topojson-client');

const provTopo = JSON.parse(fs.readFileSync('public/skorea_provinces_topo_simple.json'));
const muniTopo = JSON.parse(fs.readFileSync('public/skorea_municipalities_topo_simple.json'));

const provGeo = topojson.feature(provTopo, provTopo.objects.skorea_provinces_geo).features;
const muniGeo = topojson.feature(muniTopo, muniTopo.objects.skorea_municipalities_geo).features;

const provCodeMap = {};
provGeo.forEach(p => {
  provCodeMap[p.properties.code] = p.properties.name;
});

let testName = null;
muniGeo.forEach(m => {
  const provCode = m.properties.code.substring(0, 2);
  const provName = provCodeMap[provCode];
  if (provName) {
    m.properties.name = `${provName} ${m.properties.name}`;
  }
  if (m.properties.name.includes("남구")) {
    console.log(m.properties.name, m.properties.code);
  }
});
