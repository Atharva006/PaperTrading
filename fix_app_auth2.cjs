const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldProtectedRoute = `const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useStore((state) => state.user);
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};`;

const newProtectedRoute = `const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useStore((state) => state.user);
  if (!user) {
    // Preserve URL hash if there's an OAuth error so the login page can display it
    const hash = window.location.hash;
    return <Navigate to={\`/login\${hash}\`} replace />;
  }
  return <>{children}</>;
};`;

content = content.replace(oldProtectedRoute, newProtectedRoute);
fs.writeFileSync('src/App.tsx', content);
