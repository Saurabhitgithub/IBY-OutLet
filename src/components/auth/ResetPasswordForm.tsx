import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "lucide-react";
import { changePassword } from "../../services/apis";
import { useParams } from "react-router";
 
export default function ResetPasswordForm() {
  const { id } = useParams();
  console.log("ID from params:", id); 
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [errors, setErrors] = useState();
  const validatePassword = (value: string) => {
    // At least 8 characters, one uppercase, one digit, one special character
    const regex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!regex.test(value)) {
      return "Password must be at least 8 characters,  an uppercase letter, a digit, and a special character";
    }
    return "";
  };
 
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    const error = validatePassword(value);
    setPasswordError(error);
    // Also check confirm password match if already typed
    if (confirmPassword && value !== confirmPassword) {
      setPasswordError("Passwords don't match");
    }
  };
 
  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (password && value !== password) {
      setErrors({ confirmPassword: { message: "Passwords don't match" } });
      setPasswordError("");
    } else {
      setPasswordError(validatePassword(password));
    }
  };
 
  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
 
    // Validation checks
    if (!password || !confirmPassword) {
      toast.error("Please fill in both password fields", {
        position: "top-right",
        autoClose: 3000,
      });
      setLoading(false);
      return;
    }
 
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      toast.error(passwordValidationError, {
        position: "top-right",
        autoClose: 3000,
      });
      setPasswordError(passwordValidationError);
      setLoading(false);
      return;
    }
 
    if (password !== confirmPassword) {
      toast.error("Passwords don't match", {
        position: "top-right",
        autoClose: 3000,
      });
      setLoading(false);
      return;
    }
 
    try {
      const Payload = {
        password: password,
        sqlId:id, // Use id from params if available
      };
      await changePassword(Payload);
 
      toast.success("Password updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error(
        error?.message ||
          error?.response?.data?.message ||
          "Failed to update password",
        { position: "top-right", autoClose: 3000 }
      );
    } finally {
      setLoading(false);
    }
  };
 
  return (
<div className="flex flex-col flex-1 items-center justify-center">
<form
        onSubmit={handlePasswordUpdate}
        className="bg-white p-8 rounded w-full max-w-md"
>
<div className="flex justify-center">
<h2 className="text-3xl mb-5">Reset Password</h2>
</div>
 
        <label className="block mb-2 font-medium">
          New Password <span className="text-red-500">*</span>
</label>
<div className="relative mb-6">
<input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={handlePasswordChange}
            className="w-full p-2 border rounded pr-10"
            placeholder="Enter new password"
            required
            minLength={8}
          />
<button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
</button>
</div>
        {passwordError && (
<p className="text-red-500 text-xs mb-4">{passwordError}</p>
        )}
 
        <label className="block mb-2 font-medium">
          Confirm Password <span className="text-red-500">*</span>
</label>
<div className="relative mb-6">
<input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            className="w-full p-2 border rounded pr-10"
            placeholder="Confirm new password"
            minLength={8}
            required
          />
 
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            tabIndex={-1}
>
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
</button>
</div>
 
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
>
          {loading ? "Updating..." : "Reset Password"}
</button>
</form>
</div>
  );
}