import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building, Clock, CheckCircle, XCircle, Calendar, Shield, Activity, AlertCircle } from "lucide-react";
import api from "../../lib/axios";
import Navbar from "../../components/Navbar";

export default function Dashboard() {
  const [institutions, setInstitutions] = useState([]);
  const [pendingInstitutions, setPendingInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'approved'
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [institutionsRes, pendingRes] = await Promise.all([
        api.get("/admin/institutions"),
        api.get("/admin/institutions/pending")
      ]);
      setInstitutions(institutionsRes.data);
      setPendingInstitutions(pendingRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await api.post(`/admin/institutions/${id}/approve`);
      alert(`✅ Institution approved successfully!\nThe institution can now log in using their email and password.`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error approving institution:", error);
      alert("Failed to approve institution. Please try again.");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Please provide a reason for rejection (optional):");
    try {
      await api.post(`/admin/institutions/${id}/reject`, { reason });
      alert("Institution rejected successfully.");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error rejecting institution:", error);
      alert("Failed to reject institution. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-2">
            Admin Dashboard
          </h1>
          <p className="text-base-content/70">
            Manage institution registrations and system resources
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-base-100 hover:bg-base-200 hover:shadow-lg transition-all duration-200 border border-base-300 hover:border-orange-300 group p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-base-content/70 group-hover:text-orange-600">
                  Pending Requests
                </p>
                <p className="text-3xl font-bold text-base-content group-hover:text-orange-700">
                  {pendingInstitutions.length}
                </p>
              </div>
              <Clock className="h-12 w-12 text-orange-500 group-hover:text-orange-600" />
            </div>
          </div>

          <div className="card bg-base-100 hover:bg-base-200 hover:shadow-lg transition-all duration-200 border border-base-300 hover:border-blue-300 group p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-base-content/70 group-hover:text-blue-600">
                  Total Institutions
                </p>
                <p className="text-3xl font-bold text-base-content group-hover:text-blue-700">
                  {institutions.length}
                </p>
              </div>
              <Building className="h-12 w-12 text-blue-500 group-hover:text-blue-600" />
            </div>
          </div>

          <div className="card bg-base-100 hover:bg-base-200 hover:shadow-lg transition-all duration-200 border border-base-300 hover:border-green-300 group p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-base-content/70 group-hover:text-green-600">
                  Active Institutions
                </p>
                <p className="text-3xl font-bold text-base-content group-hover:text-green-700">
                  {institutions.filter(inst => inst.active).length}
                </p>
              </div>
              <Activity className="h-12 w-12 text-green-500 group-hover:text-green-600" />
            </div>
          </div>

          <div className="card bg-base-100 hover:bg-base-200 hover:shadow-lg transition-all duration-200 border border-base-300 hover:border-purple-300 group p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-base-content/70 group-hover:text-purple-600">
                  System Status
                </p>
                <p className="text-xl font-bold text-base-content group-hover:text-purple-700">
                  Online
                </p>
              </div>
              <Shield className="h-12 w-12 text-purple-500 group-hover:text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tabs tabs-boxed mb-6 bg-base-100 border border-base-300">
          <button 
            className={`tab ${activeTab === 'pending' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <Clock className="h-4 w-4 mr-2" />
            Pending Requests ({pendingInstitutions.length})
          </button>
          <button 
            className={`tab ${activeTab === 'approved' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            <Building className="h-4 w-4 mr-2" />
            Approved Institutions ({institutions.length})
          </button>
        </div>

        {/* Content based on active tab */}
        <div className="card bg-base-100 border border-base-300 p-6">
          {activeTab === 'pending' ? (
            // Pending Institutions Tab
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <AlertCircle className="h-6 w-6 text-orange-500 mr-3" />
                  <h2 className="text-xl font-semibold text-base-content">
                    Pending Institution Requests
                  </h2>
                </div>
                <div className="text-sm text-base-content/70">
                  {pendingInstitutions.length} awaiting approval
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : pendingInstitutions.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-base-content/30 mx-auto mb-4" />
                  <p className="text-base-content/60">No pending requests.</p>
                  <p className="text-sm text-base-content/40">
                    New institution registration requests will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingInstitutions.map((pending) => (
                    <div
                      key={pending._id}
                      className="card bg-base-100 border border-orange-200 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-base-200"
                    >
                      <div className="card-body p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-base-content mb-2">
                              {pending.name}
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                              <div>
                                <span className="font-medium text-base-content/80">EIIN:</span>
                                <span className="ml-2 text-base-content/70 font-mono bg-base-200 px-2 py-1 rounded">
                                  {pending.eiin}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-base-content/80">Email(s):</span>
                                <span className="ml-2 text-base-content/70">{(pending.emails || []).join(', ')}</span>
                              </div>
                              {pending.phone && (
                                <div>
                                  <span className="font-medium text-base-content/80">Phone:</span>
                                  <span className="ml-2 text-base-content/70">{pending.phone}</span>
                                </div>
                              )}
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 text-base-content/60 mr-2" />
                                <span className="text-base-content/70">
                                  {new Date(pending.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            {pending.address && (
                              <div className="mb-4">
                                <span className="font-medium text-base-content/80">Address:</span>
                                <p className="mt-1 text-base-content/70">{pending.address}</p>
                              </div>
                            )}

                            {pending.description && (
                              <div className="mb-4">
                                <span className="font-medium text-base-content/80">Description:</span>
                                <p className="mt-1 text-base-content/70">{pending.description}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col space-y-3 ml-4">
                            <button
                              onClick={() => handleApprove(pending._id)}
                              className="btn btn-primary min-w-[100px]"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(pending._id)}
                              className="btn btn-outline min-w-[100px]"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Approved Institutions Tab
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Building className="h-6 w-6 text-primary mr-3" />
                  <h2 className="text-xl font-semibold text-base-content">
                    Approved Institutions
                  </h2>
                </div>
                <div className="text-sm text-base-content/70">
                  Total: {institutions.length}
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : institutions.length === 0 ? (
                <div className="text-center py-12">
                  <Building className="h-12 w-12 text-base-content/30 mx-auto mb-4" />
                  <p className="text-base-content/60">No approved institutions found.</p>
                  <p className="text-sm text-base-content/40">
                    Approved institutions will appear here
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {institutions.map((institution) => (
                    <div
                      key={institution._id}
                      className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-base-200 hover:border-blue-300 group"
                    >
                      <div className="card-body p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="card-title text-lg font-semibold text-base-content group-hover:text-blue-700">
                            {institution.name}
                          </h3>
                          <div className={`badge ${institution.active ? 'badge-success' : 'badge-error'} badge-sm`}>
                            {institution.active ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                        
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center">
                            <span className="font-medium text-base-content/80 min-w-[50px]">EIIN:</span>
                            <span className="ml-2 text-base-content/70 font-mono bg-base-200 px-2 py-1 rounded text-xs">
                              {institution.eiin}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium text-base-content/80 min-w-[50px]">Email:</span>
                            <span className="ml-2 text-base-content/70 truncate">
                              {(institution.emails && institution.emails.length > 0) ? institution.emails[0] : ''}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-base-content/60 mr-2" />
                            <span className="text-base-content/70">
                              {new Date(institution.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
