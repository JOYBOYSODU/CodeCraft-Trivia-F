export default function Loader({ fullscreen = false, text = "Loading..." }) {
    if (fullscreen) {
        return (
            <div className="fixed inset-0 bg-bg flex items-center justify-center z-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm font-mono">{text}</p>
                </div>
            </div>
        );
    }
    return (
        <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
                <p className="text-slate-400 text-xs font-mono">{text}</p>
            </div>
        </div>
    );
}
