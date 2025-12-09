import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";
import { connectDB } from "./config/db.js";

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await Product.deleteMany();

        const products = [
            // Wheelchairs
            { name: "Standard Manual Wheelchair", sku: "WC001", category: "Wheelchair", subcategory: "Manual" },
            { name: "Heavy Duty Manual Wheelchair", sku: "WC002", category: "Wheelchair", subcategory: "Manual" },
            { name: "Commode Wheelchair Basic", sku: "WC003", category: "Wheelchair", subcategory: "Commode" },
            { name: "Electric Wheelchair Standard", sku: "WC004", category: "Wheelchair", subcategory: "Electric" },
            { name: "Transfer Wheelchair", sku: "WC005", category: "Wheelchair", subcategory: "Transfer" },

            // Hospital Beds
            { name: "Manual Hospital Bed 2 Function", sku: "HB001", category: "Hospital Bed", subcategory: "Manual" },
            { name: "Electric Hospital Bed 3 Function", sku: "HB002", category: "Hospital Bed", subcategory: "Electric" },
            { name: "Electric Hospital Bed 5 Function", sku: "HB003", category: "Hospital Bed", subcategory: "Electric" },

            // Others
            { name: "Oxygen Concentrator 5L", sku: "OC001", category: "Respiratory", subcategory: "Oxygen Concentrator" },
            { name: "Nebulizer Compressor", sku: "NB001", category: "Respiratory", subcategory: "Nebulizer" },
        ];

        await Product.insertMany(products);

        console.log("Data Imported with Categories!");
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
