import Home from "./page/User/Home";
import RegisterPage from "./page/User/RegisterPage";
import LoginPage from "./page/User/LoginPage";
import Profile from "./page/User/Profile";
import CompanyLoginPage from "./page/Company/CompanyLoginPage";
import CompanyRegisterPage from "./page/Company/CompanyRegisterPage";
import { Routes,Route, BrowserRouter } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'; 

const App = () => {
  return (
    <>
        <BrowserRouter>
        <ToastContainer autoClose={2000}
                        position="top-center"/>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/:username" element={<Profile />} />
            <Route path="/company/register" element={<CompanyRegisterPage />} />
            <Route path="/company/login" element={<CompanyLoginPage />} />

          </Routes>
        </BrowserRouter>
    </>
  )
}

export default App
