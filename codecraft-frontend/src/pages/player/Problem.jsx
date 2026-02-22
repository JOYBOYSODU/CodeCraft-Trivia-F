import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { problemService } from "../../services/problemService";
import { submissionService } from "../../services/submissionService";
import Editor from "../../components/Editor";
import ContestTimer from "../../components/ContestTimer";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { Play, Send, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { contestService } from "../../services/contestService";

const VERDICT_STYLES = {
    ACCEPTED: "badge-success",
    WRONG_ANSWER: "badge-danger",
    TIME_LIMIT: "badge-warning",
    RUNTIME_ERROR: "badge-danger",
    COMPILE_ERROR: "badge-warning",
};

export default function Problem() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const contestId = searchParams.get("contestId");

    const [problem, setProblem] = useState(null);
    const [contest, setContest] = useState(null);
    const [code, setCode] = useState("");
    const [output, setOutput] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showOutput, setShowOutput] = useState(false);
    const tabSwitchCount = useRef(0);

    const isContestLive = contest?.status === "LIVE";

    useEffect(() => {
        const promises = [problemService.getProblem(id)];
        if (contestId) promises.push(contestService.getContest(contestId));
        Promise.all(promises)
            .then(([pRes, cRes]) => {
                setProblem(pRes.data);
                if (cRes) setContest(cRes.data);
            })
            .catch(() => toast.error("Failed to load problem"))
            .finally(() => setLoading(false));
    }, [id, contestId]);

    // Anti-cheat: tab switch detection
    useEffect(() => {
        if (!isContestLive) return;
        const handler = () => {
            if (document.hidden) {
                tabSwitchCount.current += 1;
                toast.error(`Tab switch detected! (${tabSwitchCount.current})`);
                // Could POST to backend: /api/submissions/cheat-log
            }
        };
        document.addEventListener("visibilitychange", handler);
        return () => document.removeEventListener("visibilitychange", handler);
    }, [isContestLive]);

    // Fullscreen enforcement
    useEffect(() => {
        if (!isContestLive) return;
        const requestFs = () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen?.().catch(() => { });
            }
        };
        requestFs();
        const handler = () => {
            if (!document.fullscreenElement) {
                toast.error("Please stay in fullscreen during the contest");
                requestFs();
            }
        };
        document.addEventListener("fullscreenchange", handler);
        return () => document.removeEventListener("fullscreenchange", handler);
    }, [isContestLive]);

    const handleSubmit = async () => {
        if (!code.trim()) { toast.error("Write some code first"); return; }
        setSubmitting(true);
        setShowOutput(true);
        try {
            const res = await submissionService.submit({
                problem_id: id,
                contest_id: contestId ?? undefined,
                code,
                language: "PYTHON", // Editor component manages language — TODO: lift state
            });
            const result = res.data;
            setOutput(result);
            if (result.verdict === "ACCEPTED") {
                toast.success("✅ Accepted!");
            } else {
                toast.error(`❌ ${result.verdict?.replace("_", " ")}`);
            }
        } catch (err) {
            toast.error(err.response?.data?.message ?? "Submission failed");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader fullscreen text="Loading problem..." />;
    if (!problem) return <div className="flex items-center justify-center h-full text-slate-400">Problem not found</div>;

    // Parse JSON fields safely
    const desc = typeof problem.desc === "string" ? JSON.parse(problem.desc) : problem.desc ?? {};
    const cases = typeof problem.cases === "string" ? JSON.parse(problem.cases) : problem.cases ?? [];
    const sampleCases = cases.filter((c) => c.is_sample);

    return (
        <div className="h-[calc(100vh-3.5rem)] flex overflow-hidden">
            {/* Left: Problem details */}
            <div className="w-1/2 overflow-y-auto border-r border-border">
                <div className="p-5 space-y-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-xl font-mono font-bold text-slate-100">{problem.title}</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`badge ${problem.difficulty === "EASY" ? "difficulty-easy" :
                                    problem.difficulty === "MEDIUM" ? "difficulty-medium" : "difficulty-hard"}`}>
                                    {problem.difficulty}
                                </span>
                                <span className="badge badge-primary">{problem.points} pts</span>
                                {(problem.tags ?? []).map((t) => (
                                    <span key={t} className="badge badge-secondary">{t}</span>
                                ))}
                            </div>
                        </div>
                        {isContestLive && contest && (
                            <ContestTimer endTime={contest.end_time} onExpire={() => toast.error("Time is up!")} />
                        )}
                    </div>

                    {/* Description */}
                    {desc.statement && (
                        <div className="space-y-2">
                            <h2 className="font-mono font-semibold text-slate-200">Description</h2>
                            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{desc.statement}</p>
                        </div>
                    )}

                    {/* Constraints */}
                    {desc.constraints && (
                        <div className="space-y-2">
                            <h2 className="font-mono font-semibold text-slate-200">Constraints</h2>
                            <pre className="text-slate-400 text-xs bg-bg rounded-card p-3 border border-border overflow-x-auto">{desc.constraints}</pre>
                        </div>
                    )}

                    {/* Limits */}
                    <div className="flex gap-4 text-xs text-slate-400 font-mono">
                        <span>⏱ {problem.time_limit_ms}ms</span>
                        <span>💾 {problem.memory_limit_mb}MB</span>
                    </div>

                    {/* Sample test cases */}
                    {sampleCases.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="font-mono font-semibold text-slate-200">Examples</h2>
                            {sampleCases.map((tc, i) => (
                                <div key={i} className="space-y-2">
                                    <p className="text-xs text-slate-400 font-mono">Example {i + 1}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Input</p>
                                            <pre className="bg-bg border border-border rounded-card p-2 text-xs text-slate-300 overflow-x-auto">{tc.input}</pre>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Output</p>
                                            <pre className="bg-bg border border-border rounded-card p-2 text-xs text-slate-300 overflow-x-auto">{tc.output}</pre>
                                        </div>
                                    </div>
                                    {tc.explanation && (
                                        <p className="text-xs text-slate-400 italic">{tc.explanation}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Editor + Output */}
            <div className="w-1/2 flex flex-col">
                {/* Toolbar */}
                <div className="shrink-0 border-b border-border bg-surface px-4 py-2 flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-400">Editor</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowOutput(!showOutput)}
                            className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-1.5"
                        >
                            <Play size={12} />
                            Output
                            {showOutput ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="btn-primary flex items-center gap-1.5 text-xs px-4 py-1.5"
                        >
                            {submitting ? (
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : <Send size={12} />}
                            Submit
                        </button>
                    </div>
                </div>

                {/* Monaco editor */}
                <div className={`flex-1 min-h-0 ${showOutput ? "h-1/2" : ""}`}>
                    <Editor
                        value={code}
                        onChange={setCode}
                        starterCode={problem.starter_code ?? {}}
                        isContestLive={isContestLive}
                        height="100%"
                    />
                </div>

                {/* Output panel */}
                {showOutput && (
                    <div className="h-48 border-t border-border bg-bg overflow-y-auto p-4 shrink-0">
                        {!output ? (
                            <p className="text-slate-500 text-sm font-mono">Submit your code to see results…</p>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className={`badge ${VERDICT_STYLES[output.verdict] ?? "badge-primary"}`}>
                                        {output.verdict?.replace("_", " ")}
                                    </span>
                                    {output.runtime_ms != null && (
                                        <span className="text-xs text-slate-400 font-mono">{output.runtime_ms}ms</span>
                                    )}
                                    {output.memory_mb != null && (
                                        <span className="text-xs text-slate-400 font-mono">{output.memory_mb}MB</span>
                                    )}
                                </div>
                                {output.test_results && (
                                    <div className="space-y-1">
                                        {output.test_results.map((tr, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs font-mono">
                                                <span className={tr.passed ? "text-success" : "text-danger"}>
                                                    {tr.passed ? "✓" : "✗"}
                                                </span>
                                                <span className="text-slate-400">Test {i + 1}</span>
                                                {tr.message && <span className="text-slate-500">{tr.message}</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
