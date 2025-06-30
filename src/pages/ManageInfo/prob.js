import Select, { SingleValue } from "react-select";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { useParams } from "react-router";
import { Button } from "@mui/material";

interface Option {
  value: string;
  label: string;
}

const finderOptions: Option[] = [
  { value: "sales26", label: "sale26" },
  { value: "sales27", label: "sale27" },
  { value: "sales28", label: "sale28" },
  { value: "sales29", label: "sale29" },
  { value: "sales21", label: "sale21" },
  { value: "sales23", label: "sale23" },
];

const categoryOptions: Option[] = [
  { value: "Production Equipement", label: "Production Equipement" },
  { value: "Production tools", label: "Production tools" },
  { value: "production machine", label: "production machine" },
  { value: "productive material", label: "productive mapyrt" },
  { value: "kiuy", label: "kiuy" },
  { value: "spyrt", label: "spyrt" },
];

const subCategoryOptions: Option[] = [
  { value: "pumping unit", label: "pumping unit" },
  { value: "pump materail", label: "pump materail" },
  { value: "gtyru", label: "gtyru" },
  { value: "derki", label: "derki" },
  { value: "potu", label: "potu" },
  { value: "vtruiet", label: "vtruiet" },
];

export const AddProblems: React.FC = () => {
  const [formData, setFormData] = useState({
    occurdate: "",
    finder: null as Option | null,
    category: null as Option | null,
    subcategory: null as Option | null,
    problemtype: "",
    details: "",
    result: "",
    opento: "",
  });

  const [errors, setErrors] = useState({
    occurdate: false,
    finder: false,
    category: false,
    subcategory: false,
  });

  const navigate = useNavigate();
  let { id } = useParams();

  const handleChange = (
    name: keyof typeof formData,
    value: string | Option | null
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const validateForm = () => {
    const newErrors = {
      occurdate: !formData.occurdate.trim(),
      finder: !formData.finder,
      category: !formData.category,
      subcategory: !formData.subcategory,
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form Data:", formData);
      // Submit logic here
    }
  };

  const backInfo = { title: "Problems", path: "/problems" };

  return (
    <div className="container mx-auto p-6 rounded">
      <div>
        <PageBreadcrumb
          pageTitle={id ? "Edit Problem" : "Add Problem"}
          backInfo={backInfo}
        />
      </div>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg"
      >
        <h3 className="text-xl font-semibold mb-3 text-gray-500">Details</h3>
        <hr className="border-t border-gray-300 mb-3" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Occur Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className={`w-full border p-2 rounded ${
                errors.occurdate ? "border-red-500" : ""
              }`}
              value={formData.occurdate}
              onChange={(e) => handleChange("occurdate", e.target.value)}
            />
            {errors.occurdate && (
              <span className="text-sm text-red-500">
               The occure date field is required.
              </span>
            )}
          </div>

          <div>
            <label className="font-medium mb-2 text-gray-500">
              Finder <span className="text-red-500">*</span>
            </label>
            <Select
              options={finderOptions}
              value={formData.finder}
              onChange={(selected) => handleChange("finder", selected)}
              className={errors.finder ? "border border-red-500 rounded" : ""}
            />
            {errors.finder && (
              <span className="text-sm text-red-500">The finder field is required.</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Category <span className="text-red-500">*</span>
            </label>
            <Select
              options={categoryOptions}
              value={formData.category}
              onChange={(selected) => handleChange("category", selected)}
              className={
                errors.category ? "border border-red-500 rounded" : ""
              }
            />
            {errors.category && (
              <span className="text-sm text-red-500">
                The category field is required.
              </span>
            )}
          </div>

          <div>
            <label className="font-medium mb-2 text-gray-500">
              Sub Category <span className="text-red-500">*</span>
            </label>
            <Select
              options={subCategoryOptions}
              value={formData.subcategory}
              onChange={(selected) => handleChange("subcategory", selected)}
              className={
                errors.subcategory ? "border border-red-500 rounded" : ""
              }
            />
            {errors.subcategory && (
              <span className="text-sm text-red-500">
                The sub category field is required.
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <label className="font-medium mb-2 block text-gray-500">
            Problem Type
          </label>
          {["Found By Customer", "Found Before Producing", "Found By Self-checking"].map(
            (type) => (
              <label key={type} className="text-gray-500">
                <input
                  type="radio"
                  name="problemType"
                  value={type}
                  checked={formData.problemtype === type}
                  onChange={(e) => handleChange("problemtype", e.target.value)}
                  className="mr-2"
                />
                {type}
              </label>
            )
          )}
        </div>

        <div>
          <label className="font-medium mb-2 block text-gray-500">
            Details <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border p-2 rounded h-22"
            value={formData.details}
            onChange={(e) => handleChange("details", e.target.value)}
            
          />
        </div>

        <div>
          <label className="font-medium mb-2 block text-gray-500">
            Result <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border p-2 rounded h-22"
            value={formData.result}
            onChange={(e) => handleChange("result", e.target.value)}
          
          />
        </div>

        <div>
          <label className="font-medium mb-2 block text-gray-500">Open To</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            value={formData.opento}
            onChange={(e) => handleChange("opento", e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 mb-1 mt-2">
          <Button variant="outlined" onClick={() => navigate("/problems")}>
            Cancel
          </Button>
          <Button variant="contained" type="submit">
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};
