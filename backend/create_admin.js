import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import { connectDB } from "./config/db.js";

dotenv.config();

connectDB();

const createAdmin = async () => {
    try {
        const adminExists = await User.findOne({ email: "kamal@axium.co.in" });

        if (adminExists) {
            console.log("Admin user already exists. Deleting to recreate...");
            await User.deleteOne({ email: "kamal@axium.co.in" });
        }

        const user = await User.create({
            username: "Admin User",
            email: "kamal@axium.co.in",
            password: "Design201412#$",
            role: "admin",
            isApproved: true,
        });

        console.log("Admin user created successfully");
        console.log("Email: kamal@axium.co.in");
        console.log("Password: Design201412#$");
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

createAdmin();
