import { useNavigate } from "react-router-dom";
import { EditIcon, Trash2Icon } from "lucide-react";
import Button from "../../../components/ui/button/Button";
import ComponentCard from "../../../components/common/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import Badge from "../../../components/ui/badge/Badge";

import { Grid, Pagination, Stack } from "@mui/material";
import { useState, useEffect } from "react";
import { Box, Modal } from "@mui/material";
import {
  deleteAccountPayableData,
  getAccountPayableDataById,
  getAllAccountPayable,
  getAllCompanies,
} from "../../../services/apis";
import moment from "moment";
import { toast } from "react-toastify";
import { Calendar as CalendarIcon } from "lucide-react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";

export const AccountPayable = () => {
  const navigate = useNavigate();

  const [selectedIdToDelete, setSelectedIdToDelete] = useState<string | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [data, setData] = useState<AccountPayableItem[]>([]);

  //  const [error, setError] = useState(null);
  const [loading, setLoading] = useState<boolean>(false);

  const itemsPerPage = 10;

  const [deleteId, setDeleteId] = useState<string | number | null>(null);

  const [totalPages, setTotalPages] = useState(1);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState<string | null>(null);
  interface AccountPayableItem {
    user_id: number;
    company_id: number;
    company_code: string;
    po: string;
    vendor_id: number;
    vendor_invoice: string;
    invoice_value: number;
    include_tax: number;
    invoice_date: string; // e.g. "2025-06-05"
    due_date: string;
    check_number: string;
    pay_date: string;
    double_checker: number;
    purchaser: number;
    opento: string;
    status: number;
    if_paid: number;
    left_pay: number;
    freight_fee: number;
    pay_for: string;
    category_id: number;
    notes: string;
    verify_uid: number;
    app_uid: number;
    invoice_file: string;
    invoice_received: string;
    debtted: number;
    debtted_user: number;
    debtted_date: string;
    so: string;
    verify_date: string;
    if_app: number;
    app_date: string;
    app_notes: string;
    created_at: string;
    inputPerson: string;
    double_checker_info?: {
      name?: string;
    };
    user_info?: {
      name?: string;
    };

    limit: number;
    page: number;
    totalPages: number;
    totalItems: number;
  }

  const fetchAccountPayableData = async (
    page: number,
    limit: number,
    filter: any = {}
  ) => {
    try {
      setLoading(true);
      const response = await getAllAccountPayable(page, limit, filter);
      console.log("API Response:", response);
      // setData(response?.data?.data?.data || []);
      // setTotalPages(response?.data?.data?.data.totalPages);

      console.log("Fetched Data:", response?.data?.data);

      const fetchedData = response?.data?.data?.data || [];
      const totalItems = response?.data?.data?.total || 0;
      const totalPages = response?.data?.data?.totalPages || 1;

      setData(fetchedData);
      setTotalCount(totalItems);
      setTotalPages(totalPages);
    } catch (err) {
      console.error("Fetch Error:", err);
      // setError(err.message || "Failed to fetch data");
      setData([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch(); // Applies filters on pagination
  }, [page, limit]);

  const handleSearch = () => {
    const filter: any = {};
    if (fromDate) filter.from_date = fromDate;
    if (toDate) filter.to_date = toDate;
    if (searchTerm) filter.search = searchTerm; // Assuming API supports `search` key
    fetchAccountPayableData(page, limit, filter);
  };

  const filteredData = data?.filter(
    (item) =>
      item.po?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendor_invoice?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReset = () => {
    setSearchTerm("");
    setFromDate("");
    setToDate("");
    setPage(1);
    setLimit(10);

    // Refetch with no filters after resetting
    setTimeout(() => {
      fetchAccountPayableData(1, 10, {});
    }, 0);
  };
  const handleDelete = async () => {
    setLoading(true);

    if (!deleteId) {
      setLoading(false);
      return;
    }

    try {
      await deleteAccountPayableData(deleteId);
      setIsDeleteModalOpen(false);
      setDeleteId(null);
      await fetchAccountPayableData(page, limit);

      toast.success("PayableData deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } catch (error) {
      toast.error("Failed to delete PayableData.", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setLoading(false);
    }
  };
  const onClose = () => setIsModalOpen(null);
const [selectedId, setSelectedId] = useState<number | null>(null);
const [selectedPayableData, setSelectedPayableData] = useState<any>(null);
useEffect(() => {
  if (selectedId) {
    getAccountPayableDataById(selectedId)
      .then((response) => {
        const data = response.data.data;
        setSelectedPayableData(data); // set data for modal use
      })
      .catch((error) => {
        console.error("Error fetching account payable data:", error);
        toast.error("Failed to fetch account payable data");
      });
  }
}, [selectedId]);

const getAllTitlesCompany = async () => {
    setLoading(true);
    try {
      const response = await getAllCompanies(); // API call

      const options = response.data.data.map((company: any) => ({
        value: company.id,
        label: company.name,
        // code: company.code
      }));

      setCompanyOptions(options);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  }; 

   useEffect(() => {
      getAllTitlesCompany();
    }, []);
const [companyOptions, setCompanyOptions] = useState([]);
const getCompanyNameById = (id: number) => {
  const company = companyOptions.find((c: any) => c.value === id);
  return company?.label || "N/A";
};
  
const stripHtmlAndGarbage = (htmlString = "") => {
  return htmlString
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')      // remove <style> and contents
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')    // remove <script> and contents
    .replace(/<[^>]+>/g, '')                             // remove other HTML tags
    .replace(/https?:\/\/[^\s]+/g, '')                   // remove URLs
    .replace(/order\s+levitra\s+online/gi, '')           // remove known spam phrases
    .replace(/\s+/g, ' ')                                // normalize spaces
    .trim();                                             // remove leading/trailing spaces
};
  return (
    <div className="py-3">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white/90">
        Account Payable List
      </h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 max-w-md w-full">
          <label
            htmlFor="fromDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            From Date:
          </label>
          <Flatpickr
            options={{
              dateFormat: "Y-m-d",
              maxDate: toDate || undefined,
            }}
            value={fromDate}
            onChange={(dates) =>
              setFromDate(moment(dates[0]).format("YYYY-MM-DD"))
            }
            className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-md"
          />
        </div>
        <div className="flex-1  max-w-md w-full">
          <label
            htmlFor="toDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            To Date:
          </label>
          <Flatpickr
            options={{
              dateFormat: "Y-m-d",
              minDate: fromDate || undefined,
            }}
            value={toDate}
            onChange={(dates) =>
              setToDate(moment(dates[0]).format("YYYY-MM-DD"))
            }
            className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-md"
          />
        </div>
      </div>

      <div className=" flex justify-between mb-3">
        <div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate(`/accountPayable/newAccountPayable`)}
          >
            <span className="text-lg">+</span> New Account Payable
          </Button>
        </div>
        <div>
          <Button
            size="sm"
            variant="outline"
            className="ml-4"
            onClick={handleReset}
          >
            Reset Filter
          </Button>
          <Button
            size="sm"
            variant="primary"
            className="ml-4"
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>
      </div>

      <span className="text-sm text-gray-500">1 to 1 entries</span>

      <div className="relative w-full">
        <ComponentCard title=" Account Payable List">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader className="font-medium text-gray-500">
                    PO Number
                  </TableCell>
                  <TableCell isHeader className="font-medium text-gray-500">
                    SO Number
                  </TableCell>
                  <TableCell isHeader className="font-medium text-gray-500">
                    Vendor Invoice
                  </TableCell>
                  <TableCell isHeader className="font-medium text-gray-500">
                    Bill From
                  </TableCell>
                  <TableCell isHeader className="font-medium text-gray-500">
                    Double Check Person
                  </TableCell>
                  <TableCell isHeader className="font-medium text-gray-500">
                    Purchaser
                  </TableCell>
                  <TableCell isHeader className="font-medium text-gray-500">
                    Input Person
                  </TableCell>
                  <TableCell isHeader className="font-medium text-gray-500">
                    Stats
                  </TableCell>
                  <TableCell isHeader className="font-medium text-gray-500">
                    Verified By
                  </TableCell>
                  <TableCell isHeader className="font-medium text-gray-500">
                    Verify Date
                  </TableCell>
                  <TableCell isHeader className="font-medium text-gray-500">
                    Approve
                  </TableCell>
                  <TableCell isHeader className="font-medium text-gray-500">
                    Approve Date
                  </TableCell>
                  <TableCell isHeader className="font-medium text-gray-500">
                    Invoice Date
                  </TableCell>
                  <TableCell isHeader className="font-medium text-gray-500">
                    Invoice Received
                  </TableCell>
                  <TableCell isHeader className="font-medium text-gray-500">
                    Invoice value
                  </TableCell>
                  <TableCell isHeader className="font-medium text-gray-500">
                    Check # or wire Confirm#
                  </TableCell>
                  <TableCell isHeader className="font-medium text-gray-500">
                    Due Date
                  </TableCell>
                  <TableCell isHeader className="font-medium text-gray-500">
                    Processed
                  </TableCell>
                  <TableCell isHeader className="font-medium text-gray-500">
                    Debit
                  </TableCell>
                  <TableCell isHeader className="font-medium text-gray-500">
                    Notes
                  </TableCell>

                  <TableCell isHeader className="font-medium text-gray-500">
                    Created At
                  </TableCell>
                  <TableCell isHeader className="font-medium text-gray-500">
                    Action
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filteredData?.length > 0 ? (
                  (filteredData || data || [])
                    // .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                    .map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-blue-500">
                          {item.po}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 ">
                          {item.so}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 ">
                          {item.vendor_invoice}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 ">
                          {item.company_info.name}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 ">
                          {item.double_checker_info?.name || "N/A"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 ">
                          {item.user_info?.name}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 ">
                          {item.inputPerson || "N/A"}
                        </TableCell>
                        <TableCell className="text-blue-500 ">
                          <span
                            onClick={() =>{ 
                              
                               setSelectedId(item._id);
                              setIsModalOpen("modalSix")}}
                            className="cursor-pointer text-blue-600 hover:underline"
                          >
                            Applying
                          </span>
                        </TableCell>
                        <TableCell
                          className={`${
                            item.verifiedBy === "N/A"
                              ? "text-gray-600"
                              : "text-green-600"
                          }`}
                        >
                          {item.verify_info?.name || "NA"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 ">
                          {item.verify_date
                            ? moment(item.verify_date).format("YYYY-MM-DD")
                            : "---"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 ">
                          {item.if_app === 1 ? "Yes" : "---"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 ">
                          {item.app_date
                            ? moment(item.app_date).format("YYYY-MM-DD")
                            : "---"}
                        </TableCell>

                        <TableCell className="px-4 py-3 text-gray-600 ">
                          {moment(item.invoice_date).format("YYYY-MM-DD")}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 ">
                          {item.invoice_received
                            ? moment(item.invoice_received).format("YYYY-MM-DD")
                            : "---"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 ">
                          {item.invoice_value}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 ">
                          {item.check_number}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 ">
                          {moment(item.due_date).format("YYYY-MM-DD")}
                        </TableCell>
                        <TableCell>{/* {item.processed} */}</TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 ">
                          {item.debtted === 1 ? "Yes" : "No"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 ">
                      {stripHtmlAndGarbage(item.notes)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 ">
                          {moment(item.created_at).format("YYYY-MM-DD")}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 ">
                          <div className="flex gap-2">
                            <div
                              className="cursor-pointer"
                              onClick={() =>
                                navigate(
                                  `/accountPayable/editAccountPayable/${item._id}`
                                )
                              }
                            >
                              <Badge size="sm" color="success">
                                <EditIcon size={14} />
                              </Badge>
                            </div>
                            <div
                              className="cursor-pointer"
                              onClick={() => {
                                setDeleteId(item.id ?? null);
                                setIsDeleteModalOpen(true);
                              }}
                            >
                              <Badge size="sm" color="warning">
                                <Trash2Icon size={14} />
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell>No results found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </ComponentCard>
        <div className="flex flex-wrap justify-between items-center mt-4 ">
          <span className="text-sm text-gray-800 dark:text-white/90">
            Showing {Math.min((page - 1) * limit + 1, totalCount)} to{" "}
            {Math.min(page * limit, totalCount)} of {totalCount} entries
          </span>

          {/* Pagination */}
          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(event, value) => {
                setPage(value); // This will trigger useEffect
              }}
              color="primary"
            />
          </Stack>
        </div>
      </div>
      <Modal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete this item?</p>
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

  <Modal open={isModalOpen === "modalSix"} onClose={onClose}>
  <Box className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40 text-gray-500">
    <div className="bg-white w-[90%] max-w-3xl rounded-lg shadow-lg p-6 overflow-y-auto max-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold mb-4">
          New Account Payable - Verify payment
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>
      </div>

      {/* Info Table */}
      <table className="w-full border mb-4">
        <tbody>
          <tr>
            <td className="bg-yellow-100 border px-3 py-2 font-medium w-1/3">Who Pay</td>
        <td className="border px-3 py-2">
  {selectedPayableData ? getCompanyNameById(selectedPayableData.company_id) : "N/A"}
</td>
          </tr>
          <tr>
            <td className="bg-yellow-100 border px-3 py-2 font-medium">PO Number</td>
            <td className="border px-3 py-2">{selectedPayableData?.po || "N/A"}</td>
          </tr>
          <tr>
            <td className="bg-yellow-100 border px-3 py-2 font-medium">Vendor Invoice</td>
            <td className="border px-3 py-2">{selectedPayableData?.vendor_invoice || "N/A"}</td>
          </tr>
          <tr>
            <td className="bg-yellow-100 border px-3 py-2 font-medium">Pay To</td>
           {selectedPayableData ? getCompanyNameById(selectedPayableData.user_id) : "N/A"}
          </tr>
        </tbody>
      </table>

      {/* Verify Section */}
      <div className="mb-4">
        <label className="font-semibold">
          Verify <span className="text-red-500">*</span>
        </label>
        <div className="mt-2 space-x-6">
          <label className="inline-flex items-center">
            <input type="radio" name="verify" className="mr-2" /> Agree
          </label>
          <label className="inline-flex items-center">
            <input type="radio" name="verify" className="mr-2" /> Reject
          </label>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="font-semibold">
          Verify Notes <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          className="w-full border rounded p-2 mt-2"
          placeholder="Enter verification notes..."
        />
      </div>

      {/* Submit Button */}
      <div className="text-right">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={onClose}
        >
          Submit
        </button>
      </div>
    </div>
  </Box>
</Modal>

    </div>
  );
};
