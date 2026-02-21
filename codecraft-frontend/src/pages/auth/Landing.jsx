import { Link, useNavigate } from "react-router-dom";
import { Code2, Swords, Trophy, ChevronRight, Zap, Shield, Users, Briefcase } from "lucide-react";
import DecryptedText from "../../components/DecryptedText";
import CardSwap, { Card } from "../../components/CardSwap";

const features = [
    { icon: Swords, title: "Real-Time Contests", desc: "Compete live against thousands of developers with millisecond-precision judging." },
    { icon: Trophy, title: "XP & Tier System", desc: "Earn XP, level up, and climb from Bronze to Gold through ranked contests." },
    { icon: Code2, title: "Multi-Language Support", desc: "Code in Python, Java, JavaScript, or C++ with Monaco editor." },
    { icon: Shield, title: "Hiring Contests", desc: "Top companies host invite-only challenges to shortlist elite engineering talent." },
    { icon: Users, title: "Live Leaderboards", desc: "Track your rank in real-time as submissions roll in — updated via WebSocket." },
    { icon: Briefcase, title: "Direct Shortlisting", desc: "Get shortlisted by hiring companies after finishing a contest, no separate apply." },
];

const tiers = [
    { tier: "BRONZE", color: "#CD7F32", range: "0–999 XP", cls: "tier-bronze" },
    { tier: "SILVER", color: "#C0C0C0", range: "1000–2999 XP", cls: "tier-silver" },
    { tier: "GOLD", color: "#FFD700", range: "3000+ XP", cls: "tier-gold" },
];

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen" style={{ background: "#0F172A" }}>
            {/* Navbar */}
            <header className="hero-nav">
                <nav className="hero-nav__inner">
                    <Link to="/" className="hero-brand">
                        <Code2 size={20} className="hero-brand__icon" />
                        <span className="hero-brand__text">CodeCraft</span>
                    </Link>
                    <div className="hero-nav__links">
                        <a href="#features">Product</a>
                        <a href="#features">Solutions</a>
                        <a href="#features">Developers</a>
                        <a href="#features">Resources</a>
                        <a href="#features">Company</a>
                        <a href="#features">Blog</a>
                        <a href="#features">Pricing</a>
                    </div>
                    <div className="hero-nav__actions">
                        <button
                            onClick={() => navigate("/register", { state: { role: "HOST" } })}
                            className="hero-btn hero-btn--ghost"
                        >
                            Contact Sales
                        </button>
                        <button
                            onClick={() => navigate("/register", { state: { role: "PLAYER" } })}
                            className="hero-btn hero-btn--solid"
                        >
                            Sign Up
                        </button>
                    </div>
                </nav>
            </header>

            {/* Hero */}
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
                                speed={45}
                                maxIterations={14}
                                className="hero-title"
                                parentClassName="hero-title"
                                encryptedClassName="hero-ai__encrypted"
                            />
                        </h1>
                        <p className="hero-copy">
                            CodeCraft helps hiring teams parse submissions, track live leaderboards,
                            and validate skills faster, reducing time-to-hire without sacrificing rigor.
                        </p>
                        <div className="hero-cta">
                            <button
                                onClick={() => navigate("/register", { state: { role: "HOST" } })}
                                className="hero-btn hero-btn--ghost"
                            >
                                Contact Sales
                            </button>
                            <button
                                onClick={() => navigate("/register", { state: { role: "PLAYER" } })}
                                className="hero-btn hero-btn--solid"
                            >
                                Sign Up
                            </button>
                        </div>
                        <div className="hero-ai">
                            <div className="hero-ai__label">AI-BASED SIGNALS</div>
                            <DecryptedText
                                text="Detect true skill with live contest telemetry."
                                animateOn="view"
                                revealDirection="start"
                                sequential
                                speed={40}
                                maxIterations={12}
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
                    <div className="hero-split__right">
                        <div className="hero-card-stack">
                            <CardSwap cardDistance={60} verticalDistance={70} delay={5000} pauseOnHover={false}>
                                <Card>
                                    <div className="card-window-tag">AI SIGNALS</div>
                                    <h3 className="card-window-title">Skill verification</h3>
                                    <p className="card-window-copy">
                                        Model scored rubrics detect algorithmic depth, not just speed.
                                    </p>
                                </Card>
                                <Card>
                                    <div className="card-window-tag">LIVE INSIGHTS</div>
                                    <h3 className="card-window-title">Real-time telemetry</h3>
                                    <p className="card-window-copy">
                                        Track attempts, solve paths, and collaboration signals in-flight.
                                    </p>
                                </Card>
                                <Card>
                                    <div className="card-window-tag">SAFE HIRING</div>
                                    <h3 className="card-window-title">Fraud detection</h3>
                                    <p className="card-window-copy">
                                        Pattern analysis flags anomalies and keeps evaluations fair.
                                    </p>
                                </Card>
                            </CardSwap>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features grid */}
            <section id="features" className="max-w-6xl mx-auto px-4 pb-16">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-mono font-bold text-white mb-2">
                        Everything you need to <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">level up</span>
                    </h2>
                    <p className="text-slate-400">Built for serious competitive programmers and hiring teams.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {features.map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="card group hover:border-indigo-500/40 transition-all duration-200">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-3 group-hover:bg-indigo-500/20 transition-colors">
                                <Icon size={18} className="text-indigo-400" />
                            </div>
                            <h3 className="font-mono font-semibold text-white mb-1">{title}</h3>
                            <p className="text-slate-400 text-sm">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tier showcase */}
            <section className="max-w-3xl mx-auto px-4 pb-16">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-mono font-bold text-white mb-2">Climb the Ranks</h2>
                    <p className="text-slate-400 text-sm">Every contest win earns XP and pushes you up the tier ladder.</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {tiers.map(({ tier, range, cls }) => (
                        <div key={tier} className="card text-center hover:scale-105 transition-transform duration-200">
                            <span className={`${cls} text-base px-3 py-1`}>{tier}</span>
                            <p className="text-xs text-slate-500 mt-2">{range}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-2xl mx-auto px-4 pb-24 text-center">
                <div className="card border-indigo-500/30 space-y-4">
                    <h2 className="text-2xl font-mono font-bold text-white">Ready to compete?</h2>
                    <p className="text-slate-400 text-sm">Join thousands of developers and companies on CodeCraft.</p>
                    <div className="flex justify-center gap-3">
                        <Link to="/register" className="btn-primary px-6 py-2">Create Free Account</Link>
                        <Link to="/login" className="btn-secondary px-6 py-2">Sign In</Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-800 py-6 text-center text-slate-500 text-xs">
                <Code2 size={14} className="inline mr-1 text-indigo-400" />
                CodeCraft — Real-Time Competitive Coding &amp; Hiring Platform
            </footer>
        </div>
    );
}
