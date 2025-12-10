import express from "express";
import Product from "../models/Product.js";
import { protect } from "../middleware/auth.js";
import { syncShopifyProducts } from "../services/shopifyService.js";

const router = express.Router();



// @desc    Get products (Search by Name or SKU) - Paginated
// @route   GET /api/products
// @access  Private
router.get("/", protect, async (req, res) => {
    const { search, page = 1, limit = 10 } = req.query;
    try {
        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { sku: { $regex: search, $options: "i" } },
                { "variants.sku": { $regex: search, $options: "i" } } // Also search in variants
            ];
        }

        const count = await Product.countDocuments(query);
        const products = await Product.find(query)
            .select("name sku shopifyId category variants")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 }); // Newest first

        res.json({
            products,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            totalProducts: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a product manually
// @route   POST /api/products
// @access  Private
router.post("/", protect, async (req, res) => {
    const { name, sku, category } = req.body;

    try {
        if (!name || !sku) {
            return res.status(400).json({ message: "Name and SKU are required" });
        }

        const productExists = await Product.findOne({ sku });
        if (productExists) {
            return res.status(400).json({ message: "Product with this SKU already exists" });
        }

        // Create variants array - initially empty or could be populated if variants passed (future)
        const variants = [];

        const product = await Product.create({
            name,
            sku,
            category: category || "Uncategorized",
            variants
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
router.put("/:id", protect, async (req, res) => {
    const { name, sku, category } = req.body;

    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name || product.name;
            product.sku = sku || product.sku;
            product.category = category || product.category;



            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// @desc    Delete a single product
// @route   DELETE /api/products/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await Product.deleteOne({ _id: req.params.id });
            res.json({ message: "Product deleted" });
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Reset/Clear all products
// @route   DELETE /api/products/reset
// @access  Private
router.delete("/reset", protect, async (req, res) => {
    try {
        await Product.deleteMany({});
        res.json({ message: "All products cleared successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Sync products from Shopify
// @route   POST /api/products/sync
// @access  Private
router.post("/sync", protect, async (req, res) => {
    let { storeUrl, accessToken } = req.body;

    // Fallback to Env Vars
    if (!storeUrl) storeUrl = process.env.SHOPIFY_STORE_URL;
    if (!accessToken) accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

    if (!storeUrl || !accessToken) {
        return res.status(400).json({ message: "Store URL and Access Token are required (in body or .env)" });
    }

    try {
        const result = await syncShopifyProducts(storeUrl, accessToken);
        res.json({
            message: "Sync successful",
            count: result.count,
            totalRemote: result.totalRemoteCount,
            fetched: result.fetchedCount,
            errors: result.errorCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
