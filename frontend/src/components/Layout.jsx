import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Layout = ({ children, user, setUser }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login");
    };

    const menuItems = [
        { path: "/", label: "Leads", icon: "📋" },
        { path: "/reports", label: "Reports", icon: "bar_chart" },
    ];

    if (user && user.role !== "admin") {
        menuItems.push({ path: "/products", label: "Products", icon: "inventory_2" });
    }

    if (user && user.role === "admin") {
        menuItems.push({ path: "/settings", label: "Settings", icon: "settings" });
        menuItems.push({ path: "/admin", label: "Admin", icon: "admin_panel_settings" });
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`${isSidebarOpen ? 'w-48' : 'w-0'} bg-gray-800 text-white flex flex-col transition-all duration-300 overflow-hidden`}>
                <div className="p-4 border-b border-gray-700 whitespace-nowrap">
                    <h1 className="text-xl font-bold">Aeoncare CRM</h1>
                    <p className="text-xs text-gray-400 mt-1">
                        Welcome, {user?.username}
                    </p>
                </div>

                <nav className="flex-1 p-4 space-y-2 whitespace-nowrap">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center p-3 rounded-md transition-colors ${location.pathname === item.path
                                ? "bg-blue-600 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                }`}
                        >
                            <span className="material-icons mr-3">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-700 whitespace-nowrap">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full p-3 rounded-md text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                    >
                        <span className="material-icons mr-3">logout</span>
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto flex flex-col">
                <div className="bg-white shadow p-4 flex items-center">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-md hover:bg-gray-200 focus:outline-none"
                    >
                        <span className="material-icons text-gray-600">menu</span>
                    </button>
                    <h2 className="ml-4 text-gray-600 font-semibold text-lg">
                        {menuItems.find(i => i.path === location.pathname)?.label || "Dashboard"}
                    </h2>
                </div>
                <div className="p-8">{children}</div>
            </div>
        </div>
    );
};

export default Layout;
