import { useCallback, useState } from "react";
import { Eye, EyeOff, Check, X, Loader2, ChevronDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../app/redux/store";
import { setUserFormData, usernameCheck } from "../../../app/redux/slices/user/userAuthSlice";
import { UserAuthState } from "../../../app/redux/slices/user/userAuthSlice";
import { CompanyAuthState } from "../../../app/redux/slices/company/companyAuthSlice";
import { setCompanyFormData } from "../../../app/redux/slices/company/companyAuthSlice";
import { generateOtp } from "../../../services/api/auth/authApi";
import debounce from "lodash.debounce";
import LoadingScreen from "../../Loading/Loading";
import { GoogleLogin } from '@react-oauth/google';
import { googleLogin } from '../../../services/api/auth/authApi';
import {jwtDecode} from "jwt-decode";
import EmailVerificationModal from "../../Otp/OtpModal";
import { toast } from "react-toastify";
interface RegisterFormProps {
  formFor: "user" | "company"
}

const RegisterForm = ({ formFor }: RegisterFormProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const userAuthState = useSelector((state: { userAuth: UserAuthState }) => state.userAuth);
  const companyAuthState = useSelector((state: { companyAuth: CompanyAuthState }) => state.companyAuth);

  const loading = formFor === "user" ? userAuthState.loading : companyAuthState.loading;
  const isUsernameAvailable = userAuthState.isUsernameAvailable;

  const initialFormData = formFor === "company"
    ? {
        companyName: "",
        companyIdentifier: "",
        companyType: "",
        industry: "",
        email: "",
        password: "",
        confirmPassword: "",
        termsAccepted: false,
      }
    : {
        username: "",
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        termsAccepted: false,
      };

  const [formData, setFormDataState] = useState(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dispatch = useDispatch<AppDispatch>();

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", details: [] };
    
    const checks = {
      length: { passed: password.length >= 8, message: "At least 8 characters" },
      upper: { passed: /[A-Z]/.test(password), message: "Uppercase letter" },
      lower: { passed: /[a-z]/.test(password), message: "Lowercase letter" },
      number: { passed: /[0-9]/.test(password), message: "Number" },
      special: { passed: /[^A-Za-z0-9]/.test(password), message: "Special character" },
    };
    
    const strength = Object.values(checks).filter(check => check.passed).length;
    const labels = ["Weak", "Fair", "Good", "Strong", "Very Strong"];
    const details = Object.values(checks).map(check => ({
      message: check.message,
      passed: check.passed,
    }));
    
    return { 
      strength, 
      label: labels[strength - 1] || "", 
      details 
    };
  };

  const validateField = (name: string, value: string) => {
    const commonValidations = {
      email: () => !/\S+@\S+\.\S+/.test(value) ? "Please enter a valid email address" : "",
      password: () => {
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter";
        if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter";
        if (!/[0-9]/.test(value)) return "Password must contain at least one number";
        if (!/[^A-Za-z0-9]/.test(value)) return "Password must contain at least one special character";
        return ""
      },
      confirmPassword: () => value !== formData.password ? "Passwords do not match" : "",
    };

    const companyValidations = {
      companyName: () => value.length < 3 ? "Company name must be at least 3 characters" : "",
      companyIdentifier: () => value.length < 2 ? "Company identifier is required" : "",
      companyType: () => !value ? "Please select a company type" : "",
      industry: () => !value ? "Industry is required" : "",
    };

    const userValidations = {
      username: () => {
        if (value.length < 3) return "Username must be at least 3 characters";
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Username can only contain letters, numbers, and underscores";
        return "";
      },
      name: () => value.length < 2 ? "Name is required" : "",
    };

    const validations = {
      ...commonValidations,
      ...(formFor === "company" ? companyValidations : userValidations),
    };

    return validations[name as keyof typeof validations]?.() || "";
  };

  const dbounceUsernameCheck = useCallback(
    debounce((username: string) => {
      if (username.length >= 3) {
        dispatch(usernameCheck(username));
      }
    }, 800),
    [dispatch]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    const newValue = type === "checkbox" ? checked : value;

    setFormDataState(prev => ({ ...prev, [name]: newValue }));

    if (name !== "termsAccepted") {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }

    if (formFor === "user") {
      dispatch(setUserFormData({
        stateType: "user",
        name: name as keyof UserAuthState["user"],
        value: newValue,
      }));
      
      if (name === "username") {
        dbounceUsernameCheck(value);
      }
    } else {
      dispatch(setCompanyFormData({
        field: name as keyof CompanyAuthState["company"],
        value: newValue,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fieldsToValidate = formFor === "company"
      ? ["companyName", "companyIdentifier", "companyType", "industry", "email", "password", "confirmPassword"]
      : ["username", "name", "email", "password", "confirmPassword"];

    const newErrors = fieldsToValidate.reduce((acc, field) => ({
      ...acc,
      [field]: validateField(field, formData[field as keyof typeof formData]?.toString() || "")
    }), {});

    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error) || !formData.termsAccepted) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    try {
      setIsModalOpen(true);
      await dispatch(generateOtp(formData.email));
      toast.success("OTP sent successfully! Please verify your email.");
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
    }
  };
  
  const passwordStrength = getPasswordStrength(formData.password);
   const handleGoogleSuccess = async (credentialResponse: any) => {
      try {
        const { credential } = credentialResponse;
        console.log("credential", credential);
        const decoded: any = jwtDecode(credential);
        console.log("Google User Info:", decoded);
    
        const response = await dispatch(googleLogin({ userType: formFor, token: credential }));
        if (googleLogin.fulfilled.match(response)) {
          console.log("from google",response)
          localStorage.setItem("token", response.payload.accessToken)
          toast.success("Google login successful!");
        } else {
          toast.error("Google login failed.");
        }
      } catch (error) {
        toast.error("Google authentication error.");
      }
    };
    const handleGoogleError = () => {
        toast.error("Google login failed. Please try again.");
      };
  return (
    <>
      {loading && <LoadingScreen />}
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
          <div className="hidden md:flex w-full md:w-2/5 bg-gradient-to-br from-secondary to-gray-800 p-12 flex-col items-center justify-center">
            <div className="mb-8">
              <img src="/images/logo.png" alt="logo" className="w-48 mx-auto" />
            </div>
            <h2 className="text-white text-4xl font-bold text-center mb-6">
              Welcome to Our Platform
            </h2>
            <p className="text-white/80 text-center text-lg">
              Join our community and discover amazing opportunities
            </p>
          </div>

          <div className="w-full md:w-3/5 p-8 md:p-12 bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-8">
              {formFor === "company" ? "Create Company Account" : "Create Personal Account"}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {formFor === "company" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                      placeholder="Enter company name"
                    />
                    {errors.companyName && (
                      <p className="mt-1 text-sm text-red-500">{errors.companyName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Company Identifier</label>
                    <input
                      type="text"
                      name="companyIdentifier"
                      value={formData.companyIdentifier}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                      placeholder="Enter company identifier"
                    />
                    {errors.companyIdentifier && (
                      <p className="mt-1 text-sm text-red-500">{errors.companyIdentifier}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Company Type</label>
                    <div className="relative">
                      <select
                        name="companyType"
                        value={formData.companyType}
                        onChange={handleChange}
                        onClick={() => setIsSelectOpen(!isSelectOpen)}
                        onBlur={() => setIsSelectOpen(false)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition appearance-none cursor-pointer pr-10"
                      >
                        <option value="">Select type</option>
                        <option value="Private Limited">Private Limited</option>
                        <option value="Startup">Startup</option>
                        <option value="Enterprise">Enterprise</option>
                      </select>
                      <ChevronDown 
                        className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform ${
                          isSelectOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    {errors.companyType && (
                      <p className="mt-1 text-sm text-red-500">{errors.companyType}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Industry</label>
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                      placeholder="Enter industry"
                    />
                    {errors.industry && (
                      <p className="mt-1 text-sm text-red-500">{errors.industry}</p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.username ? "border-red-500" : "border-gray-700"
                        } bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition pr-10`}
                      />
                      <div className="absolute right-3 top-3">
                        {isUsernameAvailable?.loading ? (
                          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        ) : isUsernameAvailable?.status === true ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : isUsernameAvailable?.status === false ? (
                          <X className="w-5 h-5 text-red-500" />
                        ) : null}
                      </div>
                    </div>
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.name ? "border-red-500" : "border-gray-700"
                      } bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>
                </>
              )}

              <div>
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.email ? "border-red-500" : "border-gray-700"
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
                      errors.password ? "border-red-500" : "border-gray-700"
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
                                  "bg-red-500",
                                  "bg-orange-500",
                                  "bg-yellow-500",
                                  "bg-green-500",
                                  "bg-emerald-500",
                                ][passwordStrength.strength - 1]
                              : "bg-gray-700"
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
                    errors.confirmPassword ? "border-red-500" : "border-gray-700"
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
                disabled={!formData.termsAccepted || Object.values(errors).some((error) => error)}
              >
                {formFor === "company" ? "Create Company Account" : "Create Account"}
              </button>

              <div className="relative flex items-center gap-4 my-8">
                <div className="flex-grow border-t border-gray-700" />
                <span className="text-gray-400 text-sm">Or continue with</span>
                <div className="flex-grow border-t border-gray-700" />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 border rounded-lg border-gray-700 bg-gray-800 hover:bg-gray-700 transition-all duration-300 transform hover:scale-[1.02]">
                  <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
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
      <EmailVerificationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={formData} userType={formFor} />
    </>
  )
}

export default RegisterForm;