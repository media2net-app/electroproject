import Sidebar from '../components/Sidebar';
import './OfferteDetail.css';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ORDERS_XML = '/bestellingen/shopelectroproject.WordPress.2025-10-30.xml';

function mapStatus(raw){
  const s = (raw||'').toLowerCase();
  if (s.includes('expired')) return { label:'Expired', key:'expired' };
  if (s.includes('pending')) return { label:'Pending', key:'pending' };
  if (s.includes('new') || s.includes('nieuw')) return { label:'Nieuw', key:'new' };
  return { label: raw||'Onbekend', key:'other' };
}

function tryParseJSON(val){
  try{ const o = JSON.parse(val); return o; } catch(e){ return null; }
}
// zeer eenvoudige PHP serialized array parser voor meest simpele gevallen (array van associative arrays)
function tryParseSerialized(val){
  // We ondersteunen patronen als: a:N:{s:M:"key";s:L:"value"; ...}
  if (!val || !/^a:\d+:\{/.test(val)) return null;
  try{
    const result = {};
    const entries = Array.from(val.matchAll(/s:\d+:\"(.*?)\";s:\d+:\"([\s\S]*?)\";/g));
    if (entries.length===0) return null;
    entries.forEach(m => { result[m[1]] = m[2]; });
    // als dit zelf weer een genestelde set betreft, geef object
    return result; 
  }catch(e){ return null; }
}

function parseAll(xmlText){
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');
  const items = Array.from(doc.getElementsByTagName('item')).map(it => {
    const getText = (tag) => (it.getElementsByTagName(tag)[0]?.textContent)||'';
    const wpns = 'wp:';
    const id = getText(`${wpns}post_id`) || '';
    const date = getText(`${wpns}post_date`) || getText('pubDate') || '';
    const rawStatus = getText(`${wpns}status`) || '';
    const title = getText('title') || '';
    const postmeta = Array.from(it.getElementsByTagName(`${wpns}postmeta`));
    const meta = {}; postmeta.forEach(pm => { const k=(pm.getElementsByTagName(`${wpns}meta_key`)[0]?.textContent)||''; const v=(pm.getElementsByTagName(`${wpns}meta_value`)[0]?.textContent)||''; if(k) meta[k]=v; });
    const totalNum = Number(meta['_order_total']||0);
    const total = totalNum ? `€ ${totalNum.toLocaleString('nl-NL',{minimumFractionDigits:2, maximumFractionDigits:2})}` : '-';
    const mapped = mapStatus(rawStatus);
    const unix = date ? (new Date(date.replace(' ','T'))).getTime() : 0;

    // klantgegevens (billing_*)
    const billing = Object.fromEntries(Object.entries(meta).filter(([k])=>k.startsWith('_billing_')).map(([k,v])=>[k.replace('_billing_',''), v]));

    // probeer offerte-items uit veelgebruikte keys te halen
    const candidateKeys = ['_order_items','_line_items','_items','yith-ywraq-items','_ywraq_items','ywraq_request','ywraq_items'];
    let parsedItems = null;
    for (const key of candidateKeys){
      if (meta[key]){
        const val = meta[key];
        const json = tryParseJSON(val);
        if (json){ parsedItems = json; break; }
        const ser = tryParseSerialized(val);
        if (ser){ parsedItems = ser; break; }
      }
    }

    return { id, date: date.replace(' 00:00:00',''), unix, status: mapped.label, statusKey: mapped.key, total, title, billing, meta, items: parsedItems };
  });
  items.sort((a,b)=> b.unix - a.unix);
  return items;
}

export default function OfferteDetail(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [items,setItems] = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    fetch(ORDERS_XML).then(r=>r.text()).then(txt=>{ setItems(parseAll(txt)); setLoading(false); }).catch(()=> setLoading(false));
  },[]);

  const current = useMemo(()=> items.find(o => o.id===id) || null, [items, id]);
  const idx = useMemo(()=> items.findIndex(o=>o.id===id), [items,id]);
  const prev = idx>0 ? items[idx-1] : null;
  const next = idx>=0 && idx<items.length-1 ? items[idx+1] : null;

  const pdfHref = `/offertes/Offerte_${id}.pdf`;

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="dashboard-main offd-main">
        {loading && <div className="offd-card"><div className="offd-detail-col"><h1>Laden…</h1></div></div>}
        {!loading && !current && (
          <div className="offd-card"><div className="offd-detail-col"><h1>Offerte niet gevonden</h1><p>Nummer: {id}</p></div></div>
        )}
        {!loading && current && (
          <>
          <div className="offd-breadcrumbs">
            <span className="offd-crumb" onClick={()=>navigate('/offerte')}>Offerte aanvragen</span> / <span className="offd-crumb">{current.id}</span>
          </div>
          <div className="offd-card">
            <div className="offd-detail-col">
              <div className="offd-nav-arrows">
                {prev && <button className="offd-nav-btn" onClick={()=>navigate(`/offerte/${prev.id}`)}>← Vorige</button>}
                {next && <button className="offd-nav-btn" onClick={()=>navigate(`/offerte/${next.id}`)}>Volgende →</button>}
              </div>
              <h1 className="offd-title">Offerte #{current.id}</h1>
              <div className="offd-meta">Datum: {current.date} • Status: <span className={`offerte-status-badge ${current.statusKey}`}>{current.status}</span></div>
              <div className="offd-amount">Totaal: {current.total}</div>
              <div className="offd-origin">Oorsprong: {current.billing?.company || current.billing?.email || '-'}</div>
              <div className="offd-actions"><a className="offd-btn" href={pdfHref} target="_blank" rel="noreferrer">Bekijk PDF</a></div>
            </div>
          </div>

          {/* Klantgegevens */}
          <div className="offd-card">
            <h2>Klantgegevens</h2>
            <div className="offd-grid">
              <div><span>Naam</span><b>{[current.billing?.first_name, current.billing?.last_name].filter(Boolean).join(' ') || '-'}</b></div>
              <div><span>Bedrijf</span><b>{current.billing?.company || '-'}</b></div>
              <div><span>E‑mail</span><b>{current.billing?.email || '-'}</b></div>
              <div><span>Telefoon</span><b>{current.billing?.phone || '-'}</b></div>
              <div><span>Adres</span><b>{[current.billing?.address_1, current.billing?.postcode, current.billing?.city].filter(Boolean).join(', ') || '-'}</b></div>
              <div><span>Land</span><b>{current.billing?.country || '-'}</b></div>
            </div>
          </div>

          {/* Offerte regels */}
          <div className="offd-card">
            <h2>Offerte regels</h2>
            {current.items ? (
              Array.isArray(current.items) ? (
                <table className="offd-table"><thead><tr><th>Product</th><th>Aantal</th><th>Prijs</th><th>Totaal</th></tr></thead><tbody>
                  {current.items.map((it,ix)=>{
                    const name = it.name || it.product_name || it.sku || it.id || `Regel ${ix+1}`;
                    const qty = it.qty || it.quantity || it.aantal || '-';
                    const price = it.price || it.unit_price || it.prijs || '';
                    const total = it.line_total || it.total || '';
                    return (<tr key={ix}><td>{name}</td><td>{qty}</td><td>{price}</td><td>{total}</td></tr>);
                  })}
                </tbody></table>
              ) : (
                <div className="offd-raw">Kon geen gestructureerde regels detecteren. Ruwe data getoond:<pre>{JSON.stringify(current.items,null,2)}</pre></div>
              )
            ) : (
              <div className="offd-raw">Geen regels gevonden in XML. Indien nodig kan ik extra parser toevoegen voor jouw plugin/meta-structuur.</div>
            )}
          </div>
          </>
        )}
      </main>
    </div>
  );
}
