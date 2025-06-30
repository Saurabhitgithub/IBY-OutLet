import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ComponentCard from "../../../components/common/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Button } from "@mui/material";
// import Button from "../../../components/ui/button/Button";
// import { Grid, TextField } from "@mui/material";
// import Select from "react-select";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  getAllSales,
  getAllUsers,
  getPermissionByRole,
  getSalesCount,
} from "../../../services/apis";
import moment from "moment";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { toast } from "react-toastify";
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


export const SalesOrderByStats: React.FC = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [titleFilter, setTitleFilter] = useState("");
  const [salesOptions, setSalesOptions] = useState([]);
  const [salesFilter, setSalesFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [receiveFilter, setReceiveFilter] = useState("");
  const [dueFilter, setDueFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalSalesCount, setTotalSalesCount] = useState(0);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [salesData, setSalesData] = useState<any[]>([]);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [canViewSalesStats, setCanViewSalesStats] = useState(false);
  const itemsPerPage = 10;
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: "",
    salesManFilter: "",
    inputByFilter: "",
    billToFilter: "",
    titleFilter: "",
    sortOption: "latest" as "latest" | "oldest",
    includeDeleted: false,
    fromDate: "",
    toDate: "",
  });
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
      const canView = await checkPermission('Sales Order Statistics', 'View');
      setCanViewSalesStats(canView);

      if (canView) {
        fetchUsers();
      } else {
        toast.error("You don't have permission to view sales order stats", {
          toastId: "no-permission-view-sales-stats",
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
        navigate('/');
      }
    };

    initializeComponent();
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
      setSalesOptions(formattedUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const titleOptions = [
    "Westcomm Pump & Equipment Ltd.",
    "OEMic industries Inc.",
    "OEMic Inc.",
    "Volk",
    "Pecos Mud Pump",
  ];
  const dateOptions = ["All Date", "Due Date"];
  const CustomerIDOptions = [
    "1776 Energy Operations",
    "5M Services LLC",
    "A.S. Logistic Services",
    "AB valve and piping LLC",
  ];
  const receiveOptions = [
    { value: "All", label: "All" },
    { value: "1", label: "AR Received" },
    { value: "0", label: "AR Not Received" },
  ];
  const dueOptions = ["Without Over Due", "Over Due"];

  useEffect(() => {
    if (filtersApplied && canViewSalesStats) {
      fetchSalesCount();
      fetchSalesData();
    }
  }, [currentPage, appliedFilters, filtersApplied, canViewSalesStats]);

  const fetchSalesCount = async () => {
    if (!filtersApplied) return;
    setLoading(true);
    try {
      const res = await getSalesCount();
      setTotalSalesCount(res.data.count || 0);
    } catch (error) {
      console.error("Error fetching sales count:", error);
    }
    setLoading(false);
  };
  const fetchSalesData = async () => {
    if (!filtersApplied) return;
    setLoading(true);

    try {
      const payload = {
        page: currentPage,
        limit: itemsPerPage,
        filter: {
          if_paid: receiveFilter !== "" ? Number(receiveFilter) : undefined,
        },
      };

      const res = await getAllSales(payload);
      setSalesData(res.data.data.data);
      setTotalSalesCount(res.data.totalCount);
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
    setLoading(false);
  };

  if (!canViewSalesStats) {
    return (
      <div className="p-4 text-center py-8 text-red-500">
        {/* You don't have permission to view this page */}
      </div>
    );
  }


  return (
    <div className="p-4">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <h1 className="text-xl font-bold mb-4">Sales Order Stats</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {/* Date Filters */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
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
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
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
          </div>
        </div>

        {/* Other Filters */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
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

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
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

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Sales Man
          </label>
          <select
            value={salesFilter}
            onChange={(e) => setSalesFilter(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
          >
            <option value="">Select Salesman</option>
            {salesOptions.map((salesMan: any) => (
              <option key={salesMan.value} value={salesMan.value}>
                {salesMan.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
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

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            If Received
          </label>
          <select
            value={receiveFilter}
            onChange={(e) => setReceiveFilter(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
          >
            <option value="">Select...</option>
            {receiveOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
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

        {/* Reset Button - Now smaller and aligned to the right */}
        <div className="md:col-start-4 lg:col-start-3 xl:col-start-4 flex items-end justify-end">
          <button
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
              setSalesData([]);
            }}
            className=" rounded-xl px-5 py-3 bg-brand  text-sm"
          >
            Reset
          </button>
        </div>
        {/* Modified Action Buttons - now with equal width */}
        <div className="col-span-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-2">
          <button
            className="bg-brand text-white px-2 py-1.5 rounded text-sm flex items-center justify-center"
            onClick={() => {
              setReceiveFilter("1");
              setFiltersApplied(true);
              setTimeout(() => {
                fetchSalesData();
              }, 0);
            }}
          >
            Cal. Received
          </button>

          <button
            className="bg-brand text-white px-2 py-1.5 rounded text-sm flex items-center justify-center"
            onClick={() => {
              setReceiveFilter("0");
              setFiltersApplied(true);
              setTimeout(() => {
                fetchSalesData();
              }, 0);
            }}
          >
            Cal. Not Received
          </button>

          <button
            className="bg-brand text-white px-2 py-1.5 rounded text-sm flex items-center justify-center"
            onClick={() => navigate("/commission")}
          >
            Cal. Commission
          </button>

          <button
            className="bg-brand text-white px-2 py-1.5 rounded text-sm flex items-center justify-center"
            onClick={() => navigate("/commissionby3A")}
          >
            Cal. 3A Commission
          </button>

          <button
            className="bg-brand text-white px-2 py-1.5 rounded text-sm flex items-center justify-center"
            onClick={() => {
              if (salesFilter) {
                navigate(`/salesOrderHistory/${salesFilter}`);
              } else {
                alert("Please select a Salesman first.");
              }
            }}
          >
            Print History
          </button>
        </div>
      </div>

      <div className="relative w-full mt-8">
        <ComponentCard title="Sales Order Stats">
          <div style={{ overflowX: "auto" }}>
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <td
                    colSpan={16}
                    className="text-center pb-2 text-xl text-gray-700"
                  >
                    {receiveFilter === "1"
                      ? "AR Received"
                      : receiveFilter === "0"
                        ? "AR Not Received"
                        : "All Sales Orders"}
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
                    SO Number
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Title
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Customer Id
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Invoice Number
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Invoice Date
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Due Date
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Received Date
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Time Span
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
                    Freight Free
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Tax
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Discount
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Install Fee
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Other Fee
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Total Due
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {!filtersApplied ? (
                  <TableRow>
                    <td colSpan={16} className="text-center py-4">
                      Please apply filters to view sales data
                    </td>
                  </TableRow>
                ) : salesData?.length > 0 ? (
                  salesData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="px-5 py-3">{index + 1}</TableCell>
                      <TableCell className="px-5 py-3">{row.so}</TableCell>
                      <TableCell className="px-5 py-3">{row.title}</TableCell>
                      <TableCell className="px-5 py-3">
                        {row.bill_to_data.customer_id}
                      </TableCell>
                      <TableCell className="px-5 py-3">
                        {row.invoice_info.number || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-3">
                        {moment(row.invoice_info.date).format("DD/MM/YYYY")}
                      </TableCell>
                      <TableCell className="px-5 py-3">
                        {row.due_date}
                      </TableCell>

                      <TableCell className="px-5 py-3">
                        {row.receive_date}
                      </TableCell>
                      <TableCell className="px-5 py-3">
                        {row.last_taken_time}
                      </TableCell>
                      <TableCell className="px-5 py-3">
                        {row.total_sales}
                      </TableCell>
                      <TableCell className="px-5 py-3">
                        {row.freight_fee || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-3">
                        {row.tax || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-3">
                        {row.discount_level || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-3">
                        {row.installFee || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-3">
                        {row.otherFee || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-3">
                        {row.totalDue || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <td colSpan={16} className="text-center py-4">
                      No data found for the selected filters
                    </td>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
};
