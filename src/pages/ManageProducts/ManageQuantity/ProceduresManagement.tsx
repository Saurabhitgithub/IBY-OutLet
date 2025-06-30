import { useNavigate, useParams, useLocation } from "react-router-dom";
import { EditIcon } from "lucide-react";
import ComponentCard from "../../../components/common/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import Badge from "../../../components/ui/badge/Badge";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { useEffect, useState } from "react";
import {
  getAllProcedures,
  getManageProductsById,
  getPermissionByRole,
} from "../../../services/apis";
import { toast } from "react-toastify";

interface Procedure {
  _id: string;
  id: number;
  user_id: number;
  product_id: number;
  produce_qty: number;
  delivery_date: string;
  ontheway_qty: number;
  instock_qty: number;
  instock_date: string;
  notes: string;
  status: number;
  arrive_date?: string;
  container?: string;
  inventory_location_data?: Array<{
    name: string;
  }>;
  double_check?: boolean;
  edited_by: number;
  created_at: string;
  updated_at: string;
  __v: number;
}

interface Permission {
  tab_name: string;
  is_show: boolean;
  tab_function: {
    tab_functionName: string;
    is_showFunction: boolean;
    _id: string;
  }[];
}

interface RolePermissions {
  _id: string;
  permission_tab: Permission[];
  role: string;
  [key: string]: any;
}

const statusMap: { [key: number]: string } = {
  0: "In Producing",
  1: "On the Way",
  2: "In Stock",
};

// Date formatting utility function
const formatDate = (dateString?: string): string => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "-" : date.toISOString().split('T')[0];
  } catch (e) {
    console.error("Invalid date format:", dateString);
    return "-";
  }
};

export const ProceduresManagement = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState({
    canViewProcedures: false,
    canCreateProcedures: false,
    canEditProcedures: false,
    canDeleteProcedures: false,
    canVerifyArrival: false,
    canDoubleCheck: false,
  });

  const getCurrentUserRole = (): string => {
    return localStorage.getItem('role') || '';
  };

  const fetchUserPermissions = async (): Promise<RolePermissions | null> => {
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

    const tab = permissions.permission_tab.find(t => t.tab_name === tabName);
    if (!tab) return false;

    const func = tab.tab_function.find(f => f.tab_functionName === functionName);
    return func?.is_showFunction || false;
  };

  useEffect(() => {
    const initializeComponent = async () => {
      const [
        canView,
        canCreate,
        canEdit,
        canDelete,
        canVerify,
        canDoubleCheck,
      ] = await Promise.all([
        checkPermission('Procedure', 'View'),
        checkPermission('Procedure', 'Create'),
        checkPermission('Procedure', 'Update'),
        checkPermission('Procedure', 'Delete'),
        checkPermission('Procedure', 'Verify Arrival'),
        checkPermission('Procedure', 'Double Check'),
      ]);

      setPermissions({
        canViewProcedures: canView,
        canCreateProcedures: canCreate,
        canEditProcedures: canEdit,
        canDeleteProcedures: canDelete,
        canVerifyArrival: canVerify,
        canDoubleCheck: canDoubleCheck,
      });

      if (canView && id) {
        fetchData();
      } else {
        toast.error("You don't have permission to view procedures", {
          toastId: "no-permission-view-procedures",
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
        navigate('/');
      }
    };

    initializeComponent();
  }, [id, navigate]);

  const fetchData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const productRes = await getManageProductsById(id);
      
      let loadedProductData;
      if (Array.isArray(productRes.data.data)) {
        loadedProductData = productRes.data.data[0];
      } else {
        loadedProductData = productRes.data.data;
      }

      if (!loadedProductData || !loadedProductData.id) {
        console.error("No valid product data found with ID");
        toast.error("Could not load product data", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
        return;
      }

      setProductData(loadedProductData);
      refreshProcedures(loadedProductData.id);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to fetch data", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
      setProcedures([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshProcedures = async (productId?: number) => {
    const idToUse = productId || (productData && productData.id);

    if (!idToUse) {
      console.error("No product ID available for refreshing procedures");
      toast.error("Missing product ID", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
      return;
    }

    try {
      setLoading(true);
      const proceduresRes = await getAllProcedures(idToUse.toString());

      let proceduresData = [];
      if (proceduresRes.data && Array.isArray(proceduresRes.data.data)) {
        proceduresData = proceduresRes.data.data;
      } else if (proceduresRes.data && proceduresRes.data.data) {
        proceduresData = [proceduresRes.data.data];
      }

      setProcedures(proceduresData);
    } catch (error) {
      console.error("Failed to refresh procedures:", error);
      toast.error("Failed to refresh procedures", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
      setProcedures([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!productData?.id) return;

    const handleFocus = () => {
      if (productData?.id) {
        refreshProcedures(productData.id);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [productData?.id]);

  const from = location.state?.from;
  const backInfo =
    from === "product"
      ? { title: "Product", path: "/products" }
      : from === "viewStock"
        ? { title: "Stock List", path: "/viewStock" }
        : { title: "Manage Quantity", path: "/manageQuantity" };

  return (
    <>
      <div className="py-3">
        <PageBreadcrumb
          pageTitle={"Procedure Management"}
          backInfo={backInfo}
        />
        {loading && (
          <div className="loader-overlay">
            <div className="loader"></div>
          </div>
        )}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
            <div className="space-y-6 text-gray-800 dark:text-white/90">
              <div className="flex space-x-2">
                <h3 className="">Product Model: </h3>
                <p className="font-light"> {productData?.model}</p>
              </div>
              <div className="flex space-x-2">
                <h3 className="">PN: </h3>
                <p className="font-light"> {productData?.parts_no}</p>
              </div>
              <div className="flex space-x-2">
                <h3 className="">Location: </h3>
                <p className="font-light">
                  {productData?.inventory_location_data?.[0]?.name || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="py-3">
        <span className="text-sm text-gray-500">
          {procedures.length} entries
        </span>

        <div className="relative w-full">
          {permissions.canCreateProcedures && (
            <button
              className="absolute right-0 bg-brand text-white px-3 py-1 mt-3 me-3 rounded flex items-center gap-2"
              onClick={() => {
                const currentProductId = productData?._id;
                if (!currentProductId) {
                  toast.error("Product ID not available", {
                    position: "top-right",
                    autoClose: 3000,
                    style: { zIndex: 9999999999, marginTop: "4rem" },
                  });
                  return;
                }
                navigate(`/managequantity/procedure/create/${productData._id}`)
              }}
            >
              <span className="bg-brand">+</span> Add
            </button>
          )}

          <ComponentCard title="Procedure List">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] text-gray-500 text-start font-medium">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3">ID</TableCell>
                    <TableCell isHeader className="px-5 py-3">Status</TableCell>
                    <TableCell isHeader className="px-5 py-3">Producing Qty</TableCell>
                    <TableCell isHeader className="px-5 py-3">Delivery Schedule</TableCell>
                    <TableCell isHeader className="px-5 py-3">On The Way Qty</TableCell>
                    <TableCell isHeader className="px-5 py-3">ETA</TableCell>
                    <TableCell isHeader className="px-5 py-3">Container#</TableCell>
                    <TableCell isHeader className="px-5 py-3">In Stock Qty</TableCell>
                    <TableCell isHeader className="px-5 py-3">In Stock Date</TableCell>
                    <TableCell isHeader className="px-5 py-3">Double Check</TableCell>
                    <TableCell isHeader className="px-5 py-3">Action</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-gray-600 text-start">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-4">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : procedures?.length > 0 ? (
                    procedures.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell className="px-4 py-3">{item.id}</TableCell>
                        <TableCell className="px-4 py-3">
                          {item.double_check ? (
                            <Badge color="primary">Double Check</Badge>
                          ) : (
                            <Badge
                              color={
                                item.status === 0 ? 'warning' :
                                  item.status === 1 ? 'success' :
                                    item.status === 2 ? 'info' : 'light'
                              }
                            >
                              {statusMap[item.status]}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3">{item.produce_qty}</TableCell>
                        <TableCell className="px-4 py-3">
                          {formatDate(item.delivery_date)}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {item.status === 1 || item.status === 2 ? item.ontheway_qty : "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {item.status === 1 || item.status === 2 ? 
                            (item.arrive_date ? formatDate(item.arrive_date) : "TBD") 
                            : "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {item.status === 1 || item.status === 2 ? (item.container || "-") : "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {item.status === 1 && permissions.canVerifyArrival ? (
                            <span className="text-red-500 cursor-pointer"
                              onClick={() => navigate(`/managequantity/procedure/verify/${productData._id}/${item._id}/${item.id}`)}
                            >
                              Verify Arrival
                            </span>
                          ) : item.status === 2 ? (
                            item.instock_qty
                          ) : "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {item.status === 2 ? formatDate(item.instock_date) : "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {item.double_check ? (
                            "--"
                          ) : item.status === 2 && permissions.canDoubleCheck ? (
                            <span
                              className="text-orange-400 cursor-pointer"
                              onClick={() => navigate(`/managequantity/procedure/doubleCheck/${productData._id}/${item._id}/${item.id}`)}
                            >
                              Double Check
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 text-start">
                          <div className="flex gap-2">
                            {permissions.canEditProcedures && (
                              <div
                                className="cursor-pointer hover:bg-blue-400 transition-colors"
                                onClick={() => {
                                  const currentProductId = productData?._id;
                                  if (!currentProductId) {
                                    toast.error("Product ID not available", {
                                      position: "top-right",
                                      autoClose: 3000,
                                      style: { zIndex: 9999999999, marginTop: "4rem" },
                                    });
                                    return;
                                  }
                                  navigate(
                                    `/managequantity/procedure/update/${currentProductId}/${item._id}/${item.id}`
                                  );
                                }}
                              >
                                <Badge size="md" color="info">
                                  <EditIcon size={14} />
                                </Badge>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-4 text-gray-500">
                        No Procedures found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </ComponentCard>
        </div>
      </div>
    </>
  );
};