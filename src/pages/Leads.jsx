import Sidebar from '../components/Sidebar';
import './Leads.css';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const demoLeads = [
  { id:'L-2001', naam:'Anouk Jansen', bedrijf:'EcoPump BV', email:'anouk@ecopump.nl', bron:'Website formulier', status:'Nieuw', activities:[], nextAction:'' },
  { id:'L-2002', naam:'Rick Meijer', bedrijf:'HVAC Experts', email:'rick@hvacexperts.nl', bron:'Telefonisch', status:'Opvolgen', activities:[], nextAction:'' },
  { id:'L-2003', naam:'Sanne Peters', bedrijf:'BlueGrid', email:'sanne@bluegrid.io', bron:'Beurs', status:'Gekwalificeerd', activities:[], nextAction:'' },
  { id:'L-2004', naam:'Tom Visser', bedrijf:'WindWorks NL', email:'tom@windworks.nl', bron:'Website formulier', status:'Afgewezen', activities:[], nextAction:'' },
];

const STATUSES = ['Nieuw','Opvolgen','Gekwalificeerd','Afgewezen','Klant'];

export default function Leads(){
  const navigate = useNavigate();
  const [leads, setLeads] = useState(()=>{
    const saved = localStorage.getItem('ep_leads');
    return saved ? JSON.parse(saved) : demoLeads;
  });
  const [search, setSearch] = useState('');

  useEffect(()=>{ localStorage.setItem('ep_leads', JSON.stringify(leads)); },[leads]);

  const filtered = useMemo(()=>{
    const s = search.toLowerCase();
    return leads.filter(l => (l.naam||'').toLowerCase().includes(s) || (l.bedrijf||'').toLowerCase().includes(s) || (l.email||'').toLowerCase().includes(s) || (l.id||'').toLowerCase().includes(s));
  }, [search, leads]);

  function updateStatus(id, status){ setLeads(prev => prev.map(l => l.id===id ? { ...l, status } : l)); }
  function convertToCustomer(id){ setLeads(prev => prev.map(l => l.id===id ? { ...l, status:'Klant', convertedAt:new Date().toISOString() } : l)); }
  function removeLead(id){ if(!confirm('Weet je zeker dat je deze lead wilt verwijderen?')) return; setLeads(prev => prev.filter(l => l.id!==id)); }

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="dashboard-main leads-main">
        <div className="leads-titlebar">
          <h1>Leads</h1>
          <input className="leads-search" placeholder="Zoek lead (naam, bedrijf, e-mail of ID)" value={search} onChange={(e)=>setSearch(e.target.value)} />
        </div>
        <div className="leads-table-wrap">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Lead ID</th>
                <th>Naam</th>
                <th>Bedrijf</th>
                <th>E-mail</th>
                <th>Bron</th>
                <th>Status</th>
                <th>Volgende actie</th>
                <th style={{textAlign:'right'}}>Acties</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id} onClick={()=>navigate(`/lead/${l.id}`)} style={{cursor:'pointer'}}>
                  <td>{l.id}</td>
                  <td>{l.naam}</td>
                  <td>{l.bedrijf}</td>
                  <td>{l.email}</td>
                  <td>{l.bron}</td>
                  <td onClick={(e)=>e.stopPropagation()}>
                    <select className="lead-status-select" value={l.status} onChange={(e)=>updateStatus(l.id, e.target.value)}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>{l.nextAction || '-'}</td>
                  <td onClick={(e)=>e.stopPropagation()}>
                    <div className="lead-actions">
                      <button className="lead-btn" onClick={()=>navigate(`/lead/${l.id}`)}>Details</button>
                      <button className="lead-btn convert" onClick={()=>convertToCustomer(l.id)}>Maak klant</button>
                      <button className="lead-btn delete" onClick={()=>removeLead(l.id)}>Verwijderen</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length===0 && (<tr><td colSpan={8} style={{opacity:.7, padding:'12px'}}>Geen resultaten</td></tr>)}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
