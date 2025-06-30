import Button from "../../../components/ui/button/Button";
import ComponentCard from "../../../components/common/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

import { Grid, Pagination, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { getAccountCount, getAccountPayableDataById, getAllCompanies, getAllVerifyAccount } from "../../../services/apis";
import moment from "moment";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { Box, Modal } from "@mui/material";
import { toast } from "react-toastify";
export const VerifyAccountPayable = () => {
  const [productData, setProductData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [totalCount, setTotalCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState<string | null>(null);
  const [nameFilter, setNameFilter] = useState("");
  useEffect(() => {
    handleSearch(); // Run initial load on mount
  }, [page, limit]);

  const handleReset = async () => {
    setSearchTerm("");
    setFromDate("");
    setToDate("");
    setPage(1);
    setLimit(10);

    // Use a short delay to ensure state updates before fetching
    setTimeout(() => {
      handleSearchWithFilter({});
    }, 0);
  };

  const handleSearchWithFilter = async (filter: any = {}) => {
    setLoading(true);
    try {
      const response = await getAllVerifyAccount(page, limit, filter);

      const productsArray = response.data.data.data;
      const totalItems = response.data.data.total;
      const totalPages = response.data.data.totalPages;

      setProductData(productsArray);
      setTotalCount(totalItems);
      setTotalPages(totalPages);
    } catch (error) {
      console.error("Error fetching data:", error);
      setProductData([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = () => {
    const filter: any = {};
    if (fromDate) filter.from_date = fromDate;
    if (toDate) filter.to_date = toDate;
    handleSearchWithFilter(filter);
  };

  useEffect(() => {
    const fetchProductCount = async () => {
      try {
        const response = await getAccountCount();
        setTotalCount(response.data.count);
        console.log(response); // assuming response has { count: number }
      } catch (error) {
        console.error("Error fetching product count:", error);
      }
    };

    fetchProductCount();
  }, []);

  const [users, setUsers] = useState<UserType[]>([]);

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(nameFilter.toLowerCase())
  );


  // for Applying modal
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
  return (
    <div className="py-3">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white/90">
        Verify Account Payable
      </h2>

      <Grid
        container
        spacing={3}
        className=" mb-5  text-gray-800 dark:text-white/90 "
      >
        {/* <Grid size={{ lg: 4, md: 6, sm: 6 }}>
          <input
            type="text"
            placeholder="Search... "
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 w-full rounded-lg border mt-5 bg-white border-gray-200 dark:border-gray-800 dark:bg-white/[0.03] text-gray-800 dark:text-white/90 px-4 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
          />
        </Grid> */}
        <Grid size={{ lg: 4, md: 6, sm: 6 }}>
          <label htmlFor="fromDate ">From Date:</label>
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
            placeholder="Select From Date"
          />
        </Grid>

        <Grid size={{ lg: 4, md: 6, sm: 6 }}>
          <label htmlFor="toDate">To Date:</label>
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
            placeholder="Select To Date"
          />
        </Grid>
        <Grid size={{ lg: 4, md: 6, sm: 6 }}>
          <div className="flex items-end h-full">
            <div className="mt-auto">
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
        </Grid>
      </Grid>

      <div className="relative w-full">
        <ComponentCard title="Verify Account List">
          <div className="overflow-x-auto lg:overflow-visible">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader>PO Number</TableCell>
                  <TableCell isHeader>SO Number</TableCell>
                  <TableCell isHeader>Vendor Invoice</TableCell>
                  <TableCell isHeader>Bill From</TableCell>
                  <TableCell isHeader>Input Person</TableCell>
                  <TableCell isHeader>Stats</TableCell>
                  <TableCell isHeader>Verified By</TableCell>
                  <TableCell isHeader>Verify Date</TableCell>
                  <TableCell isHeader>Approve</TableCell>
                  <TableCell isHeader>Approve Date</TableCell>
                  <TableCell isHeader>Invoice value</TableCell>
                  <TableCell isHeader>Invoice Date</TableCell>
                  <TableCell isHeader>Due Date</TableCell>
                  <TableCell isHeader>Created At</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {productData.length > 0 ? (
                  productData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-blue-500 ">
                        {item.po}
                      </TableCell>
                      <TableCell>{item.so}</TableCell>
                      <TableCell>{item.vendor_invoice}</TableCell>
                      <TableCell>{item.company_info?.name}</TableCell>

                      <TableCell>{item.user_info?.name}</TableCell>
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
                      <TableCell>
                        {item.verify_date
                          ? moment(item.verify_date).format("DD-MM-YYYY")
                          : "NA"}
                      </TableCell>
                      <TableCell>
                        {item.approve ? item.approve : "NA"}
                      </TableCell>
                      <TableCell>
                        {moment(item.approve_date).format("DD-MM-YYYY")}
                      </TableCell>
                      <TableCell>{item.invoice_value}</TableCell>
                      <TableCell>
                        {moment(item.invoice_date).format("DD-MM-YYYY")}
                      </TableCell>
                      <TableCell className="text-red-500">
                        {moment(item.due_date).format("DD-MM-YYYY")}
                      </TableCell>

                      <TableCell>
                        {moment(item.created_at).format("DD-MM-YYYY")}
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
              onChange={(event, value) => setPage(value)}
              color="primary"
            />
          </Stack>
        </div>
      </div>
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
