import Sidebar from "./SideBar";
import Navbar from "./NavBar";
import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";

const Layout = () => {
  const location = useLocation();
  const isAuthPage = ['/login', '/signup'].some(path => 
    location.pathname.includes(path)
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {!isAuthPage && <Sidebar />}
      <div className={`flex-1 transition-all ${!isAuthPage ? 'ml-64' : ''}`}>
        <Navbar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;