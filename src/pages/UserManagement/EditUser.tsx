import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import Select from "react-select";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useNavigate } from "react-router";
import {
    changePassword,
    changeUserName,
    getAllCountry,
    getAllUsers,
    getAllUsersById,
    getDepartment,
    getRole,
    getTitle,
    updateUser,
} from "../../services/apis";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

export const EditUser: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [isActive, setIsActive] = useState(true);
    const [roleOptions, setRoleOptions] = useState<
        { value: string; label: string; mongoid: string }[]
    >([]);
    const [countryOptions, setCountryOptions] = useState<{ value: string; label: string }[]>([]);
    const [departmentOptions, setDepartmentOptions] = useState<
        { value: string; label: string; mongoid: string }[]
    >([]);
    const [companyOptions, setCompanyOptions] = useState<
        { value: string; label: string; mongoid: string }[]
    >([]);
    const [reportToOptions, setReportToOptions] = useState<{ value: string; label: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<{ value: string; label: string; mongoid: string } | null>(null);
    const [country, setCountry] = useState<{ value: string; label: string } | null>(null);
    const [selectedDepartments, setSelectedDepartments] = useState<
        { value: string; label: string; mongoid: string }[]
    >([]);
    const [selectedCompanies, setSelectedCompanies] = useState<
        { value: string; label: string; mongoid: string }[]
    >([]);
    const [selectedReportTo, setSelectedReportTo] = useState<{ value: string; label: string } | null>(null);
    const [selectedReplaceBy, setSelectedReplaceBy] = useState<{ value: string; label: string } | null>(null);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [salary, setSalary] = useState("");
    const [employeeType, setEmployeeType] = useState("employee");
    const [timeType, setTimeType] = useState("full_time");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    const fetchReportToOptions = async () => {
        try {
            const response = await getAllUsers();
            const users = response.data.data.map((user: any) => ({
                value: user.id.toString(),
                label: user.name,
            }));
            setReportToOptions(users);
        } catch (error) {
            console.error("Error fetching report to options:", error);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await getRole();
            const roles = response.data.data.map((role: any) => ({
                value: role.id.toString(),
                label: role.role,
                mongoid: role._id
            }));
            setRoleOptions(roles);
        } catch (error) {
            console.error("Error fetching roles:", error);
        }
    };

    const fetchCountries = async () => {
        try {
            const response = await getAllCountry();
            const countries = response.data.data.map((country: any) => ({
                value: country.sql_id.toString(),
                label: country.name,
            }));
            setCountryOptions(countries);
        } catch (error) {
            console.error("Error fetching countries:", error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await getDepartment();
            const departments = response.data.data.map((department: any) => ({
                value: department.id.toString(),
                label: department.name,
                mongoid: department._id,
            }));
            setDepartmentOptions(departments);
        } catch (error) {
            console.error("Error fetching departments:", error);
        }
    };

    const fetchCompanies = async () => {
        try {
            const response = await getTitle();
            const companies = response.data.data.map((company: any) => ({
                value: company.code_id.toString(),
                label: company.codeDetails.name,
                mongoid: company._id,
            }));
            setCompanyOptions(companies);
        } catch (error) {
            console.error("Error fetching companies:", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchRoles(),
                    fetchCountries(),
                    fetchDepartments(),
                    fetchCompanies(),
                    fetchReportToOptions()
                ]);

                const response = await getAllUsersById(id!);
                const userData = response.data.data;

                setUser(userData);
                setIsActive(userData.is_insider);
                setFullName(userData.name || "");
                setEmail(userData.email || "");
                setUsername(userData.username || "");
                setSalary(userData.salary?.$numberDecimal || "");
                setEmployeeType(userData.on_job ? "employee" : "contractor");
                setTimeType(userData.on_fulltime ? "full_time" : "part_time");
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        if (user && roleOptions.length > 0) {
            const roleId = user.role_sqlid?.toString();
            const userRole = roleOptions.find(role => role.value === roleId);
            setRole(userRole || null);
        }
    }, [roleOptions, user]);

    useEffect(() => {
        if (user && countryOptions.length > 0) {
            const userCountry = countryOptions.find(country =>
                country.label === user.country
            );
            setCountry(userCountry || null);
        }
    }, [countryOptions, user]);

    useEffect(() => {
        if (user && departmentOptions.length > 0 && user.Department_sqlid) {
            const deptIds = Array.isArray(user.Department_sqlid)
                ? user.Department_sqlid
                : [user.Department_sqlid];

            const userDepts = departmentOptions.filter(dept => {
                return deptIds.some(id =>
                    dept.value.toString() === id.toString()
                );
            });
            setSelectedDepartments(userDepts);
        }
    }, [departmentOptions, user]);

    useEffect(() => {
        if (user && companyOptions.length > 0 && user.company_sqlid) {
            const companyIds = Array.isArray(user.company_sqlid)
                ? user.company_sqlid
                : [user.company_sqlid];

            const userCompanies = companyOptions.filter(company => {
                return companyIds.some(id =>
                    company.value.toString() === id.toString()
                );
            });
            setSelectedCompanies(userCompanies);
        }
    }, [companyOptions, user]);

    useEffect(() => {
        if (user && reportToOptions.length > 0 && user.replace_by) {
            const replaceByUser = reportToOptions.find(option =>
                option.value === user.replace_by.toString()
            );
            setSelectedReplaceBy(replaceByUser || null);
        }
    }, [reportToOptions, user]);

    useEffect(() => {
        if (user && reportToOptions.length > 0) {
            const reportToValue = user.reprot_to || user.report_to;
            if (reportToValue) {
                const userReportTo = reportToOptions.find(option =>
                    option.value === reportToValue.toString()
                );
                setSelectedReportTo(userReportTo || null);
            }
        }
    }, [reportToOptions, user]);

    const handleUpdateUser = async () => {
        setLoading(true);
        if (!user || !user.id) {
            console.error("User data or user ID is missing");
            setLoading(false);
            return;
        }

        const updatedData = {
            name: fullName || user.name || "",
            email: email || user.email || "",
            image: user.image || "",
            tel: user.tel || "",
            fax: user.fax || "",
            reprot_to: selectedReportTo ? parseInt(selectedReportTo.value) : (user.reprot_to || user.report_to || 0),
            replace_by: selectedReplaceBy ? parseInt(selectedReplaceBy.value) : user.replace_by || 0,
            country_id: country ? parseInt(country.value) : user.country_id || 0,
            country: country ? country.label : user.country || "",
            states: user.states || "",
            address: user.address || "",
            on_job: employeeType === "employee",
            on_fulltime: timeType === "full_time",
            is_insider: isActive,
            salary: parseFloat(salary || user.salary?.$numberDecimal || "0"),
            added_by: user.added_by || 0,
            remember_token: user.remember_token || "",
            role: role ? role.label : user.role || "",
            role_id: role ? role.mongoid : user.role_id || "",
            role_sqlid: role ? role.value : user.role_sqlid || "",
            Department_id: selectedDepartments.length > 0
                ? selectedDepartments.map((dep) => dep.mongoid)
                : user.Department_id || [],
            company_id: selectedCompanies.length > 0
                ? selectedCompanies.map((comp) => comp.mongoid)
                : user.company_id || [],
            Department_sqlid: selectedDepartments.length > 0
                ? selectedDepartments.map((dep) => dep.value.toString())
                : user.Department_sqlid || [],
            company_sqlid: selectedCompanies.length > 0
                ? selectedCompanies.map((comp) => comp.value.toString())
                : user.company_sqlid || [],
        };

        try {
            const response = await updateUser(user.id, updatedData);
            toast.success("User updated successfully!", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
            navigate("/list");
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error("Failed to update user.", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);
        if (value.length > 0 && value.length < 8) {
            setPasswordError("Password must be at least 8 characters");
        } else {
            setPasswordError("");
        }
    };

    const handlePasswordUpdate = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setLoading(true);
        event.preventDefault();

        if (!password || !confirmPassword) {
            toast.error("Please fill in both password fields", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
            setLoading(false);
            return;
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords don't match", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
            setLoading(false);
            return;
        }

        try {
            const payload = {
                password: password,
                sqlId: user.id,
            };
            const response = await changePassword(payload);
            setPassword("");
            setConfirmPassword("");
            toast.success("Password updated successfully!", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
        } catch (error) {
            console.error("Error updating password:", error);
            toast.error("Failed to update password", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUsername = async () => {
        setLoading(true);
        if (!username) {
            toast.error("Username cannot be empty", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
            setLoading(false);
            return;
        }

        try {
            const payload = {
                username: username.trim(),
                sqlId: user.id.toString(),
            };

            const response = await changeUserName(payload);

            if (response.data && response.data.success) {
                toast.success("Username updated successfully!", {
                    position: "top-right",
                    autoClose: 3000,
                    style: { zIndex: 9999999999, marginTop: "4rem" },
                });
            } else {
                throw new Error(response.data?.message || "Failed to update username");
            }
        } catch (error: any) {
            console.error("Error updating username:", error);
            toast.error(error.message || "Failed to update username", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
        } finally {
            setLoading(false);
        }
    };

    const backInfo = { title: "User", path: "/list" };

    return (
        <div className="p-6 min-h-screen">
            {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            <div>
                <PageBreadcrumb pageTitle="Edit User" backInfo={backInfo} />
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-4">Details</h3>
                    <hr className="border-t border-gray-300 mb-3" />

                    <label className="block mb-2">
                        Role<span className="text-red-500">*</span>
                    </label>
                    <Select
                        options={roleOptions}
                        value={role}
                        onChange={(newValue) => setRole(newValue)}
                        className="mb-3"
                    />

                    <label className="block mb-2">
                        Full Name<span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded mb-3"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />

                    <label className="block mb-2">
                        Email<span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        className="w-full p-2 border rounded mb-3"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <label className="block mb-2">
                        In Country<span className="text-red-500">*</span>
                    </label>
                    <Select
                        options={countryOptions}
                        value={country}
                        onChange={(newValue) => setCountry(newValue)}
                        className="mb-3"
                    />

                    <label className="block mb-2">
                        Department<span className="text-red-500">*</span>
                    </label>
                    <Select
                        isMulti
                        options={departmentOptions}
                        value={selectedDepartments}
                        onChange={(newValue) => {
                            setSelectedDepartments(newValue as any);
                        }}
                        className="mb-3"
                    />

                    <label className="block mb-2">
                        Report To<span className="text-gray-400">(optional)</span>
                    </label>
                    <Select
                        options={reportToOptions}
                        value={selectedReportTo}
                        onChange={(newValue) => setSelectedReportTo(newValue)}
                        className="mb-3"
                    />
                    <label className="block mb-2">
                        Replace By  <span className="text-gray-400">(optional)</span>
                    </label>
                    <Select
                        options={reportToOptions}
                        value={selectedReplaceBy}
                        onChange={(newValue) => setSelectedReplaceBy(newValue)}
                        className="mb-3"
                    />
                    <label className="block mb-2">
                        Company(Ownership)<span className="text-red-500">*</span>
                    </label>
                    <Select
                        isMulti
                        options={companyOptions}
                        value={selectedCompanies}
                        onChange={(newValue) => setSelectedCompanies(newValue as any)}
                        className="mb-3"
                    />

                    <label className="block mb-2">
                        Salary<span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        className="w-full p-2 border rounded mb-3"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                    />

                    <label className="block mb-2">Employee(W4)/Contractor(W9)</label>
                    <div className="mb-3">
                        <label className="mr-3">
                            <input
                                type="radio"
                                value="employee"
                                checked={employeeType === "employee"}
                                onChange={() => setEmployeeType("employee")}
                            />{" "}
                            Employee
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="contractor"
                                checked={employeeType === "contractor"}
                                onChange={() => setEmployeeType("contractor")}
                            />{" "}
                            Contractor
                        </label>
                    </div>

                    <label className="block mb-2">Time Type</label>
                    <div className="mb-3">
                        <label className="mr-3">
                            <input
                                type="radio"
                                value="full_time"
                                checked={timeType === "full_time"}
                                onChange={() => setTimeType("full_time")}
                            />{" "}
                            Full Time
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="part_time"
                                checked={timeType === "part_time"}
                                onChange={() => setTimeType("part_time")}
                            />{" "}
                            Part Time
                        </label>
                    </div>

                    <label className="block mb-2">Active</label>
                    <div className="mb-3">
                        <label className="mr-3">
                            <input
                                type="radio"
                                checked={isActive}
                                onChange={() => setIsActive(true)}
                            /> Active
                        </label>
                        <label>
                            <input
                                type="radio"
                                checked={!isActive}
                                onChange={() => setIsActive(false)}
                            /> Inactive
                        </label>
                    </div>

                    <button
                        onClick={handleUpdateUser}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Update
                    </button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-4">Change Username</h3>
                    <hr className="border-t border-gray-300 mb-3" />

                    <label className="block mb-2">
                        Username<span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2 border rounded mb-3"
                    />

                    <button
                        onClick={handleUpdateUsername}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 my-2"
                    >
                        Update Username
                    </button>
                    <h3 className="text-xl font-semibold mb-4">Change Password</h3>
                    <hr className="border-t border-gray-300 mb-3" />

                    <div className="flex flex-col items-center mb-4">
                        <label className="block mb-2 w-full max-w-md">
                            Password<span className="text-red-500">*</span>
                        </label>
                        <div className="relative w-full max-w-md">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={handlePasswordChange}
                                className="w-full p-2 border rounded pr-10"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {passwordError && (
                            <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                        )}
                    </div>

                    <div className="flex flex-col items-center mb-4">
                        <label className="block mb-2 w-full max-w-md">
                            Confirm Password<span className="text-red-500">*</span>
                        </label>
                        <div className="relative w-full max-w-md">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-2 border rounded pr-10"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={handlePasswordUpdate}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Update Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};