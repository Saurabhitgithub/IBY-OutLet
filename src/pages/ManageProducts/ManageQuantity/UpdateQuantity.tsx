import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import {
  getManageProductsById,
  updateManageProducts,
} from "../../../services/apis";
import { toast } from "react-toastify";

export const UpdateQuantity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    product_id: "",
    quantity: 0,
    min_qty: 0,
    max_qty: 0,
    qty_inproduce: 0,
    qty_ontheway: 0,
    outof_stock: 0,
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await getManageProductsById(id);

        const dataArray = response?.data?.data;
        const data = Array.isArray(dataArray) ? dataArray[0] : null;

        if (!data) {
          console.error("No product data found in response");
          return;
        }

        setProductData(data);
        setFormData({
          product_id: data.id,
          quantity: data.quantity || 0,
          min_qty: data.min_qty || 0,
          max_qty: data.max_qty || 0,
          qty_inproduce: data.qty_inproduce || 0,
          qty_ontheway: data.qty_ontheway || 0,
          outof_stock: data.outof_stock || 0,
          notes: data.internal_notes || "",
        });
      } catch (error) {
        console.error("Error fetching product data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.min_qty < 0) {
      newErrors.min_qty = "Minimum quantity cannot be negative";
    }

    if (formData.max_qty < 0) {
      newErrors.max_qty = "Maximum quantity cannot be negative";
    }

    if (formData.min_qty > formData.max_qty) {
      newErrors.min_qty =
        "Minimum quantity cannot be greater than maximum quantity";
    }

    if (formData.quantity < 0) {
      newErrors.quantity = "Quantity cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name !== "notes" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    const payload = {
      product_id: formData.product_id,
      quantity: formData.quantity,
      max_qty: formData.max_qty,
      min_qty: formData.min_qty,
      qty_ontheway: formData.qty_ontheway,
      qty_inproduce: formData.qty_inproduce,
      outof_stock: formData.outof_stock,
       notes: formData.notes || "",
    };

    try {
      await updateManageProducts(payload);
      navigate("/manageQuantity");
       toast.success("Product Updated Successfully", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999999999999, marginTop:"4rem" },
      });
 
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const backInfo = { title: "Manage Quantity", path: "/manageQuantity" };

  if (loading) {
    return <div>{loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
 </div>;
  }

  if (!productData) {
    return <div>Product not found</div>;
  }

  return (
    <div>
      <PageBreadcrumb
        pageTitle={"Update Product Quantity"}
        backInfo={backInfo}
      />

      <ComponentCard title="Details:">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 text-gray-500 dark:text-white/90"
        >
          <div>
            <div className="flex space-x-2">
              <h3 className="">Product Model: </h3>{" "}
              <p className="font-light"> {productData.model || "--"}</p>
            </div>
            <div className="flex space-x-2">
              <h3 className="">PN: </h3>{" "}
              <p className="font-light"> {productData.productNo ||"--"}</p>
            </div>
            <div className="flex space-x-2">
              <h3 className="">Location: </h3>{" "}
              <p className="font-light"> {productData.city ||"--"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-4 gap-y-6">
            <div className="flex flex-col w-full">
              <div className="flex w-full gap-4">
                <div className="flex flex-col w-full">
                  <label htmlFor="quantity" className="font-medium mb-2">
                    Quantity<span className="text-red-500">*</span>
                  </label>
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    className="w-full border p-2 rounded"
                    placeholder="Enter Quantity..."
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                  {errors.quantity && (
                    <p className="text-red-500 text-sm">{errors.quantity}</p>
                  )}
                </div>

                <div className="flex flex-col w-full">
                  <label htmlFor="min_qty" className="font-medium mb-2">
                    Min. Qty<span className="text-red-500">*</span>
                  </label>
                  <input
                    id="min_qty"
                    name="min_qty"
                    type="number"
                    min="0"
                    className="w-full border p-2 rounded"
                    placeholder="Enter Min. Qty..."
                    value={formData.min_qty}
                    onChange={handleChange}
                    required
                  />
                  {errors.min_qty && (
                    <p className="text-red-500 text-sm">{errors.min_qty}</p>
                  )}
                </div>

                <div className="flex flex-col w-full">
                  <label htmlFor="max_qty" className="font-medium mb-2">
                    Max. Qty<span className="text-red-500">*</span>
                  </label>
                  <input
                    id="max_qty"
                    name="max_qty"
                    type="number"
                    min="0"
                    className="w-full border p-2 rounded"
                    placeholder="Enter Max. Qty..."
                    value={formData.max_qty}
                    onChange={handleChange}
                    required
                  />
                  {errors.max_qty && (
                    <p className="text-red-500 text-sm">{errors.max_qty}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-4 gap-y-6">
            <div className="flex flex-col w-full">
              <div className="flex w-full gap-4">
                <div className="flex flex-col w-full">
                  <label htmlFor="qty_inproduce" className="font-medium mb-2">
                    Qty In Producing <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="qty_inproduce"
                    name="qty_inproduce"
                    type="number"
                    min="0"
                    className="w-full border p-2 rounded"
                    placeholder="Enter Quantity Producing..."
                    value={formData.qty_inproduce}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="flex flex-col w-full">
                  <label htmlFor="qty_ontheway" className="font-medium mb-2">
                    Qty On The Way<span className="text-red-500">*</span>
                  </label>
                  <input
                    id="qty_ontheway"
                    name="qty_ontheway"
                    type="number"
                    min="0"
                    className="w-full border p-2 rounded"
                    placeholder="Enter Qty on the way..."
                    value={formData.qty_ontheway}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-4 gap-y-6">
            <div className="flex flex-col w-full">
              <div className="flex w-full gap-4">
                <div className="flex flex-col w-full">
                  <label htmlFor="usage" className="font-medium mb-2">
                    Lost of sales/Usage <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="outof_stock"
                    name="outof_stock"
                    type="number"
                    min="0"
                    className="w-full border p-2 rounded"
                    placeholder="Enter Lost of sales/usage..."
                    value={formData.outof_stock}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-4 gap-y-6">
            <div className="flex flex-col w-full">
              <div className="flex w-full gap-4">
                <div className="flex flex-col w-full">
                  <label htmlFor="notes" className="font-medium mb-2">
                    Notes <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    className="border-1 rounded-md p-2"
                    placeholder="Enter Notes..."
                    value={formData.notes}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="bg-brand text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
             
            >
              Update
              
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};
