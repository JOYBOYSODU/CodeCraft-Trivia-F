import { useState, useCallback } from "react";
import MonacoEditor from "@monaco-editor/react";
import { ChevronDown } from "lucide-react";

const LANGUAGES = [
    { value: "python", label: "Python", monacoLang: "python" },
    { value: "java", label: "Java", monacoLang: "java" },
    { value: "javascript", label: "JavaScript", monacoLang: "javascript" },
    { value: "cpp", label: "C++", monacoLang: "cpp" },
];

export default function Editor({
    value,
    onChange,
    starterCode = {},
    isContestLive = false,
    height = "100%",
}) {
    const [language, setLanguage] = useState(LANGUAGES[0]);

    const handleLangChange = (val) => {
        const lang = LANGUAGES.find((l) => l.value === val);
        if (lang) {
            setLanguage(lang);
            // Load starter code for selected language if provided
            const starter = starterCode[val] ?? "";
            if (starter && onChange) onChange(starter);
        }
    };

    const handleEditorMount = useCallback((editor) => {
        if (isContestLive) {
            // Disable paste
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
            className="flex flex-col h-full bg-bg border border-border rounded-card overflow-hidden"
            onContextMenu={isContestLive ? (e) => e.preventDefault() : undefined}
        >
            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-surface shrink-0">
                <div className="relative">
                    <select
                        value={language.value}
                        onChange={(e) => handleLangChange(e.target.value)}
                        className="appearance-none bg-bg border border-border text-slate-300 text-xs rounded-input px-3 py-1.5 pr-7 focus:outline-none focus:border-primary cursor-pointer"
                    >
                        {LANGUAGES.map((l) => (
                            <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                {isContestLive && (
                    <span className="badge badge-danger text-xs">
                        🔒 Contest Mode
                    </span>
                )}
            </div>

            {/* Monaco */}
            <div className="flex-1 min-h-0">
                <MonacoEditor
                    height={height}
                    language={language.monacoLang}
                    value={value}
                    onChange={(v) => onChange?.(v ?? "")}
                    theme="vs-dark"
                    onMount={handleEditorMount}
                    options={{
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', monospace",
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        tabSize: 4,
                        lineNumbers: "on",
                        renderLineHighlight: "all",
                        bracketPairColorization: { enabled: true },
                        formatOnPaste: !isContestLive,
                    }}
                />
            </div>
        </div>
    );
}
