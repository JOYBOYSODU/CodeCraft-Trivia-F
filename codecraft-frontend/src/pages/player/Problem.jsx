import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { problemService } from "../../services/problemService";
import { submissionService } from "../../services/submissionService";
import { runCode, JUDGE0_LANGUAGES } from "../../services/judge0Service";
import Editor from "../../components/Editor";
import ContestTimer from "../../components/ContestTimer";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import {
    Play, Send, ChevronRight, ChevronDown, ChevronLeft,
    CheckCircle2, XCircle, AlertTriangle, Clock, Cpu,
    Lightbulb, Code2, FlaskConical, History, Maximize2, Minimize2,
} from "lucide-react";
import { contestService } from "../../services/contestService";

// ─── helpers ─────────────────────────────────────────────────────────────────
const safe = (val, fallback) => {
    if (val == null) return fallback;
    if (typeof val === "string") { try { return JSON.parse(val); } catch { return fallback; } }
    return val;
};

const DIFF_STYLE = {
    EASY: { bg: "rgba(0,175,85,0.1)", color: "#00AF55", border: "rgba(0,175,85,0.25)" },
    MEDIUM: { bg: "rgba(255,192,30,0.1)", color: "#FFC01E", border: "rgba(255,192,30,0.25)" },
    HARD: { bg: "rgba(255,55,95,0.1)", color: "#FF375F", border: "rgba(255,55,95,0.25)" },
};

const STATUS_BADGE = {
    3: { label: "Accepted", color: "#00AF55" },
    4: { label: "Wrong Answer", color: "#FF375F" },
    5: { label: "Time Limit", color: "#FFC01E" },
    6: { label: "Compilation Error", color: "#FFC01E" },
    7: { label: "Runtime Error", color: "#FF375F" },
    11: { label: "Runtime Error (NZEC)", color: "#FF375F" },
};

// ─── main component ───────────────────────────────────────────────────────────
export default function Problem() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const contestId = searchParams.get("contestId");

    const [problem, setProblem] = useState(null);
    const [contest, setContest] = useState(null);
    const [loading, setLoading] = useState(true);

    // editor
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState(JUDGE0_LANGUAGES[0]);

    // run / submit state
    const [runOutput, setRunOutput] = useState(null);   // { type:"run"|"submit", ...}
    const [running, setRunning] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [outputTab, setOutputTab] = useState("result"); // "result"|"console"

    // layout
    const [leftTab, setLeftTab] = useState("description");   // description|editorial|submissions
    const [outputOpen, setOutputOpen] = useState(false);
    const [hintsOpen, setHintsOpen] = useState(false);
    const [customInput, setCustomInput] = useState("");
    const [activeCase, setActiveCase] = useState(0);  // which sample case tab is selected
    const [editorExpanded, setEditorExpanded] = useState(false);

    const tabSwitchCount = useRef(0);
    const isContestLive = contest?.status === "LIVE";

    // ── load ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        const promises = [problemService.getProblem(id)];
        if (contestId) promises.push(contestService.getContest(contestId));
        Promise.all(promises)
            .then(([pRes, cRes]) => {
                const p = pRes.data?.problem ?? pRes.data;
                setProblem(p);
                if (cRes) setContest(cRes.data?.contest ?? cRes.data);
                const starter = p?.starter_code?.[JUDGE0_LANGUAGES[0].value] ?? "";
                setCode(starter);
                const cases = safe(p?.test_cases, []);
                if (cases[0]) setCustomInput(cases[0].input ?? "");
            })
            .catch(() => toast.error("Failed to load problem"))
            .finally(() => setLoading(false));
    }, [id, contestId]);

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        const starter = problem?.starter_code?.[lang.value] ?? "";
        if (starter) setCode(starter);
    };

    // ── anti-cheat ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isContestLive) return;
        const h = () => { if (document.hidden) { tabSwitchCount.current++; toast.error(`Tab switch #${tabSwitchCount.current}`); } };
        document.addEventListener("visibilitychange", h);
        return () => document.removeEventListener("visibilitychange", h);
    }, [isContestLive]);

    // ── Run (Judge0 – sample case only) ──────────────────────────────────────
    const handleRun = async () => {
        if (!code.trim()) { toast.error("Write some code first"); return; }
        setRunning(true);
        setOutputOpen(true);
        setOutputTab("result");
        setRunOutput(null);
        try {
            const cases = safe(problem?.test_cases, []);
            const stdin = customInput || cases[0]?.input || "";
            const result = await runCode(
                code, language.id, stdin,
                (problem?.time_limit_ms ?? 2000) / 1000,
                (problem?.memory_limit_mb ?? 256) * 1024,
            );
            setRunOutput({ type: "run", stdin, expectedOut: cases[0]?.output ?? "", ...result });
        } catch (err) {
            toast.error("Judge0 error — check your API key");
            setRunOutput({ type: "error", message: err.message });
        } finally {
            setRunning(false);
        }
    };

    // ── Submit (backend evaluation against all test cases) ────────────────────
    const handleSubmit = async () => {
        if (!code.trim()) { toast.error("Write some code first"); return; }
        setSubmitting(true);
        setOutputOpen(true);
        setOutputTab("result");
        setRunOutput(null);
        try {
            const res = await submissionService.submit({
                problem_id: parseInt(id),
                contest_id: contestId ? parseInt(contestId) : null,  // null not undefined
                code,
                language: language.value.toUpperCase(),
            });
            const sub = res.data?.submission ?? res.data;
            setRunOutput({ type: "submit", ...sub });
            if (sub?.verdict === "ACCEPTED") toast.success("🎉 Accepted!");
            else toast.error(`❌ ${(sub?.verdict ?? "Error").replace(/_/g, " ")}`);
        } catch (err) {
            toast.error(err.response?.data?.message ?? "Submission failed");
        } finally {
            setSubmitting(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    if (loading) return <Loader fullscreen text="Loading problem..." />;
    if (!problem) return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16 }}>
            <Code2 size={40} color="#3B3B3B" />
            <p style={{ color: "#888" }}>Problem not found</p>
            <Link to="/practice" style={{ color: "#FFC01E", fontSize: 14 }}>← Back to Practice</Link>
        </div>
    );

    const description = safe(problem.description, {});
    const examples = safe(problem.examples, []);
    const testCases = safe(problem.test_cases, []);
    const sampleCases = testCases.filter(tc => tc.is_sample);
    const tags = safe(problem.tags, []);
    const hints = description.hints ?? [];
    const diffStyle = DIFF_STYLE[problem.difficulty?.toUpperCase()] ?? DIFF_STYLE.EASY;

    const panelCases = sampleCases.length ? sampleCases : (examples.length ? examples.map((e, i) => ({ input: e.input, output: e.output, is_sample: true, label: `Case ${i + 1}` })) : []);


    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div style={{ height: "calc(100vh - 56px)", display: "flex", flexDirection: "column", background: "#1A1A1A", fontFamily: "'Inter', sans-serif", overflow: "hidden" }}>

            {/* ── top bar ─────────────────────────────────────────────────── */}
            <div style={{ height: 44, background: "#1A1A1A", borderBottom: "1px solid #2D2D2D", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", flexShrink: 0 }}>
                {/* Left */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Link to="/practice" style={{ color: "#888", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
                        <ChevronLeft size={14} />
                    </Link>
                    <span style={{ color: "#EBEBEB", fontSize: 14, fontWeight: 500 }}>{problem.title}</span>
                    <span style={{ padding: "1px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: diffStyle.bg, color: diffStyle.color, border: `1px solid ${diffStyle.border}` }}>
                        {problem.difficulty?.charAt(0) + problem.difficulty?.slice(1).toLowerCase()}
                    </span>
                </div>

                {/* Center */}
                <div style={{ display: "flex", gap: 4 }}>
                    <TopBtn icon={<Play size={13} />} label={running ? "Running…" : "Run"} loading={running} onClick={handleRun}
                        style={{ background: "#2D2D2D", color: "#EBEBEB", border: "1px solid #3D3D3D" }} />
                    <TopBtn icon={<Send size={13} />} label={submitting ? "Submitting…" : "Submit"} loading={submitting} onClick={handleSubmit}
                        style={{ background: "#00AF55", color: "#FFF", border: "none" }} />
                </div>

                {/* Right */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {isContestLive && contest && (
                        <ContestTimer endTime={contest.end_time} onExpire={() => toast.error("Time is up!")} />
                    )}
                    <span style={{ fontFamily: "monospace", fontSize: 12, color: "#888" }}>
                        {problem.points} pts
                    </span>
                </div>
            </div>

            {/* ── main panels ─────────────────────────────────────────────── */}
            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

                {/* ── LEFT: problem statement ──────────────────────────────── */}
                {!editorExpanded && (
                    <div style={{ width: "42%", minWidth: 320, display: "flex", flexDirection: "column", borderRight: "1px solid #2D2D2D", background: "#1A1A1A" }}>
                        {/* Tab bar */}
                        <div style={{ display: "flex", borderBottom: "1px solid #2D2D2D", flexShrink: 0 }}>
                            {[["description", "Description"], ["editorial", "Editorial"], ["submissions", "Submissions"]].map(([key, label]) => (
                                <button key={key} onClick={() => setLeftTab(key)} style={{ padding: "10px 16px", fontSize: 13, color: leftTab === key ? "#EBEBEB" : "#888", borderBottom: leftTab === key ? "2px solid #FFC01E" : "2px solid transparent", background: "none", cursor: "pointer", borderLeft: "none", borderRight: "none", borderTop: "none" }}>
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
                            {leftTab === "description" && (
                                <DescriptionPanel
                                    problem={problem}
                                    description={description}
                                    examples={examples}
                                    tags={tags}
                                    hints={hints}
                                    hintsOpen={hintsOpen}
                                    setHintsOpen={setHintsOpen}
                                    diffStyle={diffStyle}
                                />
                            )}
                            {leftTab === "editorial" && (
                                <div style={{ color: "#888", fontSize: 14, paddingTop: 40, textAlign: "center" }}>
                                    <Lightbulb size={32} style={{ margin: "0 auto 12px", display: "block", color: "#3D3D3D" }} />
                                    <p>Editorial not available yet.</p>
                                </div>
                            )}
                            {leftTab === "submissions" && (
                                <div style={{ color: "#888", fontSize: 14, paddingTop: 40, textAlign: "center" }}>
                                    <History size={32} style={{ margin: "0 auto 12px", display: "block", color: "#3D3D3D" }} />
                                    <p>Submit your solution to see history.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── RIGHT: editor ────────────────────────────────────────── */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

                    {/* Editor toolbar */}
                    <div style={{ height: 40, background: "#1A1A1A", borderBottom: "1px solid #2D2D2D", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", flexShrink: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Code2 size={13} color="#888" />
                            <span style={{ fontSize: 12, color: "#888" }}>Code</span>
                        </div>
                        <button onClick={() => setEditorExpanded(!editorExpanded)} style={{ color: "#888", background: "none", cursor: "pointer" }}>
                            {editorExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                        </button>
                    </div>

                    {/* Monaco */}
                    <div style={{ flex: outputOpen ? "0 0 55%" : 1, overflow: "hidden", minHeight: 0 }}>
                        <Editor
                            value={code}
                            onChange={setCode}
                            starterCode={problem.starter_code ?? {}}
                            isContestLive={isContestLive}
                            height="100%"
                            language={language}
                            onLanguageChange={handleLanguageChange}
                        />
                    </div>

                    {/* ── Output panel ─────────────────────────────────────── */}
                    {outputOpen && (
                        <div style={{ flex: "0 0 45%", borderTop: "1px solid #2D2D2D", background: "#1A1A1A", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                            {/* Output tab bar */}
                            <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #2D2D2D", flexShrink: 0 }}>
                                <div style={{ display: "flex", flex: 1 }}>
                                    {[["result", "Test Result"], ["console", "Console"]].map(([key, label]) => (
                                        <button key={key} onClick={() => setOutputTab(key)} style={{ padding: "8px 16px", fontSize: 12, color: outputTab === key ? "#EBEBEB" : "#888", borderBottom: outputTab === key ? "2px solid #FFC01E" : "2px solid transparent", background: "none", cursor: "pointer", border: "none" }}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => setOutputOpen(false)} style={{ padding: "0 12px", color: "#888", background: "none", cursor: "pointer", fontSize: 18 }}>×</button>
                            </div>

                            <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
                                {/* Loading spinner */}
                                {(running || submitting) && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#888", fontSize: 13 }}>
                                        <Spinner size={16} color="#FFC01E" />
                                        {running ? "Running your code…" : "Evaluating against test cases…"}
                                    </div>
                                )}

                                {/* Test result tab */}
                                {outputTab === "result" && runOutput && !running && !submitting && (
                                    <OutputResult result={runOutput} panelCases={panelCases} activeCase={activeCase} setActiveCase={setActiveCase} customInput={customInput} />
                                )}

                                {/* Console tab */}
                                {outputTab === "console" && runOutput && !running && !submitting && (
                                    <ConsolePanel result={runOutput} />
                                )}

                                {!running && !submitting && !runOutput && (
                                    <p style={{ color: "#555", fontSize: 13, fontFamily: "monospace" }}>Click "Run" to test your code against sample cases.</p>
                                )}
                            </div>

                            {/* Sample case tabs at bottom of panel */}
                            {panelCases.length > 0 && !running && !submitting && outputTab === "result" && (
                                <div style={{ borderTop: "1px solid #2D2D2D", padding: "6px 12px", display: "flex", gap: 6, flexShrink: 0 }}>
                                    {panelCases.map((_, i) => (
                                        <button key={i} onClick={() => { setActiveCase(i); setCustomInput(panelCases[i].input); }}
                                            style={{ padding: "3px 10px", borderRadius: 4, fontSize: 12, background: activeCase === i ? "#2D2D2D" : "none", color: activeCase === i ? "#EBEBEB" : "#888", border: activeCase === i ? "1px solid #3D3D3D" : "1px solid transparent", cursor: "pointer" }}>
                                            Case {i + 1}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Run/Submit floating button row when output closed */}
                    {!outputOpen && (
                        <div style={{ height: 44, borderTop: "1px solid #2D2D2D", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, padding: "0 12px", flexShrink: 0, background: "#1A1A1A" }}>
                            <span style={{ flex: 1, fontSize: 12, color: "#555", fontFamily: "monospace" }}>
                                {language.label}
                            </span>
                            <TopBtn icon={<Play size={12} />} label={running ? "Running…" : "Run"} loading={running} onClick={handleRun}
                                style={{ background: "#2D2D2D", color: "#EBEBEB", border: "1px solid #3D3D3D", padding: "5px 14px", fontSize: 12 }} />
                            <TopBtn icon={<Send size={12} />} label={submitting ? "Submitting…" : "Submit"} loading={submitting} onClick={handleSubmit}
                                style={{ background: "#00AF55", color: "#FFF", border: "none", padding: "5px 14px", fontSize: 12 }} />
                        </div>
                    )}
                </div>
            </div>

            <style>{`@keyframes spin{to{transform:rotate(360deg)}} * { box-sizing: border-box; } button { font-family: inherit; }`}</style>
        </div>
    );
}

// ─── sub-components ───────────────────────────────────────────────────────────

function TopBtn({ icon, label, loading, onClick, style }) {
    return (
        <button onClick={onClick} disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 16px", borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1, ...style }}>
            {loading ? <Spinner size={12} color={style.color} /> : icon}
            {label}
        </button>
    );
}

function Spinner({ size = 14, color = "#FFC01E" }) {
    return <div style={{ width: size, height: size, border: `2px solid ${color}40`, borderTopColor: color, borderRadius: "50%", animation: "spin 0.6s linear infinite", flexShrink: 0 }} />;
}

function DescriptionPanel({ problem, description, examples, tags, hints, hintsOpen, setHintsOpen, diffStyle }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Title */}
            <div>
                <h1 style={{ fontSize: 19, fontWeight: 700, color: "#EBEBEB", margin: "0 0 10px" }}>{problem.title}</h1>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ padding: "2px 10px", borderRadius: 4, fontSize: 12, fontWeight: 600, background: diffStyle.bg, color: diffStyle.color, border: `1px solid ${diffStyle.border}` }}>
                        {problem.difficulty?.charAt(0) + problem.difficulty?.slice(1).toLowerCase()}
                    </span>
                    {tags.map(t => (
                        <span key={t} style={{ padding: "2px 8px", background: "#2D2D2D", color: "#888", borderRadius: 4, fontSize: 11 }}>{t}</span>
                    ))}
                </div>
            </div>

            {/* Statement */}
            {description.text && (
                <p style={{ color: "#EBEBEB", fontSize: 14, lineHeight: 1.75, margin: 0, whiteSpace: "pre-wrap" }}>
                    {description.text}
                </p>
            )}

            {/* Examples */}
            {examples.length > 0 && (
                <div>
                    {examples.map((ex, i) => (
                        <div key={i} style={{ marginBottom: 16 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#EBEBEB", margin: "0 0 8px" }}>Example {i + 1}:</p>
                            <div style={{ background: "#2D2D2D", borderRadius: 6, padding: "12px 14px", fontFamily: "monospace", fontSize: 13 }}>
                                <div style={{ marginBottom: 6 }}>
                                    <span style={{ color: "#888" }}>Input: </span>
                                    <span style={{ color: "#EBEBEB" }}>{ex.input}</span>
                                </div>
                                <div style={{ marginBottom: ex.explanation ? 6 : 0 }}>
                                    <span style={{ color: "#888" }}>Output: </span>
                                    <span style={{ color: "#EBEBEB" }}>{ex.output}</span>
                                </div>
                                {ex.explanation && (
                                    <div>
                                        <span style={{ color: "#888" }}>Explanation: </span>
                                        <span style={{ color: "#EBEBEB" }}>{ex.explanation}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Constraints */}
            {description.constraints?.length > 0 && (
                <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#EBEBEB", margin: "0 0 8px" }}>Constraints:</p>
                    <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
                        {description.constraints.map((c, i) => (
                            <li key={i} style={{ fontSize: 13, color: "#EBEBEB", fontFamily: "monospace" }}>{c}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Hints */}
            {hints.length > 0 && (
                <div>
                    <button onClick={() => setHintsOpen(!hintsOpen)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#FFC01E", background: "none", cursor: "pointer", padding: 0, border: "none" }}>
                        {hintsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        Hint {hints.length > 1 ? `(${hints.length})` : ""}
                    </button>
                    {hintsOpen && hints.map((h, i) => (
                        <div key={i} style={{ marginTop: 8, padding: "10px 14px", background: "rgba(255,192,30,0.08)", border: "1px solid rgba(255,192,30,0.2)", borderRadius: 6, fontSize: 13, color: "#FFC01E" }}>
                            💡 {h}
                        </div>
                    ))}
                </div>
            )}

            {/* Limits */}
            <div style={{ display: "flex", gap: 24, borderTop: "1px solid #2D2D2D", paddingTop: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#888", fontSize: 12 }}>
                    <Clock size={13} />{problem.time_limit_ms ?? 2000} ms
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#888", fontSize: 12 }}>
                    <Cpu size={13} />{problem.memory_limit_mb ?? 256} MB
                </div>
            </div>
        </div>
    );
}

function OutputResult({ result, panelCases, activeCase, customInput }) {
    if (result.type === "error") {
        return <p style={{ color: "#FF375F", fontFamily: "monospace", fontSize: 13 }}>⚠ {result.message}</p>;
    }

    if (result.type === "run") {
        const info = STATUS_BADGE[result.statusId] ?? { label: result.statusDesc, color: "#888" };
        const expectedOut = panelCases[activeCase]?.output ?? "";
        const gotOut = (result.stdout ?? "").trim();
        const passed = gotOut === expectedOut.trim();

        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Pass/Fail header */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {result.statusId === 3 && expectedOut
                        ? (passed
                            ? <><CheckCircle2 size={18} color="#00AF55" /><span style={{ fontSize: 16, fontWeight: 700, color: "#00AF55" }}>Accepted</span></>
                            : <><XCircle size={18} color="#FF375F" /><span style={{ fontSize: 16, fontWeight: 700, color: "#FF375F" }}>Wrong Answer</span></>
                        )
                        : <><span style={{ fontWeight: 700, fontSize: 15, color: info.color }}>{info.label}</span></>
                    }
                    {result.time && <span style={{ fontSize: 11, color: "#888", fontFamily: "monospace" }}>{result.time}s</span>}
                    {result.memory && <span style={{ fontSize: 11, color: "#888", fontFamily: "monospace" }}>{Math.round(result.memory / 1024)}MB</span>}
                </div>

                {/* Input */}
                <OutputBlock label="Input" value={customInput} />

                {/* Expected */}
                {expectedOut && <OutputBlock label="Expected Output" value={expectedOut} />}

                {/* Your output */}
                <OutputBlock label="Your Output" value={result.stdout || "(empty)"} highlight={expectedOut ? (passed ? "#00AF55" : "#FF375F") : undefined} />

                {/* Compile / stderr */}
                {result.compileOutput && <OutputBlock label="Compile Output" value={result.compileOutput} highlight="#FFC01E" />}
                {result.stderr && <OutputBlock label="Standard Error" value={result.stderr} highlight="#FF375F" />}
            </div>
        );
    }

    if (result.type === "submit") {
        const verdict = result.verdict ?? "UNKNOWN";
        const isAc = verdict === "ACCEPTED";
        const color = isAc ? "#00AF55" : "#FF375F";
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {isAc ? <CheckCircle2 size={22} color={color} /> : <XCircle size={22} color={color} />}
                    <span style={{ fontSize: 18, fontWeight: 700, color }}>{verdict.replace(/_/g, " ")}</span>
                </div>
                {(result.runtime_ms != null || result.memory_mb != null) && (
                    <div style={{ display: "flex", gap: 24 }}>
                        {result.runtime_ms != null && (
                            <div style={{ fontSize: 12, color: "#888" }}>
                                Runtime: <span style={{ color: "#EBEBEB", fontFamily: "monospace" }}>{result.runtime_ms} ms</span>
                            </div>
                        )}
                        {result.memory_mb != null && (
                            <div style={{ fontSize: 12, color: "#888" }}>
                                Memory: <span style={{ color: "#EBEBEB", fontFamily: "monospace" }}>{result.memory_mb} MB</span>
                            </div>
                        )}
                    </div>
                )}
                {result.points_earned != null && isAc && (
                    <div style={{ padding: "10px 14px", background: "rgba(0,175,85,0.1)", border: "1px solid rgba(0,175,85,0.2)", borderRadius: 6, fontSize: 13, color: "#00AF55" }}>
                        🏆 +{result.points_earned} points earned
                    </div>
                )}
            </div>
        );
    }

    return null;
}

function ConsolePanel({ result }) {
    if (!result || result.type === "error") return <p style={{ color: "#888", fontSize: 13 }}>No console output.</p>;
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {result.stdout && <OutputBlock label="stdout" value={result.stdout} />}
            {result.compileOutput && <OutputBlock label="Compile Output" value={result.compileOutput} highlight="#FFC01E" />}
            {result.stderr && <OutputBlock label="stderr" value={result.stderr} highlight="#FF375F" />}
            {!result.stdout && !result.compileOutput && !result.stderr && (
                <p style={{ color: "#888", fontSize: 13, fontFamily: "monospace" }}>No output produced.</p>
            )}
        </div>
    );
}

function OutputBlock({ label, value, highlight }) {
    return (
        <div>
            <p style={{ fontSize: 11, color: highlight ?? "#888", fontWeight: 600, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
            <pre style={{ background: "#2D2D2D", color: highlight ?? "#EBEBEB", padding: "10px 12px", borderRadius: 6, fontSize: 13, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", margin: 0, overflow: "auto", maxHeight: 120, border: highlight ? `1px solid ${highlight}30` : "none", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {value}
            </pre>
        </div>
    );
}