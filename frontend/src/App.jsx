import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { RefreshCw, TrendingUp, TrendingDown, Minus, Facebook, Twitter, Instagram, ShieldCheck, Activity } from 'lucide-react';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8010';

function App() {
  const [politicos, setPoliticos] = useState([]);
  const [selectedPolitico, setSelectedPolitico] = useState(null);
  const [metricas, setMetricas] = useState([]);
  const [mencionesRandom, setMencionesRandom] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [scrappearUnoId, setScrappearUnoId] = useState(null);
  const [loadingMenciones, setLoadingMenciones] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [newNombre, setNewNombre] = useState('');
  const [newCargo, setNewCargo] = useState('');
  const [swapping, setSwapping] = useState(false);
  const [swapError, setSwapError] = useState('');


  useEffect(() => {
    fetchPoliticos();
  }, []);

  useEffect(() => {
    if (selectedPolitico) {
      fetchMetricas(selectedPolitico.id);
      fetchMencionesRandom(selectedPolitico.id);
    } else {
      setMetricas([]);
      setMencionesRandom([]);
    }
  }, [selectedPolitico]);

  const fetchPoliticos = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/politicos`;
      const response = await axios.get(url);
      setPoliticos(response.data);
      if (response.data.length > 0 && !selectedPolitico) {
        setSelectedPolitico(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching politicos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetricas = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/politicos/${id}/metricas`);

      // Agrupar por trimestre
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
      console.error("Error fetching metricas:", error);
    }
  };

  const fetchMencionesRandom = async (id) => {
    setLoadingMenciones(true);
    try {
      const response = await axios.get(`${API_URL}/politicos/${id}/menciones/random?limit=4`);
      setMencionesRandom(response.data);
    } catch (error) {
      console.error("Error fetching random menciones:", error);
      setMencionesRandom([]);
    } finally {
      setLoadingMenciones(false);
    }
  };

  const handleSimular = async () => {
    setSimulating(true);
    try {
      await axios.post(`${API_URL}/simular`);
      if (selectedPolitico) {
        await fetchMetricas(selectedPolitico.id);
      }
    } catch (error) {
      console.error("Error simulando datos:", error);
    } finally {
      setSimulating(false);
    }
  };

  const handleScrappearUno = async (id) => {
    setScrappearUnoId(id);
    try {
      await axios.post(`${API_URL}/politicos/${id}/scrappear`);
      await fetchMetricas(id);
      await fetchMencionesRandom(id);
    } catch (error) {
      console.error("Error actualizando perfil:", error);
    } finally {
      setScrappearUnoId(null);
    }
  };

  const handleSwap = async (e) => {
    e.preventDefault();
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
      if (response.data.status === "success") {
        await fetchPoliticos();
        const nuevo = response.data.new_politico;
        setSelectedPolitico(nuevo);
        setShowSwapModal(false);
      }
    } catch (error) {
      console.error("Error al intercambiar político:", error);
      setSwapError(error.response?.data?.detail || "Ocurrió un error al realizar el intercambio.");
    } finally {
      setSwapping(false);
    }
  };


  const categorias = ["", "Primera línea", "Segunda línea", "Tercera línea"];

  if (loading && politicos.length === 0) {
    return (
      <div className="loader">
        <Activity size={48} className="spin" style={{ color: 'var(--primary-accent)', marginBottom: '1rem' }} />
        <div style={{ letterSpacing: '0.2em', fontWeight: 600 }}>AUDITANDO SOBERANÍA TDF...</div>
      </div>
    );
  }

  const latestMetrica = metricas.length > 0 ? metricas[metricas.length - 1] : null;

  return (
    <div className="app-container">
      <header>
        <div className="title-section">
          <h1>Análisis Soberano TDF 2.0</h1>
          <p>Motor de Inteligencia Artificial para Sentiment Analysis Multired</p>
        </div>
        <div className="controls-section">
          <button 
            className="btn-primary" 
            onClick={handleSimular}
            disabled={simulating}
          >
            <RefreshCw size={18} className={simulating ? 'spin' : ''} />
            {simulating ? 'Escaneando redes...' : 'Actualizar Inteligencia'}
          </button>
        </div>
      </header>



      <div className="dashboard-grid">
        <div className="card list-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#0ea5e9" /> Directorio Político
            </h2>
          </div>
          <div className="politicos-list">
            {politicos.map((pol, idx) => (
              <div 
                key={pol.id} 
                className={`politico-item ${selectedPolitico?.id === pol.id ? 'selected' : ''}`}
                onClick={() => setSelectedPolitico(pol)}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="politico-info">
                  <h3>{pol.nombre}</h3>
                  <p>{pol.cargo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card detail-card">
          {selectedPolitico ? (
            <div className="detail-view">
              <div className="detail-header" style={{ animation: 'slideIn 0.5s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-accent)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                    <ShieldCheck size={14} /> Perfil Auditado
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h2>{selectedPolitico.nombre}</h2>
                        <p>{selectedPolitico.cargo} | <span style={{color: 'var(--secondary-accent)', fontWeight: 600}}>Sector Fueguino</span></p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button 
                            className="filter-btn" 
                            style={{ background: 'rgba(52, 211, 153, 0.1)', color: 'var(--primary-accent)', borderColor: 'rgba(52, 211, 153, 0.3)', margin: 0 }}
                            onClick={() => handleScrappearUno(selectedPolitico.id)}
                            disabled={scrappearUnoId === selectedPolitico.id}
                        >
                            <RefreshCw size={14} className={scrappearUnoId === selectedPolitico.id ? 'spin' : ''} style={{marginRight: '8px'}} />
                            {scrappearUnoId === selectedPolitico.id ? 'Refrescando...' : 'Actualizar Perfil'}
                        </button>
                        <button 
                            className="filter-btn" 
                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)', margin: 0 }}
                            onClick={() => {
                              setNewNombre('');
                              setNewCargo('');
                              setSwapError('');
                              setShowSwapModal(true);
                            }}
                        >
                            Reemplazar Figura
                        </button>
                    </div>

                </div>
                
                <div className="social-sync">
                    <div className={`social-badge ${simulating ? 'active' : ''}`}><Facebook size={12} /> FB Link</div>
                    <div className={`social-badge ${simulating ? 'active' : ''}`}><Twitter size={12} /> X Feed</div>
                    <div className={`social-badge ${simulating ? 'active' : ''}`}><Instagram size={12} /> IG Tags</div>
                </div>
              </div>

              {latestMetrica ? (
                <>
                  <div className="kpi-row">
                    <div className="kpi-card pos" style={{ animationDelay: '0.1s' }}>
                      <TrendingUp size={24} color="var(--color-positive)" />
                      <div className="kpi-value">{latestMetrica?.positiva || 0}%</div>
                      <div className="kpi-label">Imagen Positiva</div>
                    </div>
                    <div className="kpi-card neu" style={{ animationDelay: '0.2s' }}>
                      <Minus size={24} color="var(--color-neutral)" />
                      <div className="kpi-value">{latestMetrica?.neutra || 0}%</div>
                      <div className="kpi-label">Dato Neutro</div>
                    </div>
                    <div className="kpi-card neg" style={{ animationDelay: '0.3s' }}>
                      <TrendingDown size={24} color="var(--color-negative)" />
                      <div className="kpi-value">{latestMetrica?.negativa || 0}%</div>
                      <div className="kpi-label">Sentiment Negativo</div>
                    </div>
                  </div>

                  <div className="chart-container" style={{ animation: 'slideIn 0.8s ease-out' }}>
                    <h3 style={{fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1.5rem', fontWeight: 500}}>
                      Trazabilidad Temporal de Opinión Pública (IA Multifuente)
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
                        <p style={{fontSize: '11px', color: '#475569'}}>Firma: TDF Politicos v2.0 — Motor Multifuente</p>
                        <p style={{fontSize: '11px', color: '#64748b', fontWeight: 600, maxWidth: '60%', textAlign: 'right'}}>
                            📡 {latestMetrica?.fuente || 'Sin datos de fuente'}
                        </p>
                    </div>
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
                  <p>Iniciando auditoría de datos para este perfil...</p>
                  <button className="btn-primary" onClick={handleSimular} disabled={simulating}>
                    {simulating ? 'Analizando...' : 'Comenzar Análisis IA'}
                  </button>
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
                Selecciona una figura política del directorio para iniciar el análisis profundo de medios locales y redes sociales.
              </p>
            </div>
          )}
        </div>
      </div>
      {showSwapModal && (

        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Intercambiar Referente</h3>
            <p>
              Reemplaza a <strong>{selectedPolitico?.nombre}</strong> en el directorio. Se mantendrá el cupo total y se recalcularán los datos del nuevo integrante.
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
                <label>Cargo / Función en TDF</label>
                <input
                  type="text"
                  placeholder="Ej. Referente Tolhuin / Concejal"
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
