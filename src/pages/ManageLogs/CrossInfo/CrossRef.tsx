import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { EditIcon, Trash2Icon, PlusIcon } from "lucide-react";
import Button from "../../../components/ui/button/Button";
import ComponentCard from "../../../components/common/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import Badge from "../../../components/ui/badge/Badge";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { Box, Modal } from "@mui/material";
import { deleteCrossRefById, getAllCrossRef } from "../../../services/apis";
import { toast } from "react-toastify";

interface CrossRefItem {
  id: any;
  sql_id: any;
  _id: string;
  product: string;
  manufacture: string;
  oempn: string;
  ourpn: string;
  type: string;
  notes: string;
  author: string;
}

export const CrossRef: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSqlId, setSelectedSqlId] = useState<number | null>(null);
  const [crossRef, setCrossRef] = useState<CrossRefItem[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const itemsPerPage = 20;

  useEffect(() => {
    getCrossRef();
  }, []);

  const getCrossRef = async () => {
    setLoading(true);
    try {
      const response = await getAllCrossRef();
      const sortedData = response.data.data.reverse();
      setCrossRef(sortedData);
    } catch (error) {
      console.error("Error fetching crossRef data:", error);
      setCrossRef([]);
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    setLoading(true);

    try {
      await deleteCrossRefById(id);
      await getCrossRef();

      toast.success("Cross ref deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } catch (error) {
      console.error("Error deleting code:", error);

      toast.error("Failed to delete cross ref.", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(crossRef.length / itemsPerPage);
  const paginatedItems = crossRef
    .filter(
      (item) =>
        item.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.manufacture?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.oempn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ourpn?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setLoading(true);
    setTimeout(() => {
      setCurrentPage(page);
      setLoading(false)
    }, 500);
  };


  return (
    <div className="p-4">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <h1 className="text-xl font-bold mb-4">Cross Ref</h1>

      <div className="mb-4">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-[700px] p-2 border rounded mb-4 bg-white shadow-md"
        />
      </div>

      <div className="flex justify-end gap-2 mb-4">
        <Button onClick={() => setSearchTerm("")} size="sm" variant="outline">
          Reset Filter
        </Button>
        <Button onClick={() => { }} size="sm" variant="primary">
          Search
        </Button>
      </div>

      <div className="relative w-full mb-4">
        <Button
          size="sm" 
          variant="primary"
          className="absolute right-0 text-white px-3 py-1 mt-3 me-3 rounded flex items-center gap-2"
          onClick={() => navigate("/cross/addCrossRef")}
        >
          <PlusIcon size={16} /> Add
        </Button>

      </div>

      <ComponentCard title="Cross Ref List">
        <div style={{ overflowX: "auto" }}>
          <Table className="text-center">
            <TableHeader>
              <TableRow>
                {[
                  "Product",
                  "OEM Name",
                  "OEM P/N",
                  "Our P/N",
                  "Type",
                  "Notes",
                  "Author",
                  "Action",
                ].map((heading) => (
                  <TableCell
                    key={heading}
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    {heading}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="px-4 py-3 text-gray-600 text-start">
                    {item.product}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 text-start">
                    {item.manufacture}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 text-start">
                    {item.oempn}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 text-start">
                    {item.ourpn}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 text-start">
                    {item.type}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 text-start">
                    {item.notes}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 text-start">
                    {item.userData?.[0]?.name || "--"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <div
                        className="cursor-pointer"
                        onClick={() =>
                          navigate(`/cross/editCrossRef/${item.id}`)
                        }
                      >
                        <Badge size="sm" color="success">
                          <EditIcon size={14} />
                        </Badge>
                      </div>
                      <div
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedSqlId(item.id);
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

      <div className="flex flex-wrap justify-between items-center mt-4">
        <span className="text-sm">
          Showing{" "}
          {Math.min((currentPage - 1) * itemsPerPage + 1, crossRef.length)} to{" "}
          {Math.min(currentPage * itemsPerPage, crossRef.length)} of{" "}
          {crossRef.length} entries
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

      <Modal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete this Cross ref?</p>
            <div className="flex justify-end mt-4">
              <button
                className="text-gray-600 hover:text-gray-900 mr-4"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                onClick={async () => {
                  if (selectedSqlId !== null) {
                    await handleDelete(selectedSqlId);
                    setIsDeleteModalOpen(false);
                    setSelectedSqlId(null);
                  }
                }}
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
