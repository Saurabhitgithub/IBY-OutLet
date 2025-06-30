import { useParams, useNavigate } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import Select from "react-select";
import { useState, useEffect } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import {
  editProcedureDoubleCheck,
  getManageProductsById,
  getProcedureById,
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
  instock_date?: string;
  rack?: string;
  container: string;
  eta: string;
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
// interface ProcedurePayload {
//     instock_qty: number;
//     instock_date: string;
//     rack?: string;
//     status: string;
// }
const statusOptions = [{ value: 2, label: "In Stock" }];

export const DoubleCheck = () => {
  const { id, mid, pid } = useParams<{
    id: string;
    mid?: string;
    pid?: string;
  }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProcedureFormData>({
    product_id: mid ? parseInt(mid) : 0,
    delivery_date: "",
    notes: "",
    produce_qty: 0,
    ontheway_qty: 0,
    instock_qty: 0,
    instock_date: "",
    rack: "",
    container: "",
    eta: "",
  });
  const [productData, setProductData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(statusOptions[0]);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!mid) return;
      try {
        setLoading(true);
        const response = await getManageProductsById(mid);
        // Handle the response data based on your API structure
        let product;
        if (Array.isArray(response.data.data)) {
          product = response.data.data[0]; // Take first item if array
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
  }, [mid]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (id || pid) {
          // Fetch procedure data
          const procedureResponse = await getProcedureById(id);
          const procedureData = procedureResponse.data.data;

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
            ontheway_qty: procedureData.ontheway_qty,
            instock_qty: procedureData.instock_qty,
            notes: procedureData.notes,
            edited_by: procedureData.edited_by,
            instock_date: procedureData.instock_date,
            rack: procedureData.rack,
            container: procedureData.container,
            eta: procedureData.arrive_date,
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
  }, [id, mid]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !pid) return;

    // Validation
    if (!formData.delivery_date) {
      toast.error("Delivery date is required", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
      return;
    }

    if (!formData.notes.trim()) {
      toast.error("Notes are required", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
      return;
    }

    const payload = {
      user_id: formData.user_id ?? 1,
      product_id: formData.product_id,
      produce_qty: Number(formData.produce_qty) || 0,
      delivery_date: formData.delivery_date,
      notes: formData.notes,
      status: selectedStatus.value.toString(),
      edited_by: formData.edited_by ?? 1,
      instock_qty: Number(formData.instock_qty),
      instock_date: formData.instock_date,
      rack: formData.rack,
      container: formData.container,
      eta: formData.eta,
      ontheway_qty: Number(formData.ontheway_qty),
    };

    try {
      setLoading(true);
      // await updateProcedure(id, payload);
      await editProcedureDoubleCheck(pid, payload);
      toast.success("Procedure Double Checked successfully", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
      navigate(`/managequantity/procedure/${mid}`);
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
        id === "produce_qty" || id === "ontheway_qty" || id === "instock_qty"
          ? Number(value)
          : value,
            
    }));
  };

  const handleDateChange = (date: Date[] | string[], field: string) => {
    const selectedDate =
      Array.isArray(date) && date.length > 0
        ? date[0] instanceof Date
          ? date[0].toISOString().split("T")[0]
          : date[0]
        : "";
    setFormData((prev) => ({
      ...prev,
      [field]: selectedDate,
    }));
  };

  return (
    <div>
      <PageBreadcrumb
        pageTitle="Double Check"
        backInfo={{
          title: "Procedure Management",
          path: `/managequantity/procedure/${mid}`,
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
                Status
              </label>
              <Select
                options={statusOptions}
                value={statusOptions[0]}
                isDisabled={true}
                placeholder="Status"
              />
            </div>
            <div className="flex flex-col w-full">
              <label htmlFor="produce_qty" className="font-medium mb-2">
                Producing Qty
              </label>
              <input
                id="produce_qty"
                type="number"
                className="w-full border p-2 rounded "
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
                Delivery Schedule
              </label>
              <Flatpickr
                options={{ dateFormat: "Y-m-d" }}
                id="delivery_date"
                value={formData.delivery_date}
                onChange={handleDateChange}
                disabled={loading}
                className="w-full border p-2 rounded "
                placeholder="Select Date"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-x-4 gap-y-6">
            <div className="flex flex-col w-full">
              <label htmlFor="ontheway_qty" className="font-medium mb-2">
                On The Way Qty
              </label>
              <input
                id="ontheway_qty"
                type="number"
                className="w-full border p-2 rounded "
                placeholder="Enter On The Way Qty..."
                required
                value={formData.ontheway_qty}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="flex flex-col w-full">
              <label htmlFor="eta" className="font-medium mb-2">
                ETA
              </label>
              <Flatpickr
                options={{ dateFormat: "Y-m-d" }}
                id="eta"
                value={formData.eta}
                onChange={(dates) => {
                  const selectedDate = dates[0]
                    ? dates[0].toISOString().split("T")[0]
                    : "";
                  setFormData((prev) => ({ ...prev, eta: selectedDate }));
                }}
                disabled={true} 
                className="w-full border p-2 rounded disabled:opacity-70"
                placeholder="Select ETA"
              />
            </div>
            <div className="flex flex-col w-full">
              <label htmlFor="container" className="font-medium mb-2">
                Container
              </label>
              <input
                id="container"
                type="text"
                className="w-full border p-2 rounded "
                placeholder="Enter Container..."
                required
                value={formData.container}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <div className="flex flex-col w-full">
              <label htmlFor="produce_qty" className="font-medium mb-2">
                Qty Received
              </label>
              <input
                id="instock_qty"
                type="number"
                className="w-full border p-2 rounded"
                placeholder="Enter Producing Qty..."
                required
                value={formData.instock_qty}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="flex flex-col w-full">
              <label htmlFor="produce_qty" className="font-medium mb-2">
                In Stock Date
              </label>
              <Flatpickr
                options={{ dateFormat: "Y-m-d" }}
                id="instock_date"
                value={formData.instock_date}
                onChange={handleDateChange}
                disabled={loading}
                className="w-full border p-2 rounded"
                placeholder="Select Date"
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
          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Checkimg..." : "Double Check"}
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};
