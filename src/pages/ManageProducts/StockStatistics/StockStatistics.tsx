import { useNavigate } from "react-router-dom";
import Select from "react-select";
import Button from "../../../components/ui/button/Button";
import ComponentCard from "../../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { Grid } from "@mui/material";
import { FaRegEye } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { isProductDataAvailableByDate, getPermissionByRole } from "../../../services/apis";
import { toast } from "react-toastify";

const startYear = 2010;
const currentYear = new Date().getFullYear();

const sortByYear = Array.from(
  { length: currentYear - startYear + 1 },
  (_, i) => {
    const year = currentYear - i;
    return { value: year, label: year.toString() };
  }
);

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const selectByMonth = months.map((month, idx) => ({
  value: (idx + 1).toString().padStart(2, "0"), // "01", "02", ...
  label: month
}));

export const StockStatistics = () => {
  const [selectedYear, setSelectedYear] = useState<{ value: number; label: string } | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<{ value: string; label: string } | null>(null);
  const [searchResult, setSearchResult] = useState<{ date: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState({
    canViewStockStatistics: false,
    canUpdateStockStatistics: false,
  });

  // Permission helper functions
  const getCurrentUserRole = (): string => {
    return localStorage.getItem('role') || '';
  };

  const fetchUserPermissions = async (): Promise<any | null> => {
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

    const tab = permissions.permission_tab.find((t: any) => t.tab_name === tabName);
    if (!tab) return false;

    const func = tab.tab_function.find((f: any) => f.tab_functionName === functionName);
    return func?.is_showFunction || false;
  };

  useEffect(() => {
    const initializeComponent = async () => {
      const [canView, canUpdate] = await Promise.all([
        checkPermission('Stock Statistic', 'View'),
        checkPermission('Stock Statistic', 'Update'),
      ]);

      setPermissions({
        canViewStockStatistics: canView,
        canUpdateStockStatistics: canUpdate,
      });

      if (!canView) {
        toast.error("You don't have permission to  statistics", {
          toastId: "no-permission-view-stock-stats",
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
        navigate('/');
      }
    };

    initializeComponent();
  }, []);

  const handleSearch = async () => {
    if (!permissions.canViewStockStatistics) {
      toast.error("You don't have permission to view stock statistics", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
      return;
    }

    if (!selectedYear || !selectedMonth) {
      toast.error("Please select both year and month");
      return;
    }

    setNoData(false);
    setSearchResult([]);
    if (!selectedYear || !selectedMonth) return;

    const date = `${selectedYear.value}-${selectedMonth.value}-01`;
    setLoading(true);
    try {
      const res = await isProductDataAvailableByDate(date);
      if (res.data.data > 0) {
        setSearchResult([{ date }]);
      } else {
        setNoData(true);
      }
    } catch (err) {
      setNoData(true);
    } finally {
      setLoading(false);
    }
  };

  const handleViewClick = (date: string) => {
    if (!permissions.canViewStockStatistics) {
      toast.error("You don't have permission to view stock statistics", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
      return;
    }
    navigate(`/stockStatistics/view?date=${date}`);
  };

  return (
    <div className="py-3 ">

      {!permissions.canViewStockStatistics ? (
        <div className="text-center py-8 text-red-500">
          {/* You don't have permission to view this page */}
        </div>
      ) : (
        <>
      <h2 className=" font-bold mb-4 text-gray-800 dark:text-white/90">Stock Statistics</h2>

          <Grid container spacing={3} className="items-center mb-4">
            <Grid size={{ lg: 3, md: 5, sm: 5 }}>
              <Select
                options={sortByYear}
                isClearable
                placeholder="Select Year..."
                value={selectedYear}
                onChange={setSelectedYear}
              />
            </Grid>
            <Grid size={{ lg: 3, md: 5, sm: 5 }}>
              <Select
                options={selectByMonth}
                isClearable
                placeholder="Select Month..."
                value={selectedMonth}
                onChange={setSelectedMonth}
              />
            </Grid>
            <Grid size={{ lg: 1, md: 2, sm: 1 }} className="">
              <Button
                size="sm"
                variant="primary"
                className="ml-4 bg-brand"
                onClick={handleSearch}
                disabled={loading || !selectedYear || !selectedMonth}
              >
                Search
              </Button>
            </Grid>
          </Grid>

          <div className="relative w-full">
            <ComponentCard title="Stock List">
              <Table className="">
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] ">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start col-span-1">
                      Date
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start w-2">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {loading ? (
                    <TableRow>
                      <TableCell className="text-center py-4 text-gray-500">
                        {loading && (
                          <div className="loader-overlay">
                            <div className="loader"></div>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : noData ? (
                    <TableRow>
                      <TableCell className="text-center py-4 text-gray-500">
                        No Data Found
                      </TableCell>
                    </TableRow>
                  ) : searchResult.length > 0 ? (
                    searchResult.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="px-4 py-3 text-gray-600 text-start">
                          {item.date}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 text-start max-w-2xl">
                          <div className="gap-2 inline-block">
                            {permissions.canViewStockStatistics && (
                            <Button
                              variant="primary"
                              size="md"
                              onClick={() => handleViewClick(item.date)}
                            >
                              <FaRegEye size={14} />
                            </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="text-center py-4 text-gray-500">
                        No data found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ComponentCard>
          </div>
        </>
      )}
    </div>
  );
};