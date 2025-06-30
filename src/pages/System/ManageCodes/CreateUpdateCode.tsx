import { useNavigate, useParams } from "react-router";
import Select from "react-select";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import { useEffect, useState } from "react";
import { addCode, getAllCountry, getCodeById, updateCode } from "../../../services/apis";
import { toast } from "react-toastify";

interface Option {
    value: string;
    label: string;
}

export const CreateUpdateCode = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);


    const [formData, setFormData] = useState({
        name: "",
        type: "",
        code: "",
        longCode: "",
        country: "",
        status: true,
    });

    const [errors, setErrors] = useState({
        name: false,
        type: false,
    });

    const [countryOptions, setCountryOptions] = useState<Option[]>([]);

    useEffect(() => {
        if (id) {
            fetchCodeData(id);
        }
        fetchCountries();
    }, [id]);

    const fetchCountries = async () => {
        setLoading(true);
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
        setLoading(false);
    };

    const fetchCodeData = async (codeId: string) => {
        setLoading(true);
        try {
            const response = await getCodeById(codeId);
            const data = response.data.data;
            setFormData({
                name: data.name || "",
                type: data.type || "",
                code: data.code || "",
                longCode: data.long_code || "",
                country: data.country || "",
                status: data.is_active === 1,
            });
        } catch (error) {
            console.error("Error fetching code data:", error);
        }
        setLoading(false);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const newErrors = {
            name: formData.name.trim() === "",
            type: formData.type.trim() === "",
        };
        setErrors(newErrors);

        if (newErrors.name || newErrors.type) {
            setLoading(false);
            return;
        }

        try {
            const payload = {
                name: formData.name,
                type: formData.type,
                code: formData.code,
                long_code: formData.longCode,
                country: formData.country,
                is_active: formData.status ? true : false,
            };

            if (id) {
                await updateCode(id, payload);
                toast.success("Code updated successfully!", {
                    position: "top-right",
                    autoClose: 3000,
                    style: { zIndex: 9999999999, marginTop: "4rem" },
                });
            } else {
                await addCode(payload);
                toast.success("Code added successfully!", {
                    position: "top-right",
                    autoClose: 3000,
                    style: { zIndex: 9999999999, marginTop: "4rem" },
                });
            }

            navigate("/manageCode");
        } catch (error) {
            console.error("Error saving code:", error);
            toast.error("Failed to save code.", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
        } finally {
            setLoading(false);
        }
    };


    const backInfo = { title: "Code Management", path: "/manageCode" };

    const typeOptions = [
        { value: "Location", label: "Location" },
        { value: "title", label: "Company" },
        { value: "Material", label: "Material" },
        { value: "Product", label: "Product" },
        { value: "Size", label: "Size" },
        { value: "term", label: "term" },
        { value: "shipterm", label: "shipterm" },
        { value: "shipmethod", label: "shipmethod" },
        { value: "Pressure", label: "Pressure" },
        { value: "iploc", label: "Iploc" },
        { value: "pay", label: "pay" },
        { value: "gst", label: "GST" },
        { value: "OEM", label: "OEM" },
    ];

    return (
        <div>
            {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            <PageBreadcrumb
                pageTitle={id ? "Update Code" : "Add Code"}
                backInfo={backInfo}
            />

            <ComponentCard title="Details">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4 text-gray-800 dark:text-white/90">
                        <div className="col-span-2">
                            <label className="font-medium mb-2 block" htmlFor="name">
                                Name <span className="text-red-500"> *</span>
                            </label>
                            <input
                                type="text"
                                className={`w-full border p-2 rounded ${errors.name ? 'border-red-500' : ''}`}
                                id="name"
                                placeholder="Enter Name..."
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData({ ...formData, name: e.target.value });
                                    if (errors.name) setErrors(prev => ({ ...prev, name: false }));
                                }}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">Name is required.</p>
                            )}
                        </div>

                        <div>
                            <label className="font-medium mb-2 block" htmlFor="type">
                                Type <span className="text-red-500"> *</span>
                            </label>
                            <Select
                                id="type"
                                options={typeOptions}
                                value={typeOptions.find((opt) => opt.value === formData.type)}
                                onChange={(option) => {
                                    setFormData({ ...formData, type: option?.value || "" });
                                    if (errors.type) setErrors(prev => ({ ...prev, type: false }));
                                }}
                                className={errors.type ? 'border border-red-500 rounded' : ''}
                            />
                            {errors.type && (
                                <p className="text-red-500 text-sm mt-1">Type is required.</p>
                            )}
                        </div>

                        <div>
                            <label className="font-medium mb-2 block" htmlFor="code">
                                Code (Optional)
                            </label>
                            <input
                                type="text"
                                className="w-full border p-2 rounded"
                                id="code"
                                placeholder="Enter Code..."
                                value={formData.code}
                                onChange={(e) =>
                                    setFormData({ ...formData, code: e.target.value })
                                }
                            />
                        </div>

                        <div>
                            <label className="font-medium mb-2 block" htmlFor="longCode">
                                Long Code (Optional)
                            </label>
                            <input
                                type="text"
                                className="w-full border p-2 rounded"
                                id="longCode"
                                placeholder="Enter Long Code..."
                                value={formData.longCode}
                                onChange={(e) =>
                                    setFormData({ ...formData, longCode: e.target.value })
                                }
                            />
                        </div>

                        <div>
                            <label className="font-medium mb-2 block" htmlFor="Country">
                                Country (Optional)
                            </label>
                            <Select
                                id="Country"
                                options={countryOptions}
                                value={countryOptions.find(
                                    (opt) => opt.value === formData.country
                                )}
                                onChange={(option) =>
                                    setFormData({ ...formData, country: option?.value || "" })
                                }
                            />
                        </div>

                        <div className="col-span-2">
                            <div className="flex flex-col">
                                <label className="font-medium mb-2 block">Status</label>
                                <div className="flex gap-3">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="true"
                                            checked={formData.status === true}
                                            onChange={() => setFormData({ ...formData, status: true })}
                                        />
                                        Active
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="false"
                                            checked={formData.status === false}
                                            onChange={() => setFormData({ ...formData, status: false })}
                                        />
                                        Inactive
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                            {id ? "Update" : "Add"}
                        </button>
                    </div>
                </form>
            </ComponentCard>
        </div>
    );
};
