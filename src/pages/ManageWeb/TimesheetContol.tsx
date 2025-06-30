import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EditIcon, Trash2Icon, PlusIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import ComponentCard from "../../components/common/ComponentCard";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { Box, Modal } from "@mui/material";
import {
  deleteTimeSheet,
  getAllTimeSheet,
  getAllUsers,
} from "../../services/apis";
import { toast } from "react-toastify";

interface Option {
  value: string;
  label: string;
}

interface TimeSheetItem {
  id: any;
  user_id: number;
  user_names: string;
}

export const Timesheet: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [timeSheet, setTimeSheet] = useState<TimeSheetItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [authUserOptions, setAuthUserOptions] = useState<Option[]>([]);
  const [usersMap, setUsersMap] = useState<{ [key: string]: string }>({});
  const [timeSheetId, setTimeSheetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchTimeSheets();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      if (res?.data?.data) {
        const options = res.data.data.map((user: any) => ({
          value: user.id,
          label: user.name,
        }));
        setAuthUserOptions(options);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to fetch users", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authUserOptions.length > 0) {
      const map = authUserOptions.reduce(
        (acc: { [key: string]: string }, user) => {
          acc[user.value] = user.label;
          return acc;
        },
        {}
      );
      setUsersMap(map);
    }
  }, [authUserOptions]);

  const fetchTimeSheets = async () => {
    setLoading(true);
    try {
      const response = await getAllTimeSheet();
      const list = response.data?.data || [];
      setTimeSheet(list.reverse());
    } catch (error) {
      console.error("Failed to fetch time sheets:", error);
      toast.error("Failed to fetch time sheets", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredData = timeSheet.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
  setLoading(true);
  setCurrentPage(page);

  // This ensures the loader has time to render
  requestAnimationFrame(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  });
};

  const confirmDelete = async () => {
    if (!timeSheetId) return;

    setLoading(true);
    try {
      await deleteTimeSheet(timeSheetId);
      fetchTimeSheets(); // Refresh list
      setIsDeleteModalOpen(false);
      setTimeSheetId(null);
      toast.success("Timesheet deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } catch (error) {
      console.error("Error deleting timesheet:", error);
      toast.error("Failed to delete timesheet", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <h1 className="text-xl font-bold mb-4">View Timesheet Authorization</h1>
      <div className="flex mb-4">
        <div className="w-1/2">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
          />
        </div>
      </div>

      <div className="relative w-full">
        <button
          className="absolute right-0 bg-blue-500 text-white px-3 py-1 mt-3 me-3 rounded flex items-center gap-2"
          onClick={() => navigate("/addTimesheet")}
        >
          <span className="text-md">
            <PlusIcon />
          </span>
        </button>

        <ComponentCard title="Timesheet Authorization List">
          <div style={{ overflowX: "auto" }}>
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    No.
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Auth User
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Can view who
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
                {paginatedItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
           {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {usersMap[item.user_id]}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {Array.isArray(item.user_names)
                        ? item.user_names.join(", ")
                        : item.user_names}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      <div className="flex gap-2">
                        <div
                          className="cursor-pointer"
                          onClick={() => navigate(`/editTimesheet/${item.id}`)}
                        >
                          <Badge size="sm" color="success">
                            <EditIcon size={14} />
                          </Badge>
                        </div>
                        <div
                          className="cursor-pointer"
                          onClick={() => {
                            setTimeSheetId(item.id);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Badge size="sm" color="warning">
                            <Trash2Icon size={14} />
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ComponentCard>

        <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
          <span className="text-sm">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredData.length)} of{" "}
            {filteredData.length} entries
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

      <Modal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete this TimeSheet?</p>
            <div className="flex justify-end mt-4">
              <button
                className="text-gray-600 hover:text-gray-900 mr-4"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                onClick={confirmDelete}
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