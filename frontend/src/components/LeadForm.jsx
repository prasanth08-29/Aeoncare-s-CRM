import React, { useState } from "react";
import axios from "axios";
import ProductSearch from "./ProductSearch";

const LeadForm = ({ onLeadAdded }) => {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        product: "",
    });
    const [resetSearch, setResetSearch] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleProductSelect = (sku, name) => {
        const productString = sku ? `${name} (${sku})` : name;
        setFormData((prev) => ({ ...prev, product: productString }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const res = await axios.post("/api/leads", formData, config);
            onLeadAdded(res.data);
            setFormData({ name: "", phone: "", product: "" });
            setResetSearch((prev) => !prev); // Trigger reset in ProductSearch
        } catch (err) {
            console.error(err);
            alert("Error adding lead");
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Add New Lead</h3>
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
                <input
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Customer Name"
                    required
                />
                <input
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    required
                />
                <ProductSearch
                    onProductSelect={handleProductSelect}
                    reset={resetSearch}
                />
                <button className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 font-medium cursor-pointer">
                    Add Lead
                </button>
            </form>
        </div>
    );
};

export default LeadForm;
