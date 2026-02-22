import React, { useState, useEffect } from 'react';
import { contestService, problemService } from '../../services/contestService';
import { parseError } from '../../utils/errorHandler';
import ErrorModal from '../../components/ErrorModal';
import toast from 'react-hot-toast';
import { Plus, Calendar, Trophy } from 'lucide-react';

export default function CreateContest() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    problems: [],
    status: 'DRAFT',
    start_time: '',
    end_time: '',
    duration_mins: 120,
    is_public: true,
    invite_code: '',
    job_role: '',
    shortlist_count: 5,
    min_score: 0,
    is_ai_generated: false
  });

  const [problems, setProblems] = useState([]);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingProblems, setFetchingProblems] = useState(false);
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    setFetchingProblems(true);
    try {
      const res = await problemService.getAllProblems();
      setProblems(res.problems || []);
    } catch (err) {
      const parsedError = parseError(err);
      setModalError(parsedError);
    } finally {
      setFetchingProblems(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProblemToggle = (problemId) => {
    setSelectedProblems(prev => 
      prev.includes(problemId)
        ? prev.filter(id => id !== problemId)
        : [...prev, problemId]
    );
  };

  const generateInviteCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData(prev => ({ ...prev, invite_code: code }));
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
    if (selectedProblems.length === 0) {
      toast.error('Please select at least one problem');
      return;
    }

    const startTime = new Date(formData.start_time);
    const endTime = new Date(formData.end_time);
    if (startTime >= endTime) {
      toast.error('Start time must be before end time');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        problems: selectedProblems
      };

      await contestService.createContest(payload);
      toast.success('Contest created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        problems: [],
        status: 'DRAFT',
        start_time: '',
        end_time: '',
        duration_mins: 120,
        is_public: true,
        invite_code: '',
        job_role: '',
        shortlist_count: 5,
        min_score: 0,
        is_ai_generated: false
      });
      setSelectedProblems([]);
    } catch (err) {
      const parsedError = parseError(err);
      setModalError(parsedError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy size={32} className="text-primary" />
            Create New Contest
          </h1>
          <p className="text-slate-600 mt-2">Set up a competitive programming contest</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Contest Details */}
          <fieldset className="bg-white p-6 rounded-lg border border-slate-200">
            <legend className="text-lg font-semibold text-slate-900">📝 Contest Details</legend>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange}
                  required placeholder="e.g., Weekly Coding Challenge #5" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                <textarea name="description" value={formData.description} onChange={handleChange}
                  required rows="4" placeholder="Contest description and rules..." className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="DRAFT">DRAFT (Not published)</option>
                  <option value="UPCOMING">UPCOMING (Scheduled)</option>
                  <option value="LIVE">LIVE (Running now)</option>
                  <option value="ENDED">ENDED (Past contest)</option>
                </select>
              </div>
            </div>
          </fieldset>

          {/* Timing */}
          <fieldset className="bg-white p-6 rounded-lg border border-slate-200">
            <legend className="text-lg font-semibold text-slate-900">⏰ Timing</legend>
            
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Time *</label>
                  <input type="datetime-local" name="start_time" value={formData.start_time} onChange={handleChange}
                    required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Time *</label>
                  <input type="datetime-local" name="end_time" value={formData.end_time} onChange={handleChange}
                    required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Duration (minutes)</label>
                <input type="number" name="duration_mins" value={formData.duration_mins} onChange={handleChange}
                  min="15" max="480" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
          </fieldset>

          {/* Problems Selection */}
          <fieldset className="bg-white p-6 rounded-lg border border-slate-200">
            <legend className="text-lg font-semibold text-slate-900">🔢 Problems ({selectedProblems.length} selected)</legend>
            
            <div className="mt-4">
              {fetchingProblems ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : problems.length === 0 ? (
                <p className="text-slate-600 py-8 text-center">No problems available</p>
              ) : (
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {problems.map(problem => (
                    <label key={problem.id} className="flex items-start gap-3 p-3 border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedProblems.includes(problem.id)}
                        onChange={() => handleProblemToggle(problem.id)}
                        className="w-4 h-4 mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{problem.title}</p>
                        <div className="flex gap-4 text-sm text-slate-600 mt-1">
                          <span>Difficulty: <strong>{problem.difficulty}</strong></span>
                          <span>Points: <strong>{problem.points}</strong></span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <button type="button" onClick={fetchProblems} className="text-primary hover:text-yellow-600 flex items-center gap-1 mt-4">
                <Plus size={16} /> Refresh Problems
              </button>
            </div>
          </fieldset>

          {/* Company Settings */}
          <fieldset className="bg-white p-6 rounded-lg border border-slate-200">
            <legend className="text-lg font-semibold text-slate-900">🏢 Company Settings</legend>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job Role (for recruitment contests)</label>
                <input type="text" name="job_role" value={formData.job_role} onChange={handleChange}
                  placeholder="e.g., Senior Software Engineer" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Shortlist Count</label>
                  <input type="number" name="shortlist_count" value={formData.shortlist_count} onChange={handleChange}
                    min="1" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Score to Shortlist</label>
                  <input type="number" name="min_score" value={formData.min_score} onChange={handleChange}
                    min="0" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
            </div>
          </fieldset>

          {/* Visibility & Access */}
          <fieldset className="bg-white p-6 rounded-lg border border-slate-200">
            <legend className="text-lg font-semibold text-slate-900">🔒 Visibility & Access</legend>
            
            <div className="space-y-4 mt-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="is_public" checked={formData.is_public} onChange={handleChange} className="w-4 h-4" />
                <span className="text-sm text-slate-700">Public Contest (anyone can join)</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Invite Code (required if not public)</label>
                <div className="flex gap-2">
                  <input type="text" name="invite_code" value={formData.invite_code} readOnly
                    placeholder="Auto-generated" className="flex-1 px-3 py-2 border border-slate-300 rounded-md bg-slate-50" />
                  <button type="button" onClick={generateInviteCode} className="px-4 py-2 bg-slate-200 text-slate-900 font-medium rounded hover:bg-slate-300 transition-colors">
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </fieldset>

          {/* Metadata */}
          <fieldset className="bg-white p-6 rounded-lg border border-slate-200">
            <legend className="text-lg font-semibold text-slate-900">📋 Metadata</legend>
            
            <div className="mt-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="is_ai_generated" checked={formData.is_ai_generated} onChange={handleChange} className="w-4 h-4" />
                <span className="text-sm text-slate-700">AI Generated Contest</span>
              </label>
            </div>
          </fieldset>

          {/* Submit */}
          <div className="flex gap-4">
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-primary text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Trophy size={18} />
                  Create Contest
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <ErrorModal error={modalError} onClose={() => setModalError(null)} />
    </div>
  );
}
