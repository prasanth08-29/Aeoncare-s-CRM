import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Modal from "./Modal";
import { FaWhatsapp } from "react-icons/fa";

const LeadItem = ({ lead, sNo, currentUser, onLeadUpdated, onLeadDeleted }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [editData, setEditData] = useState({
        product: lead.product,
        remarks: lead.remarks || ""
    });

    const handleStatusChange = async (e) => {
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.put(
                `/api/leads/${lead._id}`,
                { status: e.target.value },
                config
            );
            onLeadUpdated(res.data);
            toast.success("Status updated!");
        } catch (err) {
            console.error(err);
            toast.error("Error updating status");
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.put(
                `/api/leads/${lead._id}`,
                {
                    product: editData.product,
                    remarks: editData.remarks
                },
                config
            );
            onLeadUpdated(res.data);
            setIsEditing(false);
            toast.success("Lead updated!");
        } catch (err) {
            console.error(err);
            toast.error("Error updating lead");
        }
    };

    const handleDeleteClick = () => {
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`/api/leads/${lead._id}`, config);
            onLeadDeleted(lead._id);
            setIsDeleteConfirmOpen(false);
            toast.success("Lead deleted successfully");
        } catch (err) {
            console.error(err);
            toast.error("Error deleting lead");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "New": return "bg-blue-100 text-blue-800";
            case "Contacted": return "bg-yellow-100 text-yellow-800";
            case "Converted": return "bg-green-100 text-green-800";
            case "Lost": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const formatWhatsAppLink = (phone) => {
        const cleaned = phone.replace(/\D/g, "");
        return `https://wa.me/${cleaned}`;
    };

    return (
        <>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start gap-2">
                <div className="flex-1 w-full flex items-start gap-3">
                    {/* Serial Number */}
                    <div className="text-gray-400 font-bold text-base min-w-[2rem] pt-1">
                        #{sNo}
                    </div>

                    {isEditing ? (
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="w-16 font-medium text-gray-500 text-sm">Phone:</span>
                                <span className="text-gray-700 font-medium text-sm">{lead.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-16 font-medium text-gray-500 text-sm">Product:</span>
                                <input
                                    type="text"
                                    value={editData.product}
                                    onChange={(e) => setEditData({ ...editData, product: e.target.value })}
                                    className="flex-1 p-1 border rounded text-gray-800 focus:ring-1 focus:ring-blue-300 outline-none text-sm"
                                    placeholder="Product Name"
                                />
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="w-16 font-medium text-gray-500 text-sm pt-1">Remarks:</span>
                                <textarea
                                    value={editData.remarks}
                                    onChange={(e) => setEditData({ ...editData, remarks: e.target.value })}
                                    className="flex-1 p-1 border rounded text-gray-800 focus:ring-1 focus:ring-blue-300 outline-none h-16 resize-none text-sm"
                                    placeholder="Add notes..."
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1 flex-1">
                            {/* Phone Row */}
                            <div className="flex items-center gap-2">
                                <span className="w-16 font-medium text-gray-500 text-sm">Phone:</span>
                                <span className="text-gray-800 font-medium text-sm">{lead.phone}</span>
                                <a
                                    href={formatWhatsAppLink(lead.phone)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-500 hover:text-green-600 transition-colors ml-2"
                                    title="Chat on WhatsApp"
                                >
                                    <FaWhatsapp size={18} />
                                </a>
                            </div>

                            {/* Product Row */}
                            <div className="flex items-start gap-2">
                                <span className="w-16 font-medium text-gray-500 text-sm">Product:</span>
                                <span className="text-gray-800 flex-1 text-sm">{lead.product}</span>
                            </div>

                            {/* Remarks Row */}
                            <div className="flex items-start gap-2">
                                <span className="w-16 font-medium text-gray-500 text-sm">Remarks:</span>
                                <span className={`flex-1 text-sm ${lead.remarks ? "text-gray-600 italic" : "text-gray-400"}`}>
                                    {lead.remarks || "No remarks"}
                                </span>
                            </div>

                            {/* Meta Info */}
                            <p className="text-[10px] text-gray-400 mt-1 pl-[4.5rem]">
                                Added by: {lead.createdBy?.username || "Unknown"} — {new Date(lead.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <button onClick={handleSave} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                                Save
                            </button>
                            <button onClick={() => setIsEditing(false)} className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400">
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <select
                                value={lead.status}
                                onChange={handleStatusChange}
                                className={`p-2 rounded-md border border-gray-300 text-sm font-medium outline-none cursor-pointer ${getStatusColor(lead.status)}`}
                            >
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Converted">Converted</option>
                                <option value="Lost">Lost</option>
                            </select>

                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-blue-500 hover:text-blue-700 p-2 cursor-pointer"
                                title="Edit Lead"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>

                            {currentUser && currentUser.role === "admin" && (
                                <button
                                    onClick={handleDeleteClick}
                                    className="text-red-500 hover:text-red-700 p-2 cursor-pointer"
                                    title="Delete Lead"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                title="Confirm Delete"
            >
                <div className="mt-2">
                    <p className="text-sm text-gray-500">
                        Are you sure you want to delete this lead? This action cannot be undone.
                    </p>
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        type="button"
                        onClick={() => setIsDeleteConfirmOpen(false)}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none mr-3"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={confirmDelete}
                        className="bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none"
                    >
                        Delete
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default LeadItem;
