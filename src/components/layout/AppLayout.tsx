import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto scrollbar-solo">
        <div className="container py-6 px-4 md:px-6 lg:px-8 max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
