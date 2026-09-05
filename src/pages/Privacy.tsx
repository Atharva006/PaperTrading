import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#e5e5e5] font-sans selection:bg-[#d97757]/30 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-[#18181b]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 sm:p-12 shadow-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-[#8c8c8c] hover:text-white transition-colors mb-10 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-[#d97757] font-semibold tracking-wider text-xs uppercase mb-10">Last Updated: September 2026</p>
        
        <div className="space-y-8 text-[#8c8c8c] leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
            <p>Trade Edge collects information you provide directly to us when creating an account, including your email address and authentication credentials. We also collect the trading data, journal entries, account balances, and screenshots you upload to your private dashboard to provide our analytics services.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
            <p>The primary purpose of collecting your data is to generate your performance metrics, equity curves, and provide you with insights into your trading psychology. Your data is processed securely and is never sold to third-party marketing firms, hedge funds, or proprietary trading firms.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Data Security</h2>
            <p>We implement strict, industry-standard security measures to protect your personal and trading data. All data is encrypted in transit and at rest using modern cryptographic protocols. While no service is completely immune to breaches, we operate under a zero-trust model to safeguard your edge.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact our support team at <a href="mailto:atharva.bhosale@yahoo.com" className="text-[#d97757] hover:underline">atharva.bhosale@yahoo.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
