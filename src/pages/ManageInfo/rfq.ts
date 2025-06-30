import Select, { SingleValue } from "react-select";
import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { useParams } from "react-router";
import { Button } from "@mui/material";
import { useNavigate } from "react-router";
import {
  addRfq,
  getAllCategory,
  getAllContact,
  getAllSubCategory,
  getRfqById,
} from "../../../services/apis";

interface Option {
  value: string;
  label: string;
  raw?: any;
}

const WillOrderWithin: Option[] = [
  { value: "1", label: "Immediately" },
  { value: "2", label: "1-2 days" },
  { value: "3", label: "1 Week" },
  { value: "4", label: "2 week" },
  { value: "5", label: "4 weeks" },
  { value: "6", label: "2-3 months" },
];

export const AddRfq: React.FC = () => {
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
  const [SubcategoryOptions, setSubCategoryOptions] = useState<Option[]>([]);
  const [AllContacts, setAllContacts] = useState<Option[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  let { id } = useParams();
  const [isFormLoading, setIsFormLoading] = useState(true);

  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    ourRfq: "",
    customerRfq: "",
    customer: "",
    category: null as Option | null,
    subCategory: null as Option | null,
    willOrderWithin: null as Option | null,
    dueDate: "",
    date: "",
    details: "",
    opento: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsFormLoading(true);
        const [categoriesRes, subCategoriesRes, contactsRes] =
          await Promise.all([
            getAllCategory(),
            getAllSubCategory(),
            getAllContact(),
          ]);

        const categoryOptions =
          categoriesRes?.data?.data.map((cat: any) => ({
            value: cat.id,
            label: cat.name,
            raw: cat,
          })) || [];
        setCategoryOptions(categoryOptions);

        const subCategoryOptions =
          subCategoriesRes?.data?.data.map((cat: any) => ({
            value: cat.id,
            label: cat.name,
            raw: cat,
          })) || [];
        setSubCategoryOptions(subCategoryOptions);

        const contactOptions =
          contactsRes?.data?.data.map((cat: any) => ({
            value: cat.id,
            label: cat.name,
            raw: cat,
          })) || [];
        setAllContacts(contactOptions);

        if (isEditMode && id) {
          await fetchRfqById(
            id,
            categoryOptions,
            subCategoryOptions,
            contactOptions
          );
        }
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      } finally {
        setIsFormLoading(false);
      }
    };

    fetchInitialData();
  }, [id, isEditMode]);

  const fetchRfqById = async (
    id: string,
    categories: Option[],
    subCategories: Option[],
    contacts: Option[]
  ) => {
    try {
      const res = await getRfqById(id);
      const data = res?.data?.data[0];
      if (!data) return;

      const selectedCategory = categories.find(
        (c) => c.value === data.category_id?.toString()
      );
      const selectedSubCategory = subCategories.find(
        (s) => s.value === data.sub_category_id?.toString()
      );
      const selectedOrderWithin = WillOrderWithin.find(
        (w) => w.value === data.order_within?.toString()
      );
      const selectedContact = contacts.find(
        (c) => c.value === data.cust_id?.toString()
      );

      setFormData({
        ourRfq: data.rfq,
        customerRfq: data.customer_rfq,
        customer: selectedContact?.value || "",
        category: selectedCategory,
        subCategory: selectedSubCategory,
        willOrderWithin: selectedOrderWithin,
        dueDate: data.due_date,
        date: data.date,
        details: data.detail,
        opento: data.opento,
      });
    } catch (error) {
      console.error("Failed to fetch RFQ", error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.ourRfq.trim()) {
      newErrors.ourRfq = "The rfq field is required.";
    }
    if (!formData.customerRfq.trim()) {
      newErrors.customerRfq = "The customer rfq field is required.";
    }
    if (!formData.customer) {
      newErrors.customer = "The customer name field is required.";
    }
    if (!formData.category) {
      newErrors.category = "The category field is required.";
    }
    if (!formData.subCategory) {
      newErrors.subCategory = "The sub category field is required.";
    }
    if (!formData.willOrderWithin) {
      newErrors.willOrderWithin = "";
    }
    if (!formData.dueDate) {
      newErrors.dueDate = "The due date field is required.";
    }
  

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
// const fetchCategories = async () => {
  //   try {
  //     const res = await getAllCategory();
  //     if (res?.data?.data) {
  //       const options = res.data.data.map((cat: any) => ({
  //         value: cat.id,
  //         label: cat.name,
  //         raw: cat,
  //       }));
  //       setCategoryOptions(options);
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch categories", error);
  //   }
  // };

  // const fetchSubCategories = async () => {
  //   try {
  //     const res = await getAllSubCategory();
  //     if (res?.data?.data) {
  //       const options = res.data.data.map((cat: any) => ({
  //         value: cat.id,
  //         label: cat.name,
  //         raw: cat,
  //       }));
  //       setSubCategoryOptions(options);
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch categories", error);
  //   }
  // };

  // const fetchAllContacts = async () => {
  //   try {
  //     const res = await getAllContact();
  //     if (res?.data?.data) {
  //       const options = res.data.data.map((cat: any) => ({
  //         value: cat.id,
  //         label: cat.name,
  //         raw: cat,
  //       }));
  //       setAllContacts(options);
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch categories", error);
  //   }
  // };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (
    name: keyof typeof formData,
    value: string | boolean | Option | null
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({...prev, [name]: ""}));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        user_id: "1",
        cust_id: Number(formData.customer),
        category_id: formData.category?.value,
        sub_category_id: formData.subCategory?.value,
        rfq: formData.ourRfq,
        customer_rfq: formData.customerRfq,
        date: formData.date || new Date().toISOString().split("T")[0],
        status: 1,
        order_within: formData.willOrderWithin?.value || "1",
        if_private: false,
        due_date: formData.dueDate
          ? new Date(formData.dueDate).toISOString().split("T")[0]
          : null,
        opento: formData.opento,
        if_quote: false,
        detail: formData.details,
      };

      await addRfq(requestData);
      alert("RFQ added successfully!");
      navigate("/rfq");
    } catch (error) {
      console.error("Error details:", error.response?.data);
      alert(`Failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectClick = () => {
    setIsModalOpen(true);
  };
// useEffect(() => {
  //   fetchCategories();
  //   fetchSubCategories();
  //   fetchAllContacts();
  // }, []);

  // useEffect(() => {
  //   if (isEditMode && categoryOptions.length && SubcategoryOptions.length) {
  //     fetchRfqById(id);
  //   }
  // }, [isEditMode, id, categoryOptions, SubcategoryOptions]);
  const backInfo = { title: "Rfq", path: "/rfq" };

  return (
    <div className="container mx-auto p-6 rounded">
      <div>
        <PageBreadcrumb
          pageTitle={id ? "Edit Rfq" : "Add Rfq"}
          backInfo={backInfo}
        />
      </div>
      {isFormLoading ? (
        <p>Loading RFQ data...</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white p-6 rounded-lg "
        >
          <h3 className="text-xl font-semibold mb-3 text-gray-500">Details</h3>
          <hr className=" border-t border-gray-300 mb-3"></hr>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium mb-2 text-gray-500">
                Our Rfq# <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full border p-2 rounded ${errors.ourRfq ? "border-red-500" : ""}`}
                value={formData.ourRfq}
                onChange={(e) => handleChange("ourRfq", e.target.value)}
              />
              {errors.ourRfq && <p className="text-red-500 text-xs mt-1">{errors.ourRfq}</p>}
            </div>

            <div>
              <label className="font-medium mb-2 text-gray-500">
                Customer Rfq <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full border p-2 rounded ${errors.customerRfq ? "border-red-500" : ""}`}
                value={formData.customerRfq}
                onChange={(e) => handleChange("customerRfq", e.target.value)}
              />
              {errors.customerRfq && <p className="text-red-500 text-xs mt-1">{errors.customerRfq}</p>}
            </div>
          </div>

          <div>
            <label className="font-medium mb-2 text-gray-500">
              Customer <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-9">
              <div className="flex-grow">
                <input
                  type="text"
                  className={`w-full max-w-[1000px] border p-2 rounded ${errors.customer ? "border-red-500" : ""}`}
                  value={formData.customer}
                  onChange={(e) => handleChange("customer", e.target.value)}
                  readOnly
                />
                {errors.customer && <p className="text-red-500 text-xs mt-1">{errors.customer}</p>}
              </div>
              <button
                type="button"
                onClick={handleSelectClick}
                className="border-b border-blue-300 bg-blue-500 p-2 rounded text-white"
              >
                Select
              </button>
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
                onChange={(selected: SingleValue<Option>) =>
                  handleChange("category", selected)
                }
                className={errors.category ? "border-red-500 border rounded" : ""}
                classNamePrefix={errors.category ? "error-select" : ""}
              />
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>
            <div>
              <label className="font-medium mb-2 text-gray-500">
                Sub Category <span className="text-red-500">*</span>
              </label>
              <Select
                options={SubcategoryOptions}
                value={formData.subCategory}
                onChange={(selected: SingleValue<Option>) =>
                  handleChange("subCategory", selected)
                }
                className={errors.subCategory ? "border-red-500 border rounded" : ""}
                classNamePrefix={errors.subCategory ? "error-select" : ""}
              />
              {errors.subCategory && <p className="text-red-500 text-xs mt-1">{errors.subCategory}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="font-medium mb-2 text-gray-500">
                Will Order Within<span className="text-red-500">*</span>
              </label>
              <Select
                options={WillOrderWithin}
                value={formData.willOrderWithin}
                onChange={(selected: SingleValue<Option>) =>
                  handleChange("willOrderWithin", selected)
                }
                className={errors.willOrderWithin ? "border-red-500 border rounded" : ""}
                classNamePrefix={errors.willOrderWithin ? "error-select" : ""}
              />
              {errors.willOrderWithin && <p className="text-red-500 text-xs mt-1">{errors.willOrderWithin}</p>}
            </div>

            <div>
              <label className="font-medium mb-2 text-gray-500">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className={`w-full border p-2 rounded ${errors.dueDate ? "border-red-500" : ""}`}
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
              />
              {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
            </div>

            <div>
              <label className="font-medium mb-2 text-gray-500">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full border p-2 rounded"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="font-medium mb-2 block text-gray-500">
              Details<span className="text-red-500">*</span>
            </label>
            <textarea
              className={`h-22 border p-2 rounded w-full ${errors.details ? "border-red-500" : ""}`}
              value={formData.details}
              onChange={(e) => handleChange("details", e.target.value)}
            />
            {errors.details && <p className="text-red-500 text-xs mt-1">{errors.details}</p>}
          </div>

          <div>
            <label className="font-medium mb-2 block text-gray-500">
              Open To
            </label>
            <textarea
              className="h-10 border p-2 rounded w-full"
              value={formData.opento}
              onChange={(e) => handleChange("opento", e.target.value)}
            />
          </div>

          <div className="flex justify-end mb-2 mt-2 gap-2">
            <Button
              variant="outlined"
              className="bg-pink-300"
              onClick={() => navigate("/rfq")}
            >
              Cancel
            </Button>
            <Button variant="contained" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : id ? "Update" : "Add Submit"}
            </Button>
          </div>
        </form>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 w-[90%] max-w-6xl shadow-2xl border border-gray-200 overflow-auto max-h-[90vh]">
            <div className="border-b border-gray-300 pb-2 mb-5">
              <h2 className="text-2xl font-bold text-gray-800">
                Please Select a Customer
              </h2>
            </div>

            <p className="text-gray-600 font-bold mt-5 mb-4">Company Name</p>

            <input
              type="text"
              placeholder="Search customers..."
              className="w-full border border-gray-300 rounded-md px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 text-sm text-left">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-2 border">Select</th>
                    <th className="px-4 py-2 border">Company Name</th>
                    <th className="px-4 py-2 border">Name</th>
                    <th className="px-4 py-2 border">Country</th>
                    <th className="px-4 py-2 border">State</th>
                    <th className="px-4 py-2 border">City</th>
                  </tr>
                </thead>
                <tbody>
                  {AllContacts.filter(
                    (contact) =>
                      (contact.raw?.companyName?.toLowerCase() || "").includes(
                        searchTerm.toLowerCase()
                      ) ||
                      contact.label
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      (contact.raw?.country?.toLowerCase() || "").includes(
                        searchTerm.toLowerCase()
                      ) ||
                      (contact.raw?.state?.toLowerCase() || "").includes(
                        searchTerm.toLowerCase()
                      ) ||
                      (contact.raw?.city?.toLowerCase() || "").includes(
                        searchTerm.toLowerCase()
                      )
                  ).map((contact) => (
                    <tr key={contact.value} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border text-center">
                        <input
                          type="radio"
                          name="selectedCustomer"
                          onChange={() => {
                            setFormData((prev) => ({
                              ...prev,
                              customer: contact.raw?.id || contact.value,
                            }));
                            closeModal();
                          }}
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        {contact.raw?.companyName || "N/A"}
                      </td>
                      <td className="px-4 py-2 border">{contact.label}</td>
                      <td className="px-4 py-2 border">
                        {contact.raw?.country || "N/A"}
                      </td>
                      <td className="px-4 py-2 border">
                        {contact.raw?.state || "N/A"}
                      </td>
                      <td className="px-4 py-2 border">
                        {contact.raw?.city || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={closeModal}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};