import Select, { SingleValue } from "react-select";
import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { useParams } from "react-router";
import { Button } from "@mui/material";
import { useNavigate } from "react-router";
import Flatpickr from "react-flatpickr";
import { useForm, Controller } from "react-hook-form";
import {
  addRfq,
  getAllCategory,
  getAllContact,
  getAllContactPageLimit,
  getAllSubCategory,
  getAllUsers,
  getRfqById,
  updateRfq,
} from "../../../services/apis";
import { toast } from "react-toastify";

interface Option {
  value: string;
  label: string;
  raw?: any;
}

import { Box, Modal } from "@mui/material";

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
  const [openTo, setopenTo] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  let { id } = useParams();
  const [isFormLoading, setIsFormLoading] = useState(true);
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    user_id: 0,
    ourRfq: "",
    customerRfq: "",
    customer: "",
    category: null as Option | null,
    subCategory: null as Option | null,
    willOrderWithin: null as Option | null,
    dueDate: "",
    date: "",
    details: "",
    opento: [] as string[],


    //  user_id:0 ,
    //     cust_id: "",
    //     category_id: "",
    //     sub_category_id: "",
    //     rfq: "",
    //     customer_rfq:"",
    //     date: "",
    //     status:"",
    //     order_within:"",
    //     if_private: "",
    //     due_date: "",
    //     opento: "",
    //     if_quote: "",
    //     detail: "",

  });

  const { control } = useForm({
    defaultValues: {
      dueDate: formData.dueDate || "",
      date: formData.date || "",
    },
  });

  const handleUpdateRfq = async (id: string, updatedData: any) => {
    try {
      setLoading(true);
      await updateRfq(id, updatedData);
    } catch (error) {
      console.error("Error updating RFQ:", error);
    } finally {
      setLoading(false);
    }
  };
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const fetchInitialData = async (page = 1, limit = 10) => {
      try {
        setIsFormLoading(true);
        const [categoriesRes, subCategoriesRes, contactsRes] = await Promise.all([
          getAllCategory(),
          getAllSubCategory(),
          getAllContactPageLimit(page, limit),
        ]);

        const categoryOptions =
          categoriesRes?.data?.data.map((cat: any) => ({
            value: cat.id.toString(),
            label: cat.name,
            raw: cat,
          })) || [];
        setCategoryOptions(categoryOptions);

        const subCategoryOptions =
          subCategoriesRes?.data?.data.map((cat: any) => ({
            value: cat.id.toString(),
            label: cat.name,
            raw: cat,
          })) || [];
        setSubCategoryOptions(subCategoryOptions);

        const contactsRaw = contactsRes?.data?.data;
        const contacts = Array.isArray(contactsRaw) ? contactsRaw : [];
        const opento = contacts.map((contact: any) => ({
          value: contact.id?.toString(),
          label: contact.name || contact.user_name || contact.company_name || "No Name",
          raw: contact,
        }));
        setAllContacts(opento);
        console.log(AllContacts, "ddd")

        if (isEditMode && id) {
          await fetchRfqById(id, categoryOptions, subCategoryOptions, opento);
        }
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      } finally {

        setIsFormLoading(false);
      }
      setLoading(false);
    };

    fetchInitialData();
  }, [id, isEditMode]);

  // const fetchRfqById = async (
  //   id: string,
  //   categories: Option[],
  //   subCategories: Option[],
  //   opento: Option[]
  // ) => {
  //   setLoading(true);
  //   try {
  //     const res = await getRfqById(id);
  //     const data = res?.data?.data[0];
  //     if (!data) return;

  //     const selectedCategory = categories.find(
  //       (c) => c.value === data.category_id?.toString()
  //     );
  //     const selectedSubCategory = subCategories.find(
  //       (s) => s.value === data.sub_category_id?.toString()
  //     );
  //     const selectedOrderWithin = WillOrderWithin.find(
  //       (w) => w.value === data.order_within?.toString()
  //     );

  //     setFormData({
  //       ourRfq: data.rfq || "",
  //       customerRfq: data.customer_rfq || "",
  //       customer: data?.cust_id?.toString() || "",
  //       category: selectedCategory || null,
  //       subCategory: selectedSubCategory || null,
  //       willOrderWithin: selectedOrderWithin || null,
  //       dueDate: data.due_date || "",
  //       date: data.date || "",
  //       details: data.detail || "",
  //       opento: data.opento ? data.opento.split(",") : [],
  //     });
  //   } catch (error) {
  //     console.error("Failed to fetch RFQ", error);
  //   }
  //   setLoading(false);
  // };


  const orderWithinOptions: { [key: number]: string } = {
    1: "Immediately",
    2: "1-2 days",
    3: "1 week",
    4: "2 weeks",
    6: "2-3 months",
  };
  useEffect(() => {
    if (id) {
      getRfqById(id).then((response) => {
        const data = response?.data?.data?.[0];
        if (data) {
          setFormData(prev => ({
            ...prev,
            ourRfq: data.rfq || "",
            customerRfq: data.customer_rfq || "",
            customer: data.cust_id?.toString() || "",
            category: data.categoryData?.[0]
              ? {
                label: data.categoryData[0].name,
                value: data.categoryData[0].id,
              }
              : null,
            subCategory: data.subcategoryDataData?.[0]
              ? {
                label: data.subcategoryDataData[0].name,
                value: data.subcategoryDataData[0].id,
              }
              : null,
            willOrderWithin: data.order_within !== undefined
              ? {
                label: orderWithinOptions[data.order_within] || "Unknown",
                value: data.order_within,
              }
              : null,
            dueDate: data.due_date ? data.due_date.split("T")[0] : "",
            date: data.date ? data.date.split("T")[0] : "",
            details: data.detail || "",
            opento: data.opento ? data.opento.split(",") : [],
          }));
        }
      });
    }
  }, [id]);

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

  const closeModal = () => {
    setLoading(true);
    setIsModalOpen(false);
    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      const users = response.data?.data || [];
      const formattedUsers = users.map((user: any) => ({
        value: user.id.toString(),
        label: user.name,
      }));
      setopenTo(formattedUsers);
    } catch (error) {
      console.error("Failed to fetch account managers:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [id]);

  const handleChange = (
    name: keyof typeof formData,
    value: string | boolean | Option | Option[] | null
  ) => {
    if (name === "opento" && Array.isArray(value)) {
      const selectedValues = (value as Option[]).map((opt) => opt.value);
      setFormData((prev) => ({ ...prev, [name]: selectedValues }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    const user_id = localStorage.getItem("Sql_id");
    console.log("User ID from localStorage:", user_id);
    if (user_id) {
      setFormData((prev) => ({ ...prev, user_id: Number(user_id) }));
    }
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return; // ✅ Exit early
    }
    setLoading(true)

    try {
      const requestData = {
        // user_id: "1",
        // cust_id: Number(formData.customer),
        // category_id: formData.category?.value,
        // sub_category_id: formData.subCategory?.value,
        // rfq: formData.ourRfq,
        // customer_rfq: formData.customerRfq,
        // date: formData.date || new Date().toISOString().split("T")[0],
        // status: 1,
        // order_within: formData.willOrderWithin?.value || "1",
        // if_private: false,
        // due_date: formData.dueDate
        //   ? new Date(formData.dueDate).toISOString().split("T")[0]
        //   : null,
        // opento: formData.opento.join(","),
        // if_quote: false,
        // detail: formData.details,
        user_id: Number(formData.user_id),
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
        opento: formData.opento.join(","),
        if_quote: false,
        detail: formData.details,
      };

      if (isEditMode && id) {
        await updateRfq(id, requestData);
        toast.success("RFQ updated successfully", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      } else {
        await addRfq(requestData);
        toast.success("RFQ added successfully", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      }

      setTimeout(() => {
        navigate("/rfq");
      }, 2000);
    } catch (error: any) {
      console.error("Error details:", error.response?.data);
      toast.error(`Failed: ${error.response?.data?.message || error.message}`, {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setLoading(false)

    }
  };


  const handleSelectClick = () => {
    setIsModalOpen(true);
  };

  const backInfo = { title: "Rfq", path: "/rfq" };
  return (
    <div className="container mx-auto p-6 rounded">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <div>
        <PageBreadcrumb
          pageTitle={id ? "Edit Rfq" : "Add Rfq"}
          backInfo={backInfo}
        />
      </div>
      {/* <h1 className="text-2xl font-bold mb-4">Add Rfq</h1> */}
      {/* {isFormLoading ? (
        <p>Loading RFQ data...</p>
      ) : ( */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg "
      >
        <h3 className="text-xl font-semibold mb-3 text-gray-500">Details</h3>
        <hr className=" border-t border-gray-300 mb-3"></hr>

        {/* Our  Rfq and Customer Rfq */}

        <div className="grid grid-cols-2  gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Our Rfq# <span className="text-red-500">*</span>
            </label>
            {/* {console.log(formData)} */}
            <input
              type="text"
              className={`w-full border p-2 rounded ${errors.ourRfq ? "border-red-500" : ""
                }`}
              value={formData.ourRfq}
              onChange={(e) => handleChange("ourRfq", e.target.value)}
            ></input>
            {errors.ourRfq && (
              <p className="text-red-500 text-xs mt-1">{errors.ourRfq}</p>
            )}
          </div>

          <div>
            <label className="font-medium mb-2 text-gray-500">
              Customer Rfq <span className="text-red-500">*</span>
            </label>
            <input
              type="text"

              className={`w-full border p-2 rounded ${errors.customerRfq ? "border-red-500" : ""
                }`}
              value={formData.customerRfq}
              onChange={(e) => handleChange("customerRfq", e.target.value)}
            ></input>
            {errors.customerRfq && (
              <p className="text-red-500 text-xs mt-1">
                {errors.customerRfq}
              </p>
            )}
          </div>

          {/* customer  */}
        </div>
        <label className="font-medium mb-2 text-gray-500">
          Customer <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-9">
          <div>
            <input
              readOnly
              className={`w-full border p-2 rounded bg-gray-200 border-gray-300 ${errors.customer ? "border-red-500" : ""
                }`}
              value={formData.customer}
              onChange={(e) => handleChange("customer", e.target.value)}
            ></input>
            {errors.customer && (
              <p className="text-red-500 text-xs mt-1">{errors.customer}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleSelectClick}
            className="border-b border-blue-300 bg-blue-500 p-2 rounded text-white"
          >
            Select
          </button>
        </div>

        {/* category and sub category */}

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
              className={
                errors.category ? "border-red-500 border rounded" : ""
              }
              classNamePrefix={errors.category ? "error-select" : ""}
            />
            {console.log("12222222222222222222", formData)}

            {errors.category && (
              <p className="text-red-500 text-xs mt-1">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="font-medium mb-2 text-gray-500">
              {" "}
              Sub Category <span className="text-red-500">*</span>
            </label>
            <Select
              options={SubcategoryOptions}
              value={formData.subCategory}
              onChange={(selected: SingleValue<Option>) =>
                handleChange("subCategory", selected)
              }
              className={
                errors.subCategory ? "border-red-500 border rounded" : ""
              }
              classNamePrefix={errors.subCategory ? "error-select" : ""}
            />
            {errors.subCategory && (
              <p className="text-red-500 text-xs mt-1">
                {errors.subCategory}
              </p>
            )}
          </div>
        </div>

        {/* will-order-within due date & date */}

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
              className={
                errors.willOrderWithin ? "border-red-500 border rounded" : ""
              }
              classNamePrefix={errors.willOrderWithin ? "error-select" : ""}
            />
            {errors.willOrderWithin && (
              <p className="text-red-500 text-xs mt-1">
                {errors.willOrderWithin}
              </p>
            )}
          </div>
          {/* DUE DATE */}
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Due Date <span className="text-red-500">*</span>
            </label>
            <Flatpickr
              value={formData.dueDate}
              onChange={(dates) => {
                handleChange(
                  "dueDate",
                  dates.length ? dates[0].toLocaleDateString("en-CA") : ""
                );
              }}
              options={{ dateFormat: "Y-m-d" }}
              placeholder="Select Occur Date"
              className={`w-full border p-2 rounded ${errors.dueDate ? "border-red-500" : ""}`}
            />
            {errors.dueDate && (
              <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>
            )}
          </div>

          {/* Date Input */}
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Select Date <span className="text-red-500">*</span>
            </label>
            <Flatpickr
              value={formData.date}
              onChange={(dates) => {
                handleChange(
                  "date",
                  dates.length ? dates[0].toLocaleDateString("en-CA") : ""
                );
              }}
              options={{ dateFormat: "Y-m-d" }}
              placeholder="Select an option"
              className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
            />
          </div>
        </div>

        {/* deatils */}

        <div>
          <label className="font-medium mb-2 block text-gray-500">
            Details<span className="text-red-500">*</span>
          </label>
          <textarea
            className="h-22 border p-2 rounded w-full"
            value={formData.details}
            onChange={(e) => handleChange("details", e.target.value)}
          ></textarea>
        </div>

        {/* Open To */}

        <div>
          <label className="font-medium mb-2 block text-gray-500">
            Open To
          </label>
          <Select
            isMulti
            options={openTo}
            value={openTo.filter((opt) =>
              formData.opento.includes(opt.value)
            )}
            onChange={(selected: Option[]) =>
              handleChange("opento", selected)
            }
            placeholder="Select Option"
            className="dark:bg-dark-900"
          />
        </div>

        {/* Update & Cancel */}

        <div className="flex justify-end mb-2 mt-2 gap-2">
          <Button
            variant="outlined"
            className="bg-pink-300"
            onClick={() => navigate("/rfq")}
          >
            Cancel
          </Button>
          <Button variant="contained" type="submit">
            {isEditMode ? "Update" : "Add Submit"}
          </Button>
        </div>
        {/* Loading Overlay */}
        {/* {isSubmitting && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-700">Submitting RFQ...</p>
              </div>
            </div>
          )} */}

        {/* Success Notification */}
        {/* {isSuccess && (
            <div className="fixed top-4 right-4 z-50">
              <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                RFQ submitted successfully!
              </div>
            </div>
          )} */}
      </form>
      {/* )} */}
      {/* Modal */}
      {/* {isModalOpen && (
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
                              customer: contact.raw?.id || contact.value, // Store the ID if you need it for submission
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
      )} */}


      <Modal open={isModalOpen} onClose={closeModal}>
        <Box className="fixed inset-0 bg-opacity-40 flex justify-center items-center z-50 text-gray-500 mt-5">
          <div className="bg-white w-full max-w-2xl rounded shadow-lg p-6 relative">

            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300">
              <h2 className="text-2xl font-bold ">
                Please Select a Customer
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500  text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4">
              {/* Search Input */}
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                placeholder="Search customers..."
                className="w-full border border-gray-300 rounded-md px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* Table */}
              <div className="overflow-auto max-h-[60vh] border border-gray-300 rounded">
                <table className="min-w-full text-sm border-collapse table-fixed">
                  <thead className="bg-gray-100 sticky top-0 z-10 text-gray-700">
                    <tr>
                      <th className="px-2 py-2 border text-left ">Select</th>
                      <th className="px-2 py-2 border text-left">Company Name</th>
                      <th className="px-2 py-2 border text-left">Name</th>
                      <th className="px-2 py-2 border text-left">Country</th>
                      <th className="px-2 py-2 border text-left ">State</th>
                      <th className="px-2 py-2 border text-left ">City</th>
                    </tr>
                  </thead>
                  <tbody>
                    {AllContacts.filter(
                      (contact) =>
                        (contact.raw?.companyName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                        contact.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (contact.raw?.country?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                        (contact.raw?.state?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                        (contact.raw?.city?.toLowerCase() || "").includes(searchTerm.toLowerCase())
                    ).map((contact) => (
                      <tr key={contact.value} className="hover:bg-gray-50 transition-colors">
                        <td className="px-2 py-2 border text-center">
                          <input
                            type="radio"
                            name="selectedCustomer"
                            checked={formData.customer === (contact.raw?.id || contact.value)}
                            onChange={() => {
                              setFormData((prev) => ({
                                ...prev,
                                customer: contact.raw?.id || contact.value,
                              }));
                              closeModal(); // close on select
                            }}
                          />
                        </td>
                        <td className="px-2 py-2 border truncate">{contact.raw?.companyName || "N/A"}</td>
                        <td className="px-2 py-2 border truncate">{contact.label}</td>
                        <td className="px-2 py-2 border">{contact.raw?.country || "N/A"}</td>
                        <td className="px-2 py-2 border">{contact.raw?.state || "N/A"}</td>
                        <td className="px-2 py-2 border">{contact.raw?.city || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>


              {/* Footer */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={closeModal}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Box>
      </Modal>

    </div>
  );
};
