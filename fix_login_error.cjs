const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

const oldEffect = `  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);`;

const newEffect = `  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', updateMousePosition);
    
    // Check for OAuth errors in URL
    const hash = window.location.hash;
    if (hash && hash.includes('error=')) {
      const params = new URLSearchParams(hash.substring(1));
      const errorDesc = params.get('error_description');
      if (errorDesc) {
        setError(decodeURIComponent(errorDesc).replace(/\\+/g, ' '));
      }
    }
    
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);`;

content = content.replace(oldEffect, newEffect);
fs.writeFileSync('src/pages/Login.tsx', content);
