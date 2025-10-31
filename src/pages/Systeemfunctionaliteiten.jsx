import './Systeemfunctionaliteiten.css';
import Sidebar from '../components/Sidebar';

export default function Systeemfunctionaliteiten(){
  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="dashboard-main">
        <div className="sys-wrap">
          <h1>Systeemfunctionaliteiten</h1>
          <p className="sys-intro">Dit platform is een maatwerk CRM voor Electroproject. Hieronder een overzicht van de belangrijkste functies en wat je ermee kunt.</p>

          <section className="sys-card">
            <h2>Productbeheer</h2>
            <ul>
              <li>Productoverzicht met zoek, filter (categorie, merk) en prijsrange.</li>
              <li>Voorraadstatus zichtbaar per kaart (op voorraad / niet op voorraad).</li>
              <li>Productdetailpagina per SKU met afbeelding, beschrijving en specificaties (uit CSV).</li>
              <li>Breadcrumbs en gerelateerde producten.</li>
            </ul>
          </section>

          <section className="sys-card">
            <h2>Offerte aanvragen</h2>
            <ul>
              <li>Overzichtslijst uit WordPress/WooCommerce XML met zoek, statusfilter, bedrag-slider en “alleen aanvragen/offertes”.</li>
              <li>Status-badges (Nieuw, Pending, Expired) en klik door naar detail per aanvraag.</li>
              <li>Acties: Wijzig status (UI), Bekijk offerte (detail), Verwijderen met bevestigingsmodal.</li>
              <li>Detailpagina met klantgegevens (billing_*) en link naar PDF (Offerte_&lt;ID&gt;.pdf).</li>
              <li>Automatisch vullen van gegevens zoveel mogelijk uit XML; voorbereid op orderregels (afhankelijk van meta-keys).</li>
            </ul>
          </section>

          <section className="sys-card">
            <h2>Dashboard</h2>
            <ul>
              <li>Cards met: producten niet op voorraad, omzet (2025), offerte-aanvragen, klanten, leads.</li>
              <li>Omzetgrafiek 2025 vs 2024 (op basis van offerte-aanvragen), responsive en met tooltip.</li>
              <li>Omzetkaart toont delta in bedrag en percentage t.o.v. 2024.</li>
            </ul>
          </section>

          <section className="sys-card">
            <h2>CRM-secties</h2>
            <ul>
              <li>Klanten: lijst met zoekfunctie (demo-data, uitbreidbaar naar echte bron).</li>
              <li>Leads: lijst met zoekfunctie en statusbadges (demo-data, uitbreidbaar naar echte bron).</li>
            </ul>
          </section>

          <section className="sys-card">
            <h2>Interface &amp; theming</h2>
            <ul>
              <li>Donker thema met platformbrede Roboto-typografie.</li>
              <li>Sidebar met compacte spacing en actieve/hover-states.</li>
              <li>Custom favicon (beeldmerk.svg) en SEO meta (titel en description).</li>
            </ul>
          </section>

          <section className="sys-card">
            <h2>Uitbreiding (geïnspireerd op Salesforce)</h2>
            <ul>
              <li><strong>Sales</strong>: SFA (accounts, opportunities), AI/Agents, forecasting, Partner Cloud, Revenue/CPQ.</li>
              <li><strong>Service</strong>: Case management, Field Service, IT/HR service, self‑service, omnichannel, service analytics.</li>
              <li><strong>Marketing</strong>: AI & personalisatie, e‑mail/mobile/ads, B2B automation, CDP, loyalty.</li>
              <li><strong>Commerce</strong>: B2C/B2B storefronts, order management, payments.</li>
              <li><strong>Analytics & Data</strong>: Tableau/CRM Analytics, Data Cloud (360‑profielen, privacy, connectors).</li>
              <li><strong>Platform & Integraties</strong>: Flow automation, AI/app‑ontwikkeling, MuleSoft, Heroku, security/governance.</li>
              <li><strong>Slack</strong>: CRM‑meldingen, taken, workflows en AI‑productiviteit in Slack.</li>
              <li><strong>Small Business</strong>: Starter/Pro suite om snel te starten en opschalen.</li>
              <li><strong>Net Zero</strong>: CO₂‑rapportage en sustainability tooling (optioneel).</li>
              <li><strong>Customer Success & Partners</strong>: Succesplannen, services en app‑ecosysteem.</li>
            </ul>
            <p className="sys-intro">Bron: productindeling en capabilities van Salesforce – zie <a href="https://www.salesforce.com/" target="_blank" rel="noreferrer">salesforce.com</a>. We kunnen per categorie MVP’s definiëren voor Electroproject.</p>
          </section>

          <section className="sys-card">
            <h2>Toekomstige uitbreidingen (mogelijk)</h2>
            <ul>
              <li>Koppeling orderregels uit plugin-specifieke meta voor complete offertetabellen.</li>
              <li>Persistente statuswijziging/verwijderen via backend API (momenteel UI-only).</li>
              <li>Open Graph/Twitter meta voor social previews.</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
