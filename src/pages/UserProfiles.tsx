// import PageBreadcrumb from "../components/common/PageBreadCrumb";
// import UserMetaCard from "../components/UserProfile/UserMetaCard";
// import UserInfoCard from "../components/UserProfile/UserInfoCard";
// import UserAddressCard from "../components/UserProfile/UserAddressCard";
// import PageMeta from "../components/common/PageMeta";

// export default function UserProfiles() {
// const backInfo = {
//   title: "Home",
//   path: "/",
// }
//   return (
// <>
//   <PageMeta
//     title="React.js Profile Dashboard | TailAdmin - Next.js Admin Dashboard Template"
//     description="This is React.js Profile Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
//   />
//   <PageBreadcrumb pageTitle="Profile" backInfo={backInfo} />
//   <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
//     <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
//       Profile
//     </h3>
//     <div className="space-y-6">
//       <UserMetaCard />
//       <UserInfoCard />
//       <UserAddressCard />
//     </div>
//   </div>
// </>
//     <div>
//       User Profile
//     </div>
//   );
// }
// import React from "react";

import { Controller, useForm } from "react-hook-form";
import { Button } from "@mui/material";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import { useEffect, useState } from "react";
import { User } from "lucide-react";

type ProfileForm = {
  name: string;
  username: string;
  email: string;
  avatar: FileList | null;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function UserProfiles() {
  const [selectedFileName, setSelectedFileName] = useState("No file chosen");

  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    register: profileRegister,
    formState: { },
    watch: profileWatch,
  } = useForm<ProfileForm>({
    defaultValues: {
      name: "Sales No.1",
      username: "admin",
      email: "lgm@valve123.com",
      avatar: null,
    },
  });

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const avatarWatch = profileWatch("avatar");

  useEffect(() => {
    if (avatarWatch && avatarWatch.length > 0) {
      setSelectedFileName(avatarWatch[0].name);
    } else {
      setSelectedFileName("No file chosen");
    }
  }, [avatarWatch]);

  const onSubmitProfile = (data: ProfileForm) => {
    const file = data.avatar?.[0] || null;
    const payload = { ...data, avatar: file };
    console.log("Profile submitted:", payload);
  };

  const onSubmitPassword = (data: PasswordForm) => {
    console.log("Password changed:", data);
  };

  return (
    <div>
      <div className="bg-white p-4">
        <form onSubmit={handleProfileSubmit(onSubmitProfile)}>
          <div className="mb-6">
            <div className="mb-8">
              <Label>Avatar</Label>
              <div className="flex items-center gap-3 mb-4">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {avatarWatch?.length ? (
                      <img
                        src={URL.createObjectURL(avatarWatch[0])}
                        alt="User avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-gray-600" />
                    )}

                  </div>
                </label>
                <span className="text-gray-600">{selectedFileName}</span>
              </div>
              <input
                type="file"
                id="avatar-upload"
                accept=".jpg,.jpeg,.png"
                {...profileRegister("avatar")}
                className="hidden"
              />
            </div>

            <div className="mb-4">
              <Label>Name</Label>
              <Controller
                name="name"
                control={profileControl}
                render={({ field }) => <Input {...field} />}
              />
            </div>

            <div className="mb-4">
              <Label>Username</Label>
              <Controller
                name="username"
                control={profileControl}
                render={({ field }) => <Input {...field} />}
              />
            </div>

            <div className="mb-4">
              <Label>Email</Label>
              <Controller
                name="email"
                control={profileControl}
                render={({ field }) => <Input {...field} />}
              />
            </div>

            <div className="flex justify-start">
              <Button variant="contained" type="submit" color="primary">
                Save
              </Button>
            </div>
          </div>
        </form>

        <form onSubmit={handlePasswordSubmit(onSubmitPassword)}>
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Update Password</h2>
            <p className="text-gray-600 mb-4">
              Ensure your account is using a long, random password to stay secure.
            </p>

            <div className="mb-4">
              <Label>Current Password</Label>
              <Controller
                name="currentPassword"
                control={passwordControl}
                rules={{ required: "Current password is required" }}
                render={({ field }) => (
                  <>
                    <Input {...field} type="password" />
                    {passwordErrors.currentPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {passwordErrors.currentPassword.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="mb-4">
              <Label>New Password</Label>
              <Controller
                name="newPassword"
                control={passwordControl}
                rules={{ required: "New password is required" }}
                render={({ field }) => (
                  <>
                    <Input {...field} type="password" />
                    {passwordErrors.newPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {passwordErrors.newPassword.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="mb-4">
              <Label>Confirm Password</Label>
              <Controller
                name="confirmPassword"
                control={passwordControl}
                rules={{
                  required: "Please confirm your password",
                  validate: (value, formValues) =>
                    value === formValues.newPassword || "Passwords do not match",
                }}
                render={({ field }) => (
                  <>
                    <Input {...field} type="password" />
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {passwordErrors.confirmPassword.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="flex justify-start">
              <Button variant="contained" type="submit" color="primary">
                Update Password
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
