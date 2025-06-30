import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { EditIcon, Trash2Icon } from "lucide-react";
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
import { getAllDriveInfo, deleteDriveInfo } from "../../../services/apis";
import { toast } from "react-toastify";

interface DriveInfoItem {
  id: string;
  mongo_id: string;
   sql_id: string;
  user: string;
  from: string;
  through1: string;
  through2: string;
  to: string;
  time: string;
  car: string;
  distance: string;
  startmiles: string;
  purpose: string;
  addtime: string;
}

export const DriveinfoUI: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
  const [driveInfoData, setDriveInfoData] = useState<DriveInfoItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const itemsPerPage = 20;
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const fetchDriveInfo = async () => {
    setLoading(true);

    try {
      const response = await getAllDriveInfo();

      const dataArray = response.data?.data || [];

      if (Array.isArray(dataArray)) {
        // const sortedData = [...dataArray].sort((a, b) => {
        //   return new Date(b.date).getTime() - new Date(a.date).getTime();
          const sortedData = [...dataArray].sort((a, b) => {
  const dateA = new Date(a.date || a.createdAt || 0).getTime();
  const dateB = new Date(b.date || b.createdAt || 0).getTime();
  return dateB - dateA;
        });

        const formattedData = sortedData.map((item) => ({
          id: item.id?.toString() || "",
          mongo_id: item._id || "",
          sql_id: item.id?.toString() || "",
          user: item.userData[0]?.name || "Unknown User",
          from: item.drivefrom || "",
          through1: item.drivethrough1 || "",
          through2: item.drivethrough2 || "",
          to: item.driveto || "",
          time: item.date ? new Date(item.date).toLocaleString() : "",
          car: item.car || "",
          distance: item.distance?.$numberDecimal || "0",
          startmiles: item.start_distance?.$numberDecimal || "0",
          purpose: item.purpose || "",
          addtime: item.date ? new Date(item.date).toLocaleString() : "",
        }));

        setDriveInfoData(formattedData);
      } else {
        setDriveInfoData([]);
      }
    } catch (error) {
      setError("Failed to fetch drive info data");
      setDriveInfoData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDriveInfo();
  }, []);


 const handleDelete = async () => {
  if (!selectedDeleteId) return;

  setLoading(true);
  try {
    await deleteDriveInfo(selectedDeleteId);
    toast.success("Drive info deleted successfully", {
      position: "top-right",
      autoClose: 3000,
      style: { zIndex: 9999999999, marginTop: "4rem" },
    });

  
    setDriveInfoData(prev =>
      prev.filter(item => item.sql_id !== selectedDeleteId)
    );

    setIsDeleteModalOpen(false);
    setSelectedDeleteId(null);
  } catch (error) {
    toast.error("Failed to delete drive info data", {
      position: "top-right",
      autoClose: 3000,
      style: { zIndex: 9999999999, marginTop: "4rem" },
    });
  } finally {
    setLoading(false);
  }
};

  // Filter items based on search term
  // Filter items based on search term
  const filteredItems = driveInfoData.filter((item) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();

    // Helper function to safely check string fields
    const checkField = (field: string | null | undefined) =>
      field ? field.toLowerCase().includes(searchLower) : false;

    return (
      checkField(item.user) ||
      checkField(item.from) ||
      checkField(item.through1) ||
      checkField(item.through2) ||
      checkField(item.to) ||
      checkField(item.car) ||
      checkField(item.purpose) ||
      checkField(item.time) ||
      checkField(item.addtime) ||
      checkField(item.distance) ||
      checkField(item.startmiles)
    );
  });

   const handlePageChange = (
     _event: React.ChangeEvent<unknown>,
     page: number
   ) => {
     setLoading(true)
     setTimeout(() => {
       setCurrentPage(page);
       setLoading(false)
     }, 500);
   };
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <h1 className="text-xl font-bold mb-4">Drive Info</h1>
      {/* <input
        ref={inputRef}
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1); // Reset to first page when searching
        }}
        className="w-full max-w-[700px] p-2 border rounded mb-6 bg-white shadow-md"
      /> */}

      <div className="relative w-full">
        <button
          className="absolute right-34 bg-blue-500 text-white px-3 py-1 mt-3 me-3 rounded flex items-center gap-2"
          onClick={() => navigate("/drive/addDriveInfo")}
        >
          <span className="text-md">+</span>
        </button>
        <button
          className="absolute right-0 bg-blue-500 text-white px-2 py-1 mt-3 me-3 rounded flex items-center gap-2"
          onClick={() => navigate("/drive/counterInfo")}
        >
          <span className="text-md">Count Drive Info</span>
        </button>
      </div>

      <ComponentCard title="Drive Info List">
        <div style={{ overflow: "auto" }}>
          <Table>
            <TableHeader>
              <TableRow>
                {[
                  "User",
                  "From",
                  "Through_1",
                  "Through_2",
                  "To",
                  "Time",
                  "Car",
                  "Distance",
                  "Start Miles",
                  "Purpose",
                  "Add Time",
                  "Action",
                ].map((col) => (
                  <TableCell
                    key={col}
                    isHeader
                    className=" py-3 font-medium text-gray-500 text-start"
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length > 0 ? (
                filteredItems
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                  )
                  .map((item) => (
                    <TableRow key={item.sql_id}>
                      <TableCell className=" py-3">{item.user}</TableCell>
                      <TableCell className=" py-3">{item.from}</TableCell>
                      <TableCell className=" py-3">
                        {item.through1}
                      </TableCell>
                      <TableCell className=" py-3">
                        {item.through2}
                      </TableCell>
                      <TableCell className=" py-3">{item.to}</TableCell>
                      <TableCell className=" py-3">{item.time}</TableCell>
                      <TableCell className=" py-3">{item.car}</TableCell>
                      <TableCell className=" py-3">
                        {item.distance}
                      </TableCell>
                      <TableCell className=" py-3">
                        {item.startmiles}
                      </TableCell>
                      <TableCell className=" py-3">
                        {item.purpose}
                      </TableCell>
                      <TableCell className=" py-3">
                        {item.addtime}
                      </TableCell>

                      <TableCell className=" py-3">
                        <div className="flex gap-2">
                          <div
                            className="cursor-pointer hover:bg-blue-400"
                            onClick={() =>
                              navigate(`/drive/editDriveInfo/${item.id}`)
                            }
                          >
                            <Badge size="md" color="info">
                              <EditIcon size={14} />
                            </Badge>
                          </div>
                          <div
                            className="cursor-pointer hover:bg-red-400"
                            onClick={() => {
                              setIsDeleteModalOpen(true);
                              setSelectedDeleteId(item.id);
                            }}
                          >
                            <Badge size="sm" color="warning">
                              <Trash2Icon size={14} />
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell  className="text-center py-4">
                    {driveInfoData.length === 0
                      ? "No drive info available"
                      : "No matching drive info found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </ComponentCard>

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm">
          Showing{" "}
          {Math.min((currentPage - 1) * itemsPerPage + 1, filteredItems.length)}{" "}
          to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of{" "}
          {filteredItems.length} entries
        </span>
        <Stack spacing={2}>
          <Pagination
            count={Math.ceil(filteredItems.length / itemsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Stack>
      </div>

      <Modal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <Box className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete this drive Info?</p>
            <div className="flex justify-end mt-4">
              <button
                className="text-gray-600 hover:text-gray-900 mr-4"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedDeleteId(null);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                onClick={handleDelete}
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