import { FaRegEye } from "react-icons/fa6";
import ComponentCard from "../../../components/common/ComponentCard";
import Button from "../../../components/ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { useNavigate, useSearchParams } from "react-router";
import { getAllLocation } from "../../../services/apis";
import { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { Pagination, Stack } from "@mui/material";

export const ViewStatistics = () => {
    const [locationsData, setLocationsData] = useState<any[]>([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [searchParams] = useSearchParams();
    const date = searchParams.get("date") || "No Date";
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            setLoading(true);
            const res = await getAllLocation();
            if (res?.data?.data) {
                setLocationsData(res.data.data);
            }
        } catch (err) {
            console.error(err);
            setLocationsData([]);
        } finally {
            setLoading(false);
        }
    };


    const totalItems = locationsData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedData = locationsData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
    };



    const backInfo =
    {
        title: "Stock Statistics", path: "/stockStatistics"
    }

    return (
        <>
            {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            <PageBreadcrumb
                pageTitle={`Stock Statistics - (${date})`}
                backInfo={backInfo}
            />

            <ComponentCard title="Stock List">
                <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] ">
                        <TableRow>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Location </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Value 3</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Value 3A</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Action</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {paginatedData.length > 0 ? (
                            paginatedData.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell className="px-4 py-3 text-gray-600 text-start">{item.name}</TableCell>
                                    <TableCell className="px-4 py-3 text-gray-600 text-start">{item?.value || "--"}</TableCell>
                                    <TableCell className="px-4 py-3 text-gray-600 text-start">{item?.value || "--"}</TableCell>
                                    <TableCell className="px-4 py-3 text-gray-600 text-start max-w-2xl">
                                        <div className="gap-2 inline-block">
                                            <Button variant="primary" size="md" onClick={() => navigate(`/stockStatistics/history?date=${date}&location_id=${item.id}`)}>
                                                <FaRegEye size={14} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell className="text-center py-4 text-gray-500">
                                    No data found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </ComponentCard>
            <div className="flex flex-wrap justify-between items-center mt-4">
                <span className="text-sm text-gray-800 dark:text-white/90">
                    {totalItems > 0
                        ? `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, totalItems)
                        } of ${totalItems} entries`
                        : ""}
                </span>
                {totalPages > 1 && (
                    <Stack spacing={2} className="dark:text-white">
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            className="dark:text-white"
                        />
                    </Stack>
                )}
            </div>
        </>
    );
};