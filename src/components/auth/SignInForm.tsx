import { useEffect, useState } from "react";
// import { Link } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
// import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { Link, useNavigate } from "react-router";
import { loginUser } from "../../services/apis";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
 
type FormValues = {
  loginId: string; // This can be either email or username
  password: string;
};
 
export default function SignInForm() {
  let navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
 
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    defaultValues: loginInfo,
  });
 
  const onSubmit = async (data: FormValues) => {
    const { loginId, password } = data;
    setLoading(true);
    setError("");
 
    try {
      // Check for admin login first
      if (
        (loginId.toLowerCase() === "admin@ibyoutlet.com" ||
          loginId.toLowerCase() === "admin") &&
        password === "Admin@12345"
      ) {
        localStorage.setItem("token", "token");
        localStorage.setItem("userName", "Admin");
         toast.success("Logged successfully!");
        navigate("/");
        return;
      }
 
      // Regular user login - try with both email and username
      const response = await loginUser({
        email: loginId, // First try as email
        username: loginId, // Also try as username
        password
      });
 
      const token = response.data?.data?.token;
      const userId = response.data?.data?.user.id;
      const Sql_id = response.data?.data?.user.sql_id;
      const userName = response.data?.data?.user.name;
 
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("userId", userId);
        localStorage.setItem("Sql_id", Sql_id);
        localStorage.setItem("userName", userName || "User");
        localStorage.setItem("email", response.data?.data.user.email || "User");
        localStorage.setItem("name", response.data?.data.user.name || "User");
        localStorage.setItem("role", response.data?.data.user.role);
       
 
        toast.success("Login successful!", {
                        position: "top-right",
                        autoClose: 3000,
                        style: { zIndex: 9999999999, marginTop: "4rem" },
                    });
 
        navigate("/");
      } else {
        setError("Invalid response from server.");
      }
 
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("savedLoginId", loginId);
        localStorage.setItem("savedPassword", password);
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("savedLoginId");
        localStorage.removeItem("savedPassword");
      }
    } catch (err: any) {
      console.error("Login API error", err);
      setError("Login failed. Please check your credentials and try again.");
      toast.error("Login failed. Please check your credentials.",{
                        position: "top-right",
                        autoClose: 3000,
                        style: { zIndex: 9999999999, marginTop: "4rem" },
                    });
    } finally {
      setLoading(false);
    }
  };
 
  function login(username: any) {
    localStorage.setItem("userName", username);
 
    const check = localStorage.getItem("userName");
    if (check === username) {
      console.log("✔ Username saved correctly:", check);
    } else {
      console.error("❌ Failed to save username!");
    }
  }
  useEffect(() => {
    console.log(
      "Current localStorage userName:",
      localStorage.getItem("userName")
    );
  }, [loginInfo]);
 
  login("User");
 
  useEffect(() => {
    setValue("email", loginInfo.email);
    setValue("password", loginInfo.password);
  }, [loginInfo, setValue]);
 
  useEffect(() => {
    const remembered = localStorage.getItem("rememberMe") === "true";
    if (remembered) {
      setRememberMe(true);
      setLoginInfo({
        loginId: localStorage.getItem("savedLoginId") || "",
        password: localStorage.getItem("savedPassword") || "",
      });
    }
  }, []);
 
 
 
  // const [isChecked, setIsChecked] = useState(false);
  return (
    <div className="flex flex-col flex-1">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      {/* <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div> */}
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          {/* <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div> */}
          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
              {/* <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z"
                    fill="#EB4335"
                  />
                </svg>
                Sign in with Google
              </button> */}
              {/* <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
                <svg
                  width="21"
                  className="fill-current"
                  height="20"
                  viewBox="0 0 21 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M15.6705 1.875H18.4272L12.4047 8.75833L19.4897 18.125H13.9422L9.59717 12.4442L4.62554 18.125H1.86721L8.30887 10.7625L1.51221 1.875H7.20054L11.128 7.0675L15.6705 1.875ZM14.703 16.475H16.2305L6.37054 3.43833H4.73137L14.703 16.475Z" />
                </svg>
                Sign in with X
              </button> */}
            </div>
            <div className="relative py-3 sm:py-5">
              {/* <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                  Or
                </span>
              </div> */}
              <div className="flex justify-center">
                {localStorage.getItem("theme") === "light" ? (
                  <>
                    <Label className="text-3xl">Sign In</Label>
                  </>
                ) : (
                  <>
                    <Label className="text-3xl">Sign In</Label>
                  </>
                )}
              </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email  <span className="text-error-500">*</span>
                  </Label>
                  <Controller
                    name="loginId"
                    control={control}
                    rules={{
                      required: "Email or username is required",
                    }}
                    render={({ field }) => (
                      <Input
                        placeholder="Email or username"
                        onChange={field.onChange}
                        value={field.value}
                        className={errors.loginId ? "border-red-500" : ""}
                      />
                    )}
                  />
                  {errors.loginId && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.loginId.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Controller
                      name="password"
                      control={control}
                      rules={{
                        required: "The password field is required.",
                        // minLength: {
                        //   value: 6,
                        //   message: "Password must be at least 6 characters",
                        // },
                      }}
                      render={({ field }) => (
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          onChange={field.onChange}
                          value={field.value}
                          className={errors.password ? "border-red-500" : ""}
                        />
                      )}
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.password.message}
                      </p>
                    )}
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                    {error === "passwordErr" && (
                      <>
                        <Label className="text-red-500">
                          Please Enter Correct Password
                        </Label>
                      </>
                    )}
                  </div>
                </div>
                {/* <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div> */}
 
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      id="rememberMe"
                      name="rememberMe"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
 
                    <label
                      htmlFor="rememberMe"
                      className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400"
                    >
                      Remember me
                    </label>
                  </div>
                  <Link
                    to="/forgotpassword"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                     forgot password
                  </Link>
                </div>
 
                <div>
                  <Button className="w-full" type="submit" size="sm">
                    Sign in
                  </Button>
                </div>
              </div>
            </form>
 
            {/* <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account? {""}
                <Link
                  to="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
 
 