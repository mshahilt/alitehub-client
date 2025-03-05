import Home from "./page/User/Home";
import RegisterPage from "./page/User/RegisterPage";
import LoginPage from "./page/User/LoginPage";
import Profile from "./page/User/Profile";
import CompanyLoginPage from "./page/Company/CompanyLoginPage";
import CompanyRegisterPage from "./page/Company/CompanyRegisterPage";
import CompanyProfilePage from "./page/Company/CompanyProfilePage";
import CompanyHomePage from "./page/Company/CompanyHomePage";
import { Routes, Route, BrowserRouter } from "react-router-dom";
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
import Application from "./page/User/Applications"
import ResumeBuilder from "./page/User/CreateResume";
import Search from "./page/User/Search";
import AddPost from "./page/User/AddPost";
import { Toaster } from 'sonner';
import { toast } from "sonner";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { RootState } from "./app/redux/store";

const socket = io("http://localhost:5000", { withCredentials:  true });


const App = () => {
  const { existingUser } = useSelector((state: RootState) => state.userAuth)
  useEffect(() => {
    if(!existingUser.id) return;
    console.log("Registering user with ID:", existingUser.id);
    console.log("user", existingUser);
    socket.emit("register", existingUser.id);

    socket.on("receive_notification", (data) => {
      console.log("📩 New Notification:", data);
      toast.info(`🔔 ${data.message}`);
    });

    return () => {
      console.log("Cleaning up socket listener for user ID:", existingUser.id);
      socket.off("receive_notification");
    };
  }, [existingUser])
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<ProtectedAuthRoute element={<RegisterPage />} />} />
          <Route path="/login" element={<ProtectedAuthRoute element={<LoginPage />} />} />
          <Route path="/company/register" element={<ProtectedAuthRoute element={<CompanyRegisterPage />} />} />
          <Route path="/company/login" element={<ProtectedAuthRoute element={<CompanyLoginPage />} />} />
          <Route path="/forgot-password" element={<ProtectedAuthRoute element={<ForgetPassword />} />} />
          <Route path="/admin/login" element={<ProtectedAuthRoute element={<AdminLogin />} />} />

          <Route path="/build-resume" element={<ProtectedRoute element={<ResumeBuilder />} requiredRole="user" />} />
          {/* <Route path="/edit-image" element={<ProtectedRoute element={<ImageEditor />} requiredRole="user" />} /> */}
          <Route path="/add-post" element={<ProtectedRoute element={<AddPost />} requiredRole="user" />} />
          <Route path="/jobs" element={<ProtectedRoute element={<Jobs />} requiredRole="user" />} />
          <Route path="/search" element={<ProtectedRoute element={<Search />} requiredRole="user" />} />
          <Route path="/jobs/:jobId" element={<ProtectedRoute element={<Job />} requiredRole="user" />} />
          <Route path="/" element={<ProtectedRoute element={<Home />} requiredRole="user" />} />
          <Route path="/applications" element={<ProtectedRoute element={<Application />} requiredRole="user" />} />
          <Route path="/company" element={<ProtectedRoute element={<CompanyHomePage />} requiredRole="company" />} />
          <Route path="/company/jobs/add" element={<ProtectedRoute element={<CompanyAddNewJobPage />} requiredRole="company" />} />
          <Route path="/company/jobs" element={<ProtectedRoute element={<JobManagement />} requiredRole="company" />} />
          <Route path="/company/applications" element={<ProtectedRoute element={<CompanyApplicationsPage />} requiredRole="company" />} />
          <Route path="/:username" element={<ProtectedRoute element={<Profile />} requiredRole="user" />} />
          <Route path="/company/:companyIdentifier" element={<ProtectedRoute element={<CompanyProfilePage />} requiredRole="company" />} />

          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/companies" element={<CompanyManagement />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};


export default App;
