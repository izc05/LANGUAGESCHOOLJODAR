import { Link } from 'react-router-dom';
import { AlertTriangle, Building2, CalendarClock, ClipboardList, FileText, FolderOpen, Home, Plus, QrCode, Settings2, ShieldCheck, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import MetricCard from '../components/Cards/MetricCard';
import DataTable from '../components/Cards/DataTable';
import PageHeader from '../components/Layout/PageHeader';
import { DashboardCard, DocumentCard, EmptyState, QRScanButton, QuickActionButton, SectionHeader } from '../components/ServiceDashboard';
import { useTenant } from '../hooks/useTenant';
import { dashboardMetrics } from '../services/tenantService';
import { formatDateTime } from '../utils/dateUtils';
import isivoltproLogo from '../assets/brand/isivoltpro-activos-logo.svg';
import serviceAire from '../assets/homeserve/homeserve-aire-acondicionado.jpg';
import serviceEquipment from '../assets/homeserve/homeserve-electrodomesticos.jpg';
import serviceUtilities from '../assets/homeserve/homeserve-luz-agua.jpg';
import serviceOverview from '../assets/homeserve/homeserve-zona-cliente.jpg';

export default function Dashboard() {
  const {
    tenants,
    activeTenant,
    activeTenantId,
    activeInstallationId,
    activeInstallation,
    installations,
    setActiveTenantId,
    setActiveInstallationId
  } = useTenant();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    if (!activeTenantId) return undefined;
    let mounted = true;
    const refreshMetrics = () => dashboardMetrics(activeTenantId, activeInstallationId)
      .then((data) => { if (mounted) setMetrics(data); })
      .catch(console.error);
    refreshMetrics();
    const interval = window.setInterval(refreshMetrics, 30000);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshMetrics();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      mounted = false;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [activeTenantId, activeInstallationId]);

  const data = metrics || { totalInstalaciones: 0, totalActivos: 0, pendientesRevision: 0, incidenciasAbiertas: 0, documentosRecientes: [] };
  const presentationImages = [
    { src: serviceAire, title: 'Climatización', text: 'Mantenimiento, revisión y trazabilidad técnica' },
    { src: serviceEquipment, title: 'Equipos y activos', text: 'Inventario, averías y seguimiento de trabajos' },
    { src: serviceUtilities, title: 'Instalaciones', text: 'Electricidad, agua y servicios conectados por QR' }
  ];

  function selectClient(tenantId) {
    setActiveTenantId(tenantId);
    setMetrics(null);
  }

  function selectInstallation(installationId) {
    setActiveInstallationId(installationId);
    setMetrics(null);
  }

  return (
    <>
      <section className="service-hero">
        <div>
          <div className="presentation-brand-lockup">
            <img src={isivoltproLogo} alt="IsiVoltPro Activos" />
            <span>Ecosistema técnico de mantenimiento</span>
          </div>
          <span className="section-eyebrow">Panel operativo</span>
          <h1>IsiVoltPro Activos · Gestión técnica QR/NFC</h1>
          <p>Controla clientes, instalaciones, activos, documentación, mantenimiento y órdenes de trabajo desde una única plataforma.</p>
          <div className="quick-actions">
            <QRScanButton />
            <QuickActionButton to="/incidencias" icon={AlertTriangle}>Crear incidencia</QuickActionButton>
            <QuickActionButton to="/activos" icon={Wrench}>Ver activos</QuickActionButton>
          </div>
        </div>
        <div className="service-hero-panel presentation-hero-panel">
          <img src={serviceOverview} alt="Gestión de servicios técnicos" />
          <strong>Resumen de la instalación</strong>
          <div className="service-hero-stat"><span>Activos registrados</span><b>{data.totalActivos}</b></div>
          <div className="service-hero-stat"><span>Incidencias abiertas</span><b>{data.incidenciasAbiertas}</b></div>
          <div className="service-hero-stat"><span>Revisiones próximas</span><b>{data.pendientesRevision}</b></div>
        </div>
      </section>

      <section className="presentation-image-strip">
        {presentationImages.map((item) => (
          <article key={item.title}>
            <img src={item.src} alt={item.title} />
            <div>
              <strong>{item.title}</strong>
              <span>{item.text}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="dashboard-flow-card">
        <div className="section-title compact-title">
          <div>
            <h2>1. Clientes</h2>
            <p>Un cliente puede tener varias instalaciones. El cliente activo filtra todo el entorno de trabajo.</p>
          </div>
          <Link className="secondary-button" to="/clientes"><Building2 size={16} /> Gestionar clientes</Link>
        </div>
        <div className="client-card-grid">
          {tenants.map((tenant) => (
            <button
              key={tenant.id}
              type="button"
              className={`client-select-card ${tenant.id === activeTenantId ? 'active' : ''}`}
              onClick={() => selectClient(tenant.id)}
            >
              <span className="client-select-icon"><Building2 size={20} /></span>
              <strong>{tenant.nombre}</strong>
              <small>{tenant.estado || 'activo'} · {tenant.plan || 'starter'}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="dashboard-flow-card">
        <div className="section-title compact-title">
          <div>
            <h2>2. Instalaciones de {activeTenant?.nombre || 'cliente activo'}</h2>
            <p>Selecciona una instalación para trabajar sobre sus ubicaciones, activos, OT, documentos y fotografías.</p>
          </div>
          <Link className="primary-button" to="/instalaciones"><Plus size={16} /> Nueva instalación</Link>
        </div>
        <div className="installation-card-grid">
          {installations.map((installation) => (
            <button
              key={installation.id}
              type="button"
              className={`installation-select-card ${installation.id === activeInstallationId ? 'active' : ''}`}
              onClick={() => selectInstallation(installation.id)}
            >
              <span className="installation-select-icon"><Home size={20} /></span>
              <strong>{installation.nombre}</strong>
              <small>{installation.direccion || installation.tipo || 'Sin dirección'}</small>
              <em>{installation.id === activeInstallationId ? 'Instalación activa' : 'Activar instalación'}</em>
            </button>
          ))}
          {installations.length === 0 && <p className="muted">Este cliente todavía no tiene instalaciones.</p>}
        </div>
      </section>

      <PageHeader title="Estado de la instalación activa" subtitle={activeInstallation ? `Estado operativo de ${activeInstallation.nombre}.` : 'Selecciona una instalación para ver sus datos.'} />
      {activeInstallation && <p className="active-filter-note">Filtro activo: {activeTenant?.nombre} · {activeInstallation.nombre}</p>}
      <div className="grid metrics service-summary-grid">
        <MetricCard label={activeInstallation ? 'Instalación activa' : 'Instalaciones'} value={data.totalInstalaciones} />
        <MetricCard label="Activos" value={data.totalActivos} />
        <MetricCard label="Pendientes de revisión" value={data.pendientesRevision} tone="warn" />
        <MetricCard label="Incidencias abiertas" value={data.incidenciasAbiertas} tone="danger" />
      </div>

      <SectionHeader
        eyebrow="Accesos principales"
        title="Centro de operaciones"
        description="Las herramientas habituales para inventario, reparaciones, instalaciones y documentación técnica."
      />
      <section className="service-card-grid">
        <DashboardCard
          icon={QrCode}
          title="Activos QR"
          description="Consulta equipos registrados, escanea QR/NFC y añade nuevos activos."
          meta={`${data.totalActivos} activos`}
          to="/activos"
          actionLabel="Abrir activos"
        />
        <DashboardCard
          icon={AlertTriangle}
          title="Incidencias y reparaciones"
          description="Registra avisos en segundos y consulta su evolución hasta el cierre."
          meta={`${data.incidenciasAbiertas} abiertas`}
          to="/incidencias"
          actionLabel="Ver incidencias"
          tone="danger"
        />
        <DashboardCard
          icon={Home}
          title="Instalaciones"
          description="Consulta ubicaciones, documentación, contactos e historial técnico."
          meta={`${data.totalInstalaciones} instalaciones`}
          to="/instalaciones"
          actionLabel="Ver instalaciones"
        />
        <DashboardCard
          icon={CalendarClock}
          title="Mantenimiento preventivo"
          description="Próximas revisiones, checklist pendientes y avisos importantes."
          meta={`${data.pendientesRevision} pendientes`}
          to="/mantenimiento"
          actionLabel="Planificar revisión"
          tone="warn"
        />
        <DashboardCard
          icon={FolderOpen}
          title="Documentación técnica"
          description="Manuales, contratos, informes, certificados y archivos asociados."
          meta={activeTenant?.nombre || 'Cliente activo'}
          to="/documentos"
          actionLabel="Abrir documentos"
        />
      </section>

      <SectionHeader
        eyebrow="Seguimiento"
        title="Atajos de trabajo"
        description="Accede rápidamente a las acciones que un técnico o coordinador necesita durante una intervención."
      />
      <section className="service-action-grid">
        <QuickActionButton to="/scanner" icon={QrCode} variant="primary">Escanear QR</QuickActionButton>
        <QuickActionButton to="/incidencias" icon={ClipboardList}>Mis incidencias</QuickActionButton>
        <QuickActionButton to="/documentos" icon={FileText}>Mis documentos</QuickActionButton>
        <QuickActionButton to="/mantenimiento" icon={ShieldCheck}>Historial</QuickActionButton>
        <QuickActionButton to="/ots-dashboard" icon={Settings2}>Seguimiento OT</QuickActionButton>
      </section>

      <div style={{ marginTop: 16 }}>
        <DataTable
          columns={[
            { key: 'titulo', label: 'Documentos recientes' },
            { key: 'tipo', label: 'Tipo' },
            { key: 'visibilidad', label: 'Visibilidad', render: (row) => <span className="badge">{row.visibilidad}</span> },
            { key: 'created_at', label: 'Fecha', render: (row) => formatDateTime(row.created_at) }
          ]}
          rows={data.documentosRecientes}
          empty="Sin documentos recientes para la instalación activa"
        />
      </div>

      {data.documentosRecientes.length === 0 && (
        <div style={{ marginTop: 16 }}>
          <EmptyState
            title="Sin actividad documental reciente"
            description="Cuando subas manuales, contratos o informes aparecerán aquí para consulta rápida."
            action={<DocumentCard title="Documentación técnica" description="Subir o consultar archivos asociados" />}
          />
        </div>
      )}
    </>
  );
}
