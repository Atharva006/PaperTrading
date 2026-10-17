const fs = require('fs');

// 1. Create Privacy.tsx
const privacyContent = `import React from 'react';
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
            <p>The primary purpose of collecting your data is to generate your performance metrics, equity curves, and provide you with insights into your trading psychology. Your data is processed securely and is never sold to third-party marketing firms, hedge funds, or external trading firms.</p>
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
`;
fs.writeFileSync('src/pages/Privacy.tsx', privacyContent);

// 2. Create Terms.tsx
const termsContent = `import React from 'react';
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
            <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to upload malicious software, misuse the platform, or attempt to reverse-engineer our internal quantitative analytics engines.</p>
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
`;
fs.writeFileSync('src/pages/Terms.tsx', termsContent);

// 3. Update App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// Add imports
appContent = appContent.replace(
  "import Landing from './pages/Landing';", 
  "import Landing from './pages/Landing';\nimport Privacy from './pages/Privacy';\nimport Terms from './pages/Terms';"
);

// Add routes
appContent = appContent.replace(
  `<Route path="/" element={<Landing />} />`,
  `<Route path="/" element={<Landing />} />\n          <Route path="/privacy" element={<Privacy />} />\n          <Route path="/terms" element={<Terms />} />`
);

fs.writeFileSync('src/App.tsx', appContent);

// 4. Update Landing.tsx Footer
let landingContent = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

const oldFooterLinks = `<div className="flex gap-6 text-xs font-medium text-[#8c8c8c]">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>`;

const newFooterLinks = `<div className="flex flex-wrap justify-center gap-6 text-xs font-medium text-[#8c8c8c]">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <a href="mailto:atharva.bhosale@yahoo.com" className="hover:text-[#d97757] transition-colors">Support (atharva.bhosale@yahoo.com)</a>
              <a href="https://www.linkedin.com/in/atharva--bhosale" target="_blank" rel="noopener noreferrer" className="hover:text-[#0a66c2] transition-colors">LinkedIn</a>
            </div>`;

landingContent = landingContent.replace(oldFooterLinks, newFooterLinks);
fs.writeFileSync('src/pages/Landing.tsx', landingContent);

