import React, { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import { useApi } from '../context/ApiContext';
import {
  detectFraudNetwork, detectPattern, detectGeoAnomaly,
  generateFIUReport, generateFIUReportPDF, PATTERN_TYPES,
  normalizeTransactionForReport, normalizeNetworkForReport,
  normalizeGeoForReport, normalizePatternsForReport,
} from '../api/fraudApi';

const SectionBlock = ({ title, content, color }) => {
  if (!content || (typeof content === 'string' && !content.trim())) return null;
  const text = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ padding: '8px 16px', background: color || 'var(--primary)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}>{title}</div>
      <div style={{ padding: '16px', border: '1px solid var(--outline-variant)', borderTop: 'none', fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--on-surface)', whiteSpace: 'pre-wrap' }}>{text}</div>
    </div>
  );
};

const ReportGenerator = () => {
  const { transactionHistory, reportTarget, setReportTarget } = useApi();
  const [loading, setLoading] = useState(false);
  const [collectingLoading, setCollectingLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  // Raw collected data (before normalization)
  const [rawData, setRawData] = useState({
    transaction: null,
    network: null,
    patterns: [],
    geoResults: [],
  });
  const [collectStatus, setCollectStatus] = useState({});

  // Config
  const [analystName, setAnalystName] = useState('AI Auditor');
  const [entityName, setEntityName] = useState('Financial Institution');
  const [officerName, setOfficerName] = useState('Compliance Officer');

  // Stored payload for PDF reuse
  const [lastPayload, setLastPayload] = useState(null);

  // Auto-load from reportTarget if set (account-specific SAR)
  useEffect(() => {
    if (reportTarget) {
      setRawData(prev => ({ ...prev, transaction: reportTarget }));
      setCollectStatus(prev => ({
        ...prev,
        transaction: `✓ Account ${reportTarget.account} — ${reportTarget.decision} (pre-filled)`,
      }));
    }
  }, [reportTarget]);

  const clearTarget = () => {
    setReportTarget(null);
    setRawData(prev => ({ ...prev, transaction: null }));
    setCollectStatus(prev => {
      const next = { ...prev };
      delete next.transaction;
      return next;
    });
  };

  const collectAll = async () => {
    setCollectingLoading(true);
    setError(null);
    const status = {};
    const collected = { transaction: rawData.transaction, network: null, patterns: [], geoResults: [] };

    // 1. Transaction — use reportTarget if set, else latest from history
    if (collected.transaction) {
      status.transaction = `✓ Account ${collected.transaction.account} — ${collected.transaction.decision} (target)`;
    } else if (transactionHistory.length > 0) {
      collected.transaction = transactionHistory[0];
      status.transaction = `✓ Account ${transactionHistory[0].account} — ${transactionHistory[0].decision}`;
    } else {
      status.transaction = '⚠ No transaction checks available';
    }
    setCollectStatus({ ...status });

    // 2. Fraud network
    try {
      const network = await detectFraudNetwork();
      if (network.graph?.nodes?.length > 0) {
        collected.network = network;
        status.network = `✓ ${network.graph.nodes.length} nodes, ${network.graph.edges.length} edges`;
      } else {
        status.network = '⚠ No fraud network found';
      }
    } catch (e) {
      status.network = `✗ ${e.message}`;
    }
    setCollectStatus({ ...status });

    // 3. Patterns
    const detectedPatterns = [];
    for (const p of PATTERN_TYPES) {
      try {
        const data = await detectPattern(p.key);
        if (data.results?.length > 0) {
          detectedPatterns.push({ pattern: p.key, results: data.results });
          status[`pattern_${p.key}`] = `✓ ${p.label}: ${data.results.length} found`;
        } else {
          status[`pattern_${p.key}`] = `— ${p.label}: none`;
        }
      } catch (e) {
        status[`pattern_${p.key}`] = `✗ ${p.label}: ${e.message}`;
      }
      setCollectStatus({ ...status });
    }
    collected.patterns = detectedPatterns;

    // 4. Geo anomalies
    try {
      const geo = await detectGeoAnomaly();
      const results = geo.results || [];
      if (results.length > 0) {
        collected.geoResults = results;
        status.geo = `✓ ${results.length} accounts with anomalies`;
      } else {
        status.geo = '— No geographic anomalies';
      }
    } catch (e) {
      status.geo = `✗ ${e.message}`;
    }
    setCollectStatus({ ...status });

    setRawData(collected);
    setCollectingLoading(false);
  };

  /**
   * Build the FIUReportRequest payload matching the exact Pydantic schema
   */
  const buildPayload = () => {
    const payload = {
      analyst_name: analystName,
      reporting_entity_name: entityName,
      principal_officer_name: officerName,
    };

    // Normalize transaction data
    const normTxn = normalizeTransactionForReport(rawData.transaction);
    if (normTxn) payload.transaction_data = normTxn;

    // Normalize fraud network (limit nodes/edges)
    const normNet = normalizeNetworkForReport(rawData.network);
    if (normNet) payload.fraud_network = normNet;

    // Normalize patterns
    const normPat = normalizePatternsForReport(rawData.patterns);
    if (normPat.length > 0) payload.patterns = normPat;

    // Normalize geo anomalies (limit to 20)
    const normGeo = normalizeGeoForReport(rawData.geoResults);
    if (normGeo) payload.geo_anomalies = normGeo;

    return payload;
  };

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const payload = buildPayload();
      setLastPayload(payload);
      const data = await generateFIUReport(payload);
      setReport(data.report);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    setPdfLoading(true);
    setError(null);
    try {
      const payload = lastPayload || buildPayload();
      const blob = await generateFIUReportPDF(payload);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FIU_SAR_${report?.case_id || 'report'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    } finally {
      setPdfLoading(false);
    }
  };

  const hasData = rawData.transaction || rawData.network || rawData.patterns.length > 0 || rawData.geoResults.length > 0;

  return (
    <>
      <TopBar title="SAR Report Generator" subtitle={reportTarget ? `Account-Specific Report — ${reportTarget.account}` : 'FIU-IND Suspicious Transaction Report — Powered by AI'} />

      {/* ACCOUNT TARGET BANNER */}
      {reportTarget && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', marginBottom: '24px', background: 'rgba(173,198,255,0.08)', border: '1px solid var(--primary)', borderLeft: `4px solid ${reportTarget.decision === 'BLOCK' ? 'var(--error)' : reportTarget.decision === 'REVIEW' ? 'var(--status-warning)' : 'var(--secondary)'}` }}>
          <div style={{ flex: 1 }}>
            <div className="drawer-label" style={{ marginBottom: '4px' }}>📌 ACCOUNT-SPECIFIC SAR</div>
            <div style={{ fontSize: '0.85rem' }}>
              Generating report for <strong>{reportTarget.account}</strong> — Decision: <strong style={{ color: reportTarget.decision === 'BLOCK' ? 'var(--error)' : 'var(--secondary)' }}>{reportTarget.decision}</strong> — Risk: <strong>{(reportTarget.final_score * 100).toFixed(0)}%</strong>
            </div>
          </div>
          <button className="panel-btn" onClick={clearTarget} style={{ whiteSpace: 'nowrap' }}>✕ CLEAR TARGET</button>
        </div>
      )}

      <div className="grid-container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
          {/* MAIN COLUMN */}
          <div>
            {/* INTELLIGENCE COLLECTION */}
            <section className="main-panel glass" style={{ padding: '24px', marginBottom: '24px' }}>
              <div className="panel-header">
                <h3 className="panel-title">📡 INTELLIGENCE COLLECTION</h3>
                <button className="btn-primary" onClick={collectAll} disabled={collectingLoading}>
                  {collectingLoading ? '⏳ COLLECTING...' : '🔄 COLLECT ALL INTELLIGENCE'}
                </button>
              </div>
              <p className="meta-sub" style={{ margin: '12px 0 16px' }}>
                Fetches data from all TigerGraph detection endpoints to build the SAR report.
              </p>

              {Object.entries(collectStatus).length > 0 && (
                <div style={{ marginTop: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                  {Object.entries(collectStatus).map(([key, val]) => (
                    <div key={key} style={{ padding: '6px 0', borderBottom: '1px solid var(--outline-variant)', fontSize: '0.8rem', display: 'flex', gap: '8px' }}>
                      <span style={{ minWidth: '140px', color: 'var(--primary)', fontWeight: 600 }}>{key.replace('pattern_', '').toUpperCase()}</span>
                      <span style={{ color: val.startsWith('✓') ? 'var(--secondary)' : val.startsWith('✗') ? 'var(--error)' : 'var(--on-surface-variant)' }}>{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* GENERATE BUTTONS */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <button className="btn-primary" onClick={generateReport} disabled={loading || !hasData} style={{ padding: '14px 28px' }}>
                {loading ? '⏳ GENERATING REPORT...' : '📄 GENERATE SAR REPORT'}
              </button>
              {report && (
                <button className="btn-primary" onClick={downloadPDF} disabled={pdfLoading} style={{ padding: '14px 28px', borderColor: 'var(--secondary)', color: 'var(--secondary)' }}>
                  {pdfLoading ? '⏳ GENERATING PDF...' : '📥 DOWNLOAD PDF'}
                </button>
              )}
            </div>

            {error && <div style={{ padding: '12px 16px', background: 'rgba(255,45,85,0.08)', border: '1px solid var(--error)', marginBottom: '24px', fontSize: '0.8rem', color: 'var(--error)', whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto' }}>⚠ {error}</div>}

            {/* RENDERED REPORT */}
            {report && (
              <section className="main-panel glass" style={{ padding: '24px' }}>
                <div style={{ padding: '16px', background: 'var(--surface-container)', textAlign: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '0.1em', margin: '0 0 4px' }}>FIU-IND OFFICIAL STR REPORT</h2>
                  <p className="meta-sub" style={{ fontSize: '0.7rem' }}>CONFIDENTIAL — FOR REGULATORY USE ONLY</p>
                </div>

                {/* METADATA */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px', fontSize: '0.8rem' }}>
                  <div><span className="meta-sub">Case ID:</span> <strong>{report.case_id}</strong></div>
                  <div><span className="meta-sub">Report Date:</span> <strong>{report.report_date}</strong></div>
                  <div><span className="meta-sub">Report Type:</span> <strong>{report.report_type}</strong></div>
                  <div><span className="meta-sub">Risk Level:</span> <strong style={{ color: report.risk_level === 'CRITICAL' ? 'var(--error)' : report.risk_level === 'HIGH' ? '#ff9500' : 'var(--secondary)' }}>{report.risk_level}</strong></div>
                </div>

                <SectionBlock title="SECTION 1: REPORTING ENTITY DETAILS" content={report.reporting_entity_details} color="#0D1B2A" />
                <SectionBlock title="SECTION 2: PRINCIPAL OFFICER DETAILS" content={report.principal_officer_details} color="#0D1B2A" />
                <SectionBlock title="SECTION 3: BASIS FOR SUSPICION" content={report.reason_for_suspicion} color="#C0392B" />
                <SectionBlock title="SECTION 4: TRANSACTION DETAILS" content={report.transaction_details} color="#1B4F8A" />
                <SectionBlock title="SECTION 5: LINKED PERSONS / ENTITIES" content={report.linked_person_details} color="#1B4F8A" />
                <SectionBlock title="SUPPLEMENTARY: PATTERN ANALYSIS" content={report.pattern_analysis} color="#1B4F8A" />
                <SectionBlock title="SUPPLEMENTARY: NETWORK TOPOLOGY" content={report.network_analysis} color="#1B4F8A" />
                <SectionBlock title="SUPPLEMENTARY: GEOGRAPHIC ANALYSIS" content={report.geographic_analysis} color="#1B4F8A" />
                <SectionBlock title="SUPPLEMENTARY: RISK ASSESSMENT" content={report.risk_assessment} color="#C0392B" />
                <SectionBlock title="RECOMMENDED REGULATORY ACTIONS" content={report.recommended_actions} color="#1E8449" />
                <SectionBlock title="REGULATORY REFERENCES" content={report.regulatory_references} color="#BDC3C7" />
                <SectionBlock title="TIPPING-OFF CONFIRMATION" content={report.tipping_off_confirmation} color="#C0392B" />

                <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--on-surface-variant)', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--outline-variant)' }}>
                  Generated by Detectra AI Engine | Confidential | {new Date().toISOString()}
                </div>
              </section>
            )}
          </div>

          {/* CONFIG SIDEBAR */}
          <aside>
            <section className="main-panel glass" style={{ padding: '24px', marginBottom: '24px' }}>
              <div className="drawer-label" style={{ marginBottom: '16px' }}>REPORT CONFIGURATION</div>
              <div className="config-field" style={{ marginBottom: '16px' }}>
                <label className="config-label">ANALYST NAME</label>
                <input className="config-input" value={analystName} onChange={e => setAnalystName(e.target.value)} />
              </div>
              <div className="config-field" style={{ marginBottom: '16px' }}>
                <label className="config-label">REPORTING ENTITY</label>
                <input className="config-input" value={entityName} onChange={e => setEntityName(e.target.value)} />
              </div>
              <div className="config-field">
                <label className="config-label">PRINCIPAL OFFICER</label>
                <input className="config-input" value={officerName} onChange={e => setOfficerName(e.target.value)} />
              </div>
            </section>

            <section className="main-panel glass" style={{ padding: '24px', marginBottom: '24px' }}>
              <div className="drawer-label" style={{ marginBottom: '16px' }}>DATA SOURCES</div>
              <div style={{ fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--outline-variant)' }}>
                  <span>Transaction Data</span>
                  <span style={{ color: rawData.transaction ? 'var(--secondary)' : 'var(--on-surface-variant)' }}>{rawData.transaction ? '✓' : '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--outline-variant)' }}>
                  <span>Fraud Network</span>
                  <span style={{ color: rawData.network ? 'var(--secondary)' : 'var(--on-surface-variant)' }}>{rawData.network ? '✓' : '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--outline-variant)' }}>
                  <span>Patterns</span>
                  <span style={{ color: rawData.patterns.length > 0 ? 'var(--secondary)' : 'var(--on-surface-variant)' }}>{rawData.patterns.length > 0 ? `✓ ${rawData.patterns.length}` : '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span>Geo Anomalies</span>
                  <span style={{ color: rawData.geoResults.length > 0 ? 'var(--secondary)' : 'var(--on-surface-variant)' }}>{rawData.geoResults.length > 0 ? `✓ ${rawData.geoResults.length}` : '—'}</span>
                </div>
              </div>
            </section>

            {/* PAYLOAD PREVIEW */}
            <section className="main-panel glass" style={{ padding: '24px' }}>
              <div className="drawer-label" style={{ marginBottom: '12px' }}>PAYLOAD PREVIEW</div>
              <p className="meta-sub" style={{ marginBottom: '8px' }}>Data being sent to Report AI (normalized):</p>
              {hasData ? (
                <div style={{ fontSize: '0.7rem', maxHeight: '250px', overflowY: 'auto' }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace', color: 'var(--on-surface-variant)' }}>
                    {JSON.stringify(buildPayload(), null, 2).slice(0, 2000)}
                    {JSON.stringify(buildPayload(), null, 2).length > 2000 ? '\n... (truncated)' : ''}
                  </pre>
                </div>
              ) : (
                <p className="meta-sub" style={{ fontSize: '0.7rem' }}>Collect intelligence first</p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </>
  );
};

export default ReportGenerator;
