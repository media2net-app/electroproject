import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();
  function handleLogout(e) {
    e.preventDefault();
    navigate('/login', {replace: true});
  }
  return (
    <aside className="sidebar">
      <img className="sidebar-logo" src="/logo/EQUANS-logo-white-Electroproject.svg" alt="Electroproject logo" />
      <nav>
        <ul>
          <li><NavLink to="/dashboard" activeclassname="active">Dashboard</NavLink></li>
          <li><NavLink to="/offerte" activeclassname="active">Offerte aanvragen</NavLink></li>
          <li><NavLink to="/team" activeclassname="active">Team</NavLink></li>
          <li><NavLink to="/klanten" activeclassname="active">Klanten</NavLink></li>
          <li><NavLink to="/leads" activeclassname="active">Leads</NavLink></li>
          <li><NavLink to="/rapportages" activeclassname="active">Rapportages</NavLink></li>
          <li><NavLink to="/producten" activeclassname="active">Producten</NavLink></li>
        </ul>
      </nav>
      <div className="sidebar-bottom">
        <img className="sidebar-favicon" src="/beeldmerk/beeldmerk.svg" alt="Favicon" />
        <button className="sidebar-secondary" onClick={()=>navigate('/systeemfunctionaliteiten')}>Systeemfunctionaliteiten</button>
        <button className="sidebar-logout" onClick={handleLogout}>Uitloggen</button>
      </div>
    </aside>
  );
}

export default Sidebar;
