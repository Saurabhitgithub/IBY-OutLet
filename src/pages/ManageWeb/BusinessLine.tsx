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
import { deleteBusinessLine, getAllBusinessLine } from "../../services/apis";
import Button from "../../components/ui/button/Button";
import { toast } from "react-toastify";

interface BusinessLineItem {
  id: string;
  no: string;
  chinese_name: string;
  english_name: string;
  web: string;
}

// Code-to-label mapping, just like the Statement component
const codeToLabelMap = [
  // { value: "OE", label: "comic.com" },
  // { value: "PU", label: "oenticparts.com" },
  // { value: "LD", label: "payless2.com" },
  // { value: "VD", label: "usherdepart.com" },
  // { value: "NG", label: "ngapio.com" },
  // { value: "WD", label: "webheaddepart.com" },
  // { value: "PE", label: "pcconsultibal.com" },
  // { value: "CN", label: "valvet32.com" },
    { value: "OE", label: "oemic.com" },
  { value: "PU", label: "oemicparts.com" },
  { value: "LD", label: "ipayless2.com" },
  { value: "VD", label: "valvedepot.com" },
  { value: "NG", label: "ngquip.com" },
  { value: "WD", label: "wellheaddepot.com" },
  { value: "PE", label: "pecosoilfield.com" },
  { value: "CN", label: "valve123.com" }
];

export const BusinessLine: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBusinessLineId, setSelectedBusinessLineId] = useState<
    string | null
  >(null);
  const [businessLines, setBusinessLines] = useState<BusinessLineItem[]>([]);

  const [loading, setLoading] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchBusinessLines();
  }, []);

  const fetchBusinessLines = async () => {
    setLoading(true);
    try {
      const response = await getAllBusinessLine();
      const list = response.data?.data.reverse() || [];
      setBusinessLines(list);
    } catch (error) {
      console.error("Failed to fetch business lines:", error);
      toast.error("Failed to fetch business lines", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    }
    setLoading(false);
  };

  const filteredData = businessLines.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Convert code to label (same as Statement component)
  const getLabelForCode = (code: string) => {
    const found = codeToLabelMap.find((item) => item.value === code);
    return found ? found.label : code;
  };

  // Render badges for the web field (codes separated by commas)
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

  const handleReset = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedBusinessLineId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setLoading(true);

    if (!selectedBusinessLineId) return;

    try {
      await deleteBusinessLine(selectedBusinessLineId);
      await fetchBusinessLines();
      setIsDeleteModalOpen(false);
      setSelectedBusinessLineId(null);

      toast.success("Business line deleted successfully", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } catch (error) {
      console.error("Error deleting business line:", error);
      toast.error("Failed to delete business line", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setLoading(false);
    }
  };

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
      <h1 className="text-xl font-bold mb-4">View Business Line</h1>

      <div className="flex mb-4 gap-4">
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
        <Button
          variant="primary"
          size="sm"
          className="text-lg text-white-400 w-48 mb-2 h-10 "
          onClick={handleReset}
        >
          Reset
        </Button>
      </div>
      <div className="relative w-full">
        <button
          className="absolute right-0 bg-blue-500 text-white px-3 py-1 mt-3 me-3 rounded flex items-center gap-2"
          onClick={() => navigate("/addUpdatebusiness")}
        >
          <span className="text-md">
            <PlusIcon />
          </span>
        </button>
        <ComponentCard title="Business Line List">
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
                    Chinese Name
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    English Name
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
                    Action
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedItems.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {" "}
                      {index + 1}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {item.chinese_name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {item.english_name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {renderBelongToField(item.web)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      <div className="flex gap-2">
                        <div
                          className="cursor-pointer"
                          onClick={() => navigate(`/editbusiness/${item.id}`)}
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
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete this business line?</p>
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
