import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { parseError } from '../../utils/errorHandler';
import ErrorModal from '../../components/ErrorModal';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Building2, Mail, Phone, MapPin, Globe } from 'lucide-react';

export default function CompanyApprovals() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingCompanies();
  }, []);

  const fetchPendingCompanies = async () => {
    setLoading(true);
    try {
      const res = await adminService.getPendingCompanies();
      setCompanies(res.companies || []);
    } catch (err) {
      const parsedError = parseError(err);
      setModalError(parsedError);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedCompany) return;
    
    const aiLimit = prompt('AI Requests Limit (default 10):', '10');
    if (aiLimit === null) return;

    setActionLoading(true);
    try {
      await adminService.approveCompany(selectedCompany.id, { 
        aiRequestsLimit: parseInt(aiLimit) 
      });
      toast.success('Company approved successfully!');
      setSelectedCompany(null);
      fetchPendingCompanies();
    } catch (err) {
      const parsedError = parseError(err);
      setModalError(parsedError);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCompany) return;

    const reason = prompt('Rejection reason:');
    if (reason === null) return;

    setActionLoading(true);
    try {
      await adminService.rejectCompany(selectedCompany.id, { 
        rejectionReason: reason 
      });
      toast.success('Company rejected');
      setSelectedCompany(null);
      fetchPendingCompanies();
    } catch (err) {
      const parsedError = parseError(err);
      setModalError(parsedError);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 size={32} className="text-primary" />
            Company Approvals
          </h1>
          <p className="text-slate-600 mt-2">Review and approve pending company applications</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg">
            <p className="text-slate-600">No pending company approvals</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {companies.map(company => (
              <div key={company.id} className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900">{company.company_name}</h3>
                    <div className="grid grid-cols-2 gap-3 mt-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-primary" />
                        {company.company_email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-primary" />
                        {company.contact_phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe size={16} className="text-primary" />
                        {company.company_website}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-primary" />
                        {company.company_size}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCompany(company)}
                    className="px-4 py-2 bg-primary text-black font-medium rounded hover:bg-yellow-400 transition-colors"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Review Company: {selectedCompany.company_name}</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Company Email</label>
                    <p className="text-slate-900 font-medium">{selectedCompany.company_email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Contact Person</label>
                    <p className="text-slate-900 font-medium">{selectedCompany.contact_person}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Phone</label>
                    <p className="text-slate-900 font-medium">{selectedCompany.contact_phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Type</label>
                    <p className="text-slate-900 font-medium">{selectedCompany.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Company Size</label>
                    <p className="text-slate-900 font-medium">{selectedCompany.company_size}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Applied Date</label>
                    <p className="text-slate-900 font-medium">
                      {new Date(selectedCompany.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-slate-600">Website</label>
                  <a href={selectedCompany.company_website} target="_blank" rel="noopener noreferrer" 
                    className="text-primary hover:underline">{selectedCompany.company_website}</a>
                </div>

                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-slate-600">Address</label>
                  <p className="text-slate-900">{selectedCompany.address}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-8 justify-end">
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="px-6 py-2 bg-slate-200 text-slate-900 font-medium rounded hover:bg-slate-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="px-6 py-2 bg-red-500 text-white font-medium rounded hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <XCircle size={18} />
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="px-6 py-2 bg-primary text-black font-medium rounded hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle size={18} />
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ErrorModal error={modalError} onClose={() => setModalError(null)} />
    </div>
  );
}
