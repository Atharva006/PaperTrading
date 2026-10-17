import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#030303] text-[#F5F5F5] font-sans selection:bg-[#D4AF65] selection:text-[#030303] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-[#0D0D0D] border border-[#242424] rounded-2xl p-8 sm:p-12 shadow-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-[#71717A] hover:text-[#F5F5F5] transition-colors mb-8 text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <h1 className="text-3xl sm:text-4xl font-bold font-cinzel text-[#F5F5F5] tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-[#D4AF65] font-semibold tracking-wider text-xs uppercase mb-8 font-mono">Last Updated: October 2026 · CNRX | Cendrix Capital</p>
        
        <div className="space-y-6 text-[#A1A1AA] text-xs leading-relaxed">
          <section>
            <h2 className="text-base font-bold font-cinzel text-[#F5F5F5] mb-2">1. Information We Collect</h2>
            <p>CNRX collects information you provide directly to us when creating a virtual trading account, including your email address and authentication credentials. We also record simulated trading data, order book history, virtual account balances, and ledger transactions in your private workspace.</p>
          </section>
          
          <section>
            <h2 className="text-base font-bold font-cinzel text-[#F5F5F5] mb-2">2. How We Use Your Information</h2>
            <p>The primary purpose of collecting your data is to generate your performance metrics, equity curves, and provide you with insights into your trading psychology. Your data is processed securely and is never sold to third-party marketing firms, hedge funds, or external trading firms.</p>
          </section>
          
          <section>
            <h2 className="text-base font-bold font-cinzel text-[#F5F5F5] mb-2">3. Data Security</h2>
            <p>We implement strict, industry-standard security measures to protect your personal and trading data. All data is encrypted in transit and at rest using modern cryptographic protocols. While no service is completely immune to breaches, we operate under a zero-trust model to safeguard your edge.</p>
          </section>
          
          <section>
            <h2 className="text-base font-bold font-cinzel text-[#F5F5F5] mb-2">4. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact our support team at <a href="mailto:atharva.bhosale@yahoo.com" className="text-[#D4AF65] hover:underline">atharva.bhosale@yahoo.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
