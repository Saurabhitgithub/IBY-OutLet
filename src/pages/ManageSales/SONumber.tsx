import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { getOrderDataBySalesId, getSalesById } from "../../services/apis";

export const SONumber: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [salesData, setSalesData] = useState<any>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const taxTypeValue = Number(salesData?.tax);
  const taxTypeMap: Record<number, string> = {
    1: "Local Tax",
    0: "Fed Tax",
  };

  const taxTypeLabel = taxTypeMap[taxTypeValue] || "No Tax";

  useEffect(() => {
    if (id) {
      getSalesById(id)
        .then((res) => {
          setSalesData(res.data?.data);
          getOrderDataBySalesId(res.data?.data?.id)
            .then((res) => {
              setOrderData(res.data?.data);
            })
            .catch((err) => {
              console.error("Failed to fetch sales data", err);
            });
        })
        .catch((err) => {
          console.error("Failed to fetch sales data", err);
        });
    }
  }, [id]);

  // useEffect(() => {
  //     if (id) {
  //         getOrderDataBySalesId(salesData?.id)
  //             .then((res) => {
  //                 setOrderData(res.data?.data);
  //             })
  //             .catch((err) => {
  //                 console.error("Failed to fetch sales data", err);
  //             });
  //     }
  // }, [id]);

  // if (!salesData) return <div className="p-4">Loading...</div>;
  // console.log(orderData);

  return (
    <div className="p-4 space-y-4 text-sm">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <h1 className="text-xl font-semibold">Sales Order</h1>

      <ComponentCard title="Basic Info">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <InputBlock label="SO Number" value={salesData?.so || ""} />
          <InputBlock
            label="Customer PO#"
            value={salesData?.customer_po || ""}
          />
          <InputBlock
            label="Double Check Person"
            value={salesData?.makecheck_name || ""}
          />
          <InputBlock
            label="Sales Man"
            value={salesData?.salesman_name || ""}
          />
          <InputBlock label="Currency" value={salesData?.currency || "USD"} />
          <InputBlock
            label="PO Date"
            value={salesData?.poDate || new Date().toISOString().split("T")[0]}
          />
          <InputBlock label="Tax Type" value={taxTypeLabel} />

          <InputBlock label="Tax Rate (%)" value={salesData?.tax_rate ?? "0"} />

          <InputBlock
            label="Open To"
            value={salesData?.opento_names || ""}
            className="col-span-1"
          />
        </div>
      </ComponentCard>

      <ComponentCard title="">
        <div className="grid grid-cols-2 gap-8">
          <AddressBlock
            title="Ship To"
            company={salesData?.ship_to_data?.company_name || ""}
            customerId={salesData?.ship_to_data?.customer_id || ""}
            address={salesData?.ship_to_data?.address1 || ""}
            city={salesData?.ship_to_data?.city || ""}
            state={salesData?.ship_to_data?.state_id || ""}
            country={salesData?.ship_to_data?.country_id || ""}
            phone={salesData?.ship_to_data?.phone || ""}
          />
          <AddressBlock
            title="Bill To"
            company={salesData?.bill_to_data?.company_name || ""}
            customerId={salesData?.bill_to_data?.customer_id || ""}
            address={salesData?.bill_to_data?.address1 || ""}
            city={salesData?.bill_to_data?.city || ""}
            state={salesData?.bill_to_data?.state_id || ""}
            country={salesData?.bill_to_data?.country_id || ""}
            phone={salesData?.bill_to_data?.phone || ""}
          />
        </div>
        <div className="flex justify-center mt-2">
          {location.pathname.includes("modifysoNumber") ? (
            <Button onClick={() => navigate("/modifySales")}>
              Modify This Part{" "}
            </Button>
          ) : (
            <Button onClick={() => navigate(`/modifySales/${salesData._id}`)}>
              Modify Company Info
            </Button>
          )}
        </div>
      </ComponentCard>

      <ComponentCard title="">
        <div style={{ overflowX: "auto" }}>
          <Table className="w-full border text-sm">
            <TableHeader>
              <TableRow className="bg-gray-100">
                {[
                  "Model",
                  "PN",
                  "Size",
                  "Stock",
                  "Location",
                  "Ordered",
                  "Shipped",
                  "Remaining Ship After (weeks)",
                  "Unit Price",
                  "Total Price",
                  "Extra Cost",
                  "Total Extra Cost",
                ].map((heading, idx) => (
                  <TableCell
                    key={idx}
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    {heading}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {orderData?.length > 0 ? (
                orderData.map((order: any, index: any) => (
                  <TableRow key={index}>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {order.product_data?.model || "N/A"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {order.product_data?.oem_pn || "N/A"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {order.size_data?.name || "N/A"}{" "}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {order.product_data?.quantity || "N/A"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {order.location_data?.name || "N/A"}{" "}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {order.order_qty || "N/A"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {order.ship_number || "N/A"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {order.left_qty || "N/A"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {order.unit_price || "N/A"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {order.total_price || "N/A"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {order.extra_cost || "N/A"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {order.extra_cost || "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <td colSpan={13} className="text-center text-gray-400">
                    No matching products found.
                  </td>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex justify-end mt-4 text-sm font-medium space-x-8">
            <div>
              Total Price:{" "}
              <span className="text-black">
                {orderData?.total_price || "US$0"}
              </span>
            </div>
            <div>
              Total Extra Cost:{" "}
              <span className="text-black">
                {orderData?.totalExtraCost || "US$0"}
              </span>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            {location.pathname.includes("modifysoNumber") ? (
              <Button onClick={() => navigate("/addSales2")}>
                Modify This Part
              </Button>
            ) : (
              <Button onClick={() => navigate(`/addSales2/${salesData._id}`)}>
                Modify Products
              </Button>
            )}
          </div>
        </div>
      </ComponentCard>

      <ComponentCard title="">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="font-medium">Verify result</label>
          </div>

          <div className="rounded overflow-hidden border">
            {" "}
            {/* Outer border container */}
            <div className="grid grid-cols-2 border-b">
              {" "}
              {/* First row with bottom border */}
              <div className="col-span-1 p-2 border-r">Status</div>
              <div className="col-span-1 p-2">Applying</div>
            </div>
            <div className="grid grid-cols-2">
              {" "}
              {/* Second row */}
              <div className="col-span-1 p-2 border-r">Notes</div>
              <div className="col-span-1 p-2"></div>
            </div>
          </div>
        </div>
      </ComponentCard>
      <div className="text-center">
        {location.pathname.includes("modifysoNumber") ? (
          <Button type="submit">Submit</Button>
        ) : (
          <Button
            type="button"
            onClick={() => window.history.back()}
            className="bg-gray-400 text-black rounded hover:bg-gray-500"
          >
            Back to List
          </Button>
        )}
      </div>
    </div>
  );
};

const InputBlock = ({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) => (
  <div className={`flex items-center space-x-2 ${className}`}>
    <label className="w-32 shrink-0">{label}</label>
    <input value={value} readOnly className="flex-1 border p-1 bg-gray-50" />
  </div>
);

const AddressBlock = ({
  title,
  company,
  customerId,
  address,
  city,
  state,
  country,
  phone,
}: {
  title: string;
  company: string;
  customerId: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
}) => (
  <div className="space-y-2">
    <h3 className="font-semibold">{title}</h3>
    <InputBlock label="Company Name" value={company} />
    <InputBlock label="Customer ID" value={customerId} />
    <InputBlock label="Address" value={address} />
    <InputBlock label="City" value={city} />
    <InputBlock label="State" value={state} />
    <InputBlock label="Country" value={country} />
    <InputBlock label="Phone Number" value={phone} />
  </div>
);
