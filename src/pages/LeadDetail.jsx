import Sidebar from '../components/Sidebar';
import './Leads.css';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const STATUSES = ['Nieuw','Opvolgen','Gekwalificeerd','Afgewezen','Klant'];

function loadLeads(){ try{ const s=localStorage.getItem('ep_leads'); return s? JSON.parse(s): []; }catch(e){ return []; } }
function saveLeads(arr){ try{ localStorage.setItem('ep_leads', JSON.stringify(arr)); }catch(e){} }

export default function LeadDetail(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [leads, setLeads] = useState(loadLeads());
  const lead = useMemo(()=> leads.find(l=> (l.id||'')===id), [leads, id]);

  const [note, setNote] = useState('');
  const [nextAction, setNextAction] = useState('');

  useEffect(()=>{ if(lead){ setNextAction(lead.nextAction||''); } },[lead]);
  useEffect(()=>{ saveLeads(leads); },[leads]);

  function updateStatus(status){ setLeads(prev=> prev.map(l=> l.id===id? { ...l, status }: l)); }
  function addActivity(){ if(!lead) return; const entry={ at:new Date().toISOString(), note: note.trim() }; setLeads(prev=> prev.map(l=> l.id===id? { ...l, activities:[entry, ...(l.activities||[])], nextAction }: l)); setNote(''); }
  function convertToCustomer(){ updateStatus('Klant'); setLeads(prev=> prev.map(l=> l.id===id? { ...l, convertedAt: new Date().toISOString() }: l)); }
  function removeLead(){ if(!confirm('Lead verwijderen?')) return; setLeads(prev=> prev.filter(l=> l.id!==id)); navigate('/leads'); }

  if(!lead){
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <main className="dashboard-main leads-main">
          <div className="leads-titlebar"><h1>Lead niet gevonden</h1></div>
          <button className="lead-btn" onClick={()=>navigate('/leads')}>Terug naar leads</button>
        </main>
      </div>
    );
  }

  const activeIndex = STATUSES.indexOf(lead.status);

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="dashboard-main leads-main">
        <div className="leads-titlebar">
          <h1>Lead — {lead.naam} <span style={{fontSize:'.65em', fontWeight:400, color:'#74ffe2'}}>({lead.id})</span></h1>
          <div className="lead-actions">
            <button className="lead-btn" onClick={()=>navigate('/leads')}>Terug</button>
            <button className="lead-btn convert" onClick={convertToCustomer}>Markeer als klant</button>
            <button className="lead-btn delete" onClick={removeLead}>Verwijderen</button>
          </div>
        </div>

        <div className="lead-flow">
          {STATUSES.map((s, idx) => {
            const state = idx < activeIndex ? 'done' : (idx === activeIndex ? 'active' : 'todo');
            return (
              <div key={s} className={`flow-step ${state}`} onClick={()=>updateStatus(s)}>
                <div className="dot" />
                <span>{s}</span>
                {idx < STATUSES.length-1 && <div className="bar" />}
              </div>
            );
          })}
        </div>

        <div className="modal-content" style={{marginTop:8}}>
          <div className="lead-detail-grid">
            <div><strong>Bedrijf:</strong> {lead.bedrijf||'-'}</div>
            <div><strong>E‑mail:</strong> {lead.email||'-'}</div>
            <div><strong>Bron:</strong> {lead.bron||'-'}</div>
            <div><strong>Status:</strong> {lead.status}</div>
            {lead.convertedAt && <div style={{gridColumn:'1 / -1'}}><strong>Geconverteerd:</strong> {new Date(lead.convertedAt).toLocaleString('nl-NL')}</div>}
          </div>
          <div className="lead-note">
            <label>Nieuwe activiteit / notitie</label>
            <textarea value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Belnotitie, e‑mail, afspraak, etc." />
            <label>Volgende actie (datum)</label>
            <input type="date" value={nextAction} onChange={(e)=>{ setNextAction(e.target.value); setLeads(prev=> prev.map(l=> l.id===id? { ...l, nextAction: e.target.value }: l)); }} />
            <div className="modal-actions">
              <button className="modal-btn" onClick={addActivity}>Opslaan</button>
            </div>
          </div>
          <div className="lead-activity">
            <h3>Activiteiten</h3>
            <ul>
              {(lead.activities||[]).map((a,idx)=> (
                <li key={idx}><span>{new Date(a.at).toLocaleString('nl-NL')}</span> — {a.note}</li>
              ))}
              {(!lead.activities || lead.activities.length===0) && <li>Geen activiteiten</li>}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}


