import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#e5e5e5] font-sans selection:bg-[#d97757]/30 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-[#18181b]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 sm:p-12 shadow-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-[#8c8c8c] hover:text-white transition-colors mb-10 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">Terms of Service</h1>
        <p className="text-[#d97757] font-semibold tracking-wider text-xs uppercase mb-10">Last Updated: September 2026</p>
        
        <div className="space-y-8 text-[#8c8c8c] leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Trade Edge, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you do not have permission to access the service.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Not Financial Advice</h2>
            <p>Trade Edge is a journaling and analytics software tool. Nothing provided within the application constitutes financial, investment, legal, or tax advice. We do not recommend trades, guarantee profits, or promise funding. You are entirely responsible for the risks associated with trading financial markets.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. User Responsibilities</h2>
            <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to upload malicious software, misuse the platform, or attempt to reverse-engineer our proprietary analytics engines.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Contact & Support</h2>
            <p>For support requests or inquiries regarding these terms, you may reach out directly to the founder via email at <a href="mailto:atharva.bhosale@yahoo.com" className="text-[#d97757] hover:underline">atharva.bhosale@yahoo.com</a> or connect on <a href="https://www.linkedin.com/in/atharva--bhosale" target="_blank" rel="noopener noreferrer" className="text-[#d97757] hover:underline">LinkedIn</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
