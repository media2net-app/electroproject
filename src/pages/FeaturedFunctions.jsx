import './Systeemfunctionaliteiten.css';
import Sidebar from '../components/Sidebar';

export default function FeaturedFunctions(){
  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="dashboard-main">
        <div className="sys-wrap">
          <h1>Featured functions – platformoverzicht</h1>
          <p className="sys-intro">Onderstaande lijst geeft een breed overzicht van functies die je in een modern CRM‑platform aantreft (geïnspireerd op de indeling van Salesforce). We kunnen per categorie bepalen welke onderdelen we voor Electroproject willen realiseren.</p>

          <section className="sys-card">
            <h2>Sales</h2>
            <ul>
              <li>Sales Force Automation: accounts, contacts, opportunities, pipeline.</li>
              <li>Sales AI &amp; Agents: assist bij opvolging, scoring, samenvattingen.</li>
              <li>Performance Management &amp; Forecasting.</li>
              <li>Partner Cloud: partnerportal, deal‑registratie.</li>
              <li>Revenue Lifecycle Management &amp; CPQ: offertes, prijslijsten, configuraties.</li>
            </ul>
          </section>

          <section className="sys-card">
            <h2>Service</h2>
            <ul>
              <li>Customer Service Management: cases, SLA, knowledge.</li>
              <li>Field Service: werkbonnen, planning, mobiele app.</li>
              <li>IT Service / HR Service (ticketing, workflows).</li>
              <li>Self‑Service &amp; digitale kanalen (chat, e‑mail, voice, social).</li>
              <li>Service Analytics &amp; rapportages.</li>
            </ul>
          </section>

          <section className="sys-card">
            <h2>Marketing</h2>
            <ul>
              <li>Marketing AI &amp; personalisatie.</li>
              <li>E‑mail/ mobiele campagnes, advertising &amp; journeys.</li>
              <li>B2B Marketing Automation (nurture, MQL, scoring).</li>
              <li>Customer Data Platform &amp; Loyalty Management.</li>
            </ul>
          </section>

          <section className="sys-card">
            <h2>Commerce</h2>
            <ul>
              <li>B2C en B2B Commerce storefronts.</li>
              <li>Order Management &amp; Payments.</li>
            </ul>
          </section>

          <section className="sys-card">
            <h2>Analytics &amp; Data</h2>
            <ul>
              <li>Analytics (Tableau / CRM Analytics) voor dashboards en deep‑dive.</li>
              <li>Data Cloud: 360‑profielen, real‑time data, connecties &amp; privacy.</li>
            </ul>
          </section>

          <section className="sys-card">
            <h2>Platform &amp; Integraties</h2>
            <ul>
              <li>AI &amp; Apps bouwen: componenten, extensies, policies.</li>
              <li>Flow Automation voor processen en goedkeuringen.</li>
              <li>MuleSoft (API‑koppelingen) en Heroku (app‑hosting).</li>
              <li>Beveiliging, governance en toegangsbeheer.</li>
            </ul>
          </section>

          <section className="sys-card">
            <h2>Slack‑integratie</h2>
            <ul>
              <li>CRM in Slack: meldingen, taken, cases en verkoop in kanalen.</li>
              <li>AI‑productiviteit en workflows vanuit Slack.</li>
            </ul>
          </section>

          <section className="sys-card">
            <h2>Small Business</h2>
            <ul>
              <li>Starter / Pro Suite (Sales, Service, Marketing in één app).</li>
              <li>Opschalen met dezelfde data en security.</li>
            </ul>
          </section>

          <section className="sys-card">
            <h2>Net Zero &amp; Sustainability</h2>
            <ul>
              <li>CO₂‑footprint, rapportages en marketplace (optioneel).</li>
            </ul>
          </section>

          <section className="sys-card">
            <h2>Customer Success &amp; Partners</h2>
            <ul>
              <li>Succesplannen &amp; Professional Services.</li>
              <li>App‑ecosysteem (AppExchange) en consultants.</li>
            </ul>
          </section>

          <section className="sys-card">
            <h2>Volgende stap</h2>
            <p>Selecteer de gewenste categorieën/onderdelen; daarna kunnen we per onderdeel een scope, datamodel en MVP‑scherm opstellen. Zo bouwen we gefaseerd een compleet Electroproject‑platform.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
