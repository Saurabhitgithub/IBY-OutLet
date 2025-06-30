import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  addPayment,
  deletePayment,
  getAllSales,
  getAllUsers,
  getInvoiceById,
  getPaymentById,
  updatePayment,
} from "../../services/apis";

interface PaymentFormData {
  pay_amount: string;
  unpay_amount: string;
  unpay_ratio: string;
  fast_pay: string;
  cheque_number: string;
  receive_by: number;
  date: string;
  if_paid: boolean;
}
interface InvoiceInfo {
  id?: number;
  number?: string;
  date?: string;
  total_price?: number;
  left_pay?: number;
  code_id?: number;
  prepaid_type?: string;
}

interface SalesData {
  id: number;
  so: string;
  customer_po: string;
  ship_to_data: any;
  bill_to_data: any;
  invoice_info: InvoiceInfo;
}
interface InvoiceFormData {
  id: number;
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
  totalAmount: string;
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

interface Payment {
  id: number;
  amount: number;
  fast_pay_discount: string;
  cheque_number: string;
  deposit_by: string;
  pay_date: string;
  who_pay: string;
}
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

export const SalesPayment: React.FC = () => {
  const {
    id: orderId,
    invoiceid: invoiceIdParam,
    salesdid: saleIdParam,
  } = useParams<{
    id: string;
    invoiceid: string;
    salesdid: string;
  }>();
  const navigate = useNavigate();
  const saleId = saleIdParam ? parseInt(saleIdParam) : 0;
  const invoiceId = invoiceIdParam ? parseInt(invoiceIdParam) : 0;
  const [userId, setUserId] = useState<number>(0);
  const [openTo, setopenTo] = useState<Option[]>([]);
  const [invoiceAmount, setInvoiceAmount] = useState<string>("0.00");
  const [isPaid, setIsPaid] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSalesCount, setTotalSalesCount] = useState(0);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  const [formData, setFormData] = useState<PaymentFormData>({
    pay_amount: "0.00",
    unpay_amount: "0.00",
    unpay_ratio: "0.00",
    fast_pay: "",
    cheque_number: "",
    receive_by: 0,
    date: new Date().toISOString().split("T")[0],
    if_paid: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [soNumber, setSoNumber] = useState("");
  const [TotalPrice, setTotalPrice] = useState<string>("");
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [salesData, setSalesData] = useState<any[]>([]);


  const handleEditPayment = (payment: Payment) => {
    try {
      const paymentAmount = payment.amount || 0;
      const invoiceTotal = parseFloat(invoiceAmount) || 0;
      const unpaidAmount = Math.max(0, invoiceTotal - paymentAmount);
      const unpaidRatio = invoiceTotal > 0 ? (unpaidAmount / invoiceTotal) * 100 : 0;

      setEditingPayment(payment);
      setFormData({
        pay_amount: paymentAmount.toFixed(2),
        unpay_amount: unpaidAmount.toFixed(2),
        unpay_ratio: unpaidRatio.toFixed(2),
        fast_pay: payment.fast_pay_discount || "",
        cheque_number: payment.cheque_number || "",
        receive_by: payment.deposit_by ? parseInt(payment.deposit_by) : 0,
        date: payment.pay_date
          ? new Date(payment.pay_date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        if_paid: false,
      });
    } catch (error) {
      console.error("Error editing payment:", error);
      setError("Failed to load payment data for editing");
    }
  };
  useEffect(() => {
    const user_id = localStorage.getItem("Sql_id");
    if (user_id) {
      setUserId(parseInt(user_id));
    }
  }, []);
  useEffect(() => {
    const paid = parseFloat(formData.pay_amount) || 0;
    const total = parseFloat(invoiceAmount) || 0;
    const unpaid = total - paid;
    const unpaidRatio = total > 0 ? (unpaid / total) * 100 : 0;

    setFormData((prev) => ({
      ...prev,
      unpay_amount: Math.max(0, unpaid).toFixed(2),
      unpay_ratio: unpaidRatio.toFixed(2),
      if_paid: unpaid <= 0,
    }));
  }, [formData.pay_amount, invoiceAmount]);
  useEffect(() => {
    const fetchData = async () => {
      if (invoiceIdParam) {
        await fetchInvoiceById(invoiceIdParam);
      }
    };

    fetchData();
  }, [invoiceIdParam, orderId]);
  const fetchInvoiceById = async (invoiceId: string) => {
    try {
      setLoading(true);
      const response = await getInvoiceById(invoiceId);
      const data = response.data.data;
      const invoice = data.invoice;
      const items = data.items;

      // Set the total amount from invoice.total_price
      setInvoiceAmount(invoice.total_price.toFixed(2));

      // Set the initial payment amount to the remaining amount (total_price - left_pay)
      const paidAmount = invoice.total_price - invoice.left_pay;

      const codeIdStr = invoice.code_id?.toString() || "";
      const matchedTerm = TERMS_OPTIONS.find((opt) => opt.value === codeIdStr);

      setFormData((prev) => ({
        ...prev,
        pay_amount: paidAmount.toFixed(2),
        invoice_id: invoice.id,
        invoice_number: invoice.number,

        freightType: invoice.prepaid_type || "",
        terms: matchedTerm ? codeIdStr : "",
      }));
    } catch (error) {
      console.error("Error fetching invoice data:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchSalesData = async () => {
    try {
      const payload = {
        page: currentPage,
        limit: itemsPerPage,
      };

      const res = await getAllSales(payload);
      const sales = res.data.data.data;

      setSalesData(sales);
      setTotalSalesCount(res.data.totalCount);

      if (sales.length > 0) {
        const firstSale = sales[0];

        if (firstSale.so) {
          setSoNumber(firstSale.so);
        }

        if (firstSale.invoice_info?.total_price) {
          setTotalPrice(firstSale.invoice_info.total_price.toString());
        }
      }
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        const response = await getPaymentById(orderId);
        setIsPaid(response.data.isPaid);
        if (response.data.isPaid) {
          setPayments(response.data.payments);
        }
      } catch (err) {
        setError("Failed to fetch payment data");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [orderId]);
  // useEffect(() => {
  //   if (success) {
  //     const timer = setTimeout(() => {
  //       navigate(-1);
  //     }, 1500);
  //     return () => clearTimeout(timer);
  //   }
  // }, [success, navigate]);
  const handleCancelEdit = () => {
    setEditingPayment(null);
    setFormData({
      pay_amount: "0.00",
      unpay_amount: "0.00",
      unpay_ratio: "0.00",
      fast_pay: "",
      cheque_number: "",
      receive_by: 0,
      date: new Date().toISOString().split("T")[0],
      if_paid: false,
    });
  };
  const handleDeletePayment = async (paymentId: number) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      try {
        await deletePayment(paymentId);
        // Refresh payment data after deletion
        const response = await getPaymentById(orderId);
        setIsPaid(response.data.isPaid);
        setPayments(response.data.payments || []);
        setSuccess(true);
        setError("");
      } catch (err) {
        setError("Failed to delete payment");
        console.error("Delete payment error:", err);
      }
    }
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      const users = response.data?.data || [];
      const formattedUsers = users.map((user: any) => ({
        value: user.id,
        label: user.name,
      }));
      setopenTo(formattedUsers);
    } catch (error) {
      console.error("Failed to fetch account managers:", error);
    }
    setLoading(false);
  };
  console.log("invoice id for add payment", formData.invoice_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const isFullyPaid = parseFloat(formData.unpay_amount) <= 0;

      const paymentPayload = {
        user_id: userId,
        sale_id: saleId,
        invoice_id: formData.invoice_id,
        pay_amount: formData.pay_amount,
        unpay_amount: formData.unpay_amount,
        unpay_ratio: formData.unpay_ratio,
        fast_pay: formData.fast_pay,
        cheque_number: formData.cheque_number,
        receive_by: formData.receive_by,
        date: new Date(formData.date).toISOString(),
        if_paid: isFullyPaid ? 1 : 0,
      };

      console.log("Payment payload:", paymentPayload);

      let response;
      if (editingPayment) {
        // Update existing payment
        response = await updatePayment(editingPayment.id, paymentPayload);
      } else {
        // Add new payment
        response = await addPayment(paymentPayload);
      }

      if (response.data.success) {
        setSuccess(true);
        setEditingPayment(null);
        setFormData({
          pay_amount: "0.00",
          unpay_amount: "0.00",
          unpay_ratio: "0.00",
          fast_pay: "",
          cheque_number: "",
          receive_by: 0,
          date: new Date().toISOString().split("T")[0],
          if_paid: false,
        });

        const updatedResponse = await getPaymentById(orderId);
        setIsPaid(updatedResponse.data.isPaid);
        setPayments(updatedResponse.data.payments || []);
      }
      navigate("/sales");
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : "Failed to process payment. Please try again.";
      setError(errorMessage);
      console.error("Payment submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };
  // if (loading) {
  //   return <div className="container mx-auto p-6">Loading...</div>;
  // }

  return (
    <div className="container mx-auto p-6 rounded">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <h1 className="text-2xl font-bold mb-4">Payment Management</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Payment added successfully!
        </div>
      )}
      {console.log("formData.invoice_number", formData)}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SO Number
            </label>
            <input
              type="text"
              value={soNumber}
              readOnly
              className="w-full border p-2 rounded bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Number
            </label>
            <input
              type="text"
              value={formData.invoice_number || ""}
              readOnly
              className="w-full border p-2 rounded bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Due
            </label>
            <input
              type="text"
              value={invoiceAmount}
              readOnly
              className="w-full border p-2 rounded bg-gray-100"
            />
          </div>
        </div>

        {isPaid ? (
          // Payment Listing View
          <div>
            <h3 className="text-lg font-medium mb-4">Payment History</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fast Pay Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deposit Check By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pay Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Who Pay
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment, index) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.fast_pay_discount || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.cheque_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.deposit_by}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.pay_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.who_pay}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleEditPayment(payment)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 ml-2"
                          onClick={() => handleDeletePayment(payment.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // Payment Form View
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">
                {editingPayment ? "Edit Payment" : "Payment Details"}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Received Payment <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="pay_amount"
                    value={formData.pay_amount}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unpayment <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="unpay_amount"
                      value={formData.unpay_amount}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unpayment Ratio (%){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="unpay_ratio"
                      value={formData.unpay_ratio}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                      required
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fast Pay Discount
                    </label>
                    <input
                      type="text"
                      name="fast_pay"
                      value={formData.fast_pay}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cheque Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="cheque_number"
                      value={formData.cheque_number}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deposit Check By <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="receive_by"
                      value={formData.receive_by}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                      required
                    >
                      <option value={0}>Select One...</option>
                      {openTo.map((user) => (
                        <option key={user.value} value={user.value}>
                          {user.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pay Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                      required
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              {editingPayment ? (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition"
                  disabled={isSubmitting}
                >
                  Cancel Edit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 transition"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : editingPayment ? (
                  "Update Payment"
                ) : (
                  "Submit Payment"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
