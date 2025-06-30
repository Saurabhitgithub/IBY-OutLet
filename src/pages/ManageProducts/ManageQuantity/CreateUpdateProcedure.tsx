import { useParams, useNavigate } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import Select from "react-select";
import { useState, useEffect } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import {
  addProcedure,
  getProcedureById,
  updateProcedure,
} from "../../../services/apis";
import { toast } from "react-toastify";

interface ProcedureFormData {
  id?: number;
  user_id?: number;
  product_id: number;
  delivery_date: string;
  arrive_date: string;
  container: string;
  notes: string;
  status: number;
  edited_by?: number;
  produce_qty: number;
  ontheway_qty: number;
  instock_qty?: number;
  rack?: string;
}

interface Product {
  productNo: string;
  Model: string;
  city: string;
  oem_pn?: string;
}

const statusOptions = [
  { value: 0, label: "In Producing" },
  { value: 1, label: "In stock" },
  { value: 2, label: "On the Way" },
];

export const CreateUpdateProcedure = () => {
  const { pid, id } = useParams<{ pid?: string; id?: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProcedureFormData>({
    user_id: 1,
    product_id: pid ? parseInt(pid) : 0,
    delivery_date: "",
    arrive_date: "",
    container: "",
    notes: "",
    status: 0,
    edited_by: 1,
    produce_qty: 0,
    ontheway_qty: 0,
  });
  const [productData, setProductData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (id) {
          const procedureResponse = await getProcedureById(id);
          const procedureData = procedureResponse.data.data;

          setFormData({
            id: procedureData.id,
            user_id: procedureData.user_id,
            product_id: procedureData.product_id,
            produce_qty: procedureData.produce_qty,
            ontheway_qty: procedureData.ontheway_qty || 0,
            delivery_date: procedureData.delivery_date
              ? new Date(procedureData.delivery_date).toISOString().split("T")[0]
              : "",
            arrive_date: procedureData.arrive_date
              ? new Date(procedureData.arrive_date).toISOString().split("T")[0]
              : "",
            container: procedureData.container || "",
            rack: procedureData.rack || "",
            instock_qty: procedureData.instock_qty,
            notes: procedureData.notes,
            status: parseInt(procedureData.status),
            edited_by: procedureData.edited_by,
          });
        }

        // Mock product data - replace with actual API call
        setProductData({
          productNo: "IWF310X21502F1",
          Model: "WECO ASSY, 3-1/16-10M x 2-INCH 1502 FEMALE WITH NUT & 1/2-in TAPPED PLUG",
          city: "USA - Houston",
          oem_pn: "OEM-PN-12345",
        });
      } catch (error) {
        toast.error("Failed to fetch procedure data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, pid]);

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

    if (formData.status === 2) {
      if (!formData.arrive_date) {
        toast.error("ETA is required when status is 'On the Way'");
        return;
      }
      if (formData.ontheway_qty <= 0) {
        toast.error("On The Way Qty must be greater than 0");
        return;
      }
    }

    if (!formData.notes.trim()) {
      toast.error("Notes are required");
      return;
    }

    const payload = {
      user_id: formData.user_id ?? 1,
      product_id: Number(formData.product_id) || Number(pid) || 0,
      produce_qty: Number(formData.produce_qty) || 0,
      ontheway_qty: Number(formData.ontheway_qty) || 0,
      delivery_date: formData.delivery_date,
      arrive_date: formData.arrive_date,
      container: formData.container,
      rack: formData.rack,
      notes: formData.notes,
      status: String(formData.status),
      edited_by: formData.edited_by ?? 1,
    };
   
    console.log("Payload:", payload);


    try {
      setLoading(true);
      if (id) {
        await updateProcedure(id, payload);
        toast.success("Procedure updated successfully");
      } else {
        await addProcedure(payload);
        toast.success("Procedure added successfully");
      }
      navigate(`/managequantity/procedure/${pid}`);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Error";
      toast.error(errorMessage);
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
      [id]: ["produce_qty", "ontheway_qty"].includes(id) 
        ? Number(value) 
        : value,
    }));
  };

  const handleDateChange = (date: Date[] | string[], field: 'delivery_date' | 'arrive_date') => {
    const selectedDate = Array.isArray(date) && date.length > 0
      ? date[0] instanceof Date
        ? date[0].toLocaleDateString("en-CA")
        : date[0]
      : "";

    setFormData((prev) => ({
      ...prev,
      [field]: selectedDate,
    }));
  };

  const handleSelectChange = (option: any) => {
    setFormData((prev) => ({
      ...prev,
      status: option?.value || 0,
    }));
  };

  const getCurrentStatusOption = () => {
    return statusOptions.find((option) => option.value === formData.status);
  };

  if (loading && id) {
    return <div>Loading...</div>;
  }

  if (!productData) {
    return <div>Loading product data...</div>;
  }

  return (
    <div>
      <PageBreadcrumb
        pageTitle={id ? "Update Procedure Quality" : "Add Procedure Quality"}
        backInfo={{
          title: "Procedure Management",
          path: `/managequantity/procedure/${pid}`,
        }}
      />
      <ComponentCard title="Details">
        <form onSubmit={handleSubmit} className="space-y-4 text-gray-500 dark:text-white/90">
          <div>
            <div className="flex space-x-2">
              <h3>Product Model:</h3>
              <p className="font-light">{productData.Model}</p>
            </div>
            <div className="flex space-x-2">
              <h3>PN:</h3>
              <p className="font-light">{productData.oem_pn}</p>
            </div>
            <div className="flex space-x-2">
              <h3>Location:</h3>
              <p className="font-light">{productData.city}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            {/* Status */}
            <div className="flex flex-col w-full">
              <label htmlFor="status" className="font-medium mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <Select
                options={statusOptions}
                value={getCurrentStatusOption()}
                onChange={handleSelectChange}
                placeholder="Select Status"
                isDisabled={loading}
              />
            </div>

            {/* Producing Qty */}
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
                min="0"
                value={formData.produce_qty}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {/* On The Way Qty */}
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
                min="0"
                value={formData.ontheway_qty}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {/* Conditional Fields for "On the Way" status */}
            {formData.status === 2 && (
              <>
                {/* ETA */}
                <div className="flex flex-col w-full">
                  <label htmlFor="arrive_date" className="font-medium mb-2">
                    ETA <span className="text-red-500">*</span>
                  </label>
                  <Flatpickr
                    options={{ dateFormat: "Y-m-d" }}
                    id="arrive_date"
                    value={formData.arrive_date}
                    onChange={(date) => handleDateChange(date, 'arrive_date')}
                    disabled={loading}
                    className="w-full border p-2 rounded"
                    placeholder="Select ETA Date"
                  />
                </div>

                {/* Container */}
                <div className="flex flex-col w-full">
                  <label htmlFor="container" className="font-medium mb-2">
                    Container
                  </label>
                  <input
                    id="container"
                    type="text"
                    className="w-full border p-2 rounded"
                    placeholder="Enter Container Number..."
                    value={formData.container}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                {/* Rack (if needed) */}
                <div className="flex flex-col w-full">
                  <label htmlFor="rack" className="font-medium mb-2">
                    Rack Location
                  </label>
                  <input
                    id="rack"
                    type="text"
                    className="w-full border p-2 rounded"
                    placeholder="Enter Rack Location..."
                    value={formData.rack || ""}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </>
            )}
          </div>

          {/* Delivery Schedule */}
          <div className="grid grid-cols-1 gap-x-4 gap-y-6">
            <div className="flex flex-col w-full">
              <label htmlFor="delivery_date" className="font-medium mb-2">
                Delivery Schedule <span className="text-red-500">*</span>
              </label>
              <Flatpickr
                options={{ dateFormat: "Y-m-d" }}
                id="delivery_date"
                value={formData.delivery_date}
                onChange={(date) => handleDateChange(date, 'delivery_date')}
                disabled={loading}
                className="w-full border p-2 rounded"
                placeholder="Select Date"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-1 gap-x-4 gap-y-6">
            <div className="flex flex-col w-full">
              <label htmlFor="notes" className="font-medium mb-2">
                Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                id="notes"
                className="px-2 py-3 border-1 rounded-md"
                required
                placeholder="Enter Notes Here..."
                value={formData.notes}
                onChange={handleChange}
                disabled={loading}
              ></textarea>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Processing..." : id ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};