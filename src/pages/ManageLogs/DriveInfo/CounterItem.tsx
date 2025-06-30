
import ComponentCard from "../../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import * as React from 'react';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { useParams } from "react-router";
import { getAllDriveInfo } from "../../../services/apis";



interface CounterDataItem {
    no: number;
    username: string;
    totaldistance: number;

}






export const CounterItem: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
      const [loading, setLoading] = useState<boolean>(false);
  const [driveData, setDriveData] = useState<CounterDataItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
 
    let { id } = useParams();

  const itemsPerPage = 10;
    

const fetchDriveInfo = async () => {
    setLoading(true);
    try {
      const response = await getAllDriveInfo();
      const dataArray = response.data?.data || [];

      // Group and aggregate total distance by user
      const userMap: Record<string, number> = {};
      const usernameMap: Record<string, string> = {};

      dataArray.forEach((item: any) => {
        const userId = item.user_id;
        const username = item.userData?.[0]?.name || "Unknown";
        const distance = parseFloat(item.distance?.$numberDecimal || "0");

        if (!userMap[userId]) {
          userMap[userId] = 0;
          usernameMap[userId] = username;
        }

        userMap[userId] += distance;
      });

      const formatted: CounterDataItem[] = Object.entries(userMap).map(
        ([userId, total], index) => ({
          no: index + 1,
          username: usernameMap[userId],
          totaldistance: Math.round(total), // round if desired
        })
      );

      setDriveData(formatted);
    } catch (err) {
      setError("Failed to fetch drive info data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriveInfo();
  }, []);
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
  const filteredItems = driveData.filter((item) =>
    item.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedItems = filteredItems.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);
      const backInfo = { title: " Drive", path: "/drive" };
    return (
           <div className="p-4">
            {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <PageBreadcrumb
        pageTitle={id ? " Count" : " Count Info"}
        backInfo={backInfo}
      />

      <ComponentCard title="Counter Drive Info">
        <div style={{ overflow: "auto" }}>
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center">NO.</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center">User Name</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center">Total Distance (Miles/Kms)</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center">Details</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {paginatedItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="px-4 py-3 text-gray-600 text-center">{item.no}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 text-center">{item.username}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 text-center">{item.totaldistance}</TableCell>
                  <TableCell className="px-4 py-3 text-blue-600 text-center">
                    <button onClick={() => navigate("/drive/viewcounterInfo")}>View Details</button>
                  </TableCell>
                </TableRow>
              ))}
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
    </div>
    );
}