import React, { useState } from "react";
import axios from "axios";

const Settings = () => {
    const [storeUrl, setStoreUrl] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleSync = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const res = await axios.post(
                "/api/products/sync",
                { storeUrl, accessToken },
                config
            );

            setMessage({
                type: "success",
                text: res.data.message,
                details: {
                    count: res.data.count,
                    totalRemote: res.data.totalRemote,
                    fetched: res.data.fetched,
                    errors: res.data.errors
                }
            });
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.message || err.message || "Sync failed";
            setMessage({
                type: "error",
                text: errorMsg,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">
                    Shopify Integration
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                    Sync your products directly from Shopify. You'll need your Store URL
                    and an Admin API Access Token.
                </p>

                {message && (
                    <div
                        className={`p-3 rounded-md mb-4 text-sm ${message.type === "success"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                    >
                        <p className="font-bold">{message.text}</p>
                        {message.details && (
                            <ul className="mt-2 list-disc list-inside">
                                <li>Total in Shopify: {message.details.totalRemote}</li>
                                <li>Fetched: {message.details.fetched}</li>
                                <li>Saved/Updated: {message.details.count}</li>
                                <li>Errors: {message.details.errors}</li>
                            </ul>
                        )}
                    </div>
                )}

                <form onSubmit={handleSync} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Store URL
                        </label>
                        <input
                            type="text"
                            value={storeUrl}
                            onChange={(e) => setStoreUrl(e.target.value)}
                            placeholder="e.g. my-store.myshopify.com"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Admin API Access Token
                        </label>
                        <input
                            type="password"
                            value={accessToken}
                            onChange={(e) => setAccessToken(e.target.value)}
                            placeholder="shpat_..."
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        {loading ? "Syncing..." : "Sync Products"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Settings;
