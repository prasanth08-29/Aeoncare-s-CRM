import express from "express";
import Lead from "../models/Lead.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private
router.post("/", protect, async (req, res) => {
    const { name, phone, product, productSku } = req.body;

    try {
        const lead = await Lead.create({
            name,
            phone,
            product,
            productSku,
            createdBy: req.user._id,
        });
        res.status(201).json(lead);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// @route   GET /api/leads
// @access  Private
router.get("/", protect, async (req, res) => {
    try {
        const { startDate, endDate, page = 1, limit = 10 } = req.query;
        let query = {};

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        }

        const count = await Lead.countDocuments(query);
        let leadsQuery = Lead.find(query)
            .sort({ createdAt: -1 })
            .populate("createdBy", "username");

        // Apply pagination only if limit is not 0 or 'all'
        if (limit !== '0' && limit !== 'all' && Number(limit) !== 0) {
            leadsQuery = leadsQuery.limit(limit * 1).skip((page - 1) * limit);
        }

        const leads = await leadsQuery;

        res.json({
            leads,
            totalPages: (limit !== '0' && limit !== 'all' && Number(limit) !== 0) ? Math.ceil(count / limit) : 1,
            currentPage: Number(page),
            totalLeads: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update lead status
// @route   PUT /api/leads/:id
// @access  Private
router.put("/:id", protect, async (req, res) => {
    const { status } = req.body;

    try {
        const lead = await Lead.findById(req.params.id);

        if (lead) {
            lead.status = status || lead.status;
            lead.name = req.body.name || lead.name;
            lead.product = req.body.product || lead.product;
            const updatedLead = await lead.save();
            res.json(updatedLead);
        } else {
            res.status(404).json({ message: "Lead not found" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private/Admin
router.delete("/:id", protect, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized as an admin" });
        }

        const lead = await Lead.findById(req.params.id);

        if (lead) {
            await lead.deleteOne();
            res.json({ message: "Lead removed" });
        } else {
            res.status(404).json({ message: "Lead not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Handle incoming call (Auto-create lead)
// @route   POST /api/leads/incoming
// @access  Public (Protected by API Key)
router.post("/incoming", async (req, res) => {
    const { phone, apiKey } = req.body;

    // Simple API Key check (In production, use env var)
    // For now, let's assume a hardcoded key or just check presence
    // if (apiKey !== process.env.LEAD_API_KEY) {
    //     return res.status(401).json({ message: "Invalid API Key" });
    // }

    if (!phone) {
        return res.status(400).json({ message: "Phone number is required" });
    }

    try {
        // Check if lead exists
        const existingLead = await Lead.findOne({ phone });
        if (existingLead) {
            return res.status(200).json({ message: "Lead already exists", lead: existingLead });
        }

        // Create new lead
        // We need a default user ID since 'createdBy' is required. 
        // Ideally, we should have a "System" user or find the first admin.
        // For now, let's try to find the first user in the DB.
        const User = (await import("../models/User.js")).default;
        const systemUser = await User.findOne();

        if (!systemUser) {
            return res.status(500).json({ message: "No users found to assign lead to" });
        }

        const newLead = await Lead.create({
            name: "Unknown Caller",
            phone,
            product: "Pending",
            status: "New",
            createdBy: systemUser._id
        });

        res.status(201).json({ message: "New lead created", lead: newLead });

    } catch (error) {
        console.error("Incoming Call Error:", error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
