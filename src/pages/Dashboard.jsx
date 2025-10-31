import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

const CSV_URL = '/producten/wc-product-export-30-10-2025-1761806553346.csv';
const ORDERS_XML = '/bestellingen/shopelectroproject.WordPress.2025-10-30.xml';

function parseCsvLine(line){ let cur='', inQuotes=false, out=[]; for(let i=0;i<line.length;i++){ const c=line[i]; if(c==='"'){ inQuotes=!inQuotes; } else if(c===',' && !inQuotes){ out.push(cur); cur=''; } else { cur+=c; } } out.push(cur); return out; }
function parseCsv(text){ const lines=text.split(/\r?\n/); if(!lines[0]) return []; const headers=parseCsvLine(lines[0]).map(s=>s.trim().replace(/^"|"$/g,'')); return lines.slice(1).filter(l=>l.trim()).map(line=>{ const cols=parseCsvLine(line).map(s=>s.trim().replace(/^"|"$/g,'')); const obj={}; headers.forEach((h,i)=> obj[h]=(cols[i]||'')); return obj; }); }

function countQuoteRequestsFromXml(xmlText){ try{ const parser=new DOMParser(); const doc=parser.parseFromString(xmlText,'text/xml'); const items=Array.from(doc.getElementsByTagName('item')); let count=0; items.forEach(it=>{ const cats=Array.from(it.getElementsByTagName('category')).map(c=>(c.textContent||'').toLowerCase()); const desc=((it.getElementsByTagName('description')[0]?.textContent)||'').toLowerCase(); const content=((it.getElementsByTagName('content:encoded')[0]?.textContent)||'').toLowerCase(); const anyText=[desc,content,...cats].join(' '); if(anyText.includes('prijsopgave')||anyText.includes('offerte')||anyText.includes('quote')){ count++; } }); return count; }catch(e){ return 0; }}

function buildRevenueByMonth(xmlText, year){ try{ const parser=new DOMParser(); const doc=parser.parseFromString(xmlText,'text/xml'); const items=Array.from(doc.getElementsByTagName('item')); const months=new Array(12).fill(0); items.forEach(it=>{ const wpns='wp:'; const postDate=(it.getElementsByTagName(`${wpns}post_date`)[0]?.textContent)||''; if(!postDate) return; const d=new Date(postDate.replace(' ','T')); if(d.getFullYear()!==year) return; const postmeta=Array.from(it.getElementsByTagName(`${wpns}postmeta`)); let total=0; postmeta.forEach(pm=>{ const k=(pm.getElementsByTagName(`${wpns}meta_key`)[0]?.textContent)||''; if(k==='_order_total'){ const v=(pm.getElementsByTagName(`${wpns}meta_value`)[0]?.textContent)||'0'; total=Number(v)||0; } }); const m=d.getMonth(); months[m]+=total; }); return months; }catch(e){ return new Array(12).fill(0); }}

function aggregateFromXml(xmlText){ try{ const parser=new DOMParser(); const doc=parser.parseFromString(xmlText,'text/xml'); const items=Array.from(doc.getElementsByTagName('item')); let revenue2025=0, revenue2024=0; const emailsAll=new Set(); const quoteEmails=new Set(); let offerCount=0; items.forEach(it=>{ const wpns='wp:'; const postDate=(it.getElementsByTagName(`${wpns}post_date`)[0]?.textContent)||''; const d=postDate?new Date(postDate.replace(' ','T')):null; const cats=Array.from(it.getElementsByTagName('category')).map(c=>(c.textContent||'').toLowerCase()); const desc=((it.getElementsByTagName('description')[0]?.textContent)||'').toLowerCase(); const content=((it.getElementsByTagName('content:encoded')[0]?.textContent)||'').toLowerCase(); const anyText=[desc,content,...cats].join(' '); const postmeta=Array.from(it.getElementsByTagName(`${wpns}postmeta`)); let total=0; let email=''; postmeta.forEach(pm=>{ const k=(pm.getElementsByTagName(`${wpns}meta_key`)[0]?.textContent)||''; const v=(pm.getElementsByTagName(`${wpns}meta_value`)[0]?.textContent)||''; if(k==='_order_total'){ total=Number(v)||0; } if(k==='_billing_email'){ email=(v||'').toLowerCase(); } }); if(email) emailsAll.add(email); const isQuote=anyText.includes('offerte')||anyText.includes('prijsopgave')||anyText.includes('quote'); if(isQuote){ offerCount++; if(email) quoteEmails.add(email); } if(d){ if(d.getFullYear()===2025) revenue2025+=total; if(d.getFullYear()===2024) revenue2024+=total; } }); return { offerCount, leadsCount: quoteEmails.size, customersCount: emailsAll.size, revenueTotal2025: revenue2025, revenueTotal2024: revenue2024 }; }catch(e){ return { offerCount:0, leadsCount:0, customersCount:0, revenueTotal2025:0, revenueTotal2024:0 }; }}

function RevenueChart({data2025, data2024}){
  const [hover,setHover]=useState(null);
  // Werk intern met een vaste viewBox, maar laat de SVG meeschalen
  const vbW=960, vbH=260, pad=36; 
  const innerW=vbW-pad*2, innerH=vbH-pad*2; 
  const max=Math.max(1,...data2025,...data2024); 
  const groups=data2025.length; 
  const gap=8; 
  const barW=(innerW/groups-gap)/2; 
  const months=['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec']; 
  const tipW=120, tipH=40; 
  function fmt(v){ return `€ ${v.toLocaleString('nl-NL',{minimumFractionDigits:2, maximumFractionDigits:2})}`; }
  function clamp(v,min,max){ return Math.max(min, Math.min(max,v)); }
  return (
    <div className="revchart-wrap">
      <svg className="revchart" viewBox={`0 0 ${vbW} ${vbH}`} preserveAspectRatio="xMidYMid meet" onMouseLeave={()=>setHover(null)}>
        <g transform={`translate(${pad},${pad})`}>
          <line x1={0} y1={innerH} x2={innerW} y2={innerH} stroke="#29505d" />
          {data2025.map((v,i)=>{ 
            const xGroup=i*((barW*2)+gap); 
            const h2025=max?(v/max)*innerH:0; 
            const y2025=innerH-h2025; 
            const v24=data2024[i]||0; 
            const h2024=max?(v24/max)*innerH:0; 
            const y2024=innerH-h2024; 
            const centerX = pad + xGroup + barW; // midden tussen 2024 en 2025 bar
            const topY = pad + Math.min(y2024, y2025) - 8; // net boven hoogste bar
            return (
              <g key={i} transform={`translate(${xGroup},0)`}
                 onMouseMove={(e)=>{
                   const svgRect=e.currentTarget.ownerSVGElement.getBoundingClientRect();
                   // Tooltippositie rond geselecteerde maand, gecentreerd boven de bars
                   const clampedX = clamp(centerX, pad+tipW/2, vbW-pad-tipW/2);
                   const clampedY = clamp(topY, pad+tipH/2, vbH-pad-tipH/2);
                   setHover({ x: clampedX, y: clampedY, label:`${months[i]} 2025`, value:v });
                 }}>
                <rect x={0} y={y2024} width={barW} height={h2024} rx={6} fill="#14505e" opacity={.6}/>
                <g transform={`translate(${barW},0)`}>
                  <rect x={0} y={y2025} width={barW} height={h2025} rx={6} fill="var(--brand-accent)" opacity={.85}/>
                </g>
                <text x={(barW)} y={innerH+14} textAnchor="middle" fill="#9ec9d6" fontSize="11">{months[i]}</text>
              </g>
            );
          })}
        </g>
        {hover&&(
          <g className="revchart-tip">
            <rect x={hover.x-tipW/2} y={hover.y-tipH} width={tipW} height={tipH} rx={8} fill="#0d2330" stroke="#2a5566"/>
            <text x={hover.x} y={hover.y-26} textAnchor="middle" fill="#a7dbe8" fontSize="12">{hover.label.toUpperCase()}</text>
            <text x={hover.x} y={hover.y-12} textAnchor="middle" fill="#e6fcff" fontSize="13" fontWeight="700">{fmt(hover.value)}</text>
          </g>
        )}
      </svg>
      <div className="revchart-legend"><span className="lg lg-2025"/>2025 <span className="lg lg-2024"/>2024</div>
    </div>
  );
}

export default function Dashboard(){ 
  const [products,setProducts]=useState([]);
  const [offerCount,setOfferCount]=useState(null);
  const [revenue2025,setRevenue2025]=useState(new Array(12).fill(0));
  const [revenue2024,setRevenue2024]=useState(new Array(12).fill(0));
  const [totals,setTotals]=useState({ revenueTotal2025:0, revenueTotal2024:0, customersCount:0, leadsCount:0, offerCount:0 });
  const [leadStats, setLeadStats] = useState({ leads:0, customers:0 });

  useEffect(()=>{ 
    fetch(CSV_URL)
      .then(r=>r.text())
      .then(txt=>{ 
        const parsed=parseCsv(txt);
        // Zelfde validatie als Producten.jsx
        const full = parsed.filter(p => {
          const naam = p['Naam'] && p['Naam'].length > 0;
          const prijs = p['Reguliere prijs'] && p['Reguliere prijs'].length > 0 && Number(p['Reguliere prijs']) > 0;
          let img = (p['Afbeeldingen'] || '').split(',')[0].trim();
          const hasImg = img && img.startsWith('http');
          return naam && prijs && hasImg;
        });
        setProducts(full);
      })
      .catch(()=>{}); 
  },[]);

  useEffect(()=>{ fetch(ORDERS_XML).then(r=>r.text()).then(txt=>{ setOfferCount(countQuoteRequestsFromXml(txt)); setRevenue2025(buildRevenueByMonth(txt,2025)); setRevenue2024(buildRevenueByMonth(txt,2024)); setTotals(aggregateFromXml(txt)); }).catch(()=>{ setOfferCount(null); setRevenue2025(new Array(12).fill(0)); setRevenue2024(new Array(12).fill(0)); setTotals({ revenueTotal2025:0, revenueTotal2024:0, customersCount:0, leadsCount:0, offerCount:0 }); }); },[]);

  useEffect(()=>{
    try{
      const saved = localStorage.getItem('ep_leads');
      if(saved){
        const parsed = JSON.parse(saved);
        const leads = parsed.length;
        const customers = parsed.filter(l=> (l.status||'').toLowerCase()==='klant').length;
        setLeadStats({ leads, customers });
      }
    }catch(e){ setLeadStats({ leads:0, customers:0 }); }
  },[]);

  const outOfStock=useMemo(()=> products.filter(p=> !(p['Op voorraad?']==='1'||p['Op voorraad?']===1)).length,[products]);
  const omzet2025=totals.revenueTotal2025; const omzet2024=totals.revenueTotal2024; const diff=omzet2025-omzet2024; const pct=omzet2024? (diff/omzet2024)*100 : 100; const omzetFmt=`€ ${omzet2025.toLocaleString('nl-NL',{minimumFractionDigits:2, maximumFractionDigits:2})}`; const diffFmt=`${diff>=0?'+':''}€ ${Math.abs(diff).toLocaleString('nl-NL',{minimumFractionDigits:2, maximumFractionDigits:2})} (${pct>=0?'+':''}${pct.toFixed(1)}%)`;

  const klanten = leadStats.customers || totals.customersCount;
  const leads = leadStats.leads || totals.leadsCount;
  const offers = totals.offerCount ?? offerCount ?? 0;

  return (
    <div className="dashboard-wrapper"><Sidebar /><main className="dashboard-main dash-main"><div className="dash-titlebar"><h1>Dashboard</h1></div><section className="stat-grid"><article className="stat-card"><div className="stat-label">Producten niet op voorraad</div><div className="stat-value">{outOfStock}</div></article><article className="stat-card"><div className="stat-label">Omzet (2025)</div><div className="stat-value">{omzetFmt}</div><div className={`stat-delta ${diff>=0?'up':'down'}`}>{diffFmt}</div></article><article className="stat-card"><div className="stat-label">Offerte aanvragen</div><div className="stat-value">{offers}</div></article><article className="stat-card"><div className="stat-label">Klanten</div><div className="stat-value">{klanten}</div></article><article className="stat-card"><div className="stat-label">Leads</div><div className="stat-value">{leads}</div></article></section><section className="revchart-section"><div className="revchart-title">Omzet 2025 vs 2024 (op basis van offerte-aanvragen)</div><RevenueChart data2025={revenue2025} data2024={revenue2024} /></section></main></div>
  );
}


