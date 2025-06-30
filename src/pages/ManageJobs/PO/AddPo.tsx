import Select, { SingleValue } from "react-select";
// import Select from "../../../components/form/Select";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { useParams } from "react-router";
import { Button } from "@mui/material";
// import Label from "../../../components/form/Label";
import { useForm, Controller } from "react-hook-form";
import { DragAndDropInput } from "../../../components/form/form-elements/DragAndDrop";
import Flatpickr from "react-flatpickr";
import { addPO, editPo, getAllContact, getAllContactsBillTo, getAllSalesman, getAllUsers, getPoById } from "../../../services/apis";
interface ContactOption {
  value: string;
  label: string;
}
interface Option {
  value: string;
  label: string;
}
interface FormValues {
  id?: number;
  selectanOption: string;
  soNumber: string;
  customerPo: string;
  shipTo: Option | null;
  billTo: ContactOption | null;
  currency: string;
  exgRate: string;
  orderDate: string;
  deliveryDate: string;
  shipDate: string;
  arriveDate: string;
  invoiceDate: string;
  dueDate: string;
  paymentDate: string;
  salesMan: Option | null;
  description: string;
  openTo: string[];
  fileData: any;
}
const categoryOptions: Option[] = [
  { value: "Production Equipement", label: "Production Equipement" },
  { value: "Production tools", label: "Production tools" },
  { value: "production machine", label: "production machine" },
  { value: "productive material", label: "productive mapyrt" },
  { value: "kiuy", label: "kiuy" },
  { value: "spyrt", label: "spyrt" },
];

export const AddPo: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentPoId, setCurrentPoId] = useState<number | null>(null);
  const [billToOptions, setBillToOptions] = useState<ContactOption[]>([]);
  const [loadingBillTo, setLoadingBillTo] = useState(false);
  const [contactOptions, setContactOptions] = useState<Option[]>([]);
  const [salesmanOptions, setSalesmanOptions] = useState<SalesmanOption[]>([]);
  const [loadingSalesman, setLoadingSalesman] = useState(false);
  const [openToOptions, setOpenToOptions] = useState<Option[]>([]);

  const [formData, setFormData] = useState({
    selectanOption: "",
    soNumber: "",
    customerPo: "",
    shipTo: null as Option | null,
    billTo: null as ContactOption | null,
    currency: "",
    exgRate: "",
    orderDate: "",
    deliveryDate: "",
    shipDate: "",
    arriveDate: "",
    invoiceDate: "",
    dueDate: "",
    paymentDate: "",
    salesMan: null as Option | null,
    description: "",
    openTo: [] as string[],
    fileData: [] as any[],
  });

  const navigate = useNavigate();
  const { id } = useParams();
  const backInfo = { title: "PO", path: "/po" };
  const fetchSalesman = async () => {
    try {
      const response = await getAllSalesman();
      const salesmen = response.data?.data || [];

      const formattedSalesmen = salesmen.map((salesman: any) => ({
        value: salesman.id.toString(),
        label: salesman.name || `${salesman.firstName} ${salesman.lastName}`,
      }));

      setSalesmanOptions(formattedSalesmen);
    } catch (error) {
      console.error("Failed to fetch salesmen:", error);
    } finally {
    }
  };
  const findContactById = (id: number | string, contacts: Option[]): Option | null => {
    if (!id) return null;
    const contact = contacts.find(contact => contact.value === id.toString());
    return contact || null;
  };
  useEffect(() => {
    fetchSalesman();
  }, [])
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      setCurrentPoId(id);
      fetchPoData(id);
    }
  }, [id]);
  const findBillToContactById = (id: number | string, contacts: ContactOption[]): ContactOption | null => {
    if (!id) return null;
    return contacts.find(contact => contact.value === id.toString()) || null;
  };
  const fetchPoData = async (id: string) => {
    try {
      // Fetch all required data in parallel
      const [poResponse, contactsResponse, billToResponse, salesmanRes] = await Promise.all([
        getPoById(id),
        getAllContact(),
        getAllContactsBillTo(),
        getAllSalesman()
      ]);

      const poData = poResponse.data?.data;
      const contacts = contactsResponse.data?.data || [];
      const billToContacts = billToResponse.data?.data || [];
      const salesmen = salesmanRes.data?.data || [];

      // Format all options
      const formattedContacts = contacts.map((contact: any) => ({
        value: contact.id.toString(),
        label: contact.company_name || `${contact.firstName} ${contact.lastName}`,
      }));

      const formattedBillToContacts = billToContacts.map((contact: any) => ({
        value: contact.id.toString(),
        label: contact.company_name?.trim() || contact.name,
        address: `${contact.address1 || ''} ${contact.address2 || ''}, ${contact.city}, ${contact.state_name}, ${contact.zip}`,
        phone: contact.phone,
      }));

      const formattedSalesmen = salesmen.map((salesman: any) => ({
        value: salesman.id.toString(),
        label: salesman.name || `${salesman.firstName} ${salesman.lastName}`,
      }));

      // Update all option states
      setContactOptions(formattedContacts);
      setBillToOptions(formattedBillToContacts);
      setSalesmanOptions(formattedSalesmen);

      // Format dates
      const formatDate = (dateString: string | null) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      // Find matching options (now using the freshly formatted options)
      const shipToContact = findContactById(poData.ship_to, formattedContacts);
      const billToContact = findBillToContactById(poData.bill_to, formattedBillToContacts);
      const salesManOption = findContactById(poData.sales_man, formattedSalesmen);

      // Prepare form data
      const formData = {
        selectanOption: "",
        soNumber: poData.so_number || "",
        customerPo: poData.customer_po || "",
        shipTo: shipToContact,
        billTo: billToContact,
        currency: poData.currency || "CAD",
        exgRate: poData.cur_rate || "",
        orderDate: formatDate(poData.order_date),
        deliveryDate: formatDate(poData.delivery_date),
        shipDate: formatDate(poData.ship_date),
        arriveDate: formatDate(poData.arrival_date),
        invoiceDate: formatDate(poData.invoice_date),
        dueDate: formatDate(poData.due_date),
        paymentDate: formatDate(poData.pay_date) || formatDate(poData.receivable_date),
        salesMan: salesManOption,
        description: poData.description || "",
        openTo: poData.opento ? poData.opento.split(',') : [],
      };

      // Update form state
      setFormData(formData);

      // Update react-hook-form values
      Object.entries(formData).forEach(([key, value]) => {
        setValue(key as keyof FormValues, value, { shouldValidate: true });
      });

    } catch (error) {
      console.error("Failed to fetch PO data:", error);
    }
  };
  useEffect(() => {
    const fetchBillToContacts = async () => {
      try {
        setLoadingBillTo(true);
        const response = await getAllContactsBillTo();

        const options = response.data.data.map((contact: any) => ({
          value: contact.id.toString(),
          label: contact.company_name?.trim() || contact.name,
          address: `${contact.address1 || ''} ${contact.address2 || ''}, ${contact.city}, ${contact.state_name}, ${contact.zip}`,
          phone: contact.phone,
        }));

        setBillToOptions(options);
      } catch (error) {
        console.error("Failed to fetch bill-to contacts:", error);
      } finally {
        setLoadingBillTo(false);
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
    fetchOpenTo();
    fetchContactData();
    fetchBillToContacts();
  }, []);


  const handleDateChange = (
    dates: Date[],
    field: 'orderDate' | 'deliveryDate' | 'shipDate' | 'arriveDate' | 'invoiceDate' | 'dueDate' | 'paymentDate'
  ) => {
    if (dates.length === 0) {
      setFormData(prev => ({ ...prev, [field]: "" }));
      setValue(field, "", { shouldValidate: true });
      return;
    }

    const date = new Date(dates[0]);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    setFormData(prev => ({ ...prev, [field]: formattedDate }));
    setValue(field, formattedDate, { shouldValidate: true });
  };

  const fetchOpenTo = async () => {
    try {
      const res = await getAllUsers();
      if (res?.data?.data) {
        const options = res.data.data.map((user: any) => ({
          value: user.id,
          label: user.name,
        }));
        setOpenToOptions(options);
      }
    } catch (error) {
      console.error("Failed to fetch open to options", error);
    }
  };


  const { control, register, handleSubmit, formState: { errors }, setValue } = useForm<FormValues>({
    defaultValues: {
      selectanOption: "",
      soNumber: "",
      customerPo: "",
      shipTo: null,
      billTo: null,
      currency: "CAD",
      exgRate: "",
      orderDate: "",
      deliveryDate: "",
      shipDate: "",
      arriveDate: "",
      invoiceDate: "",
      dueDate: "",
      paymentDate: "",
      salesMan: null,
      description: "",
      openTo: [],
      fileData: null
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const userId = localStorage.getItem('Sql_id');
      const payload = {
        user_id: userId ? parseInt(userId) : 0,
        so_number: data.soNumber,
        description: data.description,
        opentogm: data.openTo.join(','),
        opento: data.openTo.join(','),
        parent: 0,
        closed: "",
        customer_po: data.customerPo,
        order_date: data.orderDate,
        delivery_date: data.deliveryDate,
        ship_date: data.shipDate,
        arrival_date: data.arriveDate,
        invoice_date: data.invoiceDate,
        receivable_date: data.paymentDate,
        due_date: data.dueDate,
        file: data.fileData?.[0]?.name || "", // Safe access with optional chaining
        ponumber: "",
        if_paid: "",
        company_id: 0,
        sales_man: data.salesMan?.value || "",
        customer_id: "",
        invoice_number: "",
        terms: "",
        invoice_by: 0,
        pay_type: "",
        freight_fee: "",
        towhom: "",
        sep_freight: "",
        acc_third: "",
        cheque_number: "",
        pay_date: data.paymentDate,
        prepaid: "",
        makecheck: "",
        invoice_notes: "",
        ship_to: data.shipTo?.value || "",
        bill_to: data.billTo?.value || "",
        ship_via: "",
        ship_from: "",
        tax_type: "",
        tax_rate: "",
        cur_rate: data.exgRate,
        currency: data.currency,
        vendor_id: "",
        material: "",
        job_number: "",
        quote_number: "",
        term_condition: "",
        name_title: "",
        pl_date: "",
        shipto_detail: "",
        billto_detail: "",
        checkpo: ""
      };

      let response;
      if (isEditing && currentPoId) {
        response = await editPo(currentPoId, payload);
      } else {
        response = await addPO(payload);
      }

      if (response.status === 200 || response.status === 201) {
        navigate("/po");
      }
    } catch (error) {
      console.error("Error submitting PO:", error);
      // Add user feedback here (e.g., toast notification)
    }
  };
  const handleChange = (
    name: keyof typeof formData,
    value: string | boolean | Option | ContactOption | null | Option[]
  ) => {
    if (name === 'openTo' && Array.isArray(value)) {
      const selectedValues = value.map((option: Option) => option.value);
      setFormData(prev => ({ ...prev, [name]: selectedValues }));
      setValue(name, selectedValues, { shouldValidate: true, shouldDirty: true });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      setValue(name as any, value, { shouldValidate: true, shouldDirty: true });
    }
  };
  return (
    <div className="container mx-auto p-6 rounded">
      <div>
        <PageBreadcrumb pageTitle={id ? "Edit PO " : "Add PO "} backInfo={backInfo} />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 bg-white p-6 rounded-lg "
        noValidate
      >
        <h3 className="text-xl font-semibold mb-3 text-gray-500">Details</h3>
        <hr className=" border-t border-gray-300 mb-3"></hr>

        <div className="flex gap-4 ">
          <label className="font-medium mb-2 block text-gray-500">
            Select an Option<span className="text-red-500">*</span>
          </label>
          <div>
            <label className="text-gray-500">
              <input
                type="radio"
                name="selectanOption"
                value="Auto Generate Unique SO#"
                checked={formData.selectanOption === "Auto Generate Unique SO#"}
                onChange={(e) => handleChange("selectanOption", e.target.value)}
                className="mr-2"
              />
              Auto Generate Unique SO#
            </label>
          </div>
          <div>
            <label className="text-gray-500">
              <input
                type="radio"
                name="selectanOption"
                value="Input Duplicated SO#"
                checked={formData.selectanOption === "Input Duplicated SO#"}
                onChange={(e) => handleChange("selectanOption", e.target.value)}
                className="mr-2"
              />
              Input Duplicated SO#
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              SO Number<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full border p-2 rounded ${errors.soNumber ? "border-red-500" : ""
                }`}
              {...register("soNumber", { required: "The so number field is required." })}
              value={formData.soNumber}
              onChange={(e) => handleChange("soNumber", e.target.value)}
            />
            {errors.soNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.soNumber.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">Upload File</label>
            <div className="my-3">
              <Controller
                name="fileData"
                control={control}
                rules={{ validate: (value) => value?.length > 0 || "File is required" }}
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                  <>
                    <DragAndDropInput
                      value={value || []}
                      onChange={onChange}
                    />
                    {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
                  </>
                )}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 ">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Customer PO<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full border p-2 rounded ${errors.customerPo ? "border-red-500" : ""
                }`}
              {...register("customerPo", { required: "The customer po field is required." })}
              value={formData.customerPo}
              onChange={(e) => handleChange("customerPo", e.target.value)}
            />
            {errors.customerPo && (
              <p className="text-red-500 text-sm mt-1">{errors.customerPo.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Ship To<span className="text-red-500">*</span>
            </label>
            <Controller
              name="shipTo"
              control={control}
              rules={{ required: "The ship to field is required." }}
              render={({ field }) => (
                <Select
                  options={contactOptions}
                  placeholder="Select Option"
                  {...field}
                  value={field.value}
                  onChange={(selected: SingleValue<Option>) => {
                    field.onChange(selected);
                    handleChange("shipTo", selected);
                  }}
                  className={`dark:bg-dark-900 ${errors.shipTo ? "border-red-500" : ""
                    }`}
                />
              )}
            />
            {errors.shipTo && (
              <p className="text-red-500 text-sm mt-1">{errors.shipTo.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1">
          <div>
            <label className="font-medium mb-2 text-gray-500">Bill To</label>
            <Controller
              name="billTo"
              control={control}
              render={({ field }) => (
                <Select
                  options={billToOptions}
                  value={field.value}
                  onChange={(selected: SingleValue<ContactOption>) => {
                    field.onChange(selected);
                    handleChange("billTo", selected);
                  }}
                  formatOptionLabel={(option) => (
                    <div>
                      <div>{option.label}</div>
                      {option.address && (
                        <div className="text-xs text-gray-500">
                          {option.address}
                          {option.phone && ` • ${option.phone}`}
                        </div>
                      )}
                    </div>
                  )}
                  placeholder="Select Bill To"
                  className="w-full"
                />
              )}
            />

          </div>
        </div>

        <div className="grid grid-cols-3 gap-12">
          <div className="flex gap-4 ">
            <label className="font-medium mb-2 block text-gray-500">
              Currency<span className="text-red-500">*</span>
            </label>
            <div>
              <label className="text-gray-500">
                <input
                  type="radio"
                  name="currency"
                  value="CAD"
                  checked={formData.currency === "CAD"}
                  onChange={(e) => handleChange("currency", e.target.value)}
                  className="mr-2"
                />
                CAD
              </label>
            </div>
            <div>
              <label className="text-gray-500">
                <input
                  type="radio"
                  name="currency"
                  value="USD"
                  checked={formData.currency === "USD"}
                  onChange={(e) => handleChange("currency", e.target.value)}
                  className="mr-2"
                />
                USD
              </label>
            </div>
          </div>
          <div>
            <label className="font-medium mb-2 text-gray-500 ">Exg.Rate</label>
            <input
              type="text"
              className="w-full max-w-[200px] border p-2 rounded h-9"
              value={formData.exgRate}
              onChange={(e) => handleChange("exgRate", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Order Date<span className="text-red-500">*</span>
            </label>
            <Flatpickr
              value={formData.orderDate}
              onChange={(dates) => handleDateChange(dates, 'orderDate')}
              options={{
                dateFormat: "Y-m-d",
                minDate: "today"
              }}
              placeholder="Select Order Date"
              className={`w-full border p-2 rounded ${errors.orderDate ? "border-red-500" : ""}`}
            />
            {errors.orderDate && (
              <p className="text-red-500 text-xs mt-1">{errors.orderDate.message}</p>
            )}
          </div>
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Delivery Date<span className="text-red-500">*</span>
            </label>
            <Flatpickr
              value={formData.deliveryDate}
              onChange={(dates) => handleDateChange(dates, 'deliveryDate')}
              options={{
                dateFormat: "Y-m-d",
                minDate: formData.orderDate || "today"
              }}
              placeholder="Select Delivery Date"
              className={`w-full border p-2 rounded ${errors.deliveryDate ? "border-red-500" : ""}`}
            />
            {errors.deliveryDate && (
              <p className="text-red-500 text-xs mt-1">{errors.deliveryDate.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Ship Date<span className="text-red-500">*</span>
            </label>
            <Flatpickr
              value={formData.shipDate}
              onChange={(dates) => handleDateChange(dates, 'shipDate')}
              options={{
                dateFormat: "Y-m-d",
                minDate: formData.orderDate || "today"
              }}
              placeholder="Select Ship Date"
              className={`w-full border p-2 rounded ${errors.shipDate ? "border-red-500" : ""}`}
            />
            {errors.shipDate && (
              <p className="text-red-500 text-xs mt-1">{errors.shipDate.message}</p>
            )}
          </div>
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Arrive Date<span className="text-red-500">*</span>
            </label>
            <Flatpickr
              value={formData.arriveDate}
              onChange={(dates) => {
                handleChange(
                  "arriveDate",
                  dates.length ? dates[0].toISOString().split("T")[0] : ""
                );
              }}
              options={{ dateFormat: "Y-m-d" }}
              placeholder="arrive Date"
              className={`w-full border p-2 rounded ${errors.arriveDate ? "border-red-500" : ""
                }`}
            />
            {errors.arriveDate && (
              <p className="text-red-500 text-xs mt-1">{errors.arriveDate.message}</p>
            )}
          </div>
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Invoice Date<span className="text-red-500">*</span>
            </label>
            <Flatpickr
              value={formData.invoiceDate}
              onChange={(dates) => {
                handleChange(
                  "invoiceDate",
                  dates.length ? dates[0].toISOString().split("T")[0] : ""
                );
              }}
              options={{ dateFormat: "Y-m-d" }}
              placeholder="invoice Date"
              className={`w-full border p-2 rounded ${errors.invoiceDate ? "border-red-500" : ""
                }`}
            />
            {errors.invoiceDate && (
              <p className="text-red-500 text-xs mt-1">{errors.invoiceDate.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Due Date */}
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Due Date<span className="text-red-500">*</span>
            </label>
            <Flatpickr
              value={formData.dueDate}
              onChange={(dates) => handleDateChange(dates, 'dueDate')}
              options={{
                dateFormat: "Y-m-d",
                minDate: formData.invoiceDate || "today" // Ensure due date is after invoice date
              }}
              placeholder="Due Date"
              className={`w-full border p-2 rounded ${errors.dueDate ? "border-red-500" : ""}`}
            />
            {errors.dueDate && (
              <p className="text-red-500 text-xs mt-1">{errors.dueDate.message}</p>
            )}
          </div>

          {/* Payment Date */}
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Payment Date
            </label>
            <Flatpickr
              value={formData.paymentDate}
              onChange={(dates) => handleDateChange(dates, 'paymentDate')}
              options={{
                dateFormat: "Y-m-d",
                minDate: formData.invoiceDate || "today"
              }}
              placeholder="Payment Date"
              className={`w-full border p-2 rounded ${errors.paymentDate ? "border-red-500" : ""}`}
            />
            {errors.paymentDate && (
              <p className="text-red-500 text-xs mt-1">{errors.paymentDate.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Sales Man<span className="text-red-500">*</span>
            </label>
            <Controller
              name="salesMan"
              control={control}
              rules={{ required: "The sales man field is required." }}
              render={({ field }) => (
                <Select
                  options={salesmanOptions}
                  isLoading={loadingSalesman}
                  value={field.value}
                  onChange={(selected: SingleValue<Option>) => {
                    field.onChange(selected);
                    handleChange("salesMan", selected);
                  }}
                  placeholder={loadingSalesman ? "Loading salesmen..." : "Select Salesman"}
                  className={`${errors.salesMan ? "border-red-500" : ""}`}
                  noOptionsMessage={() => "No salesmen available"}
                />
              )}
            />
            {errors.salesMan && (
              <p className="text-red-500 text-sm mt-1">{errors.salesMan.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="font-medium mb-2 block text-gray-500">
            Description<span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border p-2 rounded h-22"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Open To
            </label>
            <Controller
              name="openTo"
              control={control}
              render={({ field }) => (
                <Select
                  options={openToOptions}
                  isMulti
                  value={openToOptions.filter(option =>
                    field.value?.includes(option.value)
                  )}
                  onChange={(selected: MultiValue<Option>) => {
                    const values = selected ? selected.map(option => option.value) : [];
                    field.onChange(values);
                    setFormData(prev => ({ ...prev, openTo: values }));
                  }}
                  placeholder="Select Users"
                  className="w-full"
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  noOptionsMessage={() => "No users available"}
                />
              )}
            />
          </div>
        </div>

        <div className="flex justify-end mb-2 mt-2 gap-2">
          <Button variant="outlined" className="bg-pink-300" onClick={() => navigate("/po")}>
            Cancel
          </Button>
          <Button variant="contained" type="submit">
            {isEditing ? "Update" : "Add Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
};




