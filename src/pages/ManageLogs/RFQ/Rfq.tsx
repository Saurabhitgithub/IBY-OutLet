import * as React from "react";
import { useState, useEffect, useRef } from "react";
import ComponentCard from "../../../components/common/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useNavigate } from "react-router";
import { EditIcon, Trash2Icon, ViewIcon, Plus, Cross } from "lucide-react";
import Badge from "../../../components/ui/badge/Badge";
import Select from "react-select";
import {
  Accordion,
  Grid,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import Button from "../../../components/ui/button/Button";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { Box, Modal } from "@mui/material";
import {
  closeRfqStatus,
  deleteRfq,
  deleteRfqProduct,
  deleteRfqstats,
  getAllCategory,
  getAllRfqProductByRfqId,
  getAllRfqs,
  getallRfqStatsById,
  getAllUsers,
  isPrivateRfqState,
} from "../../../services/apis";
import { toast } from "react-toastify";
import { useParams } from "react-router";
interface RfqItems {
  rfq: string;
  customer_rfq: string;
  productCategory: string;
  productSubCategory: string;
  willOrderWithin: string;
  rfqDate: string;
  fileOpenedBy: string;
  details: string;
  id: string;
}
type RfqStat = {
  id: number;
  user_id: number;
  rfq_id: number;
  uptime: string;
  if_private: number;
  details: string;
  opento: string; // or string[] if parsed
  userData?: {
    name: string;
    email?: string;
    username?: string;
    // add more if needed
  };
};
const viewRfqOptions = [
  { value: "all", label: "View Rfqs" },

  { value: "closed", label: "View Closed RFQs" },
];

export const Rfq: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [indexLoading, setIndexLoading] = useState<Number>(0);

  const [selectedView, setSelectedView] = useState<string>("all");
  const inputRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rfqData, setRfqData] = useState<any[]>([]);
  const [rfqID, setrfqID] = useState();
  const [rfqToDelete, setRfqToDelete] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]); // For category options
  const [categoryMap, setCategoryMap] = useState<Record<number, string>>({});
  const [selectViewOption, setSelectViewOption] = useState<any>(null);
  const [openTo, setopenTo] = useState<Option[]>([]);

  const [selectedStatsId, setSelectedStatsId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      const users = response.data?.data || [];
      const formattedUsers = users.map((user: any) => ({
        value: user.id.toString(),
        label: user.name,
      }));
      setopenTo(formattedUsers);
    } catch (error) {
      console.error("Failed to fetch account managers:", error);
    }
    setLoading(false);
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCurrentPage(page);
    }, 500);
  };
  // const filteredItems = rfqData.filter((item) => {
  //   // First apply search filter
  //   const matchesSearch =
  //     item.rfq.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     item.customer_rfq.toLowerCase().includes(searchTerm.toLowerCase());

  //   // Then apply view filter if not "all"
  //   if (selectedView === "all") return matchesSearch;
  //   if (selectedView === "open") return matchesSearch && item.status === "open";
  //   if (selectedView === "closed")
  //     return matchesSearch && item.status === "closed";
  //   // Add other view conditions as needed

  //   return matchesSearch;
  // });
  const filteredItems = rfqData.filter((item) => {
    const matchesSearch =
      item.rfq.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer_rfq.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedView === "all") {
      return matchesSearch && item.status !== 2; // show only open RFQs
    }

    if (selectedView === "closed") {
      return matchesSearch && item.status === 2; // only closed RFQs
    }

    return matchesSearch;
  });

  const paginatedRfq = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedView("all");
    setSelectViewOption(viewRfqOptions[0]); // Reset to first option ("View Rfqs")
    setCurrentPage(1);
  };
  useEffect(() => {
    fetchRfq();
  }, []);
  const handleDeleteRfQData = async () => {
    if (!rfqToDelete) {
      console.error("No rfqToDelete id set.");
      return;
    }

    try {
      await deleteRfq(rfqToDelete);
      setIsDeleteModalOpen(false);
      setRfqToDelete(null);
      fetchRfq(); // Refresh list after delete
    } catch (error) {
      console.error("Failed to delete RFQ:", error);
    }
  };

  const fetchRfq = async () => {
    setLoading(true);
    try {
      const response = await getAllRfqs();
      // Reverse the array to show latest entries first
      const reversedData = response.data?.data;
      setRfqData(reversedData || []);
      console.log(reversedData.id, "gggggg");
      setrfqID(reversedData[0].id);
    } catch (error) {
      console.error("Error fetching Rfqs:", error);
    }
    setLoading(false);
  };

  // const fetchRfq = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await getAllRfqs();

  //     const allData = response.data?.data || [];

  //     // ✅ Only include RFQs where status is 1
  //     const filteredData = allData.filter((rfq: any) => Number(rfq.status) === 1);

  //     setRfqData(filteredData);

  //     if (filteredData.length > 0) {
  //       setrfqID(filteredData[0].id);
  //       console.log("First RFQ ID:", filteredData[0].id);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching Rfqs:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  console.log(selectedProductId, "productId");
  const handleToggleProducts = (id: string) => {
    setSelectedProductId((prevId) => (prevId === id ? null : id));
  };
  // const [showStats, setShowStats] = useState(false);
  // const handleToggleStats = () => {
  //   setShowStats((prev) => !prev);
  // };

  // rfq states

  const [showStats, setShowStats] = useState(false);
  const handleToggleStats = (id: string) => {
    if (selectedStatsId === id) {
      setShowStats(false);
      setSelectedStatsId(null);
    } else {
      setSelectedStatsId(id);
      setShowStats(true);
    }
  };
  const [statsData, setStatsData] = useState([]);

  useEffect(() => {
    if (!selectedStatsId) return;

    const fetchStats = async () => {
      try {
        const res = await getallRfqStatsById(selectedStatsId);
        setStatsData(res.data?.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch RFQ Stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedStatsId]);

  // delete logic for stats
  const [statsdeleteId, setstatsdeleteId] = useState<string | null>(null);
  const [isStatsDeleteModalOpen, setIsStatsDeleteModalOpen] = useState(false);
  const handleDeleteRfqStats = async () => {
    if (!statsdeleteId) return;
    setLoading(true);
    try {
      await deleteRfqstats(statsdeleteId);
      toast.success("RFQ Stats deleted successfully", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });

      setStatsData((prev) =>
        prev.filter((item: any) => item.id !== statsdeleteId)
      );

      setIsStatsDeleteModalOpen(false);
      setstatsdeleteId(null);
    } catch (error) {
      toast.error("Failed to delete RFQ Stats", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setLoading(false);
    }
  };

  // public private button
  const [error, setError] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState<boolean | null>(null);
  // const [rfqList, setRfqList] = useState<YourRfqType[]>([]);
  const [isPrivateMap, setIsPrivateMap] = useState<Record<string, number>>({});
  const handleTogglePrivacy = async (id: string, currentPrivacy: number) => {
    try {
      setLoading(true);
      setError(null);

      const newPrivacy = currentPrivacy === 1 ? 0 : 1;

      await isPrivateRfqState(id, { isPrivate: newPrivacy });

      toast.success(`RFQ is now ${newPrivacy === 1 ? "Private" : "Public"}`, {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });

      setIsPrivateMap((prev) => ({
        ...prev,
        [id]: newPrivacy,
      }));
    } catch (error) {
      setError("Failed to toggle RFQ privacy.");
      toast.error("Failed to toggle RFQ privacy.", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const orderWithinOptions: { [key: string]: string } = {
    "1": "Immediately",
    "2": "1-2 days",
    "3": "1 week",
    "4": "2 weeks",
    "5": "4 weeks",
    "6": "2-3 months",
  };
  const [rfqProductData, setRfqProductData] = useState<{
    [key: string]: any[];
  }>({});
  //   const fetchProductData = async () => {
  //     setLoading(true);
  //     try {
  //       const response = await getAllRfqProductByRfqId(selectedProductId);
  //       const users = response.data?.data || [];
  //   console.log(response,"data of product")
  //     } catch (error) {
  //       console.error("Failed to fetch account managers:", error);
  //     }
  //     setLoading(false);
  //   };

  // useEffect(() => {
  //   if (selectedProductId) {
  //     fetchProductData();
  //   }
  // }, [selectedProductId]);

  const fetchProductData = async (id: string) => {
    setLoading(true);
    try {
      const response = await getAllRfqProductByRfqId(id);
      const data = response.data?.data || [];
      setRfqProductData((prev) => ({ ...prev, [id]: data }));
      console.log(response, "data of product");
    } catch (error) {
      console.error("Failed to fetch RFQ product data:", error);
    }
    setLoading(false);
  };
  useEffect(() => {
    if (selectedProductId && !rfqProductData[selectedProductId]) {
      fetchProductData(selectedProductId);
    }
  }, [selectedProductId]);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isProductDeleteModalOpen, setIsProductDeleteModalOpen] =
    useState(false);

  const handleDeleteRfqProducts = async () => {
    if (!productToDelete) return;
    setLoading(true);
    try {
      await deleteRfqProduct(productToDelete);
      toast.success("RFQ products deleted successfully", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });

      setRfqProductData((prev) => ({
        ...prev,
        [selectedProductId]: prev[selectedProductId].filter(
          (item: any) => item.id !== productToDelete
        ),
      }));

      setIsProductDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      toast.error("Failed to delete RFQ products", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setLoading(false);
    }
  };

  const productOptions = [
    { value: 21168, label: "4-1/16-5M 4-1/2LCSG Demco Style Mud Gate Valve" },
    { value: 21181, label: "2-1/16" },
    { value: 21182, label: "5x4 5M Mud Valve (gate valve)<" },
    { value: 21183, label: "2-5M BW XXH Mud Valve" },
    { value: 21184, label: "4-5M BW XXH Mud Gate Valve 4130" },
    { value: 21222, label: "2-5M 2LP Mud Valve" },
    { value: 21231, label: "4-1/2 8RD 5000psi Mud Valve Fu" },
    { value: 21235, label: "4-5000psi Mud Valve Threaded" },
    { value: 21236, label: "4-1/2 8RD or LP Mud Valve" },
    { value: 21237, label: "5-1/2 8RD Metal Seat Mud Valve" },
    { value: 21265, label: "4 1-16 3M 4 1-2 LCSG Demco type Mud Valve" },
    { value: 21266, label: "6x4-5M Mud Valve (gate valve)<" },
    { value: 21272, label: "5 1/8 3M Demco Style Mud Gate Valve" },
    { value: 21289, label: "6x4 BW Mud Valve 5000 psi 13Cr" },
    { value: 21305, label: "4-1/16 5000psi Mud Valve R39" },
    { value: 21498, label: "4-3M Union Mud Gate Valve" },
    { value: 21506, label: "4-5M Flange Mud Valve" },
    { value: 21512, label: "4-5M Demco Style Mud Gate Valve" },
    { value: 21513, label: "4-5M Demco Style Mud Gate Valve" },
    { value: 21514, label: "2-5M 2LP Mud Valve" },
    { value: 21515, label: "2-5M Mud Valve LP" },
    {
      value: 21517,
      label:
        "4-1/16-5000 PSI x 4-1/2 LCSG End Connection, DEMCO Style Mud Valve",
    },
    { value: 21519, label: "4-1/16-3M 4-1/2LCSG  Demco Style Mud Gate Valve" },
    { value: 21520, label: "5 1/8 3M Demco Style Mud Gate Valve" },
    { value: 21526, label: "4 1/16 1M LCSG Mud Gate Valve" },
    { value: 21589, label: "2-1/16 7500psi Mud Gate Valve" },
    { value: 21590, label: "3-1/16 7500psi Mud Gate Valve" },
    { value: 21591, label: "5-1/8 7500psi Mud Gate Valve" },
    { value: 21637, label: "5 1/8 3M Demco Style Mud Gate Valve" },
    { value: 21639, label: "4-3M Demco Style Mud Gate Valve" },
    { value: 21640, label: "4-3M Demco Style Mud Gate Valve" },
    {
      value: 21716,
      label: "5-1/8 7500psi Mud Gate Valve Metal Seal Mud Valve",
    },
    { value: 21717, label: "3-1/16 7500psi Mud Gate Valve, mud valve" },
    { value: 21746, label: "4-5M Flanged Mud Valve  BODY 4130" },
    { value: 21751, label: "4-5M LP Mud gate  Valve DEMCO type MUD VALVE" },
    { value: 21787, label: "4-1M LCSG Mud Gate Valve" },
    { value: 21828, label: "3-5M UNION Mud Gate Valve" },
    { value: 21829, label: "3-3M UNION Mud Gate Valve" },
    { value: 21830, label: "2-5M Union Mud Gate Valve" },
    { value: 21831, label: "4-5M Union Mud Gate Valve" },
    { value: 21833, label: "2-1/16 7500psi Mud Gate Valve, Mud Valve" },
    { value: 21865, label: "2-5M BW XXH mud valve" },
    { value: 21866, label: "4-5M BW XXH Mud Gate Valve A487" },
    { value: 22006, label: "5-5M Mud Gate Valve, XXH" },
    { value: 22055, label: "3-5M LP Mud Gate Valve" },
    { value: 22068, label: "4-5M BW XXH Mud Gate Valve 4130" },
    { value: 22069, label: "5-1/8 7500psi Mud Gate Valve Rubber Seat" },
    { value: 22079, label: "2-5M BW XXH MODEL 72 mud valve, OTECO Style" },
    { value: 22080, label: "4-5M BW XXH Mud Gate Valve,OTECO Style" },
    { value: 22081, label: "3-5M LP Mud Gate Valve,OTECO Style" },
    { value: 22175, label: "4-5M LP Mud gate Valve" },
    { value: 22580, label: "2 1/16 5000PSI flange demco mud valve assy" },
    { value: 22793, label: "4-5M Flanged Mud Valve  BODY 4130" },
    { value: 22801, label: "Flanged mud valve 4-5M A487" },
  ];

  // const handleUpdateRfqStatus = async (id: any) => {
  //   const body = { status: 2 };

  //   try {
  //     const response = await closeRfqStatus(id, body);

  //     if (response?.data?.error) {
  //       console.error("Error closing RFQ:", response.data.errormessage);
  //       alert("Failed to close RFQ");
  //     } else {
  //       alert("RFQ closed successfully!");
  //       // optionally refresh data
  //     }
  //   } catch (err) {
  //     console.error("API error:", err);
  //     alert("Something went wrong");
  //   }

  // };

  //   const handleUpdateRfqStatus = async (id: any) => {
  //   const body = { status: 2 };

  //   try {
  //     const response = await closeRfqStatus(id, body);

  //     if (response?.data?.error) {
  //       console.error("Error closing RFQ:", response.data.errormessage);
  //       alert("Failed to close RFQ");
  //     } else {

  //   toast.success("RFQ closed successfully!", {
  //         position: "top-right",
  //         autoClose: 3000,
  //         style: { zIndex: 9999999999, marginTop: "4rem" },
  //       });
  //       // ✅ Remove the closed RFQ from the displayed list
  //       setRfqData((prevData) => prevData.filter((rfq: any) => rfq.id !== id));

  //       // Optionally reset selected RFQ ID if it was the one removed
  //       if (rfqID === id) {
  //         setrfqID(null); // or set to another available RFQ
  //       }
  //     }
  //   } catch (err) {
  //     console.error("API error:", err);
  //     alert("Something went wrong");
  //   }
  // };

  const handleUpdateRfqStatus = async (id: any, newStatus: number) => {
    const body = { status: newStatus };

    try {
      const response = await closeRfqStatus(id, body);

      if (response?.data?.error) {
        toast.error("Failed to update RFQ status");
      } else {
        toast.success(
          `RFQ ${newStatus === 2 ? "closed" : "opened"} successfully!`,
          {
            position: "top-right",
            autoClose: 3000,
            style: {
              zIndex: 9999999999,
              marginTop: "4rem",
            },
          }
        );

        // Update the local rfqData state
        setRfqData((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: newStatus } : item
          )
        );
      }
    } catch (err) {
      console.error("API error:", err);
      toast.error("Something went wrong");
    }
  };
  return (
    <div className="p-4">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <h1 className="text-gray-500 font-semibold mb-4 text-xl">RFQ</h1>
      <div className="mb-2 mt-4 ">
        <Grid container spacing={1}>
          <Grid item lg={4} sm={4}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-md"
            />
          </Grid>
          <Grid item lg={4} sm={4}>
            <Select
              isClearable
              placeholder="View Rfq"
              className="w-full shadow-lg h-9 rounded-lg"
              options={viewRfqOptions}
              value={selectViewOption}
              onChange={(selectedOption) => {
                setSelectedView(selectedOption?.value || "all");
                setSelectViewOption(selectedOption);
              }}
            />
          </Grid>

          <Grid item lg={4} sm={4}>
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="primary"
                className="m1-4 text-white-400"
                onClick={handleResetFilters}
              >
                Reset Filter
              </Button>
            </div>
          </Grid>
        </Grid>
      </div>
      <span className="text-sm text-gray-500 mb-1 mt-4">
        1 to {Math.min(itemsPerPage, filteredItems.length)} of{" "}
        {filteredItems.length} entries
      </span>
      <div className="relative w-full mt-4">
        <Button
          size="sm"
          variant="primary"
          className="absolute right-0 text-white px-3 py-0 mt-1 me-3 rounded flex items-center gap-2"
          onClick={() => navigate("/rfq/addRfq")}
        >
          <span className="text-lg">+</span>Add
        </Button>
      </div>
      <div className="mb-1 w-full  bg-white shadow h-15 border border-gray-300 rounded-lg">
        <h4 className="p-2 text-gray-600">RFQ List</h4>
      </div>
      <ComponentCard title="" className="mt-2">
        <div style={{ overflow: "auto" }}>
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start">
                  RFQ
                </TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start">
                  Customer RFQ
                </TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start">
                  Product Category
                </TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start">
                  Product Sub Category
                </TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start">
                  Will Order Within
                </TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start">
                  RFQ Date
                </TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start">
                  File Opened By
                </TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark-divide-white/[0.05]">
              {paginatedRfq.length > 0 ? (
                paginatedRfq.map((item, index) => (
                  <React.Fragment key={index}>
                    <TableRow>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {item.rfq}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {item.customer_rfq}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {categoryMap[item.category_id] ||
                          `Category ${item.category_id}`}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {item.sub_category_id}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {orderWithinOptions[item.order_within?.toString()] ||
                          "N/A"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {item.date ? item.date.split("T")[0] : "N/A"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        {item.fileOpenedBy || "NA"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 text-start">
                        <div className="flex justify-between gap-2">
                          {/* <div className="cursor-pointer  transitions-colors">
                            <Badge size="sm" color="info">
                              <Plus
                                size={15}
                                onClick={() => navigate(`/rfq/addStats/${item._id}`)}
                              />
                            </Badge>
                            <button
                              className="text-green-400 text-sm"
                              onClick={() => navigate(`/rfq/addStats/${item._id}`)}
                            >
                              Add Stats
                            </button>
                          </div> */}
                          <div
                            className="cursor-pointer transitions-colors flex items-center gap-2"
                            onClick={() => navigate(`/rfq/addStats/${item.id}`)}
                          >
                            <Badge size="sm" color="info">
                              <Plus size={15} />
                            </Badge>
                            <span className="text-green-400 text-sm">
                              Add Stats
                            </span>
                          </div>
                          <div
                            className="cursor-pointer"
                            onClick={() => handleToggleStats(item.id)}
                          >
                            <Badge size="sm" color="info">
                              <ViewIcon size={15} />
                            </Badge>
                            <button
                              className="text-green-400 text-sm"
                            // onClick={handleToggleStats}
                            >
                              {/* {showStats ? " Hide Stats" : " View Stats"} */}
                              {showStats && selectedStatsId === item.id
                                ? " Hide Stats"
                                : " View Stats"}
                            </button>
                          </div>

                          <div
                            className="cursor-pointer hover:bg-green-380 transitions-colors"
                            onClick={() =>
                              navigate(`/rfq/editRfq/${item.id}`, {
                                state: { rfqData: item },
                              })
                            }
                          >
                            <Badge size="sm" color="info">
                              <EditIcon size={15} />
                            </Badge>
                            <button className="text-green-400 text-sm">
                              Modify
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-start gap-3 mt-2">
                          <div className=" cursor-pointer">
                            <Badge size="sm" color="info">
                              <Cross size={15} />
                            </Badge>
                            {/* <button
                              className="text-green-400 mt-2 text-sm"
                              onClick={() => handleUpdateRfqStatus(item.id)} // or rfqId
                            >
                              Close
                            </button> */}
                            <button
                              className="text-green-400 mt-2 text-sm"
                              onClick={() =>
                                handleUpdateRfqStatus(item.id, item.status === 2 ? 1 : 2)
                              }
                            >
                              {item.status === 2 ? "Open" : "Close"}
                            </button>
                          </div>

                          <div
                            className="cursor-pointer flex items-center "
                            onClick={() => {
                              console.log("Deleting RFQ with id:", item.id);
                              setRfqToDelete(item.id);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            <Badge size="sm" color="error">
                              <Trash2Icon size={15} />
                            </Badge>
                            <button className="text-sm p-3 text-red-500">
                              Delete
                            </button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="px-4 py-3 font-medium text-gray-500 text-start">
                        Due Date
                      </TableCell>
                      <TableCell className="px-4 py-3 font-medium text-gray-500 text-start">
                        {item.due_date ? item.due_date.split("T")[0] : "N/A"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="px-4 py-3 font-medium text-gray-500 text-start">
                        Open To
                      </TableCell>
                      <TableCell className="px-4 py-3 font-medium text-gray-500 text-start">
                        {item.userData?.[0]?.name || "NA"}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="px-4 py-3 font-medium text-gray-500 text-start">
                        Product
                      </TableCell>
                      <TableCell px-4 py-3 font-medium text-center>
                        <button
                          className="text-blue-600 text-sm"
                          // onClick={() => navigate("addRfqProduct")}
                          onClick={() => navigate(`addRfqProduct/${item.id}`)}
                        >
                          Add Product
                        </button>
                        <span className="text-gray-500"> | </span>
                        <button
                          className="text-blue-600 text-sm"
                          onClick={() => handleToggleProducts(item.id)}
                        >
                          {selectedProductId === item.id
                            ? "Hide Products"
                            : "View Products"}
                        </button>
                      </TableCell>
                    </TableRow>
                    {/* 
            {selectedProductId === item.id && (
                      <TableRow>
                        <td colSpan={7}>
                          <Accordion expanded>
                            <AccordionDetails>
                              <div className="px-4 py-3 text-gray-500 text-start">
                                <table className="w-full">
                                  <thead className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <tr>
                                      <th className="px-2 py-2 font-medium text-gray-500 text-start">
                                        NO.
                                      </th>
                                      <th className="px-2 py-2 font-medium text-gray-500 text-start">
                                        Product
                                      </th>
                                      <th className="px-2 py-2 font-medium text-gray-500 text-start">
                                        Product Quoted
                                      </th>
                                      <th className="px-2 py-2 font-medium text-gray-500 text-start">
                                        Quoted Won/Lost
                                      </th>
                                      <th className="px-2 py-2 font-medium text-gray-500 text-start">
                                        Resulting SO#
                                      </th>
                                      <th className="px-2 py-2 font-medium text-gray-500 text-start">
                                        Notes
                                      </th>
                                      <th className="px-2 py-2 font-medium text-gray-500 text-start">
                                        Action
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100 dark-divide-white/[0.05]">
                                    <tr>
                                      <td className="px-1 py-1"></td>
                                      <td className="px-1 py-1"></td>
                                      <td className="px-1 py-1"></td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </AccordionDetails>
                          </Accordion>
                        </td>
                      </TableRow>
                    )} */}

                    {selectedProductId === item.id && (
                      <TableRow>
                        <td colSpan={7}>
                          <Accordion expanded>
                            <AccordionDetails>
                              <div className="px-4 py-3 text-gray-500 text-start">
                                <table className="w-full">
                                  <thead className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <tr>
                                      <th className="px-2 py-2 font-medium text-gray-500 text-start">
                                        NO.
                                      </th>
                                      <th className="px-2 py-2 font-medium text-gray-500 text-start">
                                        Product
                                      </th>
                                      <th className="px-2 py-2 font-medium text-gray-500 text-start">
                                        Product Quoted
                                      </th>
                                      <th className="px-2 py-2 font-medium text-gray-500 text-start">
                                        Quoted Won/Lost
                                      </th>
                                      <th className="px-2 py-2 font-medium text-gray-500 text-start">
                                        Resulting SO#
                                      </th>
                                      <th className="px-2 py-2 font-medium text-gray-500 text-start">
                                        Notes
                                      </th>
                                      <th className="px-2 py-2 font-medium text-gray-500 text-start">
                                        Action
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {(rfqProductData[item.id] || []).map(
                                      (product, index) => (
                                        <tr key={product._id}>
                                          <td className="px-2 py-2">
                                            {index + 1}
                                          </td>
                                          <td className="px-2 py-2">
                                            {productOptions.find(
                                              (opt) =>
                                                opt.value ===
                                                Number(product.product_id)
                                            )?.label || "N/A"}
                                          </td>
                                          <td className="px-2 py-2">
                                            {product.price}
                                          </td>
                                          <td className="px-2 py-2">
                                            {product.result === 1
                                              ? "Won"
                                              : "Lost"}
                                          </td>
                                          <td className="px-2 py-2">
                                            {product.so}
                                          </td>
                                          <td className="px-2 py-2">
                                            {product.notes}
                                          </td>
                                          <td className="px-2 py-2">
                                            <div className="flex gap-2">
                                              <span
                                                className="cursor-pointer"
                                                onClick={() =>
                                                  navigate(
                                                    `/rfq/editRfqProduct/${item.id}/${product._id}`
                                                  )
                                                }
                                              >
                                                <Badge size="sm" color="info">
                                                  <EditIcon size={15} />
                                                </Badge>
                                              </span>
                                              <div
                                                className="cursor-pointer flex items-center text-red-500"
                                                onClick={() => {
                                                  console.log(
                                                    "Deleting product with id:",
                                                    product.id
                                                  );
                                                  setProductToDelete(
                                                    product.id
                                                  );
                                                  setIsProductDeleteModalOpen(
                                                    true
                                                  );
                                                }}
                                              >
                                                <Trash2Icon size={15} />
                                              </div>
                                            </div>
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </AccordionDetails>
                          </Accordion>
                        </td>
                      </TableRow>
                    )}

                    <TableRow>
                      <td colSpan={9} className="px-4 py-3 text-start">
                        <Accordion>
                          <AccordionSummary>
                            <Typography className="px-5 py-3 font-medium text-gray-600 text-start">
                              Details
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography className="px-4 py-3 text-gray-500 text-start">
                              {item.detail}
                            </Typography>
                          </AccordionDetails>
                        </Accordion>
                      </td>
                    </TableRow>
                    {/* 
                     {showStats && selectedStatsId === item.id &&(
                      <TableRow>
                        <td colSpan={8}>
                          <Accordion expanded>
                            <AccordionDetails>
                              <ul className="mt-3 text-gray-600 px-4 py-3">
                                <div className="mb-3 divide-x-gray-200">
                                  <li>
                                    <h4 className="font-medium">
                                      Received Price from Supplier
                                    </h4>
                                    <p className="mb-3">
                                      A sentence is an array of multiple words
                                      arranged in a particular order. It has to
                                      be complete in itself and should convey
                                      meaning.
                                    </p>
                                    <h5>
                                      Author:Sandy Xu &ensp; Date:
                                      2011-11-12&ensp;
                                      <button className=" text-sm border p-1 ml-1 bg-blue-500 text-white rounded-lg">
                                        Make it Public
                                      </button>
                                      <button
                                        className=" text-sm  p-3 ml-3 text-red-500"
                                        onClick={() =>
                                          setIsDeleteModalOpen(true)
                                        }
                                      >
                                        Delete{" "}
                                      </button>
                                      <button
                                        className=" text-sm  p-3 ml-3 text-green-500"
                                        onClick={() =>
                                          navigate(`/rfq/editStats/${67132}`)
                                        }
                                      >
                                        Modify{" "}
                                      </button>
                                    </h5>
                                  </li>
                                  <hr />
                                  <li>
                                    <h4 className="font-medium mt-3">
                                      Send to Suppliers
                                    </h4>
                                    <p className="mb-3">
                                      An assertive/declarative sentence is one
                                      that states a general fact, a habitual
                                      action, or a universal truth. For example,
                                      'Today is Wednesday.'
                                    </p>
                                    <h5>
                                      Author:Sandy Xu &ensp; Date: 2011-11-12
                                      &ensp;
                                      <button className="   text-sm border p-1 ml-1 bg-blue-500 text-white rounded-lg">
                                        Make it Public
                                      </button>
                                      <button
                                        className="   text-sm  p-3 ml-3 text-red-500"
                                        onClick={() =>
                                          setIsDeleteModalOpen(true)
                                        }
                                      >
                                        Delete{" "}
                                      </button>
                                      <button
                                        className="   text-sm p-3 ml-3 text-green-500"
                                        onClick={() =>
                                          navigate(`/rfq/editStats/${67132}`)
                                        }
                                      >
                                        Modify{" "}
                                      </button>
                                    </h5>
                                    <hr></hr>
                                  </li>
                                </div>
                              </ul>
                            </AccordionDetails>
                          </Accordion>
                        </td>
                      </TableRow>
                    )}  */}

                    {showStats && selectedStatsId === item.id && (
                      <TableRow>
                        <td colSpan={8}>
                          <Accordion expanded>
                            <AccordionDetails>
                              <ul className="mt-3 text-gray-600 px-4 py-3">
                                {statsData.map((stat, indexss) => {
                                  const currentPrivacy =
                                    isPrivateMap[stat.id] !== undefined
                                      ? isPrivateMap[stat.id]
                                      : stat.if_private;

                                  return (
                                    <li
                                      key={stat.id}
                                      className="mb-3 border-b border-gray-200 pb-3"
                                    >
                                      <h4 className="font-medium mb-1">
                                        {currentPrivacy
                                          ? "Private Stats"
                                          : "Public Stats"}
                                      </h4>

                                      <p className="mb-3">{stat.details}</p>

                                      <h5>
                                        Author:{" "}
                                        {stat.userData?.name || "Unknown"}{" "}
                                        &ensp; Date:{" "}
                                        {
                                          new Date(stat.uptime)
                                            .toISOString()
                                            .split("T")[0]
                                        }{" "}
                                        &ensp;
                                        <button
                                          disabled={
                                            loading && indexLoading === indexss
                                          }
                                          className="text-sm border p-1 ml-1 bg-blue-500 text-white rounded-lg"
                                          onClick={() => {
                                            handleTogglePrivacy(
                                              stat.id.toString(),
                                              currentPrivacy
                                            );
                                            setIndexLoading(indexss); // only this index shows loading
                                          }}
                                        >
                                          {loading && indexLoading === indexss
                                            ? "Updating..."
                                            : currentPrivacy === 1
                                              ? "Make it Public"
                                              : "Make it Private"}
                                        </button>
                                        <button
                                          className="text-sm p-3 ml-3 text-red-500"
                                          onClick={() => {
                                            setstatsdeleteId(stat.id);
                                            setIsStatsDeleteModalOpen(true);
                                          }}
                                        >
                                          Delete
                                        </button>
                                        <button
                                          className="text-sm p-3 ml-3 text-green-500"
                                          onClick={() =>
                                            navigate(
                                              `/rfq/editStats/${item.id}/${stat._id}`
                                            )
                                          }
                                        >
                                          Modify
                                        </button>
                                      </h5>
                                    </li>
                                  );
                                })}
                              </ul>
                            </AccordionDetails>
                          </Accordion>
                        </td>
                      </TableRow>
                    )}
                  </React.Fragment>
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
          Showing{" "}
          {Math.min((currentPage - 1) * itemsPerPage + 1, rfqData.length)} to{" "}
          {Math.min(currentPage * itemsPerPage, rfqData.length)} of{" "}
          {rfqData.length} entries
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
      <Modal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setRfqToDelete(null);
        }}
      >
        <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete this RFQ?</p>
            <div className="flex justify-end mt-4">
              <button
                className="text-gray-600 hover:text-gray-900 mr-4"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setRfqToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                onClick={handleDeleteRfQData}
              >
                Delete
              </button>
            </div>
          </div>
        </Box>
      </Modal>
      <Modal
        open={isStatsDeleteModalOpen}
        onClose={() => setIsStatsDeleteModalOpen(false)}
      >
        <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete this item?</p>
            <div className="flex justify-end mt-4">
              <button
                className="text-gray-600 hover:text-gray-900 mr-4"
                onClick={() => setIsStatsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                onClick={handleDeleteRfqStats}
              >
                Delete
              </button>
            </div>
          </div>
        </Box>
      </Modal>

      <Modal
        open={isProductDeleteModalOpen}
        onClose={() => setIsProductDeleteModalOpen(false)}
      >
        <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete this item?</p>
            <div className="flex justify-end mt-4">
              <button
                className="text-gray-600 hover:text-gray-900 mr-4"
                onClick={() => setIsProductDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                onClick={handleDeleteRfqProducts}
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
