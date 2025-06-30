import React, { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useParams } from "react-router";
import {
  addStatement,
  getStatementById,
  updateStatement,
} from "../../services/apis";
import { toast } from "react-toastify";

interface BeforeToOption {
  value: string;
  label: string;
  checked: boolean;
}

export const AddUpdateStatement: React.FC = () => {
  const { id } = useParams();

  const [formData, setFormData] = useState({
    title: "",
    text: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState({
    title: "",
    beforeTo: "",
  });

  const [beforeToOptions, setBeforeToOptions] = useState<BeforeToOption[]>([
    // { value: "OE", label: "write.com", checked: false },
    // { value: "PU", label: "ownlogus.com", checked: false },
    // { value: "LD", label: "tap/chat.com", checked: false },
    // { value: "VD", label: "valvebgcd.com", checked: false },
    // { value: "NG", label: "grep.gu.com", checked: false },
    // { value: "WD", label: "weftsalesbgcd.com", checked: false },
    // { value: "PE", label: "personalfield.com", checked: false },
    // { value: "CN", label: "valvet212.com", checked: false },
      { value: "OE", label: "oemic.com", checked: false },
  { value: "PU", label: "oemicparts.com", checked: false },
  { value: "LD", label: "ipayless2.com", checked: false },
  { value: "VD", label: "valvedepot.com", checked: false },
  { value: "NG", label: "ngquip.com", checked: false },
  { value: "WD", label: "wellheaddepot.com", checked: false },
  { value: "PE", label: "pecosoilfield.com", checked: false },
  { value: "CN", label: "valve123.com", checked: false }
  ]);

  useEffect(() => {
    setLoading(true);
    if (id) {
      const fetchData = async () => {
        try {
          const res = await getStatementById(id);
          const { title, text, in_web } = res.data.data;

          setFormData({ title: title, text: text });

          if (in_web) {
            const selectedValues = in_web.split(",");
            setBeforeToOptions((prevOptions) =>
              prevOptions.map((option) => ({
                ...option,
                checked: selectedValues.includes(option.value),
              }))
            );
          }
        } catch (error) {
          console.error("Failed to fetch statement:", error);
        }
      };

      fetchData();
    }
    setLoading(false);
  }, [id]);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (value: string) => {
    setBeforeToOptions((prevOptions) =>
      prevOptions.map((option) =>
        option.value === value
          ? { ...option, checked: !option.checked }
          : option
      )
    );
  };

  const validateForm = () => {
    let isValid = true;
    const errors = { title: "", beforeTo: "" };

    if (!formData.title.trim()) {
      errors.title = "The title field is required";
      isValid = false;
    }

    const hasCheckedBeforeTo = beforeToOptions.some((option) => option.checked);
    if (!hasCheckedBeforeTo) {
      errors.beforeTo = "The before to field is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const inWeb = beforeToOptions
      .filter((option) => option.checked)
      .map((option) => option.value)
      .join(",");

    const payload = {
      title: formData.title,
      text: formData.text,
      in_web: inWeb || "none",
    };

    try {
      if (id) {
        await updateStatement(id, payload);
        toast.success("Statement updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999999999999, marginTop: "4rem" },
        });
      } else {
        await addStatement(payload);
        toast.success("Statement added successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999999999999, marginTop: "4rem" },
        });
      }

      setTimeout(() => {
        window.history.back();
      }, 100); // small delay to show toast before navigation
    } catch (error) {
      console.error("Error submitting statement:", error);
    }
    setLoading(false);
  };

  const backInfo = { title: "Statement", path: "/statement" };

  return (
    <div className="container mx-auto p-6 rounded">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}

        <PageBreadcrumb
          pageTitle={id ? "Edit Statement" : "Add New Statement"}
          backInfo={backInfo}
        />
    

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg shadow"
      >
        <h3 className="text-xl font-semibold mb-3">Details</h3>
        <hr className="border-t border-gray-300 mb-2" />

        {/* Title Field */}
        <div>
          <label className="font-medium mb-2 block">
            Title<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`w-full border p-2 rounded ${
              formErrors.title ? "border-red-500" : "border-gray-300"
            }`}
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
          {formErrors.title && (
            <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
          )}
        </div>

        {/* Before To Field */}
        <div>
          <label className="font-medium mb-2 block">
            Before To<span className="text-red-500">*</span>
          </label>
          <div>
            {beforeToOptions.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`before-to-${option.value}`}
                  checked={option.checked}
                  onChange={() => handleCheckboxChange(option.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={`before-to-${option.value}`}
                  className="ml-2 block text-sm text-gray-900"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
          {formErrors.beforeTo && (
            <p className="text-red-500 text-sm mt-1">{formErrors.beforeTo}</p>
          )}
        </div>

        {/* Text Field */}
        <div>
          <label className="font-medium mb-2 block">Text</label>
          <textarea
            className="w-full border p-2 rounded border-gray-300"
            value={formData.text}
            onChange={(e) => handleChange("text", e.target.value)}
            rows={5}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
            onClick={() => window.history.back()}
          >
            Back
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};
