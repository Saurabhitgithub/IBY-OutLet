import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EditIcon, Trash2Icon } from "lucide-react";
import ComponentCard from "../../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Badge from "../../../components/ui/badge/Badge";
import { Box, Modal, Stack, Pagination } from "@mui/material";
import { deleteDepartment, getDepartment, getPermissionByRole } from "../../../services/apis";
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

export const ManageDepartments = () => {
    const [departments, setDepartments] = useState<any[]>([]);
    const [filteredDepartments, setFilteredDepartments] = useState<any[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const [permissions, setPermissions] = useState({
        canViewDepartments: false,
        canCreateDepartments: false,
        canEditDepartments: false,
        canDeleteDepartments: false,
    });
    const navigate = useNavigate();
    const inputRef = useRef(null);

    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };

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
                checkPermission('Manage Department', 'View'),
                checkPermission('Manage Department', 'Create'),
                checkPermission('Manage Department', 'Update'),
                checkPermission('Manage Department', 'Delete'),
            ]);

            setPermissions({
                canViewDepartments: canView,
                canCreateDepartments: canCreate,
                canEditDepartments: canEdit,
                canDeleteDepartments: canDelete,
            });

            if (canView) {
                getAllDepartment();
            } else {
                toast.error("You don't have permission to view departments", {
                    toastId: "no-permission-view-departments",
                    position: "top-right",
                    autoClose: 3000,
                    style: { zIndex: 9999999999, marginTop: "4rem" },
                });
                navigate('/');
            }
        };

        initializeComponent();
    }, []);

    const getAllDepartment = async () => {
        setLoading(true);
        try {
            const response = await getDepartment();
            console.log(response, "h");

            console.log("Fetched department Data:", response.data.data);

            if (response.data && Array.isArray(response.data.data)) {
                setDepartments(response.data.data);
                setFilteredDepartments(response.data.data);
            } else {
                console.error("Unexpected API response format:", response);
                setDepartments([]);
            }
        } catch (error) {
            console.error("Error fetching department:", error);
            setDepartments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!permissions.canDeleteDepartments) {
            toast.error("You don't have permission to delete departments", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
            setIsDeleteModalOpen(false);
            return;
        }

        if (!selectedDepartmentId) return;
        console.log("Deleting department with id", selectedDepartmentId);

        setLoading(true);
        try {
            const res = await deleteDepartment(Number(selectedDepartmentId));
            console.log(res);
            if (res.status === 200) {
                const newList = departments.filter((item) => item.id !== selectedDepartmentId);
                setDepartments(newList);
                toast.success("Department deleted successfully!", {
                    position: "top-right",
                    autoClose: 3000,
                    style: { zIndex: 9999999999, marginTop: "4rem" },
                });
            } else {
                console.log("Failed to delete the department:", res.status);
                toast.error("Failed to delete department.", {
                    position: "top-right",
                    autoClose: 3000,
                    style: { zIndex: 9999999999, marginTop: "4rem" },
                });
            }
        } catch (error) {
            console.error("Error deleting department:", error);
            toast.error("Error deleting department.", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
        } finally {
            setIsDeleteModalOpen(false);
            setSelectedDepartmentId(null);
            setLoading(false);
        }
    };

    useEffect(() => {
        const term = searchTerm.toLowerCase();
        const filtered = departments.filter((dept) =>
            dept.name.toLowerCase().includes(term) || dept.id.toString().includes(term)
        );
        setFilteredDepartments(filtered);
    }, [searchTerm, departments]);

    const totalPages = Math.ceil(departments.length / itemsPerPage);
    const paginatedUsers = departments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="py-3">
            {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}

            {!permissions.canViewDepartments ? (
                <div className="text-center py-8 text-red-500">
                    {/* You don't have permission to view this page */}
                </div>
            ) : (
                <>
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white/90">Departments</h2>

                    {/* <div className="flex justify-between items-center mb-4 mt-2">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search... "
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-11 w-full max-w-[400px] rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                        />
                    </div> */}
                     <span className="text-sm">
                                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, departments.length)} to{" "}
                                {Math.min(currentPage * itemsPerPage, departments.length)} of {departments.length} entries
                            </span>

                    <div className="relative w-full">
                        {permissions.canCreateDepartments && (
                            <button
                                className="absolute right-0 bg-blue-500 text-white px-3 py-1 mt-3 me-3 rounded flex items-center gap-2"
                                onClick={() => navigate("/manageDepartment/create")}
                            >
                                <span className="text-lg">+</span> Add
                            </button>
                        )}

                        <ComponentCard title="Departments List">
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
                                            Created at
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
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-gray-600 text-start">
                                                    {item.name}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-gray-600 text-start">
                                                    {moment(item.createdAt).format("YYYY-MM-DD")}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-gray-600 text-start">
                                                    <div className="flex gap-2">
                                                        {permissions.canEditDepartments && (
                                                            <div
                                                                className="cursor-pointer"
                                                                onClick={() => navigate(`/manageDepartment/update/${item.id}`)}
                                                            >
                                                                <Badge size="md" color="info">
                                                                    <EditIcon size={14} />
                                                                </Badge>
                                                            </div>
                                                        )}
                                                        {permissions.canDeleteDepartments && (
                                                            <div
                                                                className="cursor-pointer"
                                                                onClick={() => {
                                                                    setSelectedDepartmentId(item.id);
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
                        </ComponentCard>

                        <div className="flex flex-wrap justify-between items-center mt-4">
                            <span className="text-sm">
                                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, departments.length)} to{" "}
                                {Math.min(currentPage * itemsPerPage, departments.length)} of {departments.length} entries
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
                                <p>
                                    Are you sure you want to delete this department?
                                </p>
                                <div className="flex justify-end mt-4">
                                    <button
                                        className="text-gray-600 hover:text-gray-900 mr-4"
                                        onClick={() => {
                                            setSelectedDepartmentId(null);
                                            setIsDeleteModalOpen(false)
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
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