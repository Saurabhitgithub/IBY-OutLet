import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { EditIcon, Trash2Icon } from "lucide-react";
import Button from "../../../components/ui/button/Button";
import ComponentCard from "../../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { Grid, Stack, Pagination } from "@mui/material";
import { Box, Modal } from "@mui/material";
import Badge from "../../../components/ui/badge/Badge";
import { deleteCode, getAllCode, getPermissionByRole, updateCode } from "../../../services/apis";
import { toast } from "react-toastify";
import moment from "moment";

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

const sortByType = [
    { value: "OEM", label: "OEM" },
    { value: "Location", label: "Location" },
    { value: "Size", label: "Size" },
    { value: "title", label: "title" },
    { value: "Pressure", label: "Pressure" },
    { value: "Material", label: "Material" },
    { value: "term", label: "term" },
    { value: "iploc", label: "iploc" },
    { value: "pay", label: "pay" },
    { value: "gst", label: "gst" },
    { value: "Manufacturer", label: "Manufacturer" },
    { value: "shipterm", label: "shipterm" },
    { value: "shipmethod", label: "shipmethod" },
];

const sortByStatus = [
    { value: "1", label: "Active" },
    { value: "0", label: "Inactive" }
];

const sortByTrashed = [
    { value: "with", label: "Trashed with" },
    { value: "only", label: "Trashed only" }
];

export const CodeManagement = () => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const [deleteId, setDeleteId] = useState<string | number | null>(null);
    const [code, setCode] = useState<any[]>([]);
    const [filterType, setFilterType] = useState<any>(null);
    const [filterStatus, setFilterStatus] = useState<any>(null);
    const [filterTrashed, setFilterTrashed] = useState<any>(null);
    const [permissions, setPermissions] = useState({
        canViewCodes: false,
        canCreateCodes: false,
        canEditCodes: false,
        canDeleteCodes: false,
    });
    const navigate = useNavigate();

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
                checkPermission('Manage Code', 'View'),
                checkPermission('Manage Code', 'Create'),
                checkPermission('Manage Code', 'Update'),
                checkPermission('Manage Code', 'Delete'),
            ]);

            setPermissions({
                canViewCodes: canView,
                canCreateCodes: canCreate,
                canEditCodes: canEdit,
                canDeleteCodes: canDelete,
            });

            if (canView) {
                getCode();
            } else {
                toast.error("You don't have permission to view codes", {
                    toastId: "no-permission-view-logs",
                    position: "top-right",
                    autoClose: 3000,
                    style: { zIndex: 9999999999, marginTop: "4rem" },
                });
                navigate('/');
            }
        };

        initializeComponent();
    }, []);

    const filteredCode = useMemo(() => {
        return code.filter((item) => {
            const matchesSearch = searchTerm
                ? item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.code?.toLowerCase().includes(searchTerm.toLowerCase())
                : true;

            const matchesType = filterType ? item.type === filterType.value : true;
            const matchesStatus = filterStatus ? String(item.is_active) === filterStatus.value : true;
            const matchesTrashed = filterTrashed ? item.trashed === filterTrashed.value : true;

            return matchesSearch && matchesType && matchesStatus && matchesTrashed;
        });
    }, [code, searchTerm, filterType, filterStatus, filterTrashed]);

    const getCode = async () => {
        setLoading(true);
        try {
            const response = await getAllCode();
            setCode(response.data.data.reverse());
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setSearchTerm("");
        setFilterType(null);
        setFilterStatus(null);
        setFilterTrashed(null);
        setCurrentPage(1);
    };

    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };

    const handleDelete = async () => {
        if (!permissions.canDeleteCodes) {
            toast.error("You don't have permission to delete codes", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
            setIsDeleteModalOpen(false);
            return;
        }

        setLoading(true);

        if (!deleteId) {
            setLoading(false);
            return;
        }

        try {
            await deleteCode(deleteId);
            setIsDeleteModalOpen(false);
            setDeleteId(null);
            getCode();
            toast.success("Code deleted successfully!", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
        } catch (error) {
            console.error("Failed to delete code:", error);
            toast.error("Failed to delete code.", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(filteredCode.length / itemsPerPage);
    const paginatedUsers = filteredCode.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const toggleCodeStatus = async (item: any) => {
        if (!permissions.canEditCodes) {
            toast.error("You don't have permission to change code status", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
            return;
        }

        setLoading(true);
        try {
            const newStatus = item.is_active === "1" || item.is_active === 1 ? 0 : 1;
            const updatePayload = { ...item, is_active: newStatus };

            await updateCode(item.id, updatePayload);

            toast.success(
                `Code status changed to ${newStatus === 1 ? "Active" : "Inactive"}!`,
                {
                    position: "top-right",
                    autoClose: 3000,
                    style: { zIndex: 9999999999, marginTop: "4rem" },
                }
            );

            setCode((prev) =>
                prev.map((c) =>
                    c.id === item.id ? { ...c, is_active: newStatus } : c
                )
            );
        } catch (error) {
            console.error("Failed to update code status:", error);
            toast.error("Failed to update code status.", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-3">
            {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}

            {!permissions.canViewCodes ? (
                <div className="text-center py-8 text-red-500">
                    {/* You don't have permission to view this page */}
                </div>
            ) : (
                <>
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white/90">Code Management</h2>

                    <Grid container spacing={3} className="items-center mb-4">
                        <Grid size={{ lg: 3, md: 6, sm: 6 }}>
                            <input
                                type="text"
                                placeholder="Search... "
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-11 w-full rounded-lg border bg-white border-gray-200 dark:border-gray-800 dark:bg-white/[0.03] text-gray-800 dark:text-white/90 px-4 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                            />
                        </Grid>

                        <Grid size={{ lg: 3, md: 6, sm: 6 }}>
                            <Select
                                options={sortByType}
                                isClearable
                                placeholder="Type..."
                                value={filterType}
                                onChange={(selected) => setFilterType(selected)}
                            />
                        </Grid>
                        <Grid size={{ lg: 3, md: 6, sm: 6 }}>
                            <Select
                                options={sortByStatus}
                                isClearable
                                placeholder="Status..."
                                value={filterStatus}
                                onChange={(selected) => setFilterStatus(selected)}
                            />
                        </Grid>
                        <Grid size={{ lg: 3, md: 6, sm: 6 }}>
                            <Select
                                options={sortByTrashed}
                                isClearable
                                placeholder="Trashed..."
                                value={filterTrashed}
                                onChange={(selected) => setFilterTrashed(selected)}
                            />
                        </Grid>
                    </Grid>

                    <div className="justify-items-end">
                        <div>
                            <Button
                                size="sm"
                                variant="primary"
                                className="ml-4"
                                onClick={resetFilters}
                            >
                                Reset Filter
                            </Button>
                        </div>
                    </div>
                    <span className="text-sm">
                        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, code.length)} to{" "}
                        {Math.min(currentPage * itemsPerPage, code.length)} of {code.length} entries
                    </span>

                    <div className="relative w-full">
                        {permissions.canCreateCodes && (
                            <Button
                                size="sm"
                                variant="primary"
                                className="absolute right-0 text-white px-3 py-1 mt-3 me-3 rounded flex items-center gap-2"
                                onClick={() => navigate("/manageCode/add")}
                            >
                                <span className="text-lg">+</span> Add
                            </Button>
                        )}
                        <ComponentCard title="Code List">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                        <TableRow>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                                                ID
                                            </TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                                                Name
                                            </TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                                                Type
                                            </TableCell>
                                            <TableCell isHeader className="px-2 py-3 font-medium text-gray-500 text-start">
                                                Code
                                            </TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                                                Status
                                            </TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                                                Created at
                                            </TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start w-2">
                                                Action
                                            </TableCell>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                        {paginatedUsers.length > 0 ? (
                                            paginatedUsers.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                                                        {item.id}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                                                        {item.name}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                                                        {item.type}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                                                        {item.long_code}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                                                        <span
                                                            onClick={() => toggleCodeStatus(item)}
                                                            className={`px-2 py-1 rounded border cursor-pointer ${item.is_active === "1" || item.is_active === 1
                                                                    ? "bg-green-100 text-green-700 border-green-400 hover:bg-green-200"
                                                                    : "bg-red-100 text-red-700 border-red-400 hover:bg-red-200"
                                                                }`}
                                                            title="Click to toggle status"
                                                        >
                                                            {item.is_active === "1" || item.is_active === 1 ? "Active" : "Inactive"}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                                                        {moment(item.updated_at).format("YYYY-MM-DD")}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                                                        <div className="flex gap-2">
                                                            {permissions.canEditCodes && (
                                                                <div
                                                                    className="cursor-pointer"
                                                                    onClick={() => navigate(`/manageCode/edit/${item.id}`)}
                                                                >
                                                                    <Badge size="sm" color="info">
                                                                        <EditIcon size={14} />
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                            {permissions.canDeleteCodes && (
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
                            <span className="text-sm">
                                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, code.length)} to{" "}
                                {Math.min(currentPage * itemsPerPage, code.length)} of {code.length} entries
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
                    </div>
                    <Modal
                        open={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)}
                    >
                        <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg">
                                <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
                                <p>Are you sure you want to delete this item?</p>
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