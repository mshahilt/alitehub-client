import Home from "./page/User/Home";
import RegisterPage from "./page/User/RegisterPage";
import LoginPage from "./page/User/LoginPage";
import { Routes,Route, BrowserRouter } from 'react-router-dom';


const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
