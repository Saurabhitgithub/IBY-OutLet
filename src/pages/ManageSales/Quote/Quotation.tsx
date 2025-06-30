import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EditIcon, Trash2Icon, PlusIcon } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../../components/ui/table";
import Badge from "../../../components/ui/badge/Badge";
import ComponentCard from "../../../components/common/ComponentCard";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { Box, Modal } from "@mui/material";
import { deleteQuotation, getAllQuotation, getPermissionByRole } from "../../../services/apis";
import { toast } from "react-toastify";

interface Permission {
    tab_name: string;
    is_show: boolean;
    tab_function: {
        tab_functionName: string;
        is_showFunction: boolean;
        _id: string;
    }[];
}

interface RolePermissions {
    _id: string;
    permission_tab: Permission[];
    role: string;
    [key: string]: any;
}

export const Quotation: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [quotationData, setQuotationData] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteId, setDeleteId] = useState<string | number | null>(null);
    const [loading, setLoading] = useState(false);
    const [permissions, setPermissions] = useState({
        canViewQuotations: false,
        canCreateQuotations: false,
        canEditQuotations: false,
        canDeleteQuotations: false,
    });
    const itemsPerPage = 10;

    // Permission helper functions
    const getCurrentUserRole = (): string => {
        return localStorage.getItem('role') || '';
    };

    const fetchUserPermissions = async (): Promise<RolePermissions | null> => {
        const role = getCurrentUserRole();
        if (!role) return null;

        try {
            const response = await getPermissionByRole({ role });
            return response.data?.data || null;
        } catch (error) {
            console.error('Error fetching permissions:', error);
            return null;
        }
    };

    const checkPermission = async (tabName: string, functionName: string): Promise<boolean> => {
        if (getCurrentUserRole() === 'general_manager') return true;

        const permissions = await fetchUserPermissions();
        if (!permissions) return false;

        const tab = permissions.permission_tab.find(t => t.tab_name === tabName);
        if (!tab) return false;

        const func = tab.tab_function.find(f => f.tab_functionName === functionName);
        return func?.is_showFunction || false;
    };

    useEffect(() => {
        const initializeComponent = async () => {
            const [
                canView,
                canCreate,
                canEdit,
                canDelete,
            ] = await Promise.all([
                checkPermission('Quote', 'View'),
                checkPermission('Quote', 'Create'),
                checkPermission('Quote', 'Update'),
                checkPermission('Quote', 'Delete'),
            ]);

            setPermissions({
                canViewQuotations: canView,
                canCreateQuotations: canCreate,
                canEditQuotations: canEdit,
                canDeleteQuotations: canDelete,
            });

            if (canView) {
                fetchQuotationData();
            } else {
                toast.error("You don't have permission to view quotations", {
                    toastId: "no-permission-view-quotations",
                    position: "top-right",
                    autoClose: 3000,
                    style: { zIndex: 9999999999, marginTop: "4rem" },
                });
                navigate('/');
            }
        };

        initializeComponent();
    }, []);

    const filteredData = quotationData.filter((item) =>
        Object.values(item).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const fetchQuotationData = async () => {
        setLoading(true);
        try {
            const res = await getAllQuotation();
            setQuotationData(res.data.data);
        } catch (error) {
            console.error("Error fetching quotation data:", error);
        }
        setLoading(false);
    }

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };

    const handleDelete = async () => {
        if (!permissions.canDeleteQuotations) {
            toast.error("You don't have permission to delete quotations", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
            setIsDeleteModalOpen(false);
            return;
        }

        if (!deleteId) return;

        setLoading(true);
        try {
            await deleteQuotation(deleteId);
            toast.success("Quotation deleted successfully!", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });

            setIsDeleteModalOpen(false);
            setDeleteId(null);
            fetchQuotationData();
        } catch (error) {
            console.error("Failed to delete quotation:", error);
            toast.error("Failed to delete quotation.", {
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

            {!permissions.canViewQuotations ? (
                <div className="text-center py-8 text-red-500">
                    {/* You don't have permission to view this page */}
                </div>
            ) : (
                <>
                    <h1 className="text-xl font-bold mb-4">Quotation Management</h1>

                    <div className="relative w-full">
                        {permissions.canCreateQuotations && (
                            <button
                                className="absolute right-0 bg-brand text-white px-4 py-2    mt-3 me-3 rounded flex items-center gap-2"
                                onClick={() => navigate("/addQuote")}
                            >
                                <span className="text-md "><PlusIcon /></span>
                            </button>
                        )}

                        <ComponentCard title="Quotation List">
                            <div style={{ overflowX: "auto" }}>
                                <Table>
                                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                        <TableRow>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Our Ref.</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Quotation No.</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Title</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Company Name</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Attention</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Quote By</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Date</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Amount</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Status</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Action</TableCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                        {paginatedItems.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="px-4 py-3 text-gray-600 text-start">
                                                    {item.ref}
                                                    <div className="flex gap-2 mt-2">
                                                        <button
                                                            className="text-blue-600"
                                                            onClick={() => navigate(`/stockList/${item.id}`)}
                                                        >
                                                            Add Item
                                                        </button>
                                                        <button
                                                            className="text-blue-600"
                                                            onClick={() => navigate(`/quotationItem/${item.id}`)}
                                                        >
                                                            View Item
                                                        </button>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-gray-600 text-start">{item.quotation_no}</TableCell>
                                                <TableCell className="px-4 py-3 text-gray-600 text-start">{item.name}</TableCell>
                                                <TableCell className="px-4 py-3 text-gray-600 text-start">{item.companyName}</TableCell>
                                                <TableCell className="px-4 py-3 text-gray-600 text-start">{item.attention}</TableCell>
                                                <TableCell className="px-4 py-3 text-gray-600 text-start">{item.quote_by}</TableCell>
                                                <TableCell className="px-4 py-3 text-gray-600 text-start">{item.created_at}</TableCell>
                                                <TableCell className="px-4 py-3 text-gray-600 text-start">{item.amount}</TableCell>
                                                <TableCell className="px-4 py-3 text-gray-600 text-start">{item.status || "--"}</TableCell>
                                                <TableCell className="px-4 py-3 text-gray-600 text-start">
                                                    <div className="flex gap-2">
                                                        {permissions.canEditQuotations && (
                                                            <div
                                                                className="cursor-pointer"
                                                                onClick={() => navigate(`/editQuote/${item._id}`)}
                                                            >
                                                                <Badge size="sm" color="success">
                                                                    <EditIcon size={14} />
                                                                </Badge>
                                                            </div>
                                                        )}
                                                        {permissions.canDeleteQuotations && (
                                                            <div
                                                                className="cursor-pointer"
                                                                onClick={() => {
                                                                    setDeleteId(item.id ?? null);
                                                                    setIsDeleteModalOpen(true);
                                                                }}
                                                            >
                                                                <Badge size="sm" color="warning">
                                                                    <Trash2Icon size={14} />
                                                                </Badge>
                                                            </div>
                                                        )}
                                                        {permissions.canCreateQuotations && (
                                                            <div
                                                                className="cursor-pointer"
                                                                onClick={() => navigate(`/addQuote`)}
                                                            >
                                                                <Badge size="sm" color="primary">
                                                                    <PlusIcon size={14} />
                                                                </Badge>
                                                            </div>
                                                        )}
                                                    </div>
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
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, quotationData.length)} of {quotationData.length} entries
                            </span>
                        </div>
                    </div>

                    <Modal
                        open={isDeleteModalOpen}
                        onClose={() => {
                            setIsDeleteModalOpen(false);
                            setDeleteId(null);
                        }}
                    >
                        <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg">
                                <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
                                <p>
                                    Are you sure you want to delete this quote?
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
                                        disabled={loading}
                                    >
                                        {loading ? "Deleting..." : "Delete"}
                                    </button>
                                </div>
                            </div>
                        </Box>
                    </Modal>
                </>
            )}
        </div>
    );
};