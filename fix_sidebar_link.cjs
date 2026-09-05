const fs = require('fs');
let content = fs.readFileSync('src/layouts/DashboardLayout.tsx', 'utf8');

const oldNavItems = `const bottomNavItems = [
  { name: 'Home', path: '/', icon: LayoutDashboard },
  { name: 'Trader', path: '/dashboard/profile', icon: User },
];`;

const newNavItems = `import { Settings } from 'lucide-react';\n\nconst bottomNavItems = [
  { name: 'Home', path: '/', icon: LayoutDashboard },
  { name: 'Settings', path: '/dashboard/profile', icon: Settings },
];`;

// But we already import lucide-react at the top. Let's just do a regex replace for 'Trader' and the icon.
