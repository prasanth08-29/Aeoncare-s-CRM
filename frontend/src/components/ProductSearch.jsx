import React, { useState, useEffect } from "react";
import axios from "axios";

const ProductSearch = ({ onProductSelect, reset }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (reset) {
            setSearchTerm("");
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [reset]);

    const fetchProducts = async (search) => {
        if (!search) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            const res = await axios.get(`/api/products?search=${search}&limit=100`, config);
            setSuggestions(res.data.products || []);
            setShowSuggestions(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Debounce could be added here, but for now direct call
        if (value.length > 1) {
            fetchProducts(value);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }

        // Clear selection if user types
        onProductSelect("", "");
    };

    const handleSelectProduct = (product) => {
        setSearchTerm(product.name); // Keep name in input
        setSuggestions([]);
        setShowSuggestions(false);
        onProductSelect(product.sku, product.name);
    };

    return (
        <div className="flex-1 flex flex-col gap-2 relative">
            <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search Product Name or SKU..."
                value={searchTerm}
                onChange={handleSearchChange}
            />

            {showSuggestions && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto mt-1">
                    {loading ? (
                        <div className="p-2 text-gray-500 text-sm">Loading...</div>
                    ) : suggestions.length > 0 ? (
                        suggestions.map((product) => (
                            <div
                                key={product._id}
                                className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                onClick={() => handleSelectProduct(product)}
                            >
                                <div className="font-semibold text-gray-800">
                                    {product.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                    SKU: <span className="font-mono text-gray-700">{product.sku}</span>
                                    {product.category && product.category !== "Uncategorized" && (
                                        <span className="ml-2 text-gray-400">| {product.category}</span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-2 text-gray-500 text-sm">No products found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductSearch;
