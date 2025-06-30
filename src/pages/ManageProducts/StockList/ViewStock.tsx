import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { EditIcon } from "lucide-react";
import Button from "../../../components/ui/button/Button";
import ComponentCard from "../../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { VscSymbolMethod } from "react-icons/vsc";
import { Box, Modal, Grid, Stack, Pagination } from "@mui/material";
import { AdvancedSearch } from "../AdvancedSearch";
import { getAllProductByPageLimit, addAddLostData, getAllLocation, getPermissionByRole } from "../../../services/apis";
import { toast } from "react-toastify";

const sortByTime = [
  { value: "oldest", label: "oldest" },
  { value: "latest", label: "latest" },
];

export const ViewStock = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [productData, setProductData] = useState<any[]>([]);
  const [locationOptions, setLocationOptions] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedSort, setSelectedSort] = useState<any>(sortByTime[0]);
  const [checkboxFilters, setCheckboxFilters] = useState({
    distributorPrice: false,
    retailPrice: false,
    qtyInStock: false,
    qtyInProduce: false,
    qtyOnTheWay: false,
    rackNumber: false,
    outOfStock: false
  });
  const [appliedCheckboxFilters, setAppliedCheckboxFilters] = useState({ ...checkboxFilters });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [AddLostModal, setAddLostModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [permissions, setPermissions] = useState({
    canViewStock: false,
  });

  const navigate = useNavigate();

  // Permission helper functions
  const getCurrentUserRole = (): string => {
    return localStorage.getItem('role') || '';
  };

  const fetchUserPermissions = async (): Promise<any | null> => {
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

    const tab = permissions.permission_tab.find((t: any) => t.tab_name === tabName);
    if (!tab) return false;

    const func = tab.tab_function.find((f: any) => f.tab_functionName === functionName);
    return func?.is_showFunction || false;
  };

  useEffect(() => {
    const initializeComponent = async () => {
      const canView = await checkPermission('View Stock', 'View');

      setPermissions({
        canViewStock: canView,
      });

      if (canView) {
        fetchLocations();
        fetchProducts();
      } else {
        toast.error("You don't have permission to view stock", {
          toastId: "no-permission-view-stock",
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
        navigate('/');
      }
    };

    initializeComponent();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await getAllLocation();
      const locations = response.data.data || response.data || [];
      const locationOptions = locations.map((location: any) => ({
        value: location.id,
        label: location.name,
      }));
      setLocationOptions(locationOptions);
    } catch (error) {
      console.error("Error fetching locations:", error);
      setLocationOptions([]);
    }
  };

  const fetchProducts = async () => {
    if (!permissions.canViewStock) return;

    try {
      setLoading(true);
      const filters: any = {};
      if (selectedSort?.value) filters.sort = selectedSort.value;
      if (selectedLocation?.value) {
        filters.inventory_location = selectedLocation.value;
      }
      if (appliedSearchTerm.trim()) filters.search = appliedSearchTerm.trim();

      const requestPayload = {
        page: currentPage,
        limit: itemsPerPage,
        filters: Object.keys(filters).length > 0 ? filters : {}
      };

      const response = await getAllProductByPageLimit(requestPayload);
      const products = response.data.data.data || response.data || [];
      setProductData(products);

      const totalCount = response.data.data.total;
      if (typeof totalCount === "number") {
        setTotalItems(totalCount); 
        setTotalPages(Math.ceil(totalCount / itemsPerPage));
      } else {
        setTotalItems(products.length); 
        if (products.length === itemsPerPage) {
          setTotalPages(Math.max(totalPages, currentPage + 1));
        } else if (products.length < itemsPerPage && currentPage === 1) {
          setTotalPages(1);
        } else if (products.length < itemsPerPage) {
          setTotalPages(currentPage);
        }
      }
    } catch (error) {
      setProductData([]);
      setTotalPages(1);
      setTotalItems(0); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (permissions.canViewStock) {
      fetchProducts();
    }
  }, [currentPage, selectedLocation, selectedSort, permissions.canViewStock]);

  const handleAdvancedSearch = async (advancedFilters: any) => {
    if (!permissions.canViewStock) return;

    try {
      setLoading(true);
      setCurrentPage(1);

      const requestPayload = {
        page: 1,
        limit: itemsPerPage,
        filters: {
          ...advancedFilters,
          search: appliedSearchTerm.trim(),
          inventory_location: selectedLocation?.value,
          sort: selectedSort?.value
        }
      };

      const response = await getAllProductByPageLimit(requestPayload);
      const products = response.data.data.data || [];
      setProductData(products);

      const totalCountFromAPI = response.data.data.total;
      setTotalItems(totalCountFromAPI || 0);
      setTotalPages(Math.ceil((totalCountFromAPI || 0) / itemsPerPage));
    } catch (error) {
      console.error("Advanced search failed:", error);
      setProductData([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = async () => {
    if (!permissions.canViewStock) return;

    setLoading(true);
    setSearchTerm("");
    setAppliedSearchTerm("");
    setSelectedLocation(null);
    setSelectedSort(sortByTime[0]);
    setCheckboxFilters({
      distributorPrice: false,
      retailPrice: false,
      qtyInStock: false,
      qtyInProduce: false,
      qtyOnTheWay: false,
      rackNumber: false,
      outOfStock: false
    });
    setAppliedCheckboxFilters({
      distributorPrice: false,
      retailPrice: false,
      qtyInStock: false,
      qtyInProduce: false,
      qtyOnTheWay: false,
      rackNumber: false,
      outOfStock: false
    });
    setCurrentPage(1);

    await fetchProducts();
    setLoading(false);
  };

  const handlePageChange = (_: any, page: number) => setCurrentPage(page);

  const handleSubmitLostSales = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (!selectedProduct) return;
    const payload = {
      user_id: localStorage.getItem("Sql_id"),
      product_id: selectedProduct.id,
      pn: selectedProduct.parts_no || "",
      qty: parseInt(formData.get("qty") as string, 10),
      askfrom: formData.get("askfrom") as string || "",
      out_usage: formData.get("out_usage") as string || ""
    };
    try {
      await addAddLostData(payload);
      setAddLostModal(false);
      e.currentTarget.reset();
    } catch { }
  };

  const toggleableColumns = [
    {
      key: "distributorPrice",
      header: "Distributor Price",
      accessor: (item: any) => item.list_price?.$numberDecimal || "--",
    },
    {
      key: "retailPrice",
      header: "Retail Price",
      accessor: (item: any) => item.sales_price?.$numberDecimal || "--",
    },
    {
      key: "qtyInStock",
      header: "Qty in Stock",
      accessor: (item: any) => item.quantity || "--",
    },
    {
      key: "qtyInProduce",
      header: "Qty in Produce",
      accessor: (item: any) => item.qty_inproduce || "--",
    },
    {
      key: "qtyOnTheWay",
      header: "Qty On The Way",
      accessor: (item: any) => item.qty_ontheway || "--",
    },
    {
      key: "rackNumber",
      header: "Rack#",
      accessor: (item: any) => item.rack || "--",
    },
    {
      key: "outOfStock",
      header: "Qty Out of Stock",
      accessor: (item: any) =>
        (typeof item.outof_stock === "number" && item.outof_stock <= 0)
          ? item.outof_stock
          : "--",
    },
  ];

  const displayedToggleableColumns = toggleableColumns.filter(
    col => appliedCheckboxFilters[col.key as keyof typeof appliedCheckboxFilters]
  );

  const handleSearch = async () => {
    if (!permissions.canViewStock) return;

    setLoading(true);
    setAppliedCheckboxFilters({ ...checkboxFilters });
    setAppliedSearchTerm(searchTerm);
    setCurrentPage(1);
    await fetchProducts();
    setLoading(false);
  };

  return (
    <div className="py-3">
      {loading && (
        <div className="loader-overlay"><div className="loader" /></div>
      )}

      {!permissions.canViewStock ? (
        <div className="text-center py-8 text-red-500">
          {/* You don't have permission to view this page */}
        </div>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white/90">Stock List</h2>
          <Grid container spacing={2} className="items-center">
            <Grid size={{ lg: 4, md: 6, sm: 6 }}>
              <input
                type="text"
                placeholder="Search... "
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="h-10 w-full rounded-lg border bg-white border-gray-200 dark:border-gray-800 dark:bg-white/[0.03] text-gray-800 dark:text-white/90 px-4 py-2 text-sm shadow-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
              />
            </Grid>
            <Grid size={{ lg: 3, md: 6, sm: 6 }}>
              <Select
                options={locationOptions}
                isClearable
                placeholder="Location..."
                value={selectedLocation}
                onChange={option => { 
                  setSelectedLocation(option); 
                  setCurrentPage(1);
                }}
              />
            </Grid>
            <Grid size={{ lg: 3, md: 6, sm: 6 }}>
              <Select
                options={sortByTime}
                isClearable
                placeholder="Sort by latest"
                value={selectedSort}
                onChange={option => {
                  setSelectedSort(option);
                  setCurrentPage(1);
                }}
              />
            </Grid>
            <Grid size={{ lg: 2, md: 6, sm: 6 }} className="flex">
              <Button
                size="sm"
                variant="primary"
                className="ml-4 bg-brand"
                onClick={() => setShowAdvancedSearch(true)}
              >Advanced Search</Button>
              <AdvancedSearch
                open={showAdvancedSearch}
                onClose={() => setShowAdvancedSearch(false)}
                onSearch={handleAdvancedSearch}
              />
            </Grid>
          </Grid>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-2 text-gray-800 lg:p-7 ">
            {[
              ["distributorPrice", "With Distributor Price"],
              ["retailPrice", "With Retail Price"],
              ["qtyInStock", "With Qty in Stock"],
              ["qtyInProduce", "With Qty in Produce"],
              ["qtyOnTheWay", "With Qty On The Way"],
              ["rackNumber", "With Rack#"],
              ["outOfStock", "With Qty Out of Stock"]
            ].map(([key, label]) => (
              <label key={key} className="inline-flex gap-2">
                <input
                  type="checkbox"
                  checked={checkboxFilters[key as keyof typeof checkboxFilters]}
                  onChange={() =>
                    setCheckboxFilters(prev => ({
                      ...prev,
                      [key]: !prev[key as keyof typeof checkboxFilters]
                    }))
                  }
                />
                {label}
              </label>
            ))}
          </div>

          <div className="justify-items-end">
            <div>
              <Button size="sm" variant="outline" className="ml-4" onClick={handleResetFilters}>Reset Filter</Button>
              <Button
                size="sm"
                variant="primary"
                className="ml-4 bg-brand"
                onClick={handleSearch}
              >Search</Button>
            </div>
          </div>

          <div className="relative w-full pt-2">
            <ComponentCard title="Stock List">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="font-medium text-gray-500">Model</TableCell>
                      <TableCell isHeader className=" font-medium text-gray-500">P/N</TableCell>
                      <TableCell isHeader className=" font-medium text-gray-500 ">Image</TableCell>
                      <TableCell isHeader className=" font-medium text-gray-500">Size</TableCell>
                      <TableCell isHeader className=" font-medium text-gray-500">Pressure</TableCell>
                      <TableCell isHeader className=" font-medium text-gray-500">Description</TableCell>
                      <TableCell isHeader className="font-medium text-gray-500">Regular Price</TableCell>
                      <TableCell isHeader className=" font-medium text-gray-500">Lost Sales/Usage</TableCell>
                      <TableCell isHeader className=" font-medium text-gray-500">Location</TableCell>
                      {displayedToggleableColumns.map(col => (
                        <TableCell key={col.key} isHeader className="font-medium text-gray-500">
                          {col.header}
                        </TableCell>
                      ))}
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Action</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productData.length > 0 ? productData.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="px-4 py-3 text-gray-600 ">{item.model || "--"}</TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 ">{item.parts_no || "--"}</TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 ">{item.photo || "--"}</TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 ">{item.sizeData[0]?.name || "--"}</TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 ">{item.pressure_data[0]?.name || "--"}</TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 ">{item.description || "--"}</TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 ">{item.regular_cost?.$numberDecimal || "--"}</TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 ">
                          <div
                            className="border-brand-500 border-1 text-center items-center text-brand-500 hover:bg-brand-500 hover:text-white cursor-pointer rounded-md"
                            onClick={() => { setSelectedProduct(item); setAddLostModal(true); }}
                          >Add Lost</div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 text-start">{item.inventory_location_data?.[0]?.name || "--"}</TableCell>
                        {displayedToggleableColumns.map(col => (
                          <TableCell className="px-4 py-3 text-gray-600 text-start" key={col.key}>
                            {col.accessor(item)}
                          </TableCell>
                        ))}
                        <TableCell className="px-4 py-3 text-gray-600 text-start">
                          <div className="flex gap-2">
                            <Button
                              variant="primary"
                              size="md"
                              onClick={() => navigate(`/products/update/${item._id}`, { state: { from: "viewStock" } })}
                            ><EditIcon size={14} /></Button>
                            <Button
                              variant="outline"
                              size="md"
                              className="text-red-500"
                              onClick={() => navigate(`/managequantity/procedure/${item._id}`,{state:{from:"viewStock"}})}
                            ><VscSymbolMethod size={14} /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell className="text-center py-4 text-gray-500" >
                          No products found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </ComponentCard>
            <div className="flex flex-wrap justify-between items-center mt-4 text-gray-500 dark:text-white">
              <span className="text-sm text-gray-500 block">
                {totalItems > 0
                  ? `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems} entries`
                  : "0 entries"}
              </span>
              <span className="flex justify-end mt-2">
                <Stack spacing={2}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    disabled={loading}
                  />
                </Stack>
              </span>
            </div>
          </div>

          <Modal open={AddLostModal} onClose={() => setAddLostModal(false)}>
            <Box className="fixed inset-0 bg-opacity-50 flex justify-center items-start pt-24 z-50">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl lg:max-w-3xl p-4">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                  <h2 className="text-lg font-semibold">Add out of stock info</h2>
                  <button
                    onClick={() => setAddLostModal(false)}
                    className="text-gray-500 hover:text-black text-2xl"
                  >
                    &times;
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300">
                    <tbody>
                      <tr>
                        <td className="w-1/6 font-medium p-3 border border-gray-300 bg-gray-100">
                          Model
                        </td>
                        <td className="w-1/4 p-3 border border-gray-300">
                          {selectedProduct?.model || "-"}
                        </td>
                        <td className="w-1/6 font-medium p-3 border border-gray-300 bg-gray-100">
                          Size
                        </td>
                        <td className="w-1/4 p-3 border border-gray-300">
                          {selectedProduct?.size_id || "-"}
                        </td>
                      </tr>

                      <tr>
                        <td className="font-medium p-3 border border-gray-300 bg-gray-100">
                          P/N
                        </td>
                        <td className="p-3 border border-gray-300">
                          {selectedProduct?.parts_no || "-"}
                        </td>
                        <td className="font-medium p-3 border border-gray-300 bg-gray-100">
                          Pressure
                        </td>
                        <td className="p-3 border border-gray-300">
                          {selectedProduct?.pressure_data?.[0]?.name || "-"}
                        </td>
                      </tr>

                      <tr>
                        <td className="font-medium p-3 border border-gray-300 bg-gray-100">
                          Description
                        </td>
                        <td className="p-3 border border-gray-300">
                          {selectedProduct?.description || "-"}
                        </td>
                        <td className="font-medium p-3 border border-gray-300 bg-gray-100">
                          QTY in Stock
                        </td>
                        <td className="p-3 border border-gray-300">
                          {selectedProduct?.quantity || "-"}
                        </td>
                      </tr>

                      <tr>
                        <td className="font-medium p-3 border border-gray-300 bg-gray-100">
                          Location
                        </td>
                        <td className="p-3 border border-gray-300">
                          {selectedProduct?.inventory_location_data?.[0]?.name ||
                            "-"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <form id="lostSalesForm" onSubmit={handleSubmitLostSales}>
                  <div className="mb-4 mt-4">
                    <label
                      htmlFor="qty"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Qty <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="qty"
                      id="qty"
                      required
                      placeholder="Enter Out Qty..."
                      className="mt-1 block w-full border rounded px-3 py-2 text-sm border-gray-300"
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="askfrom"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Ask From
                    </label>
                    <input
                      type="text"
                      name="askfrom"
                      id="askfrom"
                      placeholder="Enter Ask From..."
                      className="mt-1 block w-full border rounded px-3 py-2 text-sm border-gray-300"
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="out_usage"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Usage
                    </label>
                    <textarea
                      name="out_usage"
                      id="out_usage"
                      placeholder="Enter Usage..."
                      className="mt-1 block w-full border rounded px-3 py-2 text-sm border-gray-300"
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setAddLostModal(false)}
                      className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand text-white rounded hover:bg-blue-700"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </Box>
          </Modal>
        </>
      )}
    </div>
  );
};