import { useState, useCallback } from "react";
import MonacoEditor from "@monaco-editor/react";
import { JUDGE0_LANGUAGES } from "../services/judge0Service";
import { ChevronDown } from "lucide-react";

export default function Editor({
    value,
    onChange,
    starterCode = {},
    isContestLive = false,
    height = "100%",
    language,           // controlled language value (optional)
    onLanguageChange,   // callback(langObj) when language changes
}) {
    const [internalLang, setInternalLang] = useState(JUDGE0_LANGUAGES[0]);

    // Use controlled lang if provided, else internal
    const activeLang = language ?? internalLang;

    const handleLangChange = (val) => {
        const lang = JUDGE0_LANGUAGES.find((l) => l.value === val);
        if (!lang) return;
        if (onLanguageChange) {
            onLanguageChange(lang);
        } else {
            setInternalLang(lang);
        }
        // Load starter code for selected language
        const starter = starterCode[val] ?? "";
        if (starter && onChange) onChange(starter);
    };

    const handleEditorMount = useCallback((editor) => {
        if (isContestLive) {
            editor.onKeyDown((e) => {
                if ((e.ctrlKey || e.metaKey) && e.code === "KeyV") {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
        }
    }, [isContestLive]);

    return (
        <div
            className="flex flex-col h-full overflow-hidden"
            style={{ background: "#1E1E1E" }}
            onContextMenu={isContestLive ? (e) => e.preventDefault() : undefined}
        >
            {/* Toolbar */}
            <div
                className="flex items-center justify-between px-3 py-2 shrink-0"
                style={{ background: "#252526", borderBottom: "1px solid #3C3C3C" }}
            >
                <div className="relative">
                    <select
                        value={activeLang.value}
                        onChange={(e) => handleLangChange(e.target.value)}
                        className="appearance-none text-xs rounded px-3 py-1.5 pr-7 focus:outline-none cursor-pointer"
                        style={{
                            background: "#3C3C3C",
                            color: "#CCCCCC",
                            border: "1px solid #4C4C4C",
                        }}
                    >
                        {JUDGE0_LANGUAGES.map((l) => (
                            <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                    </select>
                    <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#999" }} />
                </div>
                {isContestLive && (
                    <span className="badge badge-danger text-xs">🔒 Contest Mode</span>
                )}
            </div>

            {/* Monaco */}
            <div className="flex-1 min-h-0">
                <MonacoEditor
                    height={height}
                    language={activeLang.monacoLang}
                    value={value}
                    onChange={(v) => onChange?.(v ?? "")}
                    theme="vs-dark"
                    onMount={handleEditorMount}
                    options={{
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        tabSize: 4,
                        lineNumbers: "on",
                        renderLineHighlight: "all",
                        bracketPairColorization: { enabled: true },
                        formatOnPaste: !isContestLive,
                        padding: { top: 12 },
                    }}
                />
            </div>
        </div>
    );
}
