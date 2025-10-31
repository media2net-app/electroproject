import Sidebar from '../components/Sidebar';
import './Klanten.css';
import { useMemo, useState } from 'react';

const demoCustomers = [
  { id: 'C-1001', naam: 'TechnoPower BV', email: 'info@technopower.nl', telefoon: '+31 88 100 1001', status:'Actief' },
  { id: 'C-1002', naam: 'WindWorks NL', email: 'contact@windworks.nl', telefoon: '+31 88 100 1002', status:'Actief' },
  { id: 'C-1003', naam: 'HydroDrive Europe', email: 'sales@hydrodrive.eu', telefoon: '+31 88 100 1003', status:'Inactief' },
  { id: 'C-1004', naam: 'GreenGrid Services', email: 'support@greengrid.io', telefoon: '+31 88 100 1004', status:'Actief' },
];

export default function Klanten(){
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return demoCustomers.filter(c => c.naam.toLowerCase().includes(s) || c.email.toLowerCase().includes(s) || c.id.toLowerCase().includes(s));
  }, [search]);

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="dashboard-main klanten-main">
        <div className="klanten-titlebar">
          <h1>Klanten</h1>
          <input className="klanten-search" placeholder="Zoek klant (naam, e-mail of ID)" value={search} onChange={(e)=>setSearch(e.target.value)} />
        </div>
        <div className="klanten-table-wrap">
          <table className="klanten-table">
            <thead>
              <tr>
                <th>Klant ID</th>
                <th>Naam</th>
                <th>E-mail</th>
                <th>Telefoon</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.naam}</td>
                  <td>{c.email}</td>
                  <td>{c.telefoon}</td>
                  <td><span className={c.status==='Actief'?'klant-badge active':'klant-badge inactive'}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}


