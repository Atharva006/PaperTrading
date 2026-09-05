const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

content = content.replace(
`  const handleAppleLogin = async () => {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: window.location.origin + '/dashboard' } });
    if (error) setError(error.message);
  };`,
`  const handleXLogin = async () => {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'twitter', options: { redirectTo: window.location.origin + '/dashboard' } });
    if (error) setError(error.message);
  };`
);

content = content.replace(
`              <button
                type="button"
                onClick={handleAppleLogin}
                onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-white/10 rounded-xl shadow-sm bg-black/40 text-sm font-medium text-white hover:bg-white/5 transition-colors focus:outline-none"
              >
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05 1.9-3.1 1.9-1.12 0-1.45-.66-3.08-.66-1.6 0-1.99.64-3.05.64-1.07 0-2.19-.99-3.23-2-2.15-2.11-4.04-6.18-3.03-9.45.69-2.26 2.5-3.72 4.39-3.75 1.62-.03 2.76.99 3.63.99.88 0 2.22-1.22 4.14-1.03 1.66.16 3.04.79 3.84 1.83-3.21 1.76-2.67 5.75.29 6.89-.66 1.89-1.63 3.75-2.8 4.64zM12.02 5.25c-.05-1.57.88-3.13 1.97-4.02 1.09-1 2.65-1.61 3.97-1.54.12 1.63-.78 3.19-1.92 4.1-1.04.83-2.62 1.54-4.02 1.46z"/>
                </svg>
                Apple
              </button>`,
`              <button
                type="button"
                onClick={handleXLogin}
                onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-white/10 rounded-xl shadow-sm bg-black/40 text-sm font-medium text-white hover:bg-white/5 transition-colors focus:outline-none"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                X
              </button>`
);

fs.writeFileSync('src/pages/Login.tsx', content);
