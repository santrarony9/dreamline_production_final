import dbConnect from "../src/lib/mongodb.js";
import Content from "../src/models/Content.js";

async function fixCategories() {
    try {
        await dbConnect();
        const content = await Content.findOne();
        if (!content) {
            console.log("No content found");
            return;
        }

        console.log("Found content. Checking services...");
        let updated = false;

        content.home.services = content.home.services.map(srv => {
            // If the title is "COMMERCIAL" and it's currently in the wedding category, move it to commercial
            if (srv.title.toUpperCase() === "COMMERCIAL" && (srv.category === "wedding" || !srv.category)) {
                console.log(`Moving service "${srv.title}" from ${srv.category} to commercial`);
                srv.category = "commercial";
                updated = true;
            }
            return srv;
        });

        if (updated) {
            await content.save();
            console.log("Successfully updated service categories.");
        } else {
            console.log("No services needed updating.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error fixing categories:", error);
        process.exit(1);
    }
}

fixCategories();
