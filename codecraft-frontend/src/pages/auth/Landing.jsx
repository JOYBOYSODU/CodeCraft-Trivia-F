import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Code2, Swords, Trophy, Shield, Users, Briefcase, ArrowRight, Zap, Star, ChevronRight } from "lucide-react";
import DecryptedText from "../../components/DecryptedText";
import CardSwap, { Card } from "../../components/CardSwap";

function StarCanvas() {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let animId;

        const STAR_COUNT = 180;
        const COLORS = ["#ffffff", "#ffe9a0", "#ffd700", "#cd9f6a", "#d0d0d0"];

        function resize() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        const stars = Array.from({ length: STAR_COUNT }, () => ({
            x: Math.random(),
            y: Math.random(),
            r: 0.4 + Math.random() * 1.4,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            speed: 0.3 + Math.random() * 1.4,
            phase: Math.random() * Math.PI * 2,
            drift: (Math.random() - 0.5) * 0.00008,
        }));

        function draw(t) {
            const W = canvas.width;
            const H = canvas.height;
            ctx.clearRect(0, 0, W, H);
            for (const s of stars) {
                const alpha = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * 0.001 * s.speed + s.phase));
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = s.color;
                ctx.shadowBlur = s.r * 4;
                ctx.shadowColor = s.color;
                ctx.beginPath();
                ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                s.x = (s.x + s.drift + 1) % 1;
            }
            animId = requestAnimationFrame(draw);
        }
        animId = requestAnimationFrame(draw);
        return () => { cancelAnimationFrame(animId); ro.disconnect(); };
    }, []);
    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                pointerEvents: "none",
            }}
        />
    );
}

function AnimatedNumber({ value, suffix = "", prefix = "", decimals = 0, duration = 2000 }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);

    useEffect(() => {
        let startTime;
        let animationFrame;
        let timeoutId;
        let isAnimating = false;

        const animate = (time) => {
            if (!startTime) startTime = time;
            const progress = Math.min((time - startTime) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic

            setCount(value * easeProgress);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setCount(value);
                isAnimating = false;
                timeoutId = setTimeout(startAnimation, 3000);
            }
        };

        const startAnimation = () => {
            if (isAnimating) return;
            isAnimating = true;
            startTime = null;
            if (animationFrame) cancelAnimationFrame(animationFrame);
            if (timeoutId) clearTimeout(timeoutId);
            setCount(0);
            animationFrame = requestAnimationFrame(animate);
        };

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    startAnimation();
                } else {
                    if (animationFrame) cancelAnimationFrame(animationFrame);
                    if (timeoutId) clearTimeout(timeoutId);
                    isAnimating = false;
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (animationFrame) cancelAnimationFrame(animationFrame);
            if (timeoutId) clearTimeout(timeoutId);
            observer.disconnect();
        };
    }, [value, duration]);

    const formatted = count.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });

    return <span ref={ref}>{prefix}{formatted}{suffix}</span>;
}

const features = [
    {
        icon: Swords,
        tag: "COMPETE",
        title: "Real-Time Contests",
        desc: "Compete live against thousands of developers with millisecond-precision judging.",
        accent: "#F7E800",
    },
    {
        icon: Trophy,
        tag: "PROGRESS",
        title: "XP & Tier System",
        desc: "Earn XP, level up, and climb from Bronze to Gold through ranked contests.",
        accent: "#F7E800",
    },
    {
        icon: Code2,
        tag: "MULTI-LANG",
        title: "Multi-Language Support",
        desc: "Code in Python, Java, JavaScript, or C++ powered by Monaco editor.",
        accent: "#F7E800",
    },
    {
        icon: Shield,
        tag: "HIRING",
        title: "Hiring Contests",
        desc: "Top companies host invite-only challenges to shortlist elite engineering talent.",
        accent: "#F7E800",
    },
    {
        icon: Users,
        tag: "LIVE",
        title: "Live Leaderboards",
        desc: "Track your rank in real-time as submissions roll in — updated via WebSocket.",
        accent: "#F7E800",
    },
    {
        icon: Briefcase,
        tag: "SHORTLIST",
        title: "Direct Shortlisting",
        desc: "Get shortlisted by hiring companies after finishing a contest, no separate apply.",
        accent: "#F7E800",
    },
];

const tiers = [
    {
        tier: "BRONZE",
        range: "0 – 999 XP",
        color: "#8B4A0A",
        bg: "rgba(205,127,50,0.10)",
        border: "rgba(180,100,40,0.35)",
        glow: "rgba(205,127,50,0.15)",
        icon: "🥉",
    },
    {
        tier: "SILVER",
        range: "1000 – 2999 XP",
        color: "#3B3B3B",
        bg: "rgba(130,130,130,0.08)",
        border: "rgba(100,100,100,0.30)",
        glow: "rgba(130,130,130,0.12)",
        icon: "🥈",
    },
    {
        tier: "GOLD",
        range: "3000+ XP",
        color: "#6B5000",
        bg: "rgba(247,232,0,0.14)",
        border: "rgba(200,165,0,0.45)",
        glow: "rgba(247,232,0,0.20)",
        icon: "🥇",
    },
];

const stats = [
    { value: 50, suffix: "K+", label: "Developers", decimals: 0 },
    { value: 1200, suffix: "+", label: "Companies", decimals: 0 },
    { value: 99, suffix: "ms", label: "Avg Judge Time", decimals: 0 },
    { value: 4.9, suffix: "★", label: "Rated", decimals: 1 },
];

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="no-scrollbar" style={{ minHeight: "100vh", background: "#F8F7F2", fontFamily: "'Inter', sans-serif", overflowX: "hidden", maxWidth: "100%", margin: "0 auto" }}>

            {/* ── Navbar ── */}
            <header className="hero-nav">
                <nav className="hero-nav__inner" style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center" }}>
                    <div /> {/* Invisible spacer for grid balance */}
                    <Link to="/" className="hero-brand" style={{ justifySelf: "center", margin: 0 }}>
                        <Code2 size={20} className="hero-brand__icon" />
                        <span className="hero-brand__text">CodeCraft</span>
                    </Link>
                    <div className="hero-nav__actions" style={{ justifySelf: "end" }}>
                        <Link to="/login" className="hero-btn hero-btn--ghost">Log In</Link>
                        <Link to="/register" className="hero-btn hero-btn--solid">Sign Up</Link>
                    </div>
                </nav>
            </header>

            {/* ── Hero ── */}
            <section className="hero-shell">
                <div className="hero-split">
                    <div className="hero-split__left">
                        <div className="hero-pill">
                            <span className="hero-pill__bracket">[</span>
                            <span className="hero-pill__text">AI-FIRST HIRING SIGNALS</span>
                            <span className="hero-pill__bracket">]</span>
                            <span className="hero-pill__icon" aria-hidden="true" />
                        </div>
                        <h1 className="hero-title">
                            <DecryptedText
                                text="Build contest agents for engineering hiring"
                                animateOn="view"
                                revealDirection="start"
                                sequential
                                speed={90}
                                maxIterations={28}
                                className="hero-title"
                                parentClassName="hero-title"
                                encryptedClassName="hero-ai__encrypted"
                            />
                        </h1>
                        <p className="hero-copy">
                            CodeCraft helps hiring teams parse submissions, track live leaderboards,
                            and validate skills faster — reducing time-to-hire without sacrificing rigor.
                        </p>
                        <div className="hero-cta">
                            <Link to="/register" className="hero-btn hero-btn--solid">Start Competing →</Link>
                            <Link to="/login" className="hero-btn hero-btn--ghost">Log In</Link>
                        </div>
                        <div className="hero-ai">
                            <div className="hero-ai__label">AI-BASED SIGNALS</div>
                            <DecryptedText
                                text="Detect true skill with live contest telemetry."
                                animateOn="view"
                                revealDirection="start"
                                sequential
                                speed={80}
                                maxIterations={24}
                                className="hero-ai__text"
                                parentClassName="hero-ai__line"
                                encryptedClassName="hero-ai__encrypted"
                            />
                        </div>
                        <p className="hero-subtle">
                            Already have an account?{" "}
                            <Link to="/login" className="hero-link">Sign in</Link>
                        </p>
                    </div>
                    <div className="hero-split__right" style={{ borderRadius: "16px", margin: "1.5rem 0" }}>
                        <div className="hero-card-stack">
                            <CardSwap cardDistance={60} verticalDistance={70} delay={10000} pauseOnHover={false} durationMultiplier={2}>
                                <Card>
                                    <div className="card-window-tag">AI SIGNALS</div>
                                    <h3 className="card-window-title">Skill verification</h3>
                                    <p className="card-window-copy">Model scored rubrics detect algorithmic depth, not just speed.</p>
                                </Card>
                                <Card>
                                    <div className="card-window-tag">LIVE INSIGHTS</div>
                                    <h3 className="card-window-title">Real-time telemetry</h3>
                                    <p className="card-window-copy">Track attempts, solve paths, and collaboration signals in-flight.</p>
                                </Card>
                                <Card>
                                    <div className="card-window-tag">SAFE HIRING</div>
                                    <h3 className="card-window-title">Fraud detection</h3>
                                    <p className="card-window-copy">Pattern analysis flags anomalies and keeps evaluations fair.</p>
                                </Card>
                            </CardSwap>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Stats Bar ── */}
            <div style={{ borderTop: "1px solid rgba(11,11,11,0.1)", borderBottom: "1px solid rgba(11,11,11,0.1)", background: "#FFFFFF" }}>
                <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "1.25rem 2rem", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "1rem" }}>
                    {stats.map(({ value, suffix, label, decimals }) => (
                        <div key={label} style={{ textAlign: "center" }}>
                            <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: "1.5rem", fontWeight: 700, color: "#0B0B0B", lineHeight: 1.1 }}>
                                <AnimatedNumber value={value} suffix={suffix} decimals={decimals} />
                            </p>
                            <p style={{ margin: "0.2rem 0 0", fontSize: "0.72rem", color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Features ── */}
            <section id="features" style={{ maxWidth: "1400px", margin: "0 auto", padding: "5rem 2rem 4rem" }}>
                <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "#F7E800", border: "1.5px solid rgba(11,11,11,0.2)", borderRadius: "999px", padding: "0.2rem 0.75rem", marginBottom: "1rem", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0B0B0B" }}>
                        <Zap size={11} /> PLATFORM FEATURES
                    </div>
                    <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, color: "#0B0B0B", margin: "0 0 0.75rem", letterSpacing: "-0.025em", lineHeight: 1.15 }}>
                        Everything you need to{" "}
                        <span style={{ background: "#F7E800", borderRadius: "6px", padding: "0 8px 2px", display: "inline-block" }}>level up</span>
                    </h2>
                    <p style={{ color: "#4B5563", fontSize: "1rem", maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>
                        Built for serious competitive programmers and hiring teams who demand the best.
                    </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
                    {features.map(({ icon: Icon, tag, title, desc }) => (
                        <div key={title}
                            style={{
                                background: "#FFFFFF",
                                border: "1.5px solid rgba(11,11,11,0.12)",
                                borderRadius: "12px",
                                padding: "1.5rem",
                                transition: "border-color 200ms, box-shadow 200ms, transform 200ms",
                                cursor: "default",
                                position: "relative",
                                overflow: "hidden",
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = "#0B0B0B";
                                e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.10)";
                                e.currentTarget.style.transform = "translateY(-2px)";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = "rgba(11,11,11,0.12)";
                                e.currentTarget.style.boxShadow = "none";
                                e.currentTarget.style.transform = "translateY(0)";
                            }}>
                            {/* Yellow accent line top */}
                            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "#F7E800" }} />

                            {/* Tag */}
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", background: "rgba(11,11,11,0.06)", borderRadius: "4px", padding: "0.15rem 0.5rem", marginBottom: "1rem", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B7280" }}>
                                {tag}
                            </div>

                            {/* Icon */}
                            <div style={{ width: 44, height: 44, borderRadius: "10px", background: "#F7E800", border: "1.5px solid rgba(11,11,11,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                                <Icon size={20} color="#0B0B0B" strokeWidth={1.8} />
                            </div>

                            <h3 style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.95rem", fontWeight: 700, color: "#0B0B0B", margin: "0 0 0.5rem", lineHeight: 1.3 }}>
                                {title}
                            </h3>
                            <p style={{ color: "#4B5563", fontSize: "0.875rem", margin: "0 0 1rem", lineHeight: 1.65 }}>
                                {desc}
                            </p>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 600, color: "#0B0B0B", borderBottom: "1.5px solid #0B0B0B", paddingBottom: "1px" }}>
                                Learn more <ArrowRight size={11} />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Tier Showcase (Gamified) ── */}
            <section style={{ background: "#0B0B0B", padding: "5rem 2rem", position: "relative", overflow: "hidden" }}>

                {/* CSS Keyframes */}
                <style>{`
                    @keyframes glow-bronze {
                        0%, 100% { box-shadow: 0 0 12px rgba(205,127,50,0.3), 0 0 40px rgba(205,127,50,0.10); }
                        50%       { box-shadow: 0 0 24px rgba(205,127,50,0.6), 0 0 80px rgba(205,127,50,0.25); }
                    }
                    @keyframes glow-silver {
                        0%, 100% { box-shadow: 0 0 12px rgba(192,192,192,0.2), 0 0 40px rgba(192,192,192,0.07); }
                        50%       { box-shadow: 0 0 24px rgba(192,192,192,0.45), 0 0 80px rgba(192,192,192,0.18); }
                    }
                    @keyframes glow-gold {
                        0%, 100% { box-shadow: 0 0 14px rgba(255,215,0,0.40), 0 0 50px rgba(255,215,0,0.15); }
                        50%       { box-shadow: 0 0 30px rgba(255,215,0,0.80), 0 0 100px rgba(255,215,0,0.35); }
                    }
                    @keyframes xp-fill-bronze { from { width: 0% } to { width: 33% } }
                    @keyframes xp-fill-silver { from { width: 0% } to { width: 66% } }
                    @keyframes xp-fill-gold   { from { width: 0% } to { width: 100% } }
                    @keyframes badge-pulse {
                        0%, 100% { transform: scale(1); }
                        50%       { transform: scale(1.12); }
                    }
                    @keyframes float-1 {
                        0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.15; }
                        33%       { transform: translateY(-18px) translateX(8px); opacity: 0.30; }
                        66%       { transform: translateY(10px) translateX(-6px); opacity: 0.18; }
                    }
                    @keyframes float-2 {
                        0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.10; }
                        50%       { transform: translateY(20px) translateX(-12px); opacity: 0.25; }
                    }
                    @keyframes float-3 {
                        0%, 100% { transform: translateY(0px) scale(1); opacity: 0.08; }
                        60%       { transform: translateY(-25px) scale(1.2); opacity: 0.22; }
                    }
                    @keyframes grid-scan {
                        0%   { transform: translateY(-100%); }
                        100% { transform: translateY(100vh); }
                    }
                    @keyframes tier-enter {
                        from { opacity: 0; transform: translateY(24px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes shimmer {
                        0%   { background-position: -200% center; }
                        100% { background-position: 200% center; }
                    }
                `}</style>

                {/* Star particle background */}
                <StarCanvas />

                <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>
                    {/* Header */}
                    <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "#F7E800", borderRadius: "999px", padding: "0.2rem 0.75rem", marginBottom: "1rem", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0B0B0B" }}>
                            <Star size={11} /> RANKING SYSTEM
                        </div>
                        <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, color: "#F8F7F2", margin: "0 0 0.6rem", letterSpacing: "-0.025em" }}>
                            Climb the Ranks
                        </h2>
                        <p style={{ color: "#6B7280", fontSize: "0.9rem", margin: 0 }}>
                            Every contest win earns XP and pushes you up the tier ladder.
                        </p>
                    </div>

                    {/* Tier Cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
                        {[
                            {
                                tier: "BRONZE", label: "Starter", range: "0 – 999 XP", xp: 650, maxXp: 1000,
                                color: "#CD7F32", glowColor: "rgba(205,127,50,0.5)", dimColor: "rgba(205,127,50,0.15)",
                                border: "rgba(205,127,50,0.5)", bg: "rgba(205,127,50,0.06)",
                                glowAnim: "glow-bronze 3s ease-in-out infinite",
                                xpAnim: "xp-fill-bronze 1.8s ease-out 0.3s forwards",
                                barColor: "linear-gradient(90deg, #8B4A0A, #CD7F32, #E8A84A)",
                                icon: "🥉", perks: ["Ranked Contests", "XP Tracking", "Public Profile"],
                                delay: "0s",
                            },
                            {
                                tier: "SILVER", label: "Contender", range: "1000 – 2999 XP", xp: 1840, maxXp: 3000,
                                color: "#C0C0C0", glowColor: "rgba(192,192,192,0.5)", dimColor: "rgba(192,192,192,0.12)",
                                border: "rgba(192,192,192,0.5)", bg: "rgba(192,192,192,0.06)",
                                glowAnim: "glow-silver 3s ease-in-out infinite 0.5s",
                                xpAnim: "xp-fill-silver 1.8s ease-out 0.5s forwards",
                                barColor: "linear-gradient(90deg, #808080, #C0C0C0, #E8E8E8)",
                                icon: "🥈", perks: ["All Bronze Perks", "Hiring Visibility", "Priority Queue"],
                                delay: "0.1s",
                            },
                            {
                                tier: "GOLD", label: "Champion", range: "3000+ XP", xp: 3420, maxXp: 5000,
                                color: "#FFD700", glowColor: "rgba(255,215,0,0.6)", dimColor: "rgba(255,215,0,0.18)",
                                border: "rgba(255,215,0,0.6)", bg: "rgba(255,215,0,0.07)",
                                glowAnim: "glow-gold 2.5s ease-in-out infinite 0.2s",
                                xpAnim: "xp-fill-gold 1.8s ease-out 0.7s forwards",
                                barColor: "linear-gradient(90deg, #996600, #FFD700, #FFF48A)",
                                icon: "🥇", perks: ["All Silver Perks", "Direct Shortlist", "Exclusive Contests"],
                                delay: "0.2s",
                            },
                        ].map(({ tier, label, range, xp, maxXp, color, glowColor, dimColor, border, bg, glowAnim, xpAnim, barColor, icon, perks, delay }) => (
                            <div key={tier}
                                style={{
                                    background: bg,
                                    border: `1.5px solid ${border}`,
                                    borderRadius: "16px",
                                    padding: "2rem 1.75rem",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "1rem",
                                    animation: `${glowAnim}, tier-enter 0.6s ease-out ${delay} both`,
                                    position: "relative",
                                    overflow: "hidden",
                                    cursor: "default",
                                    transition: "transform 250ms",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px) scale(1.02)"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; }}>

                                {/* Card shimmer streak */}
                                <div style={{
                                    position: "absolute", top: 0, left: "-60%", width: "40%", height: "100%",
                                    background: `linear-gradient(90deg, transparent, ${dimColor}, transparent)`,
                                    animation: "shimmer 4s ease-in-out infinite",
                                    backgroundSize: "200% 100%",
                                    pointerEvents: "none",
                                }} />

                                {/* Top: icon + tier name */}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div>
                                        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "1rem", fontWeight: 700, color, letterSpacing: "0.12em", margin: 0, textTransform: "uppercase" }}>
                                            {tier}
                                        </p>
                                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "#6B7280", margin: "0.1rem 0 0", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                            {label}
                                        </p>
                                    </div>
                                    <div style={{ fontSize: "2.4rem", lineHeight: 1, animation: "badge-pulse 2.5s ease-in-out infinite" }}>
                                        {icon}
                                    </div>
                                </div>

                                {/* XP Bar */}
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                                        <span style={{ fontSize: "0.65rem", color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>XP Progress</span>
                                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.72rem", color, fontWeight: 700 }}>
                                            {xp.toLocaleString()} / {maxXp.toLocaleString()}
                                        </span>
                                    </div>
                                    <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "999px", overflow: "hidden" }}>
                                        <div style={{
                                            height: "100%", borderRadius: "999px",
                                            background: barColor,
                                            width: "0%",
                                            animation: xpAnim,
                                            boxShadow: `0 0 8px ${glowColor}`,
                                        }} />
                                    </div>
                                </div>

                                {/* XP Range badge */}
                                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(255,255,255,0.06)", border: `1px solid ${border}`, borderRadius: "6px", padding: "0.3rem 0.65rem", width: "fit-content" }}>
                                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${glowColor}` }} />
                                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.72rem", color: "#C0C0C0", fontWeight: 600 }}>{range}</span>
                                </div>

                                {/* Perks */}
                                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                    {perks.map(p => (
                                        <li key={p} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#9CA3AF" }}>
                                            <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Bottom progress hint */}
                    <p style={{ textAlign: "center", color: "#374151", fontSize: "0.78rem", marginTop: "2.5rem", fontFamily: "'Inter', sans-serif" }}>
                        Win contests → Earn XP → Unlock higher ranks → Get shortlisted
                    </p>
                </div>
            </section>


            {/* ── CTA ── */}
            <section style={{ maxWidth: "900px", margin: "0 auto", padding: "5rem 2rem", textAlign: "center" }}>
                <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: "#0B0B0B", margin: "0 0 0.75rem", letterSpacing: "-0.025em" }}>
                    Ready to compete?
                </h2>
                <p style={{ color: "#4B5563", fontSize: "0.95rem", margin: "0 0 2rem", lineHeight: 1.6 }}>
                    Join thousands of developers and companies on CodeCraft.
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    <Link to="/register" className="hero-btn hero-btn--solid" style={{ padding: "0.75rem 1.75rem", fontSize: "0.9rem", height: "auto", border: "none" }}>
                        Sign Up
                    </Link>
                    <Link to="/login" className="hero-btn hero-btn--ghost" style={{ padding: "0.75rem 1.75rem", fontSize: "0.9rem", height: "auto" }}>
                        Log In
                    </Link>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer style={{ borderTop: "1px solid rgba(11,11,11,0.1)", padding: "1.75rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", color: "#9CA3AF", fontSize: "0.75rem", fontFamily: "'JetBrains Mono', monospace" }}>
                <Code2 size={13} color="#0B0B0B" />
                CodeCraft — Real-Time Competitive Coding &amp; Hiring Platform
            </footer>
        </div>
    );
}
