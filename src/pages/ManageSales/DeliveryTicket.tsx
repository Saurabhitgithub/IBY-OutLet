import React, { useEffect, useState, useRef } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { getSalesById, getAllPackageByinvoiceId } from "../../services/apis";
import { useParams, useNavigate } from "react-router";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const DeliveryTicket: React.FC = () => {
  const { id, pid } = useParams<{ id: string; pid: string }>();
  const [salesData, setSalesData] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const deliveryTicketRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      if (id) {
        const salesRes = await getSalesById(id);
        setSalesData(salesRes.data?.data);
      }
      console.log("saledataaaa", salesData)
      if (pid) {
        const response = await getAllPackageByinvoiceId(pid);
        setPackages(response.data?.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, pid]);

  // Helper function to get field from salesData with fallback
  const getSalesField = (field: string) => {
    return salesData?.[field] || "N/A";
  };

  const handleDownloadPdf = async () => {
    if (!deliveryTicketRef.current) return;

    try {
      const tempDiv = document.createElement("div");
      tempDiv.style.position = "fixed";
      tempDiv.style.top = "0";
      tempDiv.style.left = "-9999px";
      tempDiv.style.width = "210mm";
      tempDiv.style.padding = "20px";
      tempDiv.style.backgroundColor = "white";
      tempDiv.style.color = "black";
      tempDiv.style.fontFamily = "Arial, sans-serif";
      tempDiv.style.fontSize = "14px";

      tempDiv.innerHTML = deliveryTicketRef.current.innerHTML;

      // Append to DOM so styles apply
      document.body.appendChild(tempDiv);

      // Sanitize any unsupported color functions from computed styles
      const removeUnsupportedColors = (element: HTMLElement) => {
        const allElements = element.querySelectorAll("*");
        allElements.forEach(el => {
          const computed = getComputedStyle(el);
          const bg = computed.backgroundColor;
          const color = computed.color;

          // Force to standard RGB if unsupported function is used
          if (bg.includes("oklch") || bg.includes("lab")) {
            el.style.backgroundColor = "#ffffff";
          }
          if (color.includes("oklch") || color.includes("lab")) {
            el.style.color = "#000000";
          }
        });
      };

      removeUnsupportedColors(tempDiv);

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
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
      pdf.save(`delivery_ticket_${getSalesField("invoice_number") || "unknown"}.pdf`);

      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please check console for details.");
    }
  };



  return (
    <div className="p-4 space-y-4" ref={deliveryTicketRef}>
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}

      {/* <h1 className="text-xl font-semibold">Delivery Ticket</h1> */}

      <div className="text-center text-sm">
        <div>Address: 2469 FM 359 Rd S, Brookshire, TX 77423</div>
        <div className="my-2">www.ibyOUTLET.com</div>
        <div>
          <b>Phone:</b> 281-433-3389 &nbsp; <b>Fax:</b> 713-583-8020
        </div>
        <h2 className="text-lg font-bold mt-2">Delivery Ticket</h2>
      </div>

      <ComponentCard title="" className="mt-4">
        <div className="p-4 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <label className="w-32">Invoice Number</label>
              <input
                value={getSalesField("invoice_number")}
                readOnly
                className="flex-1 border p-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="w-32">Bill To</label>
              <input
                value={getSalesField("bill_to")}
                readOnly
                className="flex-1 border p-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="w-32">PO No.</label>
              <input
                value={getSalesField("customer_po")}
                readOnly
                className="flex-1 border p-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="w-32">Delivered By</label>
              <input
                value={packages[0]?.other_fields?.delivery_by || "N/A"}
                readOnly
                className="flex-1 border p-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="w-32">Via</label>
              <input
                value={getSalesField("ship_via")}
                readOnly
                className="flex-1 border p-1"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <label className="w-32">Ship To</label>
              <input
                value={getSalesField("ship_to")}
                readOnly
                className="flex-1 border p-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="w-32">SO No.</label>
              <input
                value={getSalesField("so")}
                readOnly
                className="flex-1 border p-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="w-32">Date Delivered</label>
              <input
                value={salesData?.order_items?.[0]?.delivery_day || "N/A"}
                readOnly
                className="flex-1 border p-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="w-32">Freight Term</label>
              <input
                value={getSalesField("ship_to_data.freight")}
                readOnly
                className="flex-1 border p-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="w-32">Date Shipped</label>
              <input
                value={packages[0]?.invoice_data?.ship_date?.split('T')[0] || ""}
                type="date"
                readOnly
                className="flex-1 border p-1"
              />
            </div>
          </div>
        </div>
      </ComponentCard>

      <ComponentCard title="Delivery Items">
        <div style={{ overflowX: "auto" }}>
          <div className="p-4">
            <Table className="w-full border text-sm">
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow className="bg-gray-100">
                  <TableCell isHeader className="px-5 py-3 font-medium text-start">
                    No.
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-start">
                    Box(es)
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-start">
                    Qty Per Box
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-start">
                    Dimension
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-start">
                    Gross Weight
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-start">
                    Model
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-start">
                    P/N
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-start">
                    Description
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {packages?.map((pkg: any, index: any) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="px-4 py-3 text-gray-600 text-center">
                      {index + 1}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {pkg.boxes_data[0]?.box}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {pkg.boxes_data[0]?.qty}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {pkg.boxes_data[0]?.dimension}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {pkg.boxes_data[0]?.weight}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {pkg.boxes_data?.[0]?.order_item_data?.product_data?.[0]?.model || "N/A"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {pkg.boxes_data?.[0]?.order_item_data?.product_data?.[0]?.parts_no || "N/A"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {pkg.boxes_data?.[0]?.order_item_data?.product_data?.[0]?.description || "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="text-right font-semibold pt-4">
              Total Boxes: {packages.length} | Total Gross Weight:{" "}
              {packages.reduce((sum, pkg) => sum + (parseInt(pkg.boxes_data[0]?.weight) || 0), 0)} Lbs
            </div>
          </div>
        </div>
      </ComponentCard>

      <div className="text-sm text-center pt-6">
        <div>
          Total Overdue: <span className="text-red-600">US$0</span>,{" "}
          <span className="text-blue-600">Please Pay ASAP.</span>
        </div>
        <div className="pt-6">
          <div className="flex justify-between">
            <span>Received By(Print):</span>
            <span>Signature:</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-4 gap-2">
        <Button
          className="bg-gray-400 text-black hover:bg-gray-500"
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Button variant="primary" onClick={handleDownloadPdf}>
          Download PDF
        </Button>
      </div>
    </div>
  );
};