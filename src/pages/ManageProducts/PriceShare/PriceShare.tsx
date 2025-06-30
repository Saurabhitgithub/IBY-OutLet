import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { EditIcon } from "lucide-react";
import Button from "../../../components/ui/button/Button";
import ComponentCard from "../../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { Grid, Pagination, Stack } from "@mui/material";
import { AdvancedSearch } from "../AdvancedSearch";
import { getAllProductByPageLimit, getAllLocation, getPermissionByRole } from "../../../services/apis";
import { toast } from "react-toastify";

const sortByTime = [
  { value: "oldest", label: "sort by oldest" },
  { value: "latest", label: "sort by latest" },
];

export const PriceShare = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedSort, setSelectedSort] = useState<any>(null);
  const [productData, setProductData] = useState<any[]>([]);
  const [locationOptions, setLocationOptions] = useState<any[]>([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [appliedSearchTerm, setAppliedSearchTerm] = useState<string>("");
  const [permissions, setPermissions] = useState({
    canViewPriceShare: false,
  });

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
      const canView = await checkPermission('Price Share', 'View');

      setPermissions({
        canViewPriceShare: canView,
      });

      if (canView) {
        fetchLocations();
        fetchProducts();
      } else {
        toast.error("You don't have permission to view price share", {
          toastId: "no-permission-view-price-share",
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
        navigate('/');
      }
    };

    initializeComponent();
  }, []);

  const fetchProducts = async () => {
    if (!permissions.canViewPriceShare) return;

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
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    if (permissions.canViewPriceShare) {
      fetchProducts();
    }
  }, [currentPage, appliedSearchTerm, selectedLocation, selectedSort, permissions.canViewPriceShare]);

  const handleAdvancedSearch = async (advancedFilters: any) => {
    if (!permissions.canViewPriceShare) return;

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

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setAppliedSearchTerm(searchTerm);
  };

  const handleReset = () => {
    setSearchTerm("");
    setAppliedSearchTerm("");
    setSelectedLocation(null);
    setSelectedSort(null);
    setCurrentPage(1);
    setTotalCount(0);
  };

  return (
    <div className="overflow-x-visible">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}

      {!permissions.canViewPriceShare ? (
        <div className="text-center py-8 text-red-500">
          {/* You don't have permission to view this page */}
        </div>
      ) : (
        <>
          <h2 className="font-bold mb-4 text-gray-800 dark:text-white/90">Price Share</h2>
          <Grid container spacing={3} className="items-center mb-4">
            <Grid size={{ lg: 4, md: 6, sm: 6 }}>
              <input
                type="text"
                placeholder="Search... "
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-lg border bg-white border-gray-200 dark:border-gray-800 dark:bg-white/[0.03] text-gray-800 dark:text-white/90 px-4 py-2 text-sm shadow-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
              />
            </Grid>

            <Grid size={{ lg: 3, md: 6, sm: 6 }}>
              <Select
                options={locationOptions}
                isClearable
                placeholder="Location..."
                value={selectedLocation}
                onChange={setSelectedLocation}
              />
            </Grid>
            <Grid size={{ lg: 3, md: 6, sm: 6 }}>
              <Select
                options={sortByTime}
                isClearable
                placeholder="Sort by latest"
                value={selectedSort}
                onChange={setSelectedSort}
              />
            </Grid>
            <Grid size={{ lg: 2, md: 6, sm: 6 }} className="justify-start flex">
              <Button
                size="sm"
                variant="primary"
                className="ml-4 text-nowrap bg-brand"
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

          <div className="justify-items-end">
            <div>
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
                onClick={handleSearch}
              >
                Search
              </Button>
            </div>
          </div>
          <span className="text-sm text-gray-500 dark:text-white mb-3">
            {productData.length === 0
              ? "0 entries"
              : `Showing 1 to ${productData.length} of ${totalCount} entries`}
          </span>

          <div className="relative w-full">
            <ComponentCard title="Product List">
              <div className="overflow-x-auto lg:overflow-x-visible">
                <Table>
                  <TableHeader>
                    <TableRow className="text-gray-500">
                      <TableCell isHeader>Image</TableCell>
                      <TableCell isHeader>P/N</TableCell>
                      <TableCell isHeader>Size</TableCell>
                      <TableCell isHeader>Pressure</TableCell>
                      <TableCell isHeader>Model</TableCell>
                      <TableCell isHeader>Material</TableCell>
                      <TableCell isHeader>Retail Price</TableCell>
                      <TableCell isHeader>Regular Price</TableCell>
                      <TableCell isHeader>Distributor USD</TableCell>
                      <TableCell isHeader>Location</TableCell>
                      <TableCell isHeader>Distributor CAD(=x Rate)</TableCell>
                      <TableCell isHeader>Updated By</TableCell>
                      <TableCell isHeader>Stock</TableCell>
                      <TableCell isHeader>Kgs</TableCell>
                      <TableCell isHeader>Action</TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {productData.length > 0 ? (
                      productData.map((item, index) => (
                        <TableRow key={index} className="text-gray-600 py-3">
                          <TableCell>{item.photo}</TableCell>
                          <TableCell>{item.parts_no}</TableCell>
                          <TableCell>{item.sizeData?.[0]?.name}</TableCell>
                          <TableCell>{item?.pressure_data[0]?.name}</TableCell>
                          <TableCell>{item.model}</TableCell>
                          <TableCell>{item.materialData?.[0]?.name || "--"}</TableCell>
                          <TableCell>{item.list_price?.$numberDecimal}</TableCell>
                          <TableCell>{item.regular_cost?.$numberDecimal}</TableCell>
                          <TableCell>{item.sales_price?.$numberDecimal}</TableCell>
                          <TableCell>{item.inventory_location_data?.[0]?.name}</TableCell>
                          <TableCell>{item.distributorCAD}</TableCell>
                          <TableCell>{item.updatedBy}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.weight}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="primary" size="sm" onClick={() => navigate(`/products/update/${item._id}`, { state: { from: "priceshare" } })}>
                                <EditIcon size={14} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell className="text-center text-gray-500">No results found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </ComponentCard>
            <div className="flex flex-wrap justify-between items-center mt-4 text-gray-500 dark:text-white">
              <span className="text-sm">
                Showing 1 to {productData.length} of {totalCount} entries
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
        </>
      )}
    </div>
  );
};