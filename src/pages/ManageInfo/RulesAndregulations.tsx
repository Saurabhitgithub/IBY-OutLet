import React, { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "../../components/ui/table";
import { useNavigate } from "react-router";
import { Plus } from "lucide-react";
import { Box, Modal } from "@mui/material";
import { Grid } from "@mui/material";
import Button from "../../components/ui/button/Button";
import { deleteRule, getAllUsers, getRules } from "../../services/apis";
import { toast } from "react-toastify";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Select from "react-select";

export const RulesAndRegulation: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const [visibleDetailsId, setVisibleDetailsId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rulesRegulationData, setRulesRegulationData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [openTo, setopenTo] = useState<Option[]>([]);

  const navigate = useNavigate();

  const filteredRules = rulesRegulationData.filter((item) => {
    const searchLower = searchTerm.toLowerCase();

    const searchMatch =
      item?.title?.toLowerCase().includes(searchLower) ||
      item?.type?.toLowerCase().includes(searchLower) ||
      item?.rule_file?.toLowerCase().includes(searchLower) ||
      item?.approvedFirstBy?.toLowerCase().includes(searchLower) ||
      item?.approvedSecondBy?.toLowerCase().includes(searchLower) ||
      item?.addedOn?.toLowerCase().includes(searchLower) ||
      item?.contents?.toLowerCase().includes(searchLower);

    const userMatch = selectedUser
      ? item?.approvedFirstBy === selectedUser ||
        item?.approvedSecondBy === selectedUser ||
        item?.addedOn?.toLowerCase().includes(selectedUser.toLowerCase())
      : true;

    return searchMatch && userMatch;
  });

  const totalPages = Math.ceil(filteredRules.length / itemsPerPage);
  const paginatedItems = filteredRules.slice(
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

  const toggleHistory = (id: number) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  const toggleDetails = (id: number) => {
    setVisibleDetailsId((prev) => (prev === id ? null : id));
  };
  useEffect(() => {
    fetchRuleRegulationData();
    fetchUsers();
  }, []);
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
  const fetchRuleRegulationData = async () => {
    try {
      setLoading(true);
      const res = await getRules();
      setRulesRegulationData(res.data.data);
    } catch (error) {
      console.error("Error fetching quotation data:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async () => {
    setLoading(true);

    if (!deleteId) {
      setLoading(false);
      return;
    }

    try {
      await deleteRule(deleteId);
      setIsDeleteModalOpen(false);
      setDeleteId(null);
      await fetchRuleRegulationData();

      toast.success("Rule Regulation deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } catch (error) {
      toast.error("Failed to delete rule regulation.", {
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
      <h1 className="text-xl font-bold mb-4">Rules and regulations</h1>
      <div className="mb-4">
        <Grid container spacing={2}>
          <Grid size={{ lg: 5, sm: 4 }}>
            <div>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  const value = (e.target as HTMLInputElement).value;
                  setSearchTerm(value);
                  setCurrentPage(1);
                }}
                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </Grid>
          <Grid size={{ lg: 5, sm: 4 }}>
            <div>
              {/* <label className="block text-sm font-medium text-gray-700 mb-1">Select user...</label> */}
              {/* <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
              >
                <option value="">All Users</option>
                <option value="test-a">test-a</option>
                <option value="Sales No.1">Sales No.1</option>
              </select> */}
              <Select
                value={selectedUser}
                onChange={(option) => setSelectedUser(option)}
                options={openTo}
                placeholder="Select User"
                className="w-full max-w-[300px] text-sm shadow-md"
              />
            </div>
          </Grid>

          <Grid size={{ lg: 2, sm: 4 }}>
            <div>
              <Button
                size="sm"
                variant="primary"
                className="m1-4  w-full max-w-[300px] text-white-400"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedUser("");
                  setCurrentPage(1);
                  setSearchTerm("");
                }}
              >
                Reset
              </Button>
            </div>
          </Grid>
        </Grid>
      </div>

      <div className="relative w-full flex flex-col gap-y-6">
        <Button
          size="sm"
          variant="primary"
          className="absolute right-0 bg-blue-500 text-white px-3 py-1 mt-3 me-3 rounded flex items-center gap-2"
          onClick={() => {
            setLoading(true);
            navigate("/addRule");
          }}
        >
          <span className="text-md">
            <Plus />
          </span>
        </Button>
        <ComponentCard title="Rules and Regulations List">
          <div style={{ overflowX: "auto" }}>
            <Table>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedItems.map((item) => (
                  <React.Fragment key={item.id}>
                    <TableRow>
                      <TableCell className="px-4 py-3 text-gray-600 align-top w-2/5">
                        <div className="grid grid-cols-[160px_1fr] gap-y-2 gap-x-4">
                          <span className="font-medium">Title:</span>
                          <span>{item.title}</span>

                          <span className="font-medium">Type:</span>
                          <span>{item.ruleLocationsData?.title || "-"}</span>

                          <span className="font-medium">
                            Approved First By:
                          </span>
                          <span>{item.app_1_by || "-"}</span>

                          <span className="font-medium">
                            Approved Second By:
                          </span>
                          <span>{item.app_2_by || "-"}</span>

                          <span className="font-medium">Contents:</span>
                          <span className="text-blue-500 hover:text-blue-700 cursor-pointer">
                            <button onClick={() => toggleDetails(item.id)}>
                              {visibleDetailsId === item.id
                                ? "Click here to hide detail"
                                : "Click here to view detail"}
                            </button>
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-gray-600 align-top w-2/5">
                        <div className="grid grid-cols-[160px_1fr] gap-y-2 gap-x-4">
                          <span className="font-medium">File Name:</span>
                          <span>
                            {item.rule_file ? (
                              <span className="text-blue-500 hover:text-blue-700 cursor-pointer break-all">
                                {item.rule_file.split("/").pop()}
                              </span>
                            ) : (
                              "N/A"
                            )}
                          </span>

                          <span className="font-medium">
                            Add Person &amp; Add Time:
                          </span>
                          <span>
                            {item.ruleUserData?.username && item.created_at
                              ? `Added by: ${
                                  item.ruleUserData.username
                                }   ${new Date(item.created_at).toLocaleString(
                                  []
                                )}`
                              : "-"}
                          </span>

                          <span className="font-medium">
                            Approve First Time:
                          </span>
                          <span>{item.app_1_time || "-"}</span>

                          <span className="font-medium">
                            Approve Second Time:
                          </span>
                          <span>{item.app_2_time || "-"}</span>
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-center align-top w-1/5 text-gray-600">
                        Action
                        <div className="flex flex-col space-y-2 mt-2">
                          <button
                            className="text-blue-500 hover:text-blue-700 px-4 py-1 rounded"
                            onClick={() => {
                              setLoading(true);
                              navigate(`/editRule/${item._id}`);
                            }}
                          >
                            Modify
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700 px-4 py-1 rounded"
                            onClick={() => {
                              setDeleteId(item.id);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {visibleDetailsId === item.id && (
                      <TableRow>
                        <td
                          colSpan={3}
                          className="bg-gray-50 px-4 py-3 text-gray-700"
                        >
                          <p className="text-sm">{item.contents}</p>
                        </td>
                      </TableRow>
                    )}

                    <TableRow>
                      <td colSpan={3} className="text-center py-2">
                        <button
                          className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded"
                          onClick={() => toggleHistory(item.id)}
                        >
                          Read History
                        </button>
                      </td>
                    </TableRow>

                    {expandedRowId === item.id && (
                      <TableRow>
                        <td
                          colSpan={3}
                          className="px-4 py-3 bg-white text-gray-700"
                        >
                          {item.hasHistory ? (
                            <div className="p-2">
                              <p className="font-medium mb-2">
                                History Details for Rule ID: {item.id}
                              </p>
                              <ul className="list-disc ml-6 text-sm space-y-1">
                                <li>Approved by {item.approvedFirstBy}</li>
                                <li>Document reviewed on 2023-01-01</li>
                              </ul>
                            </div>
                          ) : (
                            <div className="text-center text-gray-500 py-2">
                              No history found.
                            </div>
                          )}
                        </td>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </ComponentCard>
        <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
          <span className="text-sm">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, rulesRegulationData.length)}{" "}
            of {rulesRegulationData.length} entries
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
            <p>Are you sure you want to delete this rule?</p>
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
    </div>
  );
};
