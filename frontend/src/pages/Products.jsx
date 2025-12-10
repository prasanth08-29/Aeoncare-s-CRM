import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "../components/Modal";
import Toast from "../components/Toast";

const Products = ({ user }) => {
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
    const [isDeleteProductConfirmOpen, setIsDeleteProductConfirmOpen] = useState(false);

    // Selection States
    const [currentProductId, setCurrentProductId] = useState(null);
    const [productToDelete, setProductToDelete] = useState(null);

    // UI Feedback
    const [toast, setToast] = useState(null);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
    };

    // Form Data States
    const [addProductData, setAddProductData] = useState({
        name: "",
        sku: "",
        category: ""
    });

    const [editProductData, setEditProductData] = useState({
        name: "",
        sku: "",
        category: ""
    });

    // Fetch Products
    const fetchProducts = async (currentPage = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`/api/products?page=${currentPage}&limit=10`, config);

            if (res.data.products) {
                setProducts(res.data.products);
                setTotalPages(res.data.totalPages);
                setPage(res.data.currentPage);
            } else {
                setProducts([]);
            }
        } catch (err) {
            console.error("Error fetching products:", err);
            showToast("Failed to fetch products", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Handlers
    const handleAddProductChange = (e) => {
        setAddProductData({ ...addProductData, [e.target.name]: e.target.value });
    };

    const handleAddProductSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post("/api/products", addProductData, config);

            showToast("Product added successfully");
            setIsAddProductModalOpen(false);
            setAddProductData({ name: "", sku: "", category: "" }); // Reset form
            fetchProducts(1);
        } catch (err) {
            console.error(err);
            showToast("Failed to add product: " + (err.response?.data?.message || err.message), "error");
        }
    };

    const handleEditProductChange = (e) => {
        setEditProductData({ ...editProductData, [e.target.name]: e.target.value });
    };

    const handleEditClick = (product) => {
        setCurrentProductId(product._id);
        setEditProductData({
            name: product.name,
            sku: product.sku,
            category: product.category
        });
        setIsEditProductModalOpen(true);
    };

    const handleEditProductSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`/api/products/${currentProductId}`, editProductData, config);

            showToast("Product updated successfully");
            setIsEditProductModalOpen(false);
            setCurrentProductId(null);
            fetchProducts(page);
        } catch (err) {
            console.error(err);
            showToast("Failed to update product: " + (err.response?.data?.message || err.message), "error");
        }
    };

    const handleDeleteProductClick = (product) => {
        setProductToDelete(product);
        setIsDeleteProductConfirmOpen(true);
    };

    const confirmDeleteProduct = async () => {
        if (!productToDelete) return;
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`/api/products/${productToDelete._id}`, config);

            showToast("Product deleted successfully");
            setIsDeleteProductConfirmOpen(false);
            setProductToDelete(null);
            fetchProducts(page);
        } catch (err) {
            console.error(err);
            showToast("Failed to delete product: " + (err.response?.data?.message || err.message), "error");
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Products</h1>
                <button
                    onClick={() => setIsAddProductModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
                >
                    Add Product
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                {/* Product Table */}
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="min-w-full table-auto relative">
                        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <tr key={product._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{product.sku}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEditClick(product)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4 cursor-pointer"
                                            >
                                                Edit
                                            </button>
                                            {user && user.role === 'admin' && (
                                                <button
                                                    onClick={() => handleDeleteProductClick(product)}
                                                    className="text-red-600 hover:text-red-900 cursor-pointer"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                        {loading ? "Loading products..." : "No products found."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4 border-t pt-4">
                    <span className="text-sm text-gray-700">
                        Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                    </span>
                    <div className="space-x-2">
                        <button
                            onClick={() => fetchProducts(page - 1)}
                            disabled={page === 1}
                            className={`px-3 py-1 rounded text-sm font-medium ${page === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer'}`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => fetchProducts(page + 1)}
                            disabled={page === totalPages || totalPages === 0}
                            className={`px-3 py-1 rounded text-sm font-medium ${page === totalPages || totalPages === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer'}`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Product Modal */}
            <Modal
                isOpen={isAddProductModalOpen}
                onClose={() => setIsAddProductModalOpen(false)}
                title="Add New Product"
            >
                <form onSubmit={handleAddProductSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Product Name</label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="name" type="text" placeholder="Product Name" name="name"
                            value={addProductData.name} onChange={handleAddProductChange} required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sku">SKU</label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="sku" type="text" placeholder="SKU" name="sku"
                            value={addProductData.sku} onChange={handleAddProductChange} required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">Category</label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="category" type="text" placeholder="Category" name="category"
                            value={addProductData.category} onChange={handleAddProductChange} required
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={() => setIsAddProductModalOpen(false)}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none mr-3"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none"
                        >
                            Add Product
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Product Modal */}
            <Modal
                isOpen={isEditProductModalOpen}
                onClose={() => setIsEditProductModalOpen(false)}
                title="Edit Product"
            >
                <form onSubmit={handleEditProductSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-name">Product Name</label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="edit-name" type="text" placeholder="Product Name" name="name"
                            value={editProductData.name} onChange={handleEditProductChange} required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-sku">SKU</label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="edit-sku" type="text" placeholder="SKU" name="sku"
                            value={editProductData.sku} onChange={handleEditProductChange} required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-category">Category</label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="edit-category" type="text" placeholder="Category" name="category"
                            value={editProductData.category} onChange={handleEditProductChange} required
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={() => setIsEditProductModalOpen(false)}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none mr-3"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteProductConfirmOpen}
                onClose={() => setIsDeleteProductConfirmOpen(false)}
                title="Confirm Delete Product"
            >
                <div className="mt-2">
                    <p className="text-sm text-gray-500">
                        Are you sure you want to delete <span className="font-bold">{productToDelete?.name}</span>? This action cannot be undone.
                    </p>
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        type="button"
                        onClick={() => setIsDeleteProductConfirmOpen(false)}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none mr-3"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={confirmDeleteProduct}
                        className="bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none"
                    >
                        Delete
                    </button>
                </div>
            </Modal>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default Products;
