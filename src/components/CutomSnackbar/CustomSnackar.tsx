import React from "react";
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa"; // React Icons

interface CustomSnackbarProps {
  message: string;
  variant: "success" | "error" | "warning" | "info" | "default";
}

const CustomSnackbar: React.FC<CustomSnackbarProps> = ({ message, variant }) => {
  return (
    <div className="flex items-center p-4 rounded-xl bg-black bg-opacity-60 backdrop-blur-md text-white shadow-xl font-sans text-sm tracking-wide transition-all duration-300 ease-in-out">
      {variant === "success" && (
        <FaCheckCircle className="mr-3 text-green-400 text-lg" />
      )}
      {variant === "error" && (
        <FaExclamationTriangle className="mr-3 text-red-400 text-lg" />
      )}
      {variant === "info" && (
        <FaInfoCircle className="mr-3 text-blue-400 text-lg" />
      )}
      <span className="font-medium">{message}</span>
    </div>
  );
};

export default CustomSnackbar;