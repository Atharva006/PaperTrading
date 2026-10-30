import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SEO } from '../components/common/SEO';

export default function Terms() {
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
        'name': 'Terms of Service',
        'item': 'https://cendrix-capital-stf.vercel.app/terms'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC] text-[#111114] font-sans py-20 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Terms of Service — Demo Trading Platform | Cendrix Capital"
        description="Review the terms, simulated execution rules, and legal agreements for using Cendrix Capital's virtual paper trading simulator."
        canonical="https://cendrix-capital-stf.vercel.app/terms"
        keywords="Cendrix Capital terms of service, demo trading platform rules, simulated trading disclaimer, virtual paper trading agreement"
        ogType="article"
        jsonLd={breadcrumbJsonLd}
      />
      <div className="max-w-4xl mx-auto bg-white border border-[#D9E2F2] rounded-2xl p-8 sm:p-12 shadow-[0_2px_12px_rgba(0,34,90,0.04)]">
        <Link to="/" className="inline-flex items-center gap-2 text-[#6B7A90] hover:text-[#00225A] transition-colors mb-8 text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-[#00225A] tracking-tight mb-2">Terms of Service</h1>
        <p className="text-[#536CF0] font-semibold tracking-wider text-xs uppercase mb-8 font-mono">Last Updated: October 2026 · Cendrix Capital</p>
        
        <div className="space-y-6 text-[#6B7A90] text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-bold font-display text-[#00225A] mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using Cendrix Capital, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you do not have permission to access the simulated paper trading platform.</p>
          </section>
          
          <section>
            <h2 className="text-base font-bold font-display text-[#00225A] mb-2">2. Simulated Trading & Not Financial Advice</h2>
            <p>This is a strictly simulated virtual paper trading and execution testing platform. Nothing provided within the application constitutes financial, investment, legal, or tax advice. We do not recommend trades, execute live capital brokerage, guarantee profits, or promise funding. You are entirely responsible for your own trading research and strategy testing.</p>
          </section>
          
          <section>
            <h2 className="text-base font-bold font-display text-[#00225A] mb-2">3. User Responsibilities</h2>
            <p>You are responsible for safeguarding the credentials you use to access the Service and for any activities or actions under your account. You agree not to misuse the platform or attempt to reverse-engineer our internal quantitative analytics engines.</p>
          </section>
          
          <section>
            <h2 className="text-base font-bold font-display text-[#00225A] mb-2">4. Contact & Support</h2>
            <p>For support requests or inquiries regarding these terms, you may reach out directly to the founder via email at <a href="mailto:atharva.bhosale@yahoo.com" className="text-[#536CF0] hover:underline font-semibold">atharva.bhosale@yahoo.com</a> or connect on <a href="https://www.linkedin.com/in/atharva--bhosale" target="_blank" rel="noopener noreferrer" className="text-[#536CF0] hover:underline font-semibold">LinkedIn</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}