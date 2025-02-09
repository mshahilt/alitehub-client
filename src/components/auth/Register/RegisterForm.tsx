import { useCallback, useState } from "react";
import { Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../app/redux/store";
import { setUserFormData, usernameCheck } from "../../../app/redux/slices/user/userAuthSlice";
import { UserAuthState } from "../../../app/redux/slices/user/userAuthSlice";
import { CompanyAuthState } from "../../../app/redux/slices/company/companyAuthSlice";
import { setCompanyFormData } from "../../../app/redux/slices/company/companyAuthSlice";
import { generateOtp } from "../../../services/api/auth/authApi";
import debounce from "lodash.debounce";
import LoadingScreen from "../../Loading/Loading";
import EmailVerificationModal from "../../Otp/OtpModal";
import { toast } from "react-toastify";

interface RegisterFormProps {
  formFor: "user" | "company";
}

const RegisterForm = ({ formFor }: RegisterFormProps) => {
  console.log("Registering as:", formFor);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const userAuthState = useSelector((state: { userAuth: UserAuthState }) => state.userAuth);
  const companyAuthState = useSelector((state: { companyAuth: CompanyAuthState }) => state.companyAuth);

  const loading = formFor === "user" ? userAuthState.loading : companyAuthState.loading;
  const isUsernameAvailable = userAuthState.isUsernameAvailable;

  const initialFormData =
    formFor === "company"
      ? {
          companyName: "",
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
    if (formFor === "company") {
      switch (name) {
        case "companyName":
          if (value.length < 3) return "Company name must be at least 3 characters";
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
    } else {
      switch (name) {
        case "username":
          if (value.length < 3) return "Username must be at least 3 characters";
          if (!/^[a-zA-Z0-9_]+$/.test(value))
            return "Username can only contain letters, numbers, and underscores";
          return "";
        case "name":
          if (value.length < 2) return "Name is required";
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
    }
  };

  const dbounceUsernameCheck = useCallback(
    debounce((username: string) => {
      if (username.length >= 3) {
        dispatch(usernameCheck(username));
      }
    }, 800),
    [dispatch]
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
      setErrors((prev) => ({ ...prev, [name]: error }));
    }

    if (formFor === "user") {
      dispatch(
        setUserFormData({
          stateType: "user",
          name: name as keyof UserAuthState["user"],
          value: newValue,
        })
      );
    } else {
      dispatch(
        setCompanyFormData({
          field: name as keyof CompanyAuthState["company"],
          value: newValue,
        })
      );
    }
    
    if (formFor === "user" && name === "username") {
      dbounceUsernameCheck(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let newErrors: Record<string, string> = {};
    if (formFor === "company") {
      console.log(formData)
      newErrors = {
        companyName: validateField("companyName", formData.companyName || ""),
        email: validateField("email", formData.email || ""),
        password: validateField("password", formData.password || ""),
        confirmPassword: validateField("confirmPassword", formData.confirmPassword || ""),
      };
    } else {
      newErrors = {
        username: validateField("username", formData.username || ""),
        name: validateField("name", formData.name || ""),
        email: validateField("email", formData.email || ""),
        password: validateField("password", formData.password || ""),
        confirmPassword: validateField("confirmPassword", formData.confirmPassword || ""),
      };
    }

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error) || !formData.termsAccepted) {
      return;
    }

    setIsModalOpen(true);
    dispatch(generateOtp(formData.email));
    toast.success("OTP sent successfully! Verify now.");
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <>
      {loading && <LoadingScreen />}
      <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-3 md:p-6">
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
            <h1 className="text-2xl md:text-3xl font-bold mb-6">
              {formFor === "company" ? "Create Company Account" : "Create Account"}
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              {formFor === "company" ? (
                <>
                  <div>
                    <input
                      type="text"
                      placeholder="Company Name"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.companyName ? "border-red-500" : "border-gray-700"
                      } bg-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition`}
                    />
                    {errors.companyName && (
                      <p className="mt-1 text-sm text-red-500">{errors.companyName}</p>
                    )}
                  </div>
                </>
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
      <EmailVerificationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={formData} userType={formFor} />
    </>
  );
};

export default RegisterForm;
