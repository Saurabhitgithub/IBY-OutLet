import Select, { SingleValue, MultiValue } from "react-select";
import React, { useEffect, useState } from "react";
import Flatpickr from "react-flatpickr";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { Button } from "@mui/material";
import {
  getAllCategory,
  getAllSubCategoryByCategoryId,
  getAllUsers,
  addProblem,
} from "../../../services/apis";
import { toast } from "react-toastify";

interface Option {
  value: string;
  label: string;
}

export const AddProblems: React.FC = () => {
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
  const [openToOptions, setOpenToOptions] = useState<Option[]>([]);
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subCategoryOptions, setSubCategoryOptions] = useState<Option[]>([]);

  const [formData, setFormData] = useState({
    occure_date: "",
    finder: null as Option | null,
    category: null as Option | null,
    subcategory: null as Option | null,
    problemtype: "",
    details: "",
    result: "",
    opento: [] as Option[],
  });

  const validate = () => {
    const newErrors: any = {};

    if (!formData.occure_date)
      newErrors.occure_date = "The occure date field is required.";
    if (!formData.finder) newErrors.finder = "The finder field is required";
    if (!formData.category)
      newErrors.category = "The category field is required.";

    if (subCategoryOptions.length > 0 && !formData.subcategory) {
      newErrors.subCategory = "The subcategory field is required";
    }

    return newErrors;
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getAllCategory();
      if (res?.data?.data) {
        const options = res.data.data.map((cat: any) => ({
          value: cat.id,
          label: cat.name,
          raw: cat,
        }));
        setCategoryOptions(options);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchSubCategories = async () => {
      setLoading(true);
      if (!formData.category) {
        setSubCategoryOptions([]);
        setFormData((prev) => ({ ...prev, subcategory: null }));
        return;
      }
      try {
        const res = await getAllSubCategoryByCategoryId(
          formData.category.value
        );
        if (res?.data?.data) {
          const options = res.data.data.map((sub: any) => ({
            value: sub.id,
            label: sub.name,
          }));
          setSubCategoryOptions(options);
        } else {
          setSubCategoryOptions([]);
          setFormData((prev) => ({ ...prev, subcategory: null })); // Reset subcategory
        }
      } catch (error) {
        setSubCategoryOptions([]);
        setFormData((prev) => ({ ...prev, subcategory: null })); // Reset subcategory
        console.error("Failed to fetch subcategories", error);
      }
      setLoading(false);
    };
    fetchSubCategories();
  }, [formData.category]);
  const fetchOpenTo = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      if (res?.data?.data) {
        const options = res.data.data.map((user: any) => ({
          value: user.id,
          label: user.name,
        }));
        setOpenToOptions(options);
      }
    } catch (error) {
      console.error("Failed to fetch open to options", error);
    }
    setLoading(false);
  };

  const navigate = useNavigate();

  const handleChange = (
    name: keyof typeof formData,
    value: string | boolean | Option | null | Option[]
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[DEBUG] Form submission started"); // Debug log

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      console.log("[DEBUG] Validation errors:", validationErrors); // Debug log
      return;
    }

    setIsSubmitting(true);
    console.log("[DEBUG] Starting API call"); // Debug log

    try {
      const typeValue =
        formData.problemtype === "Found By Customer"
          ? 1
          : formData.problemtype === "Found Before Producing"
            ? 2
            : formData.problemtype === "Found By Self-checking"
              ? 3
              : 0;

      const payload = {
        occure_date: formData.occure_date,
        finder: formData.finder?.value || "",
        category_id: formData.category?.value || "",
        sub_category_id: subCategoryOptions.length > 0
          ? formData.subcategory?.value || ""
          : "",
        type: typeValue,
        details: formData.details,
        result: formData.result,
        opento: formData.opento.map((option) => option.value).join(","),
      };

      // console.log("[DEBUG] Payload:", payload);

      const response = await addProblem(payload);
      // console.log("[DEBUG] API Response:", response);

      toast.success("Problem added successfully!", {
        position: "top-right",
        autoClose: 3000,
        style: {
          zIndex: 99999999, // ensures it appears above all elements
          marginTop: "4rem", // gives vertical space from top
        },
      });

      console.log("[DEBUG] After showing success toast");
      navigate("/problems");
    } catch (error: any) {
      console.error("[ERROR] Submission error:", error);

      toast.error(
        `Failed: ${error?.response?.data?.message || error.message}`,
        {
          position: "top-right",
          autoClose: 3000,
          style: {
            zIndex: 99999999, // ensures it appears above all elements
            marginTop: "4rem", // gives vertical space from top
          },
        }
      );

      console.log("[DEBUG] After showing error toast");
    } finally {
      setIsSubmitting(false);
      console.log("[DEBUG] Form submission completed");
    }
  };

  useEffect(() => {
    fetchOpenTo();
    fetchCategories();
  }, []);

  const backInfo = { title: "Problems", path: "/problems" };

  return (
    <div className="container mx-auto p-6 rounded">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <div>
        <PageBreadcrumb pageTitle="Add Problem" backInfo={backInfo} />
      </div>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg"
      >
        <h3 className="text-xl font-semibold mb-3 text-gray-500">Details</h3>
        <hr className="border-t border-gray-300 mb-3" />

        {/* Form fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Occur Date <span className="text-red-500">*</span>
            </label>
            <Flatpickr
              value={formData.occure_date}
              onChange={(dates) => {
                // Flatpickr returns array of dates, take first or empty string
                handleChange(
                  "occure_date",
                  dates.length ? dates[0].toISOString().split("T")[0] : ""
                );
              }}
              options={{ dateFormat: "Y-m-d" }}
              placeholder="Select Occur Date"
              className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {errors.occure_date && (
              <span className="text-red-500 text-xs">{errors.occure_date}</span>
            )}
          </div>

          <div>
            <label className="font-medium mb-2 text-gray-500">
              Finder <span className="text-red-500">*</span>
            </label>
            <Select
              options={openToOptions}
              value={formData.finder}
              onChange={(selected: SingleValue<Option>) =>
                handleChange("finder", selected)
              }
            />
            {errors.finder && (
              <span className="text-red-500 text-xs">{errors.finder}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Category<span className="text-red-500">*</span>
            </label>
            <Select
              options={categoryOptions}
              value={formData.category}
              onChange={(selected: SingleValue<Option>) => {
                handleChange("category", selected);
                handleChange("subcategory", null); // Reset subcategory when category changes
              }}
              className="w-full"
              placeholder="Category..."
            />
            {errors.category && (
              <span className="text-red-500 text-xs">{errors.category}</span>
            )}
          </div>
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Sub Category
              {subCategoryOptions.length > 0 && <span className="text-red-500">*</span>}
            </label>
            <Select
              options={subCategoryOptions}
              value={formData.subcategory}
              onChange={(selected: SingleValue<Option>) =>
                handleChange("subcategory", selected)
              }
              className="w-full"
              placeholder={
                subCategoryOptions.length > 0
                  ? "Select subcategory..."
                  : "No subcategories available"
              }
              isDisabled={!formData.category || subCategoryOptions.length === 0}
            />
            {errors.subCategory && (
              <span className="text-red-500 text-xs">{errors.subCategory}</span>
            )}
            {formData.category && subCategoryOptions.length === 0 && (
              <span className="text-gray-500 text-xs">
                This category doesn't have subcategories
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-4 ">
          <label className="font-medium mb-2 block text-gray-500">
            Problem Type
          </label>
          <div>
            <label className="text-gray-500">
              <input
                type="radio"
                name="problemType"
                value="Found By Customer"
                checked={formData.problemtype === "Found By Customer"}
                onChange={(e) => handleChange("problemtype", e.target.value)}
                className="mr-2"
              />
              Found By Customer
            </label>
          </div>

          <div>
            <label className="text-gray-500">
              <input
                type="radio"
                name="problemType"
                value="Found Before Producing"
                checked={formData.problemtype === "Found Before Producing"}
                onChange={(e) => handleChange("problemtype", e.target.value)}
                className="mr-2"
              />
              Found Before Producing
            </label>
          </div>
          <div>
            <label className="text-gray-500">
              <input
                type="radio"
                name="problemType"
                value="Found By Self-checking"
                checked={formData.problemtype === "Found By Self-checking"}
                onChange={(e) => handleChange("problemtype", e.target.value)}
                className="mr-2"
              />
              Found By Self-checking
            </label>
          </div>
        </div>

        <div>
          <label className="font-medium mb-2 block text-gray-500">
            Details<span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border p-2 rounded h-22"
            value={formData.details}
            onChange={(e) => handleChange("details", e.target.value)}
          />
        </div>

        <div>
          <label className="font-medium mb-2 block text-gray-500">
            Result<span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border p-2 rounded h-22"
            value={formData.result}
            onChange={(e) => handleChange("result", e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="openTo" className="font-medium mb-2">
            Open To
          </label>
          <div className="flex gap-3">
            <Select
              inputId="openTo"
              options={openToOptions}
              value={formData.opento}
              onChange={(selected: MultiValue<Option>) =>
                handleChange("opento", selected as Option[])
              }
              className="w-full"
              placeholder="Open to..."
              isMulti
            />
          </div>
          {errors.openTo && (
            <span className="text-red-500 text-xs">{errors.openTo}</span>
          )}
        </div>

        <div className="flex justify-end gap-2 mb-1 mt-2">
          <Button
            variant="outlined"
            className="bg-pink-300"
            onClick={() => navigate("/problems")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button variant="contained" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Add Problem"}
          </Button>
        </div>
      </form>
    </div>
  );
};
