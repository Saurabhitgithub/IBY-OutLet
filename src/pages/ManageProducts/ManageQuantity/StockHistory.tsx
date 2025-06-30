import { useEffect, useState } from "react";
import ComponentCard from "../../../components/common/ComponentCard";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { getAllPdHistory } from "../../../services/apis";
import { useLocation, useParams } from "react-router";
import Button from "../../../components/ui/button/Button";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import moment from "moment";
interface LocationState {
  productDetails: {
    id: string;
    model: string;
    parts_no: string;
    [key: string]: any;
  };
}

const backInfo = { title: "Manage Quantity", path: "/manageQuantity" };

export const StockHistory = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState<boolean>(false);
  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const productDetails = state?.productDetails;
  console.log("🚀 Product Details from location.state:", productDetails);

  const [stockData, setStockData] = useState<any[]>([]); // All data from API
  const [filteredData, setFilteredData] = useState<any[]>([]); // Data to display based on filters

  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  useEffect(() => {
    const fetchPdHistory = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const response = await getAllPdHistory(id);
        const data = response.data.data;
        setStockData(data);
        setFilteredData(data); // initially show all data
      } catch (error) {
        console.error("Error fetching Pd History:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPdHistory();
  }, [id]);

  // Filter function to filter stockData by date range
  const handleFilter = () => {
    if (!fromDate && !toDate) {
      setFilteredData(stockData);
      return;
    }

    const from = fromDate ? moment(fromDate, "YYYY-MM-DD") : null;
    const to = toDate ? moment(toDate, "YYYY-MM-DD").endOf("day") : null;

    const filtered = stockData.filter((item) => {
      const itemDate = moment(item.created_at);

      if (from && to) {
        return itemDate.isSameOrAfter(from) && itemDate.isSameOrBefore(to);
      } else if (from) {
        return itemDate.isSameOrAfter(from);
      } else if (to) {
        return itemDate.isSameOrBefore(to);
      }

      return true;
    });

    setFilteredData(filtered);
  };

  // Reset filters and show all data
  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setFilteredData(stockData);
  };

  return (
    <div className="text-gray-800 dark:text-white/90">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <PageBreadcrumb
        pageTitle={"List Of Stock Physical Check History"}
        backInfo={backInfo}
      />

      <div className="grid grid-cols-1 gap-x-4 gap-y-6 py-5">
        <div className="flex justify-between  gap-4">
          <div className="w-full ">
            <label htmlFor="fromDate" className="font-medium mb-2">
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
              placeholder="Enter From Date"
            />
          </div>

          <div className="w-full">
            <label htmlFor="toDate" className="font-medium mb-2">
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
              placeholder="Enter To Date"
            />
          </div>

          <div className="mt-auto w-full">
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
              className="ml-4 bg-brand"
              onClick={handleFilter}
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      

      <ComponentCard title={productDetails?.model || "Stock History"}>
        <Table className="text-gray-500">
          <TableHeader>
            <TableRow>
              <TableCell isHeader>Qty in Stock</TableCell>
              <TableCell isHeader>Physical Qty</TableCell>
              <TableCell isHeader>Check Person</TableCell>
              <TableCell isHeader>Date</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.stock_qty}</TableCell>
                  <TableCell>{item.phy_qty}</TableCell>
                  <TableCell>{item.user_id}</TableCell>
                  <TableCell>{moment(item.created_at).format("DD/MM/YYYY")}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell>No data found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ComponentCard>
      <span>
        Showing {filteredData.length > 0 ? 1 : 0} to {filteredData.length} of{" "}
        {stockData.length} entries
      </span>
    </div>
  );
};
