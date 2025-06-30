import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useNavigate, useParams } from "react-router";
import {
  addBusinessLine,
  editBusinessLine,
  getBusinessLineById,
} from "../../services/apis";
import { toast } from "react-toastify";

interface BelongToOption {
  value: string;
  label: string;
  checked: boolean;
}
export const AddUpdateBusiness: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const backInfo = { title: "Business Line", path: "/businessLine" };

  const [formData, setFormData] = useState({
    chineseName: "",
    englishCode: "",
  });

  const [errors, setErrors] = useState({
    chineseName: "",
    englishCode: "",
  });

  const [belongToOptions, setBelongToOptions] = useState<BelongToOption[]>([
    // { value: "OE", label: "comic.com", checked: false },
    // { value: "PU", label: "oenticparts.com", checked: false },
    // { value: "LD", label: "payless2.com", checked: false },
    // { value: "VD", label: "usherdepart.com", checked: false },
    // { value: "NG", label: "ngapio.com", checked: false },
    // { value: "WD", label: "webheaddepart.com", checked: false },
    // { value: "PE", label: "pcconsultibal.com", checked: false },
    // { value: "CN", label: "valvet32.com", checked: false },
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
    if (id) {
      fetchBusinessLineData(id);
    }
  }, [id]);

  const fetchBusinessLineData = async (businessId: string) => {
    try {
      const res = await getBusinessLineById(businessId);
      const data = res.data?.data;

      if (!data) return;

      setFormData({
        chineseName: data.chinese_name || "",
        englishCode: data.english_name || "",
      });

      const selectedValues =
        typeof data.web === "string" ? data.web.split(",") : [];

      setBelongToOptions((prev) =>
        prev.map((option) => ({
          ...option,
          checked: selectedValues.includes(option.value),
        }))
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // Clear error on change
  };

  const handleCheckboxChange = (value: string) => {
    setBelongToOptions((prev) =>
      prev.map((option) =>
        option.value === value
          ? { ...option, checked: !option.checked }
          : option
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      chineseName:
        formData.chineseName.trim() === ""
          ? "The chinese name field is required."
          : "",
      englishCode:
        formData.englishCode.trim() === ""
          ? "The english name field is required."
          : "",
    };

    setErrors(newErrors);

    if (newErrors.chineseName || newErrors.englishCode) return;

    const selectedValues = belongToOptions
      .filter((option) => option.checked)
      .map((option) => option.value)
      .join(",");

    const payload = {
      chinese_name: formData.chineseName,
      english_name: formData.englishCode,
      web: selectedValues,
    };

    try {
      if (id) {
        await editBusinessLine(id, payload);
        toast.success(" Business line updated successfully!!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      } else {
        await addBusinessLine(payload);
        toast.success("Business line created successfully", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      }
      navigate("/businessLine");
    } catch (error: any) {
      console.error("Submit error:", error);

      toast.error("Unknown error occurred.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="container mx-auto p-6 rounded">
      <h1 className="text-2xl font-bold mb-4">
        <PageBreadcrumb
          pageTitle={id ? "Edit Business Line" : "Add New Business Line"}
          backInfo={backInfo}
        />
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg shadow"
      >
        <h3 className="text-xl font-semibold mb-3">Details</h3>
        <hr className="border-t border-gray-300 mb-2" />

        {/* Belong To */}
        <div>
          <label className="font-medium mb-2 block">Belong To</label>
          <div className="grid grid-cols-2 gap-2">
            {belongToOptions.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`belong-to-${option.value}`}
                  checked={option.checked}
                  onChange={() => handleCheckboxChange(option.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={`belong-to-${option.value}`}
                  className="ml-2 text-sm text-gray-900"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Chinese Name */}
        <div>
          <label className="font-medium mb-2 block">
            Chinese Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`w-full border p-2 rounded ${
              errors.chineseName ? "border-red-500" : ""
            }`}
            value={formData.chineseName}
            onChange={(e) => handleChange("chineseName", e.target.value)}
          />
          {errors.chineseName && (
            <p className="text-red-500 text-sm mt-1">{errors.chineseName}</p>
          )}
        </div>

        {/* English Code */}
        <div>
          <label className="font-medium mb-2 block">
            English Code<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`w-full border p-2 rounded ${
              errors.englishCode ? "border-red-500" : ""
            }`}
            value={formData.englishCode}
            onChange={(e) => handleChange("englishCode", e.target.value)}
          />
          {errors.englishCode && (
            <p className="text-red-500 text-sm mt-1">{errors.englishCode}</p>
          )}
        </div>

        {/* Action Buttons */}
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
            {id ? "Update" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};
