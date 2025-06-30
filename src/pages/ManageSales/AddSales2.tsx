import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Box, Modal, Pagination, Stack } from "@mui/material";
import {
  addOrderItem,
  editOrderItem,
  getAllCategory,
  getAllItemProduct,
  getAllLocation,
  getAllPressure,
  getAllProductByPageLimit,
  getAllSize,
  getAllSubCategoryByCategoryId,
  getOrderDataById,
  getOrderDataBySalesId,
  getSalesById,
} from "../../services/apis";
import Select from "react-select";
import Badge from "../../components/ui/badge/Badge";
import { EditIcon } from "lucide-react";

interface Option {
  value: string;
  label: string;
}
export const AddSales2: React.FC = () => {
  const navigate = useNavigate();
  let Location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [filters, setFilters] = useState({
    category: "",
    subCategory: "",
    location: "",
    model: "",
    pn: "",
    size: "",
    pressure: "",
  });
  const { id } = useParams();
  const [salesData, setSalesData] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<Option | null>(null);
  const [subCategoryOptions, setSubCategoryOptions] = useState<Option[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedSubCategory, setSelectedSubCategory] = useState<Option | null>(
    null
  );
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
  const [locationOptions, setLocationOptions] = useState<Option[]>([]);
  const [pressureOptions, setPressureOptions] = useState<Option[]>([]);
  const [orderQtyError, setOrderQtyError] = useState("");

  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [shipType, setShipType] = useState(
    selectedProduct?.ship_type || "One Time"
  );
  const [sizeOptions, setSizeOptions] = useState<Option[]>([]);
  const [productData, setProductData] = useState<any[]>([]);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // console.log("sizeoptions:",sizeOptions[0].description)

  const [orderData, setOrderData] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editableFields, setEditableFields] = useState({
    sn: selectedProduct?.sn || "",
    orderedQuantity: selectedProduct?.ordered_quantity || "1",
    orderedPrice:
      selectedProduct?.unit_price ||
      selectedProduct?.price ||
      selectedProduct?.regular_cost?.$numberDecimal ||
      "0",
    shippedQuantity: selectedProduct?.shipped_quantity || "0",
    extraCost: selectedProduct?.extra_cost || "0",
  });
  // const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (selectedProduct?.ship_type) {
      setShipType(selectedProduct.ship_type);
    }
  }, [selectedProduct]);

  useEffect(() => {
    setEditableFields({
      sn: selectedProduct?.sn || "",
      orderedQuantity: selectedProduct?.ordered_quantity || "1",
      orderedPrice:
        selectedProduct?.unit_price ||
        selectedProduct?.price ||
        selectedProduct?.regular_cost?.$numberDecimal ||
        "0",
      shippedQuantity: selectedProduct?.shipped_quantity || "0",
      extraCost: selectedProduct?.extra_cost || "0",
    });
  }, [selectedProduct]);
  // Handler for changes
  const handleFieldChange = (field: string, value: string) => {
    if (field === "shippedQuantity") {
      const orderedQty = parseInt(editableFields.orderedQuantity || "0");
      const shippedQty = parseInt(value || "0");

      if (shippedQty > orderedQty) {
        return;
      }
    }

    setEditableFields((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleAddToShippingList = async () => {
    if (!selectedProduct || !salesData?.id) return;

    try {
      const orderedQty = parseInt(editableFields.orderedQuantity || "0");
      const shippedQty = parseInt(editableFields.shippedQuantity || "0");
      const unitPrice = parseFloat(editableFields.orderedPrice || "0");
      const extraCost = parseFloat(editableFields.extraCost || "0");
      const leftQty = orderedQty - shippedQty;
      // Map ship_type to numeric values
      const shipTypeValue = shipType === "One Time" ? "1" : "2";

      const payload = {
        order_id: salesData.id,
        product_id: selectedProduct.product_id || selectedProduct.id,
        dimension: selectedProduct.dimension || "",
        weight: selectedProduct.weight || "",
        order_qty: editableFields.orderedQuantity,
        ship_type: shipTypeValue,
        ship_number: editableFields.shippedQuantity || "",
        delivery_day: "0",
        unit_price: editableFields.orderedPrice,
        total_price: (orderedQty * unitPrice).toString(),
        box: selectedProduct.box || "",
        p_cost: selectedProduct?.purchase_cost?.$numberDecimal || "",
        left_qty: leftQty.toString(),
        box_id: selectedProduct.box_id || "",
        brief: selectedProduct.description || "",
        price_cif: selectedProduct?.regular_cost?.$numberDecimal || "",
        price_4: selectedProduct.price_4 || "",
        sn: editableFields.sn,
        extra_cost: editableFields.extraCost,
        price_3a: selectedProduct?.price_3a0?.$numberDecimal || "",
        notship_qty: leftQty.toString(),
      };

      let response;
      if (selectedProduct.id) {
        // Only call edit if we have an existing order item ID
        response = await editOrderItem(selectedProduct.id, payload);
      } else {
        // Call add for new items
        response = await addOrderItem(payload);
      }
      if (shippedQty > orderedQty) {
        alert("Shipped quantity cannot exceed ordered quantity");
        return;
      }
      if (response.data.success) {
        const orderResponse = await getOrderDataBySalesId(salesData.id);
        setOrderData(orderResponse.data?.data);
        setIsDetailModalOpen(false);
        setIsModalOpen(false);
      } else {
        throw new Error(response.data.message || "Failed to save changes");
      }
    } catch (error) {
      console.error("Error saving order item:", error);
      alert("Failed to save changes. Please try again.");
    }
  };
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
          const saleId = res.data?.data?.id;

          getOrderDataBySalesId(saleId)
            .then((res) => {
              const orders = res.data?.data || [];
              setOrderData(orders);
              console.log("order response", orders);

              if (orders.length && orders[0]?.size_data) {
                setSizeOptions(orders[0].size_data);
              } else {
                console.warn("No size_data found");
              }
            })
            .catch((err) => {
              console.error("Failed to fetch order data", err);
            });
        })
        .catch((err) => {
          console.error("Failed to fetch sales data", err);
        });
    }
  }, [id]);
  useEffect(() => {
    const fetchItemProducts = async () => {
      setLoading(true);
      try {
        const response = await getAllItemProduct(page, limit);
        const productsArray = response.data.data.data;
        const totalItems = response.data.data.total;
        const totalPages = response.data.data.totalPages;

        setProductData(productsArray);
        setTotalCount(totalItems);
        setTotalPages(totalPages);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProductData([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchItemProducts();
  }, [page, limit]);
  useEffect(() => {
    fetchCategories();
    fetchLocations();
    fetchPressure();
    fetchSizes();
  }, []);

  const fetchPressure = async () => {
    try {
      const res = await getAllPressure();
      if (res?.data?.data) {
        const options = res.data.data.map((pre: any) => ({
          value: pre.id,
          label: pre.name,
          raw: pre,
        }));
        setPressureOptions(options);
      }
    } catch (error) {
      console.error("Failed to fetch pressure", error);
    }
  };
  const fetchSizes = async () => {
    try {
      const res = await getAllSize();
      if (res?.data?.data) {
        const options = res.data.data.map((size: any) => ({
          value: size.id,
          label: size.name,
        }));
        setSizeOptions(options);
      }
    } catch (error) {
      console.error("Failed to fetch sizes", error);
    }
  };
  const fetchLocations = async () => {
    try {
      const res = await getAllLocation();
      if (res?.data?.data) {
        const locations = res.data.data.map((location: any) => ({
          value: location.id,
          label: location.name,
        }));
        setLocationOptions(res.data.data[1].name);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getAllCategory();
      if (res?.data?.data) {
        const options = res.data.data.map((cat: any) => ({
          value: cat.id,
          label: cat.name,
          raw: cat,
        }));
        setCategoryOptions(options);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!selectedCategory) {
        setSubCategoryOptions([]);
        setSelectedSubCategory(null);
        return;
      }
      try {
        const res = await getAllSubCategoryByCategoryId(selectedCategory.value);
        if (res?.data?.data) {
          const options = res.data.data.map((sub: any) => ({
            value: sub.id,
            label: sub.name,
          }));
          setSubCategoryOptions(options);
        } else {
          setSubCategoryOptions([]);
        }
      } catch (error) {
        setSubCategoryOptions([]);
        console.error("Failed to fetch subcategories", error);
      }
    };
    fetchSubCategories();
  }, [selectedCategory]);
  const resetFilters = () => {
    setFilters({
      category: "",
      subCategory: "",
      location: "",
      model: "",
      pn: "",
      size: "",
      pressure: "",
    });
    setSelectedCategory(null);
    setSelectedSubCategory(null);
  };

  const filteredData = useMemo(() => {
    return productData.filter((item) => {
      return (
        (!selectedCategory || item.categoryId === selectedCategory.value) &&
        (!selectedSubCategory ||
          item.subCategoryId === selectedSubCategory.value) &&
        (!filters.location ||
          item.location
            ?.toLowerCase()
            .includes(filters.location.toLowerCase())) &&
        (!filters.model ||
          item.model?.toLowerCase().includes(filters.model.toLowerCase())) &&
        (!filters.pn ||
          item.pn?.toLowerCase().includes(filters.pn.toLowerCase())) &&
        (!filters.size ||
          item.size?.toLowerCase().includes(filters.size.toLowerCase())) &&
        (!filters.pressure ||
          item.pressure?.toLowerCase().includes(filters.pressure.toLowerCase()))
      );
    });
  }, [productData, selectedCategory, selectedSubCategory, filters]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-4 space-y-4">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <h1 className="text-xl font-semibold">
        Add Sales Order - Select Products
      </h1>
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
          <InputBlock label="PO Date" value={salesData?.created_at || ""} />
          <InputBlock label="Tax Type" value={taxTypeLabel} />
          <InputBlock label="Tax Rate" value={salesData?.tax || ""} />
          <InputBlock
            label="Open To"
            value={salesData?.opento_names || ""}
            className="col-span-1"
          />
        </div>
      </ComponentCard>
      <ComponentCard title="">
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <AddressBlock
            title="Ship To"
            company={salesData?.ship_to_data?.name || ""}
            customerId={salesData?.ship_to_data?.customer_id || ""}
            address={salesData?.ship_to_data?.address1 || ""}
            city={salesData?.ship_to_data?.city || ""}
            state={salesData?.ship_to_data?.state_name || ""}
            country={salesData?.ship_to_data?.country_name || ""}
            phone={salesData?.ship_to_data?.phone || ""}
          />
          <AddressBlock
            title="Bill To"
            company={salesData?.bill_to_data?.company_name || ""}
            customerId={salesData?.bill_to_data?.customer_id || ""}
            address={salesData?.bill_to_data?.address1 || ""}
            city={salesData?.bill_to_data?.city || ""}
            state={salesData?.bill_to_data?.state_name || ""}
            country={salesData?.bill_to_data?.country_name || ""}
            phone={salesData?.bill_to_data?.phone || ""}
          />
        </div>
      </ComponentCard>
      <ComponentCard title="">
        <div className="">
          <div className="text-left mb-4">
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Select Ordered Product
            </Button>
          </div>
          <Table className="w-full border text-sm">
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
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
                  "Action",
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
                      {orderData[0].product_data.parts_no || "N/A"}
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
                      {order.order_qty}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {order.ship_number}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {order.left_qty}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {order.unit_price}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {order.total_price}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {order.extra_cost}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {order.totalExtraCost}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      <div
                        className="cursor-pointer"
                        onClick={() => {
                          getOrderDataById(order._id)
                            .then((res) => {
                              setSelectedProduct({
                                ...res.data?.data,
                                id: order.id,
                              });
                              setIsDetailModalOpen(true);
                            })
                            .catch((err) => {
                              console.error(
                                "Failed to fetch order item data",
                                err
                              );
                            });
                        }}
                      >
                        <Badge size="md" color="success">
                          <EditIcon size={14} />
                        </Badge>
                      </div>
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
          {/* {console.log("Selected productssss",selectedProduct)} */}

          <div className="flex justify-center mt-4 gap-4">
            <Button
              type="button"
              onClick={() => window.history.back()}
              className="bg-gray-400 text-black rounded hover:bg-gray-500"
            >
              Back
            </Button>
            {/* {!location.pathname.includes("modifySales") ? (<>   <Link to="/addSales2">
                                            <Button type="submit">Next Step</Button>
                                        </Link></>) : (<>   <Link to="/addSales2">
                                            <Button type="submit">Submit</Button>
                                        </Link></>)} */}

            {Location.pathname.includes("/modifysoNumber") ? (
              <>
                <Button onClick={() => navigate("/modifysoNumber")}>
                  Next Step
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => navigate("/sales")}>
                  Submit
                </Button>
              </>
            )}
          </div>
        </div>
      </ComponentCard>
      {/* select shipped products  */}
      <Modal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetFilters();
        }}
      >
        <Box sx={modalStyle}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Select Shipped Products</h2>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium transition-colors"
            >
              Reset Filters
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col">
              <label htmlFor="category" className="font-medium mb-2">
                Category<span className="text-red-500">*</span>
              </label>
              <Select
                inputId="category"
                options={categoryOptions}
                value={selectedCategory}
                onChange={(option) => {
                  setSelectedCategory(option as Option);
                  setSelectedSubCategory(null);
                }}
                className="w-full"
                placeholder="Category..."
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="subCategory" className="font-medium mb-2">
                Sub Category<span className="text-red-500">*</span>
              </label>
              <Select
                inputId="subCategory"
                options={subCategoryOptions}
                value={selectedSubCategory}
                onChange={(option) => setSelectedSubCategory(option as Option)}
                className="w-full"
                placeholder="Sub Category..."
                isDisabled={!selectedCategory}
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="inventoryLocation" className="font-medium mb-2">
                Inventory Location<span className="text-red-500">*</span>
              </label>
              <Select
                inputId="inventoryLocation"
                options={locationOptions}
                onChange={(option) =>
                  handleFilterChange("location", option?.label || "")
                }
                className="w-full"
                placeholder="Inventory Location..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="flex flex-col">
              <label htmlFor="model" className="font-medium mb-2">
                Model
              </label>
              <input
                type="text"
                value={filters.model}
                onChange={(e) => handleFilterChange("model", e.target.value)}
                className="border px-3 py-2 rounded text-sm"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="pn" className="font-medium mb-2">
                PN
              </label>
              <input
                type="text"
                value={filters.pn}
                onChange={(e) => handleFilterChange("pn", e.target.value)}
                className="border px-3 py-2 rounded text-sm"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="size" className="font-medium mb-2">
                Size
                <span className="text-red-500">*</span>
              </label>
              <Select
                inputId="size"
                options={sizeOptions}
                onChange={(option) =>
                  handleFilterChange("size", option?.label || "")
                }
                className="w-full"
                placeholder="Size..."
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="pressure" className="font-medium mb-2">
                Pressure
                <span className="text-red-500">*</span>
              </label>
              <Select
                inputId="pressure"
                options={pressureOptions}
                onChange={(option) =>
                  handleFilterChange("pressure", option?.label || "")
                }
                className="w-full"
                placeholder="Pressure..."
              />
            </div>
          </div>
          <div className="max-h-[60vh] overflow-auto border rounded">
            <div style={{ overflowX: "auto" }}>
              <Table className="w-full text-sm">
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow className="bg-gray-100">
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-start"
                    >
                      Select
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-start"
                    >
                      Model
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-start"
                    >
                      PN
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-start"
                    >
                      Size
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-start"
                    >
                      Stock
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-start"
                    >
                      Location
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="px-4 py-3 text-start">
                          <input
                            type="radio"
                            name="product"
                            onChange={() => {
                              // Clear any existing ID to ensure we're adding new
                              setSelectedProduct({
                                ...item,
                                id: undefined, // Ensure no ID exists for new items
                                product_id: item.id || item.id, // Set the product_id
                              });
                              setIsDetailModalOpen(true);
                            }}
                          />
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          {item.model}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          {item.oem_pn}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          {item?.sizeData[0]?.name}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          {item?.inventory_location_data[0]?.name}
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
            </div>
          </div>
          {/* <div className="flex justify-end mt-4">
                        <Button onClick={() => setIsModalOpen(false)}>Close</Button>
                    </div> */}
          <div className="flex flex-wrap justify-between items-center mt-4">
            {/* Pagination moved to left */}
            <Stack spacing={2}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
              />
            </Stack>

            {/* Showing entries text moved to right */}
            <span className="text-sm text-gray-800 dark:text-white/90">
              Showing {Math.min((page - 1) * limit + 1, totalCount)} to{" "}
              {Math.min(page * limit, totalCount)} of {totalCount} entries
            </span>
          </div>
        </Box>
      </Modal>
      {/* {console.log("model , selectd; ", selectedProduct)} */}
      {/* select details shipped products  */}
      <Modal
        open={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      >
        <Box sx={modalStyle}>
          <h2 className="text-lg font-semibold mb-4">
            {selectedProduct?.id ? "Edit Order Item" : "Add New Order Item"}
          </h2>

          <div className="flex-grow overflow-y-auto">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="font-medium">Model</label>
                <input
                  type="text"
                  value={
                    selectedProduct?.[0]?.brief ||
                    selectedProduct?.model ||
                    "N/A"
                  }
                  disabled
                  className="border p-2 rounded w-full bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="font-medium">Size</label>
                <input
                  type="text"
                  value={sizeOptions?.name || "N/A"}
                  disabled
                  className="border p-2 rounded w-full bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="font-medium">PN</label>
                <input
                  type="text"
                  value={
                    selectedProduct?.product_data?.parts_no ||
                    selectedProduct?.parts_no ||
                    "N/A"
                  }
                  disabled
                  className="border p-2 rounded w-full bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-medium">Pressure</label>
                <input
                  type="text"
                  value={
                    selectedProduct?.pressure_id ||
                    selectedProduct?.pressure ||
                    "N/A"
                  }
                  disabled
                  className="border p-2 rounded w-full bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-medium">Description</label>
                <input
                  type="text"
                  value={
                    selectedProduct?.[0]?.product_data?.description ||
                    selectedProduct?.description ||
                    "N/A"
                  }
                  disabled
                  className="border p-2 rounded w-full bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-medium">QTY In stock</label>
                <input
                  type="text"
                  value={
                    selectedProduct?.[0]?.product_data?.quantity ||
                    selectedProduct?.quantity ||
                    "N/A"
                  }
                  disabled
                  className="border p-2 rounded w-full bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="font-medium">SN</label>
              <input
                type="text"
                value={editableFields.sn}
                onChange={(e) => handleFieldChange("sn", e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="font-medium">Location</label>
                <input
                  type="text"
                  value={locationOptions || "N/A"}
                  disabled
                  className="border p-2 rounded w-full bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-medium">Unit Price</label>
                <input
                  type="text"
                  value={
                    selectedProduct?.regular_cost?.$numberDecimal ||
                    selectedProduct?.[0]?.unit_price ||
                    selectedProduct?.[0]?.price ||
                    "N/A"
                  }
                  disabled
                  className="border p-2 rounded w-full bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="font-medium">Ordered Quantity</label>
                <input
                  type="number"
                  value={editableFields.orderedQuantity}
                  onChange={(e) => {
                    const value = e.target.value;
                    const inputValue = parseInt(value, 10);
                    const maxStock =
                      selectedProduct?.quantity || selectedProduct?.stock || 0;

                    if (!value) {
                      handleFieldChange("orderedQuantity", "");
                      setOrderQtyError("");
                      return;
                    }

                    if (!isNaN(inputValue)) {
                      if (inputValue <= maxStock) {
                        handleFieldChange("orderedQuantity", inputValue);
                        setOrderQtyError("");
                      } else {
                        setOrderQtyError(`Cannot exceed stock (${maxStock})`);
                      }
                    }
                  }}
                  className="border p-2 rounded w-full"
                  min="0"
                  max={selectedProduct?.quantity || selectedProduct?.stock || 0}
                />
                {orderQtyError && (
                  <p className="text-sm text-red-500 mt-1">{orderQtyError}</p>
                )}
              </div>
              <div>
                <label className="font-medium">Ordered Price</label>
                <input
                  type="number"
                  value={editableFields.orderedPrice}
                  onChange={(e) =>
                    handleFieldChange("orderedPrice", e.target.value)
                  }
                  className="border p-2 rounded w-full"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="font-medium">Shipped Quantity</label>
                <input
                  type="number"
                  value={editableFields.shippedQuantity}
                  onChange={(e) => {
                    const value = e.target.value;
                    const orderedQty = parseInt(
                      editableFields.orderedQuantity || "0"
                    );
                    const shippedQty = parseInt(value || "0");

                    if (!value) {
                      handleFieldChange("shippedQuantity", "");
                      return;
                    }

                    if (!isNaN(shippedQty)) {
                      if (shippedQty <= orderedQty) {
                        handleFieldChange("shippedQuantity", value);
                      } else {
                        // Optionally show an error message
                        alert(
                          `Shipped quantity cannot exceed ordered quantity (${orderedQty})`
                        );
                      }
                    }
                  }}
                  className="border p-2 rounded w-full"
                  min="0"
                  max={editableFields.orderedQuantity}
                />
              </div>
              <div>
                <label className="font-medium">Extra Cost</label>
                <input
                  type="number"
                  value={editableFields.extraCost}
                  onChange={(e) =>
                    handleFieldChange("extraCost", e.target.value)
                  }
                  className="border p-2 rounded w-full"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="flex gap-5 mb-4">
              <label className="font-medium">One Time / Partial</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="onSale3"
                    value="One Time"
                    checked={shipType === "One Time"}
                    onChange={(e) => setShipType(e.target.value)}
                  />
                  One Time
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="onSale3"
                    value="Ship Partial"
                    checked={shipType === "Ship Partial"}
                    onChange={(e) => setShipType(e.target.value)}
                  />
                  Ship Partial
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsDetailModalOpen(false)}
            >
              Close
            </Button>
            {/* Always show Back button */}
            <Button
              variant="primary"
              onClick={() => {
                setIsDetailModalOpen(false);
                setIsModalOpen(true);
              }}
            >
              Back to re-select
            </Button>
            <Button variant="primary" onClick={handleAddToShippingList}>
              Add to shipping list
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};
const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "70%",
  maxHeight: "90vh",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};
const modalStyle1 = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "70%",
  height: "50vh",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  display: "flex",
  flexDirection: "column",
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
    <input value={value} readOnly className="flex-1 border p-1" />
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
