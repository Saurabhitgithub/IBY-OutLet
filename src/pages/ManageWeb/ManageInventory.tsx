import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import ComponentCard from "../../components/common/ComponentCard";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import {  getAllInventory, getAllLocation } from "../../services/apis";

interface InventoryItem {
  no: number;
  location: string;
  auditMappingUser: string;
  auditReceivingUser: string;
  auditPrevailingUser: string;
}

interface UserOption {
  value: string;
  label: string;
}

export const ManageInventory: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [locationOptions, setLocationOptions] = useState<any[]>([]);

  const itemsPerPage = 10;

  const filteredData = inventoryData.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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
        },500)
  };
  useEffect(() => {
    fetchInventoryData();
    fetchLocations();
  }, []);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const response = await getAllInventory();
      setInventoryData(response.data.data);
      console.log(response);
    } catch (error) {
      console.error("Error fetching inventory data", error);
    }
    setLoading(false);
  };
  const [locationMap, setLocationMap] = useState<Record<number, string>>({});

  const fetchLocations = async () => {
    try {
      const response = await getAllLocation();
      const locations = response.data.data || response.data || [];
      console.log(response);
      
      const map: Record<number, string> = {};
      locations.forEach((loc: any) => {
        map[loc.id] = loc.name;
      });

      setLocationMap(map);

      
      const locationOptions = locations.map((location: any) => ({
        value: location.id,
        label: location.name,
      }));
      setLocationOptions(locationOptions);
    } catch (error) {
      console.error("Error fetching locations:", error);
      setLocationOptions([]);
      setLocationMap({});
    }
  };

  return (
    <div className="p-4">
       {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
      <h1 className="text-xl font-bold mb-4">Manage Inventory</h1>
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
        <ComponentCard title="Inventory List">
          {loading ? (
         <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
          ) : (
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
                      Inventory Location
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start"
                    >
                      Audit Mapping User
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start"
                    >
                      Audit Receiving User
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start"
                    >
                      Audit Prevailing User
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
                        {index + 1}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {locationMap[item.location_id] ||
                          `ID: ${item.location_id}`}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {item.ship_users_info
                          .map((user) => user.name)
                          .join(", ")}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {item.receive_users_info
                          .map((user) => user.name)
                          .join(", ")}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {item.producing_users_info
                          .map((user) => user.name)
                          .join(", ")}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        <div className="flex gap-2">
                          <button
                            className="bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-2"
                            onClick={() => navigate(`/authorize/${item.location_id}/${item._id}`)}
                          >
                            Authorize
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
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
    </div>
  );
};
