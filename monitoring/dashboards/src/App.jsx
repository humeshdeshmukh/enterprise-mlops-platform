import React, { useState, useEffect } from 'react';
import { 
  Database, 
  GitBranch, 
  Cpu, 
  AlertTriangle, 
  Play, 
  RefreshCw, 
  Send, 
  CheckCircle2, 
  XCircle,
  Clock,
  Settings,
  ShieldCheck,
  TrendingUp,
  FileText,
  Layers,
  Activity,
  Zap,
  Check,
  Sparkles,
  Terminal,
  Sliders,
  Globe,
  ArrowRight,
  BarChart3
} from 'lucide-react';

const API_BASE = 'http://localhost:8000';

function App() {
  const [activeTab, setActiveTab] = useState('feature-store');
  const [systemOnline, setSystemOnline] = useState(false);
  
  // Tab 1: Feast Store States
  const [borrowerId, setBorrowerId] = useState('1001');
  const [storeType, setStoreType] = useState('online');
  const [fetchedFeatures, setFetchedFeatures] = useState(null);
  const [fetchLatency, setFetchLatency] = useState(null);
  const [ingestForm, setIngestForm] = useState({
    borrower_id: '1006',
    credit_score: '710',
    debt_to_income_ratio: '0.28',
    annual_income: '82000',
    active_loans_count: '2',
    repayment_history_score: '0.89'
  });
  const [ingestStatus, setIngestStatus] = useState('');

  // Tab 2: Kubeflow Pipelines States
  const [pipelineRunsList, setPipelineRunsList] = useState([]);
  const [currentPipelineRun, setCurrentPipelineRun] = useState(null);
  const [pipelineLogs, setPipelineLogs] = useState([]);
  
  // Tab 3: MLflow Registry States
  const [registeredModels, setRegisteredModels] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [auditForm, setAuditForm] = useState({
    version: '',
    status: 'Staging',
    approver: ''
  });
  
  // Tab 4: Triton Serving States
  const [tritonInput, setTritonInput] = useState({
    credit_score: '720',
    debt_to_income_ratio: '0.31',
    annual_income: '85000',
    active_loans_count: '1',
    repayment_history_score: '0.94'
  });
  const [inferenceResult, setInferenceResult] = useState(null);
  const [concurrency, setConcurrency] = useState(1);
  const [tritonStats, setTritonStats] = useState({
    throughput: 124.5,
    p99_latency_ms: 7.8,
    queue_latency_ms: 1.2,
    gpu_utilization: 24.3,
    dynamic_batch_size: 16,
    payload_log: []
  });

  // Tab 5: Drift Observability States
  const [driftMetrics, setDriftMetrics] = useState(null);
  const [isDriftInjected, setIsDriftInjected] = useState(false);
  const [retrainTriggered, setRetrainTriggered] = useState(false);

  // Poll for background states
  useEffect(() => {
    fetchHealth();
    fetchFeastDetails();
    fetchPipelineRuns();
    fetchMLflowRegistry();
    fetchTritonStats();
    fetchDriftMetrics();

    const interval = setInterval(() => {
      fetchHealth();
      fetchPipelineRuns();
      fetchTritonStats();
      fetchDriftMetrics();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Set default model version for audit form when registry loads
  useEffect(() => {
    if (registeredModels.length > 0 && !auditForm.version) {
      setAuditForm(prev => ({ ...prev, version: registeredModels[registeredModels.length - 1].version.toString() }));
      setSelectedVersion(registeredModels[registeredModels.length - 1]);
    }
  }, [registeredModels]);

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      const data = await res.json();
      if (data.status === 'ONLINE') setSystemOnline(true);
    } catch (err) {
      setSystemOnline(false);
    }
  };

  const fetchFeastDetails = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/feature-store/entities`);
      await res.json();
    } catch (e) {}
  };

  const fetchPipelineRuns = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/pipelines/runs`);
      const data = await res.json();
      setPipelineRunsList(data.runs);
      setCurrentPipelineRun(data.current_run);
      if (data.current_run) {
        setPipelineLogs(data.current_run.logs);
      }
    } catch (e) {}
  };

  const fetchMLflowRegistry = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/mlflow/registry`);
      const data = await res.json();
      setRegisteredModels(data.models);
      if (data.models.length > 0 && !selectedVersion) {
        setSelectedVersion(data.models[data.models.length - 1]);
      }
    } catch (e) {}
  };

  const fetchTritonStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/triton/metrics`);
      const data = await res.json();
      setTritonStats(data);
    } catch (e) {}
  };

  const fetchDriftMetrics = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/drift/metrics`);
      const data = await res.json();
      setDriftMetrics(data);
      setIsDriftInjected(data.is_drift_injected);
      setRetrainTriggered(data.retrain_triggered);
    } catch (e) {}
  };

  // Actions
  const handleFetchFeastFeatures = async () => {
    if (!borrowerId) return;
    setFetchedFeatures(null);
    try {
      const res = await fetch(`${API_BASE}/api/feature-store/fetch/${borrowerId}?store_type=${storeType}`);
      const data = await res.json();
      setFetchedFeatures(data.features);
      setFetchLatency(data.latency_ms);
    } catch (e) {
      alert("Error contacting Feature Store API");
    }
  };

  const handleIngestFeatures = async (e) => {
    e.preventDefault();
    setIngestStatus('Ingesting...');
    try {
      const res = await fetch(`${API_BASE}/api/feature-store/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          borrower_id: parseInt(ingestForm.borrower_id),
          credit_score: parseInt(ingestForm.credit_score),
          debt_to_income_ratio: parseFloat(ingestForm.debt_to_income_ratio),
          annual_income: parseFloat(ingestForm.annual_income),
          active_loans_count: parseInt(ingestForm.active_loans_count),
          repayment_history_score: parseFloat(ingestForm.repayment_history_score)
        })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setIngestStatus('Successfully Ingested to Online & Offline stores!');
        setTimeout(() => setIngestStatus(''), 4000);
      }
    } catch (err) {
      setIngestStatus('Ingestion Failed');
    }
  };

  const handleTriggerRetraining = async () => {
    try {
      setPipelineLogs(['[INFO] Dispatching Kubeflow retrain event...']);
      const res = await fetch(`${API_BASE}/api/pipelines/trigger`, { method: 'POST' });
      await res.json();
      fetchPipelineRuns();
    } catch (e) {
      alert("Retrain loop start failed.");
    }
  };

  const handleAuditSubmit = async (e) => {
    e.preventDefault();
    if (!auditForm.approver) {
      alert("Approver name is required for strict financial audits.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/mlflow/status-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: parseInt(auditForm.version),
          status: auditForm.status,
          approver: auditForm.approver
        })
      });
      const data = await res.json();
      if (data.status === 'UPDATED') {
        fetchMLflowRegistry();
        alert(`Model version ${auditForm.version} promoted to ${auditForm.status} successfully!`);
        setAuditForm(prev => ({ ...prev, approver: '' }));
      }
    } catch (err) {
      alert("Model state change failed.");
    }
  };

  const handleTritonInference = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/triton/predict?concurrency=${concurrency}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credit_score: parseFloat(tritonInput.credit_score),
          debt_to_income_ratio: parseFloat(tritonInput.debt_to_income_ratio),
          annual_income: parseFloat(tritonInput.annual_income),
          active_loans_count: parseInt(tritonInput.active_loans_count),
          repayment_history_score: parseFloat(tritonInput.repayment_history_score)
        })
      });
      const data = await res.json();
      setInferenceResult(data);
      fetchTritonStats();
    } catch (err) {
      alert("Inference engine offline.");
    }
  };

  const handleInjectDrift = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/drift/inject`, { method: 'POST' });
      const data = await res.json();
      setIsDriftInjected(true);
      setRetrainTriggered(true);
      fetchDriftMetrics();
      alert("Data distribution drift injected! Statistical metrics recalculated. Autopilot retraining triggered!");
    } catch (e) {
      alert("Drift injection failed.");
    }
  };

  // Render SVG Histogram Comparison Chart
  const renderSVGHistogram = (refValues, prodValues) => {
    if (!refValues || !prodValues) return null;

    const computeBuckets = (values, minVal, maxVal, bucketCount = 12) => {
      const buckets = Array(bucketCount).fill(0);
      const range = maxVal - minVal;
      values.forEach(v => {
        const bIdx = range === 0 ? 0 : Math.min(bucketCount - 1, Math.floor(((v - minVal) / range) * bucketCount));
        buckets[bIdx]++;
      });
      return buckets;
    };

    const globalMin = Math.min(Math.min(...refValues), Math.min(...prodValues));
    const globalMax = Math.max(Math.max(...refValues), Math.max(...prodValues));
    const refBuckets = computeBuckets(refValues, globalMin, globalMax);
    const prodBuckets = computeBuckets(prodValues, globalMin, globalMax);
    const maxVal = Math.max(...refBuckets, ...prodBuckets);

    const width = 500;
    const height = 200;
    const padding = 25;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const barWidth = chartWidth / 12;

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ background: 'rgba(3, 6, 16, 0.55)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <defs>
          <linearGradient id="refGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.75"/>
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1"/>
          </linearGradient>
          <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00bfff" stopOpacity="0.75"/>
            <stop offset="100%" stopColor="#00bfff" stopOpacity="0.1"/>
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => (
          <line 
            key={idx} 
            x1={padding} 
            y1={padding + chartHeight * (1 - r)} 
            x2={width - padding} 
            y2={padding + chartHeight * (1 - r)} 
            stroke="rgba(255,255,255,0.05)" 
            strokeWidth="1"
          />
        ))}

        {/* Reference bars */}
        {refBuckets.map((count, idx) => {
          const barHeight = maxVal === 0 ? 0 : (count / maxVal) * chartHeight;
          const x = padding + idx * barWidth + 3;
          const y = height - padding - barHeight;
          return (
            <rect 
              key={`ref-${idx}`} 
              x={x} 
              y={y} 
              width={barWidth - 6} 
              height={barHeight} 
              fill="url(#refGrad)" 
              stroke="#a78bfa" 
              strokeWidth="1"
              strokeOpacity="0.4"
              rx="3"
            />
          );
        })}

        {/* Production overlapping bars */}
        {prodBuckets.map((count, idx) => {
          const barHeight = maxVal === 0 ? 0 : (count / maxVal) * chartHeight;
          const x = padding + idx * barWidth + 6;
          const y = height - padding - barHeight;
          return (
            <rect 
              key={`prod-${idx}`} 
              x={x} 
              y={y} 
              width={barWidth - 12} 
              height={barHeight} 
              fill="url(#prodGrad)" 
              stroke="#00bfff" 
              strokeWidth="1.5"
              strokeOpacity="0.75"
              rx="2"
            />
          );
        })}

        {/* Axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

        {/* Axis Labels */}
        <text x={padding} y={height - 8} fill="#64748b" fontSize="10.5" fontFamily="var(--font-sans)" fontWeight="bold">{globalMin.toFixed(0)}</text>
        <text x={width - padding - 22} y={height - 8} fill="#64748b" fontSize="10.5" fontFamily="var(--font-sans)" fontWeight="bold">{globalMax.toFixed(0)}</text>
      </svg>
    );
  };

  // Render SVG Line Area chart for Wasserstein distance trend
  const renderDriftTrendSVG = (history) => {
    if (!history || history.length === 0) return null;
    
    const width = 500;
    const height = 140;
    const padding = 15;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxVal = Math.max(0.25, ...history.map(h => h.wasserstein_distance));

    // Generate path points
    const points = history.map((h, i) => {
      const x = padding + (i / (history.length - 1)) * chartWidth;
      const y = height - padding - (h.wasserstein_distance / maxVal) * chartHeight;
      return { x, y, val: h.wasserstein_distance, alert: h.alert };
    });

    const pathD = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, "");

    const areaD = points.length > 0 
      ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z` 
      : "";

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00bfff" stopOpacity="0.35"/>
            <stop offset="100%" stopColor="#00bfff" stopOpacity="0.0"/>
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => (
          <line 
            key={idx}
            x1={padding}
            y1={padding + chartHeight * (1 - r)}
            x2={width - padding}
            y2={padding + chartHeight * (1 - r)}
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="1"
          />
        ))}

        {/* Threshold line */}
        {driftMetrics && (
          <line 
            x1={padding} 
            y1={height - padding - (driftMetrics.drift_threshold / maxVal) * chartHeight} 
            x2={width - padding} 
            y2={height - padding - (driftMetrics.drift_threshold / maxVal) * chartHeight} 
            stroke="#ef4444" 
            strokeWidth="1.5" 
            strokeDasharray="5,5" 
            opacity="0.8"
          />
        )}

        {/* Shaded Area */}
        {areaD && <path d={areaD} fill="url(#trendGrad)" />}

        {/* Glowing Line */}
        {pathD && <path d={pathD} fill="none" stroke="#00bfff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

        {/* Data points */}
        {points.map((p, idx) => (
          <circle 
            key={idx} 
            cx={p.x} 
            cy={p.y} 
            r="4.5" 
            fill={p.alert ? '#ef4444' : '#00bfff'} 
            stroke="#03060f" 
            strokeWidth="2"
            style={{ transition: 'all 0.2s', filter: p.alert ? 'drop-shadow(0 0 4px #ef4444)' : 'drop-shadow(0 0 4px #00bfff)' }}
          />
        ))}

        {/* Bottom Baseline line */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      </svg>
    );
  };

  // Render Circular Risk Gauge Chart
  const renderRiskGauge = (riskScore, decision) => {
    const radius = 60;
    const strokeWidth = 11;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (riskScore * circumference);
    const color = decision === 'APPROVED' ? '#10b981' : '#ef4444';
    const fillGlow = decision === 'APPROVED' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)';
    
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', width: '160px', height: '160px' }}>
        <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
          <circle 
            cx="80" 
            cy="80" 
            r={radius} 
            fill={fillGlow} 
            stroke="rgba(255,255,255,0.04)" 
            strokeWidth={strokeWidth} 
          />
          <circle 
            cx="80" 
            cy="80" 
            r={radius} 
            fill="transparent" 
            stroke={color} 
            strokeWidth={strokeWidth} 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ 
              transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)',
              filter: `drop-shadow(0 0 6px ${color}80)`
            }}
          />
        </svg>
        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '24px', fontWeight: '900', color: '#fff', fontFamily: 'var(--font-mono)', letterSpacing: '-0.5px' }}>
            {(riskScore * 100).toFixed(0)}%
          </span>
          <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>
            Risk Index
          </span>
        </div>
      </div>
    );
  };

  // Progress Bar for Feature Value mapping
  const renderFeatureBar = (val, max, formatType = 'float') => {
    const scorePct = max === 0 ? 0 : Math.min(100, (val / max) * 100);
    const formatted = formatType === 'percent' 
      ? `${(val * 100).toFixed(0)}%` 
      : formatType === 'currency' 
      ? `$${val.toLocaleString()}` 
      : val.toString();

    return (
      <div className="feature-field-row">
        <div className="feature-field-meta">
          <span style={{ color: '#fff', fontWeight: '600' }}>{formatted}</span>
          <span style={{ color: 'var(--text-dark)', fontSize: '11px', fontWeight: '700' }}>Target Limit: {max}</span>
        </div>
        <div className="feature-field-bar-bg">
          <div className="feature-field-bar-fill" style={{ width: `${scorePct}%` }} />
        </div>
      </div>
    );
  };

  // Get active model version number
  const activeModelVersion = registeredModels.length > 0 
    ? `v${registeredModels[registeredModels.length - 1].version}` 
    : 'None';

  return (
    <div className="fade-in">
      <header>
        <div className="header-container">
          <div className="logo-area">
            <Cpu size={30} color="#00bfff" style={{ filter: 'drop-shadow(0 0 6px rgba(0,191,255,0.4))' }} />
            <h1 className="logo-title">Enterprise MLOps Platform</h1>
            <span className="logo-badge">Control Plane HUD</span>
          </div>
          
          <nav className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'feature-store' ? 'active' : ''}`}
              onClick={() => setActiveTab('feature-store')}
            >
              <Database size={16} />
              Feast Feature Store
            </button>
            <button 
              className={`nav-tab ${activeTab === 'kubeflow' ? 'active' : ''}`}
              onClick={() => setActiveTab('kubeflow')}
            >
              <Clock size={16} />
              Kubeflow Pipelines
            </button>
            <button 
              className={`nav-tab ${activeTab === 'mlflow' ? 'active' : ''}`}
              onClick={() => setActiveTab('mlflow')}
            >
              <GitBranch size={16} />
              MLflow Registry
            </button>
            <button 
              className={`nav-tab ${activeTab === 'triton' ? 'active' : ''}`}
              onClick={() => setActiveTab('triton')}
            >
              <Settings size={16} />
              Triton Inference
            </button>
            <button 
              className={`nav-tab ${activeTab === 'drift' ? 'active' : ''}`}
              onClick={() => setActiveTab('drift')}
            >
              <AlertTriangle size={16} />
              Drift Observatory
              {isDriftInjected && <span className="status-dot danger" style={{ marginLeft: '6px' }} />}
            </button>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '8px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span className={`status-dot ${systemOnline ? 'active' : 'danger'}`} />
            <span style={{ fontSize: '11px', fontWeight: '800', color: systemOnline ? '#10b981' : '#ef4444', letterSpacing: '0.8px', fontFamily: 'var(--font-mono)' }}>
              {systemOnline ? 'SYSTEM: ONLINE' : 'SYSTEM: OFFLINE'}
            </span>
          </div>
        </div>
      </header>

      <main>
        {/* GLOBAL OVERVIEW METRICS RIBBON */}
        <section className="overview-ribbon" aria-label="Global MLOps Telemetry Overview">
          <div className="ribbon-card">
            <div className="ribbon-header">
              <span className="ribbon-title">Feast Store Engine</span>
              <Database size={16} color="#00bfff" />
            </div>
            <div>
              <div className="ribbon-value">Dual-Store</div>
              <div className="ribbon-footer">
                <span className={`status-dot ${systemOnline ? 'active' : 'danger'}`} />
                <span>Redis & Parquet S3 active</span>
              </div>
            </div>
          </div>

          <div className="ribbon-card">
            <div className="ribbon-header">
              <span className="ribbon-title">Kubeflow Pipelines</span>
              <Clock size={16} color="#8b5cf6" />
            </div>
            <div>
              <div className="ribbon-value">
                {currentPipelineRun ? 'RUNNING' : 'STANDBY'}
              </div>
              <div className="ribbon-footer">
                <RefreshCw size={12} className={currentPipelineRun ? 'animate-spin' : ''} color={currentPipelineRun ? '#8b5cf6' : 'var(--text-dark)'} />
                <span>{currentPipelineRun ? 'Fitting XGBoost nodes...' : 'Trigger standby active'}</span>
              </div>
            </div>
          </div>

          <div className="ribbon-card">
            <div className="ribbon-header">
              <span className="ribbon-title">MLflow Registered</span>
              <GitBranch size={16} color="#f43f5e" />
            </div>
            <div>
              <div className="ribbon-value">{activeModelVersion}</div>
              <div className="ribbon-footer">
                <CheckCircle2 size={12} color="#10b981" />
                <span>Lineage signature active</span>
              </div>
            </div>
          </div>

          <div className="ribbon-card">
            <div className="ribbon-header">
              <span className="ribbon-title">Triton Throughput</span>
              <Cpu size={16} color="#00bfff" />
            </div>
            <div>
              <div className="ribbon-value">{tritonStats.throughput} R/S</div>
              <div className="ribbon-footer">
                <Zap size={12} color="#fbbf24" />
                <span>p99: {tritonStats.p99_latency_ms} ms Latency</span>
              </div>
            </div>
          </div>

          <div className="ribbon-card" style={{ borderLeft: isDriftInjected ? '3px solid #ef4444' : '1px solid rgba(255,255,255,0.04)' }}>
            <div className="ribbon-header">
              <span className="ribbon-title">Data Drift Indicator</span>
              <AlertTriangle size={16} color={isDriftInjected ? '#ef4444' : '#10b981'} />
            </div>
            <div>
              <div className="ribbon-value" style={{ color: isDriftInjected ? '#ef4444' : '#10b981' }}>
                {isDriftInjected ? 'DRIFT ALERT' : 'STABLE'}
              </div>
              <div className="ribbon-footer">
                <span className={`status-dot ${isDriftInjected ? 'danger' : 'active'}`} />
                <span>{isDriftInjected ? 'Wasserstein > 0.15 threshold' : 'Stable covariate profiles'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* TAB 1: FEAST FEATURE STORE */}
        {activeTab === 'feature-store' && (
          <div className="fade-in">
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.5px' }}>Feast Dual-Store Feature Engine</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
                Orchestrates low-latency online caching (Redis) for credit decisions and high-scale offline storage (Parquet/S3) for compliance and model fitting.
              </p>
            </div>

            <div className="grid-3" style={{ marginBottom: '32px' }}>
              <div className="stat-card">
                <div className="stat-icon-container" style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                  <Database size={22} color="#10b981" />
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px' }}>Online Cache store</span>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>Redis Cluster (Active)</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-container" style={{ background: 'rgba(139, 92, 246, 0.06)', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
                  <Layers size={22} color="#8b5cf6" />
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px' }}>Offline Storage format</span>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>S3 AWS Parquet Logs</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-container" style={{ background: 'rgba(0, 191, 255, 0.06)', border: '1px solid rgba(0, 191, 255, 0.15)' }}>
                  <Activity size={22} color="#00bfff" />
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px' }}>Registered Features</span>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>5 active definitions</span>
                </div>
              </div>
            </div>

            <div className="grid-1-2">
              {/* Feature Control Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div className="glass-panel">
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '14px' }}>
                    <Database size={20} color="#00bfff" /> Fetch Feature Vectors
                  </h3>

                  <div className="input-group">
                    <label htmlFor="borrower-id-input">Borrower ID (Entity Key)</label>
                    <input 
                      id="borrower-id-input"
                      type="number" 
                      className="input-control" 
                      value={borrowerId} 
                      onChange={(e) => setBorrowerId(e.target.value)} 
                    />
                  </div>

                  <div className="input-group" style={{ marginBottom: '24px' }}>
                    <label>Store Engine</label>
                    <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                        <input 
                          type="radio" 
                          name="store" 
                          value="online" 
                          checked={storeType === 'online'} 
                          onChange={() => setStoreType('online')} 
                          style={{ accentColor: '#00bfff', width: '16px', height: '16px' }}
                        />
                        Redis Online
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                        <input 
                          type="radio" 
                          name="store" 
                          value="offline" 
                          checked={storeType === 'offline'} 
                          onChange={() => setStoreType('offline')} 
                          style={{ accentColor: '#00bfff', width: '16px', height: '16px' }}
                        />
                        S3 Parquet
                      </label>
                    </div>
                  </div>

                  <button className="primary-btn" onClick={handleFetchFeastFeatures} style={{ width: '100%' }}>
                    Retrieve Feature Vector
                  </button>
                </div>

                <div className="glass-panel">
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '14px' }}>
                    <Send size={20} color="#8b5cf6" /> Ingest Borrower Records
                  </h3>

                  <form onSubmit={handleIngestFeatures}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="input-group">
                        <label htmlFor="ingest-borrower-id">Borrower ID</label>
                        <input 
                          id="ingest-borrower-id"
                          type="text" 
                          className="input-control" 
                          value={ingestForm.borrower_id}
                          onChange={(e) => setIngestForm({ ...ingestForm, borrower_id: e.target.value })}
                        />
                      </div>
                      <div className="input-group">
                        <label htmlFor="ingest-credit-score">Credit Score</label>
                        <input 
                          id="ingest-credit-score"
                          type="number" 
                          className="input-control" 
                          value={ingestForm.credit_score}
                          onChange={(e) => setIngestForm({ ...ingestForm, credit_score: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="input-group">
                        <label htmlFor="ingest-dti">DTI Ratio</label>
                        <input 
                          id="ingest-dti"
                          type="text" 
                          className="input-control" 
                          value={ingestForm.debt_to_income_ratio}
                          onChange={(e) => setIngestForm({ ...ingestForm, debt_to_income_ratio: e.target.value })}
                        />
                      </div>
                      <div className="input-group">
                        <label htmlFor="ingest-income">Annual Income ($)</label>
                        <input 
                          id="ingest-income"
                          type="number" 
                          className="input-control" 
                          value={ingestForm.annual_income}
                          onChange={(e) => setIngestForm({ ...ingestForm, annual_income: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="input-group">
                        <label htmlFor="ingest-loans">Active Loans</label>
                        <input 
                          id="ingest-loans"
                          type="number" 
                          className="input-control" 
                          value={ingestForm.active_loans_count}
                          onChange={(e) => setIngestForm({ ...ingestForm, active_loans_count: e.target.value })}
                        />
                      </div>
                      <div className="input-group">
                        <label htmlFor="ingest-repayment">Repayment (0-1)</label>
                        <input 
                          id="ingest-repayment"
                          type="text" 
                          className="input-control" 
                          value={ingestForm.repayment_history_score}
                          onChange={(e) => setIngestForm({ ...ingestForm, repayment_history_score: e.target.value })}
                        />
                      </div>
                    </div>

                    <button type="submit" className="secondary-btn" style={{ width: '100%', marginTop: '12px' }}>
                      Trigger Ingestion Pipeline
                    </button>

                    {ingestStatus && (
                      <div style={{ 
                        marginTop: '18px', 
                        textAlign: 'center', 
                        fontSize: '13px', 
                        color: ingestStatus.includes('Failed') ? '#ef4444' : '#10b981', 
                        fontWeight: '800',
                        background: ingestStatus.includes('Failed') ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)',
                        padding: '12px',
                        borderRadius: '10px',
                        border: ingestStatus.includes('Failed') ? '1px solid rgba(239,68,68,0.15)' : '1px solid rgba(16,185,129,0.15)'
                      }}>
                        {ingestStatus}
                      </div>
                    )}
                  </form>
                </div>
              </div>

              {/* Feature Data Telemetry display */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
                {fetchedFeatures ? (
                  <div className="fade-in" style={{ height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '16px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sliders size={20} color="#00bfff" /> Feature Profile Telemetry
                      </h3>
                      <span style={{ 
                        color: fetchLatency < 10 ? '#10b981' : '#f59e0b', 
                        fontFamily: 'var(--font-mono)', 
                        fontWeight: '900',
                        fontSize: '14px',
                        background: fetchLatency < 10 ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        border: fetchLatency < 10 ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(245,158,11,0.2)'
                      }}>
                        Latency: {fetchLatency} ms
                      </span>
                    </div>

                    <div style={{ background: '#02040b', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)', height: 'calc(100% - 66px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ marginBottom: '18px', fontSize: '13px', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', fontWeight: '700' }}>
                        ENTITY METADATA: borrower_id ({borrowerId})
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1, justifyContent: 'center' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '6px' }}>CREDIT RISK SCORE</span>
                          {renderFeatureBar(fetchedFeatures.credit_score, 850)}
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '6px' }}>DEBT-TO-INCOME (DTI)</span>
                          {renderFeatureBar(fetchedFeatures.debt_to_income_ratio, 1.0, 'percent')}
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '6px' }}>ANNUAL INCOME PROFILE</span>
                          {renderFeatureBar(fetchedFeatures.annual_income, 250000, 'currency')}
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '6px' }}>ACTIVE CREDIT ACCOUNTS</span>
                          {renderFeatureBar(fetchedFeatures.active_loans_count, 15)}
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '6px' }}>REPAYMENT RATIO HASH</span>
                          {renderFeatureBar(fetchedFeatures.repayment_history_score, 1.0, 'percent')}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, color: 'var(--text-dark)', padding: '40px', textAlign: 'center' }}>
                    <Database size={48} color="rgba(255,255,255,0.05)" style={{ marginBottom: '16px' }} />
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '8px' }}>Feature Vector Console Standby</h4>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-dark)', maxWidth: '360px', lineHeight: '1.6' }}>
                      Enter a Borrower ID on the left and fetch its live feature vector from Redis/S3. The profiles will be displayed in real-time.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KUBEFLOW PIPELINES */}
        {activeTab === 'kubeflow' && (
          <div className="fade-in">
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.5px' }}>Kubeflow Pipeline Orchestration</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
                Coordinates automated model building, tuning hyper-parameters, and publishing model checkpoints into regulatory environments.
              </p>
            </div>

            <div className="grid-2-1">
              {/* DAG & Execution Console */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart3 size={20} color="#00bfff" /> Pipeline Execution Node DAG
                  </h3>
                  <button 
                    className="primary-btn" 
                    onClick={handleTriggerRetraining}
                    disabled={currentPipelineRun && currentPipelineRun.status === 'RUNNING'}
                  >
                    <Play size={16} />
                    {currentPipelineRun && currentPipelineRun.status === 'RUNNING' ? 'Running Nodes...' : 'Trigger Retrain Pipeline'}
                  </button>
                </div>

                {/* SVG DAG Visuals */}
                <div style={{ position: 'relative', background: '#02040b', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.03)', padding: '32px 20px' }}>
                  <svg width="100%" height="120" viewBox="0 0 760 120">
                    <defs>
                      <linearGradient id="dagLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="50%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#00bfff" />
                      </linearGradient>
                      <filter id="glowEffect" x="-10%" y="-10%" width="120%" height="120%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Flowing animated lines */}
                    <path d="M 130 60 L 240 60" stroke={currentPipelineRun ? "url(#dagLineGrad)" : "rgba(255,255,255,0.08)"} strokeWidth="3" className={currentPipelineRun ? "svg-flow-path" : ""} />
                    <path d="M 350 60 L 460 60" stroke={currentPipelineRun ? "#8b5cf6" : "rgba(255,255,255,0.08)"} strokeWidth="3" className={currentPipelineRun ? "svg-flow-path" : ""} />
                    <path d="M 570 60 L 630 60" stroke={currentPipelineRun && !currentPipelineRun.logs.some(l => l.includes('hyperparameter')) ? "rgba(255,255,255,0.08)" : "#00bfff"} strokeWidth="3" className={currentPipelineRun ? "svg-flow-path" : ""} />

                    {/* Node 1: Ingest */}
                    <g transform="translate(10, 35)">
                      <rect x="0" y="0" width="120" height="50" rx="8" fill="#030c1e" stroke="#10b981" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.25))' }} />
                      <text x="60" y="24" fill="#34d399" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="var(--font-sans)">1. FEAST INGEST</text>
                      <text x="60" y="38" fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="var(--font-mono)">STATUS: READY</text>
                      <circle cx="120" cy="25" r="4.5" fill="#10b981" />
                    </g>

                    {/* Node 2: Preprocess */}
                    <g transform="translate(240, 35)">
                      <rect x="0" y="0" width="110" height="50" rx="8" fill="#04091a" stroke={currentPipelineRun ? "#38bdf8" : "rgba(255,255,255,0.12)"} strokeWidth="1.5" />
                      <text x="55" y="24" fill={currentPipelineRun ? "#38bdf8" : "var(--text-muted)"} fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="var(--font-sans)">2. PREPROCESS</text>
                      <text x="55" y="38" fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="var(--font-mono)">
                        {currentPipelineRun ? 'ACTIVE' : 'IDLE'}
                      </text>
                      <circle cx="0" cy="25" r="4.5" fill={currentPipelineRun ? "#38bdf8" : "rgba(255,255,255,0.2)"} />
                      <circle cx="110" cy="25" r="4.5" fill={currentPipelineRun ? "#38bdf8" : "rgba(255,255,255,0.2)"} />
                    </g>

                    {/* Node 3: XGBoost */}
                    <g transform="translate(460, 35)">
                      <rect x="0" y="0" width="110" height="50" rx="8" fill="#04091a" stroke={currentPipelineRun && currentPipelineRun.logs.some(l => l.includes('hyperparameter')) ? "#8b5cf6" : "rgba(255,255,255,0.12)"} strokeWidth="1.5" />
                      <text x="55" y="24" fill={currentPipelineRun && currentPipelineRun.logs.some(l => l.includes('hyperparameter')) ? "#a78bfa" : "var(--text-muted)"} fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="var(--font-sans)">3. XGBOOST FIT</text>
                      <text x="55" y="38" fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="var(--font-mono)">
                        {currentPipelineRun && currentPipelineRun.logs.some(l => l.includes('hyperparameter')) ? 'TRAINING' : 'WAITING'}
                      </text>
                      <circle cx="0" cy="25" r="4.5" fill={currentPipelineRun && currentPipelineRun.logs.some(l => l.includes('hyperparameter')) ? "#8b5cf6" : "rgba(255,255,255,0.2)"} />
                      <circle cx="110" cy="25" r="4.5" fill={currentPipelineRun && currentPipelineRun.logs.some(l => l.includes('hyperparameter')) ? "#8b5cf6" : "rgba(255,255,255,0.2)"} />
                    </g>

                    {/* Node 4: Eval */}
                    <g transform="translate(640, 35)">
                      <rect x="0" y="0" width="110" height="50" rx="8" fill="#04091a" stroke={currentPipelineRun && currentPipelineRun.logs.some(l => l.includes('Evaluation')) ? "#00bfff" : "rgba(255,255,255,0.12)"} strokeWidth="1.5" />
                      <text x="55" y="24" fill={currentPipelineRun && currentPipelineRun.logs.some(l => l.includes('Evaluation')) ? "#00bfff" : "var(--text-muted)"} fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="var(--font-sans)">4. EVALUATION</text>
                      <text x="55" y="38" fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="var(--font-mono)">
                        {currentPipelineRun && currentPipelineRun.logs.some(l => l.includes('Evaluation')) ? 'COMPILING' : 'WAITING'}
                      </text>
                      <circle cx="0" cy="25" r="4.5" fill={currentPipelineRun && currentPipelineRun.logs.some(l => l.includes('Evaluation')) ? "#00bfff" : "rgba(255,255,255,0.2)"} />
                    </g>
                  </svg>
                </div>

                {/* IDE-style Logs Terminal */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="console-header-bar">
                    <div className="console-dots">
                      <span className="console-dot-indicator" style={{ background: '#ff5f56' }} />
                      <span className="console-dot-indicator" style={{ background: '#ffbd2e' }} />
                      <span className="console-dot-indicator" style={{ background: '#27c93f' }} />
                    </div>
                    <span style={{ fontWeight: '800', letterSpacing: '0.5px', color: '#fff', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Terminal size={12} color="#00bfff" /> pipeline_orchestrator_logs.sh
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`status-dot ${currentPipelineRun ? 'active' : 'warning'}`} />
                      <span style={{ fontSize: '10.5px', color: currentPipelineRun ? '#10b981' : '#fbbf24', fontWeight: '800', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                        {currentPipelineRun ? 'ACTIVE EXECUTOR' : 'STANDBY'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="console-logs" style={{ borderTopLeftRadius: '0', borderTopRightRadius: '0' }}>
                    {pipelineLogs.map((log, i) => {
                      let type = 'info';
                      if (log.includes('[ERROR]')) type = 'danger';
                      if (log.includes('registered') || log.includes('successful') || log.includes('SUCCEEDED')) type = 'success';
                      if (log.includes('searching') || log.includes('Hyperparameter')) type = 'warning';
                      return (
                        <div key={i} className={`console-line ${type}`}>
                          {log}
                        </div>
                      );
                    })}

                    {pipelineLogs.length === 0 && (
                      <div style={{ color: 'var(--text-dark)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', fontStyle: 'italic', gap: '10px' }}>
                        <Terminal size={32} color="rgba(255,255,255,0.02)" />
                        Terminal standby. Trigger retrain loop above to stream live execution logs.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Runs List */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HistoryIcon size={18} color="#8b5cf6" /> Execution History
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '520px', overflowY: 'auto', paddingRight: '4px', flexGrow: 1 }}>
                  {pipelineRunsList.map((run, i) => (
                    <div key={i} style={{ 
                      background: 'rgba(255, 255, 255, 0.01)', 
                      border: '1px solid var(--border-light)',
                      borderRadius: '12px',
                      padding: '18px',
                      transition: 'var(--transition-smooth)'
                    }} className="runs-history-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontWeight: '800', fontSize: '14px', color: '#fff' }}>{run.name}</span>
                        <span style={{ 
                          fontSize: '10px', 
                          fontWeight: '800', 
                          color: run.status === 'SUCCEEDED' ? '#10b981' : '#00bfff',
                          background: run.status === 'SUCCEEDED' ? 'rgba(16,185,129,0.08)' : 'rgba(0,191,255,0.08)',
                          padding: '3px 12px',
                          borderRadius: '50px',
                          border: run.status === 'SUCCEEDED' ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(0,191,255,0.2)',
                          letterSpacing: '0.5px'
                        }}>
                          {run.status}
                        </span>
                      </div>
                      
                      {run.status === 'SUCCEEDED' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', background: '#02040b', padding: '12px', borderRadius: '8px', fontSize: '12px', fontFamily: 'var(--font-mono)', border: '1px solid rgba(255,255,255,0.02)' }}>
                          <div><span style={{ color: 'var(--text-muted)' }}>ACC:</span> <span style={{ color: '#10b981', fontWeight: 'bold' }}>{run.metrics.accuracy}</span></div>
                          <div><span style={{ color: 'var(--text-muted)' }}>AUC:</span> <span style={{ color: '#00bfff', fontWeight: 'bold' }}>{run.metrics.auc}</span></div>
                          <div><span style={{ color: 'var(--text-muted)' }}>F1:</span> <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>{run.metrics.f1_score}</span></div>
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dark)', marginTop: '10px', fontWeight: '600' }}>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>ID: {run.run_id.substring(0, 12)}...</span>
                        <span>{new Date(run.started_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MLFLOW MODEL REGISTRY */}
        {activeTab === 'mlflow' && (
          <div className="fade-in">
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.5px' }}>MLflow Model Registry & Lineage</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
                Establishes cryptographic links between Git revisions, data source states (DVC metadata hashes), evaluations, and formal compliance sign-offs.
              </p>
            </div>

            <div className="grid-2-1">
              {/* Registered Models List */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} color="#00bfff" /> Registered Credit Risk Models
                </h3>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '14px 12px', fontWeight: '800' }}>Version</th>
                        <th style={{ padding: '14px 12px', fontWeight: '800' }}>Serving Stage</th>
                        <th style={{ padding: '14px 12px', fontWeight: '800' }}>AUC Metric</th>
                        <th style={{ padding: '14px 12px', fontWeight: '800' }}>Compliance Officer</th>
                        <th style={{ padding: '14px 12px', fontWeight: '800' }}>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registeredModels.map((model) => (
                        <tr 
                          key={model.version} 
                          className={selectedVersion?.version === model.version ? 'glass-panel-active' : ''}
                          style={{ 
                            borderBottom: '1px solid rgba(255,255,255,0.02)', 
                            cursor: 'pointer',
                            transition: 'var(--transition-smooth)'
                          }}
                          onClick={() => setSelectedVersion(model)}
                        >
                          <td style={{ padding: '16px 12px', fontWeight: '900', color: '#fff', fontSize: '14.5px' }}>Version {model.version}</td>
                          <td style={{ padding: '16px 12px' }}>
                            <span style={{ 
                              fontSize: '11px', 
                              fontWeight: '800', 
                              color: model.status === 'Production' ? '#10b981' : model.status === 'Staging' ? '#fbbf24' : '#64748b',
                              background: model.status === 'Production' ? 'rgba(16,185,129,0.08)' : model.status === 'Staging' ? 'rgba(251,191,36,0.08)' : 'rgba(100,116,139,0.08)',
                              padding: '3px 12px',
                              borderRadius: '50px',
                              border: model.status === 'Production' ? '1px solid rgba(16,185,129,0.2)' : model.status === 'Staging' ? '1px solid rgba(251,191,36,0.2)' : '1px solid rgba(100,116,139,0.2)',
                              letterSpacing: '0.5px'
                            }}>
                              {model.status}
                            </span>
                          </td>
                          <td style={{ padding: '16px 12px', fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#00bfff' }}>{model.auc}</td>
                          <td style={{ padding: '16px 12px', fontSize: '13.5px', color: '#fff', fontWeight: '500' }}>{model.approved_by || 'Awaiting Sign-off'}</td>
                          <td style={{ padding: '16px 12px', fontSize: '12.5px', color: 'var(--text-dark)', fontWeight: '600' }}>
                            {new Date(model.registered_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Lineage Details */}
                {selectedVersion && (
                  <div className="fade-in" style={{ marginTop: '10px', padding: '24px', background: '#02040b', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <h4 style={{ fontSize: '15.5px', fontWeight: '800', marginBottom: '20px', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.2px' }}>
                      <ShieldCheck size={18} /> Compliance Lineage & Audit Trail (Version {selectedVersion.version})
                    </h4>
                    
                    <div className="timeline">
                      {selectedVersion.history.map((h, idx) => (
                        <div key={idx} className="timeline-item">
                          <div className={`timeline-dot ${idx === selectedVersion.history.length - 1 ? 'active' : ''}`} style={{ borderColor: h.action.includes('PROMOTED') ? '#10b981' : h.action.includes('AUDIT') ? '#fbbf24' : '#8b5cf6' }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13.5px' }}>
                            <span style={{ fontWeight: '800', color: '#fff' }}>{h.action}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-dark)', fontFamily: 'var(--font-mono)' }}>{new Date(h.timestamp).toLocaleString()}</span>
                          </div>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', fontWeight: '500' }}>Authorized user credential: <span style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{h.user}</span></p>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', fontSize: '13px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px', marginTop: '20px' }}>
                      <div>
                        <div style={{ marginBottom: '14px' }}>
                          <span style={{ display: 'block', color: 'var(--text-dark)', fontSize: '10px', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '4px' }}>GIT CRYPTO COMMIT SHA</span>
                          <span style={{ fontFamily: 'var(--font-mono)', color: '#fff', fontSize: '12.5px' }}>{selectedVersion.git_commit}</span>
                        </div>
                        <div>
                          <span style={{ display: 'block', color: 'var(--text-dark)', fontSize: '10px', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '4px' }}>DVC METADATA TRACKING SHA (S3)</span>
                          <span style={{ fontFamily: 'var(--font-mono)', color: '#00bfff', fontSize: '11.5px', wordBreak: 'break-all' }}>{selectedVersion.dvc_hash}</span>
                        </div>
                      </div>
                      <div>
                        <div style={{ marginBottom: '14px' }}>
                          <span style={{ display: 'block', color: 'var(--text-dark)', fontSize: '10px', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '4px' }}>KUBEFLOW ORCHESTRATOR RUN ID</span>
                          <span style={{ fontFamily: 'var(--font-mono)', color: '#fff', fontSize: '12.5px' }}>{selectedVersion.run_id}</span>
                        </div>
                        <div>
                          <span style={{ display: 'block', color: 'var(--text-dark)', fontSize: '10px', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '4px' }}>REGULATORY COMPLIANCE SIGNATURE</span>
                          <span style={{ 
                            fontFamily: 'var(--font-mono)', 
                            color: selectedVersion.signature ? '#10b981' : '#fbbf24', 
                            fontSize: '12px',
                            fontWeight: '800'
                          }}>
                            {selectedVersion.signature ? (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={14} /> {selectedVersion.signature}</span>
                            ) : 'PENDING COMPLIANCE AUDIT'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Regulatory Signoff */}
              <div className="glass-panel" style={{ height: 'fit-content' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '14px' }}>
                  <FileText size={20} color="#fbbf24" /> Regulatory Audit Sign-off
                </h3>

                <form onSubmit={handleAuditSubmit}>
                  <div className="input-group">
                    <label htmlFor="audit-version-select">Select Model Version</label>
                    <select 
                      id="audit-version-select"
                      className="input-control" 
                      value={auditForm.version} 
                      onChange={(e) => {
                        setAuditForm({ ...auditForm, version: e.target.value });
                        const v = registeredModels.find(m => m.version.toString() === e.target.value);
                        if (v) setSelectedVersion(v);
                      }}
                    >
                      {registeredModels.map(m => (
                        <option key={m.version} value={m.version}>Version {m.version}</option>
                      ))}
                    </select>
                  </div>

                  <div className="input-group">
                    <label htmlFor="audit-status-select">Target Serving Status</label>
                    <select 
                      id="audit-status-select"
                      className="input-control"
                      value={auditForm.status}
                      onChange={(e) => setAuditForm({ ...auditForm, status: e.target.value })}
                    >
                      <option value="Production">Production (Active serving)</option>
                      <option value="Staging">Staging (Validation)</option>
                      <option value="Archived">Archived (Deprioritized)</option>
                    </select>
                  </div>

                  <div className="input-group" style={{ marginBottom: '26px' }}>
                    <label htmlFor="audit-approver-input">Regulatory Officer Approver</label>
                    <input 
                      id="audit-approver-input"
                      type="text" 
                      className="input-control" 
                      placeholder="e.g. Dr. Sarah Connor"
                      value={auditForm.approver}
                      onChange={(e) => setAuditForm({ ...auditForm, approver: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="primary-btn" style={{ width: '100%' }}>
                    Publish Approval Audit
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TRITON SERVING */}
        {activeTab === 'triton' && (
          <div className="fade-in">
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.5px' }}>Triton Inference Serving Engine</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
                Evaluates low-latency model predictions utilizing dynamic batching queues on EKS GPU nodes. Adjust concurrency to test performance under load.
              </p>
            </div>

            <div className="grid-1-2">
              {/* Controls */}
              <div className="glass-panel" style={{ height: 'fit-content' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '14px' }}>Assess Credit Risk</h3>

                <form onSubmit={handleTritonInference}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="input-group">
                      <label htmlFor="triton-credit-score">Credit Score</label>
                      <input 
                        id="triton-credit-score"
                        type="number" 
                        className="input-control" 
                        value={tritonInput.credit_score}
                        onChange={(e) => setTritonInput({ ...tritonInput, credit_score: e.target.value })}
                      />
                    </div>
                    <div className="input-group">
                      <label htmlFor="triton-dti">DTI Ratio</label>
                      <input 
                        id="triton-dti"
                        type="text" 
                        className="input-control" 
                        value={tritonInput.debt_to_income_ratio}
                        onChange={(e) => setTritonInput({ ...tritonInput, debt_to_income_ratio: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="input-group">
                      <label htmlFor="triton-income">Annual Income ($)</label>
                      <input 
                        id="triton-income"
                        type="number" 
                        className="input-control" 
                        value={tritonInput.annual_income}
                        onChange={(e) => setTritonInput({ ...tritonInput, annual_income: e.target.value })}
                      />
                    </div>
                    <div className="input-group">
                      <label htmlFor="triton-loans">Active Loans</label>
                      <input 
                        id="triton-loans"
                        type="number" 
                        className="input-control" 
                        value={tritonInput.active_loans_count}
                        onChange={(e) => setTritonInput({ ...tritonInput, active_loans_count: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label htmlFor="triton-repayment">Repayment Score (0-1)</label>
                    <input 
                      id="triton-repayment"
                      type="text" 
                      className="input-control" 
                      value={tritonInput.repayment_history_score}
                      onChange={(e) => setTritonInput({ ...tritonInput, repayment_history_score: e.target.value })}
                    />
                  </div>

                  <div className="input-group" style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} htmlFor="concurrency-range">
                      <span>Client Concurrency</span>
                      <span style={{ color: '#00bfff', fontWeight: '800', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{concurrency} threads</span>
                    </label>
                    <input 
                      id="concurrency-range"
                      type="range" 
                      min="1" 
                      max="32" 
                      className="input-control" 
                      style={{ padding: '0', cursor: 'pointer' }}
                      value={concurrency}
                      onChange={(e) => setConcurrency(parseInt(e.target.value))}
                    />
                  </div>

                  <button type="submit" className="primary-btn" style={{ width: '100%' }}>
                    Send Triton Inference Request
                  </button>
                </form>

                {inferenceResult && (
                  <div className="fade-in" style={{ marginTop: '26px', borderTop: '1px solid var(--border-light)', paddingTop: '22px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '24px', 
                      background: '#02040b', 
                      border: '1px solid rgba(255,255,255,0.03)', 
                      borderRadius: '14px', 
                      padding: '20px' 
                    }}>
                      {/* Circular Gauge */}
                      {renderRiskGauge(1.0 - inferenceResult.approval_probability, inferenceResult.decision)}

                      <div style={{ flexGrow: 1 }}>
                        <div style={{ fontWeight: '900', fontSize: '20px', color: inferenceResult.decision === 'APPROVED' ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.3px' }}>
                          {inferenceResult.decision === 'APPROVED' ? <CheckCircle2 size={22} style={{ filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.4))' }} /> : <XCircle size={22} style={{ filter: 'drop-shadow(0 0 4px rgba(239,68,68,0.4))' }} />}
                          {inferenceResult.decision}
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: '500' }}>
                          Approval confidence: <span style={{ color: '#fff', fontWeight: '800' }}>{(inferenceResult.approval_probability * 100).toFixed(1)}%</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-dark)', fontFamily: 'var(--font-mono)', marginTop: '8px', fontWeight: '600' }}>
                          Engine RTT Latency: {inferenceResult.inference_latency_ms} ms
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Batching Visuals & Server Metrics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* server Golden Signals */}
                <div className="glass-panel">
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '14px' }}>Serving Golden Signals</h3>
                  <div className="grid-3" style={{ textAlign: 'center' }}>
                    <div style={{ background: '#02040b', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '4px' }}>Throughput</span>
                      <span style={{ fontSize: '20px', fontWeight: '900', color: '#00bfff', fontFamily: 'var(--font-mono)' }}>{tritonStats.throughput} R/S</span>
                    </div>
                    <div style={{ background: '#02040b', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '4px' }}>P99 Latency</span>
                      <span style={{ fontSize: '20px', fontWeight: '900', color: '#10b981', fontFamily: 'var(--font-mono)' }}>{tritonStats.p99_latency_ms} ms</span>
                    </div>
                    <div style={{ background: '#02040b', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '4px' }}>GPU Load</span>
                      <span style={{ fontSize: '20px', fontWeight: '900', color: '#8b5cf6', fontFamily: 'var(--font-mono)' }}>{tritonStats.gpu_utilization}%</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#02040b', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '12px', padding: '14px 20px', marginTop: '20px', fontSize: '13.5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}><Zap size={14} color="#fbbf24"/> <span style={{ color: 'var(--text-muted)' }}>Dynamic Batch Size:</span> <span style={{ fontWeight: '800', color: '#fff' }}>{tritonStats.dynamic_batch_size}</span></div>
                    <div style={{ fontWeight: '600' }}><span style={{ color: 'var(--text-muted)' }}>Queue Latency:</span> <span style={{ fontWeight: '800', color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>{tritonStats.queue_latency_ms} ms</span></div>
                  </div>
                </div>

                {/* Queue simulation */}
                <div className="glass-panel">
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '14px' }}>Triton Dynamic Batching Pipeline</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px', lineHeight: '1.6' }}>
                    Groups incoming client requests in a 5ms window, running them in parallel inside the TensorRT/XGBoost kernel.
                  </p>

                  <div className="batch-pipeline">
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.5px' }}>CONCURRENCY QUEUE</div>
                    <div className="batch-queue-group">
                      {Array.from({ length: Math.min(6, concurrency) }).map((_, i) => (
                        <div key={i} className="batch-request-node">
                          req_{200 + i}
                        </div>
                      ))}
                      {concurrency > 6 && <span style={{ fontSize: '11px', color: '#00bfff', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>+{concurrency - 6}</span>}
                    </div>
                    
                    <div style={{ borderLeft: '2px dashed rgba(255,255,255,0.15)', height: '32px' }} />
                    
                    <div style={{ background: '#8b5cf6', border: '1px solid #a78bfa', color: '#fff', fontSize: '11.5px', padding: '12px 18px', borderRadius: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', boxShadow: '0 4px 12px rgba(139,92,246,0.2)' }}>
                      Batch Node (n={tritonStats.dynamic_batch_size})
                    </div>
                    
                    <div style={{ borderLeft: '2px dashed rgba(255,255,255,0.15)', height: '32px' }} />
                    
                    <div style={{ background: '#10b981', border: '1px solid #34d399', color: '#fff', fontSize: '11.5px', padding: '12px 18px', borderRadius: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}>
                      TRT GPU Kernel
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DRIFT OBSERVATORY */}
        {activeTab === 'drift' && (
          <div className="fade-in">
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.5px' }}>Evidently AI Data Drift Monitor</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
                Computes Wasserstein Distance on real-time prediction request distribution profiles compared against baseline model training curves.
              </p>
            </div>

            {isDriftInjected && (
              <div className="fade-in" style={{ 
                background: 'rgba(239, 68, 68, 0.15)', 
                border: '1.5px solid #ef4444', 
                borderRadius: '16px', 
                padding: '24px 28px', 
                marginBottom: '32px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 0 30px rgba(239, 68, 68, 0.18)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <AlertTriangle color="#ef4444" size={36} style={{ filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.5))' }} />
                  <div>
                    <h3 style={{ fontSize: '17px', color: '#ef4444', fontWeight: '900', letterSpacing: '0.5px' }}>SILENT DATA COVARIATE DRIFT ALARM</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.5', fontWeight: '500' }}>
                      Credit scoring profile Wasserstein distance exceeded safe threshold (0.15). Accuracy degradation risk is high. Autopilot retraining has triggered.
                    </p>
                  </div>
                </div>
                {retrainTriggered && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#00bfff', fontWeight: '800', fontSize: '14.5px', background: 'rgba(0,191,255,0.08)', padding: '10px 20px', borderRadius: '50px', border: '1px solid rgba(0,191,255,0.25)', boxShadow: '0 0 15px rgba(0,191,255,0.1)' }}>
                    <RefreshCw size={16} className="animate-spin" /> Autopilot Retrain Loop Active
                  </div>
                )}
              </div>
            )}

            <div className="grid-2">
              {/* Drift Index & Features */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Statistical Wasserstein Distance</h3>
                  <button 
                    className="primary-btn" 
                    onClick={handleInjectDrift}
                    disabled={isDriftInjected}
                  >
                    Inject Drifted Data
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '14px 10px', fontWeight: '800' }}>Feature Name</th>
                        <th style={{ padding: '14px 10px', fontWeight: '800' }}>Baseline Mean</th>
                        <th style={{ padding: '14px 10px', fontWeight: '800' }}>Production Mean</th>
                        <th style={{ padding: '14px 10px', fontWeight: '800' }}>Wasserstein</th>
                        <th style={{ padding: '14px 10px', fontWeight: '800' }}>Drift Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {driftMetrics && Object.entries(driftMetrics.features).map(([name, data]) => {
                        const isDrifted = data.wasserstein > driftMetrics.drift_threshold;
                        return (
                          <tr key={name} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '16px 10px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: '#fff' }}>{name}</td>
                            <td style={{ padding: '16px 10px', fontWeight: '500' }}>{data.ref_mean.toFixed(2)}</td>
                            <td style={{ padding: '16px 10px', fontWeight: '500' }}>{data.prod_mean.toFixed(2)}</td>
                            <td style={{ padding: '16px 10px', fontFamily: 'var(--font-mono)', color: isDrifted ? '#ef4444' : '#10b981', fontWeight: '800' }}>
                              {data.wasserstein.toFixed(4)}
                            </td>
                            <td style={{ padding: '16px 10px' }}>
                              <span style={{ 
                                fontSize: '10px', 
                                fontWeight: '800', 
                                color: isDrifted ? '#ef4444' : '#10b981',
                                background: isDrifted ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
                                padding: '3px 12px',
                                borderRadius: '50px',
                                border: isDrifted ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(16,185,129,0.2)',
                                letterSpacing: '0.5px'
                              }}>
                                {isDrifted ? 'COVARIATE DRIFT' : 'STABLE'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* History metrics */}
                <div style={{ marginTop: '10px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '16px', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>HISTORICAL DRIFT TREND (WASSERSTEIN)</h4>
                  <div style={{ padding: '20px', background: '#02040b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                    {driftMetrics && renderDriftTrendSVG(driftMetrics.drift_history)}
                  </div>
                </div>
              </div>

              {/* Distribution comparison Curves */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '14px' }}>Distribution Shift (Credit Score Profile)</h3>

                {driftMetrics && (
                  <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                    {renderSVGHistogram(driftMetrics.reference_data.credit_score, driftMetrics.production_data.credit_score)}
                  </div>
                )}

                <div className="chart-legend" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '20px' }}>
                  <div className="legend-item">
                    <span className="legend-color" style={{ background: '#8b5cf6', border: '1px solid #a78bfa' }} />
                    Reference (Baseline Model Training Curves)
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ background: 'rgba(0, 191, 255, 0.6)', border: '1px solid #00bfff' }} />
                    Production Inputs (Real-time serving logs)
                  </div>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic', textAlign: 'center', lineHeight: '1.6', background: '#02040b', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)', margin: '0' }}>
                  * Injected covariate drift drops baseline scores. Evidently AI detects the divergence and automatically dispatches a Kubeflow training run to realign decision boundaries on EKS.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Inline fallback for HistoryIcon since lucide-react might map it differently
function HistoryIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
      <path d="M12 7v5l4 2"/>
    </svg>
  );
}

export default App;
