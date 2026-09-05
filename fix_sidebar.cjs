const fs = require('fs');
let content = fs.readFileSync('src/layouts/DashboardLayout.tsx', 'utf8');

// Update imports to include Settings
content = content.replace(
  "LogOut, User, FileText",
  "LogOut, User, Settings, FileText"
);

// Update nav items
content = content.replace(
  "{ name: 'Trader', path: '/dashboard/profile', icon: User },",
  "{ name: 'Settings', path: '/dashboard/profile', icon: Settings },"
);

fs.writeFileSync('src/layouts/DashboardLayout.tsx', content);
