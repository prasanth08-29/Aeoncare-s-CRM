import React, { useState } from "react";
import axios from "axios";
import Modal from "./Modal";
import { FaWhatsapp } from "react-icons/fa";

const LeadItem = ({ lead, sNo, currentUser, onLeadUpdated, onLeadDeleted }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [editData, setEditData] = useState({
        name: lead.name,
        product: lead.product
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
        } catch (err) {
            console.error(err);
            alert("Error updating status");
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.put(
                `/api/leads/${lead._id}`,
                {
                    name: editData.name,
                    product: editData.product
                },
                config
            );
            onLeadUpdated(res.data);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert("Error updating lead");
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
        } catch (err) {
            console.error(err);
            alert("Error deleting lead");
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
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex-1 w-full">
                    {isEditing ? (
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={editData.name}
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                className="w-full p-1 border rounded font-bold text-lg text-gray-800"
                                placeholder="Name"
                            />
                            <p className="text-gray-600">
                                <span className="font-medium">Phone:</span> {lead.phone} (Read-only)
                            </p>
                            <input
                                type="text"
                                value={editData.product}
                                onChange={(e) => setEditData({ ...editData, product: e.target.value })}
                                className="w-full p-1 border rounded text-gray-600"
                                placeholder="Product"
                            />
                        </div>
                    ) : (
                        <>
                            <h4 className="font-bold text-lg text-gray-800">
                                <span className="text-gray-500 mr-2">{sNo}.</span>
                                {lead.name}
                            </h4>
                            <div className="flex items-center gap-2">
                                <p className="text-gray-600">
                                    <span className="font-medium">Phone:</span> {lead.phone}
                                </p>
                                <a
                                    href={formatWhatsAppLink(lead.phone)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-500 hover:text-green-600 transition-colors"
                                    title="Chat on WhatsApp"
                                >
                                    <FaWhatsapp size={20} />
                                </a>
                            </div>
                            <p className="text-gray-600">
                                <span className="font-medium">Product:</span> {lead.product}
                            </p>
                        </>
                    )}

                    <p className="text-xs text-gray-500 mt-1">
                        Added by: {lead.createdBy?.username || "Unknown"} on{" "}
                        {new Date(lead.createdAt).toLocaleDateString()}
                    </p>
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
