import Sidebar from '../components/Sidebar';
import './ProductDetail.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

const CSV_URL = '/producten/wc-product-export-30-10-2025-1761806553346.csv';

function parseCsvLine(line) {
  let cur = '', inQuotes = false, out = [];
  for (let i=0; i<line.length; ++i) {
    const c = line[i];
    if (c === '"') { inQuotes = !inQuotes; }
    else if (c === ',' && !inQuotes) { out.push(cur); cur = ''; }
    else { cur += c; }
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
    const obj = {}; headers.forEach((h,i) => obj[h] = (cols[i]||'')); return obj;
  });
}
function firstHttpFromImages(field) {
  if (!field) return '';
  const parts = field.split(',').map(s=>s.trim());
  const url = parts.find(p => p.startsWith('http')) || '';
  return url;
}
function cleanHtmlNoise(html) {
  if (!html) return html;
  let cleaned = html;
  // verwijder literal \n en carriage returns
  cleaned = cleaned.replace(/\\n|\\r/g, ' ');
  // vervang meerdere <br> op rij door één
  cleaned = cleaned.replace(/(\s*<br\s*\/?>(\s|&nbsp;)*){2,}/gi, '<br/>');
  // verwijder lege paragrafen
  cleaned = cleaned.replace(/<p>\s*(?:&nbsp;)?\s*<\/p>/gi, '');
  // normaliseer &nbsp; en teveel spaties
  cleaned = cleaned.replace(/&nbsp;/gi, ' ').replace(/\s{2,}/g, ' ');
  return cleaned.trim();
}
// Parse <table> rows (th/td) to key/value pairs
function extractSpecsFromHtml(html) {
  if (!html) return { specs: [], cleaned: html };
  const specs = [];
  const tableRegex = /<table[\s\S]*?<\/table>/gi;
  const rowRegex = /<tr[^>]*>\s*<th[^>]*>([\s\S]*?)<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi;
  let m; let tablesJoined = '';
  const tables = html.match(tableRegex) || [];
  tables.forEach(t => { tablesJoined += t; });
  while ((m = rowRegex.exec(tablesJoined)) !== null) {
    const key = m[1].replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').trim();
    const val = m[2].replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').trim();
    if (key && val) specs.push([key, val]);
  }
  // strip all tables from html to avoid duplicates
  const cleaned = html.replace(tableRegex, '');
  return { specs, cleaned };
}
// Parse patterns like <strong>Key</strong> Value possibly separated by <br>
function extractSpecsFromStrongList(html) {
  if (!html) return { specs: [], cleaned: html };
  const specs = [];
  let cleaned = html;
  const pattern = /<strong>(.*?)<\/strong>\s*([^<\n\r]+)(?:<br\s*\/?>(?:\s*)|<\/p>|\n|\r)/gi;
  let m; const toRemove = [];
  while ((m = pattern.exec(html)) !== null) {
    const key = (m[1]||'').replace(/<[^>]+>/g,'').trim();
    const val = (m[2]||'').replace(/<[^>]+>/g,'').trim();
    if (key && val) {
      specs.push([key, val]);
      toRemove.push(m[0]);
    }
  }
  if (toRemove.length) {
    toRemove.forEach(seg => { cleaned = cleaned.replace(seg, ''); });
  }
  return { specs, cleaned };
}

export default function ProductDetail() {
  const { sku } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(CSV_URL)
      .then(r => r.text())
      .then(txt => {
        if (cancelled) return;
        const parsed = parseCsv(txt);
        parsed.sort((a,b)=> (a['Naam']||'').localeCompare(b['Naam']||''));
        setItems(parsed);
        const found = parsed.find(p => (p['SKU']||'').toString() === sku);
        setProduct(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => { cancelled = true; };
  }, [sku]);

  const detail = useMemo(() => {
    if (!product) return null;
    const naam = product['Naam'] || '';
    const prijs = product['Reguliere prijs'] || '';
    const merk = product['Merk'] || product['Merken'] || '';
    const categorie = product['Categorieën'] || product['Categorie'] || '';
    const afbeelding = firstHttpFromImages(product['Afbeeldingen']);
    const korteRaw = product['Korte beschrijving'] || '';
    const beschrijvingRaw = product['Beschrijving'] || '';

    const fromTable = extractSpecsFromHtml(beschrijvingRaw);
    let specs = fromTable.specs; let cleaned = fromTable.cleaned;
    if (specs.length === 0) {
      const fromStrong = extractSpecsFromStrongList(cleaned);
      specs = fromStrong.specs; cleaned = fromStrong.cleaned;
    }

    // verwijder zichtbare \n/lege regels/extra breaks
    const korte = cleanHtmlNoise(korteRaw);
    cleaned = cleanHtmlNoise(cleaned);

    const inStock = product['Op voorraad?'] === '1' || product['Op voorraad?'] === 1;
    return { naam, prijs, merk, categorie, afbeelding, korte, beschrijving: cleaned, specs, inStock };
  }, [product]);

  const siblings = useMemo(() => {
    if (!product || items.length===0) return {prev:null,next:null};
    const idx = items.findIndex(p => (p['SKU']||'').toString()===sku);
    const prev = idx>0 ? items[idx-1] : null;
    const next = idx>=0 && idx<items.length-1 ? items[idx+1] : null;
    return { prev, next };
  }, [items, product, sku]);

  const related = useMemo(() => {
    if (!product || items.length===0) return [];
    const catPath = (product['Categorieën'] || product['Categorie'] || '').split('>').map(s=>s.trim()).filter(Boolean);
    const leaf = catPath[catPath.length-1] || '';
    const currentSku = (product['SKU']||'').toString();
    const rel = items.filter(p => (p['SKU']||'').toString()!==currentSku && ((p['Categorieën']||p['Categorie']||'').includes(leaf))).slice(0,6);
    return rel;
  }, [items, product]);

  const crumbs = useMemo(() => {
    const list = [];
    list.push({ label: 'Producten', href: '/producten' });
    if (detail?.merk) list.push({ label: detail.merk, href: `/producten?brand=${encodeURIComponent(detail.merk)}` });
    if (detail?.categorie) {
      const parts = detail.categorie.split('>').map(s=>s.trim()).filter(Boolean);
      parts.forEach((p)=> list.push({label:p, href:`/producten?cat=${encodeURIComponent(p)}`}));
    }
    return list;
  }, [detail]);

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="dashboard-main pd-main">
        {loading && <div className="pd-card"><div className="pd-detail-col"><h1>Laden…</h1></div></div>}
        {!loading && !detail && (
          <div className="pd-card"><div className="pd-detail-col"><h1>Product niet gevonden</h1><p>SKU: {sku}</p></div></div>
        )}
        {!loading && detail && (
          <>
          <div className="pd-breadcrumbs">
            {crumbs.map((c, i) => (
              <span key={i} className="pd-crumb" onClick={()=>navigate(c.href)}>{c.label}{i<crumbs.length-1?' / ':''}</span>
            ))}
          </div>
          <div className="pd-card">
            <div className="pd-image-col">
              {detail.afbeelding ? (
                <img className="pd-img" src={detail.afbeelding} alt={detail.naam} />
              ) : (
                <div className="pd-img" style={{display:'flex',alignItems:'center',justifyContent:'center',background:'#1b2a36',color:'#8db8d1'}}>Geen afbeelding</div>
              )}
            </div>
            <div className="pd-detail-col">
              <div className="pd-nav-arrows">
                {siblings.prev && <button className="pd-nav-btn" onClick={()=>navigate(`/product/${siblings.prev['SKU']}`)}>← Vorige</button>}
                {siblings.next && <button className="pd-nav-btn" onClick={()=>navigate(`/product/${siblings.next['SKU']}`)}>Volgende →</button>}
              </div>
              <h1 className="pd-title">{detail.naam}</h1>
              <div className="pd-brand-meta">{detail.merk} {product?.SKU?`/ SKU: ${product.SKU}`:''} {detail.categorie?`/ ${detail.categorie}`:''}</div>
              <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                {detail.prijs && <div className="pd-price">€ {detail.prijs}</div>}
                <div className={detail.inStock?"badge-stock in":"badge-stock out"}>{detail.inStock?'Op voorraad':'Niet op voorraad'}</div>
              </div>
              {(detail.korte || detail.beschrijving) && (
                <div className="pd-omscr">
                  {detail.korte && <div dangerouslySetInnerHTML={{__html: detail.korte}} />}
                  {/* Beschrijving zonder eventuele tabellen/lijsten */}
                  {detail.beschrijving && <div dangerouslySetInnerHTML={{__html: detail.beschrijving}} />}
                </div>
              )}
              {detail.specs && detail.specs.length > 0 && (
                <div className="pd-spec">
                  <h2>Productspecificaties</h2>
                  <table className="pd-spec-table"><tbody>
                    {detail.specs.map(([k,v]) => (
                      <tr key={k}><th>{k}</th><td>{v}</td></tr>
                    ))}
                  </tbody></table>
                </div>
              )}
            </div>
          </div>

          {related.length>0 && (
            <div className="pd-related">
              <h3>Gerelateerde producten</h3>
              <div className="pd-related-grid">
                {related.map(r=>{
                  const img = firstHttpFromImages(r['Afbeeldingen']);
                  return (
                    <div key={r['SKU']} className="pd-rel-card" onClick={()=>navigate(`/product/${r['SKU']}`)}>
                      {img ? <img src={img} alt={r['Naam']} /> : <div className="pd-rel-imgph">Geen afbeelding</div>}
                      <div className="pd-rel-title">{r['Naam']}</div>
                      <div className="pd-rel-meta">€ {r['Reguliere prijs']||'-'}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          </>
        )}
      </main>
    </div>
  );
}
