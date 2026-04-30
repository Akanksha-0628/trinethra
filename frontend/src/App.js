import { useState } from "react";

const API_URL = "http://localhost:3001";

const SAMPLE_TRANSCRIPT = `Karthik? Haan, he is good. Very sincere boy. Comes on time, leaves on time — actually he stays late most days, I don't ask him to. He's always on the floor. He's not one of those people who sits in the office and sends emails. He's hands-on.

What does he do? He helps me with production tracking. Earlier I used to maintain everything in my head — how many pieces came off each machine, what's the rejection rate, what's pending for dispatch. Now Karthik maintains a sheet. Every evening he updates it and sends it to me on WhatsApp. Very useful. I look at it every morning before the shift meeting.

He also handles a lot of the coordination. When we have quality complaints from Tier 1 — they send an email, sometimes call directly — Karthik takes the first call. He notes down the complaint, talks to the QC team, and gives me a summary. Earlier I used to handle all of this myself. Big relief.

The new drum brake line — he's been involved from the beginning. He helped set up the machine layout. He did a study on cycle times and suggested we move the deburring station closer to the CNC machines. Good idea. We did it. Saved maybe 10 minutes per batch in material handling.

Any complaints? No, not really. Sometimes he asks too many questions. But this is a minor thing. He doesn't really push back. If I tell him to do something, he does it. Even if it's not the best way.

Overall I'm happy. He's become part of the team. The workers on the floor know him. He speaks to them in Marathi — that helps.`;

const scoreColor = (val) => {
  if (val <= 3) return { bg: "#fff0f0", border: "#ffcccc", text: "#c0392b", circle: "#e74c3c" };
  if (val <= 6) return { bg: "#fff8ee", border: "#ffe0b2", text: "#e65100", circle: "#f39c12" };
  return { bg: "#f0fff4", border: "#c3e6cb", text: "#155724", circle: "#27ae60" };
};

const signalColors = {
  positive: { bg: "#f0fff4", border: "#27ae60", text: "#155724", dot: "#27ae60" },
  negative: { bg: "#fff0f0", border: "#e74c3c", text: "#721c24", dot: "#e74c3c" },
  neutral: { bg: "#f8f9fa", border: "#adb5bd", text: "#495057", dot: "#6c757d" }
};

const dimensionLabel = (d) => d?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

const ScoreMeter = ({ value }) => {
  const c = scoreColor(value);
  const pct = (value / 10) * 100;
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ position: "relative", width: 140, height: 140 }}>
      <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="#e9ecef" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={c.circle} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)", textAlign: "center"
      }}>
        <div style={{ fontSize: 36, fontWeight: 800, color: c.circle, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>out of 10</div>
      </div>
    </div>
  );
};

const Tag = ({ label, color, bg, border }) => (
  <span style={{
    background: bg || "#f0f4ff",
    color: color || "#1a1a2e",
    border: `1px solid ${border || "#d0d9ff"}`,
    borderRadius: 20,
    padding: "3px 12px",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    display: "inline-block"
  }}>{label}</span>
);

const Section = ({ title, emoji, subtitle, children, accent }) => (
  <div style={{
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #eef0f4",
    overflow: "hidden",
    marginBottom: 20,
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
  }}>
    <div style={{
      padding: "18px 24px 14px",
      borderBottom: "1px solid #f0f2f5",
      borderLeft: `4px solid ${accent || "#1a1a2e"}`,
      background: "#fafbfc"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>{emoji}</span>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>{title}</h3>
          {subtitle && <p style={{ margin: 0, fontSize: 12, color: "#8892b0", marginTop: 2 }}>{subtitle}</p>}
        </div>
      </div>
    </div>
    <div style={{ padding: "20px 24px" }}>{children}</div>
  </div>
);

export default function App() {
  const [transcript, setTranscript] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const runAnalysis = async () => {
    if (!transcript.trim()) { setError("Please paste a transcript first."); return; }
    setLoading(true); setError(""); setAnalysis(null);
    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sc = analysis ? scoreColor(analysis.score.value) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f7", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* Topbar */}
      <div style={{
        background: "linear-gradient(135deg, #0f0c29, #1a1a2e, #16213e)",
        padding: "0 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64, boxShadow: "0 2px 20px rgba(0,0,0,0.3)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
          }}>👁️</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 17, letterSpacing: 0.5 }}>Trinethra</div>
            <div style={{ color: "#8892b0", fontSize: 11 }}>Supervisor Feedback Analyzer</div>
          </div>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20, padding: "4px 14px", color: "#8892b0", fontSize: 12
        }}>DeepThought · Trinethra Module</div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px" }}>

        {/* Input */}
        <div style={{
          background: "#fff", borderRadius: 16, border: "1px solid #eef0f4",
          overflow: "hidden", marginBottom: 24,
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
        }}>
          <div style={{
            padding: "16px 24px", background: "#fafbfc",
            borderBottom: "1px solid #f0f2f5", borderLeft: "4px solid #4f46e5"
          }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>
              📋 Supervisor Transcript
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8892b0" }}>
              Paste the full supervisor call transcript — AI will extract evidence, score, gaps & follow-up questions
            </p>
          </div>
          <div style={{ padding: 24 }}>
            <textarea
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              placeholder="Paste supervisor transcript here..."
              style={{
                width: "100%", height: 180, padding: 14,
                borderRadius: 10, border: "1.5px solid #e2e8f0",
                fontSize: 14, resize: "vertical", fontFamily: "inherit",
                boxSizing: "border-box", outline: "none", color: "#333",
                lineHeight: 1.6, transition: "border 0.2s",
                background: "#fafbfc"
              }}
              onFocus={e => e.target.style.borderColor = "#4f46e5"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              <button onClick={runAnalysis} disabled={loading} style={{
                background: loading ? "#a0aec0" : "linear-gradient(135deg, #4f46e5, #7c3aed)",
                color: "#fff", border: "none", borderRadius: 10,
                padding: "12px 28px", fontSize: 14, fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 14px rgba(79,70,229,0.4)",
                transition: "all 0.2s"
              }}>
                {loading ? "⏳ Analyzing..." : "🔍 Run Analysis"}
              </button>
              <button onClick={() => setTranscript(SAMPLE_TRANSCRIPT)} style={{
                background: "#f8fafc", color: "#4f46e5",
                border: "1.5px solid #e0e7ff", borderRadius: 10,
                padding: "12px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer"
              }}>📄 Load Sample</button>
              {analysis && (
                <button onClick={() => { setAnalysis(null); setTranscript(""); }} style={{
                  background: "#fff5f5", color: "#e53e3e",
                  border: "1.5px solid #fed7d7", borderRadius: 10,
                  padding: "12px 20px", fontSize: 14, cursor: "pointer"
                }}>🗑 Clear</button>
              )}
              {transcript && (
                <span style={{ alignSelf: "center", fontSize: 12, color: "#a0aec0", marginLeft: "auto" }}>
                  {transcript.split(" ").filter(Boolean).length} words
                </span>
              )}
            </div>
            {error && (
              <div style={{
                marginTop: 14, padding: "12px 16px",
                background: "#fff5f5", border: "1px solid #fed7d7",
                borderRadius: 10, color: "#c53030", fontSize: 13,
                display: "flex", alignItems: "center", gap: 8
              }}>⚠️ {error}</div>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{
            textAlign: "center", padding: "48px 24px",
            background: "#fff", borderRadius: 16, border: "1px solid #eef0f4",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
          }}>
            <div style={{ fontSize: 40, marginBottom: 16, animation: "spin 2s linear infinite" }}>🧠</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#1a1a2e", marginBottom: 8 }}>
              Analyzing transcript with Ollama...
            </div>
            <div style={{ fontSize: 13, color: "#8892b0" }}>
              Extracting evidence · Mapping KPIs · Identifying gaps · Generating questions
            </div>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 6 }}>
              {["Extracting evidence", "Mapping KPIs", "Scoring", "Finding gaps"].map((s, i) => (
                <div key={i} style={{
                  background: "#f0f4ff", color: "#4f46e5",
                  border: "1px solid #e0e7ff", borderRadius: 20,
                  padding: "4px 12px", fontSize: 11, fontWeight: 500
                }}>{s}</div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {analysis && (
          <>
            {/* Score Banner */}
            <div style={{
              background: sc.bg, border: `1px solid ${sc.border}`,
              borderRadius: 16, padding: "24px 32px", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 32,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
            }}>
              <ScoreMeter value={analysis.score.value} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: sc.text }}>
                    {analysis.score.label}
                  </div>
                  <Tag label={analysis.score.band}
                    color={sc.text} bg={sc.bg} border={sc.border} />
                  <Tag
                    label={`${analysis.score.confidence} confidence`}
                    color={analysis.score.confidence === "high" ? "#155724" : analysis.score.confidence === "medium" ? "#856404" : "#721c24"}
                    bg={analysis.score.confidence === "high" ? "#f0fff4" : analysis.score.confidence === "medium" ? "#fff8ee" : "#fff0f0"}
                    border={analysis.score.confidence === "high" ? "#c3e6cb" : analysis.score.confidence === "medium" ? "#ffe0b2" : "#ffcccc"}
                  />
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 14, color: "#555", lineHeight: 1.7 }}>
                  {analysis.score.justification}
                </p>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "#fff3cd", border: "1px solid #ffc107",
                  borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#856404"
                }}>
                  ⚠️ AI draft — review all evidence before finalizing
                </div>
              </div>
            </div>

            {/* Score Bar */}
            <div style={{
              background: "#fff", borderRadius: 12, padding: "16px 24px",
              marginBottom: 20, border: "1px solid #eef0f4"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11, color: "#8892b0", fontWeight: 600 }}>
                <span>NEED ATTENTION (1–3)</span>
                <span>PRODUCTIVITY (4–6)</span>
                <span>PERFORMANCE (7–10)</span>
              </div>
              <div style={{ position: "relative", height: 8, background: "#e9ecef", borderRadius: 4 }}>
                <div style={{
                  position: "absolute", left: 0, top: 0, height: "100%",
                  width: `${(analysis.score.value / 10) * 100}%`,
                  background: `linear-gradient(90deg, #e74c3c, #f39c12, #27ae60)`,
                  borderRadius: 4, transition: "width 1s ease"
                }} />
                <div style={{
                  position: "absolute", top: "50%", transform: "translateY(-50%)",
                  left: `calc(${(analysis.score.value / 10) * 100}% - 8px)`,
                  width: 16, height: 16, borderRadius: "50%",
                  background: sc.circle, border: "2px solid #fff",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: "#adb5bd" }}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <span key={n} style={{ fontWeight: n === analysis.score.value ? 700 : 400, color: n === analysis.score.value ? sc.circle : "#adb5bd" }}>{n}</span>
                ))}
              </div>
            </div>

            {/* Evidence */}
            <Section title="Extracted Evidence" emoji="🔍" accent="#4f46e5"
              subtitle="Specific quotes from transcript mapped to assessment dimensions">
              {analysis.evidence?.map((e, i) => {
                const sc2 = signalColors[e.signal] || signalColors.neutral;
                return (
                  <div key={i} style={{
                    border: `1px solid ${sc2.border}`,
                    borderLeft: `4px solid ${sc2.dot}`,
                    borderRadius: 10, padding: 16, marginBottom: 12,
                    background: sc2.bg
                  }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                      <Tag label={e.signal} color={sc2.text} bg={sc2.bg} border={sc2.border} />
                      <Tag label={dimensionLabel(e.dimension)} color="#3730a3" bg="#eef2ff" border="#c7d2fe" />
                    </div>
                    <p style={{ fontSize: 14, color: "#1a1a2e", fontStyle: "italic", margin: "0 0 10px", lineHeight: 1.6, borderLeft: "2px solid #dee2e6", paddingLeft: 12 }}>
                      "{e.quote}"
                    </p>
                    <p style={{ fontSize: 13, color: "#555", margin: 0, display: "flex", gap: 6, alignItems: "flex-start" }}>
                      <span>💡</span><span>{e.interpretation}</span>
                    </p>
                  </div>
                );
              })}
            </Section>

            {/* KPI Mapping */}
            <Section title="KPI Mapping" emoji="📊" accent="#0ea5e9"
              subtitle="Business KPIs connected to Fellow's work">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {analysis.kpiMapping?.map((k, i) => (
                  <div key={i} style={{
                    background: "#f8fafc", border: "1px solid #e2e8f0",
                    borderRadius: 10, padding: 14
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>{k.kpi}</div>
                      <Tag
                        label={k.systemOrPersonal === "system" ? "🔧 System" : "👤 Personal"}
                        color={k.systemOrPersonal === "system" ? "#155724" : "#856404"}
                        bg={k.systemOrPersonal === "system" ? "#f0fff4" : "#fff8ee"}
                        border={k.systemOrPersonal === "system" ? "#c3e6cb" : "#ffe0b2"}
                      />
                    </div>
                    <p style={{ fontSize: 13, color: "#666", margin: 0, lineHeight: 1.5 }}>{k.evidence}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Gaps */}
            <Section title="Gap Analysis" emoji="⚠️" accent="#f59e0b"
              subtitle="Dimensions the transcript did NOT cover — need follow-up">
              {analysis.gaps?.map((g, i) => (
                <div key={i} style={{
                  background: "#fffbeb", border: "1px solid #fde68a",
                  borderLeft: "4px solid #f59e0b",
                  borderRadius: 10, padding: 16, marginBottom: 12
                }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#92400e", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>🔸</span>
                    <span>{dimensionLabel(g.dimension)}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "#78350f", margin: 0, lineHeight: 1.6 }}>{g.detail}</p>
                </div>
              ))}
            </Section>

            {/* Follow-up Questions */}
            <Section title="Suggested Follow-up Questions" emoji="❓" accent="#8b5cf6"
              subtitle="Ask these in the next call to fill the gaps above">
              {analysis.followUpQuestions?.map((q, i) => (
                <div key={i} style={{
                  background: "#faf5ff", border: "1px solid #e9d5ff",
                  borderLeft: "4px solid #8b5cf6",
                  borderRadius: 10, padding: 16, marginBottom: 12
                }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e", marginBottom: 8 }}>
                    <span style={{
                      background: "#8b5cf6", color: "#fff",
                      borderRadius: "50%", width: 22, height: 22,
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, marginRight: 8
                    }}>{i + 1}</span>
                    {q.question}
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#6b7280" }}>
                    <span><strong style={{ color: "#8b5cf6" }}>Targets:</strong> {dimensionLabel(q.targetGap)}</span>
                    <span><strong style={{ color: "#8b5cf6" }}>Looking for:</strong> {q.lookingFor}</span>
                  </div>
                </div>
              ))}
            </Section>
          </>
        )}
      </div>
    </div>
  );
}