import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
// import Button from "../../components/ui/button/Button";
import ComponentCard from "../../components/common/ComponentCard";
import { addRole, deleteRole, getRole } from "../../services/apis";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { EditIcon, Trash2Icon } from "lucide-react";
import { Box, Modal } from "@mui/material";
import { toast } from "react-toastify";
import Badge from "../../components/ui/badge/Badge";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

interface Role {
  _id: string;
  role: string;
  readable_name: string;
  permission_tab?: any[];
}

export const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState("");
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [newRole, setNewRole] = useState("");
  const itemsPerPage = 20;
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAllRoles();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [roles, search]);

  const getAllRoles = async () => {
    setLoading(true);
    try {
      const response = await getRole();
      if (response.data && Array.isArray(response.data.data)) {
        setRoles(response.data.data.reverse());
      } else {
        console.error("Unexpected API response format:", response);
        setRoles([]);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!search.trim()) {
      setFilteredRoles(roles);
    } else {
      const lowercasedSearch = search.toLowerCase();
      const filtered = roles.filter((role) =>
        role.role.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredRoles(filtered);
    }
    setCurrentPage(1);
  };


  const handleSaveRole = async () => {
    if (!newRole.trim()) {
      toast.error("Role name cannot be empty!", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
      return;
    }

    setLoading(true);

    try {
      const body = { role: newRole };
      await addRole(body);
      getAllRoles();
      setIsModalOpen(false);
      setNewRole("");

      toast.success("Role added successfully!", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } catch (error) {
      console.error("Error adding role:", error);

      toast.error("Failed to add role. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setLoading(false);
    }
  };


  const confirmDeleteRole = (id: string, name: string) => {
    setRoleToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };


  const handleDeleteRole = async () => {
    if (!roleToDelete) return;

    try {
      setLoading(true);
      await deleteRole(roleToDelete.id);
      getAllRoles();

      toast.success("Role deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error("Failed to delete role. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
      setLoading(false);
    }
  };

  const countEnabledPermissions = (role: Role) => {
    if (!role.permission_tab || !Array.isArray(role.permission_tab)) return 0;

    let count = 0;
    let enabledTabs = 0;

    role.permission_tab.forEach(tab => {
      let hasEnabledFunctions = false;
      if (tab.tab_function && Array.isArray(tab.tab_function)) {
        const enabledFunctions = tab.tab_function.filter((func: any) => func.is_showFunction);
        count += enabledFunctions.length;
        hasEnabledFunctions = enabledFunctions.length > 0;
      }
      if (hasEnabledFunctions) {
        enabledTabs++;
      }
    });

    return `${count}`;
  };


  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const rolesToRender = filteredRoles.filter(role => role.role !== "testing_role");
  const paginatedRoles = rolesToRender.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setCurrentPage(page);
    }, 500)
  };


  return (
    <div className="p-4">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      {/* <div className="flex justify-between items-center mb-4">
        <div className="mb-4 ">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by role name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full max-w-[400px] rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          size="sm"
          variant="primary"
        >
          Create Role
        </Button>
      </div> */}

      {/* Search Bar */}

      <ComponentCard title="Role Management">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start"
              >
                Role Name
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start"
              >
                Readable Name
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start"
              >
                Permissions
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRoles.length > 0 ? (
              paginatedRoles.map((role, index) => (
                <TableRow key={index}>
                  <TableCell className="px-4 py-3 text-gray-600 text-start">
                    {role.role || "Unnamed Role"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 text-start">
                    {role.readable_name || "Unnamed Role"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 text-start">
                    {countEnabledPermissions(role)}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-600 text-start">
                    <button
                      className="text-blue-500 mr-4"
                      onClick={() => navigate(`/updateAccess/${role.role}`)}
                    >
                      <Badge size="md" color="success">
                        <EditIcon size={14} />
                      </Badge>
                    </button>
                    {/* <button
                      className="text-red-500"
                      onClick={() => confirmDeleteRole(role._id, role.role)}
                    >
                      <Trash2Icon size={16} />
                    </button> */}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <td colSpan={2} className="text-center py-4 text-gray-500">
                  No roles found
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ComponentCard>
      {/* Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
        <span className="text-sm">
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, rolesToRender.length)} of {rolesToRender.length} entries
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



      <Modal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p>
              Are you sure you want to delete this role?
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
                onClick={handleDeleteRole}
              >
                Delete
              </button>
            </div>
          </div>
        </Box>
      </Modal>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
          <div className="bg-white max-w-sm w-full mx-auto p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Create Role</h2>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Enter role name"
            />
            <div className="flex justify-between mt-4">
              <button
                className="text-blue-900 hover:underline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
                onClick={handleSaveRole}
              >
                Save
              </button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};
