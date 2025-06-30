import { useParams, useNavigate } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import Select from "react-select";
import { useState, useEffect } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import {
  editProcedureOnWay,
  getManageProductsById,
  getProcedureById,
  updateProcedure,
} from "../../../services/apis";
import { toast } from "react-toastify";

interface ProcedureFormData {
  id?: number;
  user_id?: number;
  product_id: number;
  delivery_date: string;
  notes: string;
  edited_by?: number;
  produce_qty: number;
  ontheway_qty?: number;
  instock_qty?: number;
  status?: string;
  arrive_date?: string;
  container?: string;
  rack?: string;
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
  { value: "0", label: "In Producing" },
  { value: "1", label: "On the Way" },
  {
    value: "2",
    label: "In Stock",
    isDisabled: true,
  },
];

export const UpdateProcedure = () => {
  const { id, pid, mid } = useParams<{
    id: string;
    pid?: string;
    mid?: string;
  }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProcedureFormData>({
    product_id: pid ? parseInt(pid) : 0,
    delivery_date: "",
    notes: "",
    produce_qty: 0,
    status: "0",
    ontheway_qty: 0,
    arrive_date: "",
    container: "",
    rack: "",
  });
  const [productData, setProductData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [originalStatus, setOriginalStatus] = useState<string>("0");

  useEffect(() => {
    const fetchProductData = async () => {
      if (!pid) return;

      try {
        setLoading(true);
        const response = await getManageProductsById(pid);

        let product;
        if (Array.isArray(response.data.data)) {
          product = response.data.data[0];
        } else {
          product = response.data.data;
        }

        if (product) {
          setProductData(product);
          setFormData((prev) => ({
            ...prev,
            product_id: product.id,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch product data:", error);
        toast.error("Failed to load product data", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [pid]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (id) {
          const procedureResponse = await getProcedureById(id);
          const procedureData = procedureResponse.data.data;

          const statusValue =
            procedureData.status !== undefined
              ? procedureData.status.toString()
              : "0";
          setOriginalStatus(statusValue);

          setFormData({
            id: procedureData.id,
            user_id: procedureData.user_id,
            product_id: procedureData.product_id,
            produce_qty: procedureData.produce_qty,
            delivery_date: procedureData.delivery_date
              ? new Date(procedureData.delivery_date)
                  .toISOString()
                  .split("T")[0]
              : "",
            ontheway_qty: procedureData.ontheway_qty || 0,
            instock_qty: procedureData.instock_qty,
            notes: procedureData.notes,
            edited_by: procedureData.edited_by,
            status: statusValue,
            arrive_date: procedureData.arrive_date || "",
            container: procedureData.container || "",
            rack: procedureData.rack || "",
          });
        }
      } catch (error) {
        toast.error("Failed to fetch data", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, pid]);

  const handleStatusChange = (selectedOption: any) => {
    setFormData((prev) => ({
      ...prev,
      status: selectedOption.value,
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !mid) return;

    // Validation
    if (!formData.delivery_date) {
      toast.error("Delivery date is required", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
      return;
    }

    // Additional validation for "On the Way" status
    if (formData.status === "1") {
      if (!formData.ontheway_qty) {
        toast.error("On the Way quantity is required", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
        return;
      }
      if (!formData.arrive_date) {
        toast.error("ETA is required", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
        return;
      }
      if (!formData.container) {
        toast.error("Container is required", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
        return;
      }
    }

    const payload = {
      user_id: formData.user_id ?? 1,
      product_id: formData.product_id,
      produce_qty: Number(formData.produce_qty) || 0,
      delivery_date: formData.delivery_date,
      notes: formData.notes,
      status: formData.status || "0",
      edited_by: formData.edited_by ?? 1,
      ontheway_qty: formData.status === "1" ? Number(formData.ontheway_qty) : 0,
      arrive_date:formData.arrive_date,
      container:formData.container,
      rack: formData.rack,
    };
    console.log(payload,"gggggg")

    try {
      setLoading(true);

      // If status is "On the Way", use editProcedureOnWay API
      if (formData.status === "1") {
        await editProcedureOnWay(mid, payload);
        toast.success("Procedure updated to On the Way successfully", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      } else {
        // For other statuses, use the regular updateProcedure API
        await updateProcedure(mid, payload);
        toast.success("Procedure updated successfully", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      }

      navigate(`/managequantity/procedure/${pid}`);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Update failed";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
      console.error("Error updating procedure:", error);
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
      [id]:
        id === "produce_qty" || id === "ontheway_qty" ? Number(value) : value,
    }));
  };

  const handleDateChange = (date: Date[] | string[]) => {
    const selectedDate =
      Array.isArray(date) && date.length > 0
        ? date[0] instanceof Date
          ? date[0].toLocaleDateString("en-CA") // formats as yyyy-mm-dd in local time
          : date[0]
        : "";

    setFormData((prev) => ({
      ...prev,
      delivery_date: selectedDate,
    }));
  };

  const selectedStatus =
    statusOptions.find((option) => option.value === formData.status) ||
    statusOptions[0];
  const showOnTheWayFields = formData.status === "1";

  // Disable status field if current status is "On the Way" or original status was "On the Way"
  const isStatusDisabled =
    formData.status === "1" ||
    formData.status === "2" ||
    originalStatus === "1";

  const showInStockFields = formData.status === "2";
  return (
    <div>
      <PageBreadcrumb
        pageTitle="Update Procedure Quality"
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
      <ComponentCard title="Details">
        <form
          onSubmit={handleUpdate}
          className="space-y-4 text-gray-800 dark:text-white/90"
        >
          <div>
            <div className="flex space-x-2">
              <h3>Product Model:</h3>
              <p className="font-light">{productData?.model || "N/A"}</p>
            </div>
            <div className="flex space-x-2">
              <h3>PN:</h3>
              <p className="font-light">{productData?.parts_no || "N/A"}</p>
            </div>
            <div className="flex space-x-2">
              <h3>Location:</h3>
              <p className="font-light">
                {productData?.inventory_location_data?.[0]?.name || "N/A"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <div className="flex flex-col w-full">
              <label htmlFor="status" className="font-medium mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <Select
                options={statusOptions}
                value={selectedStatus}
                onChange={handleStatusChange}
                placeholder="Select Status"
                isDisabled={loading || isStatusDisabled}
              />
              {isStatusDisabled && (
                <p className="text-sm text-gray-500 mt-1">
                  Status cannot be changed once set to "On the Way"
                </p>
              )}
            </div>
            <div className="flex flex-col w-full">
              <label htmlFor="produce_qty" className="font-medium mb-2">
                Producing Qty <span className="text-red-500">*</span>
              </label>
              <input
                id="produce_qty"
                type="number"
                className="w-full border p-2 rounded"
                placeholder="Enter Producing Qty..."
                required
                value={formData.produce_qty}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-6">
            <div className="flex flex-col w-full">
              <label htmlFor="delivery_date" className="font-medium mb-2">
                Delivery Schedule <span className="text-red-500">*</span>
              </label>
              <Flatpickr
                options={{ dateFormat: "Y-m-d" }}
                id="delivery_date"
                value={formData.delivery_date}
                onChange={handleDateChange}
                disabled={loading}
                className="w-full border p-2 rounded"
                placeholder="Select Date"
              />
            </div>
          </div>

          {/* On the Way Fields - Conditionally Rendered */}
          {(showOnTheWayFields || showInStockFields) && (
            <>
              <div className="grid grid-cols-3 gap-x-4 gap-y-6">
                <div className="flex flex-col w-full">
                  <label htmlFor="ontheway_qty" className="font-medium mb-2">
                    On The Way Qty <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="ontheway_qty"
                    type="number"
                    className="w-full border p-2 rounded"
                    placeholder="Enter On The Way Qty..."
                    required
                    value={formData.ontheway_qty}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                <div className="flex flex-col w-full">
                  <label htmlFor="eta" className="font-medium mb-2">
                    ETA <span className="text-red-500">*</span>
                  </label>
                  <Flatpickr
                    options={{ dateFormat: "Y-m-d" }}
                    id="eta"
                    value={formData.arrive_date}
                    onChange={(date) => {
                        const selectedDate =
                          Array.isArray(date) && date.length > 0
                            ? date[0] instanceof Date
                              ? date[0].toLocaleDateString("en-CA") // → 'yyyy-mm-dd'
                              : date[0]
                            : "";
                            setFormData((prev) => ({ ...prev, arrive_date: selectedDate }));

                        // field.onChange(selectedDate);
                      }}
                    disabled={loading}
                    className="w-full border p-2 rounded"
                    placeholder="Select ETA"
                  />
                </div>
                <div className="flex flex-col w-full">
                  <label htmlFor="container" className="font-medium mb-2">
                    Container <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="container"
                    type="text"
                    className="w-full border p-2 rounded"
                    placeholder="Enter Container..."
                    required
                    value={formData.container}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-x-4 gap-y-6">
                <div className="flex flex-col w-full">
                  <label htmlFor="rack" className="font-medium mb-2">
                    Rack#
                  </label>
                  <input
                    id="rack"
                    type="text"
                    className="w-full border p-2 rounded"
                    placeholder="Enter Rack Number..."
                    value={formData.rack}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 gap-x-4 gap-y-6">
            <div className="flex flex-col w-full">
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
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};
