import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EditIcon } from "lucide-react";
import { AiOutlineStop } from "react-icons/ai";
import Badge from "../../components/ui/badge/Badge";
import ComponentCard from "../../components/common/ComponentCard";
import { getAllCategory, activeAndInactiveCategory, getPermissionByRole } from "../../services/apis";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import moment from "moment";
import { Button } from "@mui/material";
import { toast } from "react-toastify";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

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

export const Categories: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [getAllDataCategory, setGetAllDataCategory] = useState<any[]>([]);
  const [permissions, setPermissions] = useState({
    canViewCategories: false,
    canCreateCategories: false,
    canEditCategories: false,
    canDeleteCategories: false,
  });

  // Permission helper functions
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
      ] = await Promise.all([
        checkPermission('Category', 'View'),
        checkPermission('Category', 'Create'),
        checkPermission('Category', 'Update'),
        checkPermission('Category', 'Delete'),
      ]);

      setPermissions({
        canViewCategories: canView,
        canCreateCategories: canCreate,
        canEditCategories: canEdit,
        canDeleteCategories: canDelete,
      });

      if (canView) {
        getAllCategoryDataFunction();
      } else {
        toast.error("You don't have permission to view categories", {
          toastId: "no-permission-view-categories",
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
        navigate('/');
      }
    };

    initializeComponent();
  }, []);

  const getAllCategoryDataFunction = async () => {
    setLoading(true);
    try {
      const response = await getAllCategory();
      setGetAllDataCategory(response.data.data);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setCurrentPage(1);
    if (inputRef.current) {
      (inputRef.current as HTMLInputElement).value = "";
    }
  };
   const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setLoading(true)
        setTimeout(()=>{
            setLoading(false)
            setCurrentPage(page);
        },500)
    };

  const handleToggleStatus = async (item: any) => {
    if (!permissions.canEditCategories) {
      toast.error("You don't have permission to change category status", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        deleted_at: item.active_status ? new Date() : null,
      };

      await activeAndInactiveCategory(item.id, payload);
      getAllCategoryDataFunction();

      toast.success(
        `Category ${item.active_status ? "deactivated" : "activated"
        } successfully!`,
        {
          position: "top-right",
          autoClose: 3000,
          style: {
            zIndex: 99999999,
            marginTop: "4rem",
          },
        }
      );
    } catch (error: any) {
      console.error(
        "Error in toggling status:",
        error.response?.data || error.message
      );
      toast.error("Failed to change category status!", {
        position: "top-right",
        autoClose: 3000,
        style: {
          zIndex: 99999999,
          marginTop: "4rem",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const safeLower = (val: string | null | undefined) =>
    val?.toLowerCase() || "";

  const filteredItems = getAllDataCategory.filter(
    (item) =>
      safeLower(item.name).includes(searchTerm.toLowerCase()) ||
      safeLower(item.belong_to).includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!permissions.canViewCategories) {
    return (
      <div className="p-4 text-center py-8 text-red-500">
        {/* You don't have permission to view this page  */}
      </div>
    );
  }

  return (
    <div className="p-4">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}

      <h1 className="text-xl font-bold mb-4">Categories</h1>

      <div className="flex flex-wrap justify-between items-center mb-4 mt-2 gap-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search by Category or Belong to..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-11 w-full sm:w-[300px] rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
        />

        <div className="flex gap-2">
          {permissions.canCreateCategories && (
            <button
              className="bg-brand text-white px-4 py-2 rounded"
              onClick={() => navigate("add")}
            >
              + Add
            </button>
          )}

          <button
            className="bg-brand text-white px-4 py-2 rounded"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>

      <ComponentCard title="Category List">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start"
              >
                Name
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start"
              >
                Belong to
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start"
              >
                Status
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

          <TableBody>
            {paginatedItems.length > 0 ? (
              paginatedItems.map((item, index) => (
                <TableRow
                  key={index}
                  className="divide-y divide-gray-100 dark:divide-white/[0.05]"
                >
                  <TableCell className="px-4 py-3 text-gray-600 text-start">
                    {item.name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 text-start">
                    {item.belong_to}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 text-start">
                    <span
                      className={`px-2 py-1 rounded border ${item.active_status
                          ? "bg-green-100 text-green-700 border-green-400"
                          : "bg-red-100 text-red-700 border-red-400"
                        }`}
                    >
                      {item.active_status ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 text-start">
                    {moment(item.createdAt).format("DD/MM/YYYY")}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 text-start">
                    <div className="flex gap-2">
                      {permissions.canEditCategories && (
                        <div
                          className="cursor-pointer"
                          onClick={() =>
                            navigate(`/categories/update/${item._id}`)
                          }
                        >
                          <Badge size="md" color="info">
                            <EditIcon size={14} />
                          </Badge>
                        </div>
                      )}
                      {permissions.canEditCategories && (
                        <div
                          className="cursor-pointer"
                          onClick={() => handleToggleStatus(item)}
                          title="Toggle Active/Inactive"
                        >
                          <Badge size="sm" color="error">
                            <AiOutlineStop size={14} />
                          </Badge>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="text-center py-4 text-gray-500">
                  No results found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ComponentCard>

      <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
        <span className="text-sm">
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, getAllDataCategory.length)} of {getAllDataCategory.length} entries
        </span>
        <Stack spacing={2}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Stack>
      </div>
    </div>
  );
};