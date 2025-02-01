import { useCallback, useState } from "react";
import { Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../app/redux/store";
import { setFormData, usernameCheck } from "../../../app/redux/slices/authSlice";
import { AuthState } from "../../../app/redux/slices/authSlice";
import debounce from "lodash.debounce";
import LoadingScreen from "../../Loading/Loading";
import EmailVerificationModal from "../../Otp/OtpModal";

const RegisterForm = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isUsernameAvailable, loading } = useSelector((state: { auth: AuthState }) => state.auth);
 
  const [errors, setErrors] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [formData, setFormDataState] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  const dispatch = useDispatch<AppDispatch>();

  // Password strength indicators
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "" };
    const checks = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
    const strength = Object.values(checks).filter(Boolean).length;
    const labels = ["Weak", "Fair", "Good", "Strong", "Very Strong"];
    return { strength, label: labels[strength - 1] || "" };
  };

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "username":
        if (value.length < 3) return "Username must be at least 3 characters";
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Username can only contain letters, numbers, and underscores";
        return "";
      case "email":
        if (!/\S+@\S+\.\S+/.test(value)) return "Please enter a valid email address";
        return "";
      case "password":
        if (value.length < 8) return "Password must be at least 8 characters";
        return "";
      case "confirmPassword":
        if (value !== formData.password) return "Passwords do not match";
        return "";
      default:
        return "";
    }
  };

  const dbounceUsernameCheck = useCallback(
    debounce((username: string) => {
      if (username.length >= 3) {
        dispatch(usernameCheck(username));
      }
    }, 800),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormDataState((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));

    if (name !== "termsAccepted") {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }

    dispatch(setFormData({ stateType: "user", name: name as keyof AuthState['user'], value: newValue }));

    if (name === "username") {
      dbounceUsernameCheck(value);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const newErrors = {
      username: validateField("username", formData.username),
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
      confirmPassword: validateField("confirmPassword", formData.confirmPassword),
      name: formData.name.length < 2 ? "Name is required" : "",
    };
  
    setErrors(newErrors);
  
    if (Object.values(newErrors).some(error => error) || !formData.termsAccepted) {
      return;
    }
  
    setIsModalOpen(true);
    // try {
    //   const action = await dispatch(register(formData));
  
    //   if (register.fulfilled.match(action)) {
    //     setEmail(formData.email);
    //     setIsModalOpen(true);
    //   } else {
    //     // toast.error('Registered Successfully! Login Now.');
    //   }
    // } catch (error) {
      
    // }
  };
  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <>
      {loading ? <LoadingScreen /> : ''}
    <div className="min-h-screen  bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-3 md:p-6">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <div className="hidden md:flex w-full md:w-2/5 bg-gradient-to-br from-secondary to-secondary-dark p-8 md:p-12 flex-col items-center justify-center">
          <div className="mb-8">
            <img src="/images/logo.png" alt="logo" className="w-3/4 mx-auto" />
          </div>
          <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight text-center">
            Join our community
          </h2>
        </div>

        <div className="w-full md:w-3/5 p-8 md:p-12 bg-gray-900 text-white">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Create Account</h1>
          <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
            <div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.username ? 'border-red-500' : 'border-gray-700'
                  } bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition pr-10`}
                />
                <div className="absolute right-3 top-3">
                  {isUsernameAvailable.loading ? (
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  ) : isUsernameAvailable.status === true ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : isUsernameAvailable.status === false ? (
                    <X className="w-5 h-5 text-red-500" />
                  ) : null}
                </div>
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username}</p>
              )}
            </div>

            {/* Other form fields remain similar but with error handling */}
            <div>
              <input
                type="text"
                placeholder="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.name ? 'border-red-500' : 'border-gray-700'
                } bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.email ? 'border-red-500' : 'border-gray-700'
                } bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.password ? 'border-red-500' : 'border-gray-700'
                  } bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((index) => (
                      <div
                        key={index}
                        className={`h-1 flex-1 rounded-full ${
                          index <= passwordStrength.strength
                            ? [
                                'bg-red-500',
                                'bg-orange-500',
                                'bg-yellow-500',
                                'bg-green-500',
                                'bg-emerald-500',
                              ][passwordStrength.strength - 1]
                            : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-400">
                    Password strength: {passwordStrength.label}
                  </p>
                </div>
              )}
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-700'
                } bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-3 text-gray-400 hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className="w-4 h-4 mt-1 rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-400">
                I agree to the{" "}
                <a href="/terms" className="text-cyan-500 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-cyan-500 hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={!formData.termsAccepted || Object.values(errors).some(error => error)}
            >Create Account
            </button>

            <div className="relative flex items-center gap-4 my-8">
              <div className="flex-grow border-t border-gray-700" />
              <span className="text-gray-400 text-sm">Or continue with</span>
              <div className="flex-grow border-t border-gray-700" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 border rounded-lg border-gray-700 bg-gray-800 hover:bg-gray-700 transition-all duration-300 transform hover:scale-[1.02]">
                <img src="/images/google-icon.svg" alt="Google logo" className="w-5 h-5" />
                <span className="text-sm text-white">Google</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 border rounded-lg border-gray-700 bg-gray-800 hover:bg-gray-700 transition-all duration-300 transform hover:scale-[1.02]">
                <img src="/images/facebook-icon.svg" alt="Facebook logo" className="w-5 h-5" />
                <span className="text-sm text-white">Facebook</span>
              </button>
            </div>

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
     {/* Email Verification Modal */}
     <EmailVerificationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={formData} />
    </>
  );
};

export default RegisterForm;