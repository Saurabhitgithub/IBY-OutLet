import { useParams, useNavigate } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import Select from "react-select";
import { useEffect, useState } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";

import { addProcedure, getManageProductsById } from "../../../services/apis";
import { toast } from "react-toastify";

interface ProcedureFormData {
    user_id?: number;
    product_id: number;
    delivery_date: string;
    notes: string;
    status: number;
    edited_by?: number;
    produce_qty: number;
}

interface Product {
    id: number;
    productNo?: string;
    model?: string;
    inventory_location_data?: Array<{
        name: string;
    }>;
    oem_pn?: string;
    parts_no?: string;
}

const statusOptions = [
    { value: 0, label: "In Producing" },
    { value: 1, label: "On the Way" },
    { value: 2, label: "In stock" },
];

export const CreateProcedure = () => {
    const { pid } = useParams<{ pid?: string }>();
    const navigate = useNavigate();
    const [productData, setProductData] = useState<Product | null>(null);
    const [formData, setFormData] = useState<Omit<ProcedureFormData, 'status'>>({
        user_id: 1,
        product_id: pid ? parseInt(pid) : 0,
        delivery_date: "",
        notes: "",
        edited_by: 1,
        produce_qty: 0,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProductData = async () => {
            if (!pid) return;

            try {
                setLoading(true);
                const response = await getManageProductsById(pid);

                // Handle the response data based on your API structure
                let product;
                if (Array.isArray(response.data.data)) {
                    product = response.data.data[0]; // Take first item if array
                } else {
                    product = response.data.data;
                }

                if (product) {
                    setProductData(product);
                    setFormData(prev => ({
                        ...prev,
                        product_id: product.id
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch product data:", error);
                toast.error("Failed to load product data");
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
    }, [pid]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.product_id && !pid) {
            toast.error("Product ID is required");
            return;
        }

        if (!formData.delivery_date) {
            toast.error("Delivery date is required");
            return;
        }

     

        const payload = {
            user_id: formData.user_id ?? 1,
            product_id: Number(formData.product_id) || Number(pid) || 0,
            produce_qty: Number(formData.produce_qty) || 0,
            delivery_date: formData.delivery_date,
            notes: formData.notes,
            status: "0",
            edited_by: formData.edited_by ?? 1,
        };

        try {
            setLoading(true);
            await addProcedure(payload);
            toast.success("Procedure added successfully", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
            navigate(`/managequantity/procedure/${pid}`);
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message || error?.message || "Error";
            toast.error(errorMessage, {
                      position: "top-right",
                      autoClose: 3000,
                      style: { zIndex: 9999999999, marginTop: "4rem" },
                    });
            console.error("Error submitting procedure:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: id === "produce_qty" ? Number(value) : value,
        }));
    };

   const handleDateChange = (date: Date[] | string[]) => {
    const selectedDate =
        Array.isArray(date) && date.length > 0
            ? (date[0] instanceof Date
                ? date[0].toLocaleDateString('en-CA') // formats as yyyy-mm-dd in local time
                : date[0])
            : "";

    setFormData((prev) => ({
        ...prev,
        delivery_date: selectedDate,
    }));
};


  



    return (
        <div>
            <PageBreadcrumb
                pageTitle="Add Procedure Quality"
                backInfo={{
                    title: "Procedure Management",
                    path: `/managequantity/procedure/${pid}`,
                }}
            />
            {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            <ComponentCard title="Details"  >
                <form
                    onSubmit={handleSubmit}
                    className="space-y-4 text-gray-500 dark:text-white/90"
                >
                    <div>
                        <div className="flex space-x-2">
                            <h3 className="">Product Model: </h3>{" "}
                            <p className="font-light"> {productData?.model || "N/A"}</p>
                        </div>
                        <div className="flex space-x-2">
                            <h3 className="">PN: </h3>{" "}
                            <p className="font-light"> {productData?.parts_no || "N/A"}</p>
                        </div>
                        <div className="flex space-x-2">
                            <h3 className="">Location: </h3>{" "}
                            <p className="font-light">{productData?.inventory_location_data?.[0]?.name || "N/A"}</p>
                        </div>
                        
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6 ">
                        <div className="flex flex-col ">
                            <label htmlFor="status" className="font-medium mb-2">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <Select
                                options={statusOptions}
                                value={statusOptions[0]}
                                isDisabled={true}
                                placeholder="Status"

                            />
                        </div>
                        <div className="flex flex-col ">
                            <label htmlFor="produce_qty" className="font-medium mb-2">
                                Producing Qty <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="produce_qty"
                                type="number"
                                className=" border p-2 rounded    "
                                placeholder="Enter Producing Qty..."
                                required
                                value={formData.produce_qty}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-x-4 gap-y-6">
                        <div className="flex flex-col ">
                            <label htmlFor="delivery_date" className="font-medium mb-2">
                                Delivery Schedule <span className="text-red-500">*</span>
                            </label>
                            <Flatpickr
                                options={{ dateFormat: "Y-m-d" }}
                                id="delivery_date"
                                value={formData.delivery_date}
                                onChange={handleDateChange}
                                disabled={loading}
                                className=" border p-2 rounded"
                                placeholder="Select Date"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-x-4 gap-y-6">
                        <div className="flex flex-col ">
                            <label htmlFor="notes" className="font-medium mb-2">
                                Notes
                            </label>
                            <textarea
                                id="notes"
                                className="px-2 py-3 border-1 rounded-md"

                                placeholder="Enter Notes Here..."
                                value={formData.notes}
                                onChange={handleChange}
                                disabled={loading}
                            ></textarea>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <button
                            type="submit"
                            className="bg-brand text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Add"}
                        </button>
                    </div>
                </form>
            </ComponentCard>
        </div>
    );
};