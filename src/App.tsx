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
import CompanyAddNewJobPage from "./page/Company/CompanyAddNewJobPage";
import JobManagement from "./page/Company/JobManagement";
import CompanyApplicationsPage from "./page/Company/CompanyApplicationsPage";
import Jobs from "./page/User/Jobs";
import Job from "./page/User/Job";
import Application from "./page/User/Applications";
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

          <Route path="/jobs" element={<ProtectedRoute element={<Jobs />} requiredRole="user" />} />
          <Route path="/jobs/:jobId" element={<ProtectedRoute element={<Job />} requiredRole="user" />} />
          <Route path="/" element={<ProtectedRoute element={<Home />} requiredRole="user" />} />
          <Route path="/applications" element={<ProtectedRoute element={<Application />} requiredRole="user" />} />
          <Route path="/company" element={<ProtectedRoute element={<CompanyHomePage />} requiredRole="company" />} />
          <Route path="/company/jobs/add" element={<ProtectedRoute element={<CompanyAddNewJobPage />} requiredRole="company" />} />
          <Route path="/company/jobs" element={<ProtectedRoute element={<JobManagement />} requiredRole="company" />} />
          <Route path="/company/applications" element={<ProtectedRoute element={<CompanyApplicationsPage />} requiredRole="company" />} />
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
