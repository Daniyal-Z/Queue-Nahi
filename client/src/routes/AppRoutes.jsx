import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import Home from "../pages/Home";
import StudentLogin from "../pages/Login/StudentLogin";
import ManagerLogin from "../pages/Login/ManagerLogin";
import AdminLogin from "../pages/Login/AdminLogin";

import StudentSignUp from "../pages/SignUp/StudentSignUp"
import ManagerSignUp from "../pages/SignUp/ManagerSignUp"
import StudentDashboard from "../pages/Dashboard/StudentDashboard";
import RManagerDashboard from "../pages/Dashboard/RManagerDash";
import PManagerDashboard from "../pages/Dashboard/PManagerDash";
import GManagerDashboard from "../pages/Dashboard/GManagerDash";
import AdminDashboard from "../pages/Dashboard/AdminDashboard";
import MgrRestView from "../pages/Dashboard/MgrRestView";
import MgrPrintCafe from "../pages/Dashboard/MgrPrintCafe";
import MgrBookShop from "../pages/Dashboard/MgrBookShop";

const AppRoutes = () => {
  return (
    <Routes>
    {/* Public/Login Routes */}
    <Route path="/login/student" element={<StudentLogin />} />
    <Route path="/login/manager" element={<ManagerLogin />} />
    <Route path="/login/admin" element={<AdminLogin />} />

    <Route path="/signup/student" element={<StudentSignUp />} />
    <Route path="/signup/manager" element={<ManagerSignUp />} />

    {/* Protected/With Layout */}
    <Route element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/rmanager/dashboard" element={<RManagerDashboard />} />
      <Route path="/pmanager/dashboard" element={<PManagerDashboard />} />
      <Route path="/gmanager/dashboard" element={<GManagerDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/rmanager/restaurant/:id" element={<MgrRestView />} />
      <Route path="/pmanager/printcafe" element={<MgrPrintCafe />} />
      <Route path="/pmanager/bookshop" element={<MgrBookShop />} />

      {/* Add more routes that need layout here */}
    </Route>
  </Routes>
  );
};

export default AppRoutes;
