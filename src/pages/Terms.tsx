import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#030303] text-[#F5F5F5] font-sans selection:bg-[#D4AF65] selection:text-[#030303] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-[#0D0D0D] border border-[#242424] rounded-2xl p-8 sm:p-12 shadow-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-[#71717A] hover:text-[#F5F5F5] transition-colors mb-8 text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <h1 className="text-3xl sm:text-4xl font-bold font-cinzel text-[#F5F5F5] tracking-tight mb-2">Terms of Service</h1>
        <p className="text-[#D4AF65] font-semibold tracking-wider text-xs uppercase mb-8 font-mono">Last Updated: October 2026 · CNRX | Cendrix Capital</p>
        
        <div className="space-y-6 text-[#A1A1AA] text-xs leading-relaxed">
          <section>
            <h2 className="text-base font-bold font-cinzel text-[#F5F5F5] mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using CNRX (operated by Cendrix Capital), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you do not have permission to access the simulated paper trading platform.</p>
          </section>
          
          <section>
            <h2 className="text-base font-bold font-cinzel text-[#F5F5F5] mb-2">2. Simulated Trading & Not Financial Advice</h2>
            <p>CNRX is a strictly simulated virtual paper trading and execution testing platform. Nothing provided within the application constitutes financial, investment, legal, or tax advice. We do not recommend trades, execute live capital brokerage, guarantee profits, or promise funding. You are entirely responsible for your own trading research and strategy testing.</p>
          </section>
          
          <section>
            <h2 className="text-base font-bold font-cinzel text-[#F5F5F5] mb-2">3. User Responsibilities</h2>
            <p>You are responsible for safeguarding the credentials you use to access the Service and for any activities or actions under your account. You agree not to misuse the platform or attempt to reverse-engineer our proprietary analytics engines.</p>
          </section>
          
          <section>
            <h2 className="text-base font-bold font-cinzel text-[#F5F5F5] mb-2">4. Contact & Support</h2>
            <p>For support requests or inquiries regarding these terms, you may reach out directly to the founder via email at <a href="mailto:atharva.bhosale@yahoo.com" className="text-[#D4AF65] hover:underline">atharva.bhosale@yahoo.com</a> or connect on <a href="https://www.linkedin.com/in/atharva--bhosale" target="_blank" rel="noopener noreferrer" className="text-[#D4AF65] hover:underline">LinkedIn</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
