import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "../components/Modal";
import Toast from "../components/Toast";

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Modal States
    const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const [userToDelete, setUserToDelete] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
    };

    // Add Admin Form State
    const [addAdminData, setAddAdminData] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [addAdminError, setAddAdminError] = useState("");

    // Product Management State

    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
    const [isDeleteProductConfirmOpen, setIsDeleteProductConfirmOpen] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);
    const [productToDelete, setProductToDelete] = useState(null);


    // Manual Add Product Data
    const [addProductData, setAddProductData] = useState({
        name: "",
        sku: "",
        category: "",
        price: ""
    });

    const [editProductData, setEditProductData] = useState({
        name: "",
        sku: "",
        category: "",
        price: ""
    });

    const fetchProducts = async (currentPage = 1) => {
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Fetch multiple products
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
        }
    };



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
            setAddProductData({ name: "", sku: "", category: "", price: "" }); // Reset form
            fetchProducts(1); // Refresh list
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
            category: product.category,
            // Extract price from first variant if exists
            price: product.variants && product.variants.length > 0 ? product.variants[0].price : ""
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
            fetchProducts(page); // Refresh current list
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
            fetchProducts(page); // Refresh list
        } catch (err) {
            console.error(err);
            showToast("Failed to delete product: " + (err.response?.data?.message || err.message), "error");
        }
    };

    const handleReset = async () => {
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete("/api/products/reset", config);

            showToast("All products have been reset.");
            setIsResetModalOpen(false);
            fetchProducts(1);
        } catch (err) {
            console.error(err);
            showToast("Reset Failed", "error");
        }
    };

    const fetchUsers = async () => {
        console.log("AdminDashboard: fetching users...");
        try {
            const token = localStorage.getItem("token");
            console.log("AdminDashboard: token present?", !!token);
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const res = await axios.get("/api/users", config);
            console.log("AdminDashboard: users fetched", res.data);
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            console.error("AdminDashboard: fetch error", err);
            setError("Failed to fetch users");
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("AdminDashboard: mounted");
        fetchUsers();
        fetchProducts();
    }, []);

    const handleApprove = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            await axios.put(`/api/users/${id}/approve`, {}, config);
            fetchUsers(); // Refresh list
            showToast("User approved successfully");
        } catch (err) {
            showToast("Failed to approve user", "error");
        }
    };

    const handleDeleteClick = (id) => {
        setUserToDelete(id);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            await axios.delete(`/api/users/${userToDelete}`, config);
            fetchUsers(); // Refresh list
            setIsDeleteConfirmOpen(false);
            setUserToDelete(null);
            showToast("User deleted successfully");
        } catch (err) {
            showToast("Failed to delete user", "error");
        }
    };

    const handleAddAdminChange = (e) => {
        setAddAdminData({ ...addAdminData, [e.target.name]: e.target.value });
    };

    const submitAddAdmin = async (e) => {
        e.preventDefault();
        setAddAdminError("");
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            await axios.post("/api/users/add-admin", addAdminData, config);

            // Success
            setIsAddAdminOpen(false);
            setAddAdminData({ username: "", email: "", password: "" });
            fetchUsers(); // Refresh list

            showToast("Admin added successfully");
        } catch (err) {
            console.error(err);
            setAddAdminError(err.response?.data?.message || "Failed to add admin");
        }
    };

    // if (loading) return <div className="p-6">Loading...</div>;
    // if (error) return <div className="p-6 text-red-500">{error}</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <button
                    onClick={() => setIsAddAdminOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
                >
                    Add Admin
                </button>
            </div>

            {/* User Management Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">User Management</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.isApproved ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {!user.isApproved && (
                                            <button
                                                onClick={() => handleApprove(user._id)}
                                                className="text-green-600 hover:text-green-900 mr-4 cursor-pointer"
                                            >
                                                Approve
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteClick(user._id)}
                                            className="text-red-600 hover:text-red-900 cursor-pointer"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Product Management Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Product Management</h2>
                    <div className="space-x-2">
                        <button
                            onClick={() => setIsAddProductModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
                        >
                            Add Product
                        </button>

                        <button
                            onClick={() => setIsResetModalOpen(true)}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded cursor-pointer"
                        >
                            Reset Products
                        </button>
                    </div>
                </div>

                <div className="mb-4">
                    {/* Simple Filter */}
                    <input
                        type="text"
                        placeholder="Filter products locally..."
                        className="p-2 border rounded w-full md:w-1/3"
                        onChange={(e) => {
                            // Basic local filter visual logic could go here, 
                            // but for now we rely on the main product fetch or just display all.
                            // Implementing real search properly requires backend calls or local state filtering.
                        }}
                    />
                </div>

                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="min-w-full table-auto relative">
                        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variants</th>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.variants?.length || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEditClick(product)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4 cursor-pointer"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProductClick(product)}
                                                className="text-red-600 hover:text-red-900 cursor-pointer"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                        No products found. Try syncing from Shopify.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Controls */}
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

            {/* Add Admin Modal */}
            <Modal
                isOpen={isAddAdminOpen}
                onClose={() => setIsAddAdminOpen(false)}
                title="Add New Admin"
            >
                <form onSubmit={submitAddAdmin} className="space-y-4">
                    {addAdminError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{addAdminError}</span>
                        </div>
                    )}
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            Username
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="username"
                            type="text"
                            placeholder="Username"
                            name="username"
                            value={addAdminData.username}
                            onChange={handleAddAdminChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="email"
                            type="email"
                            placeholder="Email"
                            name="email"
                            value={addAdminData.email}
                            onChange={handleAddAdminChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="password"
                            type="password"
                            placeholder="******************"
                            name="password"
                            value={addAdminData.password}
                            onChange={handleAddAdminChange}
                            required
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={() => setIsAddAdminOpen(false)}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none mr-3"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none"
                        >
                            Create Admin
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                title="Confirm Delete"
            >
                <div className="mt-2">
                    <p className="text-sm text-gray-500">
                        Are you sure you want to delete this user? This action cannot be undone.
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



            {/* Reset Products Modal */}
            <Modal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                title="Reset All Products"
            >
                <div className="mt-2">
                    <p className="text-sm text-gray-500 bg-red-50 p-2 rounded">
                        <span className="font-bold text-red-600">WARNING:</span> This will delete ALL products from your local database.
                        This action cannot be undone. You will need to re-sync from Shopify to get them back.
                    </p>
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        type="button"
                        onClick={() => setIsResetModalOpen(false)}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none mr-3"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none"
                    >
                        Reset Database
                    </button>
                </div>
            </Modal>
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
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">Price (Optional)</label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="price" type="number" placeholder="0.00" name="price"
                            value={addProductData.price} onChange={handleAddProductChange}
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
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-price">Price</label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="edit-price" type="number" placeholder="0.00" name="price"
                            value={editProductData.price} onChange={handleEditProductChange}
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

            {/* Delete Product Confirmation Modal */}
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
        </div >
    );
};

export default AdminDashboard;
