import React, { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useParams } from "react-router";
import { Button } from "@mui/material";
import { useNavigate } from "react-router";
import { addUser, getAllCountry, getAllUsers, getDepartment, getRole, getTitle } from "../../services/apis";
import { toast } from "react-toastify";

interface Option {
    value: string;
    label: string;
}

export const AddUser: React.FC = () => {
    const [formData, setFormData] = useState({
        sqlId: "",
        mongoId: "",
        role: null as Option | null,
        fullName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        country: null as Option | null,
        department: null as Option | null,
        reportTo: "",
        company: null as Option | null,
        salary: "",
        employeeType: "employee",
        timeType: "full-time",
        active: "yes",
    });
    const [errors, setErrors] = useState({
        role: "",
        fullName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        country: "",
        department: "",
        company: "",
        salary: "",
    });
    const [roleOptions, setRoleOptions] = useState<Option[]>([]);
    const [departmentOptions, setDepartmentOptions] = useState<Option[]>([]);
    const [companyOptions, setCompanyOptions] = useState<Option[]>([]);
    const [countryOptions, setCountryOptions] = useState<Option[]>([]);
    const [reportToOptions, setReportToOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        let valid = true;
        const newErrors = {
            role: "",
            fullName: "",
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            country: "",
            department: "",
            company: "",
            salary: "",
        };

        // Validate role
        if (!formData.role) {
            newErrors.role = "The role field is required.";
            valid = false;
        }

        // Validate full name
        if (!formData.fullName.trim()) {
            newErrors.fullName = "The name field is required.";
            valid = false;
        }

        // Validate username
        if (!formData.username.trim()) {
            newErrors.username = "The username field is required.";
            valid = false;
        } else if (!/^[a-zA-Z0-9-_]+$/.test(formData.username)) {
            newErrors.username = "Username can only contain letters, numbers, dashes, and underscores";
            valid = false;
        }
        // In your validateForm function
        if (!formData.email.trim()) {
            newErrors.email = "The email field is required.";
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
            valid = false;
        }

        // Validate email
        if (!formData.email.trim()) {
            newErrors.email = "The email field is required.";
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
            valid = false;
        }

        // Validate password
        if (!formData.password) {
            newErrors.password = "The password field is required.";
            valid = false;
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
            valid = false;
        }

        // Validate confirm password
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
            valid = false;
        }

        // Validate country
        if (!formData.country) {
            newErrors.country = "The in country field is required.";
            valid = false;
        }

        // Validate department
        if (!formData.department) {
            newErrors.department = "The departments field is required.";
            valid = false;
        }

        // Validate company
        if (!formData.company) {
            newErrors.company = "The companies field is required.";
            valid = false;
        }

        // Validate salary
        if (!formData.salary) {
            newErrors.salary = "The salary field must be a string.";
            valid = false;
        } else if (isNaN(Number(formData.salary)) || Number(formData.salary) < 0) {
            newErrors.salary = "Salary must be a positive number";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleChange = (name: string, value: any) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when field is changed
        if (errors[name as keyof typeof errors]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };
    const checkEmailExists = async (email: string) => {
        try {
            const response = await getAllUsers();
            const users = response.data.data;
            return users.some((user: any) => user.email === email);
        } catch (error) {
            console.error("Error checking email:", error);
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Check if email already exists
        const emailExists = await checkEmailExists(formData.email);
        if (emailExists) {
            toast.error("This email is already registered. Please use a different email.", {
                position: "top-right",
                autoClose: 5000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
            return;
        }

        const payload = {
            name: formData.fullName,
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: formData.role?.value,
            country: formData.country?.label,
            salary: parseFloat(formData.salary || "0"),
            on_job: true,
            on_fulltime: formData.timeType === "full-time",
            is_insider: true,
            Department_sqlid: Array.isArray(formData.department)
                ? formData.department.map((dept) => Number(dept.value))
                : [],
            company_sqlid: Array.isArray(formData.company)
                ? formData.company.map((comp) => Number(comp.value))
                : [],
            role_sqlid: Number(formData.role?.value),
        };

        try {
            const response = await addUser(payload);
            console.log("User added successfully:", response.data);

            toast.success("User added successfully!", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });

            navigate("/list");
        } catch (error) {
            console.error("Error adding user:", error);

            toast.error("Failed to add user.", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
        }
    };


    useEffect(() => {
        fetchUsers();
        fetchCountries();
        fetchDepartments();
        fetchRoles();
        fetchCompanies();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getAllUsers();
            const users = response.data.data.map((user: any) => ({
                value: user.id,
                label: user.name,
            }));
            setReportToOptions(users);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
        setLoading(false);
    };

    const fetchCountries = async () => {
        setLoading(true);
        try {
            const response = await getAllCountry();
            const countries = response.data.data.map((country: any) => ({
                value: country.sql_id,
                label: country.name,
            }));
            setCountryOptions(countries);
        } catch (error) {
            console.error("Error fetching countries:", error);
        }
        setLoading(false);
    };

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const response = await getDepartment();
            const departments = response.data.data.map((department: any) => ({
                value: department.id,
                label: department.name,
            }));
            setDepartmentOptions(departments);
        } catch (error) {
            console.error("Error fetching departments:", error);
        }
        setLoading(false);
    };

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const response = await getRole();
            const roles = response.data.data.map((role: any) => ({
                value: role.id,
                label: role.role,
            }));
            setRoleOptions(roles);
        } catch (error) {
            console.error("Error fetching roles:", error);
        }
        setLoading(false);
    };

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const response = await getTitle();
            const companies = response.data.data.map((company: any) => ({
                value: company.code_id,
                label: company.codeDetails.name,
            }));
            setCompanyOptions(companies);
        } catch (error) {
            console.error("Error fetching companies:", error);
        }
        setLoading(false);
    };

    let { id } = useParams();
    const backInfo = { title: "User", path: "/list" };
    const navigate = useNavigate();

    return (
        <>
            <div className=" mx-auto p-6   rounded">
                {loading && (
                    <div className="loader-overlay">
                        <div className="loader"></div>
                    </div>
                )}
                <div>
                    <PageBreadcrumb
                        pageTitle={id ? "" : "Add User"}
                        backInfo={backInfo}
                    />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-3">Details</h3>
                    <hr className="border-t border-gray-300 mb-2" />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="font-medium mb-2 block">
                                Role<span className="text-red-500">*</span>
                            </label>
                            <Select
                                options={roleOptions}
                                value={formData.role}
                                onChange={(selected) => handleChange("role", selected)}
                                className={errors.role ? "border-red-500" : ""}
                            />
                            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
                        </div>

                        <div>
                            <label className="font-medium mb-2 block">
                                Full Name<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={`w-full border p-2 rounded ${errors.fullName ? "border-red-500" : ""}`}
                                value={formData.fullName}
                                onChange={(e) => handleChange("fullName", e.target.value)}
                            />
                            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="font-medium mb-2 block">
                                Username<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={`w-full border p-2 rounded ${errors.username ? "border-red-500" : ""}`}
                                value={formData.username}
                                onChange={(e) => handleChange("username", e.target.value)}
                            />
                            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                        </div>

                        <div>
                            <label className="font-medium mb-2 block">
                                Email<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                className={`w-full border p-2 rounded ${errors.email ? "border-red-500" : ""}`}
                                value={formData.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>
                    </div>


                    <div className="grid grid-cols-2 gap-4">

                        <div>
                            <label className="font-medium mb-2 block">
                                Password<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                className={`w-full border p-2 rounded ${errors.password ? "border-red-500" : ""}`}
                                value={formData.password}
                                onChange={(e) => handleChange("password", e.target.value)}
                            />
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="font-medium mb-2 block">
                                Confirm Password<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                className={`w-full border p-2 rounded ${errors.confirmPassword ? "border-red-500" : ""}`}
                                value={formData.confirmPassword}
                                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                            />
                            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                        </div>
                    </div>


                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="font-medium mb-2 block">
                                In Country<span className="text-red-500">*</span>
                            </label>
                            <Select
                                options={countryOptions}
                                value={formData.country}
                                onChange={(selected) => handleChange("country", selected)}
                                className={errors.country ? "border-red-500" : ""}
                            />
                            {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                        </div>

                        <div>
                            <label className="font-medium mb-2 block">
                                Department<span className="text-red-500">*</span>
                            </label>
                            <Select
                                isMulti
                                options={departmentOptions}
                                value={formData.department}
                                onChange={(selected) => handleChange("department", selected)}
                                className={errors.department ? "border-red-500" : ""}
                            />
                            {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
                        </div>
                    </div>


                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="font-medium mb-2 block">Report To <span className="text-gray-500">(optional)</span></label>
                            <Select
                                options={reportToOptions}
                                value={reportToOptions.find((opt) => opt.value === formData.reportTo)}
                                onChange={(selected: SingleValue<Option>) =>
                                    handleChange("reportTo", selected ? selected.value : "")
                                }
                            />
                        </div>

                        <div>
                            <label className="font-medium mb-2 block">
                                Company Ownership<span className="text-red-500">*</span>
                            </label>
                            <Select
                                isMulti
                                options={companyOptions}
                                value={formData.company}
                                onChange={(selected) => handleChange("company", selected)}
                                className={errors.company ? "border-red-500" : ""}
                            />
                            {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="font-medium mb-2 block">Salary<span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            className={`w-full border p-2 rounded ${errors.salary ? "border-red-500" : ""}`}
                            value={formData.salary}
                            onChange={(e) => handleChange("salary", e.target.value)}
                            min="0"
                        />
                        {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary}</p>}
                    </div>

                    <div>
                        <label className="font-medium mb-2 block">Employee Type</label>
                        <div>
                            <label>
                                <input
                                    type="radio"
                                    name="employeeType"
                                    value="employee"
                                    checked={formData.employeeType === "employee"}
                                    onChange={() => handleChange("employeeType", "employee")}
                                />
                                <span className="ml-1">Employee</span>
                            </label>
                            <label className="ml-4">
                                <input
                                    type="radio"
                                    name="employeeType"
                                    value="contractor"
                                    checked={formData.employeeType === "contractor"}
                                    onChange={() => handleChange("employeeType", "contractor")}
                                />
                                <span className="ml-1">Contractor</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="font-medium mb-2 block">Time Type</label>
                        <div>
                            <label>
                                <input
                                    type="radio"
                                    name="timeType"
                                    value="full-time"
                                    checked={formData.timeType === "full-time"}
                                    onChange={() => handleChange("timeType", "full-time")}
                                />
                                <span className="ml-1">Full Time</span>
                            </label>
                            <label className="ml-4">
                                <input
                                    type="radio"
                                    name="timeType"
                                    value="part-time"
                                    checked={formData.timeType === "part-time"}
                                    onChange={() => handleChange("timeType", "part-time")}
                                />
                                <span className="ml-1">Part Time</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end mb-1 mt-2 gap-2">
                        <Button variant="outlined" className="bg-pink-300" onClick={() => navigate("/list")}>Cancel</Button>
                        <Button variant="contained" type="submit">
                            Add User
                        </Button>
                    </div>
                </form >
            </div >
        </>

    );
};