import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EditIcon, Trash2Icon, PlusIcon } from "lucide-react";
import Badge from "../../components/ui/badge/Badge";
import { Button } from "@mui/material";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import ComponentCard from "../../components/common/ComponentCard";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { deleteTitle, getTitle, getTitleById, getPermissionByRole } from "../../services/apis";
import { Box, Modal } from "@mui/material";
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

export const Title: React.FC = () => {
    const navigate = useNavigate();
    const [titles, setTitles] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [permissions, setPermissions] = useState({
        canViewTitles: false,
        canCreateTitles: false,
        canEditTitles: false,
        canDeleteTitles: false,
    });
    const itemsPerPage = 5;

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
                checkPermission('Title', 'View'),
                checkPermission('Title', 'Create'),
                checkPermission('Title', 'Update'),
                checkPermission('Title', 'Delete'),
            ]);

            setPermissions({
                canViewTitles: canView,
                canCreateTitles: canCreate,
                canEditTitles: canEdit,
                canDeleteTitles: canDelete,
            });

            if (canView) {
                getAllTitles();
            } else {
                toast.error("You don't have permission to view titles", {
                    toastId: "no-permission-view-titles",
                    position: "top-right",
                    autoClose: 3000,
                    style: { zIndex: 9999999999, marginTop: "4rem" },
                });
                navigate('/');
            }
        };

        initializeComponent();
    }, []);

    const openDeleteModal = (item: any) => {
        if (!permissions.canDeleteTitles) {
            toast.error("You don't have permission to delete titles", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
            return;
        }
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    const getAllTitles = async () => {
        console.log("Calling getTitle()");
        setLoading(true);
        try {
            const response = await getTitle();
            console.log("Fetched Titles Data:", response.data.data);

            if (response.data && Array.isArray(response.data.data)) {
                setTitles(response.data.data);
            } else {
                console.error("Unexpected API response format:", response);
                setTitles([]);
            }
        } catch (error) {
            console.error("Error fetching titles:", error);
            setTitles([]);
        }
        setLoading(false);
    };

    const handleEditTitle = async (_id: string) => {
        if (!permissions.canEditTitles) {
            toast.error("You don't have permission to edit titles", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
            return;
        }

        try {
            setLoading(true);
            const response = await getTitleById(_id);
            const titleData = response.data;
            navigate(`/edit-title/${_id}`, { state: { titleData } });
        } catch (error) {
            console.error("Error fetching title data:", error);
        }
        setLoading(false);
    };

    const confirmDeleteTitle = async () => {
        if (!permissions.canDeleteTitles) {
            toast.error("You don't have permission to delete titles", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
            setIsDeleteModalOpen(false);
            return;
        }

        if (!selectedItem) return;

        try {
            setLoading(true);
            const payload = {
                sql_id: selectedItem.id,
                mongo_id: selectedItem._id,
            };

            console.log("Payload for deletion:", payload);
            await deleteTitle(payload);
            await getAllTitles();

            toast.success("Company deleted successfully!", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
        } catch (error) {
            console.error("Error deleting company:", error);
            toast.error("Failed to delete company.", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
        } finally {
            setIsDeleteModalOpen(false);
            setSelectedItem(null);
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(titles.length / itemsPerPage);
    const paginatedItems = titles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="p-4">
            {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}

            {!permissions.canViewTitles ? (
                <div className="text-center py-8 text-red-500">
                    {/* You don't have permission to view this page */}
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-xl font-bold mb-4">Company Info Management</h1>
                        <button
                            variant="contained"
                            onClick={() => navigate(-1)}
                            className="right-2 bg-brand text-white px-5 py-3 mt-3 me-2 rounded-xl flex items-center gap-2  "
                            size="small"
                        >
                            Back
                        </button>
                    </div>

                    <div className="relative w-full">
                        {permissions.canCreateTitles && (
                            <button
                                className="absolute right-0 bg-brand text-white px-3 py-2 mt-3 me-3 rounded-xl flex items-center gap-2"
                                onClick={() => navigate("/title/addTitle")}
                            >
                                <span className="text-md "><PlusIcon /></span>
                            </button>
                        )}

                        <ComponentCard title="Company List">
                            <div style={{ overflowX: "auto" }}>
                                <Table>
                                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                        <TableRow>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Company Name</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Bank</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Account Man</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Address</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Phone</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">HomePage</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Logo</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Make Check</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Action</TableCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                        {loading ? (
                                            <TableRow>
                                                <td colSpan={9} className="text-center py-4">Loading...</td>
                                            </TableRow>
                                        ) : paginatedItems.length > 0 ? (
                                            paginatedItems.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="px-4 py-3 text-gray-600 text-start">{item?.codeDetails?.name || "--"}</TableCell>
                                                    <TableCell className="px-4 py-3 text-gray-600 text-start">{item.bank || "--"}</TableCell>
                                                    <TableCell className="px-4 py-3 text-gray-600 text-start">{item.acc_man || "--"}</TableCell>
                                                    <TableCell className="px-4 py-3 text-gray-600 text-start">{item.address || "--"}</TableCell>
                                                    <TableCell className="px-4 py-3 text-gray-600 text-start">{item.phone || "--"}</TableCell>
                                                    <TableCell className="px-4 py-3 text-gray-600 text-start">{item.homepage || "--"}</TableCell>
                                                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                                                        {item?.logo ? (
                                                            <span className="truncate max-w-xs inline-block">
                                                                {item.logo}
                                                            </span>
                                                        ) : "--"}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-gray-600 text-start">{item.make_check || "--"}</TableCell>
                                                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                                                        <div className="flex gap-2">
                                                            {permissions.canEditTitles && (
                                                                <div
                                                                    className="cursor-pointer"
                                                                    onClick={() => handleEditTitle(item._id)}
                                                                >
                                                                    <Badge size="sm" color="success">
                                                                        <EditIcon size={14} />
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                            {permissions.canDeleteTitles && (
                                                                <div
                                                                    className="cursor-pointer"
                                                                    onClick={() => openDeleteModal(item)}
                                                                >
                                                                    <Badge size="sm" color="warning">
                                                                        <Trash2Icon size={14} />
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <td colSpan={9} className="text-center py-4">No data found.</td>
                                            </TableRow>
                                        )}
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
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, titles.length)} of {titles.length} entries
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
                                    Are you sure you want to delete this company?
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
                                        onClick={confirmDeleteTitle}
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