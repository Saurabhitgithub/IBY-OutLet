import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
// import Select from "react-select";
import { EditIcon, Trash2Icon } from "lucide-react";
import Badge from "../../components/ui/badge/Badge";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import * as React from 'react';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { Box, Modal } from "@mui/material";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { deleteCatalogueById, getAllCatalogue } from "../../services/apis";
import { toast } from "react-toastify";
import moment from "moment";

// interface Option {
//     value: string;
//     label: string;
// }

export const Catalogue: React.FC = () => {
    const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const [catalogueData, setCatalogueData] = useState<any[]>([]);
    const [deleteId, setDeleteId] = useState<string | number | null>(null);
    const [loading, setLoading] = useState(false);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    // const [departmentOptions, setDepartmentOptions] = useState<Option[]>([]);

    React.useEffect(() => {
        fetchCatalogueData();
        // fetchDepartments();
    }, []);
    // const fetchDepartments = async () => {
    //     try {
    //         const response = await getDepartment();
    //         const departments = response.data.data.map((department: any) => ({
    //             value: department.id,
    //             label: department.name,
    //         }));

    //         setDepartmentOptions(departments);
    //     } catch (error) {
    //         console.error("Error fetching departments:", error);
    //     }
    // };
    const fetchCatalogueData = async () => {
        setLoading(true);
        try {
            const response = await getAllCatalogue();
            setCatalogueData(response.data.data.reverse());
            setFilteredData(response.data.data); // Initialize filteredData
        } catch (error) {
            console.error("Error fetching catalogue data:", error);
            setCatalogueData([]);
            setFilteredData([]);
        } finally {
            setLoading(false);
        }
    };
    const handleSearch = () => {
        const filtered = catalogueData.filter((item) => {
            return (
                (searchTerm === "" ||
                    item?.catalogueNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item?.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (!selectedDepartment || item.companyName === selectedDepartment)
            );
        });
        setFilteredData(filtered);
        setCurrentPage(1); // Reset to first page
    };
    const filteredItems = catalogueData.filter((item) => {
        return (
            (searchTerm === "" ||
                item?.catalogueNo?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
                item?.product?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
                item?.companyName?.toLowerCase().includes(searchTerm?.toLowerCase())) &&
            (!selectedDepartment || item.companyName === selectedDepartment)
        );
    });
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedUsers = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setLoading(true);
        setTimeout(() => {
            setCurrentPage(page);
            setLoading(false);
        }, 500);
    };

    const handleDelete = async () => {
        setLoading(true);

        if (!deleteId) {
            setLoading(false);
            return;
        }

        try {
            await deleteCatalogueById(deleteId);
            setIsDeleteModalOpen(false);
            setDeleteId(null);
            await fetchCatalogueData();

            toast.success("Catalogue deleted successfully!", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete catalogue.", {
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
            <h2 className="text-xl  font-semibold mb-4">Catalogue</h2>

            <div className="mb-4 mt-2">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="w-full ">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search catalogue, product or company"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 w-full max-w-[450px] rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                        />
                    </div>
                    {/*<div className="w-full sm:w-auto">
                        <div className="w-full max-w-[400px] rounded shadow-lg">
                            <Select
                                options={departmentOptions}
                                isClearable
                                placeholder="Select department..."
                                onChange={(selected) =>
                                    setSelectedDepartment(selected ? selected.value : null)
                                }
                            />
                        </div>
                    </div> */}
                    <div className="ml-auto">

                        <div className="ml-auto flex gap-2">
                            <Button
                                onClick={handleSearch}
                                size="sm"
                                variant="primary"
                            >
                                Search
                            </Button>
                            <Button
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedDepartment(null);
                                    setFilteredData(catalogueData);
                                    setCurrentPage(1);
                                }}
                                size="sm"
                                variant="primary"

                            >Reset Filter
                            </Button>
                        </div>
                    </div>
                </div>

            </div>

            <span className="text-sm text-gray-500">Showing {Math.min((currentPage - 1) * itemsPerPage + 1, catalogueData.length)} to {Math.min(currentPage * itemsPerPage, catalogueData.length)} of {catalogueData.length} entries</span>

            <div className="relative w-full">
                {/* <button
                    className="absolute right-0 bg-blue-500 text-white px-3 py-1 mt-3 me-3 rounded flex items-center gap-2"
                    onClick={() => navigate("/addCatalog")}
                >
                    <span className="text-lg">+</span> Add
                </button> */}
                <Button
                    className="absolute right-0 text-white px-3 py-0 mt-2 me-3 rounded flex items-center gap-2"
                    onClick={() => navigate("/addCatalog")}
                    size="sm"
                    variant="primary"
                >
                    <span className="text-lg">+</span> Add
                </Button>

                <ComponentCard title="Catalogue List">
                    <div style={{ overflow: "auto" }}>
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                                        Catalogue NO
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                                        Company Name
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                                        Product
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                                        Author
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                                        Date
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                                        Action
                                    </TableCell>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {paginatedUsers.length > 0 ? (
                                    paginatedUsers.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="px-4 py-3 text-gray-600 text-start">
                                                {item.file_id}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-600 text-start">
                                                {item.company}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-600 text-start">
                                                {item.product}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-600 text-start">
                                                {item.user_info?.name}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-600 text-start">
                                                {moment(item.created_at).format("YYYY-MM-DD")}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-600 text-start">
                                                <div className="flex gap-2">
                                                    <div className="cursor-pointer"
                                                        onClick={() => navigate(`/editCatalog/${item._id}`)}
                                                    >
                                                        <Badge size="md" color="success">
                                                            <EditIcon size={14} />
                                                        </Badge>
                                                    </div>

                                                    <div className="cursor-pointer" onClick={() => {
                                                        setDeleteId(item.id ?? null);
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
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell className="text-center py-4 text-gray-500">
                                            No results found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </ComponentCard>

                <div className="flex flex-wrap justify-between items-center mt-4">
                    <span className="text-sm text-gray-500">Showing {Math.min((currentPage - 1) * itemsPerPage + 1, catalogueData.length)} to {Math.min(currentPage * itemsPerPage, catalogueData.length)} of {catalogueData.length} entries</span>


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
            </div>
            <Modal
                open={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
            >
                <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
                        <p>
                            Are you sure you want to delete this catalogue?
                        </p>
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