import React, { useState, useEffect } from "react";
import ComponentCard from "../../../components/common/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Button } from "@mui/material";
import moment from "moment";
import { Calendar as CalendarIcon } from "lucide-react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { getPermissionByRole } from "../../../services/apis";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface Permission {
  tab_name: string;
  is_show: boolean;
  tab_function: {
    tab_functionName: string;
    is_showFunction: boolean;
    _id: string;
  }[];
}

interface RolePermissions {
  _id: string;
  permission_tab: Permission[];
  role: string;
  [key: string]: any;
}

export const SalesProfitByPN: React.FC = () => {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [titleFilter, setTitleFilter] = useState("");
  const [salesFilter, setSalesFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [receiveFilter, setReceiveFilter] = useState("");
  const [dueFilter, setDueFilter] = useState("");
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [canViewSalesProfit, setCanViewSalesProfit] = useState(false);
  const [loading, setLoading] = useState(false);

  const titleOptions = [
    "Westcomm Pump & Equipment Ltd.",
    "OEMic industries Inc.",
    "OEMic Inc.",
    "Volk",
    "Pecos Mud Pump",
  ];

  const dateOptions = ["All Date", "Due Date"];
  const salesManOptions = [
    "Accounting USA",
    "BinZhou",
    "BitDashu",
    "BitDashu CnB",
    "CEO",
    "CryptoDiv",
  ];
  const CustomerIDOptions = [
    "1776 Energy Operations",
    "5M Services LLC",
    "A.S. Logistic Services",
    "AB valve and piping LLC",
  ];
  const receiveOptions = ["All", "AR Received", "AR Not Received"];
  const dueOptions = ["Without Over Due", "Over Due"];

  const salesOrderTypeData: any[] = [];

  // Permission helper functions
  const getCurrentUserRole = (): string => {
    return localStorage.getItem('role') || '';
  };

  const fetchUserPermissions = async (): Promise<RolePermissions | null> => {
    const role = getCurrentUserRole();
    if (!role) return null;

    try {
      const response = await getPermissionByRole({ role });
      return response.data?.data || null;
    } catch (error) {
      console.error('Error fetching permissions:', error);
      return null;
    }
  };

  const checkPermission = async (tabName: string, functionName: string): Promise<boolean> => {
    if (getCurrentUserRole() === 'general_manager') return true;

    const permissions = await fetchUserPermissions();
    if (!permissions) return false;

    const tab = permissions.permission_tab.find(t => t.tab_name === tabName);
    if (!tab) return false;

    const func = tab.tab_function.find(f => f.tab_functionName === functionName);
    return func?.is_showFunction || false;
  };

  useEffect(() => {
    const initializeComponent = async () => {
      const canView = await checkPermission('Sales Profit By PN', 'View');
      setCanViewSalesProfit(canView);

      if (!canView) {
        toast.error("You don't have permission to view sales profit by PN", {
          toastId: "no-permission-view-sales-profit",
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
        navigate('/');
      }
    };

    initializeComponent();
  }, []);

  if (!canViewSalesProfit) {
    return (
      <div className="p-4 text-center py-8 text-red-500">
        {/* You don't have permission to view this page */}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Sales Order Statics</h1>

      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            From Date
          </label>
          <div className="relative">
            <Flatpickr
              options={{
                dateFormat: "Y-m-d",
                maxDate: toDate || undefined,
              }}
              value={fromDate}
              onChange={(dates) =>
                setFromDate(moment(dates[0]).format("YYYY-MM-DD"))
              }
              className="h-10 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-md"
              placeholder="From Date"
            />
            {/* <CalendarIcon className="absolute right-3 top-2 h-5 w-5 text-gray-400 pointer-events-none" /> */}
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            To Date
          </label>
          <div className="relative">
            <Flatpickr
              options={{
                dateFormat: "Y-m-d",
                minDate: fromDate || undefined,
              }}
              value={toDate}
              onChange={(dates) =>
                setToDate(moment(dates[0]).format("YYYY-MM-DD"))
              }
              className="h-10 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-md"
              placeholder="To Date"
            />
            {/* <CalendarIcon className="absolute right-3 top-2 h-5 w-5 text-gray-400 pointer-events-none" /> */}
          </div>
        </div>
        <div className="min-w-[400px]">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Title
          </label>
          <select
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
          >
            <option value="">Select...</option>
            {titleOptions.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[300px]">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Date Type
          </label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
          >
            {dateOptions.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[340px]">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Sales Man
          </label>
          <select
            value={salesFilter}
            onChange={(e) => setSalesFilter(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
          >
            <option value="">Select...</option>
            {salesManOptions.map((salesMan) => (
              <option key={salesMan} value={salesMan}>
                {salesMan}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[420px]">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Customer ID
          </label>
          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
          >
            <option value="">Select...</option>
            {CustomerIDOptions.map((customerId) => (
              <option key={customerId} value={customerId}>
                {customerId}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[200px]">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            If Received
          </label>
          <select
            value={receiveFilter}
            onChange={(e) => setReceiveFilter(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
          >
            <option value="">Select...</option>
            {receiveOptions.map((payment) => (
              <option key={payment} value={payment}>
                {payment}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[200px]">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Over Due
          </label>
          <select
            value={dueFilter}
            onChange={(e) => setDueFilter(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
          >
            <option value="">Select...</option>
            {dueOptions.map((due) => (
              <option key={due} value={due}>
                {due}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end mt-6 ms-5">
          <Button
            variant="outlined"
            onClick={() => {
              setFromDate("");
              setToDate("");
              setTitleFilter("");
              setDateFilter("");
              setSalesFilter("");
              setCustomerFilter("");
              setReceiveFilter("");
              setDueFilter("");
              setFiltersApplied(false);
              setSalesData([]); // Clear existing data
            }}
          >
            Reset Filter
          </Button>
        </div>
      </div>

      <div className="relative w-full mt-8">
        <ComponentCard title="Sales Order Statics">
          <div style={{ overflowX: "auto" }}>
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <td
                    colSpan={16}
                    className="text-center pb-2 text-xl text-gray-700"
                  >
                    AR Received
                  </td>
                </TableRow>
              </TableHeader>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    No.
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    PN
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Model
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Total Purchase
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Total Sales
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Gross Profit
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {salesOrderTypeData.length === 0 ? (
                  <TableRow>
                    <td colSpan={16} className="text-center py-4 text-gray-500">
                      No data found.
                    </td>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
};
