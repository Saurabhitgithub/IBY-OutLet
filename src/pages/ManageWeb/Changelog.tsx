import React, { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import { getAllChangeLogs, getAllUsers } from "../../services/apis";
import Button from "../../components/ui/button/Button";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

type Option = {
  label: string;
  value: string;
};

type ChangeLog = {
  id: number;
  name: string;
  created_at: string;
  ip: string;
  action_type: string;
  logDetail?: string;
};

const logFields = [
  { label: "Operator Name", key: "name" },
  { label: "Log Time", key: "logTime" },
  { label: "IP Address", key: "Ip" },
  { label: "Action Type", key: "actiontype" },
];

export const ChangeLog: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [users, setUsers] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [changeLogs, setChangeLogs] = useState<ChangeLog[]>([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      const userData = response.data?.data || [];
      const formattedUsers = userData.map((user: any) => ({
        value: user.id.toString(),
        label: user.name,
      }));
      setUsers([{ label: "All Users", value: "" }, ...formattedUsers]);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchChangeLogs = async () => {
    try {
      setLoading(true);
      const res = await getAllChangeLogs({
        search: searchQuery,
        user_id: selectedUser ? parseInt(selectedUser) : 0,
        page: pagination.page,
        limit: pagination.limit,
      });

      const responseData = res.data?.data;
      const rawData = Array.isArray(responseData?.data)
        ? responseData.data
        : [];

      const transformedLogs: ChangeLog[] = rawData.map((item: any) => ({
        id: item.id,
        name: item.userInfo?.name ?? "-",
        logTime: item.created_at ?? "-",
        Ip: item.ip ?? "-",
        actiontype: item.action_type ?? "-",
        logDetail: item.action ?? "",
      }));

      setChangeLogs(transformedLogs);
      setPagination((prev) => ({
        ...prev,
        total: responseData?.total || 0,
      }));
    } catch (error) {
      console.error("Error fetching change logs:", error);
      setChangeLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchChangeLogs();
    }, 300);
    return () => clearTimeout(timer);
  }, [pagination.page, pagination.limit, searchQuery, selectedUser]);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(pagination.total / pagination.limit);

    return (
      <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
        <span className="text-sm text-gray-600">
          Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
          {pagination.total} entries
        </span>
        <Stack spacing={2}>
          <Pagination
            count={totalPages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
          />
        </Stack>
      </div>
    );
  };

  const renderCards = (data: ChangeLog[]) => {
    if (loading) {
      return (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="text-center text-gray-400 py-4">
          No matching logs found.
        </div>
      );
    }

    return (
      <>
        {data.map((log) => (
          <ComponentCard key={log.id} title="">
            <table className="w-full text-sm text-left table-fixed">
              <thead>
                <tr className="border-b border-gray-100">
                  {logFields.map((field, idx) => (
                    <th
                      key={idx}
                      className="w-1/4 py-2 font-medium text-gray-600"
                    >
                      {field.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  {logFields.map((field, idx) => (
                    <td key={idx} className="w-1/4 py-2 text-gray-800">
                      {log[field.key as keyof ChangeLog]}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>

            <div className="max-w-full text-gray-700 text-sm text-left break-words">
              <h3 className="text-center font-semibold underline">
                Log_Detail
              </h3>
               <hr className="my-4 border-t border-gray-300" />
              <span
                dangerouslySetInnerHTML={{
                  __html: (log.logDetail || "No details available.")
                    .replace(/<br\s*\/?>/gi, " ") 
                    .replace(/\s+/g, " ") 
                    .trim(),
                }}
              />
            </div>
          </ComponentCard>
        ))}
        {renderPagination()}
      </>
    );
  };

  return (
    <div className="p-4">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <h1 className="text-xl font-bold mb-4">View FAQ/PO Change Log</h1>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 flex-2 min-w-[200px] rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
        />
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="h-11 flex-1 min-w-[150px] rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
        >
          {users.map((user) => (
            <option key={user.value} value={user.value}>
              {user.label}
            </option>
          ))}
        </select>
        <Button
          size="sm"
          variant="primary"
          className="h-11 px-4  min-w-[250px] "
          onClick={() => {
            setSearchQuery("");
            setSelectedUser("");
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
        >
          Reset
        </Button>
      </div>

      <div className="mt-6 space-y-6">{renderCards(changeLogs)}</div>
    </div>
  );
};
