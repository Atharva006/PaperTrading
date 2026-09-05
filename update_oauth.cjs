const fs = require('fs');

let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

content = content.replace(
  "await supabase.auth.signInWithOAuth({ provider: 'google' });",
  "await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/dashboard' } });"
);

content = content.replace(
  "await supabase.auth.signInWithOAuth({ provider: 'apple' });",
  "await supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: window.location.origin + '/dashboard' } });"
);

fs.writeFileSync('src/pages/Login.tsx', content);
