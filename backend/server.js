const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = 'llama3.2';

const rubric = {
  bands: [
    { range: [1,3], label: "Need Attention", levels: [
      { score: 1, label: "Not Interested", signals: ["Disengaged", "No effort"] },
      { score: 2, label: "Lacks Discipline", signals: ["Waits for instructions", "No self-direction"] },
      { score: 3, label: "Motivated but Directionless", signals: ["Enthusiastic but unfocused"] }
    ]},
    { range: [4,6], label: "Productivity", levels: [
      { score: 4, label: "Careless and Inconsistent", signals: ["Inconsistent quality"] },
      { score: 5, label: "Consistent Performer", signals: ["Reliable", "Does what's asked"] },
      { score: 6, label: "Reliable and Productive", signals: ["High trust", "Give task and forget"] }
    ]},
    { range: [7,10], label: "Performance", levels: [
      { score: 7, label: "Problem Identifier", signals: ["Spots patterns", "Flags issues proactively"] },
      { score: 8, label: "Problem Solver", signals: ["Builds solutions", "Creates tools or processes"] },
      { score: 9, label: "Innovative and Experimental", signals: ["Tests multiple approaches", "Builds new tools"] },
      { score: 10, label: "Exceptional Performer", signals: ["Flawless execution", "Others learn from their work"] }
    ]}
  ],
  criticalBoundary: "Score 6 = does tasks assigned by others reliably. Score 7 = identifies NEW problems supervisor never asked about."
};

const kpis = [
  { id: "lead_generation", label: "Lead Generation" },
  { id: "lead_conversion", label: "Lead Conversion" },
  { id: "upselling", label: "Upselling" },
  { id: "cross_selling", label: "Cross-selling" },
  { id: "nps", label: "NPS (Customer Satisfaction)" },
  { id: "pat", label: "PAT (Profitability)" },
  { id: "tat", label: "TAT (Turnaround Time)" },
  { id: "quality", label: "Quality (Defects/Rejections)" }
];

const dimensions = [
  { id: "execution", label: "Driving Execution", desc: "Getting things done on time, following up without reminders" },
  { id: "systems_building", label: "Building Systems", desc: "Creating tools, SOPs, trackers that persist after Fellow leaves" },
  { id: "kpi_impact", label: "KPI Impact", desc: "Connecting work to measurable business outcomes" },
  { id: "change_management", label: "Change Management", desc: "Getting people to adopt new processes, handling resistance" }
];

function buildPrompt(transcript) {
  return `You are an expert analyst evaluating DT Fellows placed in Indian manufacturing companies. Analyze the supervisor transcript and return ONLY valid JSON — no explanation, no markdown, no extra text before or after.

RUBRIC:
${JSON.stringify(rubric, null, 2)}

CRITICAL SCORING RULES:
- Score 6 = executes tasks defined by others reliably
- Score 7 = identifies NEW problems supervisor never asked about
- "Handles all my calls" = task absorption = score 5-6, NOT 8
- Being on floor all day = NOT systems building
- A tracker only Fellow maintains personally = NOT a real system
- Supervisor praise can hide task absorption — look for evidence carefully

KPIs (supervisors use plain language, map their words):
${kpis.map(k => `- ${k.id}: ${k.label}`).join('\n')}

DIMENSIONS to check for gaps:
${dimensions.map(d => `- ${d.id}: ${d.label} — ${d.desc}`).join('\n')}

TRANSCRIPT:
"${transcript}"

Return ONLY this JSON, nothing else:
{
  "score": {
    "value": <number 1-10>,
    "label": "<rubric label>",
    "band": "<Need Attention|Productivity|Performance>",
    "justification": "<2-3 sentences citing specific transcript evidence>",
    "confidence": "<low|medium|high>"
  },
  "evidence": [
    {
      "quote": "<exact short quote from transcript>",
      "signal": "<positive|negative|neutral>",
      "dimension": "<execution|systems_building|kpi_impact|change_management>",
      "interpretation": "<1 sentence: what this reveals, including any supervisor bias>"
    }
  ],
  "kpiMapping": [
    {
      "kpi": "<kpi label>",
      "evidence": "<what supervisor said that maps here>",
      "systemOrPersonal": "<system|personal>"
    }
  ],
  "gaps": [
    {
      "dimension": "<dimension id>",
      "detail": "<what was NOT mentioned and why it matters>"
    }
  ],
  "followUpQuestions": [
    {
      "question": "<specific question for next call>",
      "targetGap": "<dimension id>",
      "lookingFor": "<what a good answer would reveal>"
    }
  ]
}`;
}

app.post('/analyze', async (req, res) => {
  const { transcript } = req.body;

  if (!transcript || transcript.trim().length < 50) {
    return res.status(400).json({ error: 'Transcript too short. Please paste the full supervisor transcript.' });
  }

  try {
    const ollamaResponse = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt: buildPrompt(transcript),
        stream: false,
        options: { temperature: 0.2 }
      })
    });

    if (!ollamaResponse.ok) {
      throw new Error('Ollama not reachable. Please run: ollama serve');
    }

    const ollamaData = await ollamaResponse.json();
    let rawText = ollamaData.response || '';

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Model did not return valid JSON. Please try again.');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    res.json({ success: true, analysis });

  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', model: MODEL });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Trinethra backend running on http://localhost:${PORT}`);
});