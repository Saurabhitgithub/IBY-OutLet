import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Select from "react-select";
import Button from "../../components/ui/button/Button";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  addCode,
  addInvoice,
  editInvoiceById,
  getAllTerms,
  getInvoiceById,
  getOrderDataBySalesId,
  getSalesById,
} from "../../services/apis";

type Option = {
  label: string;
  value: string;
};

const FREIGHT_OPTIONS: Option[] = [
  { label: "Select...", value: "" },
  { label: "Pick Up", value: "pick up" },
  { label: "Collect", value: "collect" },
  { label: "Prepaid", value: "prepaid" },
  { label: "Bill to third party", value: "bill to third party" },
  { label: "Freight Prepaid", value: "freightPrepaid" },
];
const TERMS_OPTIONS: Option[] = [
  { label: "1/3 Down, 1/3 shipped from factory, 1/3 delivered", value: "447" },
  { label: "2% 10, Net 30", value: "449" },
  { label: "30% Down Payment, 70% balance paid before shipment", value: "445" },
  { label: "30% Down, Balance Net 15 Days", value: "497" },
  { label: "40% Down Payment, 60% when the goods delivered", value: "446" },
  { label: "50% down payment, 50% paid before shipment", value: "448" },
  { label: "C.O.D.", value: "444" },
  { label: "f", value: "617" },
  { label: "Net 30 days", value: "442" },
  { label: "Net 30 days subject to credit approval", value: "443" },
  { label: "Net 45 days", value: "496" },
  { label: "Net 60 days", value: "450" },
];
const SHIP_FROM_OPTIONS: Option[] = [
  { label: "Select...", value: "" },
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
const PAY_TYPE_OPTIONS: Option[] = [
  { label: "", value: "0" },
  { label: "Wire Transfer", value: "1" },
  { label: "Cheque Payment", value: "2" },
  { label: "Direct Deposit", value: "3" },
];
interface InvoiceFormData {
  id: number | string;
  freightType: string;
  terms: string;
  enterNewOne: string;
  soNumber: string;
  customerPO: string;
  invoiceDate: string;
  invoiceNumber: string;
  dueDate: string;
  shipDate: string;
  saleId?: string;
  shipFrom: string;
  shipVia: string;
  soldTo: string;
  shipTo: string;
  payType: string;
  invoiceBy: string;
  totalPayment: boolean;
  notes: string;
  items: {
    item: string;
    pn: string;
    description: string;
    remainQty: string;
    shipQty: string;
    unitPrice: string;
    totalPrice: string;
  }[];
}

export const AddInvoice: React.FC = () => {
  const { sid, id } = useParams();
  const [termsOptions, setTermsOptions] = useState<Option[]>(TERMS_OPTIONS);
  const [isAddingNewTerm, setIsAddingNewTerm] = useState(false);
  const [quantity, setquantity] = useState<number>(0);
  const [additionalCharges, setAdditionalCharges] = useState({
    installationCharge: "0.00",
    otherCharge: "0.00",
    discount: "0.00",
  });

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const getFormattedDate = (daysToAdd = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const DEFAULT_TERM = "442";

  const [formData, setFormData] = useState<InvoiceFormData>({
    freightType: "",
    id: id,
    terms: DEFAULT_TERM,
    enterNewOne: "",
    soNumber: "",
    customerPO: "",
    invoiceDate: getTodayDate(),
    invoiceNumber: "Z51044-C",
    dueDate: getFormattedDate(1),
    shipDate: getTodayDate(),
    shipFrom: "247",
    shipVia: "",
    soldTo: "",
    shipTo: "",
    payType: "2",
    invoiceBy: "",
    totalPayment: false,
    notes: "",
    items: [],
  });
  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await getAllTerms();
        const termsData = response.data?.data || [];
        const formattedTerms = termsData.map((term: any) => ({
          label: term.name || term.label || term.term || "",
          value: term.id?.toString() || term.value || "",
        }));
        setTermsOptions([{ label: "Select...", value: "" }, ...formattedTerms]);
      } catch (error) {
        console.error("Failed to fetch terms", error);
        setTermsOptions([{ label: "Select...", value: "" }, ...TERMS_OPTIONS]);
      }
    };

    fetchTerms();
  }, []);
  const [errors, setErrors] = useState<Partial<InvoiceFormData>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [salesData, setSalesData] = useState<any>(null);
  const [orderData, setOrderData] = useState<any>(null);

  const handleChange = (name: keyof InvoiceFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const updatedItems = [...formData.items];
    const originalQty = orderData?.[index]?.product_data?.quantity || 0;

    if (field === "shipQty") {
      let shipQty = parseFloat(value) || 0;
      // Ensure ship quantity doesn't exceed original quantity
      shipQty = Math.min(shipQty, originalQty);
      // Ensure ship quantity isn't negative
      shipQty = Math.max(0, shipQty);

      updatedItems[index] = {
        ...updatedItems[index],
        [field]: shipQty.toString(),
        remainQty: (originalQty - shipQty).toString(),
      };
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };
    }

    // Always calculate total price when unit price or ship quantity changes
    if (field === "unitPrice" || field === "shipQty") {
      const unitPrice = parseFloat(updatedItems[index].unitPrice || "0");
      const shipQty = parseFloat(updatedItems[index].shipQty || "0");
      updatedItems[index].totalPrice = (unitPrice * shipQty).toFixed(2);
    }
    console.log(updatedItems)

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const validateForm = () => {
    const newErrors: Partial<InvoiceFormData> = {};
    let isValid = true;

    if (!formData.freightType) {
      newErrors.freightType = "Freight type is required";
      isValid = false;
    }

    if (!formData.terms && !isAddingNewTerm) {
      newErrors.terms = "Terms are required";
      isValid = false;
    }

    if (isAddingNewTerm && !formData.enterNewOne.trim()) {
      newErrors.enterNewOne = "Please enter a new term";
      isValid = false;
    }

    if (!formData.payType) {
      newErrors.payType = "Payment type is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };
  const [freightDetails, setFreightDetails] = useState({
    detail: "N/A",
    preferredFreightForwarder: "",
    accountNumber: "",
    freightFee: "",
    freightBilledSeparately: false,
    billToWhom: "",
  });

  const handleFreightTypeChange = (value: string) => {
    handleChange("freightType", value);
    setFreightDetails({
      detail: value === "pick up" ? "N/A" : "",
      preferredFreightForwarder: "",
      accountNumber: "",
      freightFee: "",
      freightBilledSeparately: false,
      billToWhom: "",
    });
  };

  const handleAddNewTerm = async () => {
    if (!formData.enterNewOne.trim()) return;

    try {
      setLoading(true);
      const newTermPayload = {
        name: formData.enterNewOne,
        type: "term",
        code: "",
        long_code: "",
        country: "5",
        is_active: true,
      };

      const response = await addCode(newTermPayload);
      const newTerm = response.data.data;

      const newTermOption = {
        label: newTerm.name,
        value: newTerm.id.toString(),
      };

      setTermsOptions((prev) => [
        ...prev.filter((opt) => opt.value !== ""),
        newTermOption,
        { label: "Select...", value: "" },
      ]);

      handleChange("terms", newTerm.id.toString());
      setIsAddingNewTerm(false);
      handleChange("enterNewOne", "");
    } catch (error) {
      console.error("Failed to add new term:", error);
    } finally {
      setLoading(false);
    }
  };
  const formatAddress = (addressData: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    company_name?: string;
    country_name?: string;
    mobile?: string;
    user_name?: string;
    phone?: string;
    zip?: string;
  }) => {
    if (!addressData) return "";

    const parts = [
      addressData.company_name,
      addressData.user_name ? `Attn: ${addressData.user_name}` : undefined,
      addressData.address1,
      addressData.address2,
      `${addressData.city || ""}, ${addressData.state || ""} ${addressData.postal_code || addressData.zip || ""
      }`,
      addressData.country_name,
      addressData.phone ? `Tel: ${addressData.phone}` : "",
      addressData.mobile ? `Mobile: ${addressData.mobile}` : "",
    ];

    return parts.filter(Boolean).join("\n");
  };
  const calculateTotal = () => {
    const itemsTotal = formData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.totalPrice) || 0);
    }, 0);

    const installation = parseFloat(additionalCharges.installationCharge) || 0;
    const other = parseFloat(additionalCharges.otherCharge) || 0;
    const discount = parseFloat(additionalCharges.discount) || 0;

    return (itemsTotal + installation + other - discount).toFixed(2);
  };

  // useEffect(() => {
  //   if (sid) {
  //     getSalesById(sid)
  //       .then((res) => {
  //         setSalesData(res.data?.data);

  //         getOrderDataBySalesId(res.data?.data?.id)
  //           .then((res) => {
  //             const orderItems = res.data?.data;
  //             console.log(orderItems[0]?.product_data?.id)
  //             setOrderData(orderItems);

  //             setFormData((prev) => ({
  //               ...prev,
  //               items:
  //                 orderItems?.map((item: any, index: number) => {
  //                   const originalQty = item.product_data?.quantity || 0;

  //                   const shipQty = id
  //                     ? parseFloat(item.ship_number || "0")
  //                     : originalQty;
  //                   const remainQty = originalQty - shipQty;
  //                   return {
  //                     item: (index + 1).toString(),
  //                     pn: item?.product_data?.parts_no || "",
  //                     description: item.description || item.brief || "",
  //                     remainQty: remainQty.toString(),
  //                     shipQty: shipQty.toString(),
  //                     unitPrice: item.unit_price?.toString() || "0",
  //                     totalPrice: (
  //                       shipQty * parseFloat(item.unit_price || "0")
  //                     ).toFixed(2),
  //                   };
  //                 }) || prev.items,
  //             }));
  //           })
  //           .catch((err) => {
  //             console.error("Failed to fetch order data", err);
  //           });
  //       })
  //       .catch((err) => {
  //         console.error("Failed to fetch sales data", err);
  //       });
  //   }
  // }, [sid]);
  useEffect(() => {
    if (sid && !id) { // Only run this for adding new invoice (when id is not present)
      getSalesById(sid)
        .then((res) => {
          setSalesData(res.data?.data);

          getOrderDataBySalesId(res.data?.data?.id)
            .then((res) => {
              const orderItems = res.data?.data;
              console.log(orderItems[0]?.product_data?.id)
              setOrderData(orderItems);

              setFormData((prev) => ({
                ...prev,
                items:
                  orderItems?.map((item: any, index: number) => {
                    const originalQty = item.product_data?.quantity || 0;

                    const shipQty = originalQty; // For new invoice, default to full quantity
                    const remainQty = originalQty - shipQty;
                    return {
                      item: (index + 1).toString(),
                      pn: item?.product_data?.parts_no || "",
                      description: item.description || item.brief || "",
                      remainQty: remainQty.toString(),
                      shipQty: shipQty.toString(),
                      unitPrice: item.unit_price?.toString() || "0",
                      totalPrice: (
                        shipQty * parseFloat(item.unit_price || "0")
                      ).toFixed(2),
                    };
                  }) || prev.items,
              }));
            })
            .catch((err) => {
              console.error("Failed to fetch order data", err);
            });
        })
        .catch((err) => {
          console.error("Failed to fetch sales data", err);
        });
    }
  }, [sid, id]); // Add id to dependency array
  useEffect(() => {
    if (id) {
      fetchInvoiceById(id);
    }
  }, [id]);
  const fetchInvoiceById = async (invoiceId: string) => {
    try {
      setLoading(true);

      // Fetch invoice data
      const invoiceResponse = await getInvoiceById(invoiceId);
      const invoiceData = invoiceResponse.data.data;
      const invoice = invoiceData.invoice;
      const invoiceItems = invoiceData.items;

      // Fetch order data
      const orderResponse = await getOrderDataBySalesId(invoice.sale_id);
      const orderItems = orderResponse.data?.data || [];

      // Format dates
      const formatDateForInput = (dateString: string | null) => {
        if (!dateString) return "";
        return dateString.split("T")[0];
      };

      // Create a map of order items by ID for quick lookup
      const orderItemsMap = new Map();
      orderItems.forEach((item: any) => {
        orderItemsMap.set(item.id, item);
      });

      // Prepare form data
      const newFormData = {
        freightType: invoice.prepaid_type || "",
        id: invoice.id,
        terms: invoice.code_id?.toString() || DEFAULT_TERM,
        enterNewOne: invoice.code_name || "",
        soNumber: invoice.code_name || "",
        customerPO: "",
        invoiceDate: formatDateForInput(invoice.date),
        invoiceNumber: invoice.number || "",
        dueDate: formatDateForInput(invoice.due_date),
        shipDate: formatDateForInput(invoice.ship_date),
        shipFrom: invoice.ship_from || "247",
        shipVia: invoice.ship_via || "",
        soldTo: invoice.acc_third || "",
        shipTo: invoice.towhom || "",
        payType: invoice.pay_type?.toString() || "2",
        invoiceBy: invoice.invoice_by || "",
        totalPayment: invoice.show_overdue === 1,
        notes: invoice.notes || "",
        items: invoiceItems.map((item: any, index: number) => {
          const orderItem = orderItemsMap.get(item.order_item_id);
          const originalQty = orderItem?.product_data?.quantity || 0;
          const shipQty = item.ship_qty || 0;
          const remainQty = Math.max(0, originalQty - shipQty);

          return {
            item: (index + 1).toString(),
            pn: orderItem?.product_data?.parts_no || "",
            description: orderItem?.description || orderItem?.brief || orderItem?.product_data?.description || "",
            remainQty: remainQty.toString(),
            shipQty: shipQty.toString(),
            unitPrice: orderItem?.unit_price?.toString() || "0",
            totalPrice: (shipQty * parseFloat(orderItem?.unit_price || "0")).toFixed(2),
          };
        }),
      };

      // Set all state at once
      setFormData(newFormData);
      setOrderData(orderItems);
      setSalesData({ id: invoice.sale_id }); // Or fetch sales data if needed

    } catch (error) {
      console.error("Error fetching invoice data:", error);
    } finally {
      setLoading(false);
    }
  };
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      let termId = formData.terms;
      let termName =
        termsOptions.find((opt) => opt.value === termId)?.label || "";

      const shouldAddNewTerm =
        !id && isAddingNewTerm && formData.enterNewOne.trim();

      if (shouldAddNewTerm) {
        const newTermPayload = {
          name: formData.enterNewOne,
          type: "term",
          code: "",
          long_code: "",
          country: "5",
          is_active: true,
        };

        const response = await addCode(newTermPayload);
        const newTerm = response.data.data;

        const newTermOption = {
          label: newTerm.name,
          value: newTerm.id.toString(),
        };

        setTermsOptions((prev) => [
          ...prev.filter((opt) => opt.value !== ""),
          newTermOption,
          { label: "Select...", value: "" },
        ]);

        termId = newTerm.id.toString();
        termName = newTerm.name;
      }

      const payload = {
        sale_id: salesData?.id ?? 0,
        id: formData.id,
        code_id: parseInt(termId) || 0,
        code_name: termName,
        number: formData.invoiceNumber,
        date: formData.invoiceDate,
        invoice_by: formData.invoiceBy,
        status: 0,
        ship_status: 0,
        prepaid_type: formData.freightType,
        freight_fee: parseFloat(freightDetails.freightFee) || 0,
        sep_freight: freightDetails.freightBilledSeparately ? "1" : "0",
        install_fee: parseFloat(additionalCharges.installationCharge) || 0,
        other_fee: parseFloat(additionalCharges.otherCharge) || 0,
        discount: parseFloat(additionalCharges.discount) || 0,
        towhom: formData.shipTo,
        acc_third: formData.soldTo,
        due_date: formData.dueDate,
        billto_detail: formData.soldTo,
        shipto_detail: formData.shipTo,
        notes: formData.notes,
        ship_from: formData.shipFrom,
        ship_via: formData.shipVia,
        ship_date: formData.shipDate,
        if_paid: 0,
        makecheck: "",
        prepaid: 0,
        left_pay: 0,
        pay_date: "",
        gst_no: "",
        pay_type: formData.payType,
        install_fee: 0,
        other_fee: 0,
        discount: 0,
        total_price: parseFloat(calculateTotal()),
        show_overdue: formData.totalPayment ? 1 : 0,
        items: formData.items.map((item, index) => {
          const orderItem = orderData?.[index];
          return {
            product_id: orderItem?.product_data?.id || 0,
            order_item_id: orderItem?.id || 0,
            ship_qty: parseFloat(item.shipQty) || 0,
            if_ec: "",
            remain_qty: item.remainQty.toString(),
            box_ids: "",
          };
        }),
        freight_detail: freightDetails.detail,
        freight_forwarder: freightDetails.preferredFreightForwarder,
        freight_account: freightDetails.accountNumber,
        bill_to_whom: freightDetails.billToWhom,
      };

      if (formData.id) {
        await editInvoiceById(formData.id, payload);
      } else {
        await addInvoice(payload);
      }
      navigate("/sales");
    } catch (err) {
      console.error("Error during submission:", err);
    } finally {
      setLoading(false);
    }
  };
  const backInfo = { title: "Sales", path: "/sales" };
  return (
    <div>
      <PageBreadcrumb pageTitle="Sales Order - Invoice" backInfo={backInfo} />

      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}

      <form onSubmit={onSubmit} className="bg-white p-4">
        <div className="flex items-start gap-4">
          <div className="w-1/3">
            <Label>
              Freight Prepaid Type<span className="text-red-500">*</span>
            </Label>
            <Select
              options={FREIGHT_OPTIONS}
              value={FREIGHT_OPTIONS.find(
                (opt) => opt.value === formData.freightType
              )}
              onChange={(option) =>
                handleFreightTypeChange(option?.value || "")
              }
              className={errors.freightType ? "border-red-500" : ""}
            />
            {errors.freightType && (
              <p className="text-red-500 text-sm mt-1">{errors.freightType}</p>
            )}
          </div>

          {/* Pick Up - Show Detail field */}
          {formData.freightType === "pick up" && (
            <div className="w-1/3">
              <Label>Detail</Label>
              <Input
                type="text"
                value={freightDetails.detail}
                onChange={(e) =>
                  setFreightDetails((prev) => ({
                    ...prev,
                    detail: e.target.value,
                  }))
                }
              />
            </div>
          )}

          {/* Collect - Show Prefered freight forwarder and Account Number */}
          {formData.freightType === "collect" && (
            <>
              <div className="w-1/3">
                <Label>Prefered Freight Forwarder</Label>
                <Input
                  type="text"
                  value={freightDetails.preferredFreightForwarder}
                  onChange={(e) =>
                    setFreightDetails((prev) => ({
                      ...prev,
                      preferredFreightForwarder: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="w-1/3">
                <Label>Account Number</Label>
                <Input
                  type="text"
                  value={freightDetails.accountNumber}
                  onChange={(e) =>
                    setFreightDetails((prev) => ({
                      ...prev,
                      accountNumber: e.target.value,
                    }))
                  }
                />
              </div>
            </>
          )}

          {/* Prepaid - Show Freight Fee and checkbox */}
          {formData.freightType === "prepaid" && (
            <div className="flex items-end gap-4">
              <div className="w-1/3">
                <Label>Freight Fee</Label>
                <Input
                  type="text"
                  value={freightDetails.freightFee}
                  onChange={(e) =>
                    setFreightDetails((prev) => ({
                      ...prev,
                      freightFee: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={freightDetails.freightBilledSeparately}
                  onChange={(e) =>
                    setFreightDetails((prev) => ({
                      ...prev,
                      freightBilledSeparately: e.target.checked,
                    }))
                  }
                />
                <Label>Freight will be billed separately</Label>
              </div>
            </div>
          )}

          {/* Bill to third party - Show Bill to Whom and Account Number */}
          {formData.freightType === "bill to third party" && (
            <>
              <div className="w-1/3">
                <Label>Bill to Whom</Label>
                <Input
                  type="text"
                  value={freightDetails.billToWhom}
                  onChange={(e) =>
                    setFreightDetails((prev) => ({
                      ...prev,
                      billToWhom: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="w-1/3">
                <Label>Account Number</Label>
                <Input
                  type="text"
                  value={freightDetails.accountNumber}
                  onChange={(e) =>
                    setFreightDetails((prev) => ({
                      ...prev,
                      accountNumber: e.target.value,
                    }))
                  }
                />
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <Label>
              Select Terms<span className="text-red-500">*</span>
            </Label>
            <Select
              options={termsOptions}
              value={termsOptions.find((opt) => opt.value === formData.terms)}
              onChange={(option) => {
                handleChange("terms", option?.value || "");
                setIsAddingNewTerm(false);
                handleChange("enterNewOne", "");
              }}
              className={errors.terms ? "border-red-500" : ""}
            />
            {errors.terms && (
              <p className="text-red-500 text-sm mt-1">{errors.terms}</p>
            )}
          </div>
          <div>
            <Label>OR Enter New One</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={formData.enterNewOne}
                onChange={(e) => {
                  handleChange("enterNewOne", e.target.value);
                  if (e.target.value) {
                    setIsAddingNewTerm(true);
                    handleChange("terms", "");
                  } else {
                    setIsAddingNewTerm(false);
                  }
                }}
                className={errors.enterNewOne ? "border-red-500" : ""}
              />
              {isAddingNewTerm && (
                <Button
                  type="button"
                  onClick={handleAddNewTerm}
                  disabled={!formData.enterNewOne.trim()}
                >
                  Add Term
                </Button>
              )}
            </div>
            {errors.enterNewOne && (
              <p className="text-red-500 text-sm mt-1">{errors.enterNewOne}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <Label>SO Number</Label>
            <Input
              type="text"
              value={salesData?.so}
              onChange={(e) => handleChange("soNumber", e.target.value)}
            />
          </div>
          <div>
            <Label>Customer PO#</Label>
            <Input
              type="text"
              value={salesData?.customer_po}
              onChange={(e) => handleChange("customerPO", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-3">
          <div>
            <Label>Invoice Date</Label>
            <Input
              type="date"
              value={formData.invoiceDate}
              onChange={(e) => handleChange("invoiceDate", e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Label>Invoice Number</Label>
            <Input
              type="text"
              value={formData.invoiceNumber}
              onChange={(e) => handleChange("invoiceNumber", e.target.value)}
            />
          </div>
          <div>
            <Label>Due Date</Label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange("dueDate", e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-3">
          <div>
            <Label>Ship Date</Label>
            <Input
              type="date"
              value={formData.shipDate}
              onChange={(e) => handleChange("shipDate", e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <Label>Ship From</Label>
            <Select
              options={SHIP_FROM_OPTIONS}
              value={
                SHIP_FROM_OPTIONS.find(
                  (opt) => opt.value === formData.shipFrom
                ) || SHIP_FROM_OPTIONS.find((opt) => opt.value === "247")
              }
              onChange={(option) =>
                handleChange("shipFrom", option?.value || "")
              }
            />
          </div>

          <div>
            <Label>Ship Via</Label>
            <Input
              type="text"
              value={formData.shipVia}
              onChange={(e) => handleChange("shipVia", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <Label>Sold To</Label>
            <textarea
              className="w-full border rounded p-2 h-24"
              value={formatAddress(salesData?.bill_to_data)}
              onChange={(e) => handleChange("soldTo", e.target.value)}
              rows={4}
            />
          </div>
          <div>
            <Label>Ship To</Label>
            <textarea
              className="w-full border rounded p-2 h-24"
              value={formatAddress(salesData?.ship_to_data)}
              onChange={(e) => handleChange("shipTo", e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">Item</th>
                <th className="border px-4 py-2">PN</th>
                <th className="border px-4 py-2">Description</th>
                <th className="border px-4 py-2">Remain QTY</th>
                <th className="border px-4 py-2">Ship QTY</th>
                <th className="border px-4 py-2">Unit Price</th>
                <th className="border px-4 py-2">Total Price</th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, index) => (
                <tr key={`item-${index}`}>
                  <td className="border px-4 py-2">{item.item}</td>
                  <td className="border px-4 py-2">{item.pn}</td>
                  <td className="border px-4 py-2">{item.description}</td>
                  <td className="border px-4 py-2 text-center">
                    {item.remainQty}
                  </td>
                  <td className="border px-4 py-2">
                    <Input
                      type="number"
                      value={item.shipQty}
                      onChange={(e) =>
                        handleItemChange(index, "shipQty", e.target.value)
                      }
                    // min="0"
                    // max={item.remainQty}
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(index, "unitPrice", e.target.value)
                      }
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <Input
                      type="text"
                      value={item.totalPrice}
                      disabled
                      className="disabled:bg-gray-100 disabled:text-gray-800"
                    />
                  </td>
                </tr>
              ))}
              {/* Additional pricing rows */}
              <tr>
                <td className="border px-4 py-2">
                  {formData.items.length + 1}
                </td>
                <td className="border px-4 py-2">--</td>
                <td className="border px-4 py-2" colSpan={4}>
                  Installation Charge
                </td>
                <td className="border px-4 py-2">
                  <Input
                    type="number"
                    value={additionalCharges.installationCharge}
                    onChange={(e) =>
                      setAdditionalCharges((prev) => ({
                        ...prev,
                        installationCharge: e.target.value,
                      }))
                    }
                    min="0"
                    step="0.01"
                  />
                </td>
              </tr>
              <tr>
                <td className="border px-4 py-2">
                  {formData.items.length + 2}
                </td>
                <td className="border px-4 py-2">--</td>
                <td className="border px-4 py-2" colSpan={4}>
                  Other Charge
                </td>
                <td className="border px-4 py-2">
                  <Input
                    type="number"
                    value={additionalCharges.otherCharge}
                    onChange={(e) =>
                      setAdditionalCharges((prev) => ({
                        ...prev,
                        otherCharge: e.target.value,
                      }))
                    }
                    min="0"
                    step="0.01"
                  />
                </td>
              </tr>
              <tr>
                <td className="border px-4 py-2">
                  {formData.items.length + 3}
                </td>
                <td className="border px-4 py-2">--</td>
                <td className="border px-4 py-2" colSpan={4}>
                  Discount
                </td>
                <td className="border px-4 py-2">
                  <Input
                    type="number"
                    value={additionalCharges.discount}
                    onChange={(e) =>
                      setAdditionalCharges((prev) => ({
                        ...prev,
                        discount: e.target.value,
                      }))
                    }
                    min="0"
                    step="0.01"
                  />
                </td>
              </tr>
              <tr>
                <td className="border px-4 py-2">
                  {formData.items.length + 4}
                </td>
                <td className="border px-4 py-2">--</td>
                <td className="border px-4 py-2" colSpan={4}>
                  Total
                </td>
                <td className="border px-4 py-2">
                  <Input
                    value={calculateTotal()}
                    disabled
                    className="disabled:bg-gray-100 disabled:text-gray-800"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <Label>
              Pay Type<span className="text-red-500">*</span>
            </Label>
            <Select
              options={PAY_TYPE_OPTIONS}
              value={PAY_TYPE_OPTIONS.find(
                (opt) => opt.value === formData.payType
              )}
              onChange={(option) =>
                handleChange("payType", option?.value || "")
              }
              className={errors.payType ? "border-red-500" : ""}
            />
            {errors.payType && (
              <p className="text-red-500 text-sm mt-1">{errors.payType}</p>
            )}
          </div>
          <div>
            <Label>Invoiced By</Label>
            <Input
              type="text"
              value={formData.invoiceBy}
              onChange={(e) => handleChange("invoiceBy", e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center mt-3">
          <input
            type="checkbox"
            className="mr-2"
            checked={formData.totalPayment}
            onChange={(e) => handleChange("totalPayment", e.target.checked)}
          />
          <label className="font-medium">
            Check To Show Total Overdue Payment
          </label>
        </div>

        <div className="mt-3">
          <Label>Notes</Label>
          <textarea
            className="w-full border rounded p-2"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            rows={3}
          />
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Link to="/sales">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </div>
  );
};
