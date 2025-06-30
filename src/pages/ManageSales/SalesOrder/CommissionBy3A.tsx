import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { Button } from '@mui/material';
import { Calendar as CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { getAllUsers, getSalesCommissionBy3A } from "../../../services/apis";
import moment from "moment";

export const SalesCommissionby3A: React.FC = () => {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [salesOptions, setSalesOptions] = useState([]);
    const [salesFilter, setSalesFilter] = useState("");
    const [customerFilter, setCustomerFilter] = useState("");
    const [receiveFilter, setReceiveFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const [salesData, setSalesData] = useState([]);

    const [dueFilter, setDueFilter] = useState("");
    const navigate = useNavigate();
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getAllUsers();
            const users = response.data?.data || [];
            const formattedUsers = users.map((user: any) => ({
                value: user.id,
                label: user.name,
            }));
            setSalesOptions(formattedUsers);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);
    useEffect(() => {
        if (salesFilter) {
            fetchCommisionsBySalesId(salesFilter);
        }
    }, [salesFilter]);

    const fetchCommisionsBySalesId = async (salesId: string) => {
        setLoading(true);
        try {
            const response = await getSalesCommissionBy3A(salesId);
            if (response.data?.data) {
                const salesData = response.data.data;
                setSalesData(salesData);
                console.log("Sales Data:", salesData);
            }
        } catch (error) {
            console.error("Failed to fetch sales commission data:", error);
        }
        setLoading(false);
    };
    const dateOptions = ["All Date", "Due Date"];
    const CustomerIDOptions = ["Select..."];
    const receiveOptions = ["If Received"];
    const dueOptions = ["Over due", "Without Over due"];

    return (
        <div className="p-4">
            {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            <h1 className="text-xl font-bold mb-4">Sales Order Stats</h1>

            <div className="flex flex-wrap items-end gap-4 mb-6">
                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">From Date</label>
                    <div className="relative">
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="h-10 w-85 rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                            onFocus={(e) => e.target.showPicker()}
                            onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                        />
                        <CalendarIcon className="absolute right-3 top-2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">To Date</label>
                    <div className="relative">
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="h-10 w-85 rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                            onFocus={(e) => e.target.showPicker()}
                            onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                        />
                        <CalendarIcon className="absolute right-3 top-2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div className="min-w-[200px]">
                    <label className="block mb-1 text-sm font-medium text-gray-700">Date Type</label>
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                    >
                        {dateOptions.map((date) => (
                            <option key={date} value={date}>{date}</option>
                        ))}
                    </select>
                </div>

                <div className="min-w-[200px]">
                    <label className="block mb-1 text-sm font-medium text-gray-700">Sales Man</label>
                    <select
                        value={salesFilter}
                        onChange={(e) => setSalesFilter(e.target.value)}
                        className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                    >
                        <option value="">Select Salesman</option>
                        {salesOptions.map((salesMan: any) => (
                            <option key={salesMan.value} value={salesMan.value}>{salesMan.label}</option>
                        ))}
                    </select>
                </div>

                <div className="min-w-[200px]">
                    <label className="block mb-1 text-sm font-medium text-gray-700">Customer ID</label>
                    <select
                        value={customerFilter}
                        onChange={(e) => setCustomerFilter(e.target.value)}
                        className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                    >
                        {CustomerIDOptions.map((customerId) => (
                            <option key={customerId} value={customerId}>{customerId}</option>
                        ))}
                    </select>
                </div>

                <div className="min-w-[200px]">
                    <label className="block mb-1 text-sm font-medium text-gray-700">If Received</label>
                    <select
                        value={receiveFilter}
                        onChange={(e) => setReceiveFilter(e.target.value)}
                        className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                    >
                        {receiveOptions.map((payment) => (
                            <option key={payment} value={payment}>{payment}</option>
                        ))}
                    </select>
                </div>

                <div className="min-w-[200px]">
                    <label className="block mb-1 text-sm font-medium text-gray-700">Over Due</label>
                    <select
                        value={dueFilter}
                        onChange={(e) => setDueFilter(e.target.value)}
                        className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                    >
                        {dueOptions.map((due) => (
                            <option key={due} value={due}>{due}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-end">
                    <button 
                    className="bg-brand px-4 py-3 rounded-xl"
                        onClick={() => {
                            setFromDate("");
                            setToDate("");
                            setDateFilter("");
                            setSalesFilter("");
                            setCustomerFilter("");
                            setReceiveFilter("");
                            setDueFilter("");
                        }}
                    >
                        Reset 
                    </button >
                </div>
            </div>


            <div className="flex mb-4 gap-2">
                <button className=" text-white px-5 py-2 mt-3 me-3 rounded-xl bg-brand flex items-center gap-2"
                    onClick={() => navigate("/commission")}>
                    Cal. Commission
                </button>
                <button className=" text-white px-5 py-2 mt-3 me-3 rounded-xl bg-brand flex items-center gap-2"
                    onClick={() => navigate("/commissionby3A")}>
                    Cal. Commission By 3A
                </button>
            </div>

            <div className="relative w-full mt-4 overflow-auto">
                <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">No.</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">SO Number</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Customer ID</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Invoice Date</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Received Date</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Received Days</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Total Purchase</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Total Sales</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Gross Profit</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Enrolled Commission</TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {salesData.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell className="px-5 py-3">{index + 1}</TableCell>
                                <TableCell className="px-5 py-3">{row.so}</TableCell>
                                <TableCell className="px-5 py-3">{row.customerId}</TableCell>
                                <TableCell className="px-5 py-3">{moment(row.invoicesData[0]?.date).format("DD/MM/YYYY")}</TableCell>
                                <TableCell className="px-5 py-3">{row.receivedDate}</TableCell>
                                <TableCell className="px-5 py-3">{row.received_days}</TableCell>
                                <TableCell className="px-5 py-3">{row.total_purchase}</TableCell>
                                <TableCell className="px-5 py-3">{row.total_sales}</TableCell>
                                <TableCell className="px-5 py-3">{row.gross_profit}</TableCell>
                                <TableCell className="px-5 py-3">{row.commission || "N/A"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};