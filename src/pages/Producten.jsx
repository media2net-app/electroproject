import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import './Producten.css';
import { useNavigate, useLocation } from 'react-router-dom';

const CSV_URL = '/producten/wc-product-export-30-10-2025-1761806553346.csv';

function parseCsvLine(line) {
  let cur = '', inQuotes = false, out = [];
  for (let i=0; i<line.length; ++i) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}
function parseCsv(text) {
  const lines = text.split(/\r?\n/);
  if (!lines[0]) return [];
  const headers = parseCsvLine(lines[0]).map(s=>s.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).filter(line=>line.trim()).map(line => {
    const cols = parseCsvLine(line).map(s => s.trim().replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((h,i) => obj[h] = (cols[i]||''));
    return obj;
  });
}
function uniq(a) { return [...new Set(a)].filter(x => x !== ''); }
function arrayFromCatField(v) { if (!v) return []; return v.split('>').map(s=>s.trim()).filter(Boolean); }

function ProductCard({product}) {
  const naam = product['Naam'] || '-';
  const prijs = product['Reguliere prijs'] || '-';
  const merk = product['Merk'] || product['Merken'] || '';
  const sku = product['SKU'] || '';
  let img = (product['Afbeeldingen'] || '').split(',')[0].trim();
  if (img && !img.startsWith('http')) img = '';
  const inStock = product['Op voorraad?'] === '1' || product['Op voorraad?'] === 1;
  const navigate = useNavigate();
  function handleClick() { if (sku) navigate(`/product/${sku}`); }
  return (
    <div className="product-card" onClick={handleClick} style={sku?{cursor:'pointer'}:undefined}>
      <div className="product-img-wrapper">
        {img ? <img src={img} alt={naam} className="product-img" /> : <div className="product-img-placeholder" /> }
      </div>
      <div className="product-card-content">
        <div className="product-card-title">{naam}</div>
        <div className="product-card-meta">{merk && <span>{merk}</span>} {sku && <span className="sku">SKU:{sku}</span>}</div>
        <div className="product-card-price">€ {prijs}</div>
        <div className={inStock?"badge-stock in":"badge-stock out"} style={{marginTop:'6px', display:'inline-block'}}>{inStock? 'Op voorraad' : 'Niet op voorraad'}</div>
      </div>
    </div>
  );
}

export default function Producten() {
  const location = useLocation();
  const [producten, setProducten] = useState([]);
  const [countCheck, setCountCheck] = useState({ total: 0, valid: 0 });
  const [search, setSearch] = useState('');
  const [merken, setMerken] = useState([]);
  const [categorieen, setCategorieen] = useState([]);
  const [prijslimiet, setPrijslimiet] = useState([0, 99999]);
  const [activeMerk, setActiveMerk] = useState('');
  const [activeCat, setActiveCat] = useState('');
  const [activeVoorraad, setActiveVoorraad] = useState(false);
  const [prijsMinMax, setPrijsMinMax] = useState([0, 99999]);
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    fetch(CSV_URL)
      .then(r => r.text())
      .then(txt => {
        const parsed = parseCsv(txt);
        const full = parsed.filter(p => {
          const naam = p['Naam'] && p['Naam'].length > 0;
          const prijs = p['Reguliere prijs'] && p['Reguliere prijs'].length > 0 && Number(p['Reguliere prijs']) > 0;
          let img = (p['Afbeeldingen'] || '').split(',')[0].trim();
          img = img && img.startsWith('http');
          return naam && prijs && img;
        });
        setCountCheck({ total: parsed.length, valid: full.length });
        setProducten(full);
        setMerken(uniq(full.map(p => (p['Merk']||p['Merken']||'').trim())));
        let allesCat = full.flatMap(p => arrayFromCatField(p['Categorieën'] || p['Categorie']));
        setCategorieen(uniq(allesCat));
        let prijzen = full.map(p => Number(p['Reguliere prijs'])).filter(n=>!isNaN(n));
        if (prijzen.length) {
          const min = Math.floor(Math.min(...prijzen));
          const max = Math.ceil(Math.max(...prijzen));
          setPrijslimiet([min,max]);
          setPrijsMinMax([min,max]);
        }
      });
  }, []);

  // Lees query-string om filters te zetten (cat, brand)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('cat');
    const brand = params.get('brand');
    if (cat) setActiveCat(cat);
    if (brand) setActiveMerk(brand);
  }, [location.search]);

  function clamp(val, min, max){ return Math.max(min, Math.min(max, val));}
  function handleMinChange(e) { const newMin = Number(e.target.value); setPrijsMinMax(([min,max]) => [clamp(newMin, prijslimiet[0], max-1), max]); }
  function handleMaxChange(e) { const newMax = Number(e.target.value); setPrijsMinMax(([min,max]) => [min, clamp(newMax, min+1, prijslimiet[1])]); }

  useEffect(() => {
    setFiltered(
      producten.filter(p => {
        const naam = (p['Naam']||'').toLowerCase();
        const sku = (p['SKU']||'').toLowerCase();
        const vMerk = !activeMerk || ((p['Merk']||p['Merken']||'') === activeMerk);
        const cats = arrayFromCatField(p['Categorieën']||p['Categorie']);
        const vCat = !activeCat || cats.includes(activeCat);
        const prijs = Number(p['Reguliere prijs']) || 0;
        const vPrijs = (prijs >= prijsMinMax[0] && prijs <= prijsMinMax[1]);
        const voorraad = (p['Op voorraad?'] === '1' || p['Op voorraad?'] === 1);
        const matchVoorraad = !activeVoorraad || voorraad;
        return (naam.includes(search.toLowerCase()) || sku.includes(search.toLowerCase())) && vMerk && vCat && vPrijs && matchVoorraad;
      })
    );
  }, [search, producten, activeMerk, activeCat, prijsMinMax, activeVoorraad]);

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="dashboard-main producten-main">
        <div className="producten-titlebar">
          <h1>Producten <span style={{fontSize:'.6em', fontWeight:400, color:'#74ffe2'}}>{filtered.length} van {countCheck.valid}</span></h1>
        </div>
        <div className="producten-filters">
          <input className="producten-search" type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Zoek op naam of SKU..." />
          {merken.length > 1 && (
            <select value={activeMerk} onChange={e=>setActiveMerk(e.target.value)} className="producten-filter product-merk"><option value="">Alle merken</option>{merken.map(m => m && <option key={m} value={m}>{m}</option>)}</select>
          )}
          {categorieen.length > 1 && (
            <select value={activeCat} onChange={e=>setActiveCat(e.target.value)} className="producten-filter product-cat"><option value="">Alle categorieën</option>{categorieen.map(c => c && <option key={c} value={c}>{c}</option>)}</select>
          )}
          <div className="producten-slider-group">
            <span className="producten-price-label">€{prijslimiet[0]}</span>
            <div className="slider-wrap">
              <input type="range" min={prijslimiet[0]} max={prijslimiet[1]} value={prijsMinMax[0]} onChange={handleMinChange} className="producten-slider" />
              <input type="range" min={prijslimiet[0]} max={prijslimiet[1]} value={prijsMinMax[1]} onChange={handleMaxChange} className="producten-slider" />
              <div className="slider-bar" style={{left:`${100*(prijsMinMax[0]-prijslimiet[0])/(prijslimiet[1]-prijslimiet[0])}%`, width:`${100*(prijsMinMax[1]-prijsMinMax[0])/(prijslimiet[1]-prijslimiet[0])}%`}} />
            </div>
            <span className="producten-price-label">€{prijslimiet[1]}</span>
          </div>
          <label className="producten-filter-check"><input type="checkbox" checked={activeVoorraad} onChange={e=>setActiveVoorraad(e.target.checked)} /> Op voorraad</label>
          <button className="producten-reset-btn" onClick={()=>{setActiveCat('');setActiveMerk('');setPrijsMinMax(prijslimiet);setActiveVoorraad(false);setSearch('')}}>Reset filters</button>
        </div>
        <div className="producten-grid">
          {filtered.slice(0,80).map((p,ix) => <ProductCard key={p['ID']||ix} product={p} />)}
        </div>
      </main>
    </div>
  );
}
