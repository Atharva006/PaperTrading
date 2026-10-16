import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#0B1424] text-[#F5F5F2] selection:bg-[#C6A15B] selection:text-[#0B1424]">
      <Outlet />
    </div>
  );
}
