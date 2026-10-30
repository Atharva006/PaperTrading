import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SEO } from '../components/common/SEO';

export default function Privacy() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://cendrix-capital-stf.vercel.app/'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Privacy Policy',
        'item': 'https://cendrix-capital-stf.vercel.app/privacy'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC] text-[#111114] font-sans py-20 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Privacy Policy — Cendrix Capital"
        description="Learn how Cendrix Capital handles your simulated trading data, virtual account balances, and security under our zero-trust data model."
        canonical="https://cendrix-capital-stf.vercel.app/privacy"
        ogType="article"
        jsonLd={breadcrumbJsonLd}
      />
      <div className="max-w-4xl mx-auto bg-white border border-[#D9E2F2] rounded-2xl p-8 sm:p-12 shadow-[0_2px_12px_rgba(0,34,90,0.04)]">
        <Link to="/" className="inline-flex items-center gap-2 text-[#6B7A90] hover:text-[#00225A] transition-colors mb-8 text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-[#00225A] tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-[#536CF0] font-semibold tracking-wider text-xs uppercase mb-8 font-mono">Last Updated: October 2026 · Cendrix Capital</p>
        
        <div className="space-y-6 text-[#6B7A90] text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-bold font-display text-[#00225A] mb-2">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when creating a virtual trading account, including your email address and authentication credentials. We also record simulated trading data, order book history, virtual account balances, and ledger transactions in your private workspace.</p>
          </section>
          
          <section>
            <h2 className="text-base font-bold font-display text-[#00225A] mb-2">2. How We Use Your Information</h2>
            <p>The primary purpose of collecting your data is to generate your performance metrics, equity curves, and provide you with insights into your trading psychology. Your data is processed securely and is never sold to third-party marketing firms, hedge funds, or external trading firms.</p>
          </section>
          
          <section>
            <h2 className="text-base font-bold font-display text-[#00225A] mb-2">3. Data Security</h2>
            <p>We implement strict, industry-standard security measures to protect your personal and trading data. All data is encrypted in transit and at rest using modern cryptographic protocols. While no service is completely immune to breaches, we operate under a zero-trust model to safeguard your edge.</p>
          </section>
          
          <section>
            <h2 className="text-base font-bold font-display text-[#00225A] mb-2">4. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact our support team at <a href="mailto:atharva.bhosale@yahoo.com" className="text-[#536CF0] hover:underline font-semibold">atharva.bhosale@yahoo.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}