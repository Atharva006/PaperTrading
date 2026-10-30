import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#FCFCFC] text-[#111114] selection:bg-[#536CF0] selection:text-white font-sans antialiased">
      <Outlet />
    </div>
  );
}
