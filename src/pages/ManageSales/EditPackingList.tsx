import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Box, Modal } from "@mui/material";
import {
  addPackage,
  deletePackage,
  getOrderDataBySalesId,
  getPackageById,
  getSalesById,
  getAllPackageByinvoiceId,
  getInvoiceById,
} from "../../services/apis";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
export const EditPacking: React.FC = () => {
  const [isAddPackageModalOpen, setIsAddPackageModalOpen] = useState(false);
  const [salesData, setSalesData] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [orderData, setOrderData] = useState<any>(null);
  const [saleId, setSaleId] = useState<string | null>(null);
  const { id, sid } = useParams<{ id: string; sid?: string }>();
  const { pid } = useParams();
  const [sqlInvoiceId, setSqlInvoiceId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [invoiceNumber, setInvoiceNumber] = useState<string>("N/A");
  const [deliveryDate, setDeliveryDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  });
  const [showOverdue, setShowOverdue] = useState(false);

  const [deliveredBy, setDeliveredBy] = useState<string>(""); // Empty by default
  const [formData, setFormData] = useState({
    boxes: "",
    qtyPerBox: "",
    dimension: "",
    grossWeight: "",
    deliveryBy: deliveredBy, // Connect to deliveredBy state
    receiveBy: deliveredBy, // This will be sent in payload
    deliveryDate: deliveryDate,
    receiveDate: "",
    shipDate: "",
    payType: "",
    waybill: "",
    selectedProducts: [] as any[],
  });

  const modalStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 1000,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (pid) {
  //     fetchAllPackages();
  //   }
  // }, [pid]);

  const fetchAllPackages = async (invId: any) => {
    try {
      setLoading(true);
      const response = await getAllPackageByinvoiceId(invId);
      const packagesData = response.data?.data || [];
      setPackages(packagesData);

      const packageIds = packagesData.map(pkg => pkg.id);

    } catch (error) {
      console.error("Error fetching packages:", error);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchInvoiceById = async (invoiceId: string) => {
    try {
      setLoading(true);
      const response = await getInvoiceById(invoiceId);
      const invoiceData = response.data.data.invoice;
      setSqlInvoiceId(invoiceData.id);
      fetchAllPackages(invoiceData.id)
      setInvoiceNumber(invoiceData.number || "N/A");
      return invoiceData;
    } catch (error) {
      console.error("Error fetching invoice data:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };
  const handleDeliveryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDeliveryDate(value);
    setFormData(prev => ({
      ...prev,
      deliveryDate: value,
    }));
  };
  const handleDateChange = (date: Date[] | string[], field: 'delivery_date' | 'arrive_date') => {
    const selectedDate = Array.isArray(date) && date.length > 0
      ? date[0] instanceof Date
        ? date[0].toLocaleDateString("en-CA") // Formats as YYYY-MM-DD
        : date[0]
      : "";

    setFormData((prev) => ({
      ...prev,
      [field]: selectedDate,
    }));

    // Also update the deliveryDate state if needed
    if (field === 'delivery_date') {
      setDeliveryDate(selectedDate);
    }
  };
  const handleDeliveredByChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDeliveredBy(value);
    setFormData(prev => ({
      ...prev,
      deliveryBy: value,
      receiveBy: value,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      if (pid) {
        try {
          const invoiceData = await fetchInvoiceById(pid);
          if (invoiceData) {
            setSqlInvoiceId(invoiceData.id);
          }
        } catch (error) {
          console.error("Error fetching invoice data:", error);
        }
      }
    };

    fetchData();
  }, [pid]);
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const salesRes = await getSalesById(id);
        setSalesData(salesRes.data?.data);
        setSaleId(salesRes.data?.data?.id);
        const orderRes = await getOrderDataBySalesId(salesRes.data?.data?.id);
        setOrderData(orderRes.data?.data);

        if (sid) {
          const packageRes = await getPackageById(sid);
          // setPackages([packageRes.data?.data]);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };

    fetchData();
  }, [id, sid]);
  const getGroupedPackages = () => {
    return packages.map((pkg, pkgIndex) => ({
      ...pkg,
      bgColor: pkgIndex % 2 === 0 ? 'bg-white' : 'bg-beige-50',
      boxes_data: pkg.boxes_data.map((box: any, boxIndex: number) => ({
        ...box,
        isFirstInPackage: boxIndex === 0,
        isLastInPackage: boxIndex === pkg.boxes_data.length - 1,
        packageIndex: pkgIndex,
      })),
    }));
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - (offset * 60 * 1000));
      return localDate.toISOString().split('T')[0];
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  };
  const handleDeletePackage = async (packageIds: any) => {
    try {
      // const packageToDelete = packages.find(pkg => pkg.id === packageIds);
      // if (!packageToDelete) {
      //   console.error("Package not found in current state");
      //   return;
      // }
      await deletePackage(packageIds);
      setPackages(prevPackages => prevPackages.filter(pkg => pkg._id !== packageIds));
      console.log(`Package ${packageIds} deleted successfully`);

    } catch (error) {
      console.error("Error deleting package:", error);
    }
  };
  const handleProductSelect = (product: any, isChecked: boolean) => {
    setFormData((prev) => {
      if (isChecked) {
        return {
          ...prev,
          selectedProducts: [...prev.selectedProducts, product],
        };
      } else {
        return {
          ...prev,
          selectedProducts: prev.selectedProducts.filter(
            (p) => p.id !== product.id
          ),
        };
      }
    });
  };

  const getSalesField = (field: string) => {
    if (!salesData) return "N/A";

    // Handle nested fields
    if (field.includes('.')) {
      const fields = field.split('.');
      let value = salesData;
      for (const f of fields) {
        value = value?.[f];
        if (value === undefined) break;
      }
      return value || "N/A";
    }

    return salesData[field] || "N/A";
  };

  const handleSubmit = async () => {
    try {
      // Create boxes_data array with each selected product having its own entry
      const boxes_data = formData.selectedProducts.map((product) => ({
        order_item_id: product.id,
        box: formData.boxes,
        dimension: formData.dimension,
        weight: formData.grossWeight,
        qty: formData.qtyPerBox,
      }));

      const payload = {
        sale_id: saleId,
        invoice_id: sqlInvoiceId,
        delivery_by: formData.deliveryBy || "N/A",
        delivery_date: formData.deliveryDate || new Date().toISOString().split('T')[0],
        waybill: formData.waybill,
        receive_by: formData.receiveBy || "N/A",
        receive_date: formData.receiveDate || new Date().toISOString().split('T')[0],
        ship_date: formData.shipDate || new Date().toISOString().split('T')[0],
        pay_type: formData.payType || "pick up",
        boxes: parseInt(formData.boxes, 10),
        total_weight: parseInt(formData.grossWeight, 10) * parseInt(formData.boxes, 10), // Multiply by number of boxes
        show_overdue: showOverdue,
        boxes_data: boxes_data,
      };

      const response = await addPackage(payload);
      console.log("Package added successfully:", response.data);
      fetchAllPackages(sqlInvoiceId);
      setIsAddPackageModalOpen(false);

      // Reset form
      setFormData({
        boxes: "",
        qtyPerBox: "",
        dimension: "",
        grossWeight: "",
        deliveryBy: "",
        deliveryDate: "",
        receiveBy: "",
        receiveDate: "",
        shipDate: "",
        payType: "",
        waybill: "",
        selectedProducts: [],
      });
    } catch (error) {
      console.error("Error adding package:", error);
    }
  };
  return (
    <div className="p-4 space-y-4">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <h1 className="text-xl font-semibold">Sales Order - Delivery Ticket</h1>

      <ComponentCard>
        <div className="flex justify-between items-center mb-1 px-4 pt-4">
          <h2 className="text-lg font-semibold"></h2>
          <button
            onClick={() => setIsAddPackageModalOpen(true)}
            className=" text-white px-4 py-3 rounded-xl bg-brand "
          >
            Add Package
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <div className="px-4 py-1 space-y-2">
            <div className="flex justify-end mb-4"></div>
            <Table className="w-full border text-sm">
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow className="bg-gray-100">
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
                    Box(es)
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Qty Per Box
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Dimension
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Gross Weight
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Action
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
                    P/N
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Description
                  </TableCell>

                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {getGroupedPackages()?.flatMap((pkg: any) =>
                  pkg.boxes_data.map((boxData: any, boxIndex: number) => (
                    <TableRow
                      key={`${pkg._id}-${boxIndex}`}
                      className={`
                ${pkg.bgColor}
                ${boxData.isFirstInPackage ? 'border-t-2 border-t-gray-300' : ''}
                ${boxData.isLastInPackage ? 'border-b-2 border-b-gray-300' : ''}
              `}
                    >
                      <TableCell className="px-4 py-3 text-gray-600 text-center">
                        {boxData.isFirstInPackage ? pkg.boxes_data[0].packageIndex + 1 : ""}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {boxData.isFirstInPackage ? boxData.box || "N/A" : ""}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {boxData.isFirstInPackage ? boxData.qty || "N/A" : ""}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {boxData.isFirstInPackage ? boxData.dimension || "N/A" : ""}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {boxData.isFirstInPackage ? boxData.weight || "N/A" : ""}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        {boxData.isFirstInPackage && (
                          <button
                            onClick={() => handleDeletePackage(pkg._id)}
                            className="text-red-600 hover:text-red-800 font-semibold"
                            type="button"
                          >
                            Delete
                          </button>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {boxData.order_item_data?.product_data?.[0]?.model || "N/A"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {boxData.order_item_data?.product_data?.[0]?.parts_no || "N/A"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {boxData.order_item_data?.product_data?.[0]?.description || "N/A"}
                      </TableCell>

                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="text-right font-semibold pt-4">
              Total Boxes: {packages.reduce((sum, pkg) => sum + pkg.boxes_data.length, 0)} |
              Total Gross Weight: {
                packages.reduce((sum, pkg) =>
                  sum + pkg.boxes_data.reduce((boxSum, box) => {
                    const weightValue = typeof box.weight === 'object'
                      ? parseFloat(box.weight?.$numberDecimal || "0")
                      : parseFloat(box.weight || "0");
                    return boxSum + weightValue;
                  }, 0), 0)
              } Lbs
            </div>
          </div>
        </div>
      </ComponentCard>

      <ComponentCard title="">
        <div className="p-4 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <label className="w-32">Invoice Number</label>
              <input
                value={invoiceNumber}
                readOnly
                disabled
                className="flex-1 border p-1 bg-gray-100"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="w-32">Bill To</label>
              <input
                value={getSalesField("bill_to")}
                readOnly
                disabled
                className="flex-1 border p-1 bg-gray-100"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="w-32">PO No.</label>
              <input
                value={getSalesField("customer_po")}
                readOnly
                disabled
                className="flex-1 border p-1 bg-gray-100"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="w-32">Delivered By</label>
              <input
                value={deliveredBy}
                onChange={handleDeliveredByChange}
                className="flex-1 border p-1"
                placeholder="Enter delivery person"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="w-32">Via</label>
              <input
                value={getSalesField("ship_via")}
                readOnly
                disabled
                className="flex-1 border p-1 bg-gray-100"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <label className="w-32">Ship To</label>
              <input
                value={getSalesField("ship_to")}
                readOnly
                disabled
                className="flex-1 border p-1 bg-gray-100"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="w-32">SO No.</label>
              <input
                value={getSalesField("so")}
                readOnly
                disabled
                className="flex-1 border p-1 bg-gray-100"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="w-32">Date Delivered</label>
              <Flatpickr
                options={{
                  dateFormat: "Y-m-d",
                  defaultDate: formData.delivery_date,
                }}
                value={formData.delivery_date}
                onChange={(date) => handleDateChange(date, 'delivery_date')}
                className="flex-1 border p-1"
                disabled={loading}
                placeholder="Select delivery date"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="w-32">Freight Term</label>
              <input
                value={getSalesField("ship_to_data.freight")}
                readOnly
                disabled
                className="flex-1 border p-1 bg-gray-100"
              />
            </div>
            <div className="flex items-center space-x-2 ">
              <label className="w-32">Date Shipped</label>
              <input
                type="date"
                value={formatDateForInput(packages[0]?.other_fields?.invoice_data?.ship_date) || ""}
                readOnly
                disabled
                className="flex-1 border p-1 bg-gray-100"
              />
            </div>
          </div>

          <div className="col-span-3 mt-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="overdue"
                checked={showOverdue}
                onChange={() => setShowOverdue(!showOverdue)}
              />
              <label htmlFor="overdue">
                Check To Show Total Overdue Payment
              </label>
            </div>
          </div>
        </div>
      </ComponentCard>

      <div className="flex justify-center gap-2">
        <Button variant="primary"
          onClick={() => navigate(`/sales`)}>Save Packing List</Button>
        <Button
          type="button"
          onClick={() => window.history.back()}
          className="bg-gray-400 text-black px-4 py-2 rounded hover:bg-gray-500"
        >
          Back
        </Button>
        <Button onClick={() => navigate(`/deliveryTicket/${id}/${pid}`)}>
          View Delivery Ticket
        </Button>
      </div>

      {/* Add package Modal */}
      <Modal
        open={isAddPackageModalOpen}
        onClose={() => setIsAddPackageModalOpen(false)}
      >
        <Box sx={{ ...modalStyle, position: "relative" }}>
          <button
            onClick={() => setIsAddPackageModalOpen(false)}
            className="absolute top-3 right-3 text-gray-500 hover:text-black"
          >
            &#x2715;
          </button>

          <h2 className="text-lg font-semibold mb-4">Select Ship Box</h2>

          <div className="flex flex-row gap-4 mb-4">
            <div className="flex flex-col w-full">
              <label htmlFor="boxes" className="font-medium mb-2">
                Numbers of Boxes
              </label>
              <input
                id="boxes"
                name="boxes"
                type="number"
                value={formData.boxes}
                onChange={handleInputChange}
                className="border px-3 py-2 rounded text-sm w-full"
              />
            </div>
            <div className="flex flex-col w-full">
              <label htmlFor="qtyPerBox" className="font-medium mb-2">
                Qty Per Box
              </label>
              <input
                id="qtyPerBox"
                name="qtyPerBox"
                type="number"
                value={formData.qtyPerBox}
                onChange={handleInputChange}
                className="border px-3 py-2 rounded text-sm w-full"
              />
            </div>
          </div>

          <div className="flex flex-row gap-4 mb-6">
            <div className="flex flex-col w-full">
              <label htmlFor="dimension" className="font-medium mb-2">
                Dimension (Inches)
              </label>
              <input
                id="dimension"
                name="dimension"
                type="text"
                value={formData.dimension}
                onChange={handleInputChange}
                className="border px-3 py-2 rounded text-sm w-full"
              />
            </div>
            <div className="flex flex-col w-full">
              <label htmlFor="grossWeight" className="font-medium mb-2">
                Gross Weight (Lbs)
              </label>
              <input
                id="grossWeight"
                name="grossWeight"
                type="number"
                value={formData.grossWeight}
                onChange={handleInputChange}
                className="border px-3 py-2 rounded text-sm w-full"
              />
            </div>
          </div>

          <div className="mb-4">
            <input
              type="checkbox"
              id="showOverdue"
              checked={showOverdue}
              onChange={() => setShowOverdue((prev) => !prev)}
              className="mr-2"
            />
            <label htmlFor="showOverdue">
              Check To Show Total Overdue Payment
            </label>
          </div>

          <h2 className="text-lg font-semibold mb-2">Select Ship Products</h2>

          {loading ? (
            <div className="loader-overlay">
              <div className="loader"></div>
            </div>
          ) : (
            <>
              <table className="w-full border border-gray-300 text-sm mb-4">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Select</th>
                    <th className="p-2 border">Model</th>
                    <th className="p-2 border">PN</th>
                    <th className="p-2 border">Size</th>
                    <th className="p-2 border">QTY Not In Box</th>
                  </tr>
                </thead>
                <tbody>
                  {orderData?.map((product: any) => {
                    const isChecked = formData.selectedProducts.some(
                      (p) => p.id === product.id
                    );
                    return (
                      <tr key={product.id}>
                        <td className="p-2 border text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) =>
                              handleProductSelect(product, e.target.checked)
                            }
                          />
                        </td>
                        <td className="p-2 border">{product.product_data?.model || "N/A"}</td>
                        <td className="p-2 border">{product.product_data?.parts_no || "N/A"}</td>
                        <td className="p-2 border">{product?.size_data?.name || "N/A"}</td>
                        <td className="p-2 border text-center">
                          {product.notship_qty || "0"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination controls */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
          <Button onClick={handleSubmit} variant="primary" className="mt-4">
            Submit
          </Button>
        </Box>
      </Modal>
    </div>
  );
};