import { Button, Grid } from "@mui/material";
import ComponentCard from "../../../components/common/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useNavigate } from "react-router";
import Label from "../../../components/form/Label";
import Badge from "../../../components/ui/badge/Badge";
import { EditIcon, Trash2Icon } from "lucide-react";
import { Box, Modal } from "@mui/material";
import { useEffect, useState, useCallback } from "react";
import {
  deleteJobMtr,
  getJobMtrById,
  getJobmtrbyPageLimits,
} from "../../../services/apis";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { toast } from "react-toastify";
import moment from "moment";

const debounce = (func: Function, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
};

export default function MtrListing() {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [jobMtrList, setJobMtrList] = useState<any[]>([]);
  const [selectedSqlId, setSelectedSqlId] = useState<number | null>(null);
  const [selectedMongoId, setSelectedMongoId] = useState<string | null>(null);
  const itemsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchMtr, setSearchMtr] = useState("");
  const [searchFileName, setSearchFileName] = useState("");
  const [searchSn, setSearchSn] = useState("");
  const [searchCn, setSearchCn] = useState("");
  const [searchPn, setSearchPn] = useState("");
  const [searchHt, setSearchHt] = useState("");
  const [, setUpdateData] = useState();
  const [totalMtrCount, setTotalMtrCount] = useState(0);
  const [deleteIds, setDeleteIds] = useState<{
    sql_id: string | number | null;
    mongo_id: string | null;
  }>({ sql_id: null, mongo_id: null });

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setPageLoading(true);
    setCurrentPage(page);
  };

  // Debounced search functions
  const debouncedSearchMtr = useCallback(
    debounce((value: string) => {
      setSearchMtr(value);
    }, 2000),
    []
  );

  const debouncedSearchFileName = useCallback(
    debounce((value: string) => {
      setSearchFileName(value);
    }, 500),
    []
  );

  const debouncedSearchSn = useCallback(
    debounce((value: string) => {
      setSearchSn(value);
    }, 500),
    []
  );

  const debouncedSearchCn = useCallback(
    debounce((value: string) => {
      setSearchCn(value);
    }, 500),
    []
  );

  const debouncedSearchPn = useCallback(
    debounce((value: string) => {
      setSearchPn(value);
    }, 500),
    []
  );

  const debouncedSearchHt = useCallback(
    debounce((value: string) => {
      setSearchHt(value);
    }, 500),
    []
  );

  useEffect(() => {
    setPageLoading(true);
    getAllJobMtr();
  }, [currentPage, searchMtr, searchFileName, searchSn, searchCn, searchPn, searchHt]);

  const getAllJobMtr = async () => {
    try {
      const filters = {
        mtr: searchMtr,
        file_name: searchFileName,
        sn: searchSn,
        cn: searchCn,
        pn: searchPn,
        ht: searchHt,
      };

      const cleanedFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );

      const payload = {
        page: currentPage,
        limit: itemsPerPage,
        filters: cleanedFilters,
      };
      const response = await getJobmtrbyPageLimits(payload);

      const dataList = response.data.data.data;
      const totalCount = response.data.data.totalData;
      setJobMtrList(dataList);
      setTotalMtrCount(totalCount);
      setTotalPages(response.data.data.totalPages);

    } catch (error) {
      console.error("Error fetching MTR data:", error);
      setJobMtrList([]);
      setTotalMtrCount(0);
      setTotalPages(1);
    } finally {
      setPageLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);

    if (!deleteIds.sql_id || !deleteIds.mongo_id) {
      toast.warning("No item selected for deletion");
      setLoading(false);
      return;
    }

    try {
      const res = await deleteJobMtr({
        sql_id: deleteIds.sql_id,
        mongo_id: deleteIds.mongo_id,
      });

      if (res.status === 200) {
        await getAllJobMtr();
        toast.success("MTR Data deleted successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      } else {
        throw new Error(res.data?.message || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An error occurred while deleting the MTR Data.", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteIds({ sql_id: null, mongo_id: null });
      setLoading(false);
    }
  };

  const handleEditMtr = async (_id: string) => {
    try {
      setLoading(true);
      const response = await getJobMtrById(_id);
      const mtrData = response.data;
      setUpdateData(mtrData);
      navigate(`/mtr/update/${_id}`);
    } catch (error) {
      console.error("Error fetching title data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {(loading || pageLoading) && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}

      <Grid container spacing={1} style={{ width: '100%', margin: 0, flexWrap: 'nowrap' }}>
        <Grid item style={{ minWidth: '14%', flex: 1 }}>
          <Label className="text-gray-500">MTR</Label>
          <input
            type="text"
            placeholder="Search mtr..."
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
            defaultValue={searchMtr}
            onChange={(e) => debouncedSearchMtr(e.target.value)}
          />
        </Grid>
        <Grid item style={{ minWidth: '14%', flex: 1 }}>
          <Label>File Name</Label>
          <input
            type="text"
            placeholder="Search File name..."
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
            defaultValue={searchFileName}
            onChange={(e) => debouncedSearchFileName(e.target.value)}
          />
        </Grid>
        <Grid item style={{ minWidth: '14%', flex: 1 }}>
          <Label>SN</Label>
          <input
            type="text"
            placeholder="Search sn..."
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
            defaultValue={searchSn}
            onChange={(e) => debouncedSearchSn(e.target.value)}
          />
        </Grid>
        <Grid item style={{ minWidth: '14%', flex: 1 }}>
          <Label className="text-gray-500">CN</Label>
          <input
            type="text"
            placeholder="Search cn..."
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
            defaultValue={searchCn}
            onChange={(e) => debouncedSearchCn(e.target.value)}
          />
        </Grid>
        <Grid item style={{ minWidth: '14%', flex: 1 }}>
          <Label className="text-gray-500">PN</Label>
          <input
            type="text"
            placeholder="Search pn..."
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
            defaultValue={searchPn}
            onChange={(e) => debouncedSearchPn(e.target.value)}
          />
        </Grid>
        <Grid item style={{ minWidth: '14%', flex: 1 }}>
          <Label className="text-gray-500">HT</Label>
          <input
            type="text"
            placeholder="Search ht..."
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
            defaultValue={searchHt}
            onChange={(e) => debouncedSearchHt(e.target.value)}
          />
        </Grid>
      </Grid>
      <div className="flex justify-end mt-4">
        <button
          className=" right-2 bg-brand text-white px-5 py-3 mt-3 me-2 rounded-xl flex items-center gap-2"
          onClick={() => {
            setSearchMtr("");
            setSearchFileName("");
            setSearchSn("");
            setSearchCn("");
            setSearchPn("");
            setSearchHt("");
            setCurrentPage(1);
            setTotalCount(0);
          }}
        >
          Reset
        </button>
      </div>

      <div className="relative w-full mt-5">
        <button
          className="absolute right-0 bg-brand text-white px-3 py-3 mt-3 me-3 rounded-xl flex items-center gap-2"
          onClick={() => navigate("add")}
        >
          <span className="text-lg">+</span> Add
        </button>
        <ComponentCard title="MTR List">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableCell isHeader className="w-1/12 text-gray-600">
                    MTR
                  </TableCell>
                  <TableCell isHeader className="w-2/12 text-gray-600">
                    File Name
                  </TableCell>
                  <TableCell isHeader className="w-2/12 text-gray-600">
                    User Name
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-1/12 whitespace-nowrap text-gray-600"
                  >
                    SN
                  </TableCell>
                  <TableCell isHeader className="w-1/12 text-gray-600">
                    RN
                  </TableCell>
                  <TableCell isHeader className="w-1/12 text-gray-600">
                    CN
                  </TableCell>
                  <TableCell isHeader className="w-1/12 text-gray-600">
                    PO
                  </TableCell>
                  <TableCell isHeader className="w-1/12 text-gray-600">
                    P/N
                  </TableCell>
                  <TableCell isHeader className="w-1/12 text-gray-600">
                    HT
                  </TableCell>
                  <TableCell isHeader className="w-2/12 text-gray-600">
                    Last Modified
                  </TableCell>
                  <TableCell isHeader className="w-1/12 text-gray-600">
                    Action
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {jobMtrList.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="h-15">{row.mtr}</TableCell>
                    <TableCell>
                      {row.file_name || row.file_sql_name ? (
                        <a
                          href={
                            row?.file_url
                              ? row?.file_url
                              : `http://99.91.196.91/cn/assets/mtr/${row.file_sql_name}`
                          }
                          download
                          className="pointer"
                          style={{ textDecoration: "underline", color: "blue" }}
                          target="_blank"
                        >
                          {row.file_name || row.file_sql_name || "N/A"}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>{row?.user_info?.name}</TableCell>
                    <TableCell>{row.sn}</TableCell>
                    <TableCell>{row.rn}</TableCell>
                    <TableCell>{row.cn}</TableCell>
                    <TableCell>{row.po}</TableCell>
                    <TableCell>{row.pn}</TableCell>
                    <TableCell>{row.ht}</TableCell>
                    <TableCell>
                      {moment(row.updatedAt).format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <div
                          className="cursor-pointer"
                          onClick={() => handleEditMtr(row._id)}
                        >
                          <Badge size="sm" color="success">
                            <EditIcon size={14} />
                          </Badge>
                        </div>
                        <div
                          className="cursor-pointer"
                          onClick={() => {
                            setDeleteIds({
                              sql_id: row.id,
                              mongo_id: row._id,
                            });
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
                ))}
              </TableBody>
            </Table>
          </div>
        </ComponentCard>
        <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
          <div className="flex items-center gap-4">
            <Stack spacing={2}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Stack>
            <span className="text-sm">
              {totalMtrCount === 0 ? (
                "0 entries"
              ) : (
                <>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, totalMtrCount)} of{" "}
                  {totalMtrCount} entries
                </>
              )}
            </span>
          </div>
        </div>
      </div>
      <Modal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete this mtr List?</p>
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
}