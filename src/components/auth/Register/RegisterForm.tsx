import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Panel */}
        <div className="hidden md:flex w-full md:w-2/5 bg-secondary p-8 md:p-12 flex-col items-center justify-center">
          <div className="mb-8">
            <img src="/images/logo.png" alt="logo" className="w-3/4 mx-auto" />
          </div>
          <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight text-center">
            It all starts from here
          </h2>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-3/5 p-8 md:p-12 bg-gray-900 text-white">

          <h1 className="text-2xl md:text-3xl font-bold mb-6">Create Account</h1>

          <form className="space-y-4 md:space-y-6">
            <div>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-3 text-gray-400"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="flex items-start md:items-center">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 mt-1 md:mt-0 rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-400">
                I have read and agreed to the Terms of Service and Privacy Policy
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-500 text-white py-3 rounded-lg hover:bg-cyan-600 transition"
            >
              Create Account
            </button>

            <div className="text-center">
              <span className="text-gray-400">Or</span>
            </div>

            {/* Social Login Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 border rounded-md border-gray-700 bg-gray-800 hover:bg-gray-700 transition">
                <img src="/images/google-icon.svg" alt="Google logo" className="w-5 h-5" />
                <span className="text-sm text-white">Sign up with Google</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 border rounded-md border-gray-700 bg-gray-800 hover:bg-gray-700 transition">
                <img src="/images/facebook-icon.svg" alt="Facebook logo" className="w-6 h-6" />
                <span className="text-sm text-white">Sign up with Facebook</span>
              </button>
            </div>

            {/* Already have an account */}
            <div className="text-center text-sm">
              Already have an account?{" "}
              <a href="/login" className="text-cyan-500 hover:underline">
                Log In
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


export default RegisterForm;