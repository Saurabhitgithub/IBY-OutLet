import React, { useEffect, useState } from "react";
import Select from "react-select";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useNavigate, useParams } from "react-router";
import {
    addRuleLocation,
    getAllCompanies,
    getRuleLocationById,
    updateRuleLocation,
} from "../../services/apis";
import { toast } from "react-toastify";

interface Option {
    value: string;
    label: string;
}

export const AddUpdateRuleLocation: React.FC = () => {
    const [companyOptions, setCompanyOptions] = useState<Option[]>([]);
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        id: null,
        title: "",
        company: "",
    });

    const [errors, setErrors] = useState({
        title: false,
        company: false,
    });

    useEffect(() => {
        if (id) {
            fetchRuleLocationData(id);
        }
        fetchCompanies();
    }, [id]);

    const fetchRuleLocationData = async (codeId: string) => {
        setLoading(true);
        try {
            const response = await getRuleLocationById(codeId);
            const data = response.data.data;
            setFormData((prev) => ({
                ...prev,
                ...data,
                company: data.code_id || "",
            }));
        } catch (error) {
            console.error("Error fetching code data:", error);
        }
        finally {
            setLoading(false);
        }
    };

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const res = await getAllCompanies();
            if (res?.data?.data) {
                const options = res.data.data.map((company: any) => ({
                    value: company.id,
                    label: company.name,
                }));
                setCompanyOptions(options);
            }
        } catch (error) {
            console.error("Failed to fetch companies", error);
        }
        setLoading(false);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        setLoading(true);
        e.preventDefault();

        const newErrors = {
            title: formData.title.trim() === "",
            company: formData.company === "",
        };
        setErrors(newErrors);

        if (newErrors.title || newErrors.company) {
            setLoading(false);
            return;
        }

        const payload = {
            title: formData.title,
            code_id: formData.company,
        };

        try {
            if (id) {
                await updateRuleLocation(formData.id, payload);
                toast.success("Rule location updated successfully!", {
                    position: "top-right",
                    autoClose: 3000,
                    style: { zIndex: 9999999999, marginTop: "4rem" },
                });
            } else {
                await addRuleLocation(payload);
                toast.success("Rule location added successfully!", {
                    position: "top-right",
                    autoClose: 3000,
                    style: { zIndex: 9999999999, marginTop: "4rem" },
                });
            }

            navigate("/ruleLocation");
        } catch (error) {
            console.error("Error saving code:", error);
            toast.error("Failed to save rule location.", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
        } finally {
            setLoading(false);
        }
    };


    const backInfo = { title: "Rule Location", path: "/ruleLocation" };

    return (
        <div className="container mx-auto p-6 rounded">
            {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            <h1 className="text-2xl font-bold mb-4">
                <PageBreadcrumb
                    pageTitle={id ? "Edit Rules Location" : "Add New Rules Location"}
                    backInfo={backInfo}
                />
            </h1>
            <form
                onSubmit={handleSubmit}
                className="space-y-6 bg-white p-6 rounded-lg shadow text-gray-800 dark:text-white/90"
            >
                <h3 className="text-xl font-semibold">Details</h3>
                <hr className="border-t border-gray-300" />

                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="font-medium mb-2 block">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            className={`w-full border p-2 rounded ${errors.title ? "border-red-500" : "border-gray-300"
                                }`}
                            placeholder="Enter title"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm mt-1">
                                The title field is required.
                            </p>
                        )}
                    </div>

                    <div className="col-span-2">
                        <label className="font-medium mb-2 block">
                            Company
                        </label>
                        <div className={`${errors.company ? "border border-red-500 rounded" : ""}`}>
                            <Select
                                id="company"
                                options={companyOptions}
                                value={companyOptions.find(
                                    (opt) => opt.value === formData.company
                                )}
                                onChange={(option) =>
                                    setFormData({
                                        ...formData,
                                        company: option?.value || "",
                                    })
                                }
                            />
                        </div>
                        {errors.company && (
                            <p className="text-red-500 text-sm mt-1">
                                The company field is required.
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                    <button
                        type="button"
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                        onClick={() => window.history.back()}
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};
