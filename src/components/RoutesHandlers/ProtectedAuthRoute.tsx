import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  role?: string;
}

interface ProtectedAuthRouteProps {
  element: JSX.Element;
}

const ProtectedAuthRoute: React.FC<ProtectedAuthRouteProps> = ({ element }) => {
  const token = localStorage.getItem("token");

  if (token) {
    try {
      const decodedToken: DecodedToken = jwtDecode(token);

      if (decodedToken) {
        const userRole = decodedToken.role;

        if (userRole === "user") {
          return <Navigate to="/" />;
        }
        if (userRole === "company") {
          return <Navigate to="/company" />;
        }
      }
    } catch (error) {
      return <Navigate to="/login" />;
    }
  }

  return element;
};

export default ProtectedAuthRoute;
