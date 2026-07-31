import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Info, QrCode, Server, ShieldCheck, Wrench } from 'lucide-react';
import FormField from '../components/Forms/FormField';
import { resetPassword, signIn } from '../services/authService';
import { backendConfiguration } from '../services/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import isivoltproLogo from '../assets/brand/isivoltpro-activos-logo.svg';

export default function Login() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  if (isAuthenticated) return <Navigate to={location.state?.from?.pathname || '/'} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    if (!backendConfiguration.configured) {
      setMessage('El backend local todavía no está configurado. Completa el despliegue del mini PC antes de iniciar sesión.');
      return;
    }

    const { error } = await signIn(email.trim(), password);
    if (error) {
      setMessage(error.message === 'Invalid login credentials'
        ? 'El correo o la contraseña no son correctos.'
        : error.message);
    }
  }

  async function handleReset() {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) return setMessage('Introduce tu correo para recuperar la contraseña.');
    if (!backendConfiguration.configured) {
      return setMessage('El backend local todavía no está configurado.');
    }
    const { error } = await resetPassword(normalizedEmail);
    setMessage(error ? error.message : 'Revisa tu correo para continuar.');
  }

  return (
    <section className="login-page">
      <div className="login-visual branded-login-visual">
        <img className="presentation-logo light-surface" src={isivoltproLogo} alt="IsiVoltPro Activos" />
        <div>
          <span className="section-eyebrow">Ecosistema técnico IsiVoltPro</span>
          <h1>Todo el mantenimiento, conectado al activo.</h1>
        </div>
        <p>Gestiona instalaciones, equipos, órdenes de trabajo, revisiones y documentación desde una plataforma preparada para QR y NFC.</p>
        <div className="login-feature-grid" aria-label="Funciones principales">
          <article className="login-feature-card">
            <QrCode size={24} />
            <strong>Acceso inmediato</strong>
            <span>Escanea el activo y abre su ficha técnica.</span>
          </article>
          <article className="login-feature-card">
            <Wrench size={24} />
            <strong>Mantenimiento trazable</strong>
            <span>Historial, incidencias y órdenes de trabajo.</span>
          </article>
          <article className="login-feature-card">
            <ShieldCheck size={24} />
            <strong>Permisos seguros</strong>
            <span>Cada perfil consulta solo lo que necesita.</span>
          </article>
        </div>
      </div>

      <form className="login-panel" onSubmit={handleSubmit}>
        <div>
          <img className="login-panel-logo" src={isivoltproLogo} alt="IsiVoltPro Activos" />
          <span className="section-eyebrow">Acceso profesional</span>
          <h2>Bienvenido de nuevo</h2>
          <p className="muted">Entra con el correo y la contraseña creados en el servidor local. Los técnicos nuevos necesitan una invitación del administrador.</p>
        </div>

        <div className={`demo-access-note ${backendConfiguration.configured ? '' : 'backend-warning'}`}>
          {backendConfiguration.configured ? <Server size={18} /> : <Info size={18} />}
          <div>
            <strong>{backendConfiguration.configured ? 'Servidor local configurado' : 'Instalación local pendiente'}</strong>
            <span>
              {backendConfiguration.configured
                ? 'IsiVoltPro Activos está preparado para usar el backend del mini PC.'
                : 'El correo administrador se definirá al instalar el backend en el mini PC.'}
            </span>
          </div>
        </div>

        <FormField label="Correo electrónico">
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="nombre@empresa.com" required />
        </FormField>
        <FormField label="Contraseña">
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required />
        </FormField>
        {message && <p className="error-text" role="alert">{message}</p>}
        <div className="login-actions">
          <button className="primary-button" type="submit">Entrar en IsiVoltPro</button>
          <button className="ghost-button" type="button" onClick={handleReset}>Recuperar contraseña</button>
          <Link className="ghost-button" to="/registro">Tengo una invitación</Link>
        </div>
      </form>
    </section>
  );
}
