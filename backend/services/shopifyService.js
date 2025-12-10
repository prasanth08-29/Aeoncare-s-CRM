import axios from "axios";
import Product from "../models/Product.js";

export const syncShopifyProducts = async (storeUrl, accessToken) => {
    try {
        // Clean the store URL
        let cleanUrl = storeUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
        if (cleanUrl.includes("admin.shopify.com/store/")) {
            const parts = cleanUrl.split("/");
            const storeName = parts[parts.length - 1];
            cleanUrl = `${storeName}.myshopify.com`;
        }

        console.log(`Syncing from: ${cleanUrl}`);

        // Explicitly fetch all statuses to ensure we get everything
        const statuses = ["active", "draft", "archived"];
        let totalRemoteCount = 0;
        let savedCount = 0;
        let fetchedCount = 0;
        let errorCount = 0;

        // 1. Get total counts for debugging
        for (const status of statuses) {
            try {
                const countRes = await axios.get(
                    `https://${cleanUrl}/admin/api/2024-01/products/count.json?status=${status}`,
                    { headers: { "X-Shopify-Access-Token": accessToken } }
                );
                console.log(`Shopify reports ${countRes.data.count} products with status=${status}`);
                totalRemoteCount += countRes.data.count;
            } catch (e) {
                console.error(`Could not fetch count for ${status}:`, e.message);
            }
        }

        // 2. Sync each status
        for (const status of statuses) {
            let params = { limit: 250, status: status };
            let hasMore = true;

            console.log(`Starting sync for status: ${status}`);

            while (hasMore) {
                try {
                    console.log(`Fetching ${status} products... (since_id: ${params.since_id || 'start'})`);
                    const response = await axios.get(
                        `https://${cleanUrl}/admin/api/2024-01/products.json`,
                        {
                            headers: { "X-Shopify-Access-Token": accessToken },
                            params: params,
                        }
                    );

                    const shopifyProducts = response.data.products;
                    fetchedCount += shopifyProducts.length;
                    console.log(`Fetched ${shopifyProducts.length} ${status} products.`);

                    if (shopifyProducts.length === 0) {
                        hasMore = false;
                        break;
                    }

                    for (const item of shopifyProducts) {
                        // Determine primary SKU (first variant with SKU or generated)
                        let primarySku = `SHOPIFY-${item.id}`;
                        if (item.variants && item.variants.length > 0) {
                            const v = item.variants.find(v => v.sku && v.sku.trim() !== "");
                            if (v) primarySku = v.sku;
                        }

                        // Collect all variants
                        const variants = item.variants.map(v => ({
                            sku: v.sku || "",
                            title: v.title
                        }));

                        try {
                            await Product.findOneAndUpdate(
                                { shopifyId: item.id },
                                {
                                    name: item.title,
                                    sku: primarySku,
                                    category: item.product_type || "Uncategorized",
                                    shopifyId: item.id,
                                    variants: variants
                                },
                                { upsert: true, new: true }
                            );
                            savedCount++;
                        } catch (err) {
                            console.error(`Error saving product ${item.title}:`, err.message);
                            errorCount++;
                        }
                    }

                    // Pagination
                    params.since_id = shopifyProducts[shopifyProducts.length - 1].id;

                    // Safety sleep
                    await new Promise(resolve => setTimeout(resolve, 500));

                } catch (error) {
                    if (error.response && error.response.status === 429) {
                        console.log("Rate limit hit. Waiting 2 seconds...");
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        continue;
                    } else {
                        console.error(`Error syncing ${status} products:`, error.message);
                        break; // Stop this status, try next
                    }
                }
            }
        }

        return { success: true, count: savedCount, totalRemoteCount, fetchedCount, errorCount };
    } catch (error) {
        console.error("Shopify Sync Error:", error.message);
        throw error;
    }
};
