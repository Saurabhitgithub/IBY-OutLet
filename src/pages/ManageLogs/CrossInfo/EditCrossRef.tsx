import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { Button } from "@mui/material";
import { getCrossrefById, updateCrossRef } from "../../../services/apis";
import { toast } from "react-toastify";
import Select, { SingleValue } from "react-select";
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
export const EditCrossRef: React.FC = () => {
  const [formData, setFormData] = useState({
    product: "",
    manufacture: "",
    oemPN: "",
    ourPN: "",
    type: "",
    notes: "",
  });

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const backInfo = { title: "CrossRef", path: "/cross" };
  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  const fetchData = async (id: string) => {
    try {
      const response = await getCrossrefById(id);
      const data = response.data.data;

      // Normalize the type value to match your options
      const normalizedType = data.type.trim().toLowerCase();
      let finalType = "other";

      if (normalizedType.includes("model")) {
        finalType = "model";
      } else if (normalizedType.includes("part")) {
        finalType = "parts";
      } else if (normalizedType.includes("serial")) {
        finalType = "serial";
      }

      setFormData({
        product: data.product.trim(),
        manufacture: data.manufacture.trim(),
        oemPN: data.oempn.trim(),
        ourPN: data.ourpn.trim(),
        type: finalType,
        notes: data.notes.trim()
      });
    } catch (error) {
      console.error("Failed to fetch CrossRef data:", error);
    }
  };
  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        product: formData.product,
        manufacture: formData.manufacture,
        oempn: formData.oemPN,
        ourpn: formData.ourPN,
        type: formData.type,
        notes: formData.notes,
      };

      console.log("Payload:", payload);

      if (id) {
        await updateCrossRef(id, payload);

        toast.success("Cross ref updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      } else {
        // await addCode(payload);
        // toast.success("Cross reference added successfully!", {
        //   position: "top-right",
        //   autoClose: 3000,
        //   style: { zIndex: 9999999999, marginTop: "4rem" },
        // });
      }

      navigate("/cross");
    } catch (error) {
      console.error("Error saving code:", error);

      toast.error("Failed to save cross ref.", {
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
            <label className="font-medium mb-2 block text-gray-500">Product</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={formData.product}
              onChange={(e) => handleChange("product", e.target.value)}
            />
          </div>

          <div>
            <label className="font-medium mb-2 block text-gray-500">Manufacture</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={formData.manufacture}
              onChange={(e) => handleChange("manufacture", e.target.value)}
            />
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
              required
            />
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
              required
            />
          </div>
          <div>
            <label className="font-medium mb-2 block text-gray-500">
              Type<span className="text-red-500">*</span>
            </label>
            <Select
              options={TypeOptions}
              value={TypeOptions.find(option => option.value === formData.type)}
              onChange={(selected: SingleValue<Option>) =>
                handleChange("type", selected ? selected.value : "")
              }
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
            required
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
