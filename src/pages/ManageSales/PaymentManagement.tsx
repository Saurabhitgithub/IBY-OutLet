import React, { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { useNavigate, useParams } from "react-router";
import { deletePayment, getAllPayment, getAllSales, getInvoiceById } from "../../services/apis";
import moment from "moment";
import { Box, Modal } from "@mui/material";
import { toast } from "react-toastify";
interface PaymentFormData {
    pay_amount: string;
    unpay_amount: string;
    unpay_ratio: string;
    fast_pay: string;
    cheque_number: string;
    receive_by: number;
    date: string;
    if_paid: boolean;
    invoice_number: any;
}
interface Payment {
    id: any;
    pay_amount: string;
    fast_pay: string;
    cheque_number: string;
    receive_by: number;
    date: string;
    paidBy: string;
}
export const PaymentManagement: React.FC = () => {
    const {
        id: orderId,
        invoiceid: invoiceIdParam,
        salesdid: saleIdParam,
    } = useParams<{
        id: string;
        invoiceid: string;
        salesdid: string;
    }>();

    console.log("Order ID:", orderId);
    console.log("Invoice ID:", invoiceIdParam);
    console.log("Sale ID:", saleIdParam);
    const itemsPerPage = 10;
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [salesData, setSalesData] = useState<any[]>([]);
    const [soNumber, setSoNumber] = useState("");
    const [TotalPrice, setTotalPrice] = useState<string>("");
    const [invoiceAmount, setInvoiceAmount] = useState<string>("0.00");
    const [loading, setLoading] = useState(true);
    const [paymentsData, setPaymentsData] = useState<Payment[]>([]);
    const [formData, setFormData] = useState<PaymentFormData>({
        pay_amount: "0.00",
        unpay_amount: "0.00",
        unpay_ratio: "0.00",
        fast_pay: "",
        cheque_number: "",
        receive_by: 0,
        date: new Date().toISOString().split("T")[0],
        if_paid: false,
        invoice_number: "",
    });

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

            setFormData((prev) => ({
                ...prev,
                pay_amount: paidAmount.toFixed(2),
                invoice_id: invoice.id,
                invoice_number: invoice.number,

                freightType: invoice.prepaid_type || "",
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
            // setTotalSalesCount(res.data.totalCount);

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
        if (saleIdParam) {
            fetchPaymentsData(saleIdParam);
        }
    }, [saleIdParam]);
    const fetchPaymentsData = async (salesdid: string) => {
        try {
            const res = await getAllPayment(salesdid);
            setPaymentsData(res.data.data);
            // Process payments if needed
        } catch (error) {
            console.error("Error fetching payments data:", error);
        }
    };
    const navigate = useNavigate();
    const handleDelete = async () => {
        setLoading(true);

        if (!deleteId) {
            setLoading(false);
            return;
        }

        try {
            await deletePayment(deleteId);
            setIsDeleteModalOpen(false);
            setDeleteId(null);
            fetchPaymentsData(saleIdParam);
            toast.success("Payment deleted successfully!", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
        } catch (error) {
            toast.error("Failed to delete payment.", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
                Payment Managment
            </h1>

            <ComponentCard title="Payment Managment">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="text-sm text-gray-600 font-medium">SO Number</label>
                        <input
                            type="text"
                            value={soNumber}
                            readOnly
                            className="w-full border p-2 rounded bg-gray-100"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-600 font-medium">Invoice Number</label>
                        <input
                            type="text"
                            value={formData.invoice_number || ""}
                            readOnly
                            className="w-full border p-2 rounded bg-gray-100"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-600 font-medium">Total Due</label>
                        <input
                            type="text"
                            value={invoiceAmount}
                            readOnly
                            className="w-full border p-2 rounded bg-gray-100"
                        />
                    </div>
                </div>

                <h2 className="text-md font-semibold mb-2">
                    Paid <span className="text-red-500">*</span>
                </h2>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableCell isHeader>No.</TableCell>
                                <TableCell isHeader>Amount</TableCell>
                                <TableCell isHeader>Fast Pay Discount</TableCell>
                                <TableCell isHeader>Check Number</TableCell>
                                <TableCell isHeader>Deposit Check By</TableCell>
                                <TableCell isHeader>Pay Date</TableCell>
                                <TableCell isHeader>Who Pay</TableCell>
                                <TableCell isHeader>Action</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paymentsData.map((payment, index) => (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{payment.pay_amount}</TableCell>
                                    <TableCell>{payment.fast_pay}</TableCell>
                                    <TableCell>{payment.cheque_number}</TableCell>
                                    <TableCell>{payment.receive_by}</TableCell>
                                    <TableCell>{moment(payment.date).format("YYYY-MM-DD")}</TableCell>
                                    <TableCell>{payment.paidBy}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => navigate(`/salesPayment/${orderId}/${invoiceIdParam}/${saleIdParam}`)}
                                                className="text-blue-600 cursor-pointer hover:underline"
                                            >
                                                Modify
                                            </button>
                                            <button onClick={() => {
                                                setDeleteId(payment.id ?? null);
                                                setIsDeleteModalOpen(true);
                                            }} className="text-red-600 cursor-pointer hover:underline">Delete</button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </ComponentCard>
            <Modal
                open={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
            >
                <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
                        <p>
                            Are you sure you want to delete this payment?
                        </p>
                        <div className="flex justify-end mt-4">
                            <button
                                className="text-gray-600 hover:text-gray-900 mr-4"
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};
