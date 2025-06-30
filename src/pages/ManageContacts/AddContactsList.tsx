import Select, { SingleValue } from "react-select";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useLocation, useParams } from "react-router";
import { MultiValue } from 'react-select';
import { Button } from "@mui/material";
import {
  createContact,
  getAllCompanies,
  getAllCountry,
  getAllStates,
  getAllUsers,
  getContactById,
  updateContact,
} from "../../services/apis";
import { Box, Modal } from "@mui/material";
import { toast } from "react-toastify";

interface Option {
  value: string;
  label: string;
}

const employeeOptions: Option[] = [
  { value: "1-5", label: "1-5" },
  { value: "6-10", label: "6-10" },
  { value: "11-20", label: "11-20" },
  { value: "21-50", label: "21-50" },
  { value: "51-100", label: "51-100" },
  { value: "101-500", label: "101-500" },
  { value: "501-1000", label: "501-1000" },
  { value: "1001-2000", label: "1001-2000" },
  { value: "2001-5000", label: "2001-5000" },
  { value: "5001-10000", label: "5001-10000" },
];

const membershipTypeOptions: Option[] = [
  { value: "IB", label: "Immediate Buyer (free)" },
  { value: "FB", label: "Future Buyer (free)" },
  { value: "VS", label: "Volunteer Supplier (free)" },
  { value: "C", label: "Corporate:US$299.95/y" },
  { value: "BG", label: "Beginner (US$ 49.95/y)" },
  { value: "SB", label: "US$99.95/y" },
  { value: "M", label: "MediumBiz: US$149.95/y" },
  { value: "B", label: "Banner: US$499.95/y" },
  { value: "BP", label: "BannerPlus: US$799.95/y" },
  { value: "BPP", label: "Banner+++: US$999.95/y" },
  { value: "IS", label: "Internal Staff" },
  { value: "1B", label: "One Time Buyer" },
  { value: "RB", label: "Regular Buyer" },
  { value: "DA", label: "Apply New Distributor" },
  { value: "DI", label: "Current Distributor" },
  { value: "OT", label: "Others" },
];

const typeOptions: Option[] = [
  { value: "1", label: "Private" },
  { value: "2", label: "VIP Private" },
  { value: "3", label: "Vendor" },
  { value: "4", label: "VIP Vendor" },
  { value: "5", label: "Forwarder" },
  { value: "6", label: "VIP Forwarder" },
  { value: "7", label: "User" },
  { value: "8", label: "VIP User" },
  { value: "9", label: "OLD User" },
  { value: "10", label: "Employee" },
  { value: "11", label: "Others" },
];

const categoryOptions: Option[] = [
  { value: "VD", label: "VD" },
  { value: "VC", label: "VC" },
  { value: "NG", label: "NG" },
  { value: "OE", label: "OE" },
  { value: "PU", label: "PU" },
];

const businessTypeOptions: Option[] = [
  { value: "End User", label: "End User" },
  { value: "Import/Export", label: "Import/Export" },
  { value: "Engineering", label: "Engineering" },
  { value: "Contractor", label: "Contractor" },
  { value: "Stockist", label: "Stockist" },
  { value: "Manufacturer", label: "Manufacturer" },
  { value: "Repair Shop", label: "Repair Shop" },
  { value: "Supply Store", label: "Supply Store" },
  { value: "Our Alliance", label: "Our Alliance" },
  { value: "Investor", label: "Investor" },
  { value: "Distributor", label: "Distributor" },
  { value: "Projects", label: "Projects" },
  { value: "Service", label: "Service" },
  { value: "other", label: "Others" },
];

const disciplineOptions: Option[] = [
  { value: "sales", label: "Engineer - Project" },
  { value: "Gathering", label: "Engineer - Gathering" },
  { value: "Process", label: "Engineer - Process" },
  { value: "Subsea", label: "Engineer - Subsea" },
  { value: "Pipeline", label: "Engineer - Pipeline" },
  { value: "Facility", label: "Engineer - Facility" },
  { value: "Manager", label: "Purchasing - Manager" },
  { value: "Commodity", label: "Purchasing - Commodity" },
  { value: "Supervisor", label: "Maintenance - Supervisor" },
  { value: "Facility", label: "Maintenance - Facility" },
  { value: "Field", label: "Maintenance - Field" },
  { value: "Manager", label: "Sales - Manager" },
  { value: "Outside", label: "Sales - Outside" },
  { value: "Inside", label: "Sales - Inside" },
  { value: "President", label: "Executive - President" },
  { value: "VP", label: "Executive - VP" },
  { value: "CEO", label: "Executive - CEO" },
  { value: "Marketing", label: "Marketing" },
  { value: "Academic", label: "Academic" },
  { value: "other", label: "Others" },
];

export const AddContactsList: React.FC = () => {
  const [formData, setFormData] = useState({
    membershipType: membershipTypeOptions[0] as Option | null,
    type: typeOptions[6] as Option | null,
    userId: "",
    password: "",
    ifPrivate: "",
    importance: 0,
    existcustomer: "",
    creditApprove: "",
    company: "",
    companyType: "",
    category: null as Option | null,
    discountLevel: "",
    vendorId: "",
    preferedFreightForwarder: "",
    accountNumber: "",
    tradeMark: "",
    businessType: businessTypeOptions[0] as Option | null,
    employee: null as Option | null,
    products: "",
    contact: "",
    discipline: null as Option | null,
    addressOne: "",
    addressTwo: "",
    country: null as Option | null,
    state: null as Option | null,
    city: "",
    zip: "",
    countryCode: "",
    countryName: "",
    areaCode: "",
    telePhone: "",
    extension: "",
    faxNumber: "",
    mobile: "",
    email: "",
    homePages: "",
    notes: "",
    openTo: [] as Option[],
    innerUse: "",
    companyName: null as Option | null,
  });

  const getBackRoute = () => {
    if (location.state?.from === 'contact') {
      return '/contacts';
    }
    return '/contactsList';
  };

  const [countryOptions, setCountryOptions] = useState<Option[]>([]);
  const [stateOptions, setStateOptions] = useState<Option[]>([]);
  const [openTo, setOpenTo] = useState<Option[]>([]);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isAdditionalModalOpen, setIsAdditionalModalOpen] = useState(false);
  const [companies, setCompanies] = useState<{ id: string; name: string; code: string }[]>([]);
  const [generateIdTarget, setGenerateIdTarget] = useState<"vendor" | "customer" | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const handleGenerateId = () => {
    if (generateIdTarget === "vendor" && formData.companyName) {
      handleChange("vendorId", `V${formData.companyName.value}001`);
    } else if (generateIdTarget === "customer" && formData.companyName) {
      handleChange("existcustomer", `${formData.companyName.value}001`);
      setIsAdditionalModalOpen(true);
    }
    setIsCompanyModalOpen(false);
    setGenerateIdTarget(null);
  };

  const handleChange = (
    name: keyof typeof formData,
    value: string | boolean | Option | null | number
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchCompanies = async () => {
    try {
      const response = await getAllCompanies();
      const companyList = response.data?.data || [];
      setCompanies(companyList);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    }
  };
  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      const users = response.data?.data || [];
      const formattedUsers = users.map((user: any) => ({
        value: user.id,
        label: user.name,
      }));
      setOpenTo(formattedUsers);
    } catch (error) {
      console.error("Failed to fetch account managers:", error);
    }
  };
  const fetchCountries = async () => {
    try {
      const response = await getAllCountry();
      const countries = response.data.data.map((country: any) => ({
        value: country.sql_id,
        label: country.name,
        iso2: country.iso2,
        name: country.name, // Store the actual country name
      }));
      setCountryOptions(countries);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  useEffect(() => {
    if (formData.country && "iso2" in formData.country) {
      fetchStates((formData.country as any).iso2);
    }
  }, [formData.country]);
  
  // Set state after states are loaded for an existing contact
  useEffect(() => {
    if (id && stateOptions.length > 0 && formData.country) {
      const response = getContactById(id);
      response.then(res => {
        const data = res.data?.data;
        if (data && data.state_id) {
          const stateOption = stateOptions.find(opt => opt.value.toString() === data.state_id.toString());
          if (stateOption) {
            handleChange("state", stateOption);
          }
        }
      }).catch(error => {
        console.error("Error fetching contact for state:", error);
      });
    }
  }, [id, stateOptions, formData.country]);

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

  const validate = () => {
    const newErrors: any = {};
    if (!formData.membershipType) newErrors.membershipType = "The MemberShip Type field is required";
    if (!formData.type) newErrors.type = "The Type field is required";
    if (!formData.businessType) newErrors.businessType = "The business Type field is required";
    if (!formData.products) newErrors.products = "The Product field is required";
    if (!formData.contact) newErrors.contact = "The Contact field is required";
    if (!formData.discipline) newErrors.discipline = "The Discipline field is required";
    if (!formData.addressOne) newErrors.addressOne = "The Address One field is required";
    if (!formData.state) newErrors.state = "The State field is required";
    if (!formData.city) newErrors.city = "The City field is required";
    if (!formData.areaCode) newErrors.areaCode = "The AreaCode field is required";
    if (!formData.telePhone) newErrors.telePhone = "The TelePhone field is required";
    if (!formData.email) newErrors.email = "The Email field is required";
    if (!formData.zip) newErrors.zip = "The Zip field is required";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    let openToValue: Option[] = [];
    // if (data.open_to) {
    //   const openToValues = typeof data.open_to === 'string'
    //     ? data.open_to.split(',')
    //     : Array.isArray(data.open_to)
    //       ? data.open_to
    //       : [];

    //   openToValue = openTo
    //     .filter(opt => openToValues.includes(opt.value))
    //     .map(opt => ({ value: opt.value, label: opt.label }));
    // }
    const payload = {
      created_by: "123",
      membership_type: formData.membershipType?.value,
      type: formData.type?.value != null ? String(formData.type.value) : "0",
      user_id: formData.userId,
      password: formData.password,
      if_active: true,
      importance: formData.importance.toString(),
      customer_id: formData.existcustomer,
      credit_approve: formData.creditApprove,
      company_name: formData.company || "",
      sb_type: formData.companyType,
      category: formData.category?.value,
      discount_level: formData.discountLevel,
      vendor_id: formData.vendorId,
      freight: formData.preferedFreightForwarder,
      account_number: formData.accountNumber,
      trade_mark: formData.tradeMark,
      business_type: formData.businessType?.value,
      employee: formData.employee?.value ?? 0,
      business_line: formData.products,
      user_name: formData.contact,
      discipline: formData.discipline?.value,
      address1: formData.addressOne,
      address2: formData.addressTwo,
      country_id: formData.country?.value?.toString(),
      state_id: formData.state?.value?.toString(),
      city: formData.city,
      zip: formData.zip,
      country: formData.country?.label || "",
      country_name: formData.country?.label || "",
      country_code: formData.countryCode,
      area_code: formData.areaCode,
      phone: formData.telePhone,
      extension: formData.extension,
      fax: formData.faxNumber,
      email: formData.email,
      homepage: formData.homePages,
      mobile: formData.mobile,
      notes: formData.notes,
      open_to: formData.openTo.length > 0
        ? formData.openTo.map((opt: Option) => opt.value).join(',')
        : null,
      if_inner: formData.innerUse,
      from_type: formData.openTo.length > 0 ? formData.openTo[0].value : null,
      black_list: false,
      paid: true,
      due_date: "2025-06-30",
      expire_date: "2026-06-30",
      name: formData.contact,
      verifycode: "",
      distributor: "",
      bank: "",
      company_code: "",
      sales: "",
      last_taken_time: "",
      po_date: "",
      assign_by: "",
      log_date: "",
      authorize_date: "",
    };

    try {
      if (id) {
        const response = await updateContact(id, payload);
        console.log("API Response:", response.data);
        toast.success("Contact updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      } else {
        const response = await createContact(payload);
        console.log("API Response:", response.data);
        toast.success("Contact created successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      }
      navigate(getBackRoute());
    } catch (error) {
      console.error("Error creating contact:", error);
      toast.error("An error occurred while saving the contact.", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchCountries(),
          fetchUsers(),
          fetchCompanies()
        ]);
        setIsInitialDataLoaded(true);
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast.error("Failed to load required data");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!id || !isInitialDataLoaded) return;

    const fetchContactData = async () => {
      setLoading(true);
      try {
        const response = await getContactById(id);
        const data = response.data?.data;
        if (data) {
          // Parse phone number - default to putting full phone in telePhone if not properly formatted
          let phoneParts = ['', '', '', ''];
if (data.phone) {
  const parts = data.phone.split('-');
  for (let i = 0; i < 4; i++) {
    phoneParts[i] = parts[i] || '';
  }
}
          
          // If we have country_code and area_code separately, use those
          if (data.country_code) {
            phoneParts[0] = data.country_code;
          }
          if (data.area_code) {
            phoneParts[1] = data.area_code;
          }
          // Process openTo values
          let openToValue: Option[] = [];
          if (data.open_to) {
            console.log("Original open_to data:", data.open_to);
            
            // Check if it's a string (comma-separated) or array
            const openToValues = typeof data.open_to === 'string'
              ? data.open_to.split(',')
              : Array.isArray(data.open_to)
                ? data.open_to
                : [];
                
            console.log("Parsed openToValues:", openToValues);
            console.log("Available openTo options:", openTo);
            
            // Map these values to options from your openTo list
            openToValue = openTo
              .filter(opt => {
                const result = openToValues.includes(opt.value);
                console.log(`Checking if ${opt.value} is in openToValues: ${result}`);
                return result;
              })
              .map(opt => ({ value: opt.value, label: opt.label }));
              
            console.log("Final openToValue:", openToValue);
            
            // If no matches were found but we have values, create options for them
            if (openToValue.length === 0 && openToValues.length > 0) {
              openToValue = openToValues.map(value => ({ 
                value: value, 
                label: value 
              }));
              console.log("Created fallback openToValue:", openToValue);
            }
          }
          const formDataUpdate = {
            membershipType: membershipTypeOptions.find(opt => opt.value === data.membership_type) || null,
            type: typeOptions.find(opt => opt.value === data.type) || null,
            userId: data.user_id || "",
            password: data.password || "",
            ifPrivate: data.if_private ? "Yes" : "NO",
            importance: parseInt(data.importance) || 0,
            existcustomer: data.customer_id || "",
            creditApprove: data.credit_approve,
            company: data.company_name || "",
            companyType: data.sb_type || "",
            category: categoryOptions.find(opt => opt.value === data.category) || null,
            discountLevel: data.discount_level || "",
            vendorId: data.vendor_id || "",
            preferedFreightForwarder: data.freight || "",
            accountNumber: data.account_number || "",
            tradeMark: data.trade_mark || "",
            businessType: businessTypeOptions.find(opt => opt.value === data.business_type) || null,
            employee: employeeOptions.find(opt => opt.value === data.employee?.trim()) || null,
            products: data.business_line || "",
            contact: data.user_name || "",
            discipline: disciplineOptions.find(opt => opt.value === data.discipline) || null,
            addressOne: data.address1 || "",
            addressTwo: data.address2 || "",
            country: countryOptions.find(opt => opt.value.toString() === data.country_id?.toString()) || null,
            city: data.city || "",
            zip: data.zip || "--",
            countryCode: phoneParts[0] || "",
            areaCode: phoneParts[1] || "",
            telePhone: phoneParts[2] || "",  // Main phone number goes here
            extension: phoneParts[3] || "",
            countryName: data.country_name || data.country || "",
            faxNumber: data.fax || "",
            mobile: data.mobile || "",
            email: data.email || "",
            homePages: data.homepage || "",
            notes: data.notes || "",
            openTo: openToValue,

            innerUse: data.if_inner ? "true" : "false",
            companyName: data.company_name
              ? { value: data.company_code || "--", label: data.company_name }
              : null
          };

          setFormData(prev => ({
            ...prev,
            ...formDataUpdate
          }));
        }
      } catch (error) {
        console.error("Failed to fetch contact:", error);
        toast.error("Failed to load contact data");
      } finally {
        setLoading(false);
      }
    };

    fetchContactData();
  }, [id, isInitialDataLoaded, openTo]);

  const backInfo = { title: "Contact View", path: "/ContactsList" };
  const handleCountryChange = (selected: SingleValue<Option>) => {
    handleChange("country", selected);
    handleChange("state", null);
  };
  const handleBack = () => {
    navigate(getBackRoute());
  };
  return (
    <div className="container mx-auto p-6 rounded">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <div>
        <PageBreadcrumb
          pageTitle={id ? "Edit Contacts List " : "Add Contacts List "}
          backInfo={backInfo}

        />
      </div>
      {/* <h1 className="text-2xl font-bold mb-4">Add Problems</h1> */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg "
      >
        <h3 className="text-xl font-semibold mb-3 text-gray-500">Details</h3>
        <hr className=" border-t border-gray-300 mb-3"></hr>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              MemberShip Type<span className="text-red-500">*</span>
            </label>
            <Select
              options={membershipTypeOptions}
              value={formData.membershipType}
              onChange={(selected: SingleValue<Option>) =>
                handleChange("membershipType", selected)
              }
            />
            {errors.membershipType && <span className="text-red-500 text-xs">{errors.membershipType}</span>}
          </div>
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Type<span className="text-red-500">*</span>
            </label>
            <Select
              options={typeOptions}
              value={formData.type}
              onChange={(selected: SingleValue<Option>) =>
                handleChange("type", selected)
              }
            />
            {errors.type && <span className="text-red-500 text-xs">{errors.type}</span>}

          </div>
        </div>

        <div className="grid grid-cols-2  gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              User ID<span className="text-red-500"></span>
            </label>
            <input
              type="text"
              className="w-full  border p-2 rounded"
              value={formData.userId}
              onChange={(e) => handleChange("userId", e.target.value)}
            ></input>
          </div>
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Password <span className="text-red-500"></span>
            </label>
            <input
              type="text"
              className="w-full  border p-2 rounded"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
            ></input>
          </div>
        </div>
        <div className="flex gap-4 ">
          <label className="font-medium mb-2 block text-gray-500">
            If Private
          </label>
          <div>
            <label className="text-gray-500">
              <input
                type="radio"
                name="ifPrivate"
                value="Yes"
                checked={formData.ifPrivate === "Yes"}
                onChange={(e) => handleChange("ifPrivate", e.target.value)}
                className="mr-2"
              />
              Yes
            </label>
          </div>
          <div>
            <label className="text-gray-500">
              <input
                type="radio"
                name="ifPrivate"
                value="NO"
                checked={formData.ifPrivate === "NO"}
                onChange={(e) => handleChange("ifPrivate", e.target.value)}
                className="mr-2"
              />
              NO
            </label>
          </div>
        </div>
        <div className="flex gap-4 ">
          <label className="font-medium mb-2 block text-gray-500">
            Importance
          </label>
          <div>
            <label>
              <input
                type="radio"
                name="importance"
                value="1"
                checked={formData.importance === 1}
                onChange={(e) =>
                  handleChange("importance", parseInt(e.target.value))
                }
                className="mr-2"
              />
              *
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="importance"
                value="2"
                checked={formData.importance === 2}
                onChange={(e) =>
                  handleChange("importance", parseInt(e.target.value))
                }
                className="mr-2"
              />
              **
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="importance"
                value="3"
                checked={formData.importance === 3}
                onChange={(e) =>
                  handleChange("importance", parseInt(e.target.value))
                }
                className="mr-2"
              />
              ***
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="importance"
                value="4"
                checked={formData.importance === 4}
                onChange={(e) =>
                  handleChange("importance", parseInt(e.target.value))
                }
                className="mr-2"
              />
              ****
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="importance"
                value="5"
                checked={formData.importance === 5}
                onChange={(e) =>
                  handleChange("importance", parseInt(e.target.value))
                }
                className="mr-2"
              />
              *****
            </label>
            <label className="text text-gray-500">
              <span>&ensp;(more stars, more important)</span>
            </label>
          </div>
        </div>
        <div className="grid grid-cols-2  gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Exist Customer ID(Have to be blank if no PO)
              <span className="text-red-500"></span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="w-full max-w-[520px] border p-2 rounded"
                value={formData.existcustomer}
                onChange={(e) => handleChange("existcustomer", e.target.value)}
              ></input>
              <Button
                variant="contained"
                onClick={() => {
                  setGenerateIdTarget("customer");
                  setIsCustomerModalOpen(true);
                }}
              >
                Generate ID
              </Button>
            </div>
          </div>
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Credit Approve <span className="text-red-500"></span>
            </label>
            <input
              type="text"
              className="w-full  border p-2 rounded"
              value={formData.creditApprove}
              onChange={(e) => handleChange("creditApprove", e.target.value)}
            ></input>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Company<span className="text-red-500"></span>
            </label>
           <div className="flex items-center gap-x-4">
  <Select
    options={companies.map((company) => ({
      value: company.name,
      label: company.name,
    }))}
    value={formData.company ? { value: formData.company, label: formData.company } : null}
    onChange={(selected: SingleValue<Option>) =>
      handleChange("company", selected ? selected.value : "")
    }
    className="w-full max-w-[750px]"
    placeholder="Select a company"
  />
  <div className="flex items-center gap-x-4">
    <label className="text-gray-500">
      <input
        type="radio"
        name="companyType"
        value="Bill To"
        checked={formData.companyType === "Bill To"}
        onChange={(e) =>
          handleChange("companyType", e.target.value)
        }
        className="mr-2"
      />
      Bill To
    </label>
    <label className="text-gray-500">
      <input
        type="radio"
        name="companyType"
        value="Ship To"
        checked={formData.companyType === "Ship To"}
        onChange={(e) =>
          handleChange("companyType", e.target.value)
        }
        className="mr-2"
      />
      Ship To
    </label>
    <label className="text-gray-500">
      <input
        type="radio"
        name="companyType"
        value="Both"
        checked={formData.companyType === "Both"}
        onChange={(e) =>
          handleChange("companyType", e.target.value)
        }
        className="mr-2"
      />
      Both
    </label>
  </div>
</div>
          </div>
        </div>

        <div className="grid grid-cols-2  gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              category<span className="text-red-500"></span>
            </label>
            <Select
              options={categoryOptions}
              value={formData.category}
              onChange={(selected: SingleValue<Option>) =>
                handleChange("category", selected)
              }
            />
          </div>
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Discount Level (%)<span className="text-red-500"></span>
            </label>
            <div className="relative">
              <input
                type="number"
                className="w-full border p-2 rounded pr-8"
                value={formData.discountLevel}
                onChange={(e) => {
                  // Allow numbers and decimal point
                  if (e.target.value === '' || /^[0-9]*\.?[0-9]*$/.test(e.target.value)) {
                    handleChange("discountLevel", e.target.value);
                  }
                }}
                min="0"
                step="0.01"  // Allows decimals with 2 decimal places
              />
              <span className="absolute right-3 top-2 text-gray-500">%</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2  gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Vendor ID<span className="text-red-500"></span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="w-full max-w-[520px] border p-2 rounded"
                value={formData.vendorId}
                onChange={(e) => handleChange("vendorId", e.target.value)}
              ></input>
              <Button
                variant="contained"
                onClick={() => {
                  setGenerateIdTarget("vendor");
                  setIsVendorModalOpen(true);
                }}
              >
                Generate ID
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2  gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Prefered Freight Forwarder<span className="text-red-500"></span>
            </label>
            <input
              type="text"
              className="w-full  border p-2 rounded"
              value={formData.preferedFreightForwarder}
              onChange={(e) =>
                handleChange("preferedFreightForwarder", e.target.value)
              }
            ></input>
          </div>
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Account Number <span className="text-red-500"></span>
            </label>
            <input
              type="text"
              className="w-full  border p-2 rounded"
              value={formData.accountNumber}
              onChange={(e) => handleChange("accountNumber", e.target.value)}
            ></input>
          </div>
        </div>

        <div className="grid grid-cols-1  gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              TradeMark<span className="text-red-500"></span>
            </label>
            <input
              type="text"
              className="w-full  border p-2 rounded"
              value={formData.tradeMark}
              onChange={(e) => handleChange("tradeMark", e.target.value)}
            ></input>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Business Type<span className="text-red-500">*</span>
            </label>
            <Select
              options={businessTypeOptions}
              value={formData.businessType}
              onChange={(selected: SingleValue<Option>) =>
                handleChange("businessType", selected)
              }
            />
            {errors.businessType && <span className="text-red-500 text-xs">{errors.businessType}</span>}
          </div>
          {console.log("Employee:", formData.employee)}
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Employee<span className="text-red-500">*</span>
            </label>
            <Select
              options={employeeOptions}
              value={formData.employee}
              onChange={(selected: SingleValue<Option>) =>
                handleChange("employee", selected)
              }
              getOptionValue={(option) => option.value}
            />
            {errors.employee && <span className="text-red-500 text-xs">{errors.employee}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1  gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Products<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full  border p-2 rounded"
              value={formData.products}
              onChange={(e) => handleChange("products", e.target.value)}
            ></input>
            {errors.products && <span className="text-red-500 text-xs">{errors.products}</span>}

          </div>
        </div>
        <div className="grid grid-cols-2  gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Contact<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full  border p-2 rounded"
              value={formData.contact}
              onChange={(e) => handleChange("contact", e.target.value)}
            ></input>
            {errors.contact && <span className="text-red-500 text-xs">{errors.contact}</span>}

          </div>
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Discipline<span className="text-red-500">*</span>
            </label>
            <Select
              options={disciplineOptions}
              value={formData.discipline}
              onChange={(selected: SingleValue<Option>) =>
                handleChange("discipline", selected)
              }
            />
            {errors.discipline && <span className="text-red-500 text-xs">{errors.discipline}</span>}
          </div>
        </div>
        <div className="grid grid-cols-1  gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Address One<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full  border p-2 rounded"
              value={formData.addressOne}
              onChange={(e) => handleChange("addressOne", e.target.value)}
            ></input>
            {errors.addressOne && <span className="text-red-500 text-xs">{errors.addressOne}</span>}
          </div>
        </div>
        <div className="grid grid-cols-1  gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Address Two
            </label>
            <input
              type="text"
              className="w-full  border p-2 rounded"
              value={formData.addressTwo}
              onChange={(e) => handleChange("addressTwo", e.target.value)}
            ></input>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div>
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
          <div>
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
            {errors.state && <span className="text-red-500 text-xs">{errors.state}</span>}
          </div>

          <div>
            <label className="font-medium mb-2 text-gray-500">
              City<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full  border p-2 rounded"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
            ></input>
            {errors.city && <span className="text-red-500 text-xs">{errors.city}</span>}
          </div>
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Zip
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={formData.zip}
              onChange={(e) => handleChange("zip", e.target.value)}
            />

          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Country Code
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={formData.countryCode}
              onChange={(e) => handleChange("countryCode", e.target.value)}
            />
          </div>
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Area Code<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={formData.areaCode}
              onChange={(e) => handleChange("areaCode", e.target.value)}
            />
            {errors.areaCode && <span className="text-red-500 text-xs">{errors.areaCode}</span>}
          </div>
          <div>
            <label className="font-medium mb-2 text-gray-500">
              TelePhone<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={formData.telePhone}
              onChange={(e) => handleChange("telePhone", e.target.value)}
            />
            {errors.telePhone && <span className="text-red-500 text-xs">{errors.telePhone}</span>}
          </div>
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Extension
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={formData.extension}
              onChange={(e) => handleChange("extension", e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2  gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Fax Number<span className="text-red-500"></span>
            </label>
            <input
              type="text"
              className="w-full  border p-2 rounded"
              value={formData.faxNumber}
              onChange={(e) => handleChange("faxNumber", e.target.value)}
            ></input>
          </div>
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Mobile<span className="text-red-500"></span>
            </label>
            <input
              type="text"
              className="w-full  border p-2 rounded"
              value={formData.mobile}
              onChange={(e) => handleChange("mobile", e.target.value)}
            ></input>
          </div>
        </div>

        <div className="grid grid-cols-1  gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Email<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="w-full  border p-2 rounded"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            ></input>
            {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
          </div>
        </div>
        <div className="grid grid-cols-1  gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Homepages<span className="text-red-500"></span>
            </label>
            <input
              type="email"
              className="w-full  border p-2 rounded"
              value={formData.homePages}
              onChange={(e) => handleChange("homePages", e.target.value)}
            ></input>
          </div>
        </div>
        <div>
          <label className="font-medium mb-2 block text-gray-500">
            Notes<span className="text-red-500"></span>
          </label>
          <textarea
            className="w-full border p-2 rounded h-22"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="font-medium mb-2 block text-gray-500">
            Open To
          </label>
          <Select
            isMulti
            options={openTo}
            value={formData.openTo}
            onChange={(selected: MultiValue<Option>) =>
              handleChange("openTo", selected as Option[])
            }
            getOptionLabel={(option) => option.label}
            getOptionValue={(option) => option.value}
          />
        </div>

        <div className="grid grid-cols-2">
          <label className="font-medium mb-2 text-gray-500 flex items-center gap-2">
            If InnerUse<span className="text-red-500"></span>
            <input
              type="checkbox"
              value={formData.innerUse}
              onChange={(e) => handleChange("innerUse", e.target.checked)}
              className="h-4 w-4"
            />
            set this user as inner user
          </label>
        </div>

        <div className="flex justify-end gap-2 mb-1 mt-2">
          <Button
            variant="outlined"
            className="bg-pink-300"
            onClick={handleBack}
          >
            Back
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Add Submit
          </Button>
        </div>
      </form>
      <Modal
        open={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
      >
        <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              Does this customer have PO with us now?
            </h2>
            <div className="flex justify-center mt-4 gap-4">
              <button
                className="bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-700"
                onClick={() => {
                  setIsCompanyModalOpen(true);
                  setIsCustomerModalOpen(false);
                }}
              >
                Yes
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                onClick={() => setIsCustomerModalOpen(false)}
              >
                No
              </button>
            </div>
          </div>
        </Box>
      </Modal>

      <Modal
        open={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
      >
        <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              Is this client also a Potential vendor?
            </h2>
            <div className="flex justify-center mt-4 gap-4">
              <button
                className="bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-700"
                onClick={() => {
                  setIsCompanyModalOpen(true);
                  setIsVendorModalOpen(false);
                }}
              >
                Yes
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                onClick={() => setIsVendorModalOpen(false)}
              >
                No
              </button>
            </div>
          </div>
        </Box>
      </Modal>

      <Modal
        open={isCompanyModalOpen}
        onClose={() => {
          setIsCompanyModalOpen(false);
          setGenerateIdTarget(null);
          handleChange("companyName", null);
        }}
      >
        <Box className="fixed inset-0 flex items-start justify-center bg-opacity-50 pt-25">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">
              This PO for which Company
            </h2>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Select Company
              </label>
              <Select
                options={companies.map((company) => ({
                  value: company.code,
                  label: company.name,
                }))}
                value={formData.companyName}
                onChange={(selected: SingleValue<Option>) =>
                  handleChange("companyName", selected)
                }
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                onClick={() => {
                  setIsCompanyModalOpen(false);
                  setGenerateIdTarget(null);
                  handleChange("companyName", null);
                }}
              >
                Close
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                onClick={handleGenerateId}
              >
                Submit
              </button>
            </div>
          </div>
        </Box>
      </Modal>
      <Modal
        open={isAdditionalModalOpen}
        onClose={() => setIsAdditionalModalOpen(false)}
      >
        <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              Is this also a vendor?
            </h2>
            <div className="flex justify-center mt-4 gap-4">
              <button
                className="bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-700"
                onClick={() => {
                  if (formData.companyName) {
                    const code = formData.companyName.value;
                    handleChange("existcustomer", `${code}001`);
                    handleChange("vendorId", `V${code}001`);
                  }
                  setIsAdditionalModalOpen(false);
                }}
              >
                Yes
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                onClick={() => setIsAdditionalModalOpen(false)}
              >
                No
              </button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};
