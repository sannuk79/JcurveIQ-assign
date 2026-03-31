# 🎬 Live Execution Walkthrough - Agent Run Panel

## ⏱️ REAL-TIME EXECUTION FLOW (Second by Second)

This document shows **exactly** what happens when you select "run_success" fixture.

---

### **0.0s - Run Starts**

```
┌─────────────────────────────────────────────────────────────┐
│ 🤖 Agent Run Panel                                          │
│ Query: "Analyse Apple R&D intensity vs large-cap peers..."  │
│ Status: [Running ●]  ⏱️ 0.0s                                │
└─────────────────────────────────────────────────────────────┘

LIVE Progress:
┌─────────────────────────────────────────────────────────────┐
│ 🔵 LIVE                              ⏱️ 0.0s                │
│ Progress: 0/0 tasks                                         │
│ [--------------------------------------------------] 0%     │
│ Current: Starting run...                                    │
└─────────────────────────────────────────────────────────────┘
```

**What user sees:**
- Blue pulsing dot (LIVE indicator)
- Timer starts at 0.0s
- "Starting run..." message

---

### **1.0s - Coordinator Thought**

```
┌─────────────────────────────────────────────────────────────┐
│ 🧠 Coordinator Plan (1 thought)                             │
│ ─────────────────────────────────────────────────────────── │
│ "Breaking into: (1) Apple 10-K fetch, (2) peer             │
│  identification, (3) parallel peer fetches, (4) synthesis." │
└─────────────────────────────────────────────────────────────┘

Current: 🧠 Coordinator: "Breaking into: (1) Apple 10-K fetch..."
```

**What user sees:**
- Amber section appears with coordinator's plan
- Shows the strategy before execution
- User understands what's coming

---

### **2.0s - Task t_001 Spawns**

```
┌─────────────────────────────────────────────────────────────┐
│ Task Execution (1 task)                                     │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ⏳ Fetch Apple 10-K filings (2019–2023)  [Running]      │ │
│ │ 🤖 filing_fetcher                                       │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

Current: 📋 Task spawned: Fetch Apple 10-K filings (2019–2023)
Progress: 0/1 tasks (0%)
```

**What user sees:**
- First task card appears
- Status: "Running" with hourglass icon
- Progress bar: 0/1 (0%)

---

### **3.0s - Tool Call Starts**

```
┌─────────────────────────────────────────────────────────────┐
│ ⏳ Fetch Apple 10-K filings (2019–2023)  [Running]          │
│ ─────────────────────────────────────────────────────────── │
│ Tool Calls:                                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ sec_edgar_search ⏳                                     │ │
│ │ Input: ticker=AAPL, form=10-K, years=2019–2023         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

Current: 🔧 Calling sec_edgar_search...
```

**What user sees:**
- Tool call appears inside task
- Shows what API is being called
- Pending status (hourglass)

---

### **5.0s - Tool Result Arrives**

```
┌─────────────────────────────────────────────────────────────┐
│ ⏳ Fetch Apple 10-K filings (2019–2023)  [Running]          │
│ ─────────────────────────────────────────────────────────── │
│ Tool Calls:                                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ sec_edgar_search ✓                                      │ │
│ │ Input: ticker=AAPL, form=10-K, years=2019–2023         │ │
│ │ Output: 5 filings found. Extracting R&D line items...  │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

Current: ✓ sec_edgar_search completed
```

**What user sees:**
- Green checkmark on tool
- Output summary appears
- Task still running (generating output)

---

### **7.0s - Partial Output Streams**

```
┌─────────────────────────────────────────────────────────────┐
│ ⏳ Fetch Apple 10-K filings (2019–2023)  [Running]          │
│ ─────────────────────────────────────────────────────────── │
│ Current Output ● Typing...                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Apple R&D spend: 2019 $16.2B → 2023 $29.9B (+84%)      │ │
│ │ [cursor blinking]                                       │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

Current: 📝 Streaming output...
```

**What user sees:**
- Text appears character by character (typing animation)
- "Typing..." badge visible
- Cursor blinks at end
- **Feels like watching AI write in real-time!**

---

### **8.0s - Three Parallel Tasks Spawn**

```
┌─────────────────────────────────────────────────────────────┐
│         ⚡ Parallel Execution [peer_fetches]                │
│         (3 tasks running simultaneously)                    │
│                     │                                       │
│    ┌────────────────┼────────────────┬────────────────┐    │
│    │                │                │                │    │
│ ┌──────┐        ┌──────┐        ┌──────┐               │    │
│ │⏳ t_002│        │⏳ t_003│        │⏳ t_004│               │    │
│ │Microsoft│       │Alphabet│       │Meta    │               │    │
│ │Running │       │Running │       │Running │               │    │
│ └──────┘        └──────┘        └──────┘               │    │
│    └────────────────┴────────────────┴────────────────┘    │
└─────────────────────────────────────────────────────────────┘

Current: 📋 Task spawned: Fetch Microsoft 10-K filings
Progress: 0/4 tasks (0%)
```

**What user sees:**
- **Visual connector lines** from header to tasks
- Three cards appear **side-by-side**
- "3 tasks running simultaneously" label
- **Clearly feels parallel!**

---

### **9.0s - 11.5s - Parallel Tool Calls Execute**

```
t_002 (Microsoft):  9.0s  - Calling sec_edgar_search
t_003 (Alphabet):   9.5s  - Calling sec_edgar_search
t_004 (Meta):      10.0s  - Calling sec_edgar_search

t_002 (Microsoft): 11.0s  - ✓ Completed
t_003 (Alphabet):  11.5s  - ✓ Completed
t_004 (Meta):      12.0s  - ❌ FAILED
```

**What user sees:**
- Each task updates independently
- Tool calls appear at different times
- Shows **real parallelism**

---

### **12.0s - t_004 FAILS**

```
┌─────────────────────────────────────────────────────────────┐
│ ✗ Fetch Meta 10-K filings (2019–2023)  [Failed]            │
│ ─────────────────────────────────────────────────────────── │
│ ⚠️ SEC EDGAR rate limit. Retrying in 15s.                  │
│                                                             │
│ 📜 Task Timeline (4 events):                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📍 12:00:08  Task spawned                              │ │
│ │ 🔧 12:00:10  Calling sec_edgar_search: ticker=META...  │ │
│ │ ✓  12:00:12  sec_edgar_search completed: Connection... │ │
│ │ ❌ 12:00:12  Failed: SEC EDGAR rate limit. Retrying... │ │ ← FAIL
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

Current: ❌ Task failed: SEC EDGAR rate limit. Retrying in 15s.
```

**What user sees:**
- Card turns **red**
- Error message visible
- **Timeline shows the failure**
- User knows it will retry

---

### **14.0s - t_004 RETRIES**

```
┌─────────────────────────────────────────────────────────────┐
│ 🔄 Fetch Meta 10-K filings (2019–2023)  [Retry #1]         │
│ ─────────────────────────────────────────────────────────── │
│ 📜 Task Timeline (5 events):                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ...previous events...                                   │ │
│ │ 🔄 12:00:14  running (retry #1): Retry attempt 1       │ │ ← RETRY
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

Current: 🔄 running (retry #1): Retry attempt 1
```

**What user sees:**
- Card turns **yellow**
- "Retry #1" badge
- Timeline shows retry event
- **Recovery is visible!**

---

### **15.0s - 16.5s - t_002, t_003 Complete**

```
┌─────────────────────────────────────────────────────────────┐
│ ✓ Fetch Microsoft 10-K  [Complete]  Score: 92%             │
│ ─────────────────────────────────────────────────────────── │
│ Final Output:                                               │
│ Microsoft R&D spend: 2019 $16.9B → 2023 $27.2B (+61%)      │
│ Intensity: 13.1% → 12.9%                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ✓ Fetch Alphabet 10-K  [Complete]  Score: 89%              │
│ ─────────────────────────────────────────────────────────── │
│ Final Output:                                               │
│ Alphabet R&D spend: 2019 $26.0B → 2023 $45.4B (+75%)       │
│ Intensity: 15.1% → 14.9%                                    │
└─────────────────────────────────────────────────────────────┘

Progress: 2/5 tasks (40%)
```

**What user sees:**
- Cards turn **green**
- Quality score badges appear
- Progress bar: 40%
- Two peers done, one still retrying

---

### **17.0s - t_004 CANCELLED (sufficient_data)**

```
┌─────────────────────────────────────────────────────────────┐
│ ⊘ Fetch Meta 10-K filings (2019–2023)  [Skipped]           │
│ ─────────────────────────────────────────────────────────── │
│ ℹ️ 3 of 4 peers fetched. Coordinator proceeding with        │
│   available data.                                           │
│                                                             │
│ 📜 Task Timeline (7 events):                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📍 12:00:08  Task spawned                              │ │
│ │ 🔧 12:00:10  Calling sec_edgar_search                 │ │
│ │ ✓  12:00:12  Tool completed                            │ │
│ │ ❌ 12:00:12  Failed: Rate limit                        │ │
│ │ 🔄 12:00:14  Retry #1                                  │ │
│ │ ❌ 12:00:16  Failed again                              │ │
│ │ ⊘ 12:00:17  Cancelled: 3 of 4 peers fetched...         │ │ ← CANCEL
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

Current: ⊘ Task cancelled: 3 of 4 peers fetched. Coordinator...
```

**What user sees:**
- Card turns **slate/gray** (NOT red!)
- "Skipped" label (NOT "Failed")
- Info icon ℹ️ (NOT warning ⚠️)
- **Feels like an optimization, not an error!**

---

### **18.0s - Coordinator Thought for Synthesis**

```
┌─────────────────────────────────────────────────────────────┐
│ 🧠 Coordinator Plan (2 thoughts)                            │
│ ─────────────────────────────────────────────────────────── │
│ "Breaking into: (1) Apple 10-K fetch..."                   │
│ "Synthesizing Apple analysis with peer comparisons..."     │
└─────────────────────────────────────────────────────────────┘

Current: 🧠 Coordinator: "Synthesizing Apple analysis..."
```

**What user sees:**
- Second thought appears
- Shows coordinator's reasoning
- User knows synthesis is starting

---

### **18.5s - t_005 (Synthesis) Spawns**

```
┌─────────────────────────────────────────────────────────────┐
│ ⏳ Synthesize comparative R&D analysis  [Running]           │
│ 🤖 synthesizer                                              │
│ 📎 Depends: t_001, t_002, t_003                            │
└─────────────────────────────────────────────────────────────┘

Current: 📋 Task spawned: Synthesize comparative R&D analysis
Progress: 2/5 tasks (40%)
```

**What user sees:**
- Dependency badges visible
- Task appears AFTER its dependencies completed
- **Logical order is clear!**

---

### **19.5s - t_005 Partial Output**

```
┌─────────────────────────────────────────────────────────────┐
│ ⏳ Synthesize comparative R&D analysis  [Running]           │
│ ─────────────────────────────────────────────────────────── │
│ Current Output ● Typing...                                  │
│ Drafting comparative analysis. Apple shows strong...        │
│ [cursor blinking]                                           │
└─────────────────────────────────────────────────────────────┘

Current: 📝 Streaming output...
```

**What user sees:**
- Typing animation again
- Synthesis is being written live

---

### **21.0s - t_005 Final Output**

```
┌─────────────────────────────────────────────────────────────┐
│ ✓ Synthesize comparative R&D analysis  [Complete]           │
│ ─────────────────────────────────────────────────────────── │
│ Final Output  Score: 95%                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Apple's R&D intensity has grown from 6.3% to 8.0% of   │ │
│ │ revenue (2019–2023), outpacing Microsoft (13.1% →      │ │
│ │ 12.9%) and Alphabet (15.1% → 14.9%) in absolute dollars│ │
│ │ but lagging in intensity...                             │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

Progress: 5/5 tasks (100%)
```

**What user sees:**
- Green card with 95% score
- Final analysis visible
- Progress: 100%

---

### **21.4s - RUN COMPLETE**

```
┌─────────────────────────────────────────────────────────────┐
│ ✅ Research Complete                                        │
│ Synthesized analysis ready for review                       │
│ ─────────────────────────────────────────────────────────── │
│ Analysis Summary:                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Apple's R&D intensity has grown from 6.3% to 8.0% of   │ │
│ │ revenue (2019–2023)...                                  │ │
│ │                                                         │ │
│ │ Key Findings:                                           │ │
│ │ • Apple: +84% absolute R&D spend ($16.2B → $29.9B)     │ │
│ │ • Microsoft: +61% ($16.9B → $27.2B)                    │ │
│ │ • Alphabet: +75% ($26.0B → $45.4B)                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 📚 Sources & Citations:                                     │
│ [c1] Apple 10-K 2023 — SEC EDGAR (p. 48)                   │
│ [c2] Microsoft 10-K 2023 — SEC EDGAR (p. 51)               │
│ [c3] Alphabet 10-K 2023 — SEC EDGAR (p. 42)                │
└─────────────────────────────────────────────────────────────┘

LIVE Progress:
┌─────────────────────────────────────────────────────────────┐
│ ✅ Complete                          ⏱️ 21.4s total         │
│ Current: ✅ Run complete! Review results below.             │
└─────────────────────────────────────────────────────────────┘
```

**What user sees:**
- **Prominent gradient section** at bottom
- Full analysis with citations
- Green status badge
- Total time: 21.4s
- **Task list becomes secondary** - final output is the star!

---

## 🎯 KEY UX IMPROVEMENTS

### **1. Live Progress Bar**
- Pulsing blue dot = feels alive
- Real-time timer
- Progress percentage
- Current activity message

### **2. Typing Animation**
- Text appears character by character
- Blinking cursor
- "Typing..." badge
- **Feels like watching AI think!**

### **3. Task Timeline**
- Every state change recorded
- Failed → Retry → Cancel chain visible
- User sees the **journey**, not just destination

### **4. Parallel Visual Design**
- Connector lines from header
- Side-by-side layout
- "running simultaneously" label
- **Clearly feels parallel!**

### **5. Cancelled State Treatment**
- Slate color (NOT red)
- "Skipped" label (NOT "Cancelled")
- Info icon (NOT warning)
- **Optimization, not error!**

---

## 🧠 Interview Talking Points

> "I designed the UI as a **real-time event stream projection**, not a static state display."

> "The **typing animation** creates a sense of liveness - users watch outputs being generated."

> "**Task history** preserves the full lifecycle, so users understand failures and retries."

> "**Parallel groups** use visual connectors to emphasize simultaneity."

> "**Cancelled with sufficient_data** is treated as a **neutral optimization**, not a failure."

> "The **progress bar** and **live indicator** give users a sense of forward momentum."

---

## ✅ Test Checklist

Run through this when testing:

- [ ] Blue pulsing dot visible when running
- [ ] Timer counts up in real-time
- [ ] Progress bar fills as tasks complete
- [ ] Typing animation on partial outputs
- [ ] Task timeline shows failed → retry → cancel
- [ ] Parallel group has connector lines
- [ ] Cancelled task is slate (not red)
- [ ] Final output is prominent
- [ ] Console shows events with timestamps

---

**This is what separates top 10% from average.** The difference is in the **details that create the "live" feel**.
