import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { DragAndDropInput } from "../../components/form/form-elements/DragAndDrop";
import { addTitle, awsUploadFile, getAllCompanies, getAllUsers } from "../../services/apis";
import { toast } from "react-toastify";

export const AddTitle: React.FC = () => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm();


    // const [, setFormData] = useState({
    //     code_id: "",
    //     bank: "",
    //     acc_man: "",
    //     address: "",
    //     phone: "",
    //     fax: "",
    //     homepage: "",
    //     make_check: "",
    //     fileData: [] as any[],
    // });
    const [accountManagers, setAccountManagers] = useState<{ id: string, name: string }[]>([]);
    const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getAllUsers();
                const users = response.data?.data || [];
                setAccountManagers(users);
            } catch (error) {
                console.error("Failed to fetch account managers:", error);
            }
        };

        const fetchCompanies = async () => {
            try {
                const response = await getAllCompanies();
                const companyList = response.data?.data || [];
                setCompanies(companyList);
            } catch (error) {
                console.error("Failed to fetch companies:", error);
            }
        };

        fetchUsers();
        fetchCompanies();
    }, []);


    const handleFileUpload = async (fileData: FileList | null) => {
        if (!fileData || fileData.length === 0) return [];

        const formData = new FormData();
        for (let i = 0; i < fileData.length; i++) {
            formData.append("upload", fileData[i]);
        }

        try {
            const response = await awsUploadFile(formData);
            const uploadedFiles = response.data.data || [];

            setValue("fileData", uploadedFiles);
            if (uploadedFiles.length > 0) {
                setValue("logo", uploadedFiles[0].fileName);
            }

            return uploadedFiles;
        } catch (error: any) {
            console.error("Error uploading files:", error.response?.data || error.message || error);
            return [];
        }
    };



    const onSubmit = async (data: any) => {
        const payload = {
            ...data,
            homepage: data.homepage || "",
            fileData: data.fileData || [],
            logo: data.logo || (data.fileData?.[0]?.fileName || ""),
        };

        try {
            const response = await addTitle(payload);
            console.log("API response:", response);

            toast.success("Company added successfully!", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });

            navigate("/title");
        } catch (error: any) {
            if (error.response) {
                console.error("API Error Response:", error.response.data);
            } else if (error.request) {
                console.error("No response received from API:", error.request);
            } else {
                console.error("Request setup error:", error.message);
            }

            toast.error("Failed to add company. Please try again.", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
        }
    };


    return (
        <div className="container mx-auto px-6 rounded">
            {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            <h1 className="text-2xl font-bold mb-4">Add Company</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow w-full">
                <h3 className="text-xl font-semibold mb-4">Details</h3>
                <hr className="border-t border-gray-300 mb-4" />

                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="font-medium mb-2 text-gray-500">Upload File<span className="text-red-500">*</span></label>
                        <div className="my-3">
                            <Controller
                                name="fileData"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <DragAndDropInput
                                        value={value ? value : []}
                                        onChange={async (newFiles: FileList | null) => {
                                            await handleFileUpload(newFiles);
                                            onChange(newFiles);
                                        }}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>

                <label className="block mb-2">
                    Account Manager<span className="text-red-500">*</span>
                </label>
                <select
                    className={`w-full p-2 border rounded mb-4 ${errors.acc_man ? "border-red-500" : "border-gray-300"}`}
                    {...register("acc_man", { required: "Account Manager is required" })}
                >
                    <option value="">Select Account Manager</option>
                    {accountManagers.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.name}
                        </option>
                    ))}
                </select>
                {errors.acc_man && <p className="text-red-500 text-sm">{String(errors.acc_man.message)}</p>}


                <label className="block mb-2">
                    Address<span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    className={`w-full p-2 border rounded mb-4 ${errors.address ? "border-red-500" : "border-gray-300"
                        }`}
                    {...register("address", { required: "Address is required" })}
                />
                {errors.address && <p className="text-red-500 text-sm">{String(errors.address.message)}</p>}


                <label className="block mb-2">
                    Companies<span className="text-red-500">*</span>
                </label>
                <select
                    className={`w-full p-2 border rounded mb-4 ${errors.code_id ? "border-red-500" : "border-gray-300"}`}
                    {...register("code_id", { required: "Company selection is required" })}
                >
                    <option value="">Select a Company</option>
                    {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                            {company.name}
                        </option>
                    ))}
                </select>
                {errors.code_id && <p className="text-red-500 text-sm">{String(errors.code_id.message)}</p>}


                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block mb-2">
                            Phone<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            className={`w-full p-2 border rounded ${errors.phone ? "border-red-500" : "border-gray-300"
                                }`}
                            {...register("phone", { required: "Phone is required" })}
                        />
                        {errors.phone && <p className="text-red-500 text-sm">{String(errors.phone.message)}</p>}
                    </div>
                    <div>
                        <label className="block mb-2">
                            Fax<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            className={`w-full p-2 border rounded ${errors.fax ? "border-red-500" : "border-gray-300"
                                }`}
                            {...register("fax", { required: "Fax is required" })}
                        />
                        {errors.fax && <p className="text-red-500 text-sm">{String(errors.fax.message)}</p>}
                    </div>
                </div>

                <label className="block mb-2">
                    Homepage<span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    className={`w-full p-2 border rounded mb-4 ${errors.homepage ? "border-red-500" : "border-gray-300"
                        }`}
                    {...register("homepage", { required: "Homepage is required" })}
                />
                {errors.homepage && (
                    <p className="text-red-500 text-sm">{String(errors.homepage.message)}</p>
                )}

                <label className="block mb-2">
                    Bank Info<span className="text-red-500">*</span>
                </label>
                <textarea
                    className={`w-full p-2 border rounded mb-4 ${errors.bank ? "border-red-500" : "border-gray-300"
                        }`}
                    rows={2}
                    {...register("bank", { required: "Bank Info is required" })}
                />
                {errors.bank && <p className="text-red-500 text-sm">{String(errors.bank.message)}</p>}

                <label className="block mb-2">
                    Make Check<span className="text-red-500">*</span>
                </label>
                <textarea
                    className={`w-full p-2 border rounded mb-6 ${errors.make_check ? "border-red-500" : "border-gray-300"
                        }`}
                    rows={2}
                    {...register("make_check", { required: "Make Check is required" })}
                />
                {errors.make_check && (
                    <p className="text-red-500 text-sm">{String(errors.make_check.message)}</p>
                )}

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};