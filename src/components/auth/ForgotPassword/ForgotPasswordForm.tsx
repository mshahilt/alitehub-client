import React, { useState } from 'react';
import axiosInstance from "../../../services/api/userInstance";
import { toast } from "react-toastify";
import LoadingScreen from '../../Loading/Loading';

interface ForgotPasswordProps {
    formFor: "user" | "company";
}

const ForgotPasswordForm: React.FC<ForgotPasswordProps> = ({ formFor }) => {
    // States for email form
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [userData, setUserData] = useState<any>(null);

    // States for OTP modal
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");

    // States for password reset modal
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setEmailError("Email is required");
            return false;
        }
        if (!emailRegex.test(email)) {
            setEmailError("Please enter a valid email address");
            return false;
        }
        setEmailError("");
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateEmail(email)) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await axiosInstance.post('/auth/forgot-password', {
                email,
                userType: formFor
            });
            
            if (response.data.response) {
                setUserData(response.data.response.user);
                setShowOtpModal(true);
                toast.success("OTP sent to your email!");
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Something went wrong";
            toast.error(errorMessage);
            if (error.response?.status === 404) {
                setEmailError("No account found with this email address");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp) {
            setOtpError("Please enter OTP");
            return;
        }

        setShowOtpModal(false);
        setShowPasswordModal(true);
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters long");
            return;
        }
        
        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axiosInstance.post('/auth/reset-password', {
                email,
                otp,
                newPassword,
                confirmPassword
            });

            if (response.data.success) {
                toast.success(response.data.message);
                setShowPasswordModal(false);
                window.location.href = '/login';
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Something went wrong";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <div>
            {/* Main Email Form */}
            <main id="content" role="main" className="w-full max-w-md mx-auto p-6">
                <div className="mt-7 bg-secondary rounded-xl shadow-lg border-2 border-indigo-300">
                    <div className="p-4 sm:p-7">
                        <div className="text-center">
                            <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">
                                Forgot password?
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Remember your password?
                                <a 
                                    className="text-blue-600 decoration-2 hover:underline font-medium ml-1" 
                                    href="/login"
                                >
                                    Login here
                                </a>
                            </p>
                        </div>

                        <div className="mt-5">
                            <form onSubmit={handleSubmit}>
                                <div className="grid gap-y-4">
                                    <div>
                                        <label 
                                            htmlFor="email" 
                                            className="block text-sm font-bold ml-1 mb-2 dark:text-white"
                                        >
                                            Email address
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className={`py-3 px-4 block w-full border-2 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm ${
                                                    emailError ? 'border-red-500' : 'border-gray-200'
                                                }`}
                                                required
                                                aria-describedby="email-error"
                                            />
                                        </div>
                                        {emailError && (
                                            <p className="text-xs text-red-600 mt-2" id="email-error">
                                                {emailError}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        className="py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-primary text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Sending...' : 'Reset password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            {/* OTP Modal */}
            {showOtpModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">Enter OTP</h2>
                        <form onSubmit={handleOtpSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">
                                    Enter the OTP sent to your email
                                </label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder="Enter OTP"
                                />
                                {otpError && (
                                    <p className="text-red-500 text-sm mt-1">{otpError}</p>
                                )}
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowOtpModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-600"
                                >
                                    Verify OTP
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Password Reset Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">Set New Password</h2>
                        <form onSubmit={handlePasswordReset}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder="Confirm new password"
                                />
                                {passwordError && (
                                    <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                                )}
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-600"
                                >
                                    Reset Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForgotPasswordForm;