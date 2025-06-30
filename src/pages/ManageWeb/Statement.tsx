import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EditIcon, PlusIcon, Trash2Icon } from "lucide-react";
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
import { Box, Button, Modal } from "@mui/material";
import { deleteStatement, getAllStatement } from "../../services/apis";
import { toast } from "react-toastify";

// Define the code to label mapping
const codeToLabelMap = [
  // { value: "OE", label: "write.com", checked: false },
  // { value: "PU", label: "ownlogus.com", checked: false },
  // { value: "LD", label: "tap/chat.com", checked: false },
  // { value: "VD", label: "valvebgcd.com", checked: false },
  // { value: "NG", label: "grep.gu.com", checked: false },
  // { value: "WD", label: "weftsalesbgcd.com", checked: false },
  // { value: "PE", label: "personalfield.com", checked: false },
  // { value: "CN", label: "valvet212.com", checked: false },
    { value: "OE", label: "oemic.com", checked: false },
  { value: "PU", label: "oemicparts.com", checked: false },
  { value: "LD", label: "ipayless2.com", checked: false },
  { value: "VD", label: "valvedepot.com", checked: false },
  { value: "NG", label: "ngquip.com", checked: false },
  { value: "WD", label: "wellheaddepot.com", checked: false },
  { value: "PE", label: "pecosoilfield.com", checked: false },
  { value: "CN", label: "valve123.com", checked: false }
];

export const Statement: React.FC = () => {
  const navigate = useNavigate();
  const [statement, setStatement] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [statementToDelete, setStatementToDelete] = useState<string | null>(
    null
  );

  // Function to convert API codes to labels
  const getLabelForCode = (code: string) => {
    const found = codeToLabelMap.find((item) => item.value === code);
    return found ? found.label : code;
  };

  // Function to render the belongTo field with badges
  const renderBelongToField = (codesString: string) => {
    if (!codesString) return null;

    const codes = codesString.split(",");
    return (
      <div className="flex flex-wrap gap-2">
        {codes.map((code, index) => (
          <Badge key={index} size="sm" color="primary">
            {getLabelForCode(code.trim())}
          </Badge>
        ))}
      </div>
    );
  };

  const filteredData = statement.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  useEffect(() => {
    fetchStatement();
  }, []);

  const fetchStatement = async () => {
    setLoading(true);
    try {
      const response = await getAllStatement();
      setStatement(response.data?.data.reverse() || []);
    } catch (error) {
      console.error("Error fetching Statements:", error);
    }
    setLoading(false);
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
    setLoading(true)
    setTimeout(()=>{
      setLoading(false)
      setCurrentPage(page);
    },500);
  };
  const handleDeleteClick = (id: string) => {
    setStatementToDelete(id);
    setIsDeleteModalOpen(true);
  };
  const handleConfirmDelete = async () => {
    setLoading(true);
    if (!statementToDelete) return;

    try {
      console.log("Attempting to delete ID:", statementToDelete);
      const response = await deleteStatement(statementToDelete);
      console.log("Delete successful:", response);
      await fetchStatement();
      setIsDeleteModalOpen(false);
      setStatementToDelete(null);

      toast.success("Statement deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999999999999, marginTop: "4rem" },
      });
    } catch (error) {
      console.error("Full error details:", error);

      toast.error("Failed to delete the statement.", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999999999999, marginTop: "4rem" },
      });
    }

    setLoading(false);
  };
  return (
    <div className="p-4">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <h1 className="text-xl font-bold mb-4">View Statement</h1>
      <div className="flex mb-4">
        <div className="w-1/2 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 flex-grow rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
          />
          <Button
            size="small"
            variant="outlined"
            sx={{ px: 2, py: 1, backgroundColor:"rgb(24, 115, 220)", color: "white" }}
            onClick={() => {
              setSearchTerm("");
              setCurrentPage(1);
            }}
          >
            Reset 
          </Button>
        </div>
      </div>
      <div className="relative w-full">
        <button
          className="absolute right-0 bg-blue-500 text-white px-3 py-1 mt-3 me-3 rounded flex items-center gap-2"
          onClick={() => {
            setLoading(true);
            setTimeout(() => navigate("/addUpdate"), 100);
          }}
        >
          <span className="text-md">
            <PlusIcon />
          </span>
        </button>
        <ComponentCard title="Statement List">
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
                    Title
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Belong To
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Date
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
                      {index+1}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {item.title}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {renderBelongToField(item.in_web)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {new Date(item.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      <div className="flex gap-2">
                        <div
                          className="cursor-pointer"
                          onClick={() => {
                            setLoading(true); // Assuming you have a loading state setter
                            setTimeout(
                              () => navigate(`/editUpdate/${item.id}`),
                              100
                            );
                          }}
                        >
                          <Badge size="sm" color="success">
                            <EditIcon size={14} />
                          </Badge>
                        </div>
                        <div
                          className="cursor-pointer"
                          onClick={() => handleDeleteClick(item.id)}
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
        onClose={() => {
          setIsDeleteModalOpen(false);
          setStatementToDelete(null);
        }}
      >
        <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete this statement?</p>
            <div className="flex justify-end mt-4">
              <button
                className="text-gray-600 hover:text-gray-900 mr-4"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setStatementToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                onClick={handleConfirmDelete}
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
