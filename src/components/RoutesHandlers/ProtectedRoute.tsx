import React, { ReactElement, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { refreshToken } from "@/services/api/auth/authApi";
import LoadingScreen from "../Loading/Loading";
import { getMe } from "@/app/redux/slices/user/userAuthSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/app/redux/store";

interface ProtectedRouteProps {
  element: ReactElement;
  requiredRole?: string;
}

interface DecodedToken {
  role?: string;
  exp?: number;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, requiredRole }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const checkAuthorization = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsAuthorized(false);
        return;
      }

      try {
        const decodedToken: DecodedToken = jwtDecode(token);
        const role = decodedToken?.role;
        const expiryTime = decodedToken?.exp ? decodedToken.exp * 1000 : 0;

        if (Date.now() > expiryTime) {
          const newToken = await refreshToken();
          if (newToken) {
            localStorage.setItem("token", newToken);
            setUserRole(role || null);
            setIsAuthorized(true);
          } else {
            localStorage.removeItem("token");
            setIsAuthorized(false);
          }
        } else if (requiredRole && requiredRole !== role) {
          setIsAuthorized(false);
        } else {
          setUserRole(role || null);
          setIsAuthorized(true);
        }
      } catch (error) {
        localStorage.removeItem("token");
        setIsAuthorized(false);
      }
    };

    checkAuthorization();
  }, [requiredRole]);

  useEffect(() => {
    if (isAuthorized && userRole === "user") {
      dispatch(getMe());
    }
  }, [isAuthorized, userRole, dispatch]);

  if (isAuthorized === null) {
    return <LoadingScreen />;
  }

  if (!isAuthorized) {
    if (requiredRole === "company") {
      return <Navigate to={"/company/login"} />;
    } else if (requiredRole === "admin") {
      return <Navigate to={"/admin/login"} />;
    } else {
      return <Navigate to={"/login"} />;
    }
  }

  return element;
};

export default ProtectedRoute;
