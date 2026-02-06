import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaWhatsapp } from "react-icons/fa";

const Reports = () => {
    const [stats, setStats] = useState({
        total: 0,
        new: 0,
        contacted: 0,
        converted: 0,
        lost: 0,
    });
    const [allLeads, setAllLeads] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("Total"); // Default to showing all or none
    const [searchTerm, setSearchTerm] = useState("");
    const [editingLeadId, setEditingLeadId] = useState(null);
    const [editFormData, setEditFormData] = useState({ product: "", status: "" });

    const handleEditClick = (lead) => {
        setEditingLeadId(lead._id);
        setEditFormData({ product: lead.product, status: lead.status });
    };

    const handleCancelEdit = () => {
        setEditingLeadId(null);
        setEditFormData({ product: "", status: "" });
    };

    const handleSaveEdit = async () => {
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.put(
                `/api/leads/${editingLeadId}`,
                editFormData,
                config
            );

            // Update local state
            const updatedLeads = allLeads.map((l) => (l._id === editingLeadId ? res.data : l));
            setAllLeads(updatedLeads);

            // Re-apply filters
            applyFilters(selectedStatus, searchTerm, updatedLeads);

            // Update stats
            const newStats = {
                total: updatedLeads.length,
                new: updatedLeads.filter((l) => l.status === "New").length,
                contacted: updatedLeads.filter((l) => l.status === "Contacted").length,
                converted: updatedLeads.filter((l) => l.status === "Converted").length,
                lost: updatedLeads.filter((l) => l.status === "Lost").length,
            };
            setStats(newStats);

            setEditingLeadId(null);
        } catch (err) {
            console.error(err);
            toast.error("Error updating lead");
        }
    };

    const fetchLeads = async () => {
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                params: { startDate, endDate, limit: 0 } // Fetch all leads for reports
            };
            const res = await axios.get("/api/leads", config);
            // Handle new response structure (res.data.leads) or fallback if old API
            const leads = res.data.leads || (Array.isArray(res.data) ? res.data : []);
            setAllLeads(leads);

            const newStats = {
                total: leads.length,
                new: leads.filter((l) => l.status === "New").length,
                contacted: leads.filter((l) => l.status === "Contacted").length,
                converted: leads.filter((l) => l.status === "Converted").length,
                lost: leads.filter((l) => l.status === "Lost").length,
            };
            setStats(newStats);

            // Reset selection or update filtered list based on current selection
            applyFilters(selectedStatus, searchTerm, leads);

        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []); // Initial load

    // Unified Filter Logic
    const applyFilters = (status, search, leadsSource = allLeads) => {
        let filtered = leadsSource;

        // 1. Filter by Status
        if (status !== "Total") {
            filtered = filtered.filter(l => l.status === status);
        }

        // 2. Filter by Search Term
        if (search) {
            const term = search.toLowerCase();
            filtered = filtered.filter(l =>
                (l.phone && l.phone.includes(term)) ||
                (l.product && l.product.toLowerCase().includes(term))
            );
        }

        setFilteredLeads(filtered);
    };

    const handleStatusFilter = (status) => {
        setSelectedStatus(status);
        applyFilters(status, searchTerm, allLeads);
    };

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        applyFilters(selectedStatus, term, allLeads);
    };

    const handleDownload = () => {
        const headers = ["Phone,Product,Status,Date,Created By"];
        const rows = filteredLeads.map(l =>
            `"${l.phone}","${l.product}","${l.status}","${new Date(l.createdAt).toLocaleDateString()}","${l.createdBy?.username || ''}"`
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `leads_report_${selectedStatus}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const StatCard = ({ title, value, color, statusKey, subText }) => (
        <div
            onClick={() => statusKey && handleStatusFilter(statusKey)}
            className={`bg-white px-4 py-3 rounded-lg shadow-sm border-l-4 ${color} cursor-pointer transition-transform hover:scale-105 ${selectedStatus === statusKey ? 'ring-1 ring-offset-1 ring-blue-400' : ''}`}
        >
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</h3>
            <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                {subText && <span className="text-xs text-gray-400">{subText}</span>}
            </div>
        </div>
    );

    const formatWhatsAppLink = (phone) => {
        const cleaned = phone.replace(/\D/g, "");
        return `https://wa.me/${cleaned}`;
    };

    const conversionRate = stats.total ? ((stats.converted / stats.total) * 100).toFixed(1) : 0;

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Lead Reports</h2>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <input
                        type="text"
                        placeholder="Search by phone or product..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="border rounded p-2 text-sm w-full focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border rounded p-2 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border rounded p-2 text-sm"
                    />
                </div>
                <button
                    onClick={fetchLeads}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                >
                    Apply Filter
                </button>
                <button
                    onClick={handleDownload}
                    className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 ml-auto"
                >
                    Download CSV
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <StatCard title="Total Leads" value={stats.total} color="border-gray-500" statusKey="Total" />
                <StatCard title="New Leads" value={stats.new} color="border-blue-500" statusKey="New" />
                <StatCard title="Contacted" value={stats.contacted} color="border-yellow-500" statusKey="Contacted" />
                <StatCard title="Converted" value={stats.converted} color="border-green-500" statusKey="Converted" />
                <StatCard title="Lost" value={stats.lost} color="border-red-500" statusKey="Lost" />
                <StatCard title="Conversion Rate" value={`${conversionRate}%`} color="border-purple-500" subText="of Total" />
            </div>

            {/* Details Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Details: {selectedStatus === "Total" ? "All Leads" : selectedStatus + " Leads"}
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredLeads.length > 0 ? (
                                filteredLeads.map((lead) => (
                                    <tr key={lead._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(lead.createdAt).toLocaleDateString()}
                                        </td>

                                        {editingLeadId === lead._id ? (
                                            <>

                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {lead.phone}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {lead.product}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={editFormData.status}
                                                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                                        className="border rounded p-1"
                                                    >
                                                        <option value="New">New</option>
                                                        <option value="Contacted">Contacted</option>
                                                        <option value="Converted">Converted</option>
                                                        <option value="Lost">Lost</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                                                    <button onClick={handleSaveEdit} className="text-green-600 hover:text-green-900 font-bold">Save</button>
                                                    <button onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-900">Cancel</button>
                                                </td>
                                            </>
                                        ) : (
                                            <>

                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex items-center gap-2">
                                                        {lead.phone}
                                                        <a
                                                            href={formatWhatsAppLink(lead.phone)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-green-500 hover:text-green-600 transition-colors"
                                                            title="Chat on WhatsApp"
                                                        >
                                                            <FaWhatsapp size={22} />
                                                        </a>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {lead.product}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
                                                            lead.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                                                                lead.status === 'Converted' ? 'bg-green-100 text-green-800' :
                                                                    'bg-red-100 text-red-800'}`}>
                                                        {lead.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button onClick={() => handleEditClick(lead)} className="text-blue-600 hover:text-blue-900 font-medium">Edit</button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                        No leads found for this selection.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
