import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
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
import { VscSymbolMethod } from "react-icons/vsc";
import { FaCubes } from "react-icons/fa";
import { IoAdd, IoMenu } from "react-icons/io5";
import { Grid, Pagination, Stack, Menu, MenuItem } from "@mui/material";
import { AdvancedSearch } from "../AdvancedSearch";
import {
  deleteProduct,
  getAllLocation,
  getAllProductByPageLimit,
  getPermissionByRole,
} from "../../../services/apis";
import { Box, Modal } from "@mui/material";
import moment from "moment";
import { toast } from "react-toastify";

interface Option {
  value: string;
  label: string;
}
const sortByTime = [
  { value: "oldest", label: "sort by oldest" },
  { value: "latest", label: "sort by latest" },
];

export const Products = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [locationOptions, setLocationOptions] = useState<Option[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [productData, setProductData] = useState<any[]>([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState<Option | null>(null);
  const itemsPerPage = 20;
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [appliedSearchTerm, setAppliedSearchTerm] = useState<string>("");
  const [selectedSort, setSelectedSort] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Permissions state
  const [permissions, setPermissions] = useState({
    canViewProducts: false,
    canCreateProducts: false,
    canEditProducts: false,
    canDeleteProducts: false,
  });

  // Permission helper functions
  const getCurrentUserRole = (): string => {
    return localStorage.getItem("role") || "";
  };

  const fetchUserPermissions = async (): Promise<any> => {
    const role = getCurrentUserRole();
    if (!role) return null;

    try {
      const response = await getPermissionByRole({ role });
      return response.data?.data || null;
    } catch (error) {
      console.error("Error fetching permissions:", error);
      return null;
    }
  };

  const checkPermission = async (
    tabName: string,
    functionName: string
  ): Promise<boolean> => {
    if (getCurrentUserRole() === "general_manager") return true;

    const permissions = await fetchUserPermissions();
    if (!permissions) return false;

    const tab = permissions.permission_tab.find(
      (t: any) => t.tab_name === tabName
    );
    if (!tab) return false;

    const func = tab.tab_function.find(
      (f: any) => f.tab_functionName === functionName
    );
    return func?.is_showFunction || false;
  };

  useEffect(() => {
    const initializeComponent = async () => {
      const [canView, canCreate, canEdit, canDelete] = await Promise.all([
        checkPermission("Product", "View"),
        checkPermission("Product", "Create"),
        checkPermission("Product", "Update"),
        checkPermission("Product", "Delete"),
      ]);

      setPermissions({
        canViewProducts: canView,
        canCreateProducts: canCreate,
        canEditProducts: canEdit,
        canDeleteProducts: canDelete,
      });

      if (canView) {
        fetchLocations();
        fetchProducts();
      } else {
        toast.error("You don't have permission to view products", {
          toastId: "no-permission-view-products",
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
        navigate("/");
      }
    };

    initializeComponent();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [
    currentPage,
    appliedSearchTerm,
    selectedLocation?.value,
    selectedSort?.value,
  ]);

  const fetchLocations = async () => {
    try {
      const response = await getAllLocation();
      const locations = response.data.data || response.data || [];
      const locationOptions = locations.map((location: any) => ({
        value: location.id || location._id || location.name,
        label: location.name,
      }));
      setLocationOptions(locationOptions);
    } catch (error) {
      console.error("Error fetching locations:", error);
      setLocationOptions([]);
    }
  };

  const fetchProducts = async () => {
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
        filters: Object.keys(filters).length > 0 ? filters : {},
      };

      const response = await getAllProductByPageLimit(requestPayload);

      const products = response.data.data.data || response.data || [];
      setProductData(products);

      const totalCountFromAPI = response.data.data.total;
      if (totalCountFromAPI) {
        setTotalCount(totalCountFromAPI);
        setTotalPages(Math.ceil(totalCountFromAPI / itemsPerPage));
      } else {
        setTotalCount(products.length);
        if (products.length === itemsPerPage) {
          setTotalPages(Math.max(totalPages, currentPage + 1));
        } else if (products.length < itemsPerPage && currentPage === 1) {
          setTotalPages(1);
        } else if (products.length < itemsPerPage) {
          setTotalPages(currentPage);
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProductData([]);
      setTotalPages(1);
      setTotalCount(0);
      toast.error("Failed to fetch products. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setLoading(false);
    }
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
          search: appliedSearchTerm.trim(),
          inventory_location: selectedLocation?.value,
          sort: selectedSort?.value,
        },
      };

      const response = await getAllProductByPageLimit(requestPayload);
      const products = response.data.data.data || [];
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

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setAppliedSearchTerm(searchTerm);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setAppliedSearchTerm("");
    setSelectedLocation(null);
    setSelectedSort(null);
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!deleteId || !permissions.canDeleteProducts) return;

    try {
      const response = await deleteProduct(deleteId);

      if (response.status === 200 || response.status === 204) {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
        fetchProducts();

        toast.success("Product deleted successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete product.", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    }
  };

  if (!permissions.canViewProducts) {
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
        Product Management
      </h2>
      <Grid container spacing={3} className="items-center mb-4">
        <Grid size={{ lg: 3, md: 6, sm: 6 }}>
          <input
            type="text"
            placeholder="Search... "
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="h-10 w-full  rounded-lg border  bg-white border-gray-200 dark:border-gray-800 dark:bg-white/[0.03] text-gray-800 dark:text-white/90 px-4 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
          />
        </Grid>
        <Grid size={{ lg: 3, md: 6, sm: 6 }}>
          <Select
            options={locationOptions}
            isClearable
            placeholder="Location..."
            value={selectedLocation}
            onChange={(value) => {
              setSelectedLocation(value);
              setCurrentPage(1);
            }}
          />
        </Grid>
        <Grid size={{ lg: 3, md: 6, sm: 6 }}>
          <Select
            options={sortByTime}
            isClearable
            placeholder="Select Sort"
            value={selectedSort}
            onChange={(value) => {
              setSelectedSort(value);
              setCurrentPage(1);
            }}
          />
        </Grid>
        <Grid size={{ lg: 2, md: 6, sm: 6 }} className="xl:justify-end flex ">
          <Button
            size="sm"
            variant="primary"
            className="bg-brand text-white text-nowrap flex items-center "
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
      <div className="justify-items-end mb-3">
        <div>
          <Button
            size="sm"
            variant="outline"
            className="ml-4 bg-brand"
            onClick={handleReset}
          >
            Reset Filter
          </Button>

          <Button
            size="sm"
            variant="primary"
            className="ml-4 bg-brand"
            onClick={() => handleSearch()}
          >
            Search
          </Button>
        </div>
      </div>
      <div className="relative w-full">
        {permissions.canCreateProducts && (
          <button
            className="absolute right-0 bg-brand text-white px-3 py-1 mt-3 me-3 rounded flex items-center gap-2"
            onClick={() => navigate("add")}
          >
            <span className="">+</span> Add
          </button>
        )}

        <ComponentCard title="Product List">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
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
                    Brand
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
                    Size
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Image
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Curve
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Weight
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Qty
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Location
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Distributor Price
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Regular Price
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Own By
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Created at
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <TableRow>
                    <TableCell className="text-center py-8 text-gray-500">
                      <div className="flex justify-center items-center">
                        <span className="ml-2">Loading products...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : productData.length > 0 ? (
                  productData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {item.parts_no}
                        <div className="text-blue-500 text-xs mt-1">
                          <button onClick={() => navigate(`/products/addSimilar/${item._id}`)}>
                            Add similar
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {item.brand}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {item.model}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {item.sizeData[0]?.name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {item.photo}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {item.curve_img}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {item.weight}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {item.inventory_location_data[0]?.name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {item.distributorPrice}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {item.regularPrice}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {item.own_by}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {moment(item.created_at).format("DD/MM/YYYY")}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        <div>
                          <button
                            className="cursor-pointer hover:bg-gray-200 transition-colors w-full p-2 rounded flex justify-center items-center"
                            onClick={(event) => {
                              setAnchorEl(event.currentTarget);
                              setSelectedProductId(item._id);
                              setDeleteId(item.id ?? null);
                            }}
                          >
                            <Badge size="sm" color="info">
                              <IoMenu size={14} />
                            </Badge>
                          </button>

                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={() => setAnchorEl(null)}
                            sx={{
                              "& .MuiPaper-root": {
                                boxShadow: "none",
                                border: "1px solid #e0e0e0",
                              },
                            }}
                          >
                            {permissions.canEditProducts && (
                              <MenuItem
                                onClick={() => {
                                  setAnchorEl(null);
                                  if (selectedProductId) {
                                    navigate(
                                      `/products/update/${selectedProductId}`
                                    );
                                  }
                                }}
                              >
                                <Badge size="md" color="info">
                                  <EditIcon size={14} />
                                </Badge>
                                Update
                              </MenuItem>
                            )}

                            <MenuItem
                              onClick={() =>
                                navigate(
                                  `/products/procedure/${selectedProductId}`,
                                  { state: { from: "product" } }
                                )
                              }
                            >
                              <Badge size="sm" color="error">
                                <VscSymbolMethod size={14} />
                              </Badge>
                              Procedure
                            </MenuItem>
                            <MenuItem
                              onClick={() =>
                                navigate(
                                  `/products/stockManagement/${selectedProductId}`
                                )
                              }
                            >
                              <Badge size="sm" color="success">
                                <FaCubes size={14} />
                              </Badge>
                              Stock Management
                            </MenuItem>
                            {permissions.canCreateProducts && (
                              <MenuItem
                                onClick={() => navigate("/products/add")}
                              >
                                <Badge size="sm" color="info">
                                  <IoAdd size={14} />
                                </Badge>
                                Add
                              </MenuItem>
                            )}
                            {permissions.canDeleteProducts && (
                              <MenuItem
                                onClick={() => {
                                  setIsDeleteModalOpen(true);
                                  setAnchorEl(null);
                                }}
                              >
                                <Badge size="sm" color="warning">
                                  <Trash2Icon size={14} />
                                </Badge>
                                Delete
                              </MenuItem>
                            )}
                          </Menu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="text-center py-8 text-gray-500">
                      No products found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </ComponentCard>
        <div className="flex flex-wrap justify-between items-center mt-4">
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
      <Modal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteId(null);
        }}
      >
        <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete this product?</p>
            <div className="flex justify-end mt-4">
              <button
                className="text-gray-600 hover:text-gray-900 mr-4"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteId(null);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                onClick={handleDelete}
                disabled={!permissions.canDeleteProducts || loading}
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
