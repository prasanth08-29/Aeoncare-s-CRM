import React, { useState, useEffect } from "react";
import axios from "axios";
import LeadForm from "../components/LeadForm";
import LeadItem from "../components/LeadItem";

const Dashboard = ({ user }) => {
    const [leads, setLeads] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLeads, setTotalLeads] = useState(0);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");

    const fetchLeads = async (currentPage = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const res = await axios.get(`/api/leads?page=${currentPage}&limit=10`, config);

            if (res.data.leads) {
                setLeads(res.data.leads);
                setTotalPages(res.data.totalPages);
                setPage(res.data.currentPage);
                setTotalLeads(res.data.totalLeads);
            } else {
                setLeads([]);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads(page);
    }, [page]);

    const handleLeadAdded = (newLead) => {
        // If we simply add it to the top, it might not respect pagination order if we are strict.
        // But for UX, showing it immediately is good. 
        // Or we can re-fetch page 1.
        fetchLeads(1);
    };

    const handleLeadUpdated = (updatedLead) => {
        setLeads(
            leads.map((lead) => (lead._id === updatedLead._id ? updatedLead : lead))
        );
    };

    const handleLeadDeleted = (id) => {
        setLeads(leads.filter((lead) => lead._id !== id));
    };

    const filteredLeads = leads.filter((lead) => {
        const term = searchTerm.toLowerCase();
        return (
            (lead.phone && lead.phone.includes(term)) ||
            (lead.product && lead.product.toLowerCase().includes(term)) ||
            (lead.remarks && lead.remarks.toLowerCase().includes(term))
        );
    });

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-gray-800">
                    Recent Leads
                </h1>

                <LeadForm onLeadAdded={handleLeadAdded} />

                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-gray-700">
                            Leads List
                        </h2>
                        <input
                            type="text"
                            placeholder="Filter by phone, product..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-200 w-64"
                        />
                    </div>

                    {loading ? (
                        <p className="text-gray-500">Loading leads...</p>
                    ) : filteredLeads.length > 0 ? (
                        filteredLeads.map((lead, index) => (
                            <LeadItem
                                key={lead._id}
                                lead={lead}
                                sNo={totalLeads - ((page - 1) * 10 + index)}
                                currentUser={user}
                                onLeadUpdated={handleLeadUpdated}
                                onLeadDeleted={handleLeadDeleted}
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 italic">
                            No leads found. Add one above!
                        </p>
                    )}

                    {/* Pagination Controls */}
                    <div className="flex justify-between items-center mt-4 border-t pt-4">
                        <span className="text-sm text-gray-700">
                            Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                        </span>
                        <div className="space-x-2">
                            <button
                                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                disabled={page === 1}
                                className={`px-3 py-1 rounded text-sm font-medium ${page === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer'}`}
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={page === totalPages || totalPages === 0}
                                className={`px-3 py-1 rounded text-sm font-medium ${page === totalPages || totalPages === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer'}`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
