import dbConnect from "../src/lib/mongodb.js";
import mongoose from "mongoose";

async function fixCategoriesRaw() {
    try {
        await dbConnect();
        const collection = mongoose.connection.collection("contents");
        
        const content = await collection.findOne();
        if (!content) {
            console.log("No content found");
            return;
        }

        console.log("Found content. Updating services...");
        
        const services = content.home.services || [];
        let updated = false;

        const newServices = services.map(srv => {
            if (srv.title && srv.title.toUpperCase() === "COMMERCIAL" && (srv.category === "wedding" || !srv.category)) {
                console.log(`Moving service "${srv.title}" to commercial`);
                srv.category = "commercial";
                updated = true;
            }
            return srv;
        });

        if (updated) {
            await collection.updateOne(
                { _id: content._id },
                { $set: { "home.services": newServices } }
            );
            console.log("Successfully updated service categories via raw query.");
        } else {
            console.log("No services needed updating.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error fixing categories:", error);
        process.exit(1);
    }
}

fixCategoriesRaw();
