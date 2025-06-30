import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import ComponentCard from "../../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { useNavigate, useParams } from "react-router";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { getAllProductByPageLimit } from "../../../services/apis";

export const StockListing: React.FC = () => {
    const { id: quoteId } = useParams();
    console.log("Quotation ID:", quoteId);
    const navigate = useNavigate();
    const [productData, setProductData] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, [currentPage, itemsPerPage]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await getAllProductByPageLimit(currentPage, itemsPerPage);
            console.log("API response:", response.data);
            setProductData(response.data.data.data);
            setTotalItems(response.data.data.total);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
        setLoading(false);
    };



    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
        <div>
            {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Stock List</h2>
                <button className="btn bg-brand px-4 py-3 rounded-xl" onClick={() => navigate(-1)} >
                    Back
                </button>
            </div>

            <ComponentCard title="">
                <div style={{ overflowX: "auto" }}>
                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Size</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Pressure</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Sub Category</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Item Name</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Member Price</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Valid Since</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Material</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Description</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Action</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {productData.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="px-4 py-3 text-gray-600 text-start">{item.sizeData?.[0]?.name || "-"}</TableCell>
                                    <TableCell className="px-4 py-3 text-gray-600 text-start">{item.pressure_data?.[0]?.name || "-"}</TableCell>
                                    <TableCell className="px-4 py-3 text-gray-600 text-start">{item.subcategory_data?.[0]?.name}</TableCell>
                                    <TableCell className="px-4 py-3 text-gray-600 text-start">{item.model}</TableCell>
                                    <TableCell className="px-4 py-3 text-gray-600 text-start">{item.list_converter}</TableCell>
                                    <TableCell className="px-4 py-3 text-gray-600 text-start">{item.valid_since}</TableCell>
                                    <TableCell className="px-4 py-3 text-gray-600 text-start">{item.materialData?.[0]?.name}</TableCell>
                                    <TableCell className="px-4 py-3 text-gray-600 text-start">{item.description}</TableCell>
                                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                                        <button
                                            className="bg-brand px-4 py-3 rounded-xl"
                                            onClick={() => navigate(`/addItem/${quoteId}/${item.id}`)}
                                        >
                                            Add
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </ComponentCard>

            <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
                <Stack spacing={2}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                    />
                </Stack>
                <span className="text-sm">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                </span>
            </div>
        </div>
    );
};

export default StockListing;
