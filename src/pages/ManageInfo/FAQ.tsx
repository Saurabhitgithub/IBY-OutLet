import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/button/Button";
import {
  EditIcon,
  PlusIcon,
  Trash2Icon,
  EyeIcon,
  ForwardIcon,
} from "lucide-react";
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
import { getAllFaq, deleteFaq, getPermissionByRole } from "../../services/apis";
import { toast } from "react-toastify";

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

export const FAQ: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [searchInQuestions, setSearchInQuestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [faqData, setFaqData] = useState<any[]>([]);
  const [selectedFaqId, setSelectedFaqId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState(false);
  const [appliedSearchInQuestions, setAppliedSearchInQuestions] =
    useState(false);
  const [permissions, setPermissions] = useState({
    canViewFAQ: false,
    canCreateFAQ: false,
    canEditFAQ: false,
    canDeleteFAQ: false,
  });

  const getCurrentUserRole = (): string => {
    return localStorage.getItem("role") || "";
  };

  const fetchUserPermissions = async (): Promise<RolePermissions | null> => {
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
    const tab = permissions.permission_tab.find((t) => t.tab_name === tabName);
    if (!tab) return false;
    const func = tab.tab_function.find(
      (f) => f.tab_functionName === functionName
    );
    return func?.is_showFunction || false;
  };

  useEffect(() => {
    const initializeComponent = async () => {
      const [canView, canCreate, canEdit, canDelete] = await Promise.all([
        checkPermission("FAQ", "View"),
        checkPermission("FAQ", "Create"),
        checkPermission("FAQ", "Update"),
        checkPermission("FAQ", "Delete"),
      ]);

      setPermissions({
        canViewFAQ: canView,
        canCreateFAQ: canCreate,
        canEditFAQ: canEdit,
        canDeleteFAQ: canDelete,
      });

      if (canView) {
        fetchFaqs();
      } else {
        toast.error("You don't have permission to view FAQs", {
          toastId: "no-permission-view-logs",
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
        navigate("/");
      }
    };

    initializeComponent();
  }, []);

  const handleResetFilters = () => {
    setSearchTerm("");
    setAppliedSearchTerm("");
    setSearchInQuestions(false);
    setAppliedSearchInQuestions(false);
    setCurrentPage(1);
  };

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const response = await getAllFaq();
      setFaqData(response.data.data.reverse() || []);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!permissions.canDeleteFAQ) {
      toast.error("You don't have permission to delete FAQs", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
      setIsDeleteModalOpen(false);
      return;
    }

    if (selectedFaqId) {
      try {
        setDeleting(true);
        await deleteFaq(selectedFaqId);
        setFaqData(faqData.filter((faq) => faq.id !== selectedFaqId));
        setIsDeleteModalOpen(false);
        toast.success(`FAQ deleted successfully!`, {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      } catch (error) {
        console.error("Error deleting FAQ:", error);
      } finally {
        setDeleting(false);
      }
    }
  };

  const filteredData = faqData.filter((item) => {
    if (!appliedSearchTerm) return true;

    const searchText = appliedSearchTerm.toLowerCase();

    if (appliedSearchInQuestions) {
      // Only search in questions
      return item.question?.toLowerCase().includes(searchText);
    }

    // Search in all fields
    return (
      item.id?.toString().toLowerCase().includes(searchText) ||
      item.question?.toLowerCase().includes(searchText) ||
      item.userData?.[0]?.name?.toLowerCase().includes(searchText) ||
      item.created_at?.toLowerCase().includes(searchText) ||
      item.totalReplies?.toString().includes(searchText) ||
      item.files?.toString().includes(searchText)
    );
  });

  const handleSearch = () => {
    setCurrentPage(1);
    setAppliedSearchTerm(searchTerm.trim());
    setAppliedSearchInQuestions(searchInQuestions);
    setIsSearching(true);
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

      {!permissions.canViewFAQ ? (
        <div className="text-center py-8 text-red-500">
          {/* You don't have permission to view this page */}
        </div>
      ) : (
        <>
          <h1 className="text-xl font-bold mb-4">FAQ List</h1>
          <div className="flex mb-4 gap-2 w-full">
            <div className="w-1/2">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="searchInQuestions"
                checked={searchInQuestions}
                onChange={(e) => setSearchInQuestions(e.target.checked)}
              />
              <label
                htmlFor="searchInQuestions"
                className="text-md cursor-pointer"
              >
                Search in Questions
              </label>
            </div>
          </div>
          <div className="flex justify-end mb-2">
            <Button
              size="sm"
              variant="outline"
              className="ml-4"
              onClick={handleResetFilters}
            >
              Reset Filter
            </Button>
            <Button
              size="sm"
              variant="primary"
              className="ml-4"
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>
          <div className="relative w-full">
            {permissions.canCreateFAQ && (
              <Button
                size="sm"
                variant="primary"
                className="absolute right-0 bg-blue-500 text-white px-3 py-1 mt-3 me-3 rounded flex items-center gap-2"
                onClick={() => navigate("/addFAQ")}
              >
                <span className="text-md">
                  <PlusIcon />
                </span>
              </Button>
            )}
            <ComponentCard title="Question ID">
              <div style={{ overflowX: "auto" }}>
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell
                        isHeader
                        className=" py-3 font-medium text-gray-500 text-start"
                      >
                        Question ID
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start"
                      >
                        Question
                      </TableCell>
                      <TableCell
                        isHeader
                        className="py-3 font-medium text-gray-500 text-start"
                      >
                        Author
                      </TableCell>
                      <TableCell
                        isHeader
                        className=" py-3 font-medium text-gray-500 text-start"
                      >
                        Created Date
                      </TableCell>
                      <TableCell
                        isHeader
                        className=" py-3 font-medium text-gray-500 text-start"
                      >
                        Total Replies
                      </TableCell>
                      <TableCell
                        isHeader
                        className=" py-3 font-medium text-gray-500 text-start"
                      >
                        Files
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
                          {item.id}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 text-start">
                          {item.question}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 text-start">
                          {item.userData?.[0]?.name || "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 text-start">
                          {item.created_at || "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 text-start">
                          {item.totalReplies || 0}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 text-start">
                          {item.files || 0}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 text-start">
                          <div className="flex gap-2">
                            <div
                              className="cursor-pointer"
                              onClick={() => navigate(`/answerFAQ/${item.id}`)}
                            >
                              <Badge size="sm" color="primary">
                                <ForwardIcon size={14} />
                              </Badge>
                            </div>
                            <div
                              className="cursor-pointer"
                              onClick={() => navigate(`/showFAQ/${item.id}`)}
                            >
                              <Badge size="sm" color="info">
                                <EyeIcon size={14} />
                              </Badge>
                            </div>
                            {permissions.canEditFAQ && (
                              <div
                                className="cursor-pointer"
                                onClick={() => navigate(`/editFAQ/${item.id}`)}
                              >
                                <Badge size="sm" color="success">
                                  <EditIcon size={14} />
                                </Badge>
                              </div>
                            )}
                            {permissions.canDeleteFAQ && (
                              <div
                                className="cursor-pointer"
                                onClick={() => {
                                  setSelectedFaqId(item.id);
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
                <p>Are you sure you want to delete this FAQ?</p>
                <div className="flex justify-end mt-4">
                  <button
                    className="text-gray-600 hover:text-gray-900 mr-4"
                    onClick={() => setIsDeleteModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center justify-center"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Delete"}
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
