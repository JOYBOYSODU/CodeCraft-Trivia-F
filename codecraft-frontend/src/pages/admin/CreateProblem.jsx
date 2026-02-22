import React, { useState } from 'react';
import { problemService } from '../../services/problemService';
import { parseError } from '../../utils/errorHandler';
import ErrorModal from '../../components/ErrorModal';
import { toast } from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

export default function CreateProblem() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'MEDIUM',
    points: 100,
    time_limit_ms: 2000,
    memory_limit_mb: 256,
    tags: [],
    constraints: [],
    hints: [],
    example1: '',
    example2: '',
    example3: '',
    starter_code1: '', // Python
    starter_code2: '', // Java
    starter_code3: '', // JavaScript
    starter_code4: '', // C++
    test_cases: [],
    solution_code: '',
    is_ai_generated: false
  });

  const [loading, setLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayChange = (e, index, field) => {
    const { value } = e.target;
    const arr = [...formData[field]];
    arr[index] = value;
    setFormData(prev => ({
      ...prev,
      [field]: arr
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addTestCase = () => {
    setFormData(prev => ({
      ...prev,
      test_cases: [...prev.test_cases, { input: '', output: '', is_sample: false }]
    }));
  };

  const removeTestCase = (index) => {
    setFormData(prev => ({
      ...prev,
      test_cases: prev.test_cases.filter((_, i) => i !== index)
    }));
  };

  const handleTestCaseChange = (index, key, value) => {
    const tc = [...formData.test_cases];
    tc[index][key] = value;
    setFormData(prev => ({ ...prev, test_cases: tc }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    if (formData.test_cases.length === 0) {
      toast.error('Please add at least one test case');
      return;
    }

    setLoading(true);
    try {
      const result = await problemService.createProblem(formData);
      const problemId = result.data?.id || result.data?.problemId || result.id || result.problemId;
      toast.success(problemId ? `Problem created successfully! ID: ${problemId}` : 'Problem created successfully!');

      // Reset form
      setFormData({
        title: '',
        description: '',
        difficulty: 'MEDIUM',
        points: 100,
        time_limit_ms: 2000,
        memory_limit_mb: 256,
        tags: [],
        constraints: [],
        hints: [],
        example1: '',
        example2: '',
        example3: '',
        starter_code1: '',
        starter_code2: '',
        starter_code3: '',
        starter_code4: '',
        test_cases: [],
        solution_code: '',
        is_ai_generated: false
      });
    } catch (err) {
      const parsedError = parseError(err);
      setModalError(parsedError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">📝 Create New Problem</h1>

        {modalError && <ErrorModal error={modalError} onDismiss={() => setModalError(null)} />}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Basic Information */}
          <fieldset className="border-b-2 border-slate-200 pb-8">
            <legend className="text-xl font-bold text-slate-900 mb-6">📝 Basic Information</legend>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Two Sum, Palindrome Check"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Detailed problem statement..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Difficulty *</label>
                  <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400">
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Points</label>
                  <input
                    type="number"
                    name="points"
                    value={formData.points}
                    onChange={handleChange}
                    min="10"
                    max="1000"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Time Limit (ms)</label>
                  <input
                    type="number"
                    name="time_limit_ms"
                    value={formData.time_limit_ms}
                    onChange={handleChange}
                    min="100"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Memory Limit (MB)</label>
                <input
                  type="number"
                  name="memory_limit_mb"
                  value={formData.memory_limit_mb}
                  onChange={handleChange}
                  min="32"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>
          </fieldset>

          {/* Tags & Constraints */}
          <fieldset className="border-b-2 border-slate-200 pb-8">
            <legend className="text-xl font-bold text-slate-900 mb-6">🏷️ Tags & Constraints</legend>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tags</label>
                {formData.tags.map((tag, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => handleArrayChange(e, i, 'tags')}
                      placeholder="e.g., array, hashmap, sorting"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('tags', i)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('tags')}
                  className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition font-semibold flex items-center gap-2"
                >
                  <Plus size={16} /> Add Tag
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Constraints</label>
                {formData.constraints.map((c, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={c}
                      onChange={(e) => handleArrayChange(e, i, 'constraints')}
                      placeholder="e.g., 1 <= n <= 10^5"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('constraints', i)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('constraints')}
                  className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition font-semibold flex items-center gap-2"
                >
                  <Plus size={16} /> Add Constraint
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Hints (Optional)</label>
                {formData.hints.map((hint, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <textarea
                      value={hint}
                      onChange={(e) => handleArrayChange(e, i, 'hints')}
                      rows="2"
                      placeholder="Hint for solving..."
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('hints', i)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('hints')}
                  className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition font-semibold flex items-center gap-2"
                >
                  <Plus size={16} /> Add Hint
                </button>
              </div>
            </div>
          </fieldset>

          {/* Examples */}
          <fieldset className="border-b-2 border-slate-200 pb-8">
            <legend className="text-xl font-bold text-slate-900 mb-6">📌 Examples</legend>

            {[1, 2, 3].map(num => (
              <div key={num} className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Example {num}</label>
                <textarea
                  name={`example${num}`}
                  value={formData[`example${num}`]}
                  onChange={handleChange}
                  rows="3"
                  placeholder={`Input: ...\nOutput: ...\nExplanation: ...`}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            ))}
          </fieldset>

          {/* Starter Code */}
          <fieldset className="border-b-2 border-slate-200 pb-8">
            <legend className="text-xl font-bold text-slate-900 mb-6">💻 Starter Code (by Language)</legend>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Python Starter</label>
                <textarea
                  name="starter_code1"
                  value={formData.starter_code1}
                  onChange={handleChange}
                  rows="4"
                  placeholder="def solve(n):\n    pass"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Java Starter</label>
                <textarea
                  name="starter_code2"
                  value={formData.starter_code2}
                  onChange={handleChange}
                  rows="4"
                  placeholder="public class Solution {\n    // Your code\n}"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">JavaScript Starter</label>
                <textarea
                  name="starter_code3"
                  value={formData.starter_code3}
                  onChange={handleChange}
                  rows="4"
                  placeholder="function solve(n) {\n    // Your code\n}"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">C++ Starter</label>
                <textarea
                  name="starter_code4"
                  value={formData.starter_code4}
                  onChange={handleChange}
                  rows="4"
                  placeholder="#include <bits/stdc++.h>\nusing namespace std;"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono text-sm"
                />
              </div>
            </div>
          </fieldset>

          {/* Test Cases */}
          <fieldset className="border-b-2 border-slate-200 pb-8">
            <legend className="text-xl font-bold text-slate-900 mb-6">✓ Test Cases *</legend>

            {formData.test_cases.map((tc, i) => (
              <div key={i} className="mb-6 p-4 border border-slate-300 rounded-lg bg-slate-50">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-slate-700">Test Case {i + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeTestCase(i)}
                    className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Input</label>
                    <textarea
                      value={tc.input}
                      onChange={(e) => handleTestCaseChange(i, 'input', e.target.value)}
                      rows="3"
                      placeholder="Input data..."
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Expected Output</label>
                    <textarea
                      value={tc.output}
                      onChange={(e) => handleTestCaseChange(i, 'output', e.target.value)}
                      rows="3"
                      placeholder="Expected output..."
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-slate-700">
                  <input
                    type="checkbox"
                    checked={tc.is_sample}
                    onChange={(e) => handleTestCaseChange(i, 'is_sample', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-semibold">Show as Sample to Players</span>
                </label>
              </div>
            ))}

            <button
              type="button"
              onClick={addTestCase}
              className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition font-semibold flex items-center gap-2"
            >
              <Plus size={16} /> Add Test Case
            </button>
          </fieldset>

          {/* Solution & Metadata */}
          <fieldset className="border-b-2 border-slate-200 pb-8">
            <legend className="text-xl font-bold text-slate-900 mb-6">🔐 Solution & Metadata</legend>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Reference Solution</label>
                <textarea
                  name="solution_code"
                  value={formData.solution_code}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Reference implementation..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono text-sm"
                />
              </div>

              <label className="flex items-center gap-2 text-slate-700">
                <input
                  type="checkbox"
                  name="is_ai_generated"
                  checked={formData.is_ai_generated}
                  onChange={handleChange}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-semibold">AI Generated Problem</span>
              </label>
            </div>
          </fieldset>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-yellow-400 text-slate-900 font-bold rounded-lg hover:bg-yellow-500 transition disabled:opacity-50"
            >
              {loading ? '⏳ Creating...' : '✓ Create Problem'}
            </button>
          </div>
        </form>
      </div>

      {modalError && <ErrorModal error={modalError} onDismiss={() => setModalError(null)} />}
    </div>
  );
}
