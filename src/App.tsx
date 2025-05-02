import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { Toaster, toast } from "sonner";
import { RootState } from "./app/redux/store";
import LoadingScreen from "./components/Loading/Loading";

// Socket
const socket = io("https://api.alitehub.site", { withCredentials: true });

// Lazy-loaded pages
const Home = lazy(() => import("./page/User/Home"));
const RegisterPage = lazy(() => import("./page/User/RegisterPage"));
const LoginPage = lazy(() => import("./page/User/LoginPage"));
const Profile = lazy(() => import("./page/User/Profile"));
const CompanyLoginPage = lazy(() => import("./page/Company/CompanyLoginPage"));
const CompanyRegisterPage = lazy(() => import("./page/Company/CompanyRegisterPage"));
const CompanyProfilePage = lazy(() => import("./page/Company/CompanyProfilePage"));
const CompanyHomePage = lazy(() => import("./page/Company/CompanyHomePage"));
const ForgetPassword = lazy(() => import("./page/User/ForgetPassword"));
const AdminLogin = lazy(() => import("./page/Admin/AdminLogin"));
const UserManagement = lazy(() => import("./page/Admin/UserManagement"));
const CompanyManagement = lazy(() => import("./page/Admin/CompanyManagement"));
const CompanyAddNewJobPage = lazy(() => import("./page/Company/CompanyAddNewJobPage"));
const JobManagement = lazy(() => import("./page/Company/JobManagement"));
const CompanyApplicationsPage = lazy(() => import("./page/Company/CompanyApplicationsPage"));
const Jobs = lazy(() => import("./page/User/Jobs"));
const CompanyApplicationDetailPage = lazy(() => import("./page/Company/CompanyApplicationDetailPage"));
const UserApplicationDetailPage = lazy(() => import("./page/User/ApplicationDetails"));
const Companies = lazy(() => import("./page/User/Companies"));
const InterviewPage = lazy(() => import("./page/User/InterviewPage"));
const CompanyInterviewPage = lazy(() => import("./page/Company/CompanyInterviewPage"));
const CompanyEditJobPage = lazy(() => import("./page/Company/CompanyEditJobPage"));
const Job = lazy(() => import("./page/User/Job"));
const Application = lazy(() => import("./page/User/Applications"));
const ResumeBuilder = lazy(() => import("./page/User/CreateResume"));
const Search = lazy(() => import("./page/User/Search"));
const AddPost = lazy(() => import("./page/User/AddPost"));
const Message = lazy(() => import("./page/User/Message"));
const SubscriptionManagement = lazy(() => import("./page/Admin/SubscriptionManagement"));
const CompanySubscriptionPage = lazy(() => import("./page/Company/CompanySubscriptionPage"));
const AdminDashboard = lazy(() => import("./page/Admin/AdminDashboard"));

// Route protection
import ProtectedAuthRoute from "./components/RoutesHandlers/ProtectedAuthRoute";
import ProtectedRoute from "./components/RoutesHandlers/ProtectedRoute";

const App = () => {
  const { existingUser } = useSelector((state: RootState) => state.userAuth);

  useEffect(() => {
    if (!existingUser.id) return;

    socket.emit("register", existingUser.id);

    socket.on("receive_notification", (data) => {
      toast.info(`🔔 ${data.message}`);
    });

    return () => {
      socket.off("receive_notification");
    };
  }, [existingUser]);

  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Auth */}
            <Route path="/register" element={<ProtectedAuthRoute element={<RegisterPage />} />} />
            <Route path="/login" element={<ProtectedAuthRoute element={<LoginPage />} />} />
            <Route path="/company/register" element={<ProtectedAuthRoute element={<CompanyRegisterPage />} />} />
            <Route path="/company/login" element={<ProtectedAuthRoute element={<CompanyLoginPage />} />} />
            <Route path="/forgot-password" element={<ProtectedAuthRoute element={<ForgetPassword />} />} />
            <Route path="/admin/login" element={<ProtectedAuthRoute element={<AdminLogin />} />} />

            {/* User */}
            <Route path="/build-resume" element={<ProtectedRoute element={<ResumeBuilder />} requiredRole="user" />} />
            <Route path="/add-post" element={<ProtectedRoute element={<AddPost />} requiredRole="user" />} />
            <Route path="/jobs" element={<ProtectedRoute element={<Jobs />} requiredRole="user" />} />
            <Route path="/search" element={<ProtectedRoute element={<Search />} requiredRole="user" />} />
            <Route path="/message" element={<ProtectedRoute element={<Message />} requiredRole="user" />} />
            <Route path="/companies" element={<ProtectedRoute element={<Companies />} requiredRole="user" />} />
            <Route path="/jobs/:jobId" element={<ProtectedRoute element={<Job />} requiredRole="user" />} />
            <Route path="/application/:id" element={<ProtectedRoute element={<UserApplicationDetailPage />} requiredRole="user" />} />
            <Route path="/interview/:roomId" element={<ProtectedRoute element={<InterviewPage />} requiredRole="user" />} />
            <Route path="/" element={<ProtectedRoute element={<Home />} requiredRole="user" />} />
            <Route path="/applications" element={<ProtectedRoute element={<Application />} requiredRole="user" />} />
            <Route path="/:username" element={<ProtectedRoute element={<Profile />} requiredRole="user" />} />

            {/* Company */}
            <Route path="/company" element={<ProtectedRoute element={<CompanyHomePage />} requiredRole="company" />} />
            <Route path="/company/jobs/add" element={<ProtectedRoute element={<CompanyAddNewJobPage />} requiredRole="company" />} />
            <Route path="/company/plans" element={<ProtectedRoute element={<CompanySubscriptionPage />} requiredRole="company" />} />
            <Route path="/company/jobs" element={<ProtectedRoute element={<JobManagement />} requiredRole="company" />} />
            <Route path="/company/job/edit/:jobId" element={<ProtectedRoute element={<CompanyEditJobPage />} requiredRole="company" />} />
            <Route path="/company/applications" element={<ProtectedRoute element={<CompanyApplicationsPage />} requiredRole="company" />} />
            <Route path="/company/application/:id" element={<ProtectedRoute element={<CompanyApplicationDetailPage />} requiredRole="company" />} />
            <Route path="/company/interview/:roomId" element={<ProtectedRoute element={<CompanyInterviewPage />} requiredRole="company" />} />
            <Route path="/company/:companyIdentifier" element={<ProtectedRoute element={<CompanyProfilePage />} requiredRole="company" />} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />} />
            <Route path="/admin/users" element={<ProtectedRoute element={<UserManagement />} requiredRole="admin" />} />
            <Route path="/admin/companies" element={<ProtectedRoute element={<CompanyManagement />} requiredRole="admin" />} />
            <Route path="/admin/plans" element={<ProtectedRoute element={<SubscriptionManagement />} requiredRole="admin" />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
};

export default App;
