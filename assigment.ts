JcurveIQ — Frontend Engineer Take - Home Assessment
Role: Frontend Engineer(Early Career)
Time budget: 5–9 hours of focused work
Format: Take - home, async — submit via GitHub repo link or ZIP
Context
JcurveIQ runs AI research agents that analyse SEC filings, annual reports, earnings transcripts,
    and live market data on behalf of financial analysts.When a user submits a research query like
"Analyse Apple's R&D intensity vs peers over the last 5 years", a Coordinator agent breaks the
problem into sub - tasks, spawns specialised agents to work in parallel, handles failures and
retries, and synthesises a final research output.
This is not a chatbot.It is an orchestrated multi - agent pipeline — with tool calls, sub - task
dependencies, parallel execution, partial outputs mid - run, and recoverable failures.The user can
see it running in real time.
Right now we don't have a proper UI for watching one of these runs. Analysts see a spinner and
wait.That is the problem you are solving.
Your task is to build an Agent Run Panel — a UI component that shows a live agent run
unfolding in real time, makes the process legible to a non - technical analyst, and gives them
enough visibility to trust what the system is doing.
What You Should Build
A standalone React component: the Agent Run Panel.
A user lands on this panel after submitting a research query.They see the run play out — tasks
being spawned, tools being called, intermediate outputs appearing, failures being recovered,
    and a final result emerging.They should finish watching it with a clear sense of what the system
did and why they can trust the output.
Core Requirements
1. Run header — Show the original query and a top - level run status(running / complete /
    failed).Show elapsed time while running.
2. Task list — As tasks are spawned, they appear.Each task shows:
Its label
Which agent is handling it
Its current status
Tool calls made within it(when they occur)
Its output(when available)
3. Parallel task grouping — Some tasks carry a parallel_group identifier, meaning they
were spawned simultaneously as a group.Whether and how you visually distinguish grouped
parallel tasks from sequential ones is your design decision.Document it.
4. Task dependency awareness — Some tasks carry a depends_on array listing task IDs
they depend on.Your UI does not need to draw a graph, but the rendered output should not
contradict the execution order implied by dependencies.How you represent this(if at all
visibly) is your decision.Document it.
5. Partial outputs — During a run, tasks emit intermediate outputs before they are complete
    (is_final: false).These carry useful information.Whether and how you surface them is
your design decision.Document it.
6. Agent thoughts — The coordinator and some agents emit agent_thought events before
taking action — internal reasoning about what to do next.Think of these as the planner's
scratchpad.Whether and how you show them is your decision.Document it.
7. The cancelled status — A task may be cancelled mid - run with a reason:
"sufficient_data" field.This is not a failure — the coordinator decided it had enough
data from other tasks and stopped this one early.Your UI must reflect this in a way that does
not alarm the user.How is your decision.Document it.
8. Failure and retry — A task may transition to failed and then back to running(retry).
Show this sequence legibly.A task that fails permanently(never retries) should be clearly
distinguishable from one that failed and recovered.
9. Final output — When the run completes, the synthesised output should be the prominent,
    clearly - finished thing the user reads.It should not feel buried in the task list.
10. Empty / idle state — Show something useful when no run is active.
Intentionally Under - Specified Requirements
The following are deliberately left for you to decide.There is no single right answer.You must
make a decision, implement it, and explain your reasoning in DECISIONS.md.
Agent thoughts — Are they shown ? Always, on demand, or never ? Who is the user — a
developer debugging, or an analyst who wants results ?
    Parallel task layout — How do you show three things happening simultaneously in a vertical
list without it looking wrong ?
    Partial outputs(is_final: false) — Show inline as they arrive ? Collapse into a log ? Only
show the final output when it arrives and discard the intermediates ?
    cancelled with reason: "sufficient_data" — What label, colour, and icon does this
state get ? Is it positive, neutral, or negative ?
    Task dependency display — A synthesis task depends_on: ["t_001", "t_002",
        "t_003"] where t_004 was cancelled.Does the UI show an incomplete dependency or
does the completed synthesis implicitly resolve it ?
    Mock Event Stream Specification
You must build a local mock that replays a fixture event sequence with realistic timing.Use any
method you prefer — a small Node script with the ws package, a mock class in the browser, a
setTimeout - driven emitter, or an EventSource polyfill.Do not emit all events at the same
tick.The timing is part of the UX — users watching in real time should feel the run unfolding.
Event Types
run_started
agent_thought
1 {
    2 "type": "run_started",
        3 "run_id": "r_001",
            4 "query": "Analyse Apple R&D intensity vs large-cap peers (2019–
    2023) ",
    5 "timestamp": 1700000000000
    6
}
7
1 {
    2 "type": "agent_thought",
        3 "task_id": "coordinator",
            4 "thought": "Breaking into: (1) Apple 10-K fetch, (2) peer
    identification, (3) parallel peer fetches, (4) synthesis.",
    5 "timestamp": 1700000001000
    6
}
7
task_id may be "coordinator"(not a real task ID) or a spawned task's
ID.When task_id is null, the thought is system - level and not attached to
any task.
    task_spawned
spawned_by is either "coordinator" or another task's task_id .
parallel_group is a string identifier when tasks are spawned as a group,
    otherwise null.depends_on is an array of task_id strings this task
waits on before starting.
    tool_call
tool_result
1 {
    2 "type": "task_spawned",
        3 "task_id": "t_001",
            4 "label": "Fetch Apple 10-K filings (2019–2023)",
                5 "agent": "filing_fetcher",
                    6 "spawned_by": "coordinator",
                        7 "parallel_group": null,
                            8 "depends_on": [],
                                9 "timestamp": 1700000002000
    10
}
11
1 {
    2 "type": "tool_call",
        3 "task_id": "t_001",
            4 "tool": "sec_edgar_search",
                5 "input_summary": "ticker=AAPL, form=10-K, years=2019–2023",
                    6 "timestamp": 1700000003000
    7
}
8
1 {
    2 "type": "tool_result",
        3 "task_id": "t_001",
            4 "tool": "sec_edgar_search",
                5 "output_summary": "5 filings found. Extracting R&D line items...",
                    6 "timestamp": 1700000005000
    7
}
8
partial_output
When is_final: true, this is the task's completed output.
quality_score(0.0–1.0) is populated on final outputs, null on
intermediate ones.A task may emit zero, one, or multiple is_final:
false events before its final output.
    task_update
status is one of: running · complete · failed · cancelled
When status is cancelled, the event will include:
This is not a failure.The coordinator made an intentional decision.How you
represent this state visually is part of the assessment.
1 {
    2 "type": "partial_output",
        3 "task_id": "t_001",
            4 "content": "Apple R&D spend: 2019 $16.2B → 2023 $29.9B (+84%)",
                5 "is_final": false,
                    6 "quality_score": null,
                        7 "timestamp": 1700000007000
    8
}
9
1 {
    2 "type": "task_update",
        3 "task_id": "t_004",
            4 "status": "failed",
                5 "error": "SEC EDGAR rate limit. Retrying in 15s.",
                    6 "reason": null,
                        7 "message": null,
                            8 "timestamp": 1700000014000
    9
}
10
1 {
    2 "status": "cancelled",
        3 "reason": "sufficient_data",
            4 "message": "3 of 4 peers fetched. Coordinator proceeding with available
    data.",
    5 "error": null
    6
}
7
run_complete
run_error
Fixture Requirements
Build one complete fixture that covers the following sequence:
1. run_started
2. Coordinator agent_thought
3. One sequential task spawned(t_001) — fetching data for the primary subject
4. Tool call + tool result within t_001
5. partial_output from t_001 with is_final: false
6. Three tasks spawned simultaneously with the same parallel_group(t_002, t_003,
    t_004)
7. Tool calls and tool results across the parallel tasks(interleaved, not sequential)
8. t_004 transitions: running → failed(rate limit) → running(retry) → cancelled
    (sufficient_data)
1 {
    2 "type": "run_complete",
        3 "run_id": "r_001",
            4 "status": "complete",
                5 "duration_ms": 21400,
                    6 "task_count": 5,
                        7 "output": {
        8 "summary": "Apple's R&D intensity has grown from 6.3% to 8.0% of
        revenue(2019–2023), outpacing Microsoft(13.1 %→12.9 %) and Alphabet
            (15.1 %→14.9 %) in absolute dollars but lagging in intensity.Meta
represents the outlier...",
        9 "citations": [
            10 {
                "ref_id": "c1", "title": "Apple 10-K 2023", "source": "SEC
EDGAR", "page": 48 },
11 {
                "ref_id": "c2", "title": "Microsoft 10-K 2023", "source": "SEC
EDGAR", "page": 51 }
12 ]
        13
    },
    14 "timestamp": 1700000021400
    15
}
16
1 {
    2 "type": "run_error",
        3 "run_id": "r_001",
            4 "message": "Coordinator encountered an unrecoverable error. Partial
results may be available.",
    5 "timestamp": 1700000012000
    6
}
7
9. t_002 and t_003 complete with is_final: true partial outputs carrying
quality_score
10. A synthesis task(t_005) spawned with depends_on: ["t_001", "t_002", "t_003"]
    (note: t_004 is not in depends_on — the coordinator already handled it)
11. agent_thought from t_005 before it begins synthesis
12. partial_output from t_005 with is_final: false(streaming synthesis)
13. partial_output from t_005 with is_final: true
14. run_complete
Also build one error fixture that ends with run_error partway through, with some tasks
complete, one in flight, and one never started.
Stack Requirements
React(hooks, functional components)
Tailwind CSS for all styling
No pre - built UI component libraries(no shadcn, MUI, Ant Design, Radix compositions)
No backend — mock only
Vite recommended for setup
Deliverables
README.md must cover: how to run locally, how to switch between fixtures, and any known
gaps you'd address with more time.
DECISIONS.md must have one section for each of the five ambiguous requirements.Each
section: what you decided, why, and what signal or data would cause you to reconsider.One
paragraph minimum per decision.
Evaluation Criteria
1 /
    2 ├── src /
        3 ├── mock /
            4 │ ├── fixtures /
                5 │ │ ├── run_success.json
6 │ │ └── run_error.json
7 │ └── ... (your mock emitter)
8 ├── DECISIONS.md ← required
9 ├── README.md ← required
10 └── package.json
11
What We Are Not Evaluating
Pixel - perfect design — clear and intentional beats polished
Feature completeness — depth of execution on what's there beats breadth
Whether you used AI tools — we expect you to; we're evaluating whether you are driving the
product decisions
Agentic state modeling Does the component correctly
model the task lifecycle — including
cancelled, retry sequences, and
dependency relationships ?
    Information hierarchy Can an analyst understand what
happened at a glance ? Is the final
output the star, or is it buried ?
    Parallel execution legibility Does the parallel group look like
parallelism, or just three sequential
items ?
    Edge case handling cancelled with reason,
    task_id: null, is_final:
false followed by is_final:
true, depends_on where a
referenced task was cancelled
DECISIONS.md quality Is the reasoning specific and
genuine ? Does the code match
what was documented ?
    React structure State machine, component
decomposition, effect cleanup
Timing realism Does the mock make the run feel
live, or instant ?
    Dimension What we look at
Submission
Reply with a GitHub repo link or ZIP.Include a one - paragraph note in your email: what part of
the agentic state design you found hardest to make legible, and one thing about the event
schema you'd change to make the frontend easier to build.
That last part is not optional.