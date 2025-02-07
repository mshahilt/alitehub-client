import Home from "./page/User/Home";
import RegisterPage from "./page/User/RegisterPage";
import LoginPage from "./page/User/LoginPage";
import Profile from "./page/User/Profile";
import CompanyLoginPage from "./page/Company/CompanyLoginPage";
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
            <Route path="/profile" element={<Profile />} />
            <Route path="/company/register" element={<CompanyLoginPage />} />

          </Routes>
        </BrowserRouter>
    </>
  )
}

export default App
