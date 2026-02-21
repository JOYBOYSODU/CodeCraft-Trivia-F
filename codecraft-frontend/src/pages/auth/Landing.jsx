import { Link, useNavigate } from "react-router-dom";
import { Code2, Swords, Trophy, ChevronRight, Zap, Shield, Users, Briefcase } from "lucide-react";

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
            <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
                <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 h-14">
                    <Link to="/" className="flex items-center gap-2">
                        <Code2 className="text-indigo-400" size={22} />
                        <span className="font-mono font-bold text-lg bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                            CodeCraft
                        </span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link to="/login" className="btn-secondary text-sm px-4 py-1.5">Log In</Link>
                        <Link to="/register" className="btn-primary  text-sm px-4 py-1.5">Sign Up Free</Link>
                    </div>
                </nav>
            </header>

            {/* Hero */}
            <section className="max-w-4xl mx-auto px-4 pt-24 pb-16 text-center">
                <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-1.5 text-indigo-300 text-xs font-semibold mb-6">
                    <Zap size={12} /> Real-time competitive coding + hiring
                </div>
                <h1 className="text-5xl font-mono font-bold text-white mb-5 leading-tight">
                    Code.{" "}
                    <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                        Compete.
                    </span>{" "}
                    Get Hired.
                </h1>
                <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
                    The all-in-one platform where developers race to solve problems, companies find talent through live contests, and every submission makes your rank climb.
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                    <button onClick={() => navigate("/register", { state: { role: "PLAYER" } })}
                        className="btn-primary flex items-center gap-2 px-6 py-2.5 text-base">
                        Start Competing <ChevronRight size={16} />
                    </button>
                    <button onClick={() => navigate("/register", { state: { role: "HOST" } })}
                        className="btn-secondary flex items-center gap-2 px-6 py-2.5 text-base">
                        Host a Contest <Briefcase size={15} />
                    </button>
                </div>
                {/* Already have account */}
                <p className="mt-5 text-sm text-slate-500">
                    Already have an account?{" "}
                    <Link to="/login" className="text-indigo-400 hover:underline font-medium">Sign in</Link>
                </p>
            </section>

            {/* Features grid */}
            <section className="max-w-6xl mx-auto px-4 pb-16">
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
