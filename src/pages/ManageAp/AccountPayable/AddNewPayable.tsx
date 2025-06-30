import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import Select from "react-select";
import { useNavigate, useParams } from "react-router";
import { useState, useEffect } from "react";
import {
  addAccountPayable,
  getAccountPayableDataById,
  getAllCategory,
  getAllCompanies,
  getAllUsers,
  updateAccountPayable,
} from "../../../services/apis";
import { toast } from "react-toastify";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import moment from "moment";
export const AddNewPayable = () => {
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  let navigate = useNavigate();
  const { id } = useParams();
  console.log("Received ID:", id);
  const [loading, setLoading] = useState(false);

  const [companyOptions, setCompanyOptions] = useState([]);
  const getOptionByValue = (options: any[], value: any) =>
    options.find((opt) => opt.value === Number(value)) || null;

  const [formData, setFormData] = useState({
    id: 0,
    user_id: 0,
    company_id: 0,
    company_code: "",
    po: "",
    vendor_id: 0,
    vendor_invoice: "",
    invoice_value: 0,
    include_tax: 0,
    invoice_date: "",
    due_date: "",
    check_number: "",
    pay_date: "",
    double_checker: 0,
    purchaser: 0,
   opento: " ",
    status: 0,
    if_paid: 0,
    left_pay: 0,
    freight_fee: 0,
    pay_for: "",
    category_id: 0,
    notes: "",
    verify_uid: 0,
    app_uid: 0,
    invoice_file: "",
    invoice_received: "",
    debtted: 0,
    debtted_user: 0,
    debtted_date: "",
    so: "",
    verify_date: "",
    if_app: 0,
    app_date: "",
    app_notes: "",
  });
  const [errors, setErrors] = useState({
    company_id: "",
    so: "",
    vendor_id: "",
    vendor_invoice: "",
    invoice_value: "",
    include_tax: "",
    invoice_date: "",
    due_date: "",
    category_id: "",
    double_checker: "",
    purchaser: "",
  });

  const backInfo = { title: "Account Payable", path: "/accountPayable" };
  const handleChange = (name: keyof typeof formData, value: string | null) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value ?? "",
    }));

    // Clear error when field is changed
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };
  // const handleSelectChange = (
  //   name: keyof typeof formData,
  //   selectedOption: any
  // ) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: selectedOption?.value ?? "",
  //   }));

  //   // Clear error when field is changed
  //   if (errors[name as keyof typeof errors]) {
  //     setErrors((prev) => ({
  //       ...prev,
  //       [name]: "",
  //     }));
  //   }
  // };

const handleSelectChange = (
  name: keyof typeof formData,
  selectedOption: any
) => {
  const isOpento = name === "opento";

  const value = isOpento
    ? selectedOption.map((opt: any) => opt.value).join(",")
    : selectedOption?.value ?? "";

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));

  if (errors[name as keyof typeof errors]) {
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }
};
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      company_id: "",
      so: "",
      vendor_id: "",
      vendor_invoice: "",
      invoice_value: "",
      include_tax: "",
      invoice_date: "",
      due_date: "",
      category_id: "",
      double_checker: "",
      purchaser: "",
    };
    // Validate each required field
    if (!formData.company_id) {
      newErrors.company_id = "The who pay field is required.";
      isValid = false;
    }
    if (!formData.so) {
      newErrors.so = "The so number field is required.";
      isValid = false;
    }
    if (!formData.vendor_id) {
      newErrors.vendor_id = "The pay to field is required.";
      isValid = false;
    }
    if (!formData.vendor_invoice) {
      newErrors.vendor_invoice = "The vendor invoice field is required.";
      isValid = false;
    }
    if (!formData.invoice_value) {
      newErrors.invoice_value = "The invoice value field is required.";
      isValid = false;
    }
    if (!formData.include_tax) {
      newErrors.include_tax = "The included tax field is required.";
      isValid = false;
    }
    if (!formData.invoice_date) {
      newErrors.invoice_date = "The invoice date field is required.";
      isValid = false;
    }
    if (!formData.due_date) {
      newErrors.due_date = "The due date field is required.";
      isValid = false;
    }
    if (!formData.category_id) {
      newErrors.category_id = "The category field is required.";
      isValid = false;
    }
    if (!formData.double_checker) {
      newErrors.double_checker = "The double check person field is required.";
      isValid = false;
    }
    if (!formData.purchaser) {
      newErrors.purchaser = "The purchase man field is required.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };
  // for autogenerate PO number

  const generatePoNumber = () => {
    const middle = Math.random().toString(36).substring(2, 7).toUpperCase(); // 5 random alphanumeric
    return `P25${middle}`;
  };

  useEffect(() => {
    const user_id = localStorage.getItem("Sql_id");
    console.log("User ID from localStorage:", user_id);
    if (user_id) {
      setFormData((prev) => ({ ...prev, user_id: Number(user_id) }));
    }

    if (!id) {
      const po = generatePoNumber();
      setFormData((prev) => ({ ...prev, po: po }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("Form submitted", formData);
     

      try {
        if (id) {
          await updateAccountPayable(formData.id, formData);
          toast.success("Account payable updated successfully", {
            position: "top-right",
            autoClose: 3000,
            style: { zIndex: 9999999999, marginTop: "4rem" },
          });
        } else {
          const { id, ...dataToSend } = formData;
          console.log("Final payload:", dataToSend);
  await addAccountPayable(dataToSend);
          // await addAccountPayable(formData);
          toast.success("Account payable added successfully!", {
            position: "top-right",
            autoClose: 3000,
            style: { zIndex: 9999999999, marginTop: "4rem" },
          });
        }
        navigate("/accountPayable");
      } catch (error: any) {
        console.error("Submit error:", error);
        toast.error(
          error?.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      }
    }
  };

  useEffect(() => {
    getAllTitlesCompany();
    getAllCategoryData();
    getAllUserData();
  }, []);

  const getAllTitlesCompany = async () => {
    setLoading(true);
    try {
      const response = await getAllCompanies(); // API call

      const options = response.data.data.map((company: any) => ({
        value: company.id,
        label: company.name,
        // code: company.code
      }));

      setCompanyOptions(options);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  // const handleSelectChange = (field, selected) => {
  //   // Example handler logic
  //   console.log(`${field} selected:`, selected);
  //   // You can update form state here (e.g., using react-hook-form or your own state)
  // };
  const getAllCategoryData = async () => {
    setLoading(true);
    try {
      const response = await getAllCategory();
      console.log("Fetched Category Data:", response.data.data);

      // Filter out deleted or inactive categories (optional)
      const activeCategories = response.data.data.filter(
        (category1: any) =>
          category1.deleted_at === null && category1.active_status
      );

      const options = activeCategories.map((category1: any) => ({
        value: category1.id,
        label: category1.name,
      }));

      setCategoryOptions(options);
    } catch (error) {
      console.error("Error fetching category data:", error);
    }
    setLoading(false);
  };

  const getAllUserData = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      console.log("Fetched User Data:", response.data.data);

      const formattedUsers = response.data.data.map((user: any) => ({
        value: user.id,
        label: user.name,
      }));

      setUserOptions(formattedUsers);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getAccountPayableDataById(id)
        .then((response) => {
          const data = response.data.data; // ✅ this is the fix

          // const getOptionByValue = (options: any, value: any) =>
          //   options.find((opt: any) => opt.value === value) || null;
          //       const getOptionByValue = (options: any, value: any) =>
          // options.find((opt: any) => opt.value === Number(value)) || null;

          setFormData({
            id: data.id,
            user_id: Number(data.user_id) || 0,
            company_id: Number(data.company_id) || 0,
            vendor_id: Number(data.vendor_id) || 0,
            category_id: Number(data.category_id) || 0,
            double_checker: Number(data.double_checker) || 0,
            purchaser: Number(data.purchaser) || 0,
            opento: data.opento || "",
            company_code: data.company_code || "",
            status: Number(data.status) || 0,
            po: data.po || "",
            so: data.so || "",
            vendor_invoice: data.vendor_invoice || "",
            invoice_value: Number(data.invoice_value) || 0,
            include_tax: Number(data.include_tax) || 0,
            invoice_date: data.invoice_date?.slice(0, 10) || "",
            invoice_received: data.invoice_received?.slice(0, 10) || "",
            due_date: data.due_date?.slice(0, 10) || "",
            check_number: data.check_number || "",
            pay_date: data.pay_date?.slice(0, 10) || "",
            pay_for: data.pay_for || "",
            notes: data.notes || "",
            if_paid: Number(data.if_paid) || 0,
            left_pay: Number(data.left_pay) || 0,
            freight_fee: Number(data.freight_fee) || 0,
            app_notes: data.app_notes || "",
            app_date: data.app_date?.slice(0, 10) || "",
            if_app: Number(data.if_app) || 0,
            verify_date: data.verify_date?.slice(0, 10) || "",
            debtted_date: data.debtted_date?.slice(0, 10) || "",
            debtted_user: Number(data.debtted_user) || 0,
            debtted: Number(data.debtted) || 0,
            verify_uid: Number(data.verify_uid) || 0,
            app_uid: Number(data.app_uid) || 0,
            invoice_file: data.invoice_file || "",
          });
        })
        .catch((error) => {
          console.error("Error fetching account payable data:", error);
          toast.error("Failed to fetch account payable data");
        });
    }
  }, [id, userOptions, companyOptions, categoryOptions]);

  return (
    <div>
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <PageBreadcrumb
        pageTitle={id ? "Update Account Payable" : "New Account Payable"}
        backInfo={backInfo}
      />
      <ComponentCard title="New Account Payable">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 text-gray-800 dark:text-white/90"
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <div className="flex flex-col w-full">
              <label htmlFor="company_id" className="font-medium mb-2">
                Who Pay <span className="text-red-500">*</span>
              </label>
              <Select
                options={companyOptions}
                id="company_id"
                value={getOptionByValue(companyOptions, formData.company_id)}
                onChange={(selected) =>
                  handleSelectChange("company_id", selected)
                }
                className={`w-full border rounded ${
                  errors.company_id ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.company_id && (
                <p className="text-red-500 text-sm mt-1">{errors.company_id}</p>
              )}
            </div>
            <div className="flex flex-col w-full">
              <label htmlFor="poNumber" className="font-medium mb-2">
                PO number
              </label>
              <input
                id="poNumber"
                type="text"
                className="w-full border p-2 rounded bg-gray-200 border-gray-300"
                readOnly
                value={formData.po}
                onChange={(e) => handleChange("po", e.target.value)}
              />
            </div>

            <div className="flex flex-col w-full">
              <label htmlFor="so" className="font-medium mb-2">
                SO number<span className="text-red-500">*</span>
              </label>
              <input
                id="so"
             type="text"
                placeholder="Enter So number"
                className={`w-full border rounded p-2 ${
                  errors.so ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.so}
                onChange={(e) => handleChange("so", e.target.value)}
              />
              {errors.so && (
                <p className="text-red-500 text-sm mt-1">{errors.so}</p>
              )}
            </div>
            <div className="flex flex-col w-full">
              <label htmlFor="vendor_id" className="font-medium mb-2">
                Pay To <span className="text-red-500">*</span>
              </label>
              <Select
                options={companyOptions}
                id="vendor_id"
                value={getOptionByValue(companyOptions, formData.vendor_id)}
                onChange={(selected) =>
                  handleSelectChange("vendor_id", selected)
                }
                className={`w-full border rounded ${
                  errors.vendor_id ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.vendor_id && (
                <p className="text-red-500 text-sm mt-1">{errors.vendor_id}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-x-4 gap-y-6">
            <div className="flex flex-col w-full">
              <label htmlFor="vendor_invoice" className="font-medium mb-2">
                Vendor Invoice# <span className="text-red-500">*</span>
              </label>
              <input
                id="vendor_invoice"
             type="text"
                placeholder="Enter Vendor Invoice"
                className={`w-full border rounded p-2 ${
                  errors.vendor_invoice ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.vendor_invoice}
                onChange={(e) => handleChange("vendor_invoice", e.target.value)}
              />
              {errors.vendor_invoice && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.vendor_invoice}
                </p>
              )}
            </div>
            <div className="flex flex-col w-full">
              <label htmlFor="invoiceValue" className="font-medium mb-2">
                Invoice Value($) <span className="text-red-500">*</span>
              </label>
              <input
                id="invoice_value"
                type="number"
                placeholder="Enter Invoice Value"
                className={`w-full border rounded p-2 ${
                  errors.invoice_value ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.invoice_value}
                onChange={(e) => handleChange("invoice_value", e.target.value)}
              />
              {errors.invoice_value && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.invoice_value}
                </p>
              )}
            </div>
            <div className="flex flex-col w-full">
              <label htmlFor="include_tax" className="font-medium mb-2">
                Included Tax($) <span className="text-red-500">*</span>
              </label>
              <input
                id="include_tax"
                type="number"
                placeholder="Enter Inclueded Tax"
                className={`w-full border rounded p-2 ${
                  errors.include_tax ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.include_tax}
                onChange={(e) => handleChange("include_tax", e.target.value)}
              />
              {errors.include_tax && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.include_tax}
                </p>
              )}
            </div>

            <div className="flex flex-col w-full">
              <label htmlFor="invoiceDate" className="font-medium mb-2">
                Invoice Date <span className="text-red-500">*</span>
              </label>
              <Flatpickr
                id="invoiceDate"
                options={{
                  dateFormat: "Y-m-d",
                  allowInput: true,
                }}
                className={`w-full border rounded p-2 ${
                  errors.invoice_date ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.invoice_date}
                onChange={(dates: Date[]) => {
                  if (dates.length > 0) {
                    handleChange(
                      "invoice_date",
                      moment(dates[0]).format("YYYY-MM-DD")
                    );
                  }
                }}
                placeholder="select Date"
              />
              {errors.invoice_date && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.invoice_date}
                </p>
              )}
            </div>
            <div className="flex flex-col w-full">
              <label htmlFor="invoice_received" className="font-medium mb-2">
                Invoice Received
              </label>
              <Flatpickr
                id="invoice_received"
                options={{
                  dateFormat: "Y-m-d",
                  allowInput: true,
                }}
                className="w-full border p-2 rounded"
                value={formData.invoice_received}
                onChange={(dates: Date[]) => {
                  if (dates.length > 0) {
                    handleChange(
                      "invoice_received",
                      moment(dates[0]).format("YYYY-MM-DD")
                    );
                  }
                }}
                placeholder="Select Date"
              />
            </div>
            <div className="flex flex-col w-full">
              <label htmlFor="due_date" className="font-medium mb-2">
                Due Date <span className="text-red-500">*</span>
              </label>
              <Flatpickr
                id="due_date"
                options={{
                  dateFormat: "Y-m-d",
                  allowInput: true,
                 
                }}
                 className={`w-full border rounded p-2 ${
                  errors.due_date ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.due_date}
                onChange={(dates: Date[]) => {
                  if (dates.length > 0) {
                    handleChange(
                      "due_date",
                      moment(dates[0]).format("YYYY-MM-DD")
                    );
                  }
                }}
                placeholder="select Date"
              />
              {errors.due_date && (
                <p className="text-red-500 text-sm mt-1">{errors.due_date}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-4 gap-y-6">
            <div className="flex flex-col w-full">
              <label htmlFor="check_number" className="font-medium mb-2">
                Our Check#
              </label>
              <input
                id="ourCheck"
                type="text"
                className="w-full border p-2 rounded"
                placeholder="Enter Our Check..."
                value={formData.check_number}
                onChange={(e) => handleChange("check_number", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <div className="flex flex-col w-full">
              <label htmlFor="paidDate" className="font-medium mb-2">
                Paid Date
              </label>
              <Flatpickr
                id="paidDate"
                options={{
                  dateFormat: "Y-m-d",
                  allowInput: true,
                  maxDate: "today", // Optional: prevent selecting future dates
                }}
                className="w-full border p-2 rounded"
                value={formData.pay_date}
                onChange={(dates: Date[]) => {
                  if (dates.length > 0) {
                    handleChange(
                      "pay_date",
                      moment(dates[0]).format("YYYY-MM-DD")
                    );
                  }
                }}
                placeholder="select Date"
              />
            </div>
            <div className="flex flex-col w-full">
              <label htmlFor="paidForWhat" className="font-medium mb-2">
                Paid For What
              </label>
              <input
                id="paidForWhat"
                type="text"
                className="w-full border p-2 rounded"
                placeholder="Enter Paid for What...."
                value={formData.pay_for}
                onChange={(e) => handleChange("pay_for", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-x-4 gap-y-6">
            <div className="flex flex-col w-full">
              <label htmlFor="category" className="font-medium mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <Select
                options={categoryOptions}
                id="category_id"
                value={getOptionByValue(categoryOptions, formData.category_id)}
                onChange={(selected) =>
                  handleSelectChange("category_id", selected)
                }
                className={`w-full border rounded ${
                  errors.category_id ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.category_id && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.category_id}
                </p>
              )}
            </div>
            <div className="flex flex-col w-full">
              <label htmlFor="doubleCheckPerson" className="font-medium mb-2">
                Double Check Person <span className="text-red-500">*</span>
              </label>
              <Select
                id="doubleCheckPerson"
                options={userOptions}
                value={getOptionByValue(userOptions, formData.double_checker)}
                onChange={(selected) =>
                  handleSelectChange("double_checker", selected)
                }
                className={`w-full border rounded ${
                  errors.double_checker ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.double_checker && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.double_checker}
                </p>
              )}
            </div>
            <div className="flex flex-col w-full">
              <label htmlFor="purchaseMan" className="font-medium mb-2">
                Purchase Man <span className="text-red-500">*</span>
              </label>
              <Select
                id="purchaseMan"
                options={userOptions}
                value={getOptionByValue(userOptions, formData.purchaser)}
                placeholder="Sales No.1 (admin)"
                onChange={(selected) =>
                  handleSelectChange("purchaser", selected)
                }
                className={`w-full border rounded ${
                  errors?.purchaser ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors?.purchaser && (
                <p className="text-red-500 text-sm mt-1">{errors.purchaser}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <div className="flex flex-col w-full">
              <label htmlFor="notes" className="font-medium mb-2">
                Notes
              </label>
              <input
                id="notes"
                type="text"
                placeholder="Enter Notes..."
                className="w-full border p-2 rounded"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            </div>
<div className="flex flex-col w-full">
  <label htmlFor="openTo" className="font-medium mb-2">
    Open To
  </label>
 <Select
  id="openTo"
  isMulti
  value={userOptions.filter((opt) =>
    formData.opento.split(",").map((v) => v.trim()).includes(String(opt.value))
  )}
  options={userOptions}
  placeholder="Select persons"
  onChange={(selectedOptions) => handleSelectChange("opento", selectedOptions)}
  className="w-full border rounded border-gray-300"
/>
</div>
          </div>
          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};
