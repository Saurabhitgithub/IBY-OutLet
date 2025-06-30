import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
// import * as htmlToImage from "html-to-image";
// import {
//   Document,
//   Paragraph,
//   TextRun,
//   Table as DocxTable,
//   TableRow as DocxTableRow,
//   TableCell as DocxTableCell,
//   WidthType,
//   AlignmentType,
//   Packer,
// } from "docx";
import moment from "moment";
import html2canvas from "html2canvas";
import { PlusIcon } from "lucide-react";
// import Badge from "../../components/ui/badge/Badge";
import ComponentCard from "../../components/common/ComponentCard";
// import Button from "../../components/ui/button/Button";
import { Calendar as CalendarIcon } from "lucide-react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Box, Modal } from "@mui/material";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import {
  addOrderFile,
  awsUploadFile,
  deleteInvoiceById,
  deleteSalesById,
  getAllCompanies,
  getAllContactsBillTo,
  getAllPackageByinvoiceId,
  getAllSales,
  getAllUsers,
  getOrderDataBySalesId,
  getPermissionByRole,
} from "../../services/apis";
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
export const Sales: React.FC = () => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [companyList, setCompanyList] = useState<any[]>([]);
  const [userList, setUserList] = useState<any[]>([]);
  const [contactList, setContactList] = useState<any[]>([]);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [salesManFilter, setSalesManFilter] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteModalOpen1, setIsDeleteModalOpen1] = useState(false);
  const [inputByFilter, setInputByFilter] = useState("");
  const [billToFilter, setBillToFilter] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [orderItemData, setOrderItemData] = useState<any[]>([]);
  const [titleFilter, setTitleFilter] = useState("");
  const [sortOption, setSortOption] = useState<"latest" | "oldest">("latest");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalSalesCount, setTotalSalesCount] = useState(0);
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
  const [permissions, setPermissions] = useState({
    canViewSales: false,
    canCreateSales: false,
    canEditSales: false,
    canDeleteSales: false,
  });
  const navigate = useNavigate();
  const inputRef = useRef(null);
  // const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const salesPeople = Array.from(
    new Set(salesData?.map((order) => order.salesMan))
  );
  // console.log(salesData, "salesDataaa");
  const inputPeople = Array.from(
    new Set(salesData?.map((order) => order.inputPerson))
  );
  const billToOptions = Array.from(
    new Set(salesData?.map((order) => order.billTo))
  );
  const titleOptions = [
    "All Titles",
    "Standard Order",
    "Priority Order",
    "Custom Order",
  ];
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [deleteId1, setDeleteId1] = useState<string | number | null>(null);
  const [timeSort, setTimeSort] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const openUploadModal = (orderId: string) => {
    if (!permissions.canEditSales) {
      toast.error("You don't have permission to upload files", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
      return;
    }
    setCurrentOrderId(orderId);
    setSelectedFile(null);
    setUploadError("");
    setIsUploadModalOpen(true);
  };

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
      const [
        canView,
        canCreate,
        canEdit,
        canDelete,
      ] = await Promise.all([
        checkPermission('Sales Order', 'View'),
        checkPermission('Sales Order', 'Create'),
        checkPermission('Sales Order', 'Update'),
        checkPermission('Sales Order', 'Delete'),
      ]);

      setPermissions({
        canViewSales: canView,
        canCreateSales: canCreate,
        canEditSales: canEdit,
        canDeleteSales: canDelete,
      });
      if (canView) {
        fetchSearchData();
        fetchSalesData();
      } else {
        toast.error("You don't have permission to view sales orders", {
          toastId: "no-permission-view-sales",
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
        navigate('/');
      }
    };

    initializeComponent();
  }, []);


  useEffect(() => {
    // fetchSalesCount();
    fetchSalesData();
  }, [currentPage, appliedFilters]);

  // const   fetchSalesCount = async () => {
  //   try {
  //     const res = await getSalesCount();
  //     setTotalSalesCount(res.data.count || 0);
  //   } catch (error) {
  //     console.error("Error fetching sales count:", error);
  //   }
  // };

  const fetchPackageData = async (invoiceId: number) => {
    try {
      const res = await getAllPackageByinvoiceId(invoiceId);
      return res.data.data || [];
    } catch (error) {
      console.error("Error fetching package data:", error);
      return [];
    }
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };
  const fetchSalesData = async (filtering: any) => {
    setLoading(true);

    try {
      const filters: any = {};
      if (filtering) {
        if (fromDate) {
          filters.date_from = fromDate;
        }
        if (toDate) {
          filters.date_to = toDate;
        }
        if (titleFilter) {
          filters.company_id = titleFilter;
        }
        if (billToFilter) {
          filters.bill_to_id = billToFilter;
        }
        if (salesManFilter) {
          filters.salesman_id = salesManFilter;
        }
        if (includeDeleted) {
          filters.include_deleted = true;
        }
        if (searchTerm) {
          filters.so = searchTerm.trim();
        }
        // if (location) {
        //   filters.inventory_location = location;
        // }
        if (sortOption) {
          filters.sort_by = sortOption; // "latest" or "oldest"
        }
      }

      const payload = {
        page: currentPage,
        limit: itemsPerPage,
        filter: filters,
      };

      const res = await getAllSales(payload);
      const salesArray = res.data.data.data;
      const totalSales = res.data.data.total;
      const totalPages = res.data.data.totalPages;
      setOrderId(salesArray[0]?.id);
      console.log(salesArray[0]?.id, "order idddddddddddddddddd");
      setSalesData(salesArray);
      console.log(salesData[0]?.customer_po, "sssssss")
      setTotalSalesCount(totalSales);
      setTotalPages(totalPages);
    } catch (error) {
      console.error("Error fetching sales data:", error);
      setSalesData([]);
      setTotalSalesCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // const fetchSalesData = async () => {
  //   setLoading(true);

  //   try {
  //     const filters: any = {};

  //     if (location) {
  //       filters.inventory_location = location;
  //     }
  //     if (searchTerm) {
  //       filters.search = searchTerm;
  //     }

  //     if (timeSort?.value === "Sort by latest") {
  //       filters.sort = "latest";
  //     } else if (timeSort?.value === "Sort by oldest") {
  //       filters.sort = "oldest";
  //     }

  //     const payload = {
  //       page: currentPage,
  //       limit: itemsPerPage,
  //       ...filters,
  //     };

  //     const res = await getAllSales(payload);
  //     const salesArray = res.data.data.data;
  //     const totalSales = res.data.data.total;
  //     const totalPages = res.data.data.totalPages;

  //     setSalesData(salesArray);
  //     setTotalSalesCount(totalSales);
  //     setTotalPages(totalPages);

  //   } catch (error) {
  //     console.error("Error fetching sales data:", error);
  //     setSalesData([]);
  //     setTotalSalesCount(0);
  //     setTotalPages(1);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchSearchData = async () => {
    setLoading(true);
    try {
      let [companyData, userData, contactData] = await Promise.all([
        getAllCompanies(),
        getAllUsers(),
        getAllContactsBillTo(),
      ]);
      setCompanyList(companyData.data.data);
      setUserList(userData.data.data);
      setContactList(contactData.data.data);
    } catch (error) {
      console.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSearchData();
  }, []);
  useEffect(() => {
    if (orderId) {
      fetchOrderItemBySalesId();
    }
  }, [orderId]);

  const fetchOrderItemBySalesId = async () => {
    try {
      const orderResponse = await getOrderDataBySalesId(orderId)
      setOrderItemData(orderResponse.data.data[0] || []);
      console.log(orderItemData, "ooooooooo")
    }
    catch (error) {
      console.error("Error fetching order items:", error);
      // alert("Failed to fetch order items.");
    }
  }

  function formatContactBlock(data: any) {
    if (!data) return "";
    return [
      data.user_name ? `Attn: ${data.user_name}` : "",
      data.company_name,
      data.address1,
      data.address2,
      [data.city, data.state_name, data.zip].filter(Boolean).join(", "),
      data.country_name || "",
      data.phone ? `Ph: ${data.phone}` : "",
      data.fax ? `Fax: ${data.fax}` : "",
      data.email ? `Email: ${data.email}` : "",
    ]
      .filter(Boolean)
      .join("<br>");
  }

  // You would call this function in a useEffect with dependencies:
  // useEffect(() => {
  //   fetchSalesData();
  // }, [currentPage, itemsPerPage, location, searchTerm, timeSort]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setUploadError("Only PDF files are allowed.");
      } else if (file.size > 2 * 1024 * 1024) {
        setUploadError("File size must be 2MB or less.");
      } else {
        setUploadError("");
        setSelectedFile(file);
      }
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || !currentOrderId) {
      setUploadError("Please select a valid PDF file.");
      return;
    }

    try {
      // 1. Upload to AWS
      const fileInfo = new FormData();
      fileInfo.append("upload", selectedFile);
      const uploadResponse = await awsUploadFile(fileInfo);
      const uploadedFile = uploadResponse.data.data[0];

      // 2. Save file reference to order
      await addOrderFile(currentOrderId, {
        order_file: {
          fileUrl: uploadedFile.fileUrl,
          fileName: uploadedFile.fileName,
        },
      });

      // Close modal and refresh data
      setIsUploadModalOpen(false);
      fetchSalesData();
    } catch (error) {
      console.error("File upload error:", error);
      setUploadError(error.response?.data?.message || "Failed to upload file");
    }
  };
  const handleDeleteFile = async (orderId: string) => {
    if (!permissions.canEditSales) {
      toast.error("You don't have permission to delete files", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
      return;
    }

    try {
      await addOrderFile(orderId, {
        order_file: {
          fileUrl: "",
          fileName: "",
        },
      });
      fetchSalesData();
      toast.success("File deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file.", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    }
  };
  const applyFilters = () => {
    setAppliedFilters({
      searchTerm,
      salesManFilter,
      inputByFilter,
      billToFilter,
      titleFilter,
      sortOption,
      includeDeleted,
      fromDate,
      toDate,
    });
    setCurrentPage(1);
  };

  // const resetFilters = () => {
  //   setSearchTerm("");
  //   setSalesManFilter("");
  //   setInputByFilter("");
  //   setBillToFilter("");
  //   setTitleFilter("");
  //   setFromDate("");
  //   setToDate("");
  //   setIncludeDeleted(false);
  //   setSortOption("latest");
  //   setAppliedFilters({
  //     searchTerm: "",
  //     salesManFilter: "",
  //     inputByFilter: "",
  //     billToFilter: "",
  //     titleFilter: "",
  //     sortOption: "latest",
  //     includeDeleted: false,
  //     fromDate: "",
  //     toDate: "",
  //   });
  // };
  const resetFilters = () => {
    setSearchTerm("");
    setFromDate("");
    setToDate("");
    setTitleFilter("");
    setBillToFilter("");
    setSalesManFilter("");
    setSortOption("latest"); // or your default sort
    setIncludeDeleted(false);
    setCurrentPage(1);

    // Optionally reset inventory location if used

    fetchSalesData(); // refetch with cleared filters
  };

  const filteredOrders = salesData
    .filter((order) => {
      const matchesSearch =
        appliedFilters.searchTerm === "" ||
        order.soNumber.includes(appliedFilters.searchTerm) ||
        order.customerPO.includes(appliedFilters.searchTerm) ||
        order.billTo
          .toLowerCase()
          .includes(appliedFilters.searchTerm.toLowerCase());

      const matchesSalesMan = appliedFilters.salesManFilter
        ? order.salesMan === appliedFilters.salesManFilter
        : true;
      const matchesInputBy = appliedFilters.inputByFilter
        ? order.inputPerson === appliedFilters.inputByFilter
        : true;
      const matchesBillTo = appliedFilters.billToFilter
        ? order.billTo === appliedFilters.billToFilter
        : true;
      const matchesTitle =
        appliedFilters.titleFilter &&
          appliedFilters.titleFilter !== "All Titles"
          ? true
          : true;

      const orderDate = new Date(order.createDate);
      const matchesFromDate = appliedFilters.fromDate
        ? orderDate >= new Date(appliedFilters.fromDate)
        : true;
      const matchesToDate = appliedFilters.toDate
        ? orderDate <= new Date(appliedFilters.toDate)
        : true;

      return (
        matchesSearch &&
        matchesSalesMan &&
        matchesInputBy &&
        matchesBillTo &&
        matchesTitle &&
        matchesFromDate &&
        matchesToDate
      );
    })
    .sort((a, b) => {
      if (appliedFilters.sortOption === "latest") {
        return (
          new Date(b.createDate).getTime() - new Date(a.createDate).getTime()
        );
      } else {
        return (
          new Date(a.createDate).getTime() - new Date(b.createDate).getTime()
        );
      }
    });
  //   const totalPages = Math.ceil(totalSalesCount / itemsPerPage);
  // const totalPages = Math.ceil(totalSalesCount / itemsPerPage);
  const getPaymentStatus = (invoice: any) => { // 385
    // If no invoice info exists
    if (!invoice) return "--";

    // If payment not made
    if (invoice?.if_paid === 1 || invoice?.invoice_info?.if_paid === 1) return "Paid";

    // If payment was made, determine method
    const paymentType = invoice.pay_type === "1" ? "Check" : "Other";
    return "Unpaid"; // Changed to just return "Paid" since we're not showing the method in the UI
  };
  const paginatedItems = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async () => {
    if (!permissions.canDeleteSales) {
      toast.error("You don't have permission to delete sales orders", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
      setIsDeleteModalOpen(false);
      return;
    }

    if (!deleteId) return;
    try {
      await deleteSalesById(deleteId);
      setIsDeleteModalOpen(false);
      setDeleteId(null);
      fetchSalesData();
      toast.success("Sales order deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } catch (error) {
      console.error("Failed to delete sales order:", error);
      toast.error("Failed to delete sales order.", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    }
  };

  const handleDelete1 = async () => {
    if (!permissions.canDeleteSales) {
      toast.error("You don't have permission to delete invoices", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
      setIsDeleteModalOpen1(false);
      return;
    }

    if (!deleteId1) return;
    try {
      await deleteInvoiceById(deleteId1);
      setIsDeleteModalOpen1(false);
      setDeleteId1(null);
      fetchSalesData();
      toast.success("Invoice deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } catch (error) {
      console.error("Failed to delete invoice:", error);
      toast.error("Failed to delete invoice.", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    }
  };

  const handleDownloadPackingPdf = async (invoiceId: number, orderData?: any) => {
    const formatDate = (dateString: string | null) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    };
    const packageList = await fetchPackageData(invoiceId);
    const allBoxes = packageList.flatMap((pkg: any) => pkg.boxes_data || []);
    const packingData = packageList[0] || {};

    const billToBlock =
      (orderData?.invoice_info?.billto_detail && orderData.invoice_info.billto_detail.trim())
        ? orderData.invoice_info.billto_detail.replace(/\n/g, "<br>")
        : formatContactBlock(orderData?.bill_to_data);

    const shipToBlock =
      (orderData?.invoice_info?.shipto_detail && orderData.invoice_info.shipto_detail.trim())
        ? orderData.invoice_info.shipto_detail.replace(/\n/g, "<br>")
        : formatContactBlock(orderData?.ship_to_data);

    const tempDiv = document.createElement("div");
    tempDiv.style.position = "fixed";
    tempDiv.style.top = "0";
    tempDiv.style.left = "-9999px";
    tempDiv.style.width = "210mm";
    tempDiv.style.padding = "20px";
    tempDiv.style.fontFamily = "Arial, sans-serif";
    tempDiv.style.fontSize = "14px";
    tempDiv.style.color = "#000";
    tempDiv.style.backgroundColor = "white";
    tempDiv.style.zIndex = "9999";

    tempDiv.innerHTML = `
    <div style="width: 100%;">
      <div style="text-align: center; margin-bottom: 20px;">
        <p style="margin: 0">2469 FM 359 Rd. S, Brookshire, TX 77423</p>
        <p style="margin: 0">www.ibyOUTLET.com</p>
        <p style="margin: 0">Phone:281-433-3389 Fax:713-583-8020</p>
        <h2 style="margin: 24px 0 16px 0; font-size: 2em;">Delivery Ticket</h2>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px;">
        <tr>
          <td style="border: 1px solid #ccc; padding: 8px; width: 50%; vertical-align: top;">
            <strong>Bill To</strong><br>
            ${billToBlock}
          </td>
          <td style="border: 1px solid #ccc; padding: 8px; width: 50%; vertical-align: top;">
            <strong>Ship To</strong><br>
            ${shipToBlock}
          </td>
        </tr>
        <tr>
          <td style="border: 1px solid #ccc; padding: 8px;">
            <strong>PO No.</strong> ${orderData.customer_po || ""}
          </td>
          <td style="border: 1px solid #ccc; padding: 8px;">
            <strong>SO No.</strong> ${orderData.so || ""}
          </td>
        </tr>
        <tr>
          <td style="border: 1px solid #ccc; padding: 8px;">
            <strong>Delivered by:</strong> ${orderData?.packages[0]?.delivery_by || ""}
          </td>
          <td style="border: 1px solid #ccc; padding: 8px;">
            <strong>Date Delivered:</strong> ${formatDate(orderData?.packages[0]?.delivery_date) || ""}
          </td>
        </tr>
        <tr>
          <td style="border: 1px solid #ccc; padding: 8px;">
            <strong>Via:</strong> ${orderData?.invoice_info?.ship_via || ""}
          </td>
          <td style="border: 1px solid #ccc; padding: 8px;">
            <strong>Freight Term:</strong> ${orderData?.packages[0].pay_type || ""}
          </td>
        </tr>
        <tr>
          <td style="border: 1px solid #ccc; padding: 8px;">
            <strong>Date Shipped:</strong> ${formatDate(orderData?.invoice_info?.ship_date) || ""}
          </td>
          <td style="border: 1px solid #ccc; padding: 8px;"></td>
        </tr>
      </table>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px;">
        <thead>
          <tr>
            <th style="border: 1px solid #ccc; padding: 6px; text-align: center;">No. Box(es)</th>
            <th style="border: 1px solid #ccc; padding: 6px; text-align: center;">Qty Per Box</th>
            <th style="border: 1px solid #ccc; padding: 6px; text-align: center;">Dimension (Per box/inches)</th>
            <th style="border: 1px solid #ccc; padding: 6px; text-align: center;">Gross Weight (Per box/Lbs)</th>
            <th style="border: 1px solid #ccc; padding: 6px; text-align: center;" colspan="2">Items</th>
          </tr>
          <tr>
            <th style="border: 1px solid #ccc;"></th>
            <th style="border: 1px solid #ccc;"></th>
            <th style="border: 1px solid #ccc;"></th>
            <th style="border: 1px solid #ccc;"></th>
            <th style="border: 1px solid #ccc; padding: 6px; text-align: center;">Model</th>
            <th style="border: 1px solid #ccc; padding: 6px; text-align: center;">P/N</th>
          </tr>
        </thead>
         <tbody>
      ${allBoxes.length > 0
        ? allBoxes
          .map(
            (box: any, idx: number) => `
              <tr>
                <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${box.box || idx + 1}</td>
                <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${box.qty || ""}</td>
                <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${box.dimension || ""}</td>
                <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${box.weight || ""}</td>
                <td style="border: 1px solid #ccc; padding: 6px;">${packingData.model || ""}</td>
                <td style="border: 1px solid #ccc; padding: 6px;">${packingData.pn || ""}</td>
              </tr>
              <tr>
                <td colspan="6" style="border: 1px solid #ccc; padding: 6px;">
                  <strong>Description:</strong> ${packingData.description || ""}
                </td>
              </tr>
            `
          )
          .join("")
        : `
              <tr>
                <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">1</td>
                <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${packingData.qty_per_box || ""}</td>
                <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${packingData.dimension || ""}</td>
                <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${packingData.gross_weight || ""}</td>
                <td style="border: 1px solid #ccc; padding: 6px;">${packingData.model || ""}</td>
                <td style="border: 1px solid #ccc; padding: 6px;">${packingData.pn || ""}</td>
              </tr>
              <tr>
                <td colspan="6" style="border: 1px solid #ccc; padding: 6px;">
                  <strong>Description:</strong> ${packingData.description || ""}
                </td>
              </tr>
            `
      }
    </tbody>
        <tfoot>
          <tr>
            <td colspan="6" style="border: 1px solid #ccc; padding: 6px; text-align: right;">
              Total Boxes: ${packingData.total_boxes || (packingData.items ? packingData.items.length : 1)}
              &nbsp; Total Gross Weights: ${packingData.total_weight || ""} Lbs
            </td>
          </tr>
        </tfoot>
      </table>
      
      <div style="margin-bottom: 18px;">
        <span style="color: red; font-weight: bold; font-size: 1.1em;">
          Total Overdue: USD$${packingData.total_overdue || "0.00"}, 
        </span>
        <span style="color: #0070c0; font-weight: bold; font-size: 1.1em;">
          Please Pay ASAP.
        </span>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 24px;">
        <tr>
          <td style="padding: 6px; width: 33%;">Received By(Print):</td>
          <td style="padding: 6px; width: 33%;">Signature:</td>
          <td style="padding: 6px; width: 33%;">Date:</td>
        </tr>
        <tr>
          <td style="padding: 6px;">DL#:</td>
          <td style="padding: 6px;">License Plate#:</td>
          <td style="padding: 6px;"></td>
        </tr>
      </table>
    </div>
  `;

    document.body.appendChild(tempDiv);

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#FFFFFF",
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`delivery_ticket_${packingData.number || "unknown"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please check console for details.");
    } finally {
      document.body.removeChild(tempDiv);
    }
  };
  const handleDownloadPackingWord = async (invoiceId: number, orderData?: any) => {
    const formatDate = (dateString: string | null) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    };

    const billToBlock =
      (orderData?.invoice_info?.billto_detail && orderData.invoice_info.billto_detail.trim())
        ? orderData.invoice_info.billto_detail.replace(/\n/g, "<br>")
        : formatContactBlock(orderData?.bill_to_data);

    const shipToBlock =
      (orderData?.invoice_info?.shipto_detail && orderData.invoice_info.shipto_detail.trim())
        ? orderData.invoice_info.shipto_detail.replace(/\n/g, "<br>")
        : formatContactBlock(orderData?.ship_to_data);
    const packageList = await fetchPackageData(invoiceId);
    const allBoxes = packageList.flatMap((pkg: any) => pkg.boxes_data || []);
    const packingData = packageList[0] || {};

    // Build the same HTML as your PDF for Word export
    const htmlContent = `
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; font-size: 14px; color: #000; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
        th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
        th { background-color: #F5F6FA; }
        .center { text-align: center; }
        .overdue { color: red; font-weight: bold; font-size: 1.1em; }
        .pay-asap { color: #0070c0; font-weight: bold; font-size: 1.1em; }
      </style>
    </head>
    <body>
      <div class="center" style="margin-bottom: 20px;">
        <p style="margin: 0">2469 FM 359 Rd. S, Brookshire, TX 77423</p>
        <p style="margin: 0">www.ibyOUTLET.com</p>
        <p style="margin: 0">Phone:281-433-3389 Fax:713-583-8020</p>
        <h2 style="margin: 24px 0 16px 0; font-size: 2em;">Delivery Ticket</h2>
      </div>
      <table>
        <tr>
          <th style="width:50%;">Bill To</th>
          <th style="width:50%;">Ship To</th>
        </tr>
        <tr>
        <td>${billToBlock}</td>
          <td>${shipToBlock}</td>
        </tr>
        <tr>
          <td><strong>PO No.</strong> ${orderData.customer_po || ""}</td>
          <td><strong>SO No.</strong> ${orderData.so || ""}</td>
        </tr>
        <tr>
          <td><strong>Delivered by:</strong> ${orderData?.packages[0]?.delivery_by || ""}</td>
          <td><strong>Date Delivered:</strong> ${formatDate(orderData?.packages[0]?.delivery_date) || ""}</td>
        </tr>
        <tr>
          <td><strong>Via:</strong> ${orderData?.invoice_info?.ship_via || ""}</td>
          <td><strong>Freight Term:</strong> ${orderData?.packages[0].pay_type || ""}</td>
        </tr>
        <tr>
          <td><strong>Date Shipped:</strong> ${formatDate(orderData?.invoice_info?.ship_date) || ""}</td>
          <td></td>
        </tr>
      </table>
      <table>
        <thead>
          <tr>
            <th>No. Box(es)</th>
            <th>Qty Per Box</th>
            <th>Dimension<br>(Per box/Inches)</th>
            <th>Gross Weight<br>(Per box/Lbs)</th>
            <th>Model</th>
            <th>P/N</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
  ${allBoxes.length > 0
        ? allBoxes
          .map(
            (box: any, idx: number) => `
          <tr>
            <td class="center">${box.box || idx + 1}</td>
            <td class="center">${box.qty || ""}</td>
            <td class="center">${box.dimension || ""}</td>
            <td class="center">${box.weight || ""}</td>
            <td>${packingData.model || ""}</td>
            <td>${packingData.pn || ""}</td>
            <td>${packingData.description || ""}</td>
          </tr>
        `
          )
          .join("")
        : `
          <tr>
            <td class="center">1</td>
            <td class="center">${packingData.qty_per_box || ""}</td>
            <td class="center">${packingData.dimension || ""}</td>
            <td class="center">${packingData.gross_weight || ""}</td>
            <td>${packingData.model || ""}</td>
            <td>${packingData.pn || ""}</td>
            <td>${packingData.description || ""}</td>
          </tr>
        `
      }
</tbody>
        <tfoot>
          <tr>
            <td colspan="7" style="text-align: right;">
              Total Boxes:${packingData.total_boxes || (packingData.items ? packingData.items.length : 1)}
              &nbsp; Total Gross Weights: ${packingData.total_weight || ""} Lbs
            </td>
          </tr>
        </tfoot>
      </table>
      <div style="margin-bottom: 18px;">
        <span class="overdue">
          Total Overdue: USD$${packingData.total_overdue || "0.00"},
        </span>
        <span class="pay-asap">
          Please Pay ASAP.
        </span>
      </div>
      <table style="margin-top: 24px;">
        <tr>
          <td>Received By(Print):</td>
          <td>Signature:</td>
          <td>Date:</td>
        </tr>
        <tr>
          <td>DL#:</td>
          <td>License Plate#:</td>
          <td></td>
        </tr>
      </table>
    </body>
    </html>
  `;

    // Create a Blob and trigger download as .doc
    const blob = new Blob(
      [
        '\ufeff', // BOM for Word compatibility
        htmlContent
      ],
      { type: "application/msword" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `packing_list_${packingData.number || "unknown"}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadWord = async (invoiceData: any, orderData: any) => {
    let orderItemData = null;
    try {
      const orderResponse = await getOrderDataBySalesId(orderData.id);
      orderItemData = orderResponse.data.data[0] || {};
    } catch (error) {
      console.error("Error fetching order items:", error);
      alert("Failed to fetch order items for Word export.");
      return;
    }

    const soNumber = orderData.so || "N/A";
    const customerPo = orderData.customer_po || "N/A";
    const shipFrom =
      orderData.ship_from_data?.country_name ||
      "N/A";

    const formatDate = (dateString: string | null) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    };

    const htmlContent = `
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; font-size: 14px; color: #000; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ccc; padding: 6px; text-align: center; }
        th { background-color: #F5F6FA; }
        .flex-row { display: flex; gap: 20px; margin-bottom: 20px; }
        .flex-1 { flex: 1; border: 1px solid #ccc; padding: 10px; }
        .totals-table { width: 300px; float: right; }
        .totals-table td { text-align: right; }
        .totals-table td:first-child { text-align: left; }
        .footer { margin-top: 20px; }
      </style>
    </head>
    <body>
      <div style="text-align: center; margin-bottom: 20px">
        <p style="margin: 0">2469 FM 359 Rd. S, Brookshire, TX 77423</p>
        <p style="margin: 0">Phone: 281-433-3389 Fax: 713-583-8020</p>
        <h3 style="margin: 10px 0; text-decoration: underline">Invoice</h3>
      </div>
      <table>
        <thead>
          <tr>
            ${[
        "Invoice Date",
        "Invoice Number",
        "Due Date",
        "SO Number",
        "Customer PO#",
        "Ship Date",
        "Ship From",
        "Ship Via",
      ]
        .map((header) => `<th>${header}</th>`)
        .join("")}
          </tr>
        </thead>
        <tbody>
          <tr>
            ${[
        formatDate(invoiceData.date),
        invoiceData.number || "N/A",
        formatDate(invoiceData.due_date),
        soNumber,
        customerPo,
        formatDate(invoiceData.ship_date),
        shipFrom,
        invoiceData.ship_via || "N/A",
      ]
        .map((item) => `<td>${item}</td>`)
        .join("")}
          </tr>
        </tbody>
      </table>
      <div class="flex-row">
        <div class="flex-1">
          <strong>Sold To</strong>
          ${invoiceData.billto_detail
        ? `<div style="white-space: pre-wrap">${invoiceData.billto_detail}</div>`
        : "<p>N/A</p>"
      }
        </div>
        <div class="flex-1">
          <strong>Ship To</strong>
          ${invoiceData.shipto_detail
        ? `<div style="white-space: pre-wrap">${invoiceData.shipto_detail}</div>`
        : "<p>N/A</p>"
      }
        </div>
      </div>
      <table>
        <thead>
          <tr>
            ${[
        "Item",
        "PN",
        "Description",
        "Order QTY",
        "Remain QTY",
        "Shipped QTY",
        "Unit Price",
        "Total Price",
      ]
        .map((col) => `<th>${col}</th>`)
        .join("")}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${orderItemData?.item || "N/A"}</td>
            <td>${orderItemData?.product_data?.parts_no || "N/A"}</td>
            <td>${orderItemData?.product_data?.description || "N/A"}</td>
            <td>${orderItemData?.order_qty || "N/A"}</td>
            <td>${orderItemData?.left_qty || "N/A"}</td>
            <td>${orderItemData?.unit_price || "0.00"}</td>
            <td>${orderItemData?.total_price || "0.00"}</td>
            <td>${orderItemData?.total_price || "0.00"}</td>
          </tr>
        </tbody>
      </table>
      <table class="totals-table">
        <tbody>
          <tr>
            <td>Sub Total</td>
            <td>${orderItemData.total_price || "0.00"}</td>
          </tr>
          <tr>
            <td>Freight Terms</td>
            <td>${orderItemData.prepaid_type || "N/A"}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">TOTAL DUE</td>
            <td style="font-weight: bold;">USD$${orderItemData.total_price || "0.00"}</td>
          </tr>
        </tbody>
      </table>
      <div class="footer">
        <p><strong>Terms:</strong> ${invoiceData.code_name || "Net 30 days"}</p>
        <p>Thanks for your business!</p>
        <p style="text-align: right;">Invoiced by: ${invoiceData.invoice_by || "N/A"}</p>
      </div>
    </body>
    </html>
  `;

    // Create a Blob and trigger download as .doc
    const blob = new Blob(
      [
        '\ufeff', // BOM for Word compatibility
        htmlContent
      ],
      { type: "application/msword" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice_${invoiceData.number || "unknown"}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async (invoiceData: any, orderData: any) => {
    let orderItemData = null;
    try {
      const orderResponse = await getOrderDataBySalesId(orderData.id);
      orderItemData = orderResponse.data.data[0] || {};
    } catch (error) {
      console.error("Error fetching order items:", error);
      alert("Failed to fetch order items for PDF.");
      return;
    }

    const soNumber = orderData.so || "N/A";
    const customerPo = orderData.customer_po || "N/A";
    const shipFrom =
      orderData.ship_from_data?.country_name ||
      "N/A";

    const formatDate = (dateString: string | null) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    };

    const tempDiv = document.createElement("div");
    tempDiv.style.position = "fixed";
    tempDiv.style.top = "0";
    tempDiv.style.left = "-9999px";
    tempDiv.style.width = "210mm";
    tempDiv.style.padding = "20px";
    tempDiv.style.fontFamily = "Arial, sans-serif";
    tempDiv.style.fontSize = "14px";
    tempDiv.style.color = "#000";
    tempDiv.style.backgroundColor = "white";
    tempDiv.style.zIndex = "9999";

    tempDiv.innerHTML = `
    <div style="border: 1px solid #ccc; padding: 20px; width: 100%">
      <div style="text-align: center; margin-bottom: 20px">
        <p style="margin: 0">2469 FM 359 Rd. S, Brookshire, TX 77423</p>
        <p style="margin: 0">Phone: 281-433-3389 Fax: 713-583-8020</p>
        <h3 style="margin: 10px 0; text-decoration: underline">Invoice</h3>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px">
        <thead style="background-color: #F5F6FA">
          <tr>
            ${[
        "Invoice Date",
        "Invoice Number",
        "Due Date",
        "SO Number",
        "Customer PO#",
        "Ship Date",
        "Ship From",
        "Ship Via",
      ]
        .map(
          (header) =>
            `<th style="border: 1px solid #ccc; padding: 6px; text-align: center">${header}</th>`
        )
        .join("")}
          </tr>
        </thead>
        <tbody>
          <tr>
            ${[
        formatDate(invoiceData.date),
        invoiceData.number || "N/A",
        formatDate(invoiceData.due_date),
        soNumber,
        customerPo,
        formatDate(invoiceData.ship_date),
        shipFrom,
        invoiceData.ship_via || "N/A",
      ]
        .map(
          (item) =>
            `<td style="border: 1px solid #ccc; padding: 6px; text-align: center">${item}</td>`
        )
        .join("")}
          </tr>
        </tbody>
      </table>
      <div style="display: flex; gap: 20px; margin-bottom: 20px">
        <div style="flex: 1; border: 1px solid #ccc; padding: 10px">
          <strong>Sold To</strong>
          ${invoiceData.billto_detail
        ? `<div style="white-space: pre-wrap">${invoiceData.billto_detail}</div>`
        : "<p>N/A</p>"
      }
        </div>
        <div style="flex: 1; border: 1px solid #ccc; padding: 10px">
          <strong>Ship To</strong>
          ${invoiceData.shipto_detail
        ? `<div style="white-space: pre-wrap">${invoiceData.shipto_detail}</div>`
        : "<p>N/A</p>"
      }
        </div>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px">
        <thead style="background-color: #F5F6FA">
          <tr>
            ${[
        "Item",
        "PN",
        "Description",
        "Order QTY",
        "Remain QTY",
        "Shipped QTY",
        "Unit Price",
        "Total Price",
      ]
        .map(
          (col) =>
            `<th style="border: 1px solid #ccc; padding: 6px; text-align: center">${col}</th>`
        )
        .join("")}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #ccc; padding: 6px; text-align: center">${orderItemData?.item || "N/A"}</td>
            <td style="border: 1px solid #ccc; padding: 6px; text-align: center">${orderItemData?.product_data?.parts_no || "N/A"}</td>
            <td style="border: 1px solid #ccc; padding: 6px; text-align: center">${orderItemData?.product_data?.description || "N/A"}</td>
            <td style="border: 1px solid #ccc; padding: 6px; text-align: center">${orderItemData?.order_qty || "N/A"}</td>
            <td style="border: 1px solid #ccc; padding: 6px; text-align: center">${orderItemData?.left_qty || "N/A"}</td>
            <td style="border: 1px solid #ccc; padding: 6px; text-align: center">${orderItemData?.unit_price || "0.00"}</td>
            <td style="border: 1px solid #ccc; padding: 6px; text-align: center">${orderItemData?.total_price || "0.00"}</td>
          </tr>
        </tbody>
      </table>
      <div style="display: flex; justify-content: flex-end; margin-bottom: 20px">
        <table style="width: 300px; border-collapse: collapse">
          <tbody>
            <tr>
              <td style="border: 1px solid #ccc; padding: 6px">Sub Total</td>
              <td style="border: 1px solid #ccc; padding: 6px; text-align: right">${orderItemData.total_price || "0.00"}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ccc; padding: 6px">Freight Terms</td>
              <td style="border: 1px solid #ccc; padding: 6px; text-align: right">${orderItemData.prepaid_type || "N/A"}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ccc; padding: 6px; font-weight: bold">TOTAL DUE</td>
              <td style="border: 1px solid #ccc; padding: 6px; font-weight: bold; text-align: right">USD$${orderItemData.total_price || "0.00"}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="margin-top: 20px">
        <p style="margin: 4px 0"><strong>Terms:</strong> ${invoiceData.code_name || "Net 30 days"}</p>
        <p style="margin: 4px 0"><strong>Payment Status:</strong> ${orderItemData.if_paid ? "Paid" : "Unpaid"}</p>
        <p style="margin: 4px 0"><strong>Payment Type:</strong> ${orderItemData.pay_type === "1" ? "Check" : "Other"}</p>
        <p style="margin: 4px 0">Thanks for your business!</p>
      </div>
    </div>
  `;

    document.body.appendChild(tempDiv);

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#FFFFFF",
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice_${invoiceData.number || "unknown"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please check console for details.");
    } finally {
      document.body.removeChild(tempDiv);
    }
  };

  const inVoiceRef1 = useRef(null);
  if (!permissions.canViewSales) {
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
      <div
        style={{
          height: "0px",
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
          color: "#000",
          overflow: "hidden",
        }}
      >
        <div ref={inVoiceRef1} id="print">
          <div>
            <p>2469 FM 359 Rd. S, Brookshire, TX 77423</p>
            <p>Phone: 281-433-3389 Fax: 713-583-8020</p>
            <h3>Invoice</h3>
          </div>
          <table>
            <thead>
              <tr>
                {[
                  "Invoice Date",
                  "Invoice Number",
                  "Due Date",
                  "SO Number",
                  "Customer PO#",
                  "Ship Date",
                  "Ship From",
                  "Ship Via",
                ].map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {[
                  "2025-02-11",
                  "24i4701-C",
                  "2025-03-13",
                  "24i4701",
                  "46-50415",
                  "2025-02-11",
                  "USA - Houston",
                  "PICK UP",
                ].map((item) => (
                  <td key={item}>{item}</td>
                ))}
              </tr>
            </tbody>
          </table>
          <div>
            {["Sold To", "Ship To"].map((label, index) => (
              <div key={label}>
                <strong>{label}</strong>
                <p>Attn: Okan Gurbuz</p>
                <p>Axon Energy Services</p>
                <p>12606 North Houston Rosslyn</p>
                <p>Houston, Texas, 770386</p>
                <p>United States</p>
                <p>Ph: 1-281-214-8558 Fax: 281-214-8559</p>
              </div>
            ))}
          </div>
          <table>
            <thead>
              <tr>
                {[
                  "Item",
                  "PN",
                  "Description",
                  "Order QTY",
                  "Remain QTY",
                  "Shipped QTY",
                  "Unit Price",
                  "Total Price",
                ].map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {[
                  "1",
                  "9320-1060-643-02",
                  "2inch 10M Studded Tee (with the bolt), CAR625",
                  "1",
                  "0",
                  "1",
                  "780.00",
                  "780.00",
                ].map((val, idx) => (
                  <td key={idx}>{val}</td>
                ))}
              </tr>
            </tbody>
          </table>
          <div>
            <table>
              <tbody>
                <tr>
                  <td>Sub Total</td>
                  <td>780.00</td>
                </tr>
                <tr>
                  <td>Freight Terms</td>
                  <td>pick up</td>
                </tr>
                <tr>
                  <td>TOTAL DUE</td>
                  <td>USD$780.00</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <p>
              <strong>Terms:</strong> Net 30 days
            </p>
            <p>Thanks for your business!</p>
          </div>
        </div>
      </div>

      <h1 className="text-xl font-bold mb-4">Sales Order Management</h1>

      {/* search SEction */}
      {/* First Filter Row */}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        {/* Search Input */}
        <div className="flex-1 min-w-[200px]">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* From Date Picker */}
        <div className="min-w-[180px] relative">
          <Flatpickr
            options={{ dateFormat: "Y-m-d", maxDate: toDate || undefined }}
            value={fromDate}
            onChange={(dates) => setFromDate(moment(dates[0]).format("YYYY-MM-DD"))}
            className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm shadow-md"
            placeholder="From Date"
          />
          <CalendarIcon className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>

        {/* To Date Picker */}
        <div className="min-w-[180px] relative">
          <Flatpickr
            options={{ dateFormat: "Y-m-d", minDate: fromDate || undefined }}
            value={toDate}
            onChange={(dates) => setToDate(moment(dates[0]).format("YYYY-MM-DD"))}
            className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm shadow-md"
            placeholder="To Date"
          />
          <CalendarIcon className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>

        {/* Title Filter */}
        <div className="min-w-[200px] flex-1">
          <select
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
          >
            <option value="" disabled>Select Title</option>
            {companyList.map((title) => (
              <option key={title.id} value={title.id}>{title.name}</option>
            ))}
          </select>
        </div>

        {/* Bill To Filter */}
        <div className="min-w-[200px] flex-1">
          <select
            value={billToFilter}
            onChange={(e) => setBillToFilter(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
          >
            <option value="" disabled>Bill To...</option>
            {contactList.map((billTo) => (
              <option key={billTo.id} value={billTo.id}>{billTo.company_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Second Filter Row */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Sales Man Filter */}
        <div className="min-w-[160px] flex-1">
          <select
            value={salesManFilter}
            onChange={(e) => setSalesManFilter(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
          >
            <option value="" disabled>Sales Man...</option>
            {userList.map((person) => (
              <option key={person.id} value={person.id}>{person.name}</option>
            ))}
          </select>
        </div>

        {/* Sort Option */}
        <div className="min-w-[160px] flex-1">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
          >
            <option value="latest">Sort By Latest</option>
            <option value="oldest">Sort By Oldest</option>
          </select>
        </div>

        {/* Include Deleted Checkbox */}
        <div className="flex items-center min-w-[180px]">
          <input
            type="checkbox"
            id="includeDeleted"
            checked={includeDeleted}
            onChange={(e) => setIncludeDeleted(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="includeDeleted" className="ml-2 text-sm">
            Include Deleted SO
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 ml-auto">
          <button
            onClick={resetFilters}
            className="h-11 px-4 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-brand"
          >
            Reset Filter
          </button>
          <button
            onClick={() => fetchSalesData(true)}
            className="h-11 px-4 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-brand"
          >
            Search
          </button>
        </div>
      </div>
      {/* END of search SEction */}




      {/* <input
                ref={inputRef}
                type="text"
                placeholder="Search SO Number, Customer PO, or Bill To"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full max-w-[400px] rounded-lg border border-gray-300 bg-white px-4 py-2 mb-4 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
            /> */}
      <div className="relative w-full">
        {permissions.canCreateSales && (
          <button
            className="absolute right-0 bg-brand text-white px-3 py-1 mt-3 me-3 rounded flex items-center gap-2"
            onClick={() => navigate("/addSales")}
          >
            <span className="text-md">
              <PlusIcon />
            </span>
          </button>
        )}
        <ComponentCard title="Sales Order Management">
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader className="">
                    SO Number
                  </TableCell>
                  <TableCell isHeader className="">
                    Customer PO
                  </TableCell>
                  <TableCell isHeader className="">
                    Bill To
                  </TableCell>
                  <TableCell isHeader className="">
                    Create Date
                  </TableCell>
                  <TableCell isHeader className="">
                    Sales Man
                  </TableCell>
                  <TableCell isHeader className="w-[250px]">
                    Input Person
                  </TableCell>

                  <TableCell isHeader className="">
                    Status
                  </TableCell>
                  <TableCell isHeader className="">
                    Order File
                  </TableCell>
                  <TableCell isHeader className="w-[90px]">
                    Invoice
                  </TableCell>
                  <TableCell isHeader className="w-[90px]">
                    Packing List
                  </TableCell>
                  <TableCell isHeader className="">
                    Due Date
                  </TableCell>
                  <TableCell isHeader className="">
                    If Paid
                  </TableCell>
                  <TableCell isHeader className="">
                    Double Check Person
                  </TableCell>
                  <TableCell isHeader className="">
                    Action
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesData?.length > 0 ? (
                  salesData.map((order, index) => {
                    const invoices = order.invoice_info || [];

                    return (
                      <React.Fragment key={order._id || index}>
                        {/* 🔹 Main Row: Order Info + First Invoice */}
                        <TableRow>
                          <TableCell>
                            <button
                              onClick={() => navigate(`/soNumber/${order._id}`)}
                              className="text-blue-600"
                            >
                              {order.so}
                            </button>
                          </TableCell>
                          <TableCell>{order.customer_po}</TableCell>
                          <TableCell>{order.bill_to_data?.company_name}</TableCell>
                          <TableCell>{moment(order.created_at).format("YYYY-MM-DD")}</TableCell>
                          <TableCell>{order.salesman_name}</TableCell>
                          <TableCell>{order.opento_names}</TableCell>
                          <TableCell>
                            {order?.status === 1 ? "Active" : "Applying"}
                          </TableCell>

                          {/* Order File */}
                          <TableCell>
                            {order.order_file && order.order_file_name ? (
                              <div className="flex gap-2">
                                <a
                                  href={order.order_file}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  View
                                </a>
                                <span>|</span>
                                {permissions.canEditSales && (
                                  <button
                                    onClick={() => handleDeleteFile(order.id)}
                                    className="text-red-600 hover:underline"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            ) : permissions.canEditSales ? (
                              <button
                                onClick={() => openUploadModal(order.id)}
                                className="text-blue-600 hover:underline"
                              >
                                Upload
                              </button>
                            ) : (
                              <span>--</span>
                            )}
                          </TableCell>

                          {/* Invoice Column */}
                          <TableCell>
                            {invoices.length > 0 ? (
                              <>
                                {permissions.canEditSales && (
                                  <button
                                    onClick={() =>
                                      navigate(`/editinvoice/${invoices[0]._id}/${order._id}`)
                                    }
                                    className="text-blue-600"
                                  >
                                    Edit
                                  </button>
                                )}
                                {permissions.canDeleteSales && (
                                  <>
                                    <span> | </span>
                                    <button
                                      onClick={() => {
                                        setDeleteId1(invoices[0].id ?? null);
                                        setIsDeleteModalOpen1(true);
                                      }}
                                      className="text-red-600"
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                                <div className="flex gap-2 mt-1">
                                  <a
                                    className="text-blue-600 cursor-pointer"
                                    onClick={() => handleDownloadPdf(invoices[0], order)}
                                  >
                                    PDF
                                  </a>
                                  <span>|</span>
                                  <a
                                    className="text-blue-600 cursor-pointer"
                                    onClick={() => handleDownloadWord(invoices[0], order)}
                                  >
                                    Word
                                  </a>
                                </div>
                              </>
                            ) : permissions.canCreateSales ? (
                              <button
                                onClick={() => navigate(`/invoice/${order._id}`)}
                                className="text-blue-600"
                              >
                                Add Invoice
                              </button>
                            ) : (
                              <span>--</span>
                            )}
                          </TableCell>

                          {/* Packing List */}
                          <TableCell>
                            {invoices.length > 0 && order.packages?.length > 0 ? (
                              <>
                                {permissions.canEditSales && (
                                  <button
                                    onClick={() =>
                                      navigate(`/editPacking/${order._id}/${invoices[0]._id}`)
                                    }
                                    className="text-blue-600"
                                  >
                                    Edit
                                  </button>
                                )}
                                <div className="flex gap-2">
                                  <a
                                    className="text-blue-600 cursor-pointer"
                                    onClick={() =>
                                      handleDownloadPackingPdf(invoices[0].id, order)
                                    }
                                  >
                                    PDF
                                  </a>
                                  <span>|</span>
                                  <a
                                    className="text-blue-600 cursor-pointer"
                                    onClick={() =>
                                      handleDownloadPackingWord(invoices[0].id, order)
                                    }
                                  >
                                    Word
                                  </a>
                                </div>
                              </>
                            ) : permissions.canCreateSales ? (
                              <button
                                onClick={() =>
                                  navigate(`/editPacking/${order._id}/${invoices[0]?._id}`)
                                }
                                className="text-blue-600"
                              >
                                Add Package
                              </button>
                            ) : (
                              "--"
                            )}
                          </TableCell>

                          {/* Due Date */}
                          <TableCell>
                            {invoices.length > 0
                              ? moment(invoices[0]?.due_date).format("YYYY-MM-DD")
                              : "--"}
                          </TableCell>

                          {/* If Paid */}
                          <TableCell className="">
                            <span
                              onClick={() => {
                                const status = getPaymentStatus(order);
                                if (status === "Paid") {
                                  navigate(`/paymentManagement/${order._id}/${order.invoice_info._id}/${order.id}`);
                                } else {
                                  navigate(`/salesPayment/${order?._id}/${order?.invoice_info?._id}/${order.id}`);
                                }
                              }}
                              className="text-blue-600 cursor-pointer hover:underline"
                              role="button"
                            >
                              {getPaymentStatus(order)}
                            </span>
                          </TableCell>

                          {/* Double Check */}
                          <TableCell>{invoices[0]?.double_check_person || "--"}</TableCell>

                          <TableCell className="">
                            <div className="flex flex-col gap-1">
                              {permissions.canCreateSales && (
                                <button
                                  onClick={() => navigate(`/invoice/${order._id}`)}
                                  className="text-blue-600 text-left"
                                >
                                  Add Invoice
                                </button>
                              )}
                              <div className="flex">
                                <a
                                  href={order?.action?.finish}
                                  className="text-green-600 cursor-pointer"
                                >
                                  Finish
                                </a>
                                {permissions.canDeleteSales && (
                                  <>
                                    <span> | </span>
                                    <div
                                      className="text-red-600 cursor-pointer"
                                      onClick={() => {
                                        setDeleteId(order.id ?? null);
                                        setIsDeleteModalOpen(true);
                                      }}
                                    >
                                      Delete
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </TableCell>

                        </TableRow>

                        {/* 🔻 Extra Invoices (if any) */}
                        {invoices.length > 1 &&
                          invoices.slice(1).map((invoice, i) => (
                            <TableRow key={`extra-invoice-${order._id}-${i}`}>
                              {[...Array(7)].map((_, idx) => (
                                <TableCell key={idx}></TableCell>
                              ))}
                              <TableCell></TableCell>

                              {/* Invoice */}
                              <TableCell>
                                {permissions.canEditSales && (
                                  <button
                                    onClick={() =>
                                      navigate(`/editinvoice/${invoice._id}/${order._id}`)
                                    }
                                    className="text-blue-600"
                                  >
                                    Edit
                                  </button>
                                )}
                                {permissions.canDeleteSales && (
                                  <>
                                    <span> | </span>
                                    <button
                                      onClick={() => {
                                        setDeleteId1(invoice.id ?? null);
                                        setIsDeleteModalOpen1(true);
                                      }}
                                      className="text-red-600"
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                                <div className="flex gap-2 mt-1">
                                  <a
                                    className="text-blue-600 cursor-pointer"
                                    onClick={() => handleDownloadPdf(invoice, order)}
                                  >
                                    PDF
                                  </a>
                                  <span>|</span>
                                  <a
                                    className="text-blue-600 cursor-pointer"
                                    onClick={() => handleDownloadWord(invoice, order)}
                                  >
                                    Word
                                  </a>
                                </div>
                              </TableCell>

                              {/* Packing List */}
                              {/* Packing List */}
                              <TableCell>
                                {invoices.length > 0 ? (
                                  order.packages && order.packages.length > 0 ? (
                                    <>
                                      {permissions.canEditSales && (
                                        <button
                                          onClick={() =>
                                            navigate(`/editPacking/${order._id}/${invoices[0]._id}`)
                                          }
                                          className="text-blue-600"
                                        >
                                          Edit
                                        </button>
                                      )}
                                      <div className="flex gap-2 mt-1">
                                        <a
                                          className="text-blue-600 cursor-pointer"
                                          onClick={() =>
                                            handleDownloadPackingPdf(invoices[0].id, order)
                                          }
                                        >
                                          PDF
                                        </a>
                                        <span>|</span>
                                        <a
                                          className="text-blue-600 cursor-pointer"
                                          onClick={() =>
                                            handleDownloadPackingWord(invoices[0].id, order)
                                          }
                                        >
                                          Word
                                        </a>
                                      </div>
                                    </>
                                  ) : permissions.canCreateSales ? (
                                    <button
                                      onClick={() =>
                                        navigate(`/editPacking/${order._id}/${invoices[0]._id}`)
                                      }
                                      className="text-blue-600"
                                    >
                                      Add Package
                                    </button>
                                  ) : (
                                    "--"
                                  )
                                ) : (
                                  "--"
                                )}
                              </TableCell>
                              {/* Due Date */}
                              <TableCell>
                                {moment(invoice?.due_date).format("YYYY-MM-DD")}
                              </TableCell>

                              {/* If Paid */}
                              <TableCell className="">
                                <span
                                  onClick={() => {
                                    const status = getPaymentStatus(order);
                                    if (status === "Paid") {
                                      navigate(`/paymentManagement/${order._id}/${order.invoice_info._id}/${order.id}`);
                                    } else {
                                      navigate(`/salesPayment/${order?._id}/${order?.invoice_info?._id}/${order.id}`);
                                    }
                                  }}
                                  className="text-blue-600 cursor-pointer hover:underline"
                                  role="button"
                                >
                                  {getPaymentStatus(order)}
                                </span>
                              </TableCell>

                              {/* Double Check Person */}
                              <TableCell>{invoice?.double_check_person || "--"}</TableCell>

                              {/* Action empty for extra rows */}
                              <TableCell></TableCell>
                            </TableRow>
                          ))}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center py-4">
                      No sales orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

            </Table>
          </div>
        </ComponentCard>

        <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
          {/* Pagination moved to the left */}
          <Stack spacing={2} className="w-full md:w-auto md:mr-auto">
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_event, value) => setCurrentPage(value)}
              color="primary"
            />
          </Stack>

          {/* Entry info moved to the right */}
          <span className="text-sm text-center md:text-right w-full md:w-auto">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalSalesCount)} of{" "}
            {totalSalesCount} entries
          </span>
        </div>

      </div>

      {/* file upload */}
      <Modal
        open={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      >
        <Box className="fixed inset-0 bg-opacity-50 flex justify-center items-start pt-24">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Upload PO File</h2>

            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="mb-2 block w-full text-sm text-gray-600
           file:mr-4 file:py-2 file:px-4
           file:rounded-md file:border-0
           file:text-sm file:font-semibold
           file:bg-gray-100 file:text-gray-700
           hover:file:bg-gray-200"
            />

            {uploadError && (
              <p className="text-red-600 text-sm mb-2">{uploadError}</p>
            )}

            <div className="flex justify-end mt-4">
              <button
                className="text-gray-600 hover:text-gray-900 mr-4"
                onClick={() => setIsUploadModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-brand text-white px-4 py-2 rounded-md "
                onClick={handleUploadSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </Box>
      </Modal>

      <Modal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete this list?</p>
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
      <Modal
        open={isDeleteModalOpen1}
        onClose={() => setIsDeleteModalOpen1(false)}
      >
        <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete this invoice?</p>
            <div className="flex justify-end mt-4">
              <button
                className="text-gray-600 hover:text-gray-900 mr-4"
                onClick={() => setIsDeleteModalOpen1(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                onClick={handleDelete1}
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
