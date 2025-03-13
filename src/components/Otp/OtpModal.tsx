import { useState, useRef, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { register } from "../../services/api/auth/authApi";
import { AppDispatch } from "../../app/redux/store";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface EmailVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    userType: "user" | "company";
}

export default function EmailVerificationModal({ isOpen, onClose, user, userType }: EmailVerificationModalProps) {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
    const inputsRef = useRef<HTMLInputElement[]>([]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return; 

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < otp.length - 1) {
            inputsRef.current[index + 1]?.focus(); 
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputsRef.current[index - 1]?.focus(); 
        }
    };

    const handleSubmit = async () => {
        console.log("inside handle submit",user)
        const otpCode = otp.join("");
        if (otpCode.length !== 4) {
            toast.warn("Please enter a valid 4-digit OTP code.");
            return;
        }
        try {
            const response = await dispatch(register({ ...user, otp: otpCode, userType:userType}));

            console.log("response after otp verification",response);
            if (response.meta.requestStatus === "fulfilled") {
                toast.success("Account verified successfully!");
                if (response.payload) { 
                    if (userType === "user" && response.payload.response?.accessToken) {
                        console.log("from handle submit in otp modal",response.payload)
                        localStorage.setItem("token", response.payload.response.accessToken);
                        toast.success("Authanticated Successfully.");
                        navigate('/')
                    } else if (response.payload.response?.accessToken) {
                        localStorage.setItem("token", response.payload.response.accessToken);
                        toast.success("Authanticated Successfully.");
                        navigate('/company');
                    } else {
                        toast.warning("Token not found in response.");
                    }
                } else {
                    toast.warning("No response payload received.");
                }
                onClose();
            } else {
                toast.warning("Failed to verify account. Please try again.");
            }
        } catch (error) {
            console.error("Error verifying account:", error);
            toast.error("An error occurred. Please try again.");
        }
    };
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center">
            <div className="relative bg-gray-900 text-white p-6 rounded-2xl w-full max-w-md shadow-xl">
                <button className="absolute top-3 right-3 text-gray-400 hover:text-white" onClick={onClose}>
                    <X size={24} />
                </button>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-semibold">Email Verification</h2>
                    <p className="text-gray-400 text-sm">We have sent a code to your email {user.email}</p>
                </div>
                <div className="mt-6 flex justify-center gap-3">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            className="w-14 h-14 text-center text-xl rounded-lg bg-gray-800 border border-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            maxLength={1}
                            ref={(el) => {
                                if (el) inputsRef.current[index] = el;
                            }}
                        />
                    ))}
                </div>
                <button className="mt-6 w-full py-3 bg-blue-600 rounded-lg hover:bg-blue-700" onClick={handleSubmit}>
                    Verify Account
                </button>
                <div className="mt-4 text-center text-sm text-gray-400">
                    <p>
                        Didn't receive a code?{' '}
                        <button className="text-blue-400 hover:underline">Resend</button>
                    </p>
                </div>
            </div>
        </div>
    );
}