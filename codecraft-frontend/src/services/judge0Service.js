import axios from "axios";

// ──────────────────────────────────────────────────────────────────────────
// Judge0 CE Public API — https://ce.judge0.com
// No API key required for the free public endpoint.
// ──────────────────────────────────────────────────────────────────────────

const JUDGE0_BASE = "https://ce.judge0.com";

// Judge0 language IDs → mapped from our editor language names
// Full list: https://ce.judge0.com/languages
export const LANGUAGE_IDS = {
    python: 71,   // Python 3 (PyPy 3 = 109)
    javascript: 63,   // Node.js 12.14.0
    java: 62,   // Java (OpenJDK 13.0.1)
    cpp: 54,   // C++ (GCC 9.2.0)
};

// Reverse map for display
export const LANGUAGE_NAMES = {
    71: "Python 3",
    109: "Python 3 (PyPy)",
    63: "JavaScript",
    62: "Java",
    54: "C++",
};

// Judge0 status IDs
const STATUS = {
    1: { label: "In Queue", type: "pending" },
    2: { label: "Processing", type: "pending" },
    3: { label: "Accepted", type: "success" },
    4: { label: "Wrong Answer", type: "error" },
    5: { label: "Time Limit", type: "error" },
    6: { label: "Compile Error", type: "error" },
    7: { label: "Runtime Error", type: "error" },
    8: { label: "Runtime Error", type: "error" },
    9: { label: "Runtime Error", type: "error" },
    10: { label: "Runtime Error", type: "error" },
    11: { label: "Runtime Error", type: "error" },
    12: { label: "Runtime Error", type: "error" },
    13: { label: "Internal Error", type: "error" },
    14: { label: "Exec Format Error", type: "error" },
};

/**
 * Submit code to Judge0 and wait for result.
 *
 * @param {object} opts
 * @param {string}  opts.source_code   - The source code
 * @param {string}  opts.language      - One of: python | javascript | java | cpp
 * @param {string}  [opts.stdin]       - Standard input (optional)
 * @param {number}  [opts.cpu_time_limit]   - In seconds (default: 5)
 * @param {number}  [opts.memory_limit]     - In KB (default: 128000)
 *
 * @returns {Promise<{
 *   status: string,
 *   statusType: "success"|"error"|"pending",
 *   stdout: string|null,
 *   stderr: string|null,
 *   compile_output: string|null,
 *   time: string|null,
 *   memory: number|null,
 *   message: string|null,
 * }>}
 */
export async function runCode({ source_code, language, stdin = "", cpu_time_limit = 5, memory_limit = 128000 }) {
    const language_id = LANGUAGE_IDS[language?.toLowerCase()] ?? 71;

    // Base64 encode inputs (Judge0 accepts base64 with ?base64_encoded=true)
    const b64 = (str) => btoa(unescape(encodeURIComponent(str ?? "")));

    const payload = {
        language_id,
        source_code: b64(source_code),
        stdin: b64(stdin),
        cpu_time_limit,
        memory_limit,
    };

    const response = await axios.post(
        `${JUDGE0_BASE}/submissions?base64_encoded=true&wait=true`,
        payload,
        {
            headers: { "Content-Type": "application/json" },
            timeout: 30000,
        }
    );

    const data = response.data;

    // Decode base64 fields back to UTF-8
    const decode = (b64str) => {
        if (!b64str) return null;
        try {
            return decodeURIComponent(escape(atob(b64str)));
        } catch {
            return b64str;
        }
    };

    const statusInfo = STATUS[data.status?.id] ?? { label: "Unknown", type: "error" };

    return {
        status: statusInfo.label,
        statusType: statusInfo.type,
        statusId: data.status?.id,
        stdout: decode(data.stdout),
        stderr: decode(data.stderr),
        compile_output: decode(data.compile_output),
        time: data.time,     // e.g. "0.003"
        memory: data.memory,   // in KB
        message: decode(data.message),
    };
}

/**
 * Run code against multiple test cases in sequence.
 *
 * @param {object} opts
 * @param {string}  opts.source_code
 * @param {string}  opts.language
 * @param {Array<{input: string, output: string}>} opts.testCases
 * @param {number}  [opts.cpu_time_limit]
 * @param {number}  [opts.memory_limit]
 *
 * @returns {Promise<{
 *   allPassed: boolean,
 *   results: Array<{
 *     testIndex: number,
 *     passed: boolean,
 *     input: string,
 *     expectedOutput: string,
 *     actualOutput: string|null,
 *     status: string,
 *     statusType: string,
 *     time: string|null,
 *     memory: number|null,
 *     stderr: string|null,
 *     compile_output: string|null,
 *   }>
 * }>}
 */
export async function runTestCases({ source_code, language, testCases, cpu_time_limit = 5, memory_limit = 128000 }) {
    const results = [];

    for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        let result;
        try {
            result = await runCode({ source_code, language, stdin: tc.input, cpu_time_limit, memory_limit });
        } catch (err) {
            result = {
                status: "Network Error",
                statusType: "error",
                stdout: null,
                stderr: err.message,
                compile_output: null,
                time: null,
                memory: null,
            };
        }

        const actual = (result.stdout ?? "").trim();
        const expected = (tc.output ?? "").trim();
        const passed = result.statusType === "success" && actual === expected;

        results.push({
            testIndex: i + 1,
            passed,
            input: tc.input,
            expectedOutput: tc.output,
            actualOutput: result.stdout,
            status: result.status,
            statusType: result.statusType,
            time: result.time,
            memory: result.memory,
            stderr: result.stderr,
            compile_output: result.compile_output,
        });
    }

    return {
        allPassed: results.every((r) => r.passed),
        results,
    };
}
