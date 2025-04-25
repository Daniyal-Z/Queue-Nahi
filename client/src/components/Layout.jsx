import Sidebar from "./SideBar";
import Navbar from "./NavBar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-4">
          <Outlet /> {/* This is where nested children render */}
        </main>
      </div>
    </div>
  );
};

export default Layout;
