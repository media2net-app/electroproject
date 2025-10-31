import Sidebar from '../components/Sidebar';
import './Offerte.css';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ORDERS_XML = '/bestellingen/shopelectroproject.WordPress.2025-10-30.xml';

function mapStatus(raw){
  const s = (raw||'').toLowerCase();
  if (s.includes('expired')) return { label:'Expired', key:'expired' };
  if (s.includes('pending')) return { label:'Pending', key:'pending' };
  if (s.includes('new') || s.includes('nieuw')) return { label:'Nieuw', key:'new' };
  return { label: raw||'Onbekend', key: raw||'other' };
}

function parseOrders(xmlText){
  try{
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    const items = Array.from(doc.getElementsByTagName('item'));
    const rows = items.map(it => {
      const getText = (tag) => (it.getElementsByTagName(tag)[0]?.textContent)||'';
      const wpns = 'wp:';
      const postId = getText(`${wpns}post_id`) || '';
      const postDate = getText(`${wpns}post_date`) || getText('pubDate') || '';
      const rawStatus = getText(`${wpns}status`) || '';
      const title = getText('title') || '';
      const categories = Array.from(it.getElementsByTagName('category')).map(c => (c.textContent||''));
      const postmeta = Array.from(it.getElementsByTagName(`${wpns}postmeta`));
      const meta = {}; postmeta.forEach(pm => { const k=(pm.getElementsByTagName(`${wpns}meta_key`)[0]?.textContent)||''; const v=(pm.getElementsByTagName(`${wpns}meta_value`)[0]?.textContent)||''; if(k) meta[k]=v; });
      const totalNum = Number(meta['_order_total']||0);
      const total = totalNum ? `€ ${totalNum.toLocaleString('nl-NL',{minimumFractionDigits:2, maximumFractionDigits:2})}` : '-';
      const origin = meta['_billing_company'] || meta['_billing_email'] || meta['_billing_first_name'] || '';
      const d = postDate ? new Date(postDate.replace(' ', 'T')): null;
      const unix = d? d.getTime(): 0;
      const catStr = categories.join(',').toLowerCase();
      const mapped = mapStatus(rawStatus || catStr);
      const isQuote = /offerte|quote|prijsopgave/i.test((rawStatus+title+categories.join(',')||''));
      return { id: postId || title, date: postDate.replace(' 00:00:00',''), unix, status: mapped.label, statusKey: mapped.key, total, totalNum, origin, isQuote };
    });
    const filtered = rows.filter(r => r.id || r.status || r.totalNum);
    filtered.sort((a,b)=> b.unix - a.unix);
    return filtered;
  }catch(e){ return []; }
}

export default function Offerte(){
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [range, setRange] = useState([0, 0]);
  const [limit, setLimit] = useState([0, 0]);
  const [quotesOnly, setQuotesOnly] = useState(false);
  const [toDelete, setToDelete] = useState(null); // id of row
  const navigate = useNavigate();

  useEffect(()=>{ fetch(ORDERS_XML).then(r=>r.text()).then(txt=> {
    const parsed = parseOrders(txt);
    setOrders(parsed);
    const totals = parsed.map(o=>o.totalNum).filter(n=>!isNaN(n));
    const min = totals.length? Math.floor(Math.min(...totals)) : 0;
    const max = totals.length? Math.ceil(Math.max(...totals)) : 0;
    setLimit([min,max]); setRange([min,max]);
  }).catch(()=> setOrders([])); },[]);

  const statuses = useMemo(()=>{ return Array.from(new Set(orders.map(o=>o.status).filter(Boolean))); }, [orders]);

  const filtered = useMemo(()=>{
    const s = search.toLowerCase();
    return orders.filter(o => (!status || (o.status||'')===status) && (o.totalNum>=range[0] && o.totalNum<=range[1]) && (!quotesOnly || o.isQuote) && ((o.id||'').toLowerCase().includes(s) || (o.date||'').toLowerCase().includes(s) || (o.status||'').toLowerCase().includes(s) || (o.total||'').toLowerCase().includes(s) || (o.origin||'').toLowerCase().includes(s)) );
  }, [orders, search, status, range, quotesOnly]);

  function resetFilters(){ setSearch(''); setStatus(''); setRange(limit); setQuotesOnly(false); }

  function confirmDelete(id){ setToDelete(id); }
  function cancelDelete(){ setToDelete(null); }
  function doDelete(){ if(toDelete){ setOrders(prev=> prev.filter(o=> o.id!==toDelete)); setToDelete(null); } }

  function changeStatus(id){
    // eenvoudige demo: cycle status op UI
    setOrders(prev => prev.map(o => o.id===id ? { ...o, status: o.status==='Nieuw'?'Pending':(o.status==='Pending'?'Expired':'Nieuw'), statusKey: o.status==='Nieuw'?'pending':(o.status==='Pending'?'expired':'new') } : o));
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="dashboard-main offerte-main">
        <div className="offerte-titlebar"><h1>Offerte aanvragen <span style={{fontSize:'.6em', fontWeight:400, color:'#74ffe2'}}>{filtered.length} van {orders.length}</span></h1></div>
        <div className="offerte-filters">
          <input className="offerte-search" type="search" placeholder="Zoek (ID, datum, status, totaal, bron)" value={search} onChange={(e)=>setSearch(e.target.value)} />
          <select className="offerte-filter" value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="">Alle statussen</option>
            {statuses.map(st => <option key={st} value={st}>{st}</option>)}
          </select>
          <div className="offerte-slider-group">
            <span className="offerte-price-label">€{limit[0]}</span>
            <div className="slider-wrap">
              <input type="range" min={limit[0]} max={limit[1]} value={range[0]} onChange={e=>setRange([Math.min(Number(e.target.value), range[1]-1), range[1]])} className="offerte-slider" />
              <input type="range" min={limit[0]} max={limit[1]} value={range[1]} onChange={e=>setRange([range[0], Math.max(Number(e.target.value), range[0]+1)])} className="offerte-slider" />
              <div className="slider-bar" style={{left:`${limit[1]>limit[0]?100*(range[0]-limit[0])/(limit[1]-limit[0]):0}%`, width:`${limit[1]>limit[0]?100*(range[1]-range[0])/(limit[1]-limit[0]):0}%`}} />
            </div>
            <span className="offerte-price-label">€{limit[1]}</span>
          </div>
          <label className="offerte-check"><input type="checkbox" checked={quotesOnly} onChange={(e)=>setQuotesOnly(e.target.checked)} /> Alleen aanvragen/offertes</label>
          <button className="offerte-reset-btn" onClick={resetFilters}>Reset filters</button>
        </div>

        <div className="offerte-table-container">
          <table className="offerte-table">
            <thead><tr><th>Nummer</th><th>Datum</th><th>Status</th><th>Totaal</th><th>Oorsprong</th><th style={{textAlign:'right'}}>Acties</th></tr></thead>
            <tbody>
              {filtered.map((row)=> (
                <tr key={row.id}>
                  <td onClick={()=>navigate(`/offerte/${row.id}`)} style={{cursor:'pointer'}}>{row.id}</td>
                  <td onClick={()=>navigate(`/offerte/${row.id}`)} style={{cursor:'pointer'}}>{row.date}</td>
                  <td><span className={`offerte-status-badge ${row.statusKey}`}>{row.status}</span></td>
                  <td>{row.total}</td>
                  <td>{row.origin}</td>
                  <td>
                    <div className="offerte-actions">
                      <button className="offerte-action-btn" onClick={()=>changeStatus(row.id)}>Wijzig status</button>
                      <button className="offerte-action-btn" onClick={()=>navigate(`/offerte/${row.id}`)}>Bekijk offerte</button>
                      <button className="offerte-action-btn offerte-action-delete" onClick={()=>confirmDelete(row.id)}>Verwijderen</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length===0 && (<tr><td colSpan={6} style={{opacity:.7, padding:'12px'}}>Geen resultaten</td></tr>)}
            </tbody>
          </table>
        </div>

        {toDelete && (
          <div className="modal-backdrop" onClick={cancelDelete}>
            <div className="modal-card" onClick={(e)=>e.stopPropagation()}>
              <div className="modal-title">Offerte verwijderen</div>
              <div>Weet je zeker dat je offerte #{toDelete} wilt verwijderen?</div>
              <div className="modal-actions">
                <button className="modal-btn" onClick={cancelDelete}>Annuleren</button>
                <button className="modal-btn danger" onClick={doDelete}>Verwijderen</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
