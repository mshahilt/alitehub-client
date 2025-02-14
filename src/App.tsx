import Home from "./page/User/Home";
import RegisterPage from "./page/User/RegisterPage";
import LoginPage from "./page/User/LoginPage";
import Profile from "./page/User/Profile";
import CompanyLoginPage from "./page/Company/CompanyLoginPage";
import CompanyRegisterPage from "./page/Company/CompanyRegisterPage";
import CompanyProfilePage from "./page/Company/CompanyProfilePage";
import CompanyHomePage from "./page/Company/CompanyHomePage";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedAuthRoute from "./components/RoutesHandlers/ProtectedAuthRoute";
import ProtectedRoute from "./components/RoutesHandlers/ProtectedRoute";
import UserManagement from "./page/Admin/UserManagement";
import ForgetPassword from "./page/User/ForgetPassword";
import AdminLogin from "./page/Admin/AdminLogin"
import CompanyManagement from "./page/Admin/CompanyManagement";
const App = () => {
  return (
    <>
      <BrowserRouter>
        <ToastContainer autoClose={2000} position="top-center" />
        <Routes>
          <Route path="/register" element={<ProtectedAuthRoute element={<RegisterPage />} />} />
          <Route path="/login" element={<ProtectedAuthRoute element={<LoginPage />} />} />
          <Route path="/company/register" element={<ProtectedAuthRoute element={<CompanyRegisterPage />} />} />
          <Route path="/company/login" element={<ProtectedAuthRoute element={<CompanyLoginPage />} />} />
          <Route path="/forgot-password" element={<ProtectedAuthRoute element={<ForgetPassword />} />} />
          <Route path="/admin/login" element={<ProtectedAuthRoute element={<AdminLogin />}/>} />

          <Route path="/" element={<ProtectedRoute element={<Home />} requiredRole="user" />} />
          <Route path="/company" element={<ProtectedRoute element={<CompanyHomePage />} requiredRole="company" />} />
          <Route path="/:username" element={<ProtectedRoute element={<Profile />} requiredRole="user" />} />
          <Route path="/company/:companyIdentifier" element={<ProtectedRoute element={<CompanyProfilePage />} requiredRole="company" />} />

          <Route path="/admin/users"  element={<UserManagement/>}/>
          <Route path="/admin/companies"  element={<CompanyManagement/>}/>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
