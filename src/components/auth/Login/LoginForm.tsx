import React, { useState, FormEvent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch } from "../../../app/redux/store";
import { login, googleLogin } from '../../../services/api/auth/authApi';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import LoadingScreen from '../../Loading/Loading';

interface FormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  formFor: "user" | "company";
}

const LoginForm: React.FC<LoginFormProps> = ({ formFor }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, isAuthenticated } = useSelector((state: any) => state[`${formFor}Auth`]);
  
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isAuthenticated) {
      const path = formFor === "user" ? "/" : "/company";
      navigate(path, { replace: true });
    }
  }, [isAuthenticated, formFor, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const action = await dispatch(login({ userType: formFor, ...formData }));
      if (login.fulfilled.match(action)) {
        localStorage.setItem("token", action.payload.accessToken);
        location.reload();
        toast.success(action.payload.message);
      } else {
        const errorMessage = typeof action.payload === 'string' ? action.payload : 'Login failed';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    console.log("i am working")
    console.log(credentialResponse)
    try {
      const { credential } = credentialResponse;
      if (!credential) {
        toast.error("Google authentication failed");
        return;
      }

      const decoded: any = jwtDecode(credential);
      console.log("Google User Info:", decoded);

      const action = await dispatch(googleLogin({ userType: formFor, token: credential }));
      
      if (googleLogin.fulfilled.match(action)) {
        localStorage.setItem("token", action.payload.accessToken);
        toast.success("Google login successful!");
      } else {
        const errorMessage = action.payload ? String(action.payload) : "Google login failed";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      toast.error(error.message || "Google authentication error");
    }
  };

  const handleGoogleError = () => {
    toast.error("Google login failed. Please try again.");
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-secondary rounded-2xl shadow-2xl overflow-hidden">
        <div className="w-full p-8 lg:p-12">
          <div className="flex justify-center lg:justify-start">
            <img src="/images/logo.png" className="h-12 w-auto" alt="Logo" />
          </div>

          <div className="mt-12">
            <h2 className="text-3xl font-bold text-white mb-8">Welcome back</h2>

            <div className="w-full flex items-center justify-center gap-2 py-3 border rounded-lg border-gray-700 bg-gray-800 hover:bg-gray-700 transition-all duration-300 transform hover:scale-[1.02] px-4">
              <GoogleLogin 
                theme='filled_black'
                onSuccess={handleGoogleSuccess} 
                onError={handleGoogleError}
                useOneTap
              />
            </div>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-secondary px-4 text-sm text-gray-400">
                  or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl text-gray-100 bg-gray-700 border border-gray-600 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-colors duration-200"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl text-gray-100 bg-gray-700 border border-gray-600 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-colors duration-200"
                  placeholder="Enter your password"
                />
              </div>

              <div className="text-right">
                <a 
                  href="/forgot-password" 
                  className="text-sm text-gray-400 hover:text-gray-300"
                >
                  Forgot password?
                </a>
              </div>

              {error && (
                <p className="text-sm text-center text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-xl p-3 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <a href="/register" className="font-medium text-gray-400 hover:text-gray-300">
                Create one now
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;