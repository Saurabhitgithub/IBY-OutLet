import { useState } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { Link } from "react-router";
import { forgotPassword } from "../../services/apis";

export default function ForgetPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Invalid email format.");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email); // Calls backend to send reset email
      setSuccess("Password reset email has been sent. Please check your inbox.");
      setEmail("");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send password reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="relative py-3 sm:py-5">
          <div className="flex justify-center">
            <Label className="text-3xl">Forget Password</Label>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <Label>
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              {error && <Label className="text-red-500 mt-2">{error}</Label>}
              {success && <Label className="text-green-500 mt-2">{success}</Label>}
            </div>
            <div className="flex justify-between">
              <Link
                to="/login"
                className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                SignIn
              </Link>
              <Button
                className="w-full max-w-[150px] h-10"
                type="submit"
                size="sm"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send E-Mail"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
