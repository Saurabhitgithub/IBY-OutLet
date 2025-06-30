import { useEffect, useState, useRef, ChangeEvent } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { deleteLogService, getAllUsers, getLogService, getPermissionByRole } from "../../services/apis";
import moment from "moment";
import Badge from "../../components/ui/badge/Badge";
import "./style.css";
import { useNavigate } from "react-router";
import * as React from "react";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { EditIcon, Trash2Icon, FilesIcon } from "lucide-react";
import { toast } from "react-toastify";
import { EVENTS_OPTIONS, USERS } from "../../constants/constants";
import Select from "react-select";
import { Box, Modal } from "@mui/material";

interface Option {
  value: string;
  label: string;
}

interface Log {
  _id: string;
  id: number;
  log_sql_id: string;
  keyword: string;
  event: string;
  date: string;
  spend_time: number;
  detail: string;
  user_id: string;
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

export const Logs: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [allData, setAllData] = useState<Log[]>([]);
  const [filteredData, setFilteredData] = useState<Log[]>([]);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [openTo, setopenTo] = useState<Option[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedUser, setSelectedUser] = useState<Option | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const itemsPerPage = 20;
  const [permissions, setPermissions] = useState({
    canViewLogs: false,
    canCreateLogs: false,
    canEditLogs: false,
    canDeleteLogs: false,
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
        checkPermission('Log', 'View'),
        checkPermission('Log', 'Create'),
        checkPermission('Log', 'Update'),
        checkPermission('Log', 'Delete'),
      ]);

      setPermissions({
        canViewLogs: canView,
        canCreateLogs: canCreate,
        canEditLogs: canEdit,
        canDeleteLogs: canDelete,
      });

      if (canView) {
        fetchUsers();
        getData(page);
      } else {
        toast.error("You don't have permission to view logs", {
          toastId: "no-permission-view-logs",
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
        navigate('/');
      }
    };

    initializeComponent();
  }, [page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      const users = response.data?.data || [];
      const formattedUsers = users.map((user: any) => ({
        value: user.id,
        label: user.name,
      }));
      setopenTo(formattedUsers);
    } catch (error) {
      console.error("Failed to fetch account managers:", error);
    }
    setLoading(false);
  };

  const getData = async (currentPage = 1) => {
    try {
      setLoading(true);
      const requestBody = {
        page: currentPage,
        limit: 10,
      };
      const response = await getLogService(requestBody);
      const logs: Log[] = response?.data?.data?.data || [];
      const total = response?.data?.totalPages || 1;

      setAllData(logs);
      setFilteredData(logs);
      setTotalPages(total);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleDelete = async () => {
    if (!permissions.canDeleteLogs) {
      toast.error("You don't have permission to delete logs", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
      setIsDeleteModalOpen(false);
      return;
    }

    try {
      setLoading(true);

      if (!deleteId) {
        toast.error("No log selected for deletion", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
        return;
      }

      const response = await deleteLogService(deleteId.toString());

      if (response.data.success) {
        toast.success("Log deleted successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
        setIsDeleteModalOpen(false);
        setDeleteId(null);

        if (filteredData.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          getData(page);
        }
      } else {
        toast.error("Failed to delete log. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      }
    } catch (error) {
      console.error("Error deleting log:", error);
      toast.error("An error occurred while deleting the log.", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setLoading(false);
    }
  };

  const sortData = (data: Log[], order: string) => {
    const sorted = [...data].sort((a, b) => {
      const valA = a.keyword.toLowerCase();
      const valB = b.keyword.toLowerCase();
      return order === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
    setFilteredData(sorted);
  };

  useEffect(() => {
    let filtered = allData;

    if (search) {
      filtered = filtered.filter((log) =>
        Object.values(log).join(" ").toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedEvent) {
      filtered = filtered.filter((log) => log.event === selectedEvent.value);
    }

    if (selectedUser) {
      filtered = filtered.filter((log) => log.user_id === selectedUser.value);
    }

    setFilteredData(filtered);
  }, [search, selectedEvent, selectedUser, allData]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);

    const filtered = allData.filter((log) =>
      Object.values(log).join(" ").toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  };

  return (
    <div>
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}

      {!permissions.canViewLogs ? (
        <div className="text-center py-8 text-red-500">
          {/* You don't have permission to view this page */}
        </div>
      ) : (
        <>
          <div className="flex items-center mb-4 flex-wrap gap-4">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              value={search}
              onChange={handleSearch}
              className="h-11 w-full max-w-[400px] rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
            />
            <Select
              value={selectedEvent}
              onChange={(option) => setSelectedEvent(option)}
              options={EVENTS_OPTIONS}
              placeholder="Select Event"
              className="w-full max-w-[220px] text-sm shadow-md"
            />

            <Select
              value={selectedUser}
              onChange={(option) => setSelectedUser(option)}
              options={openTo}
              placeholder="Select User"
              className="w-full max-w-[200px] text-sm shadow-md"
            />

            <div className="flex items-center ml-auto">
              <Button
                onClick={() => {
                  setSearch("");
                  setSelectedEvent(null);
                  setSelectedUser(null);
                  setFilteredData(allData);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                size="sm"
                variant="primary"
              >
                Reset Filter
              </Button>

              {permissions.canCreateLogs && (
                <Button
                  onClick={() => navigate("add")}
                  size="sm"
                  variant="primary"
                  className="ml-4"
                >
                  Add Log
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="sortCheckbox"
              onChange={(e) => {
                if (e.target.checked) {
                  sortData(filteredData, "asc");
                } else {
                  sortData(filteredData, "desc");
                }
              }}
              className="mr-2"
            />
            <label htmlFor="sortCheckbox" className="text-sm text-gray-600">
              Check if only Keywords
            </label>
          </div>

          <div className="space-y-6">
            <ComponentCard title="Logs">
              <div style={{ overflow: "auto" }}>
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                        Keyword
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                        Type
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                        Date
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                        Spend Hrs
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                        Details
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                        Created by
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {filteredData.length > 0 ? (
                      filteredData.map((data) => (
                        <TableRow key={data._id}>
                          <TableCell className="px-4 py-3 text-gray-600 text-start">
                            {data.keyword}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-600 text-start">
                            {data.event}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-600 text-start">
                            {moment(data.date).format("YYYY-MM-DD")}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-600 text-start">
                            {data.spend_time}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-600 text-start">
                            {data.detail}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-600 text-start">
                            {data.user[0]?.name}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-600 text-start">
                            <div className="flex gap-2">
                              {permissions.canEditLogs && (
                                <div
                                  className="cursor-pointer"
                                  onClick={() => navigate(`/logs/update/${data._id}`)}
                                >
                                  <Badge size="sm" color="success">
                                    <EditIcon size={14} />
                                  </Badge>
                                </div>
                              )}
                              <div
                                className="cursor-pointer"
                                onClick={() => navigate(`/logsfiles/${data._id}`)}
                              >
                                <Badge size="sm" color="info">
                                  <FilesIcon size={14} />
                                </Badge>
                              </div>
                              {permissions.canDeleteLogs && (
                                <div
                                  className="cursor-pointer"
                                  onClick={() => {
                                    setDeleteId(data.id);
                                    setIsDeleteModalOpen(true);
                                  }}
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
                        <td className="text-center py-4 text-gray-500" colSpan={7}>
                          No results found
                        </td>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </ComponentCard>

            <div className="flex flex-wrap justify-between items-center mt-4">
              <span className="text-sm">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
              </span>
              <span className="flex justify-end mt-2">
                <Stack spacing={2}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Stack>
              </span>
            </div>
          </div>

          <Modal
            open={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
          >
            <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
                <p>Are you sure you want to delete this log?</p>
                <div className="flex justify-end mt-4">
                  <button
                    className="text-gray-600 hover:text-gray-900 mr-4"
                    onClick={() => setIsDeleteModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
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