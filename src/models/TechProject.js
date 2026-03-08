import mongoose from "mongoose";

const TechProjectSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        domain: { type: String, required: true },
        category: { type: String, default: "Web Development" },
        img: { type: String, required: true },
        order: { type: Number, default: 0 }
    },
    { timestamps: true }
);

export default mongoose.models.TechProject || mongoose.model("TechProject", TechProjectSchema);
