import React, { useState, useEffect } from "react";
import axios from "axios";

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
    const [editingLeadId, setEditingLeadId] = useState(null);
    const [editFormData, setEditFormData] = useState({ name: "", product: "", status: "" });

    const handleEditClick = (lead) => {
        setEditingLeadId(lead._id);
        setEditFormData({ name: lead.name, product: lead.product, status: lead.status });
    };

    const handleCancelEdit = () => {
        setEditingLeadId(null);
        setEditFormData({ name: "", product: "", status: "" });
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
            filterLeadsByStatus(selectedStatus, updatedLeads);

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
            alert("Error updating lead");
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
            filterLeadsByStatus(selectedStatus, leads);

        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []); // Initial load

    const filterLeadsByStatus = (status, leadsToFilter = allLeads) => {
        setSelectedStatus(status);
        if (status === "Total") {
            setFilteredLeads(leadsToFilter);
        } else {
            setFilteredLeads(leadsToFilter.filter(l => l.status === status));
        }
    };

    const handleDownload = () => {
        const headers = ["Name,Phone,Product,Status,Date,Created By"];
        const rows = filteredLeads.map(l =>
            `"${l.name}","${l.phone}","${l.product}","${l.status}","${new Date(l.createdAt).toLocaleDateString()}","${l.createdBy?.username || ''}"`
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

    const StatCard = ({ title, value, color, statusKey }) => (
        <div
            onClick={() => filterLeadsByStatus(statusKey)}
            className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${color} cursor-pointer transition-transform hover:scale-105 ${selectedStatus === statusKey ? 'ring-2 ring-offset-2 ring-blue-400' : ''}`}
        >
            <h3 className="text-gray-500 text-sm font-medium uppercase">{title}</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
    );

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Lead Reports</h2>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border rounded p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border rounded p-2"
                    />
                </div>
                <button
                    onClick={fetchLeads}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Apply Filter
                </button>
                <button
                    onClick={handleDownload}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-auto"
                >
                    Download CSV
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <StatCard title="Total Leads" value={stats.total} color="border-gray-500" statusKey="Total" />
                <StatCard title="New Leads" value={stats.new} color="border-blue-500" statusKey="New" />
                <StatCard title="Contacted" value={stats.contacted} color="border-yellow-500" statusKey="Contacted" />
                <StatCard title="Converted" value={stats.converted} color="border-green-500" statusKey="Converted" />
                <StatCard title="Lost" value={stats.lost} color="border-red-500" statusKey="Lost" />
            </div>

            {/* Conversion Rate */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-lg font-semibold mb-4">Conversion Rate</h3>
                <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                        className="bg-green-500 h-4 rounded-full transition-all duration-500"
                        style={{
                            width: `${stats.total ? (stats.converted / stats.total) * 100 : 0}%`,
                        }}
                    ></div>
                </div>
                <p className="text-right text-gray-600 mt-2">
                    {stats.total
                        ? ((stats.converted / stats.total) * 100).toFixed(1)
                        : 0}
                    % Converted
                </p>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
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
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="text"
                                                        value={editFormData.name}
                                                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                                        className="border rounded p-1 w-full"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {lead.phone}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="text"
                                                        value={editFormData.product}
                                                        onChange={(e) => setEditFormData({ ...editFormData, product: e.target.value })}
                                                        className="border rounded p-1 w-full"
                                                    />
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
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {lead.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {lead.phone}
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
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
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
