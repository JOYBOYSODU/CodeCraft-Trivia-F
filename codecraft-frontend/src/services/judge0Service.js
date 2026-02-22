import axios from "axios";

// Judge0 CE language IDs
export const JUDGE0_LANGUAGES = [
    { id: 71, value: "python", label: "Python 3", monacoLang: "python" },
    { id: 93, value: "javascript", label: "JavaScript (Node)", monacoLang: "javascript" },
    { id: 105, value: "cpp", label: "C++ (GCC 14)", monacoLang: "cpp" },
    { id: 91, value: "java", label: "Java 21", monacoLang: "java" },
];

const judge0 = axios.create({
    baseURL: "/judge0",
    headers: { "Content-Type": "application/json" },
});

const POLL_INTERVAL = 1000; // ms
const MAX_POLLS = 15;

/**
 * Submit code to Judge0 and poll until done.
 * @param {string} sourceCode
 * @param {number} languageId   - Judge0 language ID
 * @param {string} stdin        - test case input
 * @param {number} timeLimitSec - optional
 * @param {number} memLimitKb   - optional
 */
export async function runCode(sourceCode, languageId, stdin = "", timeLimitSec = 5, memLimitKb = 262144) {
    // Submit
    const submitRes = await judge0.post("/submissions?base64_encoded=true&wait=false", {
        source_code: btoa(unescape(encodeURIComponent(sourceCode))),
        language_id: languageId,
        stdin: btoa(unescape(encodeURIComponent(stdin))),
        cpu_time_limit: timeLimitSec,
        memory_limit: memLimitKb,
    });

    const token = submitRes.data?.token;
    if (!token) throw new Error("No submission token received from Judge0");

    // Poll
    for (let i = 0; i < MAX_POLLS; i++) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL));
        const pollRes = await judge0.get(
            `/submissions/${token}?base64_encoded=true&fields=status,stdout,stderr,compile_output,time,memory,status_id`
        );
        const data = pollRes.data;
        const statusId = data.status_id ?? data.status?.id;

        // 1 = In Queue, 2 = Processing
        if (statusId === 1 || statusId === 2) continue;

        // Decode base64 fields
        const decode = (b64) => {
            if (!b64) return "";
            try { return decodeURIComponent(escape(atob(b64))); } catch { return b64; }
        };

        return {
            statusId,
            statusDesc: data.status?.description ?? "Unknown",
            stdout: decode(data.stdout),
            stderr: decode(data.stderr),
            compileOutput: decode(data.compile_output),
            time: data.time,      // seconds as string
            memory: data.memory,  // KB
        };
    }

    throw new Error("Judge0 timed out after polling");
}
