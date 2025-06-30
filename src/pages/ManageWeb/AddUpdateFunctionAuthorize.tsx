import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useNavigate, useParams } from "react-router";
import Select from "react-select";
import {
    addFunctionAuthorization,
    editFunctionAuthorization,
    getAllUsers,
    getFunctionAuthorizationById,
} from "../../services/apis";
import { toast } from "react-toastify";

interface Option {
    value: string;
    label: string;
}

interface BeforeToOption {
    value: string;
    label: string;
    checked: boolean;
}

export const AddUpdateFunctionAuthorize: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [openToOptions, setOpenToOptions] = useState<Option[]>([]);
    const [beforeToOptions, setBeforeToOptions] = useState<BeforeToOption[]>([
        // { value: "OE", label: "comic.com", checked: false },
        // { value: "PU", label: "oenticparts.com", checked: false },
        // { value: "LD", label: "payless2.com", checked: false },
        // { value: "VD", label: "usherdepart.com", checked: false },
        // { value: "NG", label: "ngapio.com", checked: false },
        // { value: "WD", label: "webheaddepart.com", checked: false },
        // { value: "PE", label: "pcconsultibal.com", checked: false },
        // { value: "CN", label: "valvet32.com", checked: false },
         { value: "OE", label: "oemic.com", checked: false },
  { value: "PU", label: "oemicparts.com", checked: false },
  { value: "LD", label: "ipayless2.com", checked: false },
  { value: "VD", label: "valvedepot.com", checked: false },
  { value: "NG", label: "ngquip.com", checked: false },
  { value: "WD", label: "wellheaddepot.com", checked: false },
  { value: "PE", label: "pecosoilfield.com", checked: false },
  { value: "CN", label: "valve123.com", checked: false },
    ]);
    const [formData, setFormData] = useState({
        id: null,
        functionName: "",
        functionCode: "",
        authUser: [] as string[],
    });
    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState({
        functionName: false,
        functionCode: false,
        authUser: false,
    });

    useEffect(() => {
        if (id) {
            fetchFunctionAuthorizationData(id);
        }
    }, [id]);

    const fetchFunctionAuthorizationData = async (functionId: string) => {
        setLoading(true);
        try {
            const res = await getFunctionAuthorizationById(functionId);
            const data = res.data?.data;
            if (!data) return;
            const authUserArray = data.auth_user?.length > 0 ? data.auth_user.split(",") : [];
            const selectedValues = data.web?.split(",") || [];
            setFormData({
                id: data.id,
                functionName: data.name || "",
                functionCode: data.func || "",
                authUser: authUserArray,
            });
            setBeforeToOptions((prev) =>
                prev.map((option) => ({
                    ...option,
                    checked: selectedValues.includes(option.value),
                }))
            );
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOpenTo();
    }, []);
    const fetchOpenTo = async () => {
        setLoading(true);
        try {
            const res = await getAllUsers();
            if (res?.data?.data) {
                const options = res.data.data.map((user: any) => ({
                    value: String(user.id),
                    label: user.name,
                }));
                setOpenToOptions(options);
            }
        } catch (error) {
            console.error("Failed to fetch open to options", error);
        }
        finally {
            setLoading(false);
        }
    };

    const handleChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: false }));
    };

    const handleCheckboxChange = (value: string) => {
        setBeforeToOptions((prevOptions) =>
            prevOptions.map((option) =>
                option.value === value
                    ? { ...option, checked: !option.checked }
                    : option
            )
        );
    };


    const handleSubmit = async (e: React.FormEvent) => {
        setLoading(true);
        e.preventDefault();

        const newErrors = {
            functionName: formData.functionName.trim() === "",
            functionCode: formData.functionCode.trim() === "",
            authUser: formData.authUser.length === 0,
        };
        setErrors(newErrors);

        if (Object.values(newErrors).some((err) => err)) {
            setLoading(false);
            return;
        }

        const selectedBeforeTo = beforeToOptions
            .filter((option) => option.checked)
            .map((option) => option.value)
            .join(",");

        const payload = {
            name: formData.functionName,
            func: formData.functionCode,
            auth_user: formData.authUser.join(","),
            web: selectedBeforeTo,
        };

        try {
            if (id) {
                await editFunctionAuthorization(formData.id, payload);
                toast.success("Function authorization updated successfully!", {
                    position: "top-right",
                    autoClose: 3000,
                    style: { zIndex: 9999999999, marginTop: "4rem" },
                });
            } else {
                await addFunctionAuthorization(payload);
                toast.success("Function authorization added successfully!", {
                    position: "top-right",
                    autoClose: 3000,
                    style: { zIndex: 9999999999, marginTop: "4rem" },
                });
            }

            navigate("/functionAuthorization");
        } catch (error) {
            console.error("Error saving code:", error);
            toast.error("Failed to save function authorization.", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
        } finally {
            setLoading(false);
        }
    };


    const backInfo = {
        title: "Function Authorization",
        path: "/functionAuthorization",
    };

    return (
        <div className="container mx-auto p-6 rounded">
            {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            <h1 className="text-2xl font-bold mb-4">
                <PageBreadcrumb
                    pageTitle={
                        id
                            ? " Edit Function Authentication"
                            : "Add New Function Authentication"
                    }
                    backInfo={backInfo}
                />
            </h1>

            <form
                onSubmit={handleSubmit}
                className="space-y-4 bg-white p-6 rounded-lg shadow"
            >
                <h3 className="text-xl font-semibold mb-3">Details</h3>
                <hr className="border-t border-gray-300 mb-2" />

                <div>
                    <label className="font-medium mb-2 block">Belong To</label>
                    <div className="space-y-2">
                        {beforeToOptions.map((option) => (
                            <div key={option.value} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`before-to-${option.value}`}
                                    checked={option.checked}
                                    onChange={() => handleCheckboxChange(option.value)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor={`before-to-${option.value}`}
                                    className="ml-2 block text-sm text-gray-900"
                                >
                                    {option.label}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                        <label className="font-medium mb-2 block">
                            Function Name<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            className={`w-full border p-2 rounded ${errors.functionName ? "border-red-500" : ""}`}
                            value={formData.functionName}
                            onChange={(e) =>
                                handleChange("functionName", e.target.value)
                            }
                        />
                        {errors.functionName && (
                            <p className="text-red-500 text-sm mt-1">
                                The function name field is required.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="font-medium mb-2 block">
                            Function Code<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            className={`w-full border p-2 rounded ${errors.functionCode ? "border-red-500" : ""}`}
                            value={formData.functionCode}
                            onChange={(e) =>
                                handleChange("functionCode", e.target.value)
                            }
                        />
                        {errors.functionCode && (
                            <p className="text-red-500 text-sm mt-1">
                                The function code field is required.
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="font-medium mb-2 block">Auth User</label>
                    {formData.authUser && openToOptions.length > 0 && (
                        <>
                            <div className={errors.authUser ? "border border-red-500 rounded " : ""}>
                                <Select
                                    isMulti
                                    options={openToOptions}
                                    value={formData.authUser.map((authUser) => {
                                        const selectedOption = openToOptions.find(
                                            (opt) => opt.value === authUser
                                        );
                                        return selectedOption;
                                    })}
                                    onChange={(selected) => {
                                        const values = (
                                            selected as { value: string; label: string }[]
                                        ).map((opt) => opt.value);
                                        setFormData((prev) => ({
                                            ...prev,
                                            authUser: values,
                                        }));
                                        setErrors((prev) => ({ ...prev, authUser: false }));
                                    }}
                                />
                            </div>
                            {errors.authUser && (
                                <p className="text-red-500 text-sm mt-1">
                                    The authuser field is required.
                                </p>
                            )}
                        </>
                    )}
                </div>


                <div className="flex justify-between pt-4">
                    <button
                        type="button"
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                        onClick={() => window.history.back()}
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};
