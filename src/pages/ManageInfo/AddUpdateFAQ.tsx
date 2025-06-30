import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useParams } from "react-router";
import Select from "react-select";
import { Button } from "@mui/material";
import {
  getDepartment,
  addFaq,
  getFaqById,
  updateFaq,
} from "../../services/apis";
import { toast } from "react-toastify";

interface CompanyOption {
  value: string;
  label: string;
  checked: boolean;
}
interface Option {
  value: string;
  label: string;
}

const FAQ_TYPE_OPTIONS = [
  { value: "general", label: "General" },
  { value: "technical", label: "Technical" },
  { value: "accounting", label: "Accounting" },
  { value: "hr", label: "HR" },
];

const LEVEL_OPTIONS = [
  { value: "all", label: "All" },
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "employee", label: "Employee" },
];

export const AddUpdateFAQ: React.FC = () => {
  const { id } = useParams();
  const [departmentOptions, setDepartmentOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    question: "",
    type: "",
    open_to: "all",
    opentodep: [] as string[],
    opentocompany: [] as string[],
    answer: "",
  });

  const validateForm = () => {
    if (!formData.open_to) {
      toast.error("Please select 'Open To Level'.", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
      return false;
    }

    if (!formData.type) {
      toast.error("Please select 'Type'.", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
      return false;
    }

    return true;
  };

  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([
    { value: "Azizin Financial", label: "Azizin Financial", checked: false },
    {
      value: "Boston Llande Petroleum Machinery LTD",
      label: "Boston Llande Petroleum Machinery LTD",
      checked: false,
    },
    {
      value: "Bazhou Shida Hongsheng",
      label: "Bazhou Shida Hongsheng",
      checked: false,
    },
    {
      value: "BlackGold Equipment LLC",
      label: "BlackGold Equipment LLC",
      checked: false,
    },
  ]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    fetchDepartments();
    if (id) {
      fetchFaqData(id);
    }
  }, [id]);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await getDepartment();
      const departments = response.data.data.map((department: any) => ({
        value: department.id.toString(),
        label: department.name,
      }));
      setDepartmentOptions(departments);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
    setLoading(false);
  };

  const fetchFaqData = async (faqId: string) => {
    try {
      setLoading(true);
      const response = await getFaqById(faqId);
      const data = response.data.data;

      // Convert comma-separated strings to arrays
      const departments = data.opentodep ? data.opentodep.split(',') : [];
      const companies = data.opentocompany ? data.opentocompany.split(',') : [];

      setFormData({
        question: data.question || "",
        type: data.type || "",
        open_to: data.open_to || "all",
        opentodep: departments,
        opentocompany: companies,
        answer: data.answer || "",
      });

      // Update company checkboxes
      setCompanyOptions((prevOptions) =>
        prevOptions.map((option) => ({
          ...option,
          checked: companies.includes(option.value),
        }))
      );
    } catch (error) {
      console.error("Error fetching FAQ data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyChange = (value: string) => {
    setCompanyOptions((prevOptions) =>
      prevOptions.map((option) =>
        option.value === value
          ? { ...option, checked: !option.checked }
          : option
      )
    );

    setFormData((prev) => {
      const newCompanies = prev.opentocompany.includes(value)
        ? prev.opentocompany.filter((v) => v !== value)
        : [...prev.opentocompany, value];
      return { ...prev, opentocompany: newCompanies };
    });
  };

  const handleDepartmentChange = (selectedOptions: any) => {
    const selectedValues = selectedOptions
      ? selectedOptions.map((option: Option) => option.value)
      : [];
    handleChange("opentodep", selectedValues);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        question: formData.question,
        type: formData.type,
        open_to: formData.open_to,
        opentodep: formData.opentodep.join(','), // Convert array to comma-separated string
        opentocompany: formData.opentocompany.join(','), // Convert array to comma-separated string
        ...(id && { id }),
      };

      if (id) {
        await updateFaq(payload);
      } else {
        await addFaq(payload);
      }

      toast.success(`FAQ ${id ? "updated" : "added"} successfully!`, {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });

      window.history.back();
    } catch (error) {
      console.error("Error submitting FAQ:", error);
    } finally {
      setLoading(false);
    }
  };

  const backInfo = { title: "FAQ", path: "/faq" };

  return (
    <div className="container mx-auto p-6 rounded">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <h1 className="text-2xl font-bold mb-4">
        <PageBreadcrumb
          pageTitle={id ? "Edit FAQ" : "Add FAQ"}
          backInfo={backInfo}
        />
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg shadow"
      >
        <h3 className="text-xl font-semibold mb-3">Details</h3>
        <hr className="border-t border-gray-300 mb-2" />

        <div>
          <label className="font-medium mb-2 block">
            Open To Level :<span className="text-red-500">*</span>
          </label>
          <Select
            options={LEVEL_OPTIONS}
            value={LEVEL_OPTIONS.find((opt) => opt.value === formData.open_to)}
            onChange={(selected) =>
              handleChange("open_to", (selected as Option).value)
            }
            className="basic-single"
            classNamePrefix="select"
            isDisabled={loading}
          />
        </div>

        <div className="mt-4">
          <label className="font-medium mb-2 block">Open To Department :</label>
          <Select
            options={departmentOptions}
            value={departmentOptions.filter(opt => 
              formData.opentodep.includes(opt.value)
            )}
            onChange={handleDepartmentChange}
            isMulti
            placeholder="Select department..."
            className="basic-multi-select"
            classNamePrefix="select"
            isDisabled={loading}
          />
        </div>

        <div className="mt-4">
          <label className="font-medium mb-2 block">Open To Company :</label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {companyOptions.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  name="opentocompany"
                  id={`company-${option.value}`}
                  checked={option.checked}
                  onChange={() => handleCompanyChange(option.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <label
                  htmlFor={`company-${option.value}`}
                  className="ml-2 block text-sm text-gray-900"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="font-medium mb-2 block">
            Type :<span className="text-red-500">*</span>
          </label>
          <Select
            options={FAQ_TYPE_OPTIONS}
            value={FAQ_TYPE_OPTIONS.find((opt) => opt.value === formData.type)}
            onChange={(selected) =>
              handleChange("type", (selected as Option).value)
            }
            placeholder="Choose the type of the FAQ"
            className="basic-single"
            classNamePrefix="select"
            isDisabled={loading}
          />
        </div>

        <div className="mt-4">
          <label className="font-medium mb-2 block">Question:</label>
          <textarea
            className="w-full border p-2 rounded"
            rows={4}
            value={formData.question}
            onChange={(e) => handleChange("question", e.target.value)}
            placeholder="Enter your question here..."
            disabled={loading}
          />
        </div>

        <div className="flex justify-end mb-1 mt-2 gap-4">
          <Button
            variant="outlined"
            className="bg-pink-300"
            onClick={() => window.history.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {id ? "Update" : "Add Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
};