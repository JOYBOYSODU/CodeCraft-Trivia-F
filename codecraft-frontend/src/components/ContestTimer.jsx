import { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";

function pluralize(val) {
    return `${String(val).padStart(2, "0")}`;
}

export default function ContestTimer({ endTime, onExpire }) {
    const [timeLeft, setTimeLeft] = useState(null);
    const onExpireRef = useRef(onExpire);
    useEffect(() => {
        onExpireRef.current = onExpire;
    }, [onExpire]);

    useEffect(() => {
        const end = new Date(endTime).getTime();

        const tick = () => {
            const diff = end - Date.now();
            if (diff <= 0) {
                setTimeLeft(0);
                onExpireRef.current?.();
                return null; // stop
            }
            setTimeLeft(diff);
            return diff;
        };

        const remaining = tick();
        if (remaining === null || remaining <= 0) return;

        const interval = setInterval(() => {
            const r = tick();
            if (r === null || r <= 0) clearInterval(interval);
        }, 1000);

        return () => clearInterval(interval);
    }, [endTime]);

    if (timeLeft === null) return null;

    const totalSecs = Math.floor(timeLeft / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    // Simple approach: color by absolute time remaining
    let colorClass = "text-success";
    if (totalSecs < 600) colorClass = "text-danger";
    else if (totalSecs < 1800) colorClass = "text-warning";

    if (timeLeft === 0) {
        return (
            <div className="flex items-center gap-2 badge badge-danger">
                <Clock size={14} />
                <span className="font-mono font-bold">TIME UP</span>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-2 font-mono font-bold text-base ${colorClass}`}>
            <Clock size={15} className="shrink-0" />
            <span>
                {pluralize(hours)}:{pluralize(minutes)}:{pluralize(seconds)}
            </span>
        </div>
    );
}
