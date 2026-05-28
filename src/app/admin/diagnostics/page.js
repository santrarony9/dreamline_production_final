'use client';

import { useState } from 'react';

export default function DiagnosticsPage() {
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState(null);
    const [error, setError] = useState(null);

    const triggerSync = async () => {
        setLoading(true);
        setOutput(null);
        setError(null);
        
        try {
            const secret = prompt("Enter Automation Secret to Trigger (hint: dreamline_auto_2026):", "dreamline_auto_2026");
            if (!secret) {
                setLoading(false);
                return;
            }

            const res = await fetch(`/api/admin/automation/daily-sync?secret=${secret}`);
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || `HTTP ${res.status}`);
            }
            
            setOutput(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-12 max-w-4xl">
            <header>
                <h2 className="text-sm font-black text-[#c5a059] uppercase tracking-[0.4em] mb-2">Diagnostics</h2>
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Automation <span className="text-gray-700">Fallback.</span></h1>
            </header>

            <section className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-2">Google Business Profile Sync</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed max-w-xl">
                            Use this tool to manually trigger the daily sync and view the raw Make.com webhook response. This helps diagnose mapping errors or API failures.
                        </p>
                    </div>
                    <button 
                        onClick={triggerSync}
                        disabled={loading}
                        className="bg-[#c5a059] hover:bg-white text-black text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-full transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Run Diagnostics'}
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-xs text-red-500 font-bold uppercase tracking-widest">Error: {error}</p>
                    </div>
                )}

                {output && (
                    <div className="space-y-6 border-t border-white/5 pt-8">
                        <div>
                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 ${output.status === 'SYNCED' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                Status: {output.status}
                            </span>
                        </div>
                        
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Execution Logs:</h4>
                            <div className="bg-black border border-white/10 rounded-xl p-4 font-mono text-[10px] text-gray-400 max-h-64 overflow-y-auto space-y-1">
                                {output.logs?.map((log, i) => (
                                    <div key={i}>{log}</div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Raw JSON Response:</h4>
                            <pre className="bg-black border border-white/10 rounded-xl p-4 font-mono text-[10px] text-[#c5a059] overflow-x-auto">
                                {JSON.stringify(output, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
