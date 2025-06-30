import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Input from "../../components/form/input/InputField";
import Radio from "../../components/form/input/Radio";
import Label from "../../components/form/Label";
import Select from "react-select";
import Button from "../../components/ui/button/Button";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  addSales,
  getAllCompanies,
  getAllContact,
  getAllUsers,
  getSalesById,
  updateSales,
} from "../../services/apis";

type Option = {
  label: string;
  value: string;
};

const SHIP_FROM_OPTIONS: Option[] = [
  { label: "Canada - Calgary", value: "246" },
  { label: "Canada - Edmonton", value: "245" },
  { label: "Canada - Estevan, SK", value: "515" },
  { label: "Canada - Kindersley, SK", value: "459" },
  { label: "Canada - Vancouver", value: "237" },
  { label: "China - Jiangsu", value: "382" },
  { label: "China - Qingdao", value: "353" },
  { label: "China - Shanghai", value: "242" },
  { label: "China - Sichuan", value: "394" },
  { label: "China - Tianjin", value: "243" },
  { label: "China - Zhejiang", value: "244" },
  { label: "TBA", value: "274" },
  { label: "USA - Carrizo Springs - TX", value: "584" },
  { label: "USA - Great Bend, Kansas", value: "593" },
  { label: "USA - Houston", value: "247" },
  { label: "USA - Houston 2nd", value: "418" },
  { label: "USA - Houston 3rd", value: "610" },
  { label: "USA - Houston 4th", value: "614" },
  { label: "USA - Lafayette, LA", value: "517" },
  { label: "USA - Midland 2nd", value: "592" },
  { label: "USA - Midland/Odessa, TX", value: "405" },
  { label: "USA - Whitsett, TX", value: "585" },
];
const DEFAULT_OPEN_TO_USER_IDS = ["395", "488", "489", "396", "371", "450"]; export const AddSales: React.FC = () => {
  const [formData, setFormData] = useState({
    id: null,
    billFrom: null,
    soNumber: "",
    shipFrom: "",
    customerPO: "",
    shipTo: "",
    taxType: "",
    billTo: "",
    doubleCheckPerson: null,
    salesMan: "",
    openTo: [] as string[],
  });

  const [errors, setErrors] = useState({
    customerPO: "",
    shipTo: "",
  });

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [openTo, setOpenTo] = useState<Option[]>([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [contactOptions, setContactOptions] = useState<Option[]>([]);
  const [companyOptions, setCompanyOptions] = useState<Option[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchContactData();
    fetchCompanies();

    if (id) {
      fetchSalesById(id);
    }
  }, [id]);

  const fetchCompanies = async () => {
    try {
      const res = await getAllCompanies();
      const options = res.data.data.map((company: any) => ({
        value: company.id,
        label: company.name,
      }));
      setCompanyOptions(options);
    } catch (error) {
      console.error("Failed to fetch companies", error);
    }
  };

  const fetchContactData = async () => {
    try {
      const response = await getAllContact();
      const contacts = response.data?.data || [];
      const formattedContacts = contacts.map((contact: any) => ({
        value: contact.id,
        label: contact.company_name,
      }));
      setContactOptions(formattedContacts);
    } catch (error) {
      console.error("Error fetching contacts list data:", error);
    }
  };
  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      const users = response.data?.data || [];

      const formattedUsers = users.map((user: any) => ({
        value: user.id.toString(),
        label: user.name,
      }));

      setOpenTo(formattedUsers);
      setUsersLoaded(true);

      if (!id) {
        // Filter to only include IDs that exist in the fetched users
        const validDefaultIds = DEFAULT_OPEN_TO_USER_IDS.filter(defaultId =>
          formattedUsers.some(user => user.value === defaultId)
        );

        setFormData(prev => ({
          ...prev,
          openTo: validDefaultIds
        }));
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsersLoaded(true);
    }
  };
  useEffect(() => {
    if (usersLoaded && !id && openTo.length > 0) {
      const validDefaultIds = DEFAULT_OPEN_TO_USER_IDS.filter(defaultId =>
        openTo.some(user => user.value === defaultId)
      );

      setFormData(prev => ({
        ...prev,
        openTo: validDefaultIds
      }));
    }
  }, [usersLoaded, openTo, id]);
  const fetchSalesById = async (salesId: string) => {
    try {
      setLoading(true);
      const response = await getSalesById(salesId);
      const data = response.data.data;

      setFormData({
        id: data.id,
        billFrom: Number(data?.company_id),
        soNumber: data?.so ?? "",
        shipFrom: data?.ship_from ?? "",
        customerPO: data?.customer_po ?? "",
        shipTo: data?.ship_to ?? "",
        taxType: data?.tax === 0 ? "FED" : "LOCAL",
        billTo: data?.bill_to ?? "",
        doubleCheckPerson: Number(data?.makecheck),
        salesMan: data?.salesman ?? "",
        openTo: data?.opento
          ? data.opento.split(",").map((ress: any) => Number(ress))
          : [],
      });
    } catch (error) {
      console.error("Error fetching sales data by ID:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    name: keyof typeof formData,
    value: string | string[] | Option | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value ?? "",
    }));
    if (name === "customerPO") {
      setErrors((prev) => ({ ...prev, customerPO: "" }));
    } else if (name === "shipTo") {
      setErrors((prev) => ({ ...prev, shipTo: "" }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      customerPO: "",
      shipTo: "",
    };

    if (!formData.customerPO.trim()) {
      newErrors.customerPO = "The customer po field is required.";
      isValid = false;
    }

    if (!formData.shipTo) {
      newErrors.shipTo = "The ship to field is required.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const backInfo = { title: "Sales", path: "/sales" };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    const payload = {
      company_id: formData.billFrom,
      so: formData.soNumber,
      ship_from: formData.shipFrom,
      customer_po: formData.customerPO,
      ship_to: formData.shipTo,
      tax: formData.taxType === "FED" ? "FED TAX" : "LOCAL TAX",
      bill_to: formData.billTo,
      makecheck: formData.doubleCheckPerson,
      salesman: formData.salesMan,
      opento: formData.openTo.join(","),
    };

    try {
      if (id) {
        await updateSales(formData.id, payload);
        console.log(formData.id, "iddddddddd");
      } else {
        const response = await addSales(payload);
        console.log("Sales entry added:", response.data);
      }
      navigate("/sales");
    } catch (error) {
      console.error("Failed to add sales entry", error);
    }
  };

  return (
    <div>
      <PageBreadcrumb
        pageTitle="Sales Order - Basic Info"
        backInfo={backInfo}
      />
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <form onSubmit={onSubmit} className="bg-white p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Row */}
          <div>
            <Label>
              Bill From<span className="text-red-500">*</span>
            </Label>
            <Select
              options={companyOptions}
              value={companyOptions.find(
                (opt) => opt.value === formData.billFrom
              )}
              onChange={(option) =>
                handleChange("billFrom", (option as Option)?.value)
              }
            />
          </div>

          <div>
            <Label>
              SO Number<span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={formData.soNumber}
              onChange={(e) => handleChange("soNumber", e.target.value)}
            />
          </div>

          {/* Second Row */}
          <div>
            <Label>
              Ship From<span className="text-red-500">*</span>
            </Label>
            <Select
              options={SHIP_FROM_OPTIONS}
              value={SHIP_FROM_OPTIONS.find(
                (opt) => opt.value === formData.shipFrom
              )}
              onChange={(option) =>
                handleChange("shipFrom", (option as Option)?.value)
              }
            />
          </div>

          <div>
            <Label>
              Customer PO<span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={formData.customerPO}
              onChange={(e) => handleChange("customerPO", e.target.value)}
              className={`w-full border rounded ${errors.customerPO ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.customerPO && (
              <p className="text-red-500 text-sm mt-1">{errors.customerPO}</p>
            )}
          </div>

          {/* Third Row */}
          <div>
            <Label>
              Ship To<span className="text-red-500">*</span>
            </Label>
            <Select
              options={contactOptions}
              value={contactOptions.find((opt) => opt.value === formData.shipTo)}
              onChange={(option) =>
                handleChange("shipTo", (option as Option)?.value)
              }
              className={`w-full border rounded ${errors.shipTo ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.shipTo && (
              <p className="text-red-500 text-sm mt-1">{errors.shipTo}</p>
            )}
          </div>

          <div>
            <Label>
              Tax Type<span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-8 pt-2">
              <Radio
                id="tax-fed"
                label="FED TAX"
                name="taxType"
                value="FED"
                checked={formData.taxType === "FED"}
                onChange={(value) => handleChange("taxType", value)}
              />
              <Radio
                id="tax-local"
                label="LOCAL TAX"
                name="taxType"
                value="LOCAL"
                checked={formData.taxType === "LOCAL"}
                onChange={(value) => handleChange("taxType", value)}
              />
            </div>
          </div>

          {/* Fourth Row */}
          <div>
            <Label>
              Bill To<span className="text-red-500">*</span>
            </Label>
            <Select
              options={contactOptions}
              value={contactOptions.find((opt) => opt.value === formData.billTo)}
              onChange={(option) =>
                handleChange("billTo", (option as Option)?.value)
              }
            />
          </div>

          <div>
            <Label>
              Double Check Person<span className="text-red-500">*</span>
            </Label>
            <Select
              options={openTo}
              value={openTo.find(
                (opt) => opt.value === formData.doubleCheckPerson
              )}
              onChange={(option) =>
                handleChange("doubleCheckPerson", (option as Option)?.value)
              }
            />
          </div>

          {/* Fifth Row */}
          <div>
            <Label>
              Sales Man<span className="text-red-500">*</span>
            </Label>
            <Select
              options={openTo}
              value={openTo.find((opt) => opt.value === formData.salesMan)}
              onChange={(option) =>
                handleChange("salesMan", (option as Option)?.value)
              }
            />
          </div>

          <div>
            <Label>
              Open To<span className="text-red-500">*</span>
            </Label>
            <Select
              isMulti
              options={openTo}
              value={openTo.filter(opt =>
                formData.openTo.includes(opt.value)
              )}
              onChange={(selected) => {
                handleChange(
                  "openTo",
                  (selected as Option[]).map(opt => opt.value)
                );
              }}
              isLoading={!usersLoaded}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Link to="/sales">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit">
            {!location.pathname.includes("modifySales")
              ? "Submit"
              : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
};