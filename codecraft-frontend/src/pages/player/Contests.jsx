import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Trophy,
  Users,
  Clock,
  Building2,
  Briefcase,
  Lock,
  X,
} from "lucide-react";
import { contestService } from "../../services/contestService";

const STATUS_CLASSES = {
  LIVE: "status-live",
  UPCOMING: "status-upcoming",
  ENDED: "status-ended",
  DRAFT: "status-draft",
};

function formatCountdown(ms) {
  if (ms <= 0) return "Starting soon";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const dayPart = days > 0 ? `${days}d ` : "";
  return `${dayPart}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function ContestCard({
  contest,
  onRegister,
  onJoinLive,
  onViewResults,
  inviteValue,
  onInviteChange,
  onInviteSubmit,
}) {
  const isHiring = contest.shortlist_count != null;
  const isHosted = contest.host_id != null;
  const statusCls = STATUS_CLASSES[contest.status] ?? "badge badge-primary";
  const [countdown, setCountdown] = useState("");
  const techStack = contest.tech_stack ?? contest.techStack ?? contest.stack ?? [];

  useEffect(() => {
    if (contest.status !== "UPCOMING") return;
    const tick = () => {
      const diff = new Date(contest.start_time).getTime() - Date.now();
      setCountdown(formatCountdown(diff));
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [contest.status, contest.start_time]);

  return (
    <Link
      to={`/contests/${contest.id}`}
      className={`card contest-card hover:border-indigo-500/40 transition-all duration-200 space-y-3 flex flex-col group ${
        contest.status === "ENDED" ? "opacity-75" : ""
      }`}
    >
      {isHiring && <div className="contest-ribbon">Hiring</div>}

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
            <span className={statusCls}>
              {contest.status === "LIVE" && <span className="contest-live-dot" />}
              {contest.status}
            </span>
            {isHosted && (
              <span className="badge badge-secondary flex items-center gap-1">
                <Building2 size={9} /> Company
              </span>
            )}
            {isHiring && (
              <span className="badge badge-warning flex items-center gap-1">
                <Briefcase size={9} /> Hiring
              </span>
            )}
            {!contest.is_public && (
              <span className="badge badge-danger flex items-center gap-1">
                <Lock size={9} /> Private
              </span>
            )}
          </div>
          <h3 className="font-mono font-semibold text-slate-100 truncate group-hover:text-indigo-300 transition-colors">
            {contest.title}
          </h3>
          {contest.description && (
            <p className="text-slate-400 text-xs mt-1 line-clamp-2">
              {contest.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Clock size={11} />{contest.duration_mins}m
        </span>
        <span className="flex items-center gap-1">
          <Users size={11} />{contest.participant_count ?? 0}
        </span>
        {contest.job_role && (
          <span className="flex items-center gap-1">
            <Briefcase size={11} />{contest.job_role}
          </span>
        )}
      </div>

      {contest.status === "UPCOMING" && (
        <div className="contest-countdown">
          Starts in <span>{countdown}</span>
        </div>
      )}

      {isHosted && Array.isArray(techStack) && techStack.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {techStack.slice(0, 3).map((t) => (
            <span key={t} className="chip">{t}</span>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-500">
        {contest.status === "LIVE"
          ? `Ends: ${new Date(contest.end_time).toLocaleString()}`
          : contest.status === "UPCOMING"
            ? `Starts: ${new Date(contest.start_time).toLocaleString()}`
            : `Ended: ${new Date(contest.end_time).toLocaleString()}`}
      </p>

      {contest.is_public ? (
        <div className="mt-auto w-full">
          {contest.status === "UPCOMING" && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onRegister?.(contest);
              }}
              className="btn-secondary text-center text-sm py-2 w-full"
            >
              Register
            </button>
          )}
          {contest.status === "LIVE" && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onJoinLive?.(contest);
              }}
              className="btn-primary text-center text-sm py-2 w-full"
            >
              Join Now
            </button>
          )}
          {contest.status === "ENDED" && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onViewResults?.(contest);
              }}
              className="btn-secondary text-center text-sm py-2 w-full"
            >
              View Results
            </button>
          )}
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onInviteSubmit?.(contest);
          }}
          className="mt-auto flex items-center gap-2"
        >
          <input
            value={inviteValue}
            onChange={(e) => onInviteChange?.(contest, e.target.value)}
            placeholder="Invite code"
            className="input-field text-sm"
          />
          <button type="submit" className="btn-primary text-sm px-3">
            Join
          </button>
        </form>
      )}
    </Link>
  );
}

export default function Contests() {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [inviteCode, setInviteCode] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerContest, setRegisterContest] = useState(null);
  const [inviteCodes, setInviteCodes] = useState({});

  useEffect(() => {
    setLoading(true);
    const params = filter !== "ALL" ? { status: filter } : {};
    contestService
      .getContests(params)
      .then((res) => setContests(res.data?.content ?? res.data ?? []))
      .catch(() => toast.error("Failed to load contests"))
      .finally(() => setLoading(false));
  }, [filter]);

  const handleJoinPrivate = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    try {
      const res = await contestService.joinByInvite(inviteCode.trim());
      toast.success("Joined contest!");
      setInviteCode("");
      const id = res.data?.contest_id ?? res.data?.id;
      if (id) navigate(`/contests/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Invalid invite code");
    }
  };

  const handleRegisterOpen = (contest) => {
    setRegisterContest(contest);
    setRegisterOpen(true);
  };

  const handleModeSelect = (mode) => {
    if (!registerContest) return;
    navigate(`/contests/${registerContest.id}?mode=${mode}`);
    setRegisterOpen(false);
    setRegisterContest(null);
  };

  const handleJoinLive = (contest) => {
    navigate(`/contests/${contest.id}`);
  };

  const handleViewResults = (contest) => {
    navigate(`/leaderboard/${contest.id}`);
  };

  const handleInviteSubmit = async (contest) => {
    const code = inviteCodes[contest.id]?.trim();
    if (!code) return;
    try {
      const res = await contestService.joinByInvite(code);
      toast.success("Joined contest!");
      const id = res.data?.contest_id ?? res.data?.id ?? contest.id;
      navigate(`/contests/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Invalid invite code");
    }
  };

  const FILTERS = ["ALL", "LIVE", "UPCOMING", "ENDED"];
  const live = contests.filter((c) => c.status === "LIVE");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-mono font-bold text-slate-100">Contests</h1>
          {live.length > 0 && (
            <p className="text-sm text-green-600 mt-0.5">
              <span className="contest-live-dot" /> {live.length} live contest{live.length > 1 ? "s" : ""} happening now
            </p>
          )}
        </div>
        <form onSubmit={handleJoinPrivate} className="flex items-center gap-2">
          <input
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="Private invite code…"
            className="input-field w-44 text-sm"
          />
          <button type="submit" className="btn-primary text-sm px-3 py-2 flex items-center gap-1">
            <Lock size={13} /> Join
          </button>
        </form>
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === f ? "bg-black text-white" : "bg-slate-100 text-slate-600 hover:text-black"
            }`}
          >
            {f === "LIVE" && <span className="mr-1">🔴</span>}{f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`contest-skeleton-${i}`} className="card space-y-3">
              <div className="skeleton skeleton-line" style={{ width: "60%" }} />
              <div className="skeleton" style={{ height: "14px", width: "85%" }} />
              <div className="skeleton" style={{ height: "14px", width: "70%" }} />
              <div className="skeleton" style={{ height: "32px", width: "100%" }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contests.length === 0 ? (
            <div className="col-span-full text-center py-16 text-slate-500 card">
              <Trophy size={32} className="mx-auto mb-2 opacity-30" />
              <p>No contests found</p>
              <button onClick={() => setFilter("ALL")} className="text-indigo-400 hover:underline text-sm mt-1">
                Show all contests
              </button>
            </div>
          ) : (
            contests.map((c) => (
              <ContestCard
                key={c.id}
                contest={c}
                onRegister={handleRegisterOpen}
                onJoinLive={handleJoinLive}
                onViewResults={handleViewResults}
                inviteValue={inviteCodes[c.id] ?? ""}
                onInviteChange={(contest, value) =>
                  setInviteCodes((prev) => ({ ...prev, [contest.id]: value }))
                }
                onInviteSubmit={handleInviteSubmit}
              />
            ))
          )}
        </div>
      )}

      {registerOpen && registerContest && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Register for {registerContest.title}</h3>
              <button className="modal-close" onClick={() => setRegisterOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <p className="modal-copy">Choose how you want to participate.</p>
            <div className="modal-actions">
              <button className="btn-primary" onClick={() => handleModeSelect("solo")}>
                Solo
              </button>
              <button className="btn-secondary" onClick={() => handleModeSelect("team")}>
                Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
