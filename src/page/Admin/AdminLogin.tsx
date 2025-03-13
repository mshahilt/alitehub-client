import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/api/userInstance";
import { toast } from "react-toastify";
import LoadingScreen from "../../components/Loading/Loading";

interface FormData {
  email: string;
  password: string;
  remember: boolean;
}

const AdminLogin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    remember: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/admin/login', {
        email: formData.email,
        password: formData.password
      });
      console.log(response)
      if (response.status===200) {
        console.log(response.data)
        toast.success(response.data.message)
        if (response.data.accessToken) {
          localStorage.setItem("adminToken", response.data.accessToken);
          
          if (formData.remember) {
            localStorage.setItem("adminEmail", formData.email);
          } else {
            localStorage.removeItem("adminEmail");
          }
        }
        navigate("/admin/users"); 
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-primary flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-6">
      <h2 className="mt-6 text-center text-3xl leading-9 font-extrabold text-gray-100">
        Sign in to your account
      </h2>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-secondary py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit}>
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium leading-5 text-gray-100"
              >
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  id="email"
                  name="email"
                  placeholder="user@example.com"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-white bg-gray-700 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                />
              </div>
            </div>

            <div className="mt-6">
              <label 
                htmlFor="password" 
                className="block text-sm font-medium leading-5 text-gray-100"
              >
                Password
              </label>
              <div className="mt-1 rounded-md shadow-sm">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-white bg-gray-700 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center">
                <input 
                  id="remember_me" 
                  name="remember" 
                  type="checkbox"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="form-checkbox h-4 w-4 text-gray-600 transition duration-150 ease-in-out" 
                />
                <label 
                  htmlFor="remember_me" 
                  className="ml-2 block text-sm leading-5 text-gray-100"
                >
                  Remember me
                </label>
              </div>

            </div>

            <div className="mt-6">
              <span className="block w-full rounded-md shadow-sm">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-500 focus:outline-none focus:border-gray-700 focus:shadow-outline-gray active:bg-gray-700 transition duration-150 ease-in-out disabled:opacity-50"
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </button>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;