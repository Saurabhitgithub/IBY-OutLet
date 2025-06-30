import Select, { SingleValue } from "react-select";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { Button } from "@mui/material";
import {
  addQuotation,
  getAllCompanies,
  getAllContact,
  getAllUsers,
  getQuotationById,
  updateQuotation,
} from "../../../services/apis";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";

interface Option {
  value: string;
  label: string;
}

const SHIP_BY_OPTIONS: Option[] = [
  { label: "Air", value: "Air" },
  { label: "Sea", value: "Sea" },
  { label: "Land", value: "Land" },
];

const PAYMENT_TERMS_OPTIONS: Option[] = [
  { label: "20% DOWNPAYMENT,80% BEFORE SHIPMENT", value: "20% DOWNPAYMENT,80% BEFORE SHIPMENT" },
  { label: "30% DOWNPAYMENT,70% BEFORE SHIPMENT", value: "30% DOWNPAYMENT, 70% PAID BEFO" },
  { label: "40% DOWNPAYMENT,60% BEFORE SHIPMENT", value: "40% DOWNPAYMENT,60% BEFORE SHIPMENT" },
  {
    label: "30% DOWNPAYMENT,THE BALANCE BY LETTER OF CREDIT AT SIGHT",
    value: "30% DOWNPAYMENT,THE BALANCE BY LETTER OF CREDIT AT SIGHT",
  },
  {
    label: "100% IRRECOVERABLE TRANSFERABLE LETTER OF CREDIT AT SIGHT",
    value: "100% IRRECOVERABLE TRANSFERABLE LETTER OF CREDIT AT SIGHT",
  },
  { label: "100% IRRECOVERABLE LETTER OF CREDIT AT SIGHT", value: "100% IRRECOVERABLE LETTER OF CREDIT AT SIGHT" },
];

const CURRENCY_OPTIONS: Option[] = [
  { label: "US$", value: "US$" },
  { label: "EUR", value: "EUR" },
  { label: "CAD", value: "CAD" },
  { label: "Others", value: "others" },
];

const PRICE_ARE_OPTIONS: Option[] = [
  { label: "FOB", value: "FOB" },
  { label: "CIF", value: "CIF" },
  { label: "CNF", value: "CNF" },
  { label: "Ex-Works", value: "Ex-Works" },
  { label: "Ex-Shops", value: "Ex-Shops" },
  { label: "Ex-Factory", value: "Ex-Factory" },
];

const OUR_REF_OPTIONS: Option[] = [
  { label: "25%", value: "25%" },
  { label: "50%", value: "50%" },
  { label: "75%", value: "75%" },
  { label: "80%", value: "80%" },
  { label: "90%", value: "90%" },
  { label: "100%", value: "100%" },
  { label: "OE06-72", value: "OE06-72" }, // Added based on API response
];

interface FormData {
  id: number | null;
  quoteTo: Option | null;
  quoteFrom: Option | null;
  quotationNo: string;
  attention: string;
  phone: string;
  fax: string;
  email: string;
  yourRef: string;
  priceAre: Option;
  rateLocation: string;
  rateUSD: number;
  currency: Option;
  estimatedFreight: number;
  shipBy: Option | null;
  specialVolumeDiscount: number;
  ourRef: Option | null;
  possibility: string;
  validity: number;
  quotedBy: string;
  insurance: number;
  paymentTerms: Option | null;
  internalNotes: string;
  notes: string;
  openTo: Option[];
}

export const AddQuote: React.FC = () => {
  const { id } = useParams();
  const [openToOptions, setOpenToOptions] = useState<Option[]>([]);
  const [companyOptions, setCompanyOptions] = useState<Option[]>([]);
  const [contactOptions, setContactOptions] = useState<Option[]>([]);
  const [isOptionsLoaded, setIsOptionsLoaded] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      id: null,
      quoteTo: null,
      quoteFrom: null,
      quotationNo: "",
      attention: "",
      phone: "",
      fax: "",
      email: "",
      yourRef: "",
      priceAre: { label: "FOB", value: "FOB" },
      rateLocation: "",
      rateUSD: 1,
      currency: { label: "US$", value: "US$" },
      estimatedFreight: 0,
      shipBy: null,
      specialVolumeDiscount: 0,
      ourRef: null,
      possibility: "90%",
      validity: 7,
      quotedBy: "Sales No.1",
      insurance: 0,
      paymentTerms: null,
      internalNotes: "",
      notes: "",
      openTo: [],
    },
  });

  const formData = watch();

  useEffect(() => {
    const fetchAllOptions = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchOpenTo(), fetchCompanies(), fetchContacts()]);
        setIsOptionsLoaded(true);
      } catch (error) {
        console.error("Failed to fetch options", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllOptions();
  }, []);

  useEffect(() => {
    if (id && isOptionsLoaded) {
      fetchQuote();
    }
  }, [id, isOptionsLoaded]);

  const fetchContacts = async () => {
    try {
      const res = await getAllContact();
      if (res?.data?.data) {
        const options = res.data.data.map((user: any) => ({
          value: user.id.toString(),
          label: `${user.company_name} (${user.sb_type})`,
        }));
        setContactOptions(options);
      }
    } catch (error) {
      console.error("Failed to fetch contacts", error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await getAllCompanies();
      if (res?.data?.data) {
        const options = res.data.data.map((company: any) => ({
          value: company.id.toString(),
          label: company.name,
        }));
        setCompanyOptions(options);
      }
    } catch (error) {
      console.error("Failed to fetch companies", error);
    }
  };

  const fetchOpenTo = async () => {
    try {
      const res = await getAllUsers();
      if (res?.data?.data) {
        const options = res.data.data.map((user: any) => ({
          value: user.id.toString(),
          label: user.name,
        }));
        setOpenToOptions(options);
      }
    } catch (error) {
      console.error("Failed to fetch open to options", error);
    }
  };

  const fetchQuote = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const res = await getQuotationById(id);
      const data = res.data?.data;
      if (data) {
        const openToValues = data.open_to
          ? data.open_to.split(',').map(value => {
            const option = openToOptions.find(opt => opt.value === value);
            return option ? option : { value, label: value };
          })
          : [];

        const formValues = {
          id: data.id,
          quoteTo: contactOptions.find((opt) => opt.value === data.code_id?.toString()) || null,
          quoteFrom: companyOptions.find((opt) => opt.value === data.company_id?.toString()) || null,
          quotationNo: data.quotation_no || "",
          attention: data.attention || "",
          phone: data.phone || "",
          fax: data.fax || "",
          email: data.email || "",
          yourRef: data.your_ref || "",
          priceAre: PRICE_ARE_OPTIONS.find((opt) => opt.value === data.price_are) || { label: "FOB", value: "FOB" },
          rateLocation: data.port || "",
          rateUSD: parseFloat(data.exchange_rate) || 1,
          currency: CURRENCY_OPTIONS.find((opt) => opt.value === data.currency) || { label: "US$", value: "US$" },
          estimatedFreight: parseFloat(data.freight) || 0,
          shipBy: SHIP_BY_OPTIONS.find((opt) => opt.value === data.ship_by) || null,
          specialVolumeDiscount: parseFloat(data.discount) || 0,
          ourRef: OUR_REF_OPTIONS.find((opt) => opt.value === data.our_ref) || null,
          possibility: data.possibility || "90%",
          validity: parseInt(data.validity) || 7,
          quotedBy: data.quote_by?.toString() || "Sales No.1",
          insurance: parseFloat(data.insurance) || 0,
          paymentTerms: PAYMENT_TERMS_OPTIONS.find((opt) =>
            data.payment_terms && opt.value.includes(data.payment_terms.trim())
          ) || null,
          internalNotes: data.internal_notes || "",
          notes: data.notes || "",
          openTo: openToValues,
        };

        reset(formValues);
      }
    } catch (error) {
      console.error("Failed to fetch quote for update", error);
    } finally {
      setLoading(false);
    }
  };
  const onSubmit = async (data: FormData) => {
    setLoading(true);

    // Validate required fields
    if (!data.quoteTo?.value || !data.quoteFrom?.value) {
      toast.error("Please select both Quote To and Quote From");
      setLoading(false);
      return;
    }

    // Prepare payload with better type safety
    const payload = {
      code_id: parseInt(data.quoteTo.value),
      quotation_no: data.quotationNo || `QUOTE-${Date.now()}`,
      name: data.quoteFrom.label,
      attention: data.attention,
      email: data.email,
      phone: data.phone || "",
      fax: data.fax || "",
      your_ref: data.yourRef,
      price_are: data.priceAre.value,
      port: data.rateLocation || "",
      currency: data.currency.value,
      exchange_rate: data.rateUSD.toString(),
      ship_by: data.shipBy?.value || "",
      discount: data.specialVolumeDiscount.toString(),
      freight: data.estimatedFreight.toString(),
      our_ref: data.ourRef?.value || "",
      possibility: data.possibility,
      validity: data.validity.toString(),
      payment_terms: data.paymentTerms?.value || "",
      insurance: data.insurance.toString(),
      other_payment_terms: "",
      quote_by: data.openTo?.length ? parseInt(data.openTo[0].value) : 0,
      quote_edit: 0,
      internal_notes: data.internalNotes || "",
      notes: data.notes || "",
      amount: "",
      weight: "",
      status: "",
      open_to: data.openTo?.map(opt => opt.value).join(',') || "",
      company_id: parseInt(data.quoteFrom.value)
    };
    const minimalPayload = {
      code_id: 5559,
      quotation_no: "10",
      name: "Hitiway Company Ltd.",
      price_are: "FOB",
      currency: "US$",
      exchange_rate: "1",
      company_id: 501,
      // Set all other required fields to empty strings/zeros
      attention: "",
      email: "",
      phone: "",
      fax: "",
      your_ref: "",
      port: "",
      ship_by: "",
      discount: "0",
      freight: "0",
      our_ref: "",
      possibility: "",
      validity: "0",
      payment_terms: "",
      insurance: "0",
      other_payment_terms: "",
      quote_by: 0,
      quote_edit: 0,
      internal_notes: "",
      notes: "",
      amount: "",
      weight: "",
      status: "",
      open_to: ""
    };
    console.log("Submitting payload:", payload); // Debug log

    try {
      let response;
      if (id && data.id) {
        response = await updateQuotation(data.id, payload);
      } else {
        response = await addQuotation(payload);
      }

      if (response.status >= 200 && response.status < 300) {
        toast.success(`Quotation ${id ? "updated" : "added"} successfully!`, {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/quote");
      } else {
        throw new Error(response.data?.message || "Operation failed");
      }
    } catch (error: any) {
      console.error("Detailed error:", {
        message: error.message,
        response: error.response?.data,
        config: error.config,
      });

      const errorMessage = error.response?.data?.message ||
        error.response?.data?.errors?.join("\n") ||
        "Failed to save quotation";

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };
  const backInfo = { title: "Quote", path: "/quote" };

  return (
    <div className="container mx-auto p-6 rounded">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <PageBreadcrumb
        pageTitle={id ? "Edit Quote" : "Add Quote"}
        backInfo={backInfo}
      />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 bg-white p-6 rounded-lg"
      >
        <h3 className="text-xl font-semibold mb-3 text-gray-500">
          Quote Information
        </h3>
        <hr className="border-t border-gray-300 mb-3" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Quote To<span className="text-red-500">*</span>
            </label>
            <Controller
              name="quoteTo"
              control={control}
              rules={{ required: "The com id field is required." }}
              render={({ field }) => (
                <>
                  <Select
                    options={contactOptions}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    className={`w-full border rounded ${errors.quoteTo ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {errors.quoteTo && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.quoteTo.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Quote From<span className="text-red-500">*</span>
            </label>
            <Controller
              name="quoteFrom"
              control={control}
              rules={{ required: "The title field is required." }}
              render={({ field }) => (
                <>
                  <Select
                    options={companyOptions}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    className={`w-full border rounded ${errors.quoteFrom ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {errors.quoteFrom && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.quoteFrom.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Quotation No<span className="text-red-500">*</span>
            </label>
            <Controller
              name="quotationNo"
              control={control}
              rules={{ required: "The quotation no field is required." }}
              render={({ field }) => (
                <>
                  <input
                    type="text"
                    className={`w-full border p-2 rounded ${errors.quotationNo ? "border-red-500" : ""
                      }`}
                    {...field}
                  />
                  {errors.quotationNo && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.quotationNo.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Attention<span className="text-red-500">*</span>
            </label>
            <Controller
              name="attention"
              control={control}
              rules={{ required: "The attention field is required." }}
              render={({ field }) => (
                <>
                  <input
                    type="text"
                    className={`w-full border p-2 rounded ${errors.attention ? "border-red-500" : ""
                      }`}
                    {...field}
                  />
                  {errors.attention && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.attention.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">Phone</label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  {...field}
                />
              )}
            />
          </div>
          <div>
            <label className="font-medium mb-2 text-gray-500">Fax</label>
            <Controller
              name="fax"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  {...field}
                />
              )}
            />
          </div>
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Email<span className="text-red-500">*</span>
            </label>
            <Controller
              name="email"
              control={control}
              rules={{
                required: "The email field is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              }}
              render={({ field }) => (
                <>
                  <input
                    type="email"
                    className={`w-full border p-2 rounded ${errors.email ? "border-red-500" : ""
                      }`}
                    {...field}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
        </div>

        <div>
          <label className="font-medium mb-2 text-gray-500">
            Your REF<span className="text-red-500">*</span>
          </label>
          <Controller
            name="yourRef"
            control={control}
            rules={{ required: "The your ref is required" }}
            render={({ field }) => (
              <>
                <input
                  type="text"
                  className={`w-full border p-2 rounded ${errors.yourRef ? "border-red-500" : ""
                    }`}
                  {...field}
                />
                {errors.yourRef && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.yourRef.message}
                  </p>
                )}
              </>
            )}
          />
        </div>

        <h3 className="text-xl font-semibold mb-3 text-gray-500">
          Pricing Information
        </h3>
        <hr className="border-t border-gray-300 mb-3" />

        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Price are<span className="text-red-500">*</span>
            </label>
            <Controller
              name="priceAre"
              control={control}
              rules={{ required: "Price are is required" }}
              render={({ field }) => (
                <>
                  <Select
                    options={PRICE_ARE_OPTIONS}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    className={`${errors.priceAre ? "border-red-500" : ""}`}
                  />
                  {errors.priceAre && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.priceAre.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Rate Location
            </label>
            <Controller
              name="rateLocation"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  {...field}
                />
              )}
            />
          </div>
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Rate : 1 USD =
            </label>
            <Controller
              name="rateUSD"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  {...field}
                />
              )}
            />
          </div>
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Currency<span className="text-red-500">*</span>
            </label>
            <Controller
              name="currency"
              control={control}
              rules={{ required: "Currency is required" }}
              render={({ field }) => (
                <>
                  <Select
                    options={CURRENCY_OPTIONS}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    className={`${errors.currency ? "border-red-500" : ""}`}
                  />
                  {errors.currency && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.currency.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Special Volume Discount (%)
            </label>
            <Controller
              name="specialVolumeDiscount"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  {...field}
                />
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium mb-2 text-gray-500">
                Ship By<span className="text-red-500">*</span>
              </label>
              <Controller
                name="shipBy"
                control={control}
                rules={{ required: "The ship by field is required" }}
                render={({ field }) => (
                  <>
                    <Select
                      options={SHIP_BY_OPTIONS}
                      value={field.value}
                      onChange={(val) => field.onChange(val)}
                      className={`w-full border rounded ${errors.shipBy ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                    {errors.shipBy && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.shipBy.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
            <div>
              <label className="font-medium mb-2 text-gray-500">
                Estimated Freight (USD)
              </label>
              <Controller
                name="estimatedFreight"
                control={control}
                render={({ field }) => (
                  <input
                    type="number"
                    className="w-full border p-2 rounded"
                    {...field}
                  />
                )}
              />
            </div>
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-3 text-gray-500">
          Additional Information
        </h3>
        <hr className="border-t border-gray-300 mb-3" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Our REF<span className="text-red-500">*</span>
            </label>
            <Controller
              name="ourRef"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <>
                  <Select
                    options={OUR_REF_OPTIONS}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    className={`${errors.ourRef ? "border-red-500" : ""}`}
                  />
                </>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium mb-2 text-gray-500">
                Validity (Days)<span className="text-red-500">*</span>
              </label>
              <Controller
                name="validity"
                control={control}
                rules={{ required: "Validity is required" }}
                render={({ field }) => (
                  <>
                    <input
                      type="number"
                      className={`w-full border p-2 rounded ${errors.validity ? "border-red-500" : ""
                        }`}
                      {...field}
                    />
                    {errors.validity && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.validity.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
            <div>
              <label className="font-medium mb-2 text-gray-500">
                Quoted By
              </label>
              <Controller
                name="quotedBy"
                control={control}
                render={({ field }) => (
                  <input
                    type="text"
                    className="w-full border p-2 rounded"
                    {...field}
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Payment Terms<span className="text-red-500">*</span>
            </label>
            <Controller
              name="paymentTerms"
              control={control}
              rules={{ required: "The payment terms field are required" }}
              render={({ field }) => (
                <>
                  <Select
                    options={PAYMENT_TERMS_OPTIONS}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    className={`w-full border rounded ${errors.paymentTerms ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {errors.paymentTerms && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.paymentTerms.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
          <div>
            <label className="font-medium mb-2 text-gray-500">Insurance</label>
            <Controller
              name="insurance"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  {...field}
                />
              )}
            />
          </div>
        </div>

        <div>
          <label className="font-medium mb-2 text-gray-500">
            Internal Notes
          </label>
          <Controller
            name="internalNotes"
            control={control}
            render={({ field }) => (
              <textarea
                className="w-full border p-2 rounded h-22"
                rows={3}
                {...field}
              />
            )}
          />
        </div>

        <div>
          <label className="font-medium mb-2 text-gray-500">Notes</label>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <textarea
                className="w-full border p-2 rounded h-22"
                rows={3}
                {...field}
              />
            )}
          />
        </div>
        <div>
          <label className="font-medium mb-2 text-gray-500">Open To</label>
          <Controller
            name="openTo"
            control={control}
            render={({ field }) => (
              <Select
                isMulti
                options={openToOptions}
                value={field.value}
                onChange={(val) => field.onChange(val)}
              />
            )}
          />
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button className="bg-brand rounded-xl px-4 py-3" onClick={() => navigate("/quote")}>
            Cancel
          </button >
          <button className="bg-brand rounded-xl px-4 py-3" type="submit" >
            {id ? "Save" : "Submit"}
          </button >
        </div>
      </form>
    </div>
  );
};
