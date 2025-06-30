import { useLocation, useNavigate, useParams } from "react-router";
import Select from "react-select";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  addProduct,
  getAllCategory,
  getAllCompanies,
  getAllLocation,
  getAllManufacturer,
  getAllMaterial,
  getAllOEM,
  getAllPressure,
  getAllSize,
  getAllSubCategoryByCategoryId,
  getAllUsers,
  getProductById,
  updateProduct,
} from "../../../services/apis";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
interface Option {
  value: string | number;
  label: string;
}

export const CreateUpdateProduct = () => {
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
  const [locationOptions, setLocationOptions] = useState<Option[]>([]);
  const [sizeOptions, setSizeOptions] = useState<Option[]>([]);
  const [companyOptions, setCompanyOptions] = useState<Option[]>([]);
  const [materialOptions, setMaterialOptions] = useState<Option[]>([]);
  const [pressureOptions, setPressureOptions] = useState<Option[]>([]);
  const [manufacturerOptions, setManufacturerOptions] = useState<Option[]>([]);
  const [OEMOptions, setOEMOptions] = useState<Option[]>([]);
  const [openToOptions, setOpenToOptions] = useState<Option[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Option | null>(null);
  const [subCategoryOptions, setSubCategoryOptions] = useState<Option[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<Option | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);

  const [formData, setFormData] = useState<any>({
    purchase: 0,
    distributorPercent: 30,
    retailPercent: 15,
    openTo: [],
    minQty: 10,
    maxQty: 20,
    "normal-ex-works": 45,
    brand: "OEMic",
    price: new Date().toISOString().split("T")[0],
    oemPn: "TBA",
    otherPn: "JMP",
    exchange: 7,
    onSale2: "no",
    onSale3: "no",
    onSale: "no",
    recom_buyer: false,
    recom_seller: false,
    regular_cost: "0.00",
    sales_price: "0.00",
    list_price: "0.00",
    importance: 5, // Default Min. Qty set to 10
  });
  const [errors, setErrors] = useState<any>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value, type, name } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [id || name]:
        type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (field: string, option: Option | null) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: option,
    }));
  };

  const validate = () => {
    const newErrors: any = {};
    if (!selectedCategory)
      newErrors.category = "The category field is required";
    if (!formData.model) newErrors.model = "The model field is required";
    if (!formData.partNumber)
      newErrors.partNumber = "The parts no field is required.";
    if (!formData.size) newErrors.size = "The size field is required.";
    if (!formData.pressure)
      newErrors.pressure = "The pressure field is required.";
    if (!formData.purchase)
      newErrors.purchase = "The purchase cost field is required.";
    if (!formData.regular_cost)
      newErrors.regular_cost = "The regular cost field is required.";
    if (!formData.sales_price)
      newErrors.sales_price = "The Distributor price field is required.";
    return newErrors;
  };
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const payload = {
      user_id: 1, // already a number in response
      outof_stock: 0,
      category_id: Number(selectedCategory?.value) || 0,
      subcategory_id: Number(selectedSubCategory?.value) || 0,
      inventory_location: Number(formData.inventoryLocation?.value) || 0,
      own_by: String(formData.ownedBy?.value || ""), // response shows string
      model: formData.model || "",
      weight: String(formData.weight || "0"), // weight in response is string
      parts_no: formData.partNumber || "",
      size_id: Number(formData.size?.value) || 0,
      material_id: Number(formData.material?.value) || 0,
      pressure_id: Number(formData.pressure?.value) || 0,
      quantity: Number(formData.qty) || 0,
      min_qty: Number(formData.minQty) || 0,
      max_qty: Number(formData.maxQty) || 0,
      manufacturer: String(formData.manufacturer?.value || ""), // response shows string id
      exwork_days: String(formData["normal-ex-works"] || ""),
      brand: formData.brand || "",
      valid_since: formData.price || "",
      oem: String(formData.oem?.value || ""),
      oem_pn: formData.oemPn || "",
      other_oems: formData.otherPn || "",
      exg_rate: String(formData.exchange || ""),
      factory_cost: Number(formData.factoryCost) || 0,
      export_cost: Number(formData.export) || 0,
      purchase_cost: Number(formData.purchase) || 0,
      price_3a0: Number(formData.factorySelling) || 0,
      importantance: Number(formData.importance) || 0,
      flag_onsale: formData.onSale === "yes",
      flag_lowercost: formData.onSale2 === "yes",
      flag_surplus: formData.onSale3 === "yes",
      rack: formData.rack || "",
      internal_notes: formData.internalNotes || "",
      c_notes: formData.confidential || "",
      physical_qty: Number(formData.qty) || 0,
      qty_ontheway: 0,
      qty_inproduce: 0,
      qty_a: 0,
      opento:
        Array.isArray(formData.openTo) && formData.openTo.length > 0
          ? formData.openTo.map((opt: Option) => opt.value).join(",")
          : null,
      price_term: "Ex-Works",
      net_purchase_cost: Number(formData.purchase) || 0,
      price_term_3a0: "Ex-Works",
      prof: "0",
      regular_cost: Number(formData.regular_cost) || 0,
      list_converter: "",
      list_price: Number(formData.list_price) || 0,
      multiplier: Number(formData.factorForDistributor) || 0,
      sales_price: Number(formData.sales_price) || 0,
      price_3b: 0,
      description: formData.description || "",
      note_seller: "",
      recom_buyer: false,
      recom_seller: false,
      photo: "",
      curve_img: "",
      dimension_img: "",
      photo_file_name: "",
      curve_img_file_name: "",
      dimension_img_file_name: "",
    };

    // Check for any null or undefined values that might cause issues
    const nullFields = Object.entries(payload).filter(
      ([, value]) => value === null || value === undefined
    );
    if (nullFields.length > 0) {
      console.warn("Fields with null/undefined values:", nullFields);
    }

    try {
      if (id) {
        const response = await updateProduct(formData.id, payload);
        console.log(id, "id");

        console.log("API Response:", response.data);
        toast.success("Product updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      } else {
        await addProduct(payload);
        toast.success("Product added successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
        setFormData({});
        setSelectedCategory(null);
        setSelectedSubCategory(null);
        setErrors({});
      }
      navigate(-1);
    } catch (error) {
      console.error("Full error:", error);
      if ((error as any).response) {
        console.error("Error response data:", (error as any).response.data);
        toast.error(
          `Error: ${
            (error as any).response.data.message ||
            (error as any).response.statusText
          }`,
          {
            position: "top-right",
            autoClose: 3000,
            style: { zIndex: 9999999999, marginTop: "4rem" },
          }
        );
      } else {
        toast.error("An unknown error occurred", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      }
    }
  };
  const handleDateChange = (date: Date[] | string[]) => {
    const selectedDate =
      Array.isArray(date) && date.length > 0
        ? date[0] instanceof Date
          ? date[0].toLocaleDateString("en-CA") // formats as yyyy-mm-dd in local time
          : date[0]
        : "";

    setFormData((prev: any) => ({
      ...prev,
      delivery_date: selectedDate,
    }));
  };

  useEffect(() => {
    fetchOpenTo();
    fetchOEM();
    fetchManufacturer();
    fetchPressure();
    fetchMaterials();
    fetchCompanies();
    fetchSizes();
    fetchLocations();
    fetchCategories();
  }, []);

  const fetchOpenTo = async () => {
    try {
      const res = await getAllUsers();
      if (res?.data?.data) {
        const options = res.data.data.map((user: any) => ({
          value: user.id,
          label: user.name,
        }));
        setOpenToOptions(options);

        // Set defaults only for new products
        if (!id) {
          const defaultUsers = getDefaultOpenToUsers(options);
          setFormData((prev) => ({
            ...prev,
            openTo: defaultUsers,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };
  // Helper function to find users by name pattern
  const getDefaultOpenToUsers = (openToOptions: Option[]) => {
    const defaultUsers = [
      "Sales27",
      "Sales23",
      "Sales25",
      "Sales33",
      "AccountingUSA",
    ];

    return openToOptions.filter((opt) =>
      defaultUsers.some((user) => opt.label.includes(user))
    );
  };
  const fetchOEM = async () => {
    try {
      const res = await getAllOEM();
      if (res?.data?.data) {
        const options = res.data.data.map((oem: any) => ({
          value: oem.id,
          label: oem.name,
        }));
        setOEMOptions(options);

        // Find and set "Cameron" as default (case-insensitive)
        const cameronOEM = options.find((opt) =>
          opt.label.toLowerCase().includes("cameron")
        );

        if (cameronOEM && !id) {
          // Only set default for new products
          setFormData((prev) => ({
            ...prev,
            oem: cameronOEM,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch OEMs", error);
    }
  };
  const fetchManufacturer = async () => {
    try {
      const res = await getAllManufacturer();
      if (res?.data?.data) {
        const options = res.data.data.map((man: any) => ({
          value: man.id,
          label: man.name,
        }));
        setManufacturerOptions(options);

        // Find and set "JF" as default
        const jfManufacturer = options.find((opt) =>
          opt.label.toLowerCase().includes("jf")
        );

        if (jfManufacturer) {
          setFormData((prev) => ({
            ...prev,
            manufacturer: jfManufacturer,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch manufacturers", error);
    }
  };
  const fetchPressure = async () => {
    try {
      const res = await getAllPressure();
      if (res?.data?.data) {
        const options = res.data.data.map((pre: any) => ({
          value: pre.id,
          label: pre.name,
          raw: pre,
        }));
        setPressureOptions(options);
      }
    } catch (error) {
      console.error("Failed to fetch pressure", error);
    }
  };
  const fetchMaterials = async () => {
    try {
      const res = await getAllMaterial();
      if (res?.data?.data) {
        const options = res.data.data.map((mat: any) => ({
          value: mat.id || mat.name,
          label: mat.name,
          raw: mat,
        }));
        setMaterialOptions(options);

        // Set "4130 Alloy" as default
        const alloy4130 = options.find((opt) =>
          opt.label.toLowerCase().includes("4130 alloy")
        );

        if (alloy4130) {
          setFormData((prev) => ({
            ...prev,
            material: alloy4130,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch materials", error);
    }
  };
  // After fetching companies, set the default value
  const fetchCompanies = async () => {
    try {
      const res = await getAllCompanies();
      if (res?.data?.data) {
        const options = res.data.data.map((company: any) => ({
          value: company.id,
          label: company.name,
        }));
        setCompanyOptions(options);

        // Find IBY OUTLET by its known ID (605)
        const iByOutlet = options.find((opt) => opt.value === 605);
        if (iByOutlet) {
          setFormData((prev) => ({
            ...prev,
            ownedBy: iByOutlet,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch companies", error);
    }
  };
  const fetchSizes = async () => {
    try {
      const res = await getAllSize();
      if (res?.data?.data) {
        const options = res.data.data.map((size: any) => ({
          value: size.id,
          label: size.name,
        }));
        setSizeOptions(options);
      }
    } catch (error) {
      console.error("Failed to fetch sizes", error);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await getAllLocation();
      if (res?.data?.data) {
        const locations = res.data.data.map((location: any) => ({
          value: location.id,
          label: location.name,
        }));
        setLocationOptions(locations);

        // Find and set "Houston" as default (case-insensitive)
        const houstonLocation = locations.find((opt) =>
          opt.label.toLowerCase().includes("houston")
        );

        if (houstonLocation && !id) {
          // Only set default for new products
          setFormData((prev) => ({
            ...prev,
            inventoryLocation: houstonLocation,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch locations", error);
    }
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
      if (!selectedCategory) {
        setSubCategoryOptions([]);
        setSelectedSubCategory(null);
        return;
      }
      try {
        const res = await getAllSubCategoryByCategoryId(selectedCategory.value);
        if (res?.data?.data) {
          const options = res.data.data.map((sub: any) => ({
            value: sub.id,
            label: sub.name,
          }));
          setSubCategoryOptions(options);
        } else {
          setSubCategoryOptions([]);
        }
      } catch (error) {
        setSubCategoryOptions([]);
        console.error("Failed to fetch subcategories", error);
      }
    };
    fetchSubCategories();
  }, [selectedCategory]);

  let { id } = useParams();
  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        try {
          setLoading(true);
          const res = await getProductById(id);

          const data = res.data?.data[0];
          if (data) {
            setFormData({
              id: data.id,
              inventoryLocation: locationOptions.find(
                (opt) => String(opt.value) === String(data.inventory_location)
              ),
              openTo: data.opento
                ? openToOptions.filter((opt) =>
                    data.opento
                      .split(",")
                      .map((id: string) => id.trim())
                      .includes(String(opt.value))
                  )
                : [],
              ownedBy: companyOptions.find(
                (opt) => String(opt.value) === String(data.own_by)
              ),
              model: data.model,
              weight: data.weight,
              partNumber: data.parts_no,
              size: sizeOptions.find(
                (opt) => String(opt.value) === String(data.size_id)
              ),
              material: materialOptions.find(
                (opt) => String(opt.value) === String(data.material_id)
              ),
              pressure: pressureOptions.find(
                (opt) => String(opt.value) === String(data.pressure_id)
              ),
              qty: data.quantity,
              minQty: data.min_qty,
              maxQty: data.max_qty,
              manufacturer: manufacturerOptions.find(
                (opt) => String(opt.value) === String(data.manufacturer)
              ),
              "normal-ex-works": data.exwork_days,
              brand: data.brand,
              price: data.valid_since,
              oem: OEMOptions.find(
                (opt) => String(opt.value) === String(data.oem)
              ),
              oemPn: data.oem_pn,
              otherPn: data.other_oems,
              exchange: data.exg_rate,
              factoryCost: data.factory_cost?.$numberDecimal,
              export: data.export_cost?.$numberDecimal,
              purchase: data.purchase_cost?.$numberDecimal,
              factorySelling: data.price_3a0?.$numberDecimal,
              sales_price: data.sales_price?.$numberDecimal,
              list_price: data.list_price?.$numberDecimal,
              regular_cost: data.regular_cost?.$numberDecimal || "",
              factorForDistributor: data.multiplier,
              importance: data.importantance,
              onSale: data.flag_onsale ? "yes" : "no",
              onSale2: data.flag_lowercost ? "yes" : "no",
              onSale3: data.flag_surplus ? "yes" : "no",
              rack: data.rack,
              internalNotes: data.internal_notes,
              confidential: data.c_notes,
            });
            if (!selectedCategory) {
              setSelectedCategory(
                categoryOptions.find(
                  (opt) => String(opt.value) === String(data.category_id)
                ) || null
              );
            }
            if (!selectedSubCategory) {
              setSelectedSubCategory(
                subCategoryOptions.find(
                  (opt) => String(opt.value) === String(data.subcategory_id)
                ) || null
              );
            }
          }
        } catch (error) {
          console.error("Failed to fetch product for update", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProduct();
  }, [
    id,
    categoryOptions,
    subCategoryOptions,
    locationOptions,
    companyOptions,
    sizeOptions,
    materialOptions,
    pressureOptions,
    manufacturerOptions,
    OEMOptions,
    openToOptions,
  ]);

  useEffect(() => {
    const purchase = parseFloat(formData.purchase) || 0;
    const distributorPercent = parseFloat(formData.distributorPercent) || 0;
    const retailPercent = parseFloat(formData.retailPercent) || 0;

    // Distributor Price: purchase + (purchase * distributor %)
    const distributorPrice =
      purchase > 0
        ? (purchase + purchase * (distributorPercent / 100)).toFixed(2)
        : "";

    // Retail Price: distributorPrice - (distributorPrice * retail %)
    const retailPrice = distributorPrice
      ? (
          parseFloat(distributorPrice) -
          parseFloat(distributorPrice) * (retailPercent / 100)
        ).toFixed(2)
      : "";

    // Regular Price: (purchase + 8%) + (purchase * distributor %) - (purchase * retail %)
    const regularPrice =
      purchase > 0
        ? (
            purchase * 1.08 +
            purchase * (distributorPercent / 100) -
            purchase * (retailPercent / 100)
          ).toFixed(2)
        : "";

    setFormData((prev: any) => ({
      ...prev,
      sales_price: distributorPrice,
      list_price: retailPrice,
      regular_cost: regularPrice,
    }));
  }, [formData.purchase, formData.distributorPercent, formData.retailPercent]);

  const handleMultiSelectChange = (field: string, selectedOptions: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: selectedOptions || [],
    }));
  };

  const handleChange = (
    name: keyof typeof formData,
    value: string | boolean | Option | Option[] | null
  ) => {
    if (name === "openTo" && Array.isArray(value)) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const location = useLocation();
  const from = location.state?.from;
  const backInfo =
    from === "priceshare"
      ? { title: "Price Share", path: "/priceShare" }
      : from === "viewStock"
      ? { title: "Stock List", path: "/viewStock" }
      : { title: "Products", path: "/products" };

  return (
    <div>
      <PageBreadcrumb
        pageTitle={id ? "Update Product" : "Add Product"}
        backInfo={backInfo}
      />
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <ComponentCard title="Details:">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 text-gray-500 dark:text-white/90"
        >
          <div className="grid xl:grid-cols-4 gap-x-4 gap-y-6 grid-cols-2">
            <div className="flex flex-col">
              <label htmlFor="category" className="font-medium mb-2">
                Category<span className="text-red-500">*</span>
              </label>
              <Select
                inputId="category"
                options={categoryOptions}
                value={selectedCategory}
                onChange={(option) => {
                  setSelectedCategory(option as Option);
                  setSelectedSubCategory(null);
                }}
                className={`w-full border  rounded ${
                  errors.model ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Category..."
              />
              {errors.category && (
                <span className="text-red-500 text-xs">{errors.category}</span>
              )}
            </div>
            <div className="flex flex-col">
              <label htmlFor="subCategory" className="font-medium mb-2">
                Sub Category<span className="text-red-500">*</span>
              </label>
              <Select
                inputId="subCategory"
                options={subCategoryOptions}
                value={selectedSubCategory}
                onChange={(option) => setSelectedSubCategory(option as Option)}
                className="w-full"
                placeholder="Sub Category..."
                isDisabled={!selectedCategory}
              />
              {errors.subCategory && (
                <span className="text-red-500 text-xs">
                  {errors.subCategory}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label htmlFor="inventoryLocation" className="font-medium mb-2">
                Inventory Location
              </label>
              <Select
                inputId="inventoryLocation"
                options={locationOptions}
                value={formData.inventoryLocation || null}
                onChange={(option) =>
                  handleSelectChange("inventoryLocation", option)
                }
                className="w-full"
                placeholder="Select location..."
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="ownedBy" className="font-medium mb-2">
                Owned By<span className="text-red-500">*</span>
              </label>
              <Select
                inputId="ownedBy"
                options={companyOptions}
                value={formData.ownedBy || null}
                onChange={(option) =>
                  handleSelectChange("ownedBy", option as Option)
                }
                className="w-full"
                placeholder="Owned By..."
              />
              {errors.ownedBy && (
                <span className="text-red-500 text-xs">{errors.ownedBy}</span>
              )}
            </div>
            <div className="flex flex-col">
              <label htmlFor="model" className="font-medium mb-2">
                Model
                <span className="text-red-500">*</span>
              </label>
              <input
                id="model"
                type="text"
                className={`w-full border p-2 rounded ${
                  errors.model ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter Model..."
                value={formData.model || ""}
                onChange={handleInputChange}
              />
              {errors.model && (
                <span className="text-red-500 text-xs">{errors.model}</span>
              )}
            </div>
            <div className="flex flex-col">
              <label htmlFor="weight" className="font-medium mb-2">
                Weight
                <span className="text-red-500">*</span>
              </label>
              <input
                id="weight"
                type="number"
                className="w-full border p-2 rounded"
                placeholder="Enter Weight..."
                value={formData.weight || ""}
                onChange={handleInputChange}
              />
              {errors.weight && (
                <span className="text-red-500 text-xs">{errors.weight}</span>
              )}
            </div>
            <div className="flex flex-col">
              <label htmlFor="partNumber" className="font-medium mb-2">
                P/N
                <span className="text-red-500">*</span>
              </label>
              <input
                id="partNumber"
                type="text"
                className={`w-full border p-2 rounded ${
                  errors.partNumber ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter P/N..."
                value={formData.partNumber || ""}
                onChange={handleInputChange}
              />
              {errors.partNumber && (
                <span className="text-red-500 text-xs">
                  {errors.partNumber}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <label htmlFor="size" className="font-medium mb-2">
                Size
                <span className="text-red-500">*</span>
              </label>
              <Select
                inputId="size"
                options={sizeOptions}
                value={formData.size || null}
                onChange={(option) =>
                  handleSelectChange("size", option as Option)
                }
                // className="w-full"
                className={`w-full border rounded ${
                  errors.size ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Size..."
              />
              {errors.size && (
                <span className="text-red-500 text-xs">{errors.size}</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <div className="flex flex-col">
              <label htmlFor="material" className="font-medium mb-2">
                Material
                <span className="text-red-500">*</span>
              </label>
              <Select
                inputId="material"
                options={materialOptions}
                value={formData.material || null}
                onChange={(option) =>
                  handleSelectChange("material", option as Option)
                }
                className="w-full"
                placeholder="Material..."
              />
              {errors.material && (
                <span className="text-red-500 text-xs">{errors.material}</span>
              )}
            </div>
            <div className="flex flex-col">
              <label htmlFor="pressure" className="font-medium mb-2">
                Pressure
                <span className="text-red-500">*</span>
              </label>
              <Select
                inputId="pressure"
                options={pressureOptions}
                value={formData.pressure || null}
                onChange={(option) =>
                  handleSelectChange("pressure", option as Option)
                }
                // className="w-full"
                className={`w-full border rounded ${
                  errors.pressure ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Pressure..."
              />
              {errors.pressure && (
                <span className="text-red-500 text-xs">{errors.pressure}</span>
              )}
            </div>
          </div>
          <div className="flex flex-col w-full">
            <label htmlFor="inventoryQuantity" className="font-medium mb-2">
              Inventory Quantity<span className="text-red-500">*</span>
            </label>
            <div className="flex w-full gap-4">
              <div className="flex flex-col w-full">
                <label htmlFor="qty" className="font-medium mb-2">
                  Quantity
                </label>
                <input
                  id="qty"
                  type="number"
                  className="w-full border p-2 rounded"
                  placeholder="Enter Quantity..."
                  value={formData.qty || ""}
                  onChange={handleInputChange}
                />
                {errors.qty && (
                  <span className="text-red-500 text-xs">{errors.qty}</span>
                )}
              </div>
              <div className="flex flex-col w-full">
                <label htmlFor="minQty" className="font-medium mb-2">
                  Min. Qty
                </label>
                <input
                  id="minQty"
                  type="number"
                  className="w-full border p-2 rounded"
                  placeholder="Enter Min Qty..."
                  value={formData.minQty || ""}
                  onChange={handleInputChange}
                />
                {errors.minQty && (
                  <span className="text-red-500 text-xs">{errors.minQty}</span>
                )}
              </div>
              <div className="flex flex-col w-full">
                <label htmlFor="maxQty" className="font-medium mb-2">
                  Max. Qty
                </label>
                <input
                  id="maxQty"
                  type="number"
                  className="w-full border p-2 rounded"
                  placeholder="Enter Max Qty..."
                  value={formData.maxQty || ""}
                  onChange={handleInputChange}
                />
                {errors.maxQty && (
                  <span className="text-red-500 text-xs">{errors.maxQty}</span>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <div className="flex flex-col">
              <label htmlFor="manufacturer" className="font-medium mb-2">
                Manufacturer<span className="text-red-500">*</span>
              </label>
              <Select
                inputId="manufacturer"
                options={manufacturerOptions}
                value={formData.manufacturer || null}
                onChange={(option) =>
                  handleSelectChange("manufacturer", option as Option)
                }
                className="w-full"
                placeholder="Manufacturer..."
              />
              {errors.manufacturer && (
                <span className="text-red-500 text-xs">
                  {errors.manufacturer}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <label htmlFor="normal-ex-works" className="font-medium mb-2">
                Normal EX-Woks(days)<span className="text-red-500">*</span>
              </label>
              <input
                id="normal-ex-works"
                type="number"
                className="w-full border p-2 rounded"
                placeholder="Enter Normal Ex-woks..."
                value={formData["normal-ex-works"] || ""}
                onChange={handleInputChange}
              />
              {errors["normal-ex-works"] && (
                <span className="text-red-500 text-xs">
                  {errors["normal-ex-works"]}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <label htmlFor="brand" className="font-medium mb-2">
                Brand
                <span className="text-red-500">*</span>
              </label>
              <input
                id="brand"
                type="text"
                className="w-full border p-2 rounded"
                placeholder="Enter Brand..."
                value={formData.brand || ""}
                onChange={handleInputChange}
              />
              {errors.brand && (
                <span className="text-red-500 text-xs">{errors.brand}</span>
              )}
            </div>
            <div>
              <label className="font-medium mb-2">
                Since Valid Date <span className="text-red-500">*</span>
              </label>
              <Flatpickr
                value={formData.price || ""}
                onChange={(dates) => {
                  handleChange(
                    "price",
                    dates.length ? dates[0].toLocaleDateString("en-CA") : ""
                  );
                }}
                options={{
                  dateFormat: "Y-m-d",
                  defaultDate: formData.price || "",
                }}
                placeholder="Select an option"
                className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-x-4 gap-y-6 ">
            <div className="flex flex-col">
              <label htmlFor="oem" className="font-medium mb-2">
                OEM<span className="text-red-500">*</span>
              </label>
              <Select
                inputId="oem"
                options={OEMOptions}
                value={formData.oem || null}
                onChange={(option) =>
                  handleSelectChange("oem", option as Option)
                }
                className="w-full"
                placeholder="OEM..."
              />
              {errors.oem && (
                <span className="text-red-500 text-xs">{errors.oem}</span>
              )}
            </div>
            <div className="flex flex-col">
              <label htmlFor="oemPn" className="font-medium mb-2">
                OEM P/N
                <span className="text-red-500">*</span>
              </label>
              <input
                id="oemPn"
                type="text"
                className="w-full border p-2 rounded"
                placeholder="Enter OEM P/N..."
                value={formData.oemPn || ""}
                onChange={handleInputChange}
              />
              {errors.oemPn && (
                <span className="text-red-500 text-xs">{errors.oemPn}</span>
              )}
            </div>
            <div className="flex flex-col">
              <label htmlFor="otherPn" className="font-medium mb-2">
                Other OEM
                <span className="text-red-500">*</span>
              </label>
              <input
                id="otherPn"
                type="text"
                className="w-full border p-2 rounded"
                placeholder="Enter Other OEM..."
                value={formData.otherPn || ""}
                onChange={handleInputChange}
              />
              {errors.otherPn && (
                <span className="text-red-500 text-xs">{errors.otherPn}</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <div className="flex flex-col">
              <label htmlFor="exchange" className="font-medium mb-2">
                Exchange Rate
                <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <input
                  id="exchange"
                  type="number"
                  className="w-full border p-2 rounded"
                  placeholder="Enter Exchange Rate..."
                  value={formData.exchange || ""}
                  onChange={handleInputChange}
                />
                {/* <input
                                    id="exchange2"
                                    type="number"
                                    className="w-full border p-2 rounded"
                                    value={formData.exchange2 || ""}
                                    onChange={handleInputChange}
                                /> */}
              </div>
              {errors.exchange && (
                <span className="text-red-500 text-xs">{errors.exchange}</span>
              )}
            </div>
            <div className="flex flex-col">
              <label htmlFor="factoryCost" className="font-medium mb-2">
                Factory Cost(RMB)
                <span className="text-red-500">*</span>
              </label>
              <input
                id="factoryCost"
                type="number"
                className="w-full border p-2 rounded"
                placeholder="Enter Factory Cost..."
                value={formData.factoryCost || ""}
                onChange={handleInputChange}
              />
              {errors.factoryCost && (
                <span className="text-red-500 text-xs">
                  {errors.factoryCost}
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-y-6">
            <div className="flex flex-col">
              <label htmlFor="export" className="font-medium mb-2">
                Export Cost(USD)
                <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-3">
                <input
                  id="export"
                  type="number"
                  className="w-full border p-2 rounded"
                  placeholder="Enter Export Cost..."
                  value={formData.export || ""}
                  onChange={handleInputChange}
                />
              </div>
              {errors.export && (
                <span className="text-red-500 text-xs">{errors.export}</span>
              )}
            </div>
          </div>

          {/* --- Pricing Section --- */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <div className="flex flex-col">
              <label htmlFor="purchase" className="font-medium mb-2">
                Purchase Cost (3) (USD)
                <span className="text-red-500">*</span>
              </label>
              <input
                id="purchase"
                type="number"
                className={`w-full border p-2 rounded ${
                  errors.purchase ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter Purchase Cost..."
                value={formData.purchase || ""}
                onChange={handleInputChange}
              />
              {errors.purchase && (
                <span className="text-red-500 text-xs">{errors.purchase}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <div className="flex flex-col">
              <label htmlFor="regular_cost" className="font-medium mb-2">
                Regular Price (USD)<span className="text-red-500">*</span>
              </label>
              <input
                id="regular_cost"
                type="number"
                step="0.01"
                min="0"
                className={`w-full border p-2 rounded ${
                  errors.regular_cost ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Auto-calculated Regular Price"
                value={formData.regular_cost || "0.00"}
                onChange={handleInputChange}
              />
              {errors.regular_cost && (
                <span className="text-red-500 text-xs">
                  {errors.regular_cost}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <div className="flex flex-col">
              <label htmlFor="distributorPercent" className="font-medium mb-2">
                Factor for Distributor Price (%)
              </label>
              <input
                id="distributorPercent"
                type="number"
                className="w-full border p-2 rounded"
                placeholder="Enter Distributor Percent..."
                value={formData.distributorPercent}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="sales_price" className="font-medium mb-2">
                Distributor Price (USD)
              </label>
              <input
                id="sales_price"
                type="number"
                step="0.01"
                min="0"
                className="w-full border p-2 rounded"
                value={formData.sales_price || "0.00"}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <div className="flex flex-col">
              <label htmlFor="retailPercent" className="font-medium mb-2">
                Factor for Retail Price (%)
              </label>
              <input
                id="retailPercent"
                type="number"
                className="w-full border p-2 rounded"
                placeholder="Enter Retail Percent..."
                value={formData.retailPercent}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="list_price" className="font-medium mb-2">
                Retail Price (USD)
              </label>
              <input
                id="list_price"
                type="number"
                step="0.01"
                min="0"
                className="w-full border p-2 rounded"
                value={formData.list_price || "0.00"}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-4 gap-y-6">
            <div className="flex flex-col">
              <label htmlFor="openTo" className="font-medium mb-2">
                Open To
                <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <Select
                  inputId="openTo"
                  options={openToOptions}
                  value={formData.openTo || []}
                  onChange={(selected) =>
                    handleMultiSelectChange("openTo", selected)
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
            <div className="flex flex-col">
              <label htmlFor="importance" className="font-medium mb-2">
                Importantance
              </label>
              <div className="flex gap-3">
                <input
                  id="importance"
                  type="number"
                  className="w-full border p-2 rounded"
                  placeholder="Enter Importance..."
                  value={formData.importance || ""}
                  onChange={handleInputChange}
                />
              </div>
              <span className="text-xs ">
                The more important that the greater value
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-x-4 gap-y-3">
            <div className="flex flex-col">
              <label className="font-medium mb-2">On Sale</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="onSale"
                    value="yes"
                    checked={formData.onSale === "yes"}
                    onChange={handleRadioChange}
                  />
                  Yes
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="onSale"
                    value="no"
                    checked={formData.onSale === "no"}
                    onChange={handleRadioChange}
                  />
                  No
                </label>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="font-medium mb-2">Ipayless2</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="onSale2"
                    value="YES"
                    checked={formData.onSale2 === "Yes"}
                    onChange={handleRadioChange}
                  />
                  Yes
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="onSale2"
                    value="NO"
                    checked={formData.onSale2 === "No"}
                    onChange={handleRadioChange}
                  />
                  No
                </label>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="font-medium mb-2">If Surplus</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="onSale2"
                    value="yes"
                    checked={formData.onSale2 === "yes"}
                    onChange={handleRadioChange}
                  />
                  Yes
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="onSale2"
                    value="no"
                    checked={formData.onSale2 === "no"}
                    onChange={handleRadioChange}
                  />
                  No
                </label>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-2">
            <label htmlFor="rack" className="font-medium mb-2">
              Rack#
            </label>
            <textarea
              className="w-full border p-2 rounded"
              rows={4}
              id="rack"
              placeholder="Enter Rack#..."
              value={formData.rack || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-2">
            <label htmlFor="internalNotes" className="font-medium mb-2">
              Internal Notes
            </label>
            <textarea
              className="w-full border p-2 rounded"
              rows={4}
              placeholder="Enter Internal Notes..."
              id="internalNotes"
              value={formData.internalNotes || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-2">
            <label htmlFor="confidential" className="font-medium mb-2">
              Confidential Notes
            </label>
            <textarea
              className="w-full border p-2 rounded"
              rows={4}
              placeholder="Enter Confidential Notes..."
              id="confidential"
              value={formData.confidential || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div className="flex flex-col">
              <label className="font-medium mb-2">
                Recommended by Purchaser
              </label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="onSale3"
                    value="yes"
                    checked={formData.onSale3 === "yes"}
                    onChange={handleRadioChange}
                  />
                  Yes
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="onSale3"
                    value="no"
                    checked={formData.onSale3 === "no"}
                    onChange={handleRadioChange}
                  />
                  No
                </label>
              </div>
            </div>
            <div className="flex flex-col">
              <label className="font-medium mb-2">
                SALES RECOMMENDED PRICE
              </label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="recom_seller"
                    checked={formData.recom_seller === true}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, recom_seller: true }))
                    }
                  />
                  Yes
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="recom_seller"
                    checked={formData.recom_seller === false}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, recom_seller: false }))
                    }
                  />
                  No
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <button
              type="submit"
              onClick={handleSubmit}
              className="bg-brand text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};
