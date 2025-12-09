import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        sku: {
            type: String,
            required: true,
            unique: true,
        },
        category: {
            type: String, // Storing raw product_type for reference
        },
        shopifyId: {
            type: String,
            unique: true,
            sparse: true,
        },
        variants: [
            {
                sku: String,
                title: String,
                price: String
            }
        ]
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
