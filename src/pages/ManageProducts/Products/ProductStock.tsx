import { EditIcon, Trash2Icon } from "lucide-react";
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
import { useNavigate, useParams } from "react-router";
import { Box, Modal } from "@mui/material";
import { useEffect, useState } from "react";
import {
  deleteStock,
  getAllstockByproductid,
  getProductById,
  getPermissionByRole,
} from "../../../services/apis";
import { toast } from "react-toastify";
import moment from "moment";

const backInfo = { title: "Products", path: "/products" };

export const ProductStock = () => {
  const navigate = useNavigate();
  const { pid, id } = useParams();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productData, setProductData] = useState<any>(null);
  const [stockData, setStockData] = useState<any[]>([]);
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sqlId, setSqlId] = useState<string | undefined>();
  const [stockID, setStockID] = useState<string | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [permissions, setPermissions] = useState({
    canViewProductStock: false,
    canCreateProductStock: false,
    canUpdateProductStock: false,
    canDeleteProductStock: false,
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
      const [
        canView,
        canCreate,
        canUpdate,
        canDelete,
      ] = await Promise.all([
        checkPermission('Stock', 'View'),
        checkPermission('Stock', 'Create'),
        checkPermission('Stock', 'Update'),
        checkPermission('Stock', 'Delete'),
      ]);

      setPermissions({
        canViewProductStock: canView,
        canCreateProductStock: canCreate,
        canUpdateProductStock: canUpdate,
        canDeleteProductStock: canDelete,
      });

      if (canView && id) {
        fetchStock(id);
      } else {
        toast.error("You don't have permission to view product stock", {
          toastId: "no-permission-view-product-stock",
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
        navigate('/products');
      }
    };

    initializeComponent();
  }, [id]);

  const fetchStock = async (id: string) => {
    try {
      const res = await getProductById(id);
      const data = res?.data?.data;
      setSqlId(data[0].id);

      if (Array.isArray(data) && data.length > 0) {
        setProductData({
          productNo: data[0]?.parts_no,
          Model: data[0]?.model,
          city: data[0]?.inventory_location_data?.[0]?.name,
        });
        setStockData(data[0]?.stocks ?? []);
      } else if (data && typeof data === "object") {
        setProductData({
          productNo: data.parts_no,
          Model: data.model,
          city: data.inventory_location_data?.[0]?.name,
        });
        setStockData(data?.stocks ?? []);
      }
    } catch (error) {
      console.error("Error fetching stock:", error);
      toast.error("Failed to fetch product data", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    }
  };

  useEffect(() => {
    if (!sqlId || !permissions.canViewProductStock) return;
    fetchInventoryData(sqlId);
  }, [sqlId, permissions.canViewProductStock]);

  const fetchInventoryData = async (sqlId: string) => {
    setLoading(true);
    try {
      const response = await getAllstockByproductid(sqlId);
      setInventoryData(response?.data?.data ?? []);
      setStockID(response?.data?.data[0]?._id);
    } catch (error) {
      console.error("Error fetching inventory data", error);
      toast.error("Failed to fetch inventory data", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (stockId: string) => {
    if (!permissions.canDeleteProductStock) {
      toast.error("You don't have permission to delete product stock", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
      return;
    }
    setDeleteId(stockId);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!permissions.canDeleteProductStock) {
      toast.error("You don't have permission to delete product stock", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
      setIsDeleteModalOpen(false);
      return;
    }

    if (!deleteId) return;

    setLoading(true);
    try {
      const response = await deleteStock(deleteId);

      if (response.status === 200 || response.status === 204) {
        toast.success("Stock deleted successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
        // Refresh the inventory data after deletion
        if (sqlId) {
          await fetchInventoryData(sqlId);
        }
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete stock", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setLoading(false);
      setIsDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  const handleAddClick = () => {
    if (!permissions.canCreateProductStock) {
      toast.error("You don't have permission to create product stock", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
      return;
    }
    navigate(`/products/stockManagement/add/${id}`);
  };

  const handleEditClick = (item: any) => {
    if (!permissions.canUpdateProductStock) {
      toast.error("You don't have permission to update product stock", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
      return;
    }
    navigate(`/products/stockManagement/update/${id}/${item?._id}/${item?.id}`);
  };

  return (
    <div className="text-gray-800 dark:text-white/90 space-y-7">
      <PageBreadcrumb
        pageTitle={"Product Stock Management"}
        backInfo={backInfo}
      />

      {!permissions.canViewProductStock ? (
        <div className="text-center py-8 text-red-500">
          {/* You don't have permission to view this page */}
        </div>
      ) : (
        <>
          {/* Product Info Section */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
              <div className="space-y-6 text-gray-800 dark:text-white/90">
                <div className="flex space-x-2">
                  <h3>Product Model:</h3>
                  <p className="font-light">{productData?.Model ?? "N/A"}</p>
                </div>
                <div className="flex space-x-2">
                  <h3>PN:</h3>
                  <p className="font-light">{productData?.productNo ?? "N/A"}</p>
                </div>
                <div className="flex space-x-2">
                  <h3>Location:</h3>
                  <p className="font-light">{productData?.city ?? "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stock List Section */}
          <span>
            Showing 0 to {inventoryData.length} of {inventoryData.length} entries
          </span>

          <div className="relative w-full">
            {permissions.canCreateProductStock && (
              <button
                className="absolute right-0 bg-brand text-white px-3 py-1 mt-3 me-3 rounded flex items-center gap-2"
                onClick={handleAddClick}
              >
                <span className="text-lg">+</span> Add
              </button>
            )}

            <ComponentCard title="Stock List ">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] text-gray-500">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-start">
                      #
                    </TableCell>
                    <TableCell isHeader className="px-7 py-3 text-start">
                      Input Qty
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start">
                      Input Date
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start">
                      Input User
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start">
                      Created At
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {inventoryData.length > 0 ? (
                    inventoryData.map((item, index) => (
                      <TableRow key={item?.id ?? index}>
                        <TableCell className="px-4 py-3 text-start">
                          {index + 1}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          {item?.quality ?? "N/A"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          {moment(item?.input_date).toISOString().split('T')[0]}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          {item?.user_id ?? "N/A"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          {item?.created_at ?? "N/A"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          <div className="flex gap-2">
                            {permissions.canUpdateProductStock && (
                              <div
                                className="cursor-pointer"
                                onClick={() => handleEditClick(item)}
                              >
                                <Badge size="sm" color="success">
                                  <EditIcon size={14} />
                                </Badge>
                              </div>
                            )}
                            {permissions.canDeleteProductStock && (
                              <div
                                className="cursor-pointer transition-colors"
                                onClick={() => handleDeleteClick(item?.id)}
                              >
                                <Badge size="sm" color="warning">
                                  <Trash2Icon size={14} />
                                </Badge>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <td colSpan={6} className="text-center py-4 text-gray-500">
                        {loading && (
                          <div className="loader-overlay">
                            <div className="loader"></div>
                          </div>
                        )}
                      </td>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ComponentCard>
          </div>

          {/* Delete Confirmation Modal */}
          <Modal
            open={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-description"
          >
            <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-lg font-semibold mb-4" id="delete-modal-title">
                  Confirm Deletion
                </h2>
                <p id="delete-modal-description">
                  Are you sure you want to delete this stock entry?
                </p>
                <div className="flex justify-end mt-4 space-x-3">
                  <button
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    {loading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </Box>
          </Modal>
        </>
      )}
    </div>
  );
};