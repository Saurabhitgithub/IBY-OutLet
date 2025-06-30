import Select, { SingleValue } from "react-select";
import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { useParams } from "react-router";
import { Button } from "@mui/material";
import { useNavigate } from "react-router";
import { Box, Modal } from "@mui/material";
import {
  addRfqStates,
  getAllPurchaser,
  getAllUsers,
  getRfqById,
  getRfqStatesById,
  updateRfqStatesById,
  getAllSalesman,
  getAllCountry,
  getAllStates,
} from "../../../services/apis";
import { toast } from "react-toastify";
interface Option {
  value: string;
  label: string;
}
import Flatpickr from "react-flatpickr";
// for modal 1
const product: Option[] = [
  { value: "1", label: "Received from customer" },
  { value: "2", label: "Forward to China inside sales" },
  { value: "3", label: "Forward to China purchaser" },
  { value: "4", label: "Send to suppliers" },
  { value: "5", label: "Received price from supplier" },
  { value: "6", label: "Send price to inside sales" },
  { value: "7", label: "Send quotation to sales" },
  { value: "8", label: "Send quotation to customer" },
  { value: "9", label: "Customer questions" },
  { value: "10", label: "Supplier questions" },
  { value: "11", label: "Follow-up customer" },
  { value: "12", label: "Follow-up suppliers" },
  { value: "13", label: "Get purchase order" },
];

// for modal 2
// const salesUsers2 = [
//   { username: "GCUS", role: "salesmen" },
//   { username: "Andyx", role: "salesmen" },
//   { username: "Sales42", role: "salesmen" },
//   { username: "Hisen_yuan", role: "salesmen" },
//   { username: "Hui_wu", role: "salesmen" },
//   { username: "Taoliu", role: "sales_vice_general_manager" },
//   { username: "PurchaseFF", role: "salesmen" },
// ];
export const AddRfqStats: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<string | null>(null);
  const { statsId, id } = useParams();
  console.log("statsId:", statsId);
  const [countryOptions, setCountryOptions] = useState<Option[]>([]);
  const [stateOptions, setStateOptions] = useState<Option[]>([]);
  const [userOptions, setUserOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ourRfq: "",
    customerRfq: "",
    category: "",
    uptime: "",
    stats: null as Option | null,
    if_private: false,
    details: "",
    opento: [],
    country: null as Option | null,
    state: null as Option | null,

    user_id: 0,
    rfq_id: 0,
    //   stats: 0,
    //   uptime: "",
    //   if_private: 0,
    //   details: "",
    //   opento: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    const fetchAllData = async () => {
      try {
        const statsResponse = await getRfqStatesById(id);
        const statsData = statsResponse?.data?.data?.[0];

        const rfqIdToUse = statsData?.rfq_id || id;
        const rfqResponse = await getRfqById(rfqIdToUse);
        const rfqData = rfqResponse?.data?.data?.[0];

        if (statsData) {
          setFormData((prev) => ({
            ...prev,
            id: statsData.id,
            user_id: Number(statsData.user_id) || 0,
            rfq_id: statsData.rfq_id || 0,
            uptime: statsData.uptime
              ? new Date(statsData.uptime).toISOString().split("T")[0]
              : "",
            details: statsData.details || "",
            if_private: statsData.if_private === 1,
            opento: Array.isArray(statsData.opento)
              ? statsData.opento
              : JSON.parse(statsData.opento || "[]"),

            ourRfq: rfqData?.rfq || "",
            customerRfq: rfqData?.customer_rfq || "",
            category: `${rfqData.categoryData?.[0]?.name || ""} - ${rfqData.subcategoryDataData?.[0]?.name || ""
              }`,

            stats: {
              label: `Stats #${statsData.id}`,
              value: String(statsData.id),
            },
          }));
        }
      } catch (err) {
        console.error(
          "Failed to fetch combined RFQ stats and RFQ details",
          err
        );
      }
    };

    fetchAllData();
  }, [id]);

  useEffect(() => {
    if (statsId) {
      getRfqById(statsId).then((response) => {
        const data = response?.data?.data?.[0];
        console.log("rfq data", data);

        if (data) {
          setFormData((prev) => ({
            ...prev,
            opento: [],
            user_id: Number(data.user_id) || 0,
            ourRfq: data.rfq || "",
            customerRfq: data.customer_rfq || "",
            category: `${data.categoryData?.[0]?.name || ""} - ${data.subcategoryDataData?.[0]?.name || ""
              }`,

            rfq_id: data.id || 0,
          }));
        }
      });
    }
  }, [statsId]);

  const handleChange = (
    name: keyof typeof formData,
    value:
      | string
      | number
      | boolean
      | Option
      | Option[]
      | string[]
      | number[]
      | null
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "stats") {
      if ((value as Option)?.value === "1") {
        setIsModalOpen("modalOne");
      } else if ((value as Option)?.value === "2") {
        setIsModalOpen("modalTwo");
      } else if ((value as Option)?.value === "3") {
        setIsModalOpen("modalThree");
      } else if ((value as Option)?.value === "4") {
        setIsModalOpen("modalFour");
      } else if ((value as Option)?.value === "6") {
        setIsModalOpen("modalSix");
      } else if ((value as Option)?.value === "7") {
        setIsModalOpen("modalSeven");
      } else {
        setIsModalOpen(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", formData);
  };

  const handleSubmitMain = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)
    try {
      const payload = {
        ...formData,
        stats: formData.stats?.value,
        opento: Array.isArray(formData.opento)
          ? JSON.stringify(formData.opento)
          : formData.opento,
        category: `${formData.categoryData?.[0]?.name || ""} - ${formData.subcategoryDataData?.[0]?.name || ""}`,
      };
      console.log("Updating RFQ Stats with ID:", formData.id);
      if (formData.id) {

        await updateRfqStatesById(formData.id, payload);
        toast.success("RFQ Stats updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      } else {

        await addRfqStates(payload);
        toast.success("RFQ Stats added successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      }

      navigate("/rfq");
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(
        error?.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false)
    }
  };


  const backInfo = { title: "Rfq", path: "/rfq" };

  const onClose = () => {
    setIsModalOpen(null);
  };
  useEffect(() => {
    fetchCountries();
  }, []);
  useEffect(() => {
    if (formData.country && "iso2" in formData.country) {
      fetchStates((formData.country as any).iso2);
    }
  }, [formData.country]);
  const fetchCountries = async () => {
    try {
      const response = await getAllCountry();
      const countries = response.data.data.map((country: any) => ({
        value: country.sql_id,
        label: country.name,
        iso2: country.iso2,
        name: country.name,
      }));
      setCountryOptions(countries);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };
  const fetchStates = async (code: string) => {
    try {
      const response = await getAllStates(code);
      const states = response.data.data.map((state: any) => ({
        value: state.sql_id,
        label: state.name,
      }));
      setStateOptions(states);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };
  const handleCountryChange = (selected: SingleValue<Option>) => {
    handleChange("country", selected);
    handleChange("state", null);
  };
  // for modal 2
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const toggleSelect = (username: string) => {
    setSelectedUsers((prev) =>
      prev.includes(username)
        ? prev.filter((u) => u !== username)
        : [...prev, username]
    );
  };

  // for modal 3
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [customers, setCustomers] = useState()

  useEffect(() => {
    fetchPurchaser();
  }, [])
  const fetchPurchaser = async () => {
    setLoading(true);
    try {
      const response = await getAllPurchaser();
      const purchasers = response.data?.data || [];
      setCustomers(purchasers);
      console.log(customers, "gg")
    } catch (error) {
      console.error("Failed to fetch account managers:", error);
    }
    setLoading(false);
  };

  const handleCheckboxChange = (customerId: number) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSubmit3 = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedUsers = customers
      ? customers.filter((customer) => selectedCustomers.includes(customer.id))
      : [];
    console.log("Selected customers:", selectedUsers);
    // Here you would typically send the data to an API or parent component
  };

  // for modal 4
  const [customers4, setCustomers4] = useState();
  useEffect(() => {
    fetchSalesman();
  }, [])
  const fetchSalesman = async () => {
    setLoading(true);
    try {
      const response = await getAllSalesman();
      const purchasers = response.data?.data || [];
      setCustomers4(purchasers);
      console.log(customers, "gg")
    } catch (error) {
      console.error("Failed to fetch account managers:", error);
    }
    setLoading(false);
  };

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // if (!isOpen) return null;

  // for modal 6
  // const salesUsers6 = [
  //   { id: 1, username: "GCUS", role: "salesmen" },
  //   { id: 2, username: "Andyx", role: "salesmen" },
  //   { id: 3, username: "Sales42", role: "salesmen" },
  //   { id: 4, username: "Hisen_yuan", role: "salesmen" },
  //   { id: 5, username: "Hui_wu", role: "salesmen" },
  //   { id: 6, username: "Taoliu", role: "sales_vice_general_manager" },
  //   { id: 7, username: "PurchaseFF", role: "salesmen" },
  // ];

  const [selectedIds6, setSelectedIds6] = useState<number[]>([]);
  const [nameFilter, setNameFilter] = useState("");

  const handleSelect6 = (id: number) => {
    setSelectedIds6((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // const filteredUsers = salesUsers6.filter((user) =>
  //   user.username.toLowerCase().includes(nameFilter.toLowerCase())
  // );

  // modal 7
  // const userList = [
  //   { id: 1, username: "LorryLi", role: "sales_vice_general_manager" },
  //   { id: 2, username: "GCUS", role: "salesmen" },
  //   { id: 3, username: "StanyAssist", role: "sales_manager" },
  //   { id: 4, username: "Meru", role: "salesmen" },
  //   { id: 5, username: "Alexm", role: "salesmen" },
  //   { id: 6, username: "Jesusm", role: "vice_sales_manager" },
  //   { id: 7, username: "Maxime", role: "salesman" },
  // ];

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const handleSelect7 = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // const filteredUsers7 = userList.filter((u) =>
  //   u.username.toLowerCase().includes(search.toLowerCase())
  // );
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
    getAllUserData();
  }, []);
  return (
    <div className="container mx-auto rounded p-6">
      <div>
        <PageBreadcrumb
          pageTitle={id ? "Edit Stats" : "Add Stats"}
          backInfo={backInfo}
        />
      </div>
      <form
        onSubmit={handleSubmitMain}
        className="space-y-4 bg-white p-6 rounded-lg"
      >
        <h3 className="text-xl text-gray-500 font-semibold m500">Details</h3>
        <hr className="border-t border-gray-300 mb-3"></hr>

        {/* Our Rfq# & Customer Rfq */}

        <div className="grid grid-cols-3  gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Our Rfq# <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded bg-gray-200 border-gray-300"
              value={formData.ourRfq}
              onChange={(e) => handleChange("ourRfq", e.target.value)}
            ></input>
          </div>

          <div>
            <label className="font-medium mb-2 text-gray-500">
              Customer Rfq <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded bg-gray-200 border-gray-300"
              value={formData.customerRfq}
              onChange={(e) => handleChange("customerRfq", e.target.value)}
            ></input>
          </div>
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Category<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded bg-gray-200 border-gray-300"
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
            ></input>
          </div>
        </div>

        {/* Stats Date & Stats */}

        <div className="grid grid-cols-2  gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Stats Date<span className="text-red-500">*</span>
            </label>
            <Flatpickr
              value={formData.uptime}
              onChange={(dates) => {
                handleChange(
                  "uptime",
                  dates.length ? dates[0].toLocaleDateString("en-CA") : ""
                );
              }}
              options={{ dateFormat: "Y-m-d" }}
              className="w-full border p-2 rounded h-11 text-sm shadow-theme-xs text-gray-800 placeholder:text-gray-400 focus:outline-hidden focus:ring-3 bg-transparent border-gray-300 focus:border-brand-300 focus:ring-brand-500/20"
            />
          </div>

          {/* <div>
                        <label className="font-medium mb-2 text-gray-500">Stats<span className="text-red-500">*</span></label>
                        <Select
                            options={product}
                            value={formData.stats}
                            onChange={(selected: SingleValue<Option>) => handleChange("stats", selected)}
                        />
                    </div> */}
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Stats<span className="text-red-500">*</span>
            </label>
            <Select
              options={product}
              value={formData.stats}
              onChange={(selected: SingleValue<Option>) => {
                handleChange("stats", selected);
                // Trigger modal when "Received from customer" is selected
                if (selected?.value === "1") {
                  setIsModalOpen("modalOne");
                } else if (selected?.value === "2") {
                  setIsModalOpen("modalTwo");
                } else if (selected?.value === "3") {
                  setIsModalOpen("modalThree");
                } else if (selected?.value === "4") {
                  setIsModalOpen("modalFour");
                } else if (selected?.value === "6") {
                  setIsModalOpen("modalSix");
                } else if (selected?.value === "7") {
                  setIsModalOpen("modalSeven");
                } else {
                  setIsModalOpen(null);
                }
              }}
            />
          </div>
        </div>

        <div className="mt-5 pt-2">
          <label className="font-medium mb-2 block flex items-center text-gray-500">
            <input
              type="checkbox"
              className="mr-2 "
              checked={formData.if_private}
              onChange={(e) => handleChange("if_private", e.target.checked)}
            />
            If Private Info
          </label>
        </div>

        {/* Details */}

        <div>
          <label className="font-medium mb-2 block text-gray-500">
            Details<span className="text-red-500"></span>
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
            options={userOptions}
            isLoading={loading}
            value={
              Array.isArray(formData.opento)
                ? userOptions.filter((opt) =>
                  formData.opento.includes(opt.value)
                )
                : []
            }
            onChange={(selected: Option[]) =>
              handleChange(
                "opento",
                selected.map((s) => s.value)
              )
            }
            placeholder="Select Users"
            className="dark:bg-dark-900"
          />
        </div>

        {/* Add & Cancel */}

        <div className="flex justify-end mb-2 mt-2 gap-2">
          <Button
            variant="outlined"
            className="bg-pink-300"
            onClick={() => navigate("/rfq")}
          >
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Add submit
          </Button>
        </div>
      </form>

      {/* Modal Component */}
      <Modal open={isModalOpen === "modalOne"} onClose={onClose}>
        <Box className="fixed inset-0 bg-opacity-50 flex justify-center items-start pt-24 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl p-6">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-medium text-gray-500">
                Select Customer
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 text-xl font-bold hover:text-red-600"
              >
                ×
              </button>
            </div>

            {/* Filters */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-medium mb-2 block text-gray-500">
                  Company Name
                </label>
                <input type="text" className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="font-medium mb-2 block text-gray-500">
                  Contact Person
                </label>
                <input type="text" className="w-full border p-2 rounded" />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="mt-2">
                <label className="font-medium mb-2 text-gray-500">
                  Country<span className="text-red-500">*</span>
                </label>
                <Select
                  options={countryOptions}
                  value={formData.country}
                  onChange={handleCountryChange}
                  onMenuClose={() => { }}
                />
              </div>
              <div className="mt-2">
                <label className="font-medium mb-2 text-gray-500">
                  State<span className="text-red-500">*</span>
                </label>
                <Select
                  options={stateOptions}
                  value={formData.state}
                  onChange={(selected: SingleValue<Option>) =>
                    handleChange("state", selected)
                  }
                />
              </div>
              <div className="col-span-2 flex items-end gap-2 ">
                <div className="w-full">
                  <label className="font-medium mb-2 block text-gray-500">
                    City
                  </label>
                  <input type="text" className="w-full border p-2 rounded" />
                </div>
                <button className="h-10 mt-6 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Search
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="mt-6">
              <h3 className="font-medium mb-2 block text-gray-500">
                Select Ship Products
              </h3>
              <div className="overflow-auto max-h-64 border rounded-lg">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-gray-500 border px-3 py-2 text-left">
                        Select
                      </th>
                      <th className="text-gray-500 border px-3 py-2 text-left">
                        Company
                      </th>
                      <th className="text-gray-500 border px-3 py-2 text-left">
                        Contact Person
                      </th>
                      <th className="text-gray-500 border px-3 py-2 text-left">
                        City
                      </th>
                      <th className="text-gray-500 border px-3 py-2 text-left">
                        State
                      </th>
                      <th className="text-gray-500 border px-3 py-2 text-left">
                        Country
                      </th>
                      <th className="text-gray-500 border px-3 py-2 text-left">
                        Phone Number
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, i) => (
                      <tr key={i} className="even:bg-gray-50">
                        <td className="border px-3 py-2 text-center">
                          <input type="checkbox" />
                        </td>
                        <td className="border px-3 py-2"></td>
                        <td className="text-gray-500 border px-3 py-2">
                          John Doe
                        </td>
                        <td className="text-gray-500 border px-3 py-2">
                          New York
                        </td>
                        <td className="text-gray-500 border px-3 py-2"></td>
                        <td className="text-gray-500 border px-3 py-2">USA</td>
                        <td className="text-gray-500 border px-3 py-2">
                          +1-123-456-7890
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={onClose}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </Box>
      </Modal>

      <Modal open={isModalOpen === "modalTwo"} onClose={onClose}>
        <Box className="fixed inset-0 bg-opacity-40 flex justify-center items-center z-50 text-gray-500">
          <div className="bg-white w-full max-w-2xl rounded shadow-lg p-6 relative">
            {/* Modal Title */}
            <h2 className="text-xl font-medium text-gray-500 mb-4">
              Select Customer - Sales
            </h2>

            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
              onClick={onClose}
            >
              &times;
            </button>

            {/* Name Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            {/* Table */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Select Ship Products
              </h3>
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="p-2 text-left text-gray-600">Select</th>
                      <th className="p-2 text-left text-gray-600">User Name</th>
                      <th className="p-2 text-left text-gray-600">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers && customers.map((user) => (
                      <tr key={user.username} className="border-t">
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.username)}
                            onChange={() => toggleSelect(user.username)}
                          />
                        </td>
                        <td className="p-2">{user.username}</td>
                        <td className="p-2">{user.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-right">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={onClose}
              >
                Submit
              </button>
            </div>
          </div>
        </Box>
      </Modal>

      <Modal open={isModalOpen === "modalThree"} onClose={onClose}>
        <Box className="fixed inset-0 bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-2xl rounded shadow-lg p-6 relative">
            <div className="font-sans mx-5 my-6 leading-relaxed">
              {/* Modal Title */}
              <h1 className="text-lg mb-5 text-gray-500">
                Select Customer - Purchaser
              </h1>

              {/* Close Button */}
              <button
                className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
                onClick={onClose}
              >
                &times;
              </button>

              {/* Name Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              {/* Table Heading */}
              <div className="mb-4 text-gray-500 text-sm font-medium">
                Select Ship Products
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit3}>
                <table className="w-full mb-5 border-collapse text-gray-500 text-sm">
                  <thead>
                    <tr>
                      <th className="p-2 text-left border-b bg-gray-100 font-semibold">
                        Select
                      </th>
                      <th className="p-2 text-left border-b bg-gray-100 font-semibold">
                        User Name
                      </th>
                      <th className="p-2 text-left border-b bg-gray-100 font-semibold">
                        Role
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers && customers.map((customer) => (
                      <tr key={customer.id} className="border-b">
                        <td className="p-2">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={selectedCustomers.includes(customer.id)}
                            onChange={() => handleCheckboxChange(customer.id)}
                          />
                        </td>
                        <td className="p-2">{customer.username}</td>
                        <td className="p-2">{customer.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Submit Button */}
                <div className="text-right">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    onClick={onClose}
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Box>
      </Modal>

      <Modal open={isModalOpen === "modalFour"} onClose={onClose}>
        <Box className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40 text-gray-500">
          <div className="bg-white w-[90%] max-w-5xl rounded-lg shadow-lg p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Select Customer</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            {/* Sub-heading */}
            <h3 className="font-bold mb-2">Select Ship Products</h3>

            {/* Table */}
            <div className="overflow-auto max-h-[400px] border border-gray-300">
              <table className="w-full border-collapse table-auto text-sm">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="border px-2 py-1">Select</th>
                    <th className="border px-2 py-1">Vendor ID</th>
                    <th className="border px-2 py-1">Company Name</th>
                    <th className="border px-2 py-1">Name</th>
                    <th className="border px-2 py-1">City</th>
                    <th className="border px-2 py-1">State</th>
                    <th className="border px-2 py-1">Country</th>
                    <th className="border px-2 py-1">Phone Number</th>
                  </tr>
                </thead>
                <tbody>
                  {customers4 && customers4.map((customer) => (
                    <tr
                      key={customer.id}
                      className={
                        selectedIds.includes(customer.id) ? "bg-gray-100" : ""
                      }
                    >
                      <td className="border px-2 py-1 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(customer.id)}
                          onChange={() => handleSelect(customer.id)}
                        />
                      </td>
                      <td className="border px-2 py-1">{customer.id}</td>
                      <td className="border px-2 py-1">{customer.company_id}</td>
                      <td className="border px-2 py-1">{customer.name}</td>
                      <td className="border px-2 py-1">{customer.city}</td>
                      <td className="border px-2 py-1">{customer.states}</td>
                      <td className="border px-2 py-1">{customer.country}</td>
                      <td className="border px-2 py-1">{customer.tel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Submit Button */}
            <div className="mt-4 text-right">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={onClose}
              >
                Submit
              </button>
            </div>
          </div>
        </Box>
      </Modal>

      <Modal open={isModalOpen === "modalSix"} onClose={onClose}>
        <Box className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40 text-gray-500">
          <div className="bg-white w-[90%] max-w-3xl rounded-lg shadow-lg p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Select Customer - Sales</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            {/* Filter Input */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Name</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
              />
            </div>

            {/* Table Heading */}
            <h3 className="font-bold mb-2">Select Ship Products</h3>

            {/* User Table */}
            <div className="overflow-auto max-h-[300px] border border-gray-300">
              <table className="w-full border-collapse table-auto text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="border px-2 py-1">Select</th>
                    <th className="border px-2 py-1">User Name</th>
                    <th className="border px-2 py-1">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {customers && customers.map((user) => (
                    <tr
                      key={user.id}
                      className={
                        selectedIds6.includes(user.id) ? "bg-gray-100" : ""
                      }
                    >
                      <td className="border px-2 py-1 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds6.includes(user.id)}
                          onChange={() => handleSelect6(user.id)}
                        />
                      </td>
                      <td className="border px-2 py-1">{user.username}</td>
                      <td className="border px-2 py-1">{user.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Submit Button */}
            <div className="mt-4 text-right">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={onClose}
              >
                Submit
              </button>
            </div>
          </div>
        </Box>
      </Modal>

      <Modal open={isModalOpen === "modalSeven"} onClose={onClose}>
        <Box className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40 text-gray-500">
          <div className="bg-white w-full max-w-3xl rounded shadow-lg p-6 relative">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Select Customer - Sales</h2>
              <button
                onClick={onClose}
                className="text-xl font-bold text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {/* Name Search Input */}
            <div className="mb-4">
              <label className="block font-medium mb-1">Name</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 text-sm focus:ring focus:ring-blue-300"
                placeholder="Search by user name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Table Title */}
            <h3 className="font-bold mb-2">Select Ship Products</h3>

            {/* Data Table */}
            <div className="overflow-y-auto max-h-64 border border-gray-300 rounded">
              <table className="w-full table-auto border-collapse text-sm">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="border px-2 py-1 text-left">Select</th>
                    <th className="border px-2 py-1 text-left">User Name</th>
                    <th className="border px-2 py-1 text-left">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {customers && customers.map((user) => (
                    <tr
                      key={user.id}
                      className={
                        selected.includes(user.id) ? "bg-gray-100" : ""
                      }
                    >
                      <td className="border px-2 py-1 text-center">
                        <input
                          type="checkbox"
                          checked={selected.includes(user.id)}
                          onChange={() => handleSelect7(user.id)}
                        />
                      </td>
                      <td className="border px-2 py-1">{user.username}</td>
                      <td className="border px-2 py-1">{user.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Submit Button */}
            <div className="mt-4 flex justify-end">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={onClose}
              >
                Submit
              </button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};
