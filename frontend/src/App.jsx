import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { 
  RefreshCw, TrendingUp, TrendingDown, Minus, Facebook, Twitter, Instagram, 
  ShieldCheck, Activity, MessageSquare, Globe, MapPin, Lock, Unlock, 
  UserCheck, Send, CheckCircle2, XCircle, ArrowLeftRight, Search, X
} from 'lucide-react';
import './index.css';
import {
  INITIAL_USUARIOS,
  INITIAL_CHAT,
  getCloudPoliticos,
  saveCloudPoliticos,
  generateCloudMetricas,
  generateCloudDebates,
  generateCloudMenciones
} from './cloudData';

const API_URL = (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
  ? '/api-proxy'
  : (import.meta.env.VITE_API_URL || 'http://localhost:8010');

function App() {
  // Ámbito: 'tdf' o 'nacional'
  const [ambito, setAmbito] = useState('tdf');
  const [busqueda, setBusqueda] = useState('');

  // Autenticación / Perfiles (Por defecto SIEMPRE inicia como Visualizador al compartir el link)
  const [currentUser, setCurrentUser] = useState(() => {
    localStorage.removeItem('tdf_user_profile'); // Limpiar sesión previa que abría como admin por defecto
    const saved = localStorage.getItem('tdf_user_session_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.rol === 'admin' && parsed.authenticated === true) {
          return parsed;
        }
        if (parsed && parsed.rol === 'visualizador') {
          return parsed;
        }
      } catch (e) {}
    }
    return {
      username: 'invitado',
      nombre_mostrar: 'Compañero Visualizador',
      rol: 'visualizador'
    };
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loginUsername, setLoginUsername] = useState('equipo');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [usuariosList, setUsuariosList] = useState([]);
  const [nuevoUserNombre, setNuevoUserNombre] = useState('');
  const [nuevoUserLogin, setNuevoUserLogin] = useState('');
  const [nuevoUserPass, setNuevoUserPass] = useState('');
  const [userCreateMsg, setUserCreateMsg] = useState('');

  // Datos principales
  const [politicos, setPoliticos] = useState([]);
  const [selectedPolitico, setSelectedPolitico] = useState(null);
  const [metricas, setMetricas] = useState([]);
  const [mencionesRandom, setMencionesRandom] = useState([]);
  const [debates, setDebates] = useState([]);
  const [selectedDebate, setSelectedDebate] = useState(null);
  const [loadingDebates, setLoadingDebates] = useState(false);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [scrappearUnoId, setScrappearUnoId] = useState(null);
  const [loadingMenciones, setLoadingMenciones] = useState(false);

  // Modal Swap Directo (Solo Admin)
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [newNombre, setNewNombre] = useState('');
  const [newCargo, setNewCargo] = useState('');
  const [swapping, setSwapping] = useState(false);
  const [swapError, setSwapError] = useState('');

  // Panel Lateral: Solicitudes de Directorio & Chat Interno
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerTab, setDrawerTab] = useState('solicitudes'); // 'solicitudes' | 'chat'
  const [solicitudes, setSolicitudes] = useState([]);
  const [mensajesChat, setMensajesChat] = useState([]);
  const [nuevoMensajeChat, setNuevoMensajeChat] = useState('');
  
  // Formulario de Nueva Solicitud de Cambio
  const [solOldPoliticoId, setSolOldPoliticoId] = useState('');
  const [solNewNombre, setSolNewNombre] = useState('');
  const [solNewCargo, setSolNewCargo] = useState('');
  const [solMotivo, setSolMotivo] = useState('');
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);
  const [solFeedback, setSolFeedback] = useState('');
  const [notasAdmin, setNotasAdmin] = useState({});
  const [resolviendoId, setResolviendoId] = useState(null);

  const isAdmin = currentUser?.rol === 'admin';

  useEffect(() => {
    localStorage.setItem('tdf_user_session_v2', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    fetchPoliticos(ambito);
    fetchSolicitudes();
    fetchChat();
    fetchUsuarios();
  }, [ambito]);

  useEffect(() => {
    if (selectedPolitico) {
      fetchMetricas(selectedPolitico.id, selectedPolitico);
      fetchMencionesRandom(selectedPolitico.id, selectedPolitico);
      fetchDebates(selectedPolitico.id, selectedPolitico);
      setSolOldPoliticoId(selectedPolitico.id);
    } else {
      setMetricas([]);
      setMencionesRandom([]);
      setDebates([]);
      setSelectedDebate(null);
    }
  }, [selectedPolitico]);

  const fetchPoliticos = async (ambitoActual = ambito) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/politicos`, {
        params: { ambito: ambitoActual }
      });
      if (!Array.isArray(response.data)) throw new Error("Cloudflare static fallback");
      setPoliticos(response.data);
      if (response.data.length > 0) {
        setSelectedPolitico(response.data[0]);
        setSolOldPoliticoId(response.data[0].id);
      } else {
        setSelectedPolitico(null);
      }
    } catch (error) {
      const fallbackList = getCloudPoliticos(ambitoActual);
      setPoliticos(fallbackList);
      if (fallbackList.length > 0) {
        setSelectedPolitico(fallbackList[0]);
        setSolOldPoliticoId(fallbackList[0].id);
      } else {
        setSelectedPolitico(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSolicitudes = async () => {
    try {
      const response = await axios.get(`${API_URL}/solicitudes`);
      if (!Array.isArray(response.data)) throw new Error("Cloudflare static fallback");
      setSolicitudes(response.data);
    } catch (error) {
      const saved = localStorage.getItem("cloud_solicitudes_v2");
      setSolicitudes(saved ? JSON.parse(saved) : []);
    }
  };

  const fetchChat = async () => {
    try {
      const response = await axios.get(`${API_URL}/chat`);
      if (!Array.isArray(response.data)) throw new Error("Cloudflare static fallback");
      setMensajesChat(response.data);
    } catch (error) {
      const saved = localStorage.getItem("cloud_chat_v2");
      setMensajesChat(saved ? JSON.parse(saved) : INITIAL_CHAT);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await axios.get(`${API_URL}/usuarios`);
      if (!Array.isArray(response.data)) throw new Error("Cloudflare static fallback");
      setUsuariosList(response.data);
    } catch (error) {
      const saved = localStorage.getItem("cloud_usuarios_v2");
      setUsuariosList(saved ? JSON.parse(saved) : INITIAL_USUARIOS);
    }
  };

  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    setUserCreateMsg('');
    if (!nuevoUserNombre.trim() || !nuevoUserLogin.trim() || !nuevoUserPass.trim()) {
      setUserCreateMsg('Completa nombre, usuario y contraseña.');
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/usuarios`, {
        username: nuevoUserLogin.trim(),
        nombre_mostrar: nuevoUserNombre.trim(),
        password: nuevoUserPass.trim(),
        rol: 'visualizador'
      });
      if (!res.data || typeof res.data !== 'object' || !res.data.username) throw new Error("Fallback");
      setUserCreateMsg(`✅ Credencial creada: usuario "${nuevoUserLogin.trim().toLowerCase()}"`);
      setNuevoUserNombre('');
      setNuevoUserLogin('');
      setNuevoUserPass('');
      await fetchUsuarios();
    } catch (error) {
      const current = usuariosList.length ? [...usuariosList] : [...INITIAL_USUARIOS];
      const uname = nuevoUserLogin.trim().toLowerCase();
      if (current.some(u => u.username === uname)) {
        setUserCreateMsg('Ese nombre de usuario ya existe.');
        return;
      }
      const nuevo = {
        id: Date.now(),
        username: uname,
        nombre_mostrar: nuevoUserNombre.trim(),
        password: nuevoUserPass.trim(),
        rol: 'visualizador'
      };
      const updated = [...current, nuevo];
      localStorage.setItem("cloud_usuarios_v2", JSON.stringify(updated));
      setUsuariosList(updated);
      setUserCreateMsg(`✅ Credencial creada: usuario "${uname}"`);
      setNuevoUserNombre('');
      setNuevoUserLogin('');
      setNuevoUserPass('');
    }
  };

  const fetchMetricas = async (id, polObj = selectedPolitico) => {
    try {
      const response = await axios.get(`${API_URL}/politicos/${id}/metricas`);
      if (!Array.isArray(response.data) || response.data.length === 0) throw new Error("Cloudflare static fallback");

      const quarterMap = {};
      response.data.forEach(m => {
        const date = new Date(m.fecha);
        const year = date.getFullYear();
        const quarter = Math.ceil((date.getMonth() + 1) / 3);
        const key = `${year}-Q${quarter}`;
        if (!quarterMap[key]) {
          quarterMap[key] = { positiva: [], neutra: [], negativa: [], year, quarter, fuente: m.fuente };
        }
        quarterMap[key].positiva.push(parseFloat(m.imagen_positiva));
        quarterMap[key].neutra.push(parseFloat(m.imagen_neutra));
        quarterMap[key].negativa.push(parseFloat(m.imagen_negativa));
      });

      const avg = arr => arr.length ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 0;
      const quarterNames = ['', 'Ene-Mar', 'Abr-Jun', 'Jul-Sep', 'Oct-Dic'];

      const formattedData = Object.keys(quarterMap)
        .sort()
        .map(key => {
          const q = quarterMap[key];
          return {
            fecha_corta: `${quarterNames[q.quarter]} ${q.year}`,
            positiva: avg(q.positiva),
            neutra: avg(q.neutra),
            negativa: avg(q.negativa),
            fuente: q.fuente
          };
        });

      setMetricas(formattedData);
    } catch (error) {
      if (polObj) setMetricas(generateCloudMetricas(polObj));
    }
  };

  const fetchMencionesRandom = async (id, polObj = selectedPolitico) => {
    setLoadingMenciones(true);
    try {
      const response = await axios.get(`${API_URL}/politicos/${id}/menciones/random?limit=4`);
      if (!Array.isArray(response.data) || response.data.length === 0) throw new Error("Cloudflare static fallback");
      setMencionesRandom(response.data);
    } catch (error) {
      if (polObj) setMencionesRandom(generateCloudMenciones(polObj));
    } finally {
      setLoadingMenciones(false);
    }
  };

  const fetchDebates = async (id, polObj = selectedPolitico) => {
    setLoadingDebates(true);
    try {
      const response = await axios.get(`${API_URL}/politicos/${id}/debates`);
      if (!Array.isArray(response.data) || response.data.length === 0) throw new Error("Cloudflare static fallback");
      setDebates(response.data);
      setSelectedDebate(response.data[0]);
    } catch (error) {
      if (polObj) {
        const d = generateCloudDebates(polObj);
        setDebates(d);
        setSelectedDebate(d[0] || null);
      }
    } finally {
      setLoadingDebates(false);
    }
  };

  const handleSimular = async () => {
    if (!isAdmin) return;
    setSimulating(true);
    try {
      await axios.post(`${API_URL}/simular`, null, { params: { ambito } });
      if (selectedPolitico) {
        await fetchMetricas(selectedPolitico.id, selectedPolitico);
        await fetchDebates(selectedPolitico.id, selectedPolitico);
      }
    } catch (error) {
      if (selectedPolitico) {
        setMetricas(generateCloudMetricas(selectedPolitico));
        setDebates(generateCloudDebates(selectedPolitico));
      }
    } finally {
      setSimulating(false);
    }
  };

  const handleScrappearUno = async (id) => {
    if (!isAdmin) return;
    setScrappearUnoId(id);
    try {
      await axios.post(`${API_URL}/politicos/${id}/scrappear`);
      await fetchMetricas(id, selectedPolitico);
      await fetchMencionesRandom(id, selectedPolitico);
      await fetchDebates(id, selectedPolitico);
    } catch (error) {
      if (selectedPolitico) {
        setMetricas(generateCloudMetricas(selectedPolitico));
        setMencionesRandom(generateCloudMenciones(selectedPolitico));
        setDebates(generateCloudDebates(selectedPolitico));
      }
    } finally {
      setScrappearUnoId(null);
    }
  };

  const handleSwap = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!newNombre.trim() || !newCargo.trim()) {
      setSwapError("Por favor completa todos los campos.");
      return;
    }
    setSwapping(true);
    setSwapError("");
    try {
      const response = await axios.post(`${API_URL}/politicos/swap`, {
        old_id: selectedPolitico.id,
        new_nombre: newNombre.trim(),
        new_cargo: newCargo.trim()
      });
      if (response.data && response.data.status === "success") {
        await fetchPoliticos(ambito);
        const nuevo = response.data.new_politico;
        setSelectedPolitico(nuevo);
        setShowSwapModal(false);
      } else {
        throw new Error("Fallback swap");
      }
    } catch (error) {
      const all = getCloudPoliticos();
      const newId = newNombre.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const nuevoPol = {
        id: newId || `pol_${Date.now()}`,
        nombre: newNombre.trim(),
        cargo: newCargo.trim(),
        categoria: selectedPolitico.categoria || "Primera línea",
        ambito: ambito
      };
      const updated = all.map(p => p.id === selectedPolitico.id ? nuevoPol : p);
      saveCloudPoliticos(updated);
      setPoliticos(updated.filter(p => p.ambito === ambito));
      setSelectedPolitico(nuevoPol);
      setShowSwapModal(false);
    } finally {
      setSwapping(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!loginPassword.trim()) {
      setLoginError('Por favor ingresa la contraseña de acceso.');
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username: loginUsername,
        password: loginPassword
      });
      if (!response.data || !response.data.username) throw new Error("Fallback login");
      setCurrentUser({ ...response.data, authenticated: true });
      setShowAuthModal(false);
      setLoginPassword('');
    } catch (error) {
      const list = usuariosList.length ? usuariosList : INITIAL_USUARIOS;
      const found = list.find(u => u.username === loginUsername.trim().toLowerCase());
      if (!found || !loginPassword || found.password !== loginPassword) {
        setLoginError('Usuario o contraseña incorrectos.');
        return;
      }
      setCurrentUser({ ...found, authenticated: true });
      setShowAuthModal(false);
      setLoginPassword('');
    }
  };

  const handleCrearSolicitud = async (e) => {
    e.preventDefault();
    if (!solOldPoliticoId || !solNewNombre.trim() || !solNewCargo.trim() || !solMotivo.trim()) {
      setSolFeedback('Completa todos los campos de la solicitud.');
      return;
    }
    setEnviandoSolicitud(true);
    setSolFeedback('');
    try {
      const res = await axios.post(`${API_URL}/solicitudes`, {
        autor_nombre: currentUser.nombre_mostrar,
        autor_rol: currentUser.rol,
        ambito: ambito,
        old_politico_id: solOldPoliticoId,
        new_politico_nombre: solNewNombre.trim(),
        new_politico_cargo: solNewCargo.trim(),
        motivo: solMotivo.trim()
      });
      if (!res.data || !res.data.id) throw new Error("Fallback solicitud");
      setSolNewNombre('');
      setSolNewCargo('');
      setSolMotivo('');
      setSolFeedback('✅ Solicitud enviada al Administrador y publicada en el chat interno.');
      await fetchSolicitudes();
      await fetchChat();
    } catch (error) {
      const oldPol = politicos.find(p => p.id === solOldPoliticoId) || selectedPolitico;
      const ahora = new Date().toLocaleString('es-AR', { hour12: false });
      const nuevaSol = {
        id: Date.now(),
        autor_nombre: currentUser.nombre_mostrar,
        autor_rol: currentUser.rol,
        ambito,
        old_politico_id: oldPol.id,
        old_politico_nombre: oldPol.nombre,
        new_politico_nombre: solNewNombre.trim(),
        new_politico_cargo: solNewCargo.trim(),
        motivo: solMotivo.trim(),
        estado: 'pendiente',
        fecha_creacion: ahora
      };
      const nextSols = [nuevaSol, ...solicitudes];
      localStorage.setItem("cloud_solicitudes_v2", JSON.stringify(nextSols));
      setSolicitudes(nextSols);

      const nextChat = [...mensajesChat, {
        id: Date.now() + 1,
        autor_nombre: currentUser.nombre_mostrar,
        autor_rol: currentUser.rol,
        ambito,
        texto: `📋 [Solicitud] Solicito agregar a ${nuevaSol.new_politico_nombre} (${nuevaSol.new_politico_cargo}) en reemplazo de ${oldPol.nombre}. Motivo: ${nuevaSol.motivo}`,
        fecha_hora: ahora
      }];
      localStorage.setItem("cloud_chat_v2", JSON.stringify(nextChat));
      setMensajesChat(nextChat);
      setSolNewNombre('');
      setSolNewCargo('');
      setSolMotivo('');
      setSolFeedback('✅ Solicitud enviada al Administrador y publicada en el chat interno.');
    } finally {
      setEnviandoSolicitud(false);
    }
  };

  const handleResolverSolicitud = async (solicitudId, accion) => {
    if (!isAdmin) return;
    setResolviendoId(solicitudId);
    const nota = notasAdmin[solicitudId] || '';
    try {
      const response = await axios.post(`${API_URL}/solicitudes/${solicitudId}/resolver`, {
        accion,
        nota_admin: nota,
        admin_nombre: currentUser.nombre_mostrar
      });
      if (!response.data || !response.data.status) throw new Error("Fallback resolver");
      await fetchSolicitudes();
      await fetchChat();
      if (accion === 'aprobar') {
        await fetchPoliticos(ambito);
        if (response.data.new_politico && response.data.new_politico.ambito === ambito) {
          setSelectedPolitico(response.data.new_politico);
        }
      }
    } catch (error) {
      const sol = solicitudes.find(s => s.id === solicitudId);
      if (sol) {
        const nuevoEstado = accion === 'aprobar' ? 'aprobada' : 'rechazada';
        const nextSols = solicitudes.map(s => s.id === solicitudId ? { ...s, estado: nuevoEstado, nota_admin: nota || (accion === 'aprobar' ? 'Aprobado y ejecutado.' : 'Rechazado.') } : s);
        localStorage.setItem("cloud_solicitudes_v2", JSON.stringify(nextSols));
        setSolicitudes(nextSols);
        if (accion === 'aprobar') {
          const all = getCloudPoliticos();
          const newId = sol.new_politico_nombre.toLowerCase().replace(/[^a-z0-9]/g, '') || `pol_${Date.now()}`;
          const nuevoPol = {
            id: newId,
            nombre: sol.new_politico_nombre,
            cargo: sol.new_politico_cargo,
            categoria: "Primera línea",
            ambito: sol.ambito
          };
          const updated = all.map(p => p.id === sol.old_politico_id ? nuevoPol : p);
          saveCloudPoliticos(updated);
          setPoliticos(updated.filter(p => p.ambito === ambito));
          setSelectedPolitico(nuevoPol);
        }
      }
    } finally {
      setResolviendoId(null);
    }
  };

  const handleEnviarMensajeChat = async (e) => {
    e.preventDefault();
    if (!nuevoMensajeChat.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/chat`, {
        autor_nombre: currentUser.nombre_mostrar,
        autor_rol: currentUser.rol,
        ambito: ambito,
        texto: nuevoMensajeChat.trim()
      });
      if (!res.data || !res.data.id) throw new Error("Fallback chat");
      setNuevoMensajeChat('');
      await fetchChat();
    } catch (error) {
      const ahora = new Date().toLocaleString('es-AR', { hour12: false });
      const nextChat = [...mensajesChat, {
        id: Date.now(),
        autor_nombre: currentUser.nombre_mostrar,
        autor_rol: currentUser.rol,
        ambito,
        texto: nuevoMensajeChat.trim(),
        fecha_hora: ahora
      }];
      localStorage.setItem("cloud_chat_v2", JSON.stringify(nextChat));
      setMensajesChat(nextChat);
      setNuevoMensajeChat('');
    }
  };

  const abrirSolicitudParaPolitico = (pol) => {
    if (pol) {
      setSolOldPoliticoId(pol.id);
    }
    setDrawerTab('solicitudes');
    setShowDrawer(true);
  };

  const politicosFiltrados = politicos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.cargo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const pendientesCount = solicitudes.filter(s => s.estado === 'pendiente').length;
  const latestMetrica = metricas.length > 0 ? metricas[metricas.length - 1] : null;

  if (loading && politicos.length === 0) {
    return (
      <div className="loader">
        <Activity size={48} className="spin" style={{ color: 'var(--primary-accent)', marginBottom: '1rem' }} />
        <div style={{ letterSpacing: '0.2em', fontWeight: 600 }}>AUDITANDO INTELIGENCIA POLÍTICA...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* BARRA SUPERIOR DE ÁMBITO Y PERFIL DE USUARIO */}
      <div className="top-nav-bar">
        <div className="scope-selector" role="tablist" aria-label="Selector de Ámbito Territorial">
          <button
            type="button"
            className={`scope-tab ${ambito === 'tdf' ? 'active' : ''}`}
            onClick={() => { setBusqueda(''); setAmbito('tdf'); }}
          >
            <MapPin size={16} />
            <span>Ámbito Tierra del Fuego</span>
            <span className="scope-pill">Provincial</span>
          </button>
          <button
            type="button"
            className={`scope-tab ${ambito === 'nacional' ? 'active' : ''}`}
            onClick={() => { setBusqueda(''); setAmbito('nacional'); }}
          >
            <Globe size={16} />
            <span>Ámbito Nacional</span>
            <span className="scope-pill national">Elecciones 2027</span>
          </button>
        </div>

        <div className="user-controls-bar">
          <button
            type="button"
            className="btn-requests-drawer"
            onClick={() => {
              fetchSolicitudes();
              fetchChat();
              setShowDrawer(true);
            }}
          >
            <MessageSquare size={16} />
            <span>Solicitudes de Directorio & Chat</span>
            {pendientesCount > 0 && (
              <span className="pending-badge">{pendientesCount}</span>
            )}
          </button>

          <div className={`user-profile-chip ${isAdmin ? 'admin' : 'viewer'}`} onClick={() => setShowAuthModal(true)} title="Haz clic para cambiar entre perfil Administrador y Visualizador">
            {isAdmin ? <Unlock size={15} /> : <Lock size={15} />}
            <div className="user-chip-text">
              <span className="user-chip-name">{currentUser.nombre_mostrar}</span>
              <span className="user-chip-role">{isAdmin ? 'Administrador' : 'Visualizador'}</span>
            </div>
            <span className="switch-role-link">Cambiar</span>
          </div>
        </div>
      </div>

      <header>
        <div className="title-section">
          <h1>
            {ambito === 'tdf' ? 'Análisis Soberano TDF 2.0' : 'Monitor Electoral Nacional 2.0'}
          </h1>
          <p>
            {ambito === 'tdf'
              ? 'Motor de Inteligencia Artificial para Sentiment Analysis Provincial y Foros Fueguinos'
              : 'Evaluación Federal de Candidatos Nacionales — Infobae, La Nación, Clarín, Página/12, Ámbito y Redes'}
          </p>
        </div>
        <div className="controls-section">
          {isAdmin ? (
            <button 
              className="btn-primary" 
              onClick={handleSimular}
              disabled={simulating}
            >
              <RefreshCw size={18} className={simulating ? 'spin' : ''} />
              {simulating ? 'Escaneando medios...' : `Actualizar Inteligencia (${ambito === 'tdf' ? 'TDF' : 'Nacional'})`}
            </button>
          ) : (
            <div className="viewer-readonly-banner">
              <Lock size={15} />
              <span>Modo Visualizador — Usa <strong>Solicitudes de Directorio</strong> para proponer cambios</span>
            </div>
          )}
        </div>
      </header>

      <div className="dashboard-grid">
        <div className="card list-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="#0ea5e9" /> 
              {ambito === 'tdf' ? 'Directorio Político TDF' : 'Candidatos y Referentes Nacionales'}
            </h2>
            <span className="source-counter-badge">{politicosFiltrados.length}</span>
          </div>

          <div className="directory-search-box">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder={ambito === 'tdf' ? "Buscar referente o cargo en TDF..." : "Buscar candidato o alianza nacional..."}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="mobile-quick-select-wrapper">
            <label htmlFor="mobile-pol-select">Selección rápida en celular:</label>
            <select
              id="mobile-pol-select"
              className="mobile-politico-select"
              value={selectedPolitico?.id || ''}
              onChange={(e) => {
                const found = politicos.find(p => p.id === e.target.value);
                if (found) {
                  setSelectedPolitico(found);
                  setTimeout(() => {
                    document.getElementById('detalle-politico')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 80);
                }
              }}
            >
              {politicosFiltrados.map(pol => (
                <option key={pol.id} value={pol.id}>
                  {pol.nombre} — {pol.cargo}
                </option>
              ))}
            </select>
          </div>

          <div className="politicos-list">
            {politicosFiltrados.map((pol, idx) => (
              <div 
                key={pol.id} 
                className={`politico-item ${selectedPolitico?.id === pol.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedPolitico(pol);
                  if (typeof window !== 'undefined' && window.innerWidth <= 980) {
                    setTimeout(() => {
                      document.getElementById('detalle-politico')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 80);
                  }
                }}
                style={{ animationDelay: `${idx * 0.03}s` }}
              >
                <div className="politico-info">
                  <h3>{pol.nombre}</h3>
                  <p>{pol.cargo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div id="detalle-politico" className="card detail-card">
          {selectedPolitico ? (
            <div className="detail-view">
              <div className="detail-header" style={{ animation: 'slideIn 0.5s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-accent)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                  <ShieldCheck size={14} /> Perfil Auditado — {ambito === 'tdf' ? 'Jurisdicción Tierra del Fuego' : 'Escenario Electoral Nacional'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h2>{selectedPolitico.nombre}</h2>
                    <p>
                      {selectedPolitico.cargo} |{' '}
                      <span style={{color: 'var(--secondary-accent)', fontWeight: 600}}>
                        {ambito === 'tdf' ? 'Sector Fueguino' : 'Proyección Nacional'}
                      </span>
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {isAdmin ? (
                      <>
                        <button 
                          className="filter-btn" 
                          style={{ background: 'rgba(52, 211, 153, 0.1)', color: 'var(--primary-accent)', borderColor: 'rgba(52, 211, 153, 0.3)', margin: 0, display: 'flex', alignItems: 'center' }}
                          onClick={() => handleScrappearUno(selectedPolitico.id)}
                          disabled={scrappearUnoId === selectedPolitico.id}
                        >
                          <RefreshCw size={14} className={scrappearUnoId === selectedPolitico.id ? 'spin' : ''} style={{marginRight: '8px'}} />
                          {scrappearUnoId === selectedPolitico.id ? 'Refrescando...' : 'Actualizar Perfil'}
                        </button>
                        <button 
                          className="filter-btn" 
                          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}
                          onClick={() => {
                            setNewNombre('');
                            setNewCargo('');
                            setSwapError('');
                            setShowSwapModal(true);
                          }}
                        >
                          <ArrowLeftRight size={14} />
                          Reemplazar Figura
                        </button>
                      </>
                    ) : (
                      <button
                        className="filter-btn"
                        style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c4b5fd', borderColor: 'rgba(139, 92, 246, 0.4)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}
                        onClick={() => abrirSolicitudParaPolitico(selectedPolitico)}
                      >
                        <ArrowLeftRight size={14} />
                        Solicitar Cambio de esta Figura
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="social-sync">
                  <div className={`social-badge ${simulating ? 'active' : ''}`}><Facebook size={12} /> FB Link</div>
                  <div className={`social-badge ${simulating ? 'active' : ''}`}><Twitter size={12} /> X Feed</div>
                  <div className={`social-badge ${simulating ? 'active' : ''}`}><Instagram size={12} /> IG Tags</div>
                  <div className="social-badge" style={{ color: 'var(--primary-accent)', borderColor: 'rgba(52, 211, 153, 0.25)' }}>
                    {ambito === 'tdf' ? '📰 El Sureño / EDFM / Sur54' : '📰 Infobae / LN / Clarín / P12 / Ámbito'}
                  </div>
                </div>
              </div>

              {latestMetrica ? (
                <>
                  <div className="kpi-row">
                    <div className="kpi-card pos" style={{ animationDelay: '0.1s' }}>
                      <TrendingUp size={24} color="var(--color-positive)" />
                      <div className="kpi-value">{latestMetrica?.positiva || 0}%</div>
                      <div className="kpi-label">Afinidad Positiva</div>
                    </div>
                    <div className="kpi-card neu" style={{ animationDelay: '0.2s' }}>
                      <Minus size={24} color="var(--color-neutral)" />
                      <div className="kpi-value">{latestMetrica?.neutra || 0}%</div>
                      <div className="kpi-label"> Neutral / Expectativa</div>
                    </div>
                    <div className="kpi-card neg" style={{ animationDelay: '0.3s' }}>
                      <TrendingDown size={24} color="var(--color-negative)" />
                      <div className="kpi-value">{latestMetrica?.negativa || 0}%</div>
                      <div className="kpi-label">Rechazo / Negativo</div>
                    </div>
                  </div>

                  <div className="chart-container" style={{ animation: 'slideIn 0.8s ease-out' }}>
                    <h3 style={{fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1.5rem', fontWeight: 500}}>
                      Trazabilidad Temporal de Opinión Pública ({ambito === 'tdf' ? 'Medios y Redes TDF' : 'Medios Nacionales y Redes'})
                    </h3>
                    <ResponsiveContainer width="100%" height={380}>
                      <AreaChart data={metricas} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#34d399" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis 
                          dataKey="fecha_corta" 
                          stroke="#475569" 
                          tick={{fill: '#94a3b8', fontSize: 10}}
                          minTickGap={30}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          domain={[0, 100]} 
                          stroke="#475569" 
                          tick={{fill: '#94a3b8', fontSize: 10}}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)'}}
                          itemStyle={{fontWeight: 600}}
                        />
                        <Area type="monotone" dataKey="positiva" name="Positiva" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorPos)" dot={false} />
                        <Area type="monotone" dataKey="negativa" name="Negativa" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorNeg)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', alignItems: 'center', flexWrap: 'wrap', gap: '8px'}}>
                      <p style={{fontSize: '11px', color: '#475569'}}>Firma: TDF & Nacional Politicos v2.0 — Motor Multifuente</p>
                      <p style={{fontSize: '11px', color: '#64748b', fontWeight: 600, maxWidth: '65%', textAlign: 'right'}}>
                        📡 {latestMetrica?.fuente || 'Sin datos de fuente'}
                      </p>
                    </div>
                  </div>

                  {/* SECCIÓN DE DEBATES Y COMENTARIOS */}
                  <div className="debates-section" style={{ animation: 'slideIn 0.9s ease-out', marginTop: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                      <h3 style={{fontSize: '1rem', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <MessageSquare size={18} color="var(--primary-accent)" /> 
                        {ambito === 'tdf'
                          ? 'Debates y Comentarios en Foros Provinciales (TDF)'
                          : 'Debates y Comentarios en Portales y Foros Nacionales'}
                      </h3>
                      <span className="source-counter-badge">{debates.length} Hilos Activos</span>
                    </div>

                    {debates.length > 0 ? (
                      <div className="debates-grid">
                        <div className="debates-list">
                          {debates.map((d) => (
                            <div 
                              key={d.id} 
                              className={`debate-thread-item ${selectedDebate?.id === d.id ? 'active' : ''}`}
                              onClick={() => setSelectedDebate(d)}
                            >
                              <div className="thread-header">
                                <span className="thread-source">{d.fuente}</span>
                                <span className="thread-date">{new Date(d.fecha).toLocaleDateString('es-AR')}</span>
                              </div>
                              <h4 className="thread-title">{d.titulo}</h4>
                              <p className="thread-snippet">{d.contenido?.substring(0, 100)}...</p>
                            </div>
                          ))}
                        </div>

                        <div className="debate-comments-box">
                          {selectedDebate ? (
                            <>
                              <div className="selected-thread-details">
                                <span className="thread-tag-link">{selectedDebate.fuente}</span>
                                <h4 style={{margin: '8px 0 6px 0', fontSize: '1.05rem', color: 'var(--primary-accent)'}}>{selectedDebate.titulo}</h4>
                                <p style={{margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-muted)'}}>{selectedDebate.contenido}</p>
                                
                                <div className="debate-sentiment-ratio">
                                  <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Sentimiento de la Comunidad:</span>
                                  <div className="ratio-bar">
                                    {(() => {
                                      const totalComments = selectedDebate.comentarios.length;
                                      if (totalComments === 0) return <div className="ratio-segment neutral" style={{width: '100%'}}>Sin comentarios</div>;
                                      const pos = selectedDebate.comentarios.filter(c => c.sentimiento === 'pos').length;
                                      const neg = selectedDebate.comentarios.filter(c => c.sentimiento === 'neg').length;
                                      const neu = selectedDebate.comentarios.filter(c => c.sentimiento === 'neu').length;
                                      const posPct = (pos / totalComments) * 100;
                                      const negPct = (neg / totalComments) * 100;
                                      const neuPct = (neu / totalComments) * 100;
                                      return (
                                        <>
                                          {posPct > 0 && <div className="ratio-segment positive" style={{width: `${posPct}%`}} title={`Positivos: ${pos}`}></div>}
                                          {neuPct > 0 && <div className="ratio-segment neutral" style={{width: `${neuPct}%`}} title={`Neutros: ${neu}`}></div>}
                                          {negPct > 0 && <div className="ratio-segment negative" style={{width: `${negPct}%`}} title={`Negativos: ${neg}`}></div>}
                                        </>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>

                              <div className="comments-list">
                                {selectedDebate.comentarios.map((c) => (
                                  <div key={c.id} className="comment-item">
                                    <div className="comment-header">
                                      <div className="user-avatar">{c.usuario.replace('@', '').charAt(0).toUpperCase()}</div>
                                      <span className="comment-user">{c.usuario}</span>
                                      <span className={`comment-sentiment-badge ${c.sentimiento}`}>
                                        {c.sentimiento === 'pos' ? 'positivo' : c.sentimiento === 'neg' ? 'negativo' : 'neutro'}
                                      </span>
                                    </div>
                                    <p className="comment-text">"{c.texto}"</p>
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <div className="empty-comments-state">
                              Selecciona un hilo de debate a la izquierda para ver los comentarios.
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="empty-debates-card">
                        No se registran foros ni discusiones procesadas para esta figura.
                      </div>
                    )}
                  </div>

                  <div className="mentions-audit" style={{ animation: 'slideIn 1.1s ease-out', marginTop: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{fontSize: '1rem', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <Activity size={18} color="var(--primary-accent)" /> Auditoría de Voz Popular (Random Insights)
                      </h3>
                      <button 
                        className="filter-btn" 
                        style={{ fontSize: '0.75rem', padding: '0.4rem 1rem' }}
                        onClick={() => fetchMencionesRandom(selectedPolitico.id)}
                        disabled={loadingMenciones}
                      >
                        <RefreshCw size={12} className={loadingMenciones ? 'spin' : ''} style={{marginRight: '6px'}} />
                        Rotar Muestra
                      </button>
                    </div>
                    
                    <div className="mentions-grid">
                      {mencionesRandom.length > 0 ? (
                        mencionesRandom.map((m, idx) => (
                          <div key={m.id || idx} className="mention-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                            <div className="mention-meta">
                              <span className={`sentimiento-tag ${m.sentimiento}`}>{m.sentimiento}</span>
                              <span className="source-tag">{m.fuente}</span>
                            </div>
                            <p className="mention-text">"{m.texto.length > 180 ? m.texto.substring(0, 180) + '...' : m.texto}"</p>
                          </div>
                        ))
                      ) : (
                        <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', gridColumn: '1/-1', padding: '2rem'}}>
                          No hay fragmentos de texto procesados recientemente para este perfil.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <p>Cargando métricas del perfil...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <ShieldCheck size={64} color="var(--primary-accent)" style={{marginBottom: '20px', opacity: 0.3}} />
              <div style={{fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '10px'}}>
                Monitor de Sentimiento en Tiempo Real
              </div>
              <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>
                Selecciona una figura política del directorio para iniciar el análisis profundo.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* BOTÓN FLOTANTE DE ACCESO RÁPIDO A SOLICITUDES Y CHAT */}
      <button
        type="button"
        className="floating-chat-btn"
        onClick={() => {
          fetchSolicitudes();
          fetchChat();
          setShowDrawer(true);
        }}
      >
        <MessageSquare size={20} />
        <span>Solicitudes & Chat</span>
        {pendientesCount > 0 && (
          <span className="floating-badge">{pendientesCount}</span>
        )}
      </button>

      {/* PANEL LATERAL (DRAWER): SOLICITUDES DE DIRECTORIO & CHAT INTERNO */}
      {showDrawer && (
        <div className="drawer-overlay" onClick={() => setShowDrawer(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <h3>Solicitudes de Directorio & Chat</h3>
                <p>Canal colaborativo entre Visualizadores y Administración</p>
              </div>
              <button type="button" className="icon-close-btn" onClick={() => setShowDrawer(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="drawer-tabs">
              <button
                type="button"
                className={`drawer-tab-btn ${drawerTab === 'solicitudes' ? 'active' : ''}`}
                onClick={() => setDrawerTab('solicitudes')}
              >
                📋 Solicitudes de Cambio ({pendientesCount} pend.)
              </button>
              <button
                type="button"
                className={`drawer-tab-btn ${drawerTab === 'chat' ? 'active' : ''}`}
                onClick={() => setDrawerTab('chat')}
              >
                💬 Chat Interno ({mensajesChat.length})
              </button>
            </div>

            {drawerTab === 'solicitudes' ? (
              <div className="drawer-body">
                <form className="request-form-card" onSubmit={handleCrearSolicitud}>
                  <h4>Proponer Cambio de Figura en Panel ({ambito === 'tdf' ? 'Tierra del Fuego' : 'Nacional'})</h4>
                  <div className="form-group compact">
                    <label>Figura Actual a Reemplazar</label>
                    <select
                      value={solOldPoliticoId}
                      onChange={(e) => setSolOldPoliticoId(e.target.value)}
                      required
                    >
                      {politicos.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre} ({p.cargo})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-row-2">
                    <div className="form-group compact">
                      <label>Nueva Persona a Evaluar</label>
                      <input
                        type="text"
                        placeholder="Ej. Juan Pérez"
                        value={solNewNombre}
                        onChange={(e) => setSolNewNombre(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group compact">
                      <label>Cargo / Alianza</label>
                      <input
                        type="text"
                        placeholder="Ej. Candidato Senador / Intendente"
                        value={solNewCargo}
                        onChange={(e) => setSolNewCargo(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group compact">
                    <label>Motivo de la Solicitud</label>
                    <textarea
                      rows={2}
                      placeholder="Ej. Solicito agregar a esta figura en reemplazo del referente actual para medir su impacto electoral..."
                      value={solMotivo}
                      onChange={(e) => setSolMotivo(e.target.value)}
                      required
                    />
                  </div>
                  {solFeedback && <div className="request-feedback">{solFeedback}</div>}
                  <button type="submit" className="btn-primary full-width" disabled={enviandoSolicitud}>
                    <Send size={15} />
                    {enviandoSolicitud ? 'Enviando solicitud...' : 'Enviar Solicitud al Panel'}
                  </button>
                </form>

                <div className="requests-list-section">
                  <h4>Historial de Solicitudes</h4>
                  {solicitudes.length === 0 ? (
                    <div className="empty-requests">No hay solicitudes registradas todavía.</div>
                  ) : (
                    solicitudes.map(sol => (
                      <div key={sol.id} className={`request-item-card ${sol.estado}`}>
                        <div className="request-item-header">
                          <span className="request-author">
                            👤 {sol.autor_nombre} <small>({sol.autor_rol})</small>
                          </span>
                          <span className={`request-status-badge ${sol.estado}`}>
                            {sol.estado.toUpperCase()}
                          </span>
                        </div>
                        <div className="request-swap-summary">
                          <span>Sale: <strong>{sol.old_politico_nombre}</strong></span>
                          <span>→</span>
                          <span>Entra: <strong style={{color: 'var(--primary-accent)'}}>{sol.new_politico_nombre}</strong> ({sol.new_politico_cargo})</span>
                        </div>
                        <p className="request-motivo">"{sol.motivo}"</p>
                        <div className="request-meta-footer">
                          <span>Ámbito: {sol.ambito === 'nacional' ? '🇦🇷 Nacional' : '🏔️ TDF'}</span>
                          <span>{sol.fecha_creacion}</span>
                        </div>

                        {sol.nota_admin && (
                          <div className="admin-resolution-note">
                            <strong>Nota Admin:</strong> {sol.nota_admin}
                          </div>
                        )}

                        {isAdmin && sol.estado === 'pendiente' && (
                          <div className="admin-approval-box">
                            <input
                              type="text"
                              placeholder="Nota opcional de aprobación o rechazo..."
                              value={notasAdmin[sol.id] || ''}
                              onChange={(e) => setNotasAdmin({ ...notasAdmin, [sol.id]: e.target.value })}
                            />
                            <div className="admin-approval-buttons">
                              <button
                                type="button"
                                className="btn-approve"
                                disabled={resolviendoId === sol.id}
                                onClick={() => handleResolverSolicitud(sol.id, 'aprobar')}
                              >
                                <CheckCircle2 size={15} />
                                {resolviendoId === sol.id ? 'Ejecutando...' : 'Aprobar y Ejecutar Swap'}
                              </button>
                              <button
                                type="button"
                                className="btn-reject"
                                disabled={resolviendoId === sol.id}
                                onClick={() => handleResolverSolicitud(sol.id, 'rechazar')}
                              >
                                <XCircle size={15} />
                                Rechazar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="drawer-body chat-mode">
                <div className="internal-chat-messages">
                  {mensajesChat.map(msg => (
                    <div key={msg.id} className={`chat-bubble ${msg.autor_rol === 'admin' ? 'admin-msg' : 'viewer-msg'}`}>
                      <div className="chat-bubble-header">
                        <strong>{msg.autor_nombre}</strong>
                        <span className={`role-mini-tag ${msg.autor_rol}`}>
                          {msg.autor_rol === 'admin' ? 'Admin' : 'Visualizador'}
                        </span>
                        <span className="chat-time">{msg.fecha_hora}</span>
                      </div>
                      <p>{msg.texto}</p>
                    </div>
                  ))}
                </div>
                <form className="chat-input-bar" onSubmit={handleEnviarMensajeChat}>
                  <input
                    type="text"
                    placeholder={`Escribir en el chat como ${currentUser.nombre_mostrar}...`}
                    value={nuevoMensajeChat}
                    onChange={(e) => setNuevoMensajeChat(e.target.value)}
                  />
                  <button type="submit" className="btn-send-chat">
                    <Send size={16} />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE PERFIL / AUTENTICACIÓN (ADMIN vs VISUALIZADOR) */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal-content auth-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Perfiles y Credenciales del Equipo</h3>
            <p>
              Por seguridad, el enlace compartido abre siempre en modo <strong>Visualizador</strong>. Para habilitar las funciones de <strong>Administrador</strong>, ingresa con tu usuario y contraseña.
            </p>

            <div className="quick-profiles-grid">
              {(usuariosList.length > 0 ? usuariosList : [
                { username: 'invitado', nombre_mostrar: 'Compañero Visualizador', rol: 'visualizador' },
                { username: 'equipo', nombre_mostrar: 'Analista Equipo TDF', rol: 'visualizador' },
                { username: 'admin', nombre_mostrar: 'Administrador General', rol: 'admin' }
              ]).map((u) => (
                <button
                  key={u.username}
                  type="button"
                  className={`profile-option-card ${currentUser.username === u.username ? 'selected' : ''}`}
                  onClick={() => {
                    if (u.rol === 'admin') {
                      setLoginUsername(u.username);
                      setLoginPassword('');
                      setLoginError('🔒 Ingresa tu contraseña de Administrador abajo para desbloquear el modo edición.');
                    } else {
                      setLoginError('');
                      setCurrentUser({ username: u.username, nombre_mostrar: u.nombre_mostrar, rol: 'visualizador' });
                      setShowAuthModal(false);
                    }
                  }}
                >
                  {u.rol === 'admin' ? <Lock size={20} color="#34d399" /> : <UserCheck size={20} color="#38bdf8" />}
                  <div>
                    <strong>{u.nombre_mostrar} <small style={{ opacity: 0.7 }}>({u.username})</small></strong>
                    <span>
                      {u.rol === 'admin'
                        ? 'Rol: Administrador (Requiere contraseña — Control total y aprobación de cambios)'
                        : 'Rol: Visualizador (Explora TDF/Nacional y envía solicitudes por chat)'}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {isAdmin && (
              <form onSubmit={handleCrearUsuario} style={{ marginTop: '1.25rem', background: 'rgba(52, 211, 153, 0.06)', border: '1px solid rgba(52, 211, 153, 0.25)', borderRadius: '14px', padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: 'var(--primary-accent)' }}>
                  ➕ Crear Credencial de Visualizador para Compañero
                </h4>
                <div className="form-group compact">
                  <label>Nombre y Apellido del Compañero</label>
                  <input
                    type="text"
                    placeholder="Ej. Laura Gómez"
                    value={nuevoUserNombre}
                    onChange={(e) => setNuevoUserNombre(e.target.value)}
                  />
                </div>
                <div className="form-row-2">
                  <div className="form-group compact">
                    <label>Usuario de Acceso</label>
                    <input
                      type="text"
                      placeholder="Ej. lgomez"
                      value={nuevoUserLogin}
                      onChange={(e) => setNuevoUserLogin(e.target.value)}
                    />
                  </div>
                  <div className="form-group compact">
                    <label>Contraseña Asignada</label>
                    <input
                      type="text"
                      placeholder="Ej. equipo2026"
                      value={nuevoUserPass}
                      onChange={(e) => setNuevoUserPass(e.target.value)}
                    />
                  </div>
                </div>
                {userCreateMsg && <div className="request-feedback" style={{ marginBottom: '0.6rem' }}>{userCreateMsg}</div>}
                <button type="submit" className="btn-primary full-width" style={{ padding: '0.6rem 1rem', fontSize: '0.8rem' }}>
                  Guardar Nueva Credencial
                </button>
              </form>
            )}

            <form onSubmit={handleLoginSubmit} style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.1rem' }}>
              {loginError && <div className="error-message">{loginError}</div>}
              <div className="form-row-2">
                <div className="form-group compact">
                  <label>Ingresar con Usuario</label>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                  />
                </div>
                <div className="form-group compact">
                  <label>Contraseña de Acceso</label>
                  <input
                    type="password"
                    placeholder="Ingresa tu contraseña..."
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: '0.8rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAuthModal(false)}>
                  Cerrar
                </button>
                <button type="submit" className="btn-primary">
                  Iniciar Sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE REEMPLAZO DIRECTO (SOLO ADMIN) */}
      {showSwapModal && isAdmin && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Intercambiar Referente ({ambito === 'tdf' ? 'TDF' : 'Nacional'})</h3>
            <p>
              Reemplaza directamente a <strong>{selectedPolitico?.nombre}</strong> en el directorio. Se mantendrá el cupo del panel y se calcularán los indicadores de la nueva figura.
            </p>
            {swapError && <div className="error-message">{swapError}</div>}
            <form onSubmit={handleSwap}>
              <div className="form-group">
                <label>Nombre de la Nueva Figura</label>
                <input
                  type="text"
                  placeholder="Ej. Pablo Silva"
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  disabled={swapping}
                  required
                />
              </div>
              <div className="form-group">
                <label>Cargo / Alianza</label>
                <input
                  type="text"
                  placeholder="Ej. Referente / Legislador / Candidato"
                  value={newCargo}
                  onChange={(e) => setNewCargo(e.target.value)}
                  disabled={swapping}
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowSwapModal(false)}
                  disabled={swapping}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-danger"
                  disabled={swapping}
                >
                  {swapping ? "Intercambiando..." : "Confirmar Reemplazo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
