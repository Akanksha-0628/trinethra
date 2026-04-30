# Trinethra — Supervisor Feedback Analyzer
### DeepThought Internship Assignment

## What it does
Trinethra takes a supervisor transcript as input, sends it to a local LLM (Ollama), and produces a structured analysis for psychology interns to review — including a rubric score (1-10), extracted evidence, KPI mapping, gap analysis, and follow-up questions.

## Tech Stack
- **Frontend:** React.js
- **Backend:** Node.js + Express
- **LLM:** Ollama (llama3.2) — runs locally, no cloud API

## Setup Instructions

### 1. Install Ollama
Download from https://ollama.com and install. Then pull the model:
```bash
ollama pull llama3.2
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 4. Run the App

**Terminal 1 — Backend:**
```bash
cd backend
node server.js
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```

Open http://localhost:3000 in your browser.

## Architecture
- **Frontend** (React, port 3000) — textarea for transcript input, displays analysis results in 5 sections
- **Backend** (Express, port 3001) — receives transcript, builds prompt with rubric + KPI definitions, sends to Ollama, parses JSON response
- **Ollama** (port 11434) — runs llama3.2 locally, returns structured analysis

## Ollama Model Used
**llama3.2 (3B)** — chosen because it runs efficiently on most laptops (8GB RAM), returns consistent JSON output, and handles nuanced scoring instructions well.

## Design Challenges Tackled

### Challenge 1: Structured Output Reliability
LLMs don't always return clean JSON. Solution: used regex to extract JSON from response (`rawText.match(/\{[\s\S]*\}/)`), set low temperature (0.2) for consistency, and added clear prompt instructions to return ONLY JSON.

### Challenge 2: Prompt Engineering for Accurate Scoring
The critical 6 vs 7 boundary required explicit instructions in the prompt — flagging supervisor biases (helpfulness bias, presence bias, halo effect) and distinguishing Layer 1 (task execution) from Layer 2 (systems building).

### Challenge 4: Showing Uncertainty
Added "AI draft — review all evidence before finalizing" warning on the score card, and confidence level (low/medium/high) so interns treat output as a draft, not a verdict.

## What I'd Improve With More Time
- Side-by-side view: transcript on left, analysis on right — intern can read original while reviewing findings
- Click a quote in Evidence section to highlight it in the original transcript
- Edit mode: intern can directly edit the suggested score and justification before saving
- Export to PDF button for sharing finalized assessments
- Better prompt engineering to fix scoring accuracy (currently scores slightly high)
