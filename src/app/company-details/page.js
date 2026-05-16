import dbConnect from "@/lib/mongodb";
import Content from "@/models/Content";
export const dynamic = 'force-dynamic';

export async function generateMetadata() {
    return {
        title: "Company Details | Dreamline Production",
        description: "Official registration, bank details, and certification information for Dreamline Production.",
    };
}

export default async function CompanyDetailsPage() {
    await dbConnect();
    const siteContent = await Content.findOne().lean();
    const contact = siteContent?.global?.contact || {};

    const details = [
        {
            label: "Official Name",
            value: "DREAM LINE PRODUCTION",
            type: "text"
        },
        {
            label: "GST Identification Number",
            value: "19EILPS2898F1ZE",
            type: "text"
        },
        {
            label: "MSME Number",
            value: "WB-18-0018671",
            type: "text"
        },
        {
            label: "KMC License Number",
            value: "0038 3710 1550",
            type: "text"
        },
        {
            label: "IEC (Import Export Code)",
            value: "EILPS2898F",
            type: "text"
        },
        {
            label: "Registered Office",
            value: contact.address || "85, Tilottama Plaza, Tower 2, First Floor, Karunamoyee Ghat Road, Kolkata 700082",
            type: "text"
        }
    ];

    const bankDetails = [
        { label: "Account Name", value: "DREAM LINE PRODUCTION" },
        { label: "Bank Name", value: "UCO BANK" },
        { label: "Account Number", value: "05840210001073" },
        { label: "IFSC Code", value: "UCBA0000584" },
        { label: "SWIFT Code", value: "UCBAINBB022" },
        { label: "Branch", value: "Kalighat" }
    ];

    return (
        <main className="bg-black pt-32 pb-24 min-h-screen">
            <div className="container mx-auto px-6 max-w-4xl">
                {/* Header */}
                <div className="mb-16 border-b border-white/10 pb-12">
                    <p className="text-[#c5a059] font-black uppercase tracking-[0.4em] text-[10px] mb-4">Official Documentation</p>
                    <h1 className="font-heading text-5xl md:text-7xl font-black text-white uppercase tracking-tighter">
                        COMPANY <br /> <span className="text-[#c5a059]">DETAILS.</span>
                    </h1>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Legal Identity */}
                    <div className="space-y-12">
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-8 flex items-center gap-4">
                                <span className="w-8 h-px bg-white/20"></span> LEGAL IDENTITY
                            </h3>
                            <div className="space-y-6">
                                {details.map((item, i) => (
                                    <div key={i} className="group">
                                        <p className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest mb-1">{item.label}</p>
                                        <p className="text-xl font-bold text-white group-hover:text-[#c5a059] transition-colors">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Additional Verification Info */}
                        <div className="p-6 bg-[#c5a059]/5 border border-[#c5a059]/10 rounded-2xl">
                            <h4 className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest mb-4">Verification Status</h4>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <p className="text-[10px] font-bold text-white uppercase tracking-wider">Govt. Registered & Verified</p>
                            </div>
                        </div>
                    </div>

                    {/* Financial Details */}
                    <div>
                        <div className="bg-[#0a0a0a] border border-white/5 p-8 md:p-12 rounded-3xl sticky top-32">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-8 flex items-center gap-4">
                                <span className="w-8 h-px bg-white/20"></span> BANKING DETAILS
                            </h3>
                            <div className="space-y-8">
                                {bankDetails.map((item, i) => (
                                    <div key={i} className="border-b border-white/5 pb-4 last:border-0">
                                        <p className="text-[8px] font-black text-[#c5a059] uppercase tracking-widest mb-1">{item.label}</p>
                                        <p className="text-lg font-bold text-white tracking-tight">{item.value}</p>
                                    </div>
                                ))}
                                <div className="pt-4">
                                    <div className="p-4 bg-[#c5a059]/10 border border-[#c5a059]/20 rounded-xl">
                                        <p className="text-[10px] text-[#c5a059] font-bold uppercase leading-relaxed">
                                            Note: Please ensure the Account Name exactly matches "DREAM LINE PRODUCTION" during fund transfers.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
