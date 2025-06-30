import { useEffect, useState } from "react";
import ComponentCard from "../../../components/common/ComponentCard";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import Badge from "../../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Trash2Icon } from "lucide-react";
import {
  deleteProductOut,
  deleteStock,
  getAllProductOutsbyProductId,
} from "../../../services/apis";
import { useParams, useLocation } from "react-router";
import Button from "../../../components/ui/button/Button";
import { toast } from "react-toastify";
import moment from "moment";
import Flatpickr from "react-flatpickr";
import { Box, Modal } from "@mui/material";
import "flatpickr/dist/themes/material_blue.css";

interface LocationState {
  productDetails: {
    id: string;
    model: string;
    parts_no: string;
    [key: string]: any;
  };
}

interface StockItem {
  _id: string;
  id: string;
  pn: string;
  qty: number;
  askfrom: string;
  out_usage: string;
  userData?: {
    username: string;
  };
  created_at: string;
}

const backInfo = { title: "Manage Quantity", path: "/manageQuantity" };

export const ViewStockList = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const productDetails = state?.productDetails;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [filteredData, setFilteredData] = useState<StockItem[]>([]);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  useEffect(() => {
    fetchViewOutStock();
  }, [id]);
  const fetchViewOutStock = async () => {
    try {
      if (!id) return;
      setLoading(true);
      const response = await getAllProductOutsbyProductId(id);
      const data = response.data.data;
      setStockData(data);
      setFilteredData(data);
    } catch (error) {
      console.error("Error fetching product outs:", error);
      toast.error("Failed to load stock data", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    if (!fromDate && !toDate) {
      setFilteredData(stockData);
      return;
    }

    const filtered = stockData.filter((item) => {
      const itemDate = moment(item.created_at);
      let fromValid = true;
      let toValid = true;

      if (fromDate) {
        fromValid = itemDate.isSameOrAfter(moment(fromDate), "day");
      }

      if (toDate) {
        toValid = itemDate.isSameOrBefore(moment(toDate), "day");
      }

      return fromValid && toValid;
    });

    setFilteredData(filtered);
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setFilteredData(stockData);
  };

  const handleDelete = async () => {
    setLoading(true);

    if (!deleteId) {
      setLoading(false);
      return;
    }

    try {
      await deleteProductOut(deleteId);
      setIsDeleteModalOpen(false);
      setDeleteId(null);
      await fetchViewOutStock();

      toast.success("Stock deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } catch (error) {
      toast.error("Failed to delete stock.", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-gray-800 dark:text-white/90">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}

      <PageBreadcrumb pageTitle={"Out of Stock List"} backInfo={backInfo} />
      {productDetails && (
        <div className="mb-4 space-y-2">
          <div className="flex space-x-2">
            <h3>Current Model:</h3>
            <p className="font-light text-blue-500">{productDetails.model}</p>
          </div>
          <div className="flex space-x-2">
            <h3>P/N:</h3>
            <p className="font-light text-blue-500">
              {productDetails.parts_no}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-4 gap-y-6 py-5">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="w-full">
            <label htmlFor="fromDate" className="block font-medium mb-2">
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
              className="w-full shadow-md border p-2 rounded border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
              placeholder="Select from date"
            />
          </div>

          <div className="w-full">
            <label htmlFor="toDate" className="block font-medium mb-2">
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
              className="w-full shadow-md border p-2 rounded bg-white border-gray-200 dark:border-gray-800 dark:bg-white/[0.03]"
              placeholder="Select to date"
            />
          </div>

          <div className="flex items-end gap-2 w-full md:w-auto">
            <Button
              size="sm"
              variant="outline"
              className="w-full md:w-auto"
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button
              size="sm"
              variant="primary"
              className="w-full md:w-auto bg-brand"
              onClick={handleFilter}
            >
              Filter
            </Button>
          </div>
        </div>
      </div>

      <ComponentCard title="Out of Stock List">
       
        <Table className="text-gray-500">
          <TableHeader>
            <TableRow>
              <TableCell isHeader>P/N</TableCell>
              <TableCell isHeader>Out Qty</TableCell>
              <TableCell isHeader>Ask From</TableCell>
              <TableCell isHeader>Usage</TableCell>
              <TableCell isHeader>Person</TableCell>
              <TableCell isHeader>Date</TableCell>
              <TableCell isHeader>Action</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.pn}</TableCell>
                  <TableCell>{item.qty}</TableCell>
                  <TableCell>{item.askfrom}</TableCell>
                  <TableCell>{item.out_usage}</TableCell>
                  <TableCell>{item.userData?.username || "Unknown"}</TableCell>
                  <TableCell>
                    {moment(item.created_at).format("DD/MM/YYYY HH:mm")}
                  </TableCell>
                  <TableCell>
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        setDeleteId(item.id);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      
                      <Badge size="sm" color="warning">
                        <Trash2Icon size={14} />
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  {stockData.length === 0
                    ? "No stock data available"
                    : "No items match your filters"}
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ComponentCard>
       <div className="mb-4">
          Showing {filteredData.length} of {stockData.length} total entries
        </div>
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
    </div>
  );
};
