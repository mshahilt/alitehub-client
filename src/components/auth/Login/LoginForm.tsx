import React, { useState, FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from "../../../app/redux/store";
import { login } from '../../../services/api/auth/authApi';
import { toast } from 'react-toastify';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';

interface FormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      const action = await dispatch(login(formData));
      if (login.fulfilled.match(action)) {
        console.log(action.payload);
        toast.success(action.payload.user.message);
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (response: any): Promise<void> => {
    try {
      const { credential } = response;

      // Fetch user profile from Google
      const userInfoResponse = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${credential}` },
        }
      );

      const userData = userInfoResponse.data;
      console.log("Google User Data:", userData);

      // Send the Google user data to your backend for authentication
      const backendResponse = await axios.post(
        "http://localhost:5000/api/user/google/auth",
        { userData }
      );

      console.log("Backend Response:", backendResponse.data);

      if (backendResponse.data.token) {
        localStorage.setItem("token", backendResponse.data.token);
      }
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  const handleGoogleLoginFailure = (): void => {
    console.error("Google Login Failed");
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-secondary rounded-2xl shadow-2xl overflow-hidden">
        <div className="w-full p-8 lg:p-12">
          <div className="flex justify-center lg:justify-start">
            <img
              src="/images/logo.png"
              className="h-12 w-auto"
              alt="Logo"
            />
          </div>

          <div className="mt-12">
            <h2 className="text-3xl font-bold text-white mb-8">Welcome back</h2>

            {/* Google Login Button */}
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginFailure}
              useOneTap
            />

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-secondary px-4 text-sm text-gray-400">or continue with email</span>
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
                  className="w-full px-4 py-3 rounded-xl text-gray-100 bg-gray-700 border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200"
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
                  className="w-full px-4 py-3 rounded-xl text-gray-100 bg-gray-700 border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-600 text-indigo-500 focus:ring-indigo-500 bg-gray-700"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm font-medium text-indigo-400 hover:text-indigo-300">
                  Forgot password?
                </a>
              </div>

              {error && (
                <p className="text-sm text-center text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl p-3 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <a href="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
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
