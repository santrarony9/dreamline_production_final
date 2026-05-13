import dbConnect from "./src/lib/mongodb.js";
import Content from "./src/models/Content.js";
import dotenv from "dotenv";

dotenv.config();

async function debug() {
    await dbConnect();
    const content = await Content.findOne().lean();
    console.log("FULL CONTENT KEYS:", Object.keys(content));
    console.log("LUXURY KEYS:", Object.keys(content.luxury || {}));
    console.log("LUXURY CONTENT:", JSON.stringify(content.luxury, null, 2));
    process.exit(0);
}

debug();
