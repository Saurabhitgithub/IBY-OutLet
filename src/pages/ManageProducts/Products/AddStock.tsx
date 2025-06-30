import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import ComponentCard from "../../../components/common/ComponentCard";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import {
  addStock,
  getProductById,
  getStockById,
  updateStock,
} from "../../../services/apis";

interface StockFormData {
  quality: number;
  input_date: string;
}

const backInfo = {
  title: "Product Stock Management",
  path: "/products/stockManagement",
};

export const AddStock = () => {
  const { pid, id, idd } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [productData, setProductData] = useState<any>(null);
  const [stockData, setStockData] = useState<any[]>([]);
  const [sqlId, setSqlId] = useState<number>();

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    reset,
  } = useForm<StockFormData>({
    defaultValues: {
      quality: 0,
      input_date: "",
    },
  });

  useEffect(() => {
    if (pid) {
      fetchProduct(pid);
    }
  }, [pid]);

  useEffect(() => {
    if (id) {
      fetchStock(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      const res = await getProductById(productId);
      const data = res?.data?.data;
      setSqlId(data[0].id);

      if (data) {
        setProductData({
          productNo: data[0]?.parts_no,
          Model: data[0]?.model,
          city: data[0]?.inventory_location_data[0]?.name,
        });
        setStockData(data?.stocks ?? []);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const fetchStock = async (stockId: string) => {
    try {
      const res = await getStockById(stockId);
      const data = res?.data?.data;

      if (data) {
        // Format the date as YYYY-MM-DD in UTC to avoid timezone shift
        const formattedDate = new Date(data.input_date)
          .toISOString()
          .split("T")[0];

        // Set form values
        reset({
          quality: data.quality,
          input_date: formattedDate, // Use the formatted UTC date string here
        });

        if (data.product_id) {
          fetchProduct(data.product_id.toString());
        }
      }
    } catch (error) {
      console.error("Error fetching stock:", error);
    }
  };

  const onSubmit = async (formData: StockFormData) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const userId = Number(localStorage.getItem("user_id")) || 1;
      const payload = {
        user_id: userId,
        product_id: sqlId,
        quality: formData.quality,
        input_date: formData.input_date,
        edited_by: userId,
      };

      if (idd) {
        // Update existing stock
        await updateStock(idd, payload);
        toast.success("Stock updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      } else {
        // Add new stock
        await addStock(payload);
        toast.success("Stock added successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      }

      navigate(-1);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        `Failed to ${id ? "update" : "add"} stock. Please try again.`;

      setServerError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-gray-800 dark:text-white/90 space-y-7">
      <PageBreadcrumb
        pageTitle={id ? "Update Stock Original" : "Add Stock Management"}
        backInfo={backInfo}
      />

      {isLoading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}

      <div className="relative w-full text-gray-500">
        <ComponentCard title="Details:">
          {serverError && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <p className="font-bold">Server Error:</p>
              <p>{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-gray-800 dark:text-white/90">
              {/* Product Model Field */}
              <div>
                <label
                  className="font-medium mb-2 block"
                  htmlFor="product_model"
                >
                  Product Model:
                </label>
                <input
                  type="text"
                  value={productData?.Model || ""}
                  disabled
                  className="w-full border p-2 rounded bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Quality Field */}
              <div>
                <label className="font-medium mb-2 block" htmlFor="quality">
                  Quality<span className="text-red-500"> *</span>
                </label>
                <Controller
                  name="quality"
                  control={control}
                  rules={{
                    required: "Quality is required",
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Quality must be a number",
                    },
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      className={`w-full border p-2 rounded ${
                        errors.quality ? "border-red-500" : ""
                      }`}
                      placeholder="Enter Quality..."
                      disabled={isLoading}
                    />
                  )}
                />
                {errors.quality && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.quality.message}
                  </p>
                )}
              </div>

              {/* Input Date Field */}
              <div className="col-span-1">
                <label className="font-medium mb-2 block" htmlFor="input_date">
                  Input Date<span className="text-red-500"> *</span>
                </label>
                <Controller
                  name="input_date"
                  control={control}
                  rules={{ required: "Input date is required" }}
                  render={({ field }) => (
                    <Flatpickr
                      value={field.value}
                      options={{
                        dateFormat: "Y-m-d", // ISO format
                        allowInput: true,
                        altInput: true,
                        altFormat: "m/d/Y", // Display format
                        disableMobile: true,
                      }}
                      className={`w-full border p-2 rounded ${
                        errors.input_date ? "border-red-500" : ""
                      }`}
                      placeholder="Select Date"
                      disabled={isLoading}
                      onChange={(date) => {
                        const selectedDate =
                          Array.isArray(date) && date.length > 0
                            ? date[0] instanceof Date
                              ? date[0].toLocaleDateString("en-CA") // → 'yyyy-mm-dd'
                              : date[0]
                            : "";

                        field.onChange(selectedDate);
                      }}
                    />
                  )}
                />
                {errors.input_date && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.input_date.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`bg-brand text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : id ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </div>
  );
};
