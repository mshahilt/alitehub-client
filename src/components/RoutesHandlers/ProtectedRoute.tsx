import React, { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { refreshToken } from "../../services/api/interceptor";

interface ProtectedRouteProps {
  element: ReactElement;
  requiredRole?: string;
}

interface DecodedToken {
  role?: string;
  exp?: number;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, requiredRole }) => {
  const [isAuthorized, setIsAuthorized] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkAuthorization = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsAuthorized(false);
        return;
      }

      try {
        const decodedToken: DecodedToken = jwtDecode(token);
        const userRole = decodedToken?.role;
        const expiryTime = decodedToken?.exp ? decodedToken.exp * 1000 : 0;

        if (Date.now() > expiryTime) {
          const newToken = await refreshToken();
          if (newToken) {
            localStorage.setItem("token", newToken);
            setIsAuthorized(true);
          } else {
            localStorage.removeItem("token");
            setIsAuthorized(false);
          }
        } else if (requiredRole && requiredRole !== userRole) {
          setIsAuthorized(false);
        } else {
          setIsAuthorized(true);
        }
      } catch (error) {
        localStorage.removeItem("token");
        setIsAuthorized(false);
      }
    };

    checkAuthorization();
  }, [requiredRole]);

  if (isAuthorized === null) {
    return <div>Loading...</div>;
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
