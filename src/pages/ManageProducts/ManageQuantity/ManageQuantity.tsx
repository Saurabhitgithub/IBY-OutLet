import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { EditIcon } from "lucide-react";
import Button from "../../../components/ui/button/Button";
import ComponentCard from "../../../components/common/ComponentCard";
// @ts-ignore
import { htmlToText } from "html-to-text";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { VscSymbolMethod } from "react-icons/vsc";
import { Box, Modal, Pagination, Stack } from "@mui/material";
import { Grid } from "@mui/material";
import { AdvancedSearch } from "../AdvancedSearch";
import {
  addAddLostData,
  addPdHistoryCheck,
  getAllLocation,
  getAllManageProductByPageLimit,
  getAllProductByPageLimit,
  getManageProductCount,
  getPermissionByRole,
} from "../../../services/apis";
import { toast } from "react-toastify";

const sortByTime = [
  { value: "Sort by latest", label: "Sort by latest" },
  { value: "Sort by oldest", label: "Sort by oldest" },
];

export const ManageQuantity = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [productData, setProductData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCheckQtyOpen, setIsCheckQtyOpen] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [location, setLocation] = useState<string>("");
  const [locationOptions, setLocationOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const [AddLostModal, setAddLostModal] = useState(false);

  const [totalCount, setTotalCount] = useState(0);
  const [timeSort, setTimeSort] = useState<{
    value: string;
    label: string;
  } | null>(null);
  // for advanced search modal
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [appliedSearchTerm, setAppliedSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSort, setSelectedSort] = useState<any>(null);
  const itemsPerPage = 20;
  // @ts-ignore
  const [selectedLocation, setSelectedLocation] = useState<Option | null>(null);

  // Permissions state
  const [permissions, setPermissions] = useState({
    canViewManageQuantity: false,
    canUpdateManageQuantity: false,
  });

  // Permission helper functions
  const getCurrentUserRole = (): string => {
    return localStorage.getItem('role') || '';
  };

  const fetchUserPermissions = async (): Promise<any> => {
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
      const [
        canView,
        canUpdate,
      ] = await Promise.all([
        checkPermission('Quantity', 'View'),
        checkPermission('Quantity', 'Update'),
      ]);

      setPermissions({
        canViewManageQuantity: canView,
        canUpdateManageQuantity: canUpdate,
      });

      if (!canView) {
        toast.error("You don't have permission to view manage quantity", {
        toastId: "no-permission-update-manage-quantity",
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
        navigate('/');
      } else {
        fetchAllLocation();
        fetchProductCount();
        fetchManageProducts();
      }
    };

    initializeComponent();
  }, []);

  const handleSubmitLostSales = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!permissions.canUpdateManageQuantity) {
      toast.error("You don't have permission to update manage quantity", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
      return;
    }

    setLoading(true);
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const qty = formData.get("qty");
    const askfrom = formData.get("askfrom");
    const out_usage = formData.get("out_usage");

    if (!selectedProduct) return;
    const userId = localStorage.getItem("Sql_id");

    const payload = {
      user_id: userId,
      product_id: selectedProduct.id,
      pn: selectedProduct.parts_no || "",
      qty: parseInt(qty as string, 10),
      askfrom: (askfrom as string) || "",
      out_usage: (out_usage as string) || "",
    };

    try {
      const response = await addAddLostData(payload);
      console.log("Submitted:", response.data);
      setAddLostModal(false);
      form.reset();
        toast.success("Quantity updated successfully", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } catch (error) {
      console.error("Error submitting:", error);
    }
    setLoading(false);
  };

  const handleSubmitCheckStock = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    if (!permissions.canUpdateManageQuantity) {
      toast.error("You don't have permission to update manage quantity", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
      return;
    }

    setLoading(true);
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const qty = formData.get("qty");

    if (!selectedCheck) return;
    const userId = localStorage.getItem("Sql_id");

    const payload = {
      user_id: userId,
      product_id: selectedCheck.id,
      phy_qty: selectedCheck.physical_qty,
      stock_qty: parseInt(qty as string, 10),
    };

    try {
      const response = await addPdHistoryCheck(payload);
      console.log("Submitted:", response.data);
      setIsCheckQtyOpen(false);
      form.reset();
      toast.success("Quantity updated successfully", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999999999999, marginTop: "4rem" },
      });
    } catch (error) {
      console.error("Error submitting:", error);
    }
    setLoading(false);
  };

  const fetchAllLocation = async () => {
    try {
      const response = await getAllLocation();
      const rawLocations = response.data?.data;

      if (!Array.isArray(rawLocations)) {
        console.error("Location data is not an array:", rawLocations);
        return;
      }

      const formattedLocations = rawLocations.map((loc: any) => ({
        value: loc.id,
        label: loc.name,
      }));
      console.log("Location options:", formattedLocations);
      setLocationOptions(formattedLocations);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const fetchProductCount = async () => {
    try {
      const response = await getManageProductCount();
      setTotalCount(response.data.count);
      console.log(response);
    } catch (error) {
      console.error("Error fetching product count:", error);
    }
  };

  const navigate = useNavigate();

  const fetchManageProducts = async () => {
    setLoading(true);
    try {
      const filters: any = {};

      if (location) {
        filters.inventory_location = location;
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }

      if (timeSort?.value === "Sort by latest") {
        filters.sort = "latest";
      } else if (timeSort?.value === "Sort by oldest") {
        filters.sort = "oldest";
      }

      const response = await getAllManageProductByPageLimit(
        page,
        limit,
        filters
      );

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

  useEffect(() => {
    if (permissions.canViewManageQuantity) {
      fetchManageProducts();
    }
  }, [page, limit, location, searchTerm, timeSort]);

  const filteredData = Array.isArray(productData)
    ? productData.filter((item) => {
        const search = searchTerm.toLowerCase();
        return (
          item.parts_no?.toLowerCase().includes(search) ||
          item.model?.toLowerCase().includes(search) ||
          item.inventory_location_data?.[0]?.name
            ?.toLowerCase()
            .includes(search)
        );
      })
    : [];

  const handleResetFilters = () => {
    setSearchTerm("");
    setLocation("");
    setTimeSort(null);
    setPage(1);
  };

  const handleAdvancedSearch = async (advancedFilters: any) => {
    try {
      setLoading(true);
      setCurrentPage(1);

      const requestPayload = {
        page: 1,
        limit: itemsPerPage,
        filters: {
          ...advancedFilters,
        },
      };
      console.log("Advanced filters received:", advancedFilters);
      console.log("Final API payload:", requestPayload);

      const response = await getAllProductByPageLimit(requestPayload);
      const products = response.data.data.data || [];
      console.log("API response:", response);
      console.log("Products received:", products);
      setProductData(products);

      const totalCountFromAPI = response.data.data.total;
      setTotalCount(totalCountFromAPI || 0);
      setTotalPages(Math.ceil((totalCountFromAPI || 0) / itemsPerPage));
    } catch (error) {
      console.error("Advanced search failed:", error);
      setProductData([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  if (!permissions.canViewManageQuantity) {
    return (
      <div className="text-center py-8 text-red-500">
        {/* You don't have permission to view this page */}
      </div>
    );
  }

  return (
    <div className="py-3">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}

      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white/90">
        Manage Quantity
      </h2>

      <Grid container spacing={3} className="items-center mb-4">
        <Grid size={{ lg: 4, md: 6, sm: 6 }}>
          <input
            type="text"
            placeholder="Search... "
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 w-full  rounded-lg border  bg-white border-gray-200 dark:border-gray-800 dark:bg-white/[0.03] text-gray-800 dark:text-white/90 px-4 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
          />
        </Grid>

        <Grid size={{ lg: 3, md: 6, sm: 6 }}>
          <Select
            options={locationOptions}
            isClearable
            placeholder="Location..."
            value={
              locationOptions.find((opt) => opt.value === location) || null
            }
            onChange={(option) => setLocation(option?.value || "")}
          />
        </Grid>
        <Grid size={{ lg: 3, md: 6, sm: 6 }}>
          <Select
            options={sortByTime}
            isClearable
            placeholder="Sort by latest"
            value={timeSort}
            onChange={(option) => setTimeSort(option)}
          />
        </Grid>
        <Grid size={{ lg: 2, md: 6, sm: 6 }} className="xl:justify-end flex">
          <Button
            size="sm"
            variant="primary"
            className="ml-4 bg-brand"
            onClick={() => setShowAdvancedSearch(true)}
          >
            Advanced Search
          </Button>
          <AdvancedSearch
            open={showAdvancedSearch}
            onClose={() => setShowAdvancedSearch(false)}
            onSearch={handleAdvancedSearch}
          />
        </Grid>
      </Grid>

      <div className=" justify-items-end mb-2">
        <div>
          <Button
            size="sm"
            variant="outline"
            className="ml-4"
            onClick={handleResetFilters}
          >
            Reset Filter
          </Button>
          <Button size="sm" variant="primary" className="ml-4 bg-brand">
            Search
          </Button>
        </div>
      </div>

      <div className="relative w-full text-gray-500">
        <ComponentCard title="Product List">
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader>Image</TableCell>
                  <TableCell isHeader>P/N</TableCell>
                  <TableCell isHeader>Model/Sold History</TableCell>
                  <TableCell isHeader>Rack</TableCell>
                  <TableCell isHeader>City/Stock History</TableCell>
                  <TableCell isHeader>Total sold</TableCell>
                  <TableCell isHeader>Min. Qty</TableCell>
                  <TableCell isHeader>Max. Qty</TableCell>
                  <TableCell isHeader>Qty In Producing</TableCell>
                  <TableCell isHeader>Qty On The Way</TableCell>
                  <TableCell isHeader>Qty In Stock</TableCell>
                  <TableCell isHeader>Lost of sales/Usage</TableCell>
                  <TableCell isHeader>Physical Qty</TableCell>
                  <TableCell isHeader>Action</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <img
                          src={item.photo_url || "/public/blank-file-image.png"}
                          alt="Product"
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                          }}
                        />
                      </TableCell>

                      <TableCell>{item.parts_no || "-"}</TableCell>

                      <TableCell>{item.model || "-"}</TableCell>

                      <TableCell> {htmlToText(item.rack) || "-"}</TableCell>

                      <TableCell>
                        {" "}
                        {item.inventory_location_data?.[0]?.name || "-"}
                      </TableCell>

                      <TableCell>{item.total_sold || "-"}</TableCell>

                      <TableCell>{item.min_qty || "-"}</TableCell>

                      <TableCell>{item.max_qty || "-"}</TableCell>

                      <TableCell>{item.qty_inproduce || "-"}</TableCell>

                      <TableCell>{item.qty_ontheway || "-"}</TableCell>

                      <TableCell>{item.quantity || "-"}</TableCell>

                      <TableCell>
                        {item.lostOfSales || "-"}

                        <span
                          className="addLost_button"
                          onClick={() =>
                            navigate(
                              `/managequantity/viewStockList/${item.id}`,
                              {
                                state: { productDetails: item },
                              }
                            )
                          }
                        >
                          View
                        </span>

                        {permissions.canUpdateManageQuantity && (
                          <span
                            onClick={() => {
                              setSelectedProduct(item);
                              setAddLostModal(true);
                            }}
                            className="addLost_button"
                          >
                            Add Lost
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        {item.physical_qty || "-"}

                        <span
                          className="addLost_button"
                          onClick={() =>
                            navigate(
                              `/managequantity/stockHistory/${item.id}`,
                              {
                                state: { productDetails: item },
                              }
                            )
                          }
                        >
                          History
                        </span>

                        {permissions.canUpdateManageQuantity && (
                          <span
                            className="addLost_button"
                            onClick={() => {
                              setIsCheckQtyOpen(true);
                              setSelectedCheck(item);
                            }}
                          >
                            Check
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex gap-2">
                          {permissions.canUpdateManageQuantity && (
                            <Button
                              variant="primary"
                              size="xs"
                              onClick={() =>
                                navigate(
                                  `/managequantity/updatequantity/${item._id}`
                                )
                              }
                            >
                              <EditIcon size={12} />
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="xs"
                            className="text-red-500"
                            onClick={() =>
                              navigate(`/managequantity/procedure/${item._id}`)
                            }
                          >
                            <VscSymbolMethod size={12} />
                          </Button>
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
          <span className="text-sm">
            {totalCount > 0 ? (
              <>
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, totalCount)} of{" "}
                {totalCount} entries
              </>
            ) : (
              <>No entries found</>
            )}
          </span>

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

      {/* add lost modal  */}
      {permissions.canUpdateManageQuantity && (
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
      )}

      {/* Check Quantity Modal */}
      {permissions.canUpdateManageQuantity && (
        <Modal open={isCheckQtyOpen} onClose={() => setIsCheckQtyOpen(false)}>
          <Box className="fixed inset-0 bg-opacity-50 flex justify-center items-start pt-24 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-4">
              <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h2 className="text-lg font-semibold">Add out of stock info</h2>
                <button
                  onClick={() => setIsCheckQtyOpen(false)}
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
                        {selectedCheck?.model || "-"}
                      </td>
                    </tr>

                    <tr>
                      <td className="font-medium p-3 border border-gray-300 bg-gray-100">
                        P/N
                      </td>
                      <td className="p-3 border border-gray-300">
                        {selectedCheck?.parts_no || "-"}
                      </td>
                    </tr>

                    <tr>
                      <td className="font-medium p-3 border border-gray-300 bg-gray-100">
                        Location
                      </td>
                      <td className="p-3 border border-gray-300">
                        {selectedCheck?.inventory_location_data?.[0]?.name || "-"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <form id="lostSalesForm" onSubmit={handleSubmitCheckStock}>
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

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsCheckQtyOpen(false)}
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
      )}
    </div>
  );
};