import React, { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "../../components/ui/table";
import { useNavigate } from "react-router";
import { Box, Modal } from "@mui/material";
import {
  completeSchedule,
  deleteSchedule,
  getAllSchedule,
} from "../../services/apis";
import Button from "../../components/ui/button/Button";
import moment from "moment";
import { toast } from "react-toastify";
import { Calendar as CalendarIcon } from "lucide-react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

interface User {
  _id: string;
  id: number;
  name: string;
  username: string;
}
interface ScheduleItem {
  id: string;
  send_to: string;
  title: string;
  start_time: string;
  end_time: string;
  if_imp: number;
  details: string;
  task_type: number;
  is_completed?: boolean;
  // added_by: string;
  // added_on: string;
  updated_at: string;
  userData: User[];
  created_at: string;
}

export const Schedules: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const [allSchedules, setAllSchedules] = useState<ScheduleItem[]>([]);
  const [displayedSchedules, setDisplayedSchedules] = useState<ScheduleItem[]>(
    []
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [totalSchedulesCount, setTotalSchedulesCount] = useState(0);
  useEffect(() => {
    fetchAllSchedules();
  }, []);

  useEffect(() => {
    applyFiltersAndPagination();
  }, [allSchedules, currentPage]);

  const fetchAllSchedules = async () => {
    try {
      setLoading(true);
      const response = await getAllSchedule();
      const scheduleList = response.data?.data || [];

      setAllSchedules(scheduleList);
      setTotalSchedulesCount(scheduleList.length);
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
      toast.error("Failed to fetch schedules", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id: string) => {
    // Add confirmation dialog
    const isConfirmed = window.confirm(
      "Are you sure you want to complete this?"
    );
    if (!isConfirmed) return;

    try {
      setLoading(true);
      await completeSchedule(id);
      setAllSchedules((prevSchedules) =>
        prevSchedules.map((schedule) =>
          schedule.id === id ? { ...schedule, is_completed: true } : schedule
        )
      );

      toast.success("Schedule marked as complete!", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } catch (error) {
      console.error("Error completing schedule:", error);
      toast.error("Failed to complete schedule", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndPagination = (resetPage = false) => {
    if (resetPage) {
      setCurrentPage(1);
    }
    let filtered = [...allSchedules];

    if (fromDate) {
      filtered = filtered.filter((item) =>
        moment(item.start_time).isSameOrAfter(moment(fromDate))
      );
    }

    if (toDate) {
      filtered = filtered.filter((item) =>
        moment(item.start_time).isSameOrBefore(moment(toDate))
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.send_to.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setTotalSchedulesCount(filtered.length);

    // Then apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedSchedules(filtered.slice(startIndex, endIndex));
  };

  const handleDelete = (id: string) => {
    setSelectedSchedule(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedSchedule) return;

    try {
      setLoading(true);
      await deleteSchedule(selectedSchedule);
      await fetchAllSchedules(); // Refresh the list after deletion
      setIsDeleteModalOpen(false);
      setSelectedSchedule(null);
      toast.success("Schedule deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Failed to delete schedule", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setLoading(false);
      setIsDeleteModalOpen(false);
      setSelectedSchedule(null);
    }
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setSearchTerm("");
    setCurrentPage(1);
    fetchAllSchedules();
  };

  const getTaskTypeName = (type: number) =>
    type === 1 ? "One Time Schedule" : "Other";

  const getImportanceText = (imp: number) => (imp === 1 ? "Yes" : "No");

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCurrentPage(page);
    }, 500);
  };

  return (
    <div className="p-4">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <h1 className="text-xl font-bold mb-4">Schedule List</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 max-w-md w-full">
          <label
            htmlFor="fromDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            From Date:
          </label>
          <Flatpickr
            options={{
              dateFormat: "Y-m-d",
              maxDate: toDate || undefined,
            }}
            value={fromDate}
            onChange={(dates) =>
              setFromDate(moment(dates[0]).format("YYYY-MM-DD"))
            }
            className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-md"
          />
        </div>
        <div className="flex-1  max-w-md w-full">
          <label
            htmlFor="toDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            To Date:
          </label>
          <Flatpickr
            options={{
              dateFormat: "Y-m-d",
              minDate: fromDate || undefined,
            }}
            value={toDate}
            onChange={(dates) =>
              setToDate(moment(dates[0]).format("YYYY-MM-DD"))
            }
            className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-md"
          />
        </div>
      </div>

      <div className="flex justify-between mb-6">
        <div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate("/addSchedule")}
          >
            <span className="text-lg">+</span> New Schedule
          </Button>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleReset}>
            Reset Filter
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => applyFiltersAndPagination(true)}
          >
            Search
          </Button>
        </div>
      </div>

      <div className="mt-3 space-y-6">
        {displayedSchedules.length > 0 ? (
          displayedSchedules.map((item) => (
            <ComponentCard key={item.id} title="">
              <div style={{ overflowX: "auto" }}>
                <Table>
                  <TableBody className="divide-y divide-gray-100">
                    <TableRow>
                      <TableCell className="px-4 pb-3 font-medium text-gray-600 w-1/4">
                        Report To:{" "}
                        <strong>
                          {item.sendToData?.[0]?.name || item.send_to}
                        </strong>
                      </TableCell>
                      <TableCell className="px-4 pb-3 text-gray-600">
                        {item.title}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="px-4 py-3 font-medium text-gray-600">
                        Types
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600">
                        {getTaskTypeName(item.task_type)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="px-4 py-3 font-medium text-gray-600">
                        Start Time
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600">
                        {moment(item.start_time).format("YYYY-MM-DD HH:mm")}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="px-4 py-3 font-medium text-gray-600">
                        End Time
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600">
                        {moment(item.end_time).format("YYYY-MM-DD HH:mm")}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="px-4 py-3 font-medium text-gray-600">
                        If Important
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600">
                        {getImportanceText(item.if_imp)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="px-4 py-3 font-medium text-gray-600">
                        Contents
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600">
                        {item.details}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 text-sm text-gray-500 text-end">
                {/* Add this line */}
                <span>
                  Added by: {item.userData[0]?.name || "-"} |{" "}
                  {item.updated_at && item.updated_at !== item.created_at ? (
                    <>
                      Updated On:{" "}
                      {moment(item.updated_at)
                        .local()
                        .format("MMM D, YYYY HH:mmA")}
                    </>
                  ) : (
                    <>
                      Added On:{" "}
                      {moment(item.created_at)
                        .local()
                        .format("MMM D, YYYY HH:mmA")}
                    </>
                  )}
                </span>
                <button
                  className="text-blue-500 hover:text-blue-700 ml-2"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </button>{" "}
                |{" "}
                <button
                  className="text-blue-500 hover:text-blue-700 ml-2"
                  onClick={() => navigate(`/editSchedule/${item.id}`)}
                >
                  Modify
                </button>{" "}
                |{" "}
                {!item.is_completed && (
                  <>
                    |{" "}
                    <button
                      className="text-blue-500 hover:text-blue-700 ml-2"
                      onClick={() => handleComplete(item.id)}
                    >
                      Complete
                    </button>
                  </>
                )}
              </div>
            </ComponentCard>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            No schedules found matching your criteria
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalSchedulesCount > itemsPerPage && (
        <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
          <span className="text-sm">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalSchedulesCount)} of{" "}
            {totalSchedulesCount} entries
          </span>

          <Stack spacing={2}>
            <Pagination
              count={Math.ceil(totalSchedulesCount / itemsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Stack>
        </div>
      )}

      <Modal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete this schedule?</p>
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
