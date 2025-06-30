import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { Button } from "@mui/material";
import Select, { SingleValue } from "react-select";
import { addCrossRef } from "../../../services/apis";
import { toast } from "react-toastify";

interface Option {
  value: string;
  label: string;
}

const TypeOptions: Option[] = [
  { value: "parts", label: "Parts" },
  { value: "serial", label: "Serial" },
  { value: "model", label: "Model" },
  { value: "other", label: "Others" }
];

export const AddCrossRef: React.FC = () => {
  const [formData, setFormData] = useState({
    product: "",
    manufacture: "",
    oemPN: "",
    ourPN: "",
    location: null as Option | null,
    notes: ""
  });

  const [formErrors, setFormErrors] = useState({
    product: "",
    manufacture: "",
    oemPN: "",
    ourPN: ""
  });

  const navigate = useNavigate();
  const { id } = useParams();
  const backInfo = { title: "CrossRef", path: "/cross" };

  const handleChange = (name: keyof typeof formData, value: string | Option | null) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (typeof value === "string" && value.trim() !== "") {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: any = {};
    if (!formData.product.trim()) errors.product = "The product field is required.";
    if (!formData.manufacture.trim()) errors.manufacture = "The manufacture field is required.";
    if (!formData.oemPN.trim()) errors.oemPN = "The oempn field is required.";
    if (!formData.ourPN.trim()) errors.ourPN = "The ourpn field is required.";

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    const payload = {
      product: formData.product,
      manufacture: formData.manufacture,
      oempn: formData.oemPN,
      ourpn: formData.ourPN,
      type: formData.location?.value || "",
      notes: formData.notes || ""
    };

    try {
      console.log("Submitting payload:", payload);
      const response = await addCrossRef(payload);
      console.log("Success:", response.data);

      toast.success("Cross ref added successfully!", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });

      navigate("/cross");
    } catch (error) {
      console.error("Error saving code:", error);

      toast.error("Failed to add cross ref. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    }
  };


  return (
    <div className="container mx-auto p-6 rounded">
      <PageBreadcrumb
        pageTitle={id ? "Update CrossRef" : "Add CrossRef"}
        backInfo={backInfo}
      />

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-3 text-gray-500">Details</h3>
        <hr className="border-t border-gray-300 mb-2" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 block text-gray-500">Product<span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={formData.product}
              onChange={(e) => handleChange("product", e.target.value)}
            />
            {formErrors.product && <span className="text-red-500 text-sm">{formErrors.product}</span>}
          </div>

          <div>
            <label className="font-medium mb-2 block text-gray-500">Manufacture<span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={formData.manufacture}
              onChange={(e) => handleChange("manufacture", e.target.value)}
            />
            {formErrors.manufacture && <span className="text-red-500 text-sm">{formErrors.manufacture}</span>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="font-medium mb-2 block text-gray-500">
              OEM P/N<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={formData.oemPN}
              onChange={(e) => handleChange("oemPN", e.target.value)}
            />
            {formErrors.oemPN && <span className="text-red-500 text-sm">{formErrors.oemPN}</span>}
          </div>

          <div>
            <label className="font-medium mb-2 block text-gray-500">
              OUR P/N<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={formData.ourPN}
              onChange={(e) => handleChange("ourPN", e.target.value)}
            />
            {formErrors.ourPN && <span className="text-red-500 text-sm">{formErrors.ourPN}</span>}
          </div>

          <div>
            <label className="font-medium mb-2 block text-gray-500">
              Type<span className="text-red-500">*</span>
            </label>
            <Select
              options={TypeOptions}
              value={formData.location}
              onChange={(selected: SingleValue<Option>) => handleChange("location", selected)}
              placeholder="Select Type"
            />
          </div>
        </div>

        <div>
          <label className="font-medium mb-2 block text-gray-500">
            Notes<span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border p-2 rounded h-28"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 mb-2">
          <Button variant="outlined" onClick={() => navigate("/cross")}>
            Cancel
          </Button>
          <Button variant="contained" type="submit">
            Add Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddCrossRef;
