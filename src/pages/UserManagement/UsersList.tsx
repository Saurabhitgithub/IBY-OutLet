import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import Badge from "../../components/ui/badge/Badge";
import { EditIcon } from "lucide-react";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import { Grid, Pagination, Stack } from "@mui/material";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { getAllUsers, getAllUsersById, getRole, updateUser, getPermissionByRole } from "../../services/apis";
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

export const UserList: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const itemsPerPageOptions = [10, 20, 50, 100];
    const [users, setUsers] = useState<any[]>([]);
    const [roleOptions, setRoleOptions] = useState<{ value: string; label: string }[]>([]);
    const [paginationLoading, setPaginationLoading] = useState(false);
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const [permissions, setPermissions] = useState({
        canViewUsers: false,
        canCreateUsers: false,
        canEditUsers: false,
        canDeleteUsers: false,
        canToggleStatus: false,
    });
    const [permissionCheckComplete, setPermissionCheckComplete] = useState(false);

    // Helper functions for permissions
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
                checkPermission('User', 'View'),
                checkPermission('User', 'Create'),
                checkPermission('User', 'Update'),
                checkPermission('User', 'Delete'),
            ]);

            setPermissions({
                canViewUsers: canView,
                canCreateUsers: canCreate,
                canEditUsers: canEdit,
                canDeleteUsers: canDelete,
                canToggleStatus: canEdit,
            });

            if (canView) {
                getUsers();
                fetchRoles();
            } else {
                toast.error("You don't have permission to view users", {
                    toastId: "no-permission-view-users", 
                    position: "top-right",
                    autoClose: 3000,
                    style: { zIndex: 9999999999, marginTop: "4rem" },
                });
                navigate('/');
            }
            setPermissionCheckComplete(true);
        };

        initializeComponent();
    }, []);

    const getUsers = async () => {
        setLoading(true);
        try {
            const response = await getAllUsers();
            const userData = response.data.data;
            console.log("User data from API:", userData);
            
            // Log a sample user to see the structure
            if (userData.length > 0) {
                console.log("Sample user data:", userData[0]);
                console.log("Role field:", userData[0].role);
                console.log("Role ID field:", userData[0].role_sqlid);
                console.log("Role MongoDB ID field:", userData[0].role_id);
            }
            
            setUsers(userData.reverse());
        } catch (error) {
            console.error("Error fetching users:", error);
            setUsers([]);
        }
        setLoading(false);
    };

    const fetchRoles = async () => {
        try {
            const response = await getRole();
            console.log("Roles data:", response.data.data);
            
            const roles = response.data.data.map((role: any) => ({
                value: role.id || role._id, // Use id or _id depending on what's available
                label: role.role,
                mongoid: role._id || "", // Store MongoDB ID if available
            }));
            
            console.log("Formatted role options:", roles);
            setRoleOptions(roles);
        } catch (error) {
            console.error("Error fetching roles:", error);
        }
    };

    const handleEditUser = async (_id: string) => {
        if (!permissions.canEditUsers) {
            toast.error("You don't have permission to edit users", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
            return;
        }

        try {
            const response = await getAllUsersById(_id);
            navigate(`/edit/${_id}`);
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    // Helper function to check if a user matches the selected role
    const matchesRole = (user: any, roleId: string | null): boolean => {
        if (!roleId) return true;
        
        // Check all possible role ID fields
        return (
            user.role === roleId || 
            user.role_sqlid?.toString() === roleId.toString() ||
            user.role_id === roleId
        );
    };
    
    // Helper function to get role name for a user
    const getRoleName = (user: any): string => {
        const roleOption = roleOptions.find(
            (option) => 
                option.value === user.role_sqlid?.toString() || 
                option.value === user.role ||
                option.mongoid === user.role_id
        );
        return roleOption ? roleOption.label : (user.role || "Unknown");
    };

    const filteredUsers = users.filter((user) => {
        // Search by name, username, or email
        const searchMatch =
            user?.name?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
            user?.username?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
            user?.email?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
            getRoleName(user).toLowerCase().includes(searchTerm?.toLowerCase()); // Also search by role name
            
        // Search by role - compare both role and role_sqlid
        const roleMatch = matchesRole(user, selectedRole);

        return searchMatch && roleMatch;
    });

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 500);
    };

    const toggleActiveStatus = async (userId: string, currentStatus: boolean) => {
        if (!permissions.canToggleStatus) {
            toast.error("You don't have permission to change user status", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
            return;
        }

        try {
            setLoading(true);
            const userToUpdate = users.find(user => user._id === userId);
            if (!userToUpdate) {
                toast.error("User not found", {
                    position: "top-right",
                    autoClose: 3000,
                    style: { zIndex: 9999999999, marginTop: "4rem" },
                });
                return;
            }

            if (!userToUpdate.id) {
                toast.error("SQL ID not found for this user", {
                    position: "top-right",
                    autoClose: 3000,
                    style: { zIndex: 9999999999, marginTop: "4rem" },
                });
                return;
            }

            const updatePayload = {
                id: Number(userToUpdate.id),
                name: userToUpdate.name || "",
                email: userToUpdate.email || "",
                username: userToUpdate.username || "",
                password: "",
                image: userToUpdate.image || "",
                tel: userToUpdate.tel || "",
                fax: userToUpdate.fax || "",
                country: userToUpdate.country || "",
                states: userToUpdate.states || "",
                address: userToUpdate.address || "",
                report_to: Number(userToUpdate.report_to) || 0,
                country_id: Number(userToUpdate.country_id) || 0,
                replace_by: Number(userToUpdate.replace_by) || 0,
                salary: Number(userToUpdate.salary) || 0,
                added_by: Number(userToUpdate.added_by) || 0,
                is_insider: !currentStatus ? 1 : 0,
                on_job: userToUpdate.on_job ? 1 : 0,
                on_fulltime: userToUpdate.on_fulltime ? 1 : 0,
                role: userToUpdate.role || "",
                role_id: userToUpdate.role_id || "",
                role_sqlid: Number(userToUpdate.role_sqlid) || 0,
                Department_id: Array.isArray(userToUpdate.Department_id)
                    ? userToUpdate.Department_id
                    : [],
                company_id: Array.isArray(userToUpdate.company_id)
                    ? userToUpdate.company_id
                    : [],
                Department_sqlid: Array.isArray(userToUpdate.Department_sqlid)
                    ? userToUpdate.Department_sqlid.map(id => Number(id))
                    : [],
                company_sqlid: Array.isArray(userToUpdate.company_sqlid)
                    ? userToUpdate.company_sqlid.map(id => Number(id))
                    : [],
                remember_token: userToUpdate.remember_token || ""
            };

            const response = await updateUser(userToUpdate.id.toString(), updatePayload);

            if (response.data.success) {
                toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`, {
                    position: "top-right",
                    autoClose: 3000,
                    style: { zIndex: 9999999999, marginTop: "4rem" },
                });
                setUsers(users.map(user =>
                    user._id === userId
                        ? {
                            ...user,
                            active: !currentStatus,
                            is_insider: !currentStatus
                        }
                        : user
                ));
            }
        } catch (error) {
            console.error("Error updating user status:", error);
            toast.error("Failed to update user status", {
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

            {permissionCheckComplete && !permissions.canViewUsers ?
                (
                    <div className="text-center py-8 text-red-500">
                        {/* You don't have permission to view this page */}
                    </div>
                )
                : (
                    <>
                        <h1 className="text-xl font-bold mb-4">Users</h1>

                        <div className="mb-4">
                            <Grid container spacing={1}>
                                <Grid size={{ lg: 4, md: 6, sm: 6 }}>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        placeholder="Search name, username, email"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1); // Reset to first page when search changes
                                        }}
                                        className="h-10 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                                    />
                                </Grid>
                               <Grid size={{ lg: 4, md: 6, sm: 6 }}>
                                    <div className="w-full">
                                        <Select
                                            options={roleOptions}
                                            isClearable
                                            placeholder="Select role..."
                                            onChange={(selected) => {
                                                console.log("Selected role:", selected);
                                                setSelectedRole(selected ? selected.value : null);
                                                setCurrentPage(1); // Reset to first page when filter changes
                                            }}
                                            value={roleOptions.find((option) => option.value === selectedRole) || null}
                                            className="h-10"
                                            classNamePrefix="role-select"
                                            noOptionsMessage={() => "No roles found"}
                                        />
                                    </div>
                                </Grid>
                               <Grid size={{ lg: 4, md: 6, sm: 6 }} >
                                    <Button
                                         className="text-lg text-white-400 w-48 mb-2 h-10 "
                                        onClick={() => {
                                            setSearchTerm("");
                                            setSelectedRole(null);
                                            setCurrentPage(1);
                                            setItemsPerPage(20); // Reset to default
                                        }}
                                        size="sm"
                                        variant="primary"
                                    >
                                        Reset 
                                    </Button>
                                </Grid>
                            </Grid>
                        </div>

                        <div className="relative w-full">
                            {permissions.canCreateUsers && (
                                <button
                                    className="absolute right-0 bg-blue-500 text-white px-3 py-1 mt-3 me-3 rounded flex items-center gap-2"
                                    onClick={() => navigate("/add")}
                                >
                                    <span className="text-lg">+</span> Add
                                </button>
                            )}

                            <ComponentCard title={
                                searchTerm || selectedRole ? 
                                `Users List` : 
                                "Users List"
                            }>
                                <div style={{ overflow: "auto" }}>
                                    <Table>
                                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                            <TableRow>
                                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start">
                                                    Name
                                                </TableCell>
                                                <TableCell isHeader className="px-2 py-3 font-medium text-gray-500 text-start">
                                                    Username
                                                </TableCell>
                                                <TableCell isHeader className="px-2 py-3 font-medium text-gray-500 text-start">
                                                    Role
                                                </TableCell>
                                                <TableCell isHeader className="px-2 py-3 font-medium text-gray-500 text-start">
                                                    Active
                                                </TableCell>
                                                <TableCell isHeader className="px-2 py-3 font-medium text-gray-500 text-start">
                                                    Action
                                                </TableCell>
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                            {paginatedUsers.length > 0 ? (
                                                paginatedUsers.map((data, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell className="py-3 text-gray-600 text-start">
                                                            {data.name}
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 text-gray-600 text-start">
                                                            {data.username}
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 text-gray-600 text-start">
                                                            {getRoleName(data)}
                                                        </TableCell>
                                                        
                                                        <TableCell className="px-4 py-3 text-gray-600 text-start">
                                                            <span
                                                                onClick={() => toggleActiveStatus(data._id, data.is_insider)}
                                                                className={`px-2 py-1 rounded border cursor-pointer ${data.is_insider
                                                                    ? "bg-green-100 text-green-700 border-green-400 hover:bg-green-200"
                                                                    : "bg-red-100 text-red-700 border-red-400 hover:bg-red-200"
                                                                    }`}
                                                            >
                                                                {data.is_insider ? "Active" : "Inactive"}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 text-gray-600 text-start">
                                                            <div className="flex gap-2">
                                                                {permissions.canEditUsers && (
                                                                    <div
                                                                        className="cursor-pointer"
                                                                        onClick={() => handleEditUser(data._id)}
                                                                    >
                                                                        <Badge size="sm" color="info">
                                                                            <EditIcon size={14} />
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
                                                        {searchTerm || selectedRole ? 
                                                            "No results found for your search criteria. Try adjusting your filters." : 
                                                            "No users found in the system."}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </ComponentCard>

                            <div className="flex flex-wrap justify-between items-center mt-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm">
                                        {filteredUsers.length > 0 ? 
                                            `Showing ${Math.min((currentPage - 1) * itemsPerPage + 1, filteredUsers.length)} to ${Math.min(currentPage * itemsPerPage, filteredUsers.length)} of ${filteredUsers.length} entries` : 
                                            `Showing 0 to 0 of 0 entries`}
                                    </span>
                                    <div className="flex items-center">
                                       
                                        {/* <select
                                            id="itemsPerPage"
                                            value={itemsPerPage}
                                            onChange={(e) => {
                                                setItemsPerPage(Number(e.target.value));
                                                setCurrentPage(1); // Reset to first page when changing items per page
                                            }}
                                            className="h-8 rounded border border-gray-300 bg-white px-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                                        >
                                            {itemsPerPageOptions.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select> */}
                                    </div>
                                </div>
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
                    </>
                )}
        </div>
    );
};