import React, { useState, useEffect, useRef } from "react";
import ComponentCard from "../../../components/common/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useNavigate } from "react-router";
import { EditIcon, Trash2Icon } from "lucide-react";
import Badge from "../../../components/ui/badge/Badge";
import { AiOutlineSolution } from "react-icons/ai";
import Select from "react-select";
import Button from "../../../components/ui/button/Button";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
} from "@mui/material";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { Box, Modal } from "@mui/material";
import {
  deleteProblem,
  getAllProblems,
  getAllUsers,
} from "../../../services/apis";
import { toast } from "react-toastify";

interface ProblemsItem {
  finder: string;
  input_user_data: string;
  categoryData: any[];
  subcategoryDataData: any[];
  problemtype: string;
  occure_date: string;
  inputdate: string;
  details: string;
  result: string;
  solutions: string;
  id: string;
  open_to_names: string;
}
// const finderOptions: Option[] = [
//   { value: "sales26", label: "sale26" },
//   { value: "sales27", label: "sale27" },
//   { value: "sales28", label: "sale28" },
//   { value: "sales29", label: "sale29" },
//   { value: "sales21", label: "sale21" },
//   { value: "sales23", label: "sale23" },
// ];
const userOptions = [
  { value: "alexandar", label: "alexender" },
  { value: "Sandy-xu", label: "Sandy-Xu" },
];
const typeOptions = [
  { value: "Found By Customer", label: "Found By Customer" },
  { value: "Found Before Producing", label: "Found Before Producing" },
  { value: "Found By Self-Checking", label: "Found By Self-Checking" },
];

export const ProblemsUI: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [problemData, setProblemData] = useState<ProblemsItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const inputRef = useRef(null);
  const [openToOptions, setOpenToOptions] = useState<Option[]>([]);
  const [selectedFinder, setSelectedFinder] = useState<Option | null>(null);
  const [selectedUser, setSelectedUser] = useState<Option | null>(null);
  const [selectedType, setSelectedType] = useState<Option | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(problemData.length / itemsPerPage);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredItems = problemData.filter((item) => {
    const searchLower = searchTerm.toLowerCase();

    // Safely get string values for comparison
    const finder = item.finder?.toLowerCase() || '';
    const inputUser = item.input_user_data?.toLowerCase() || '';
    const category = item.categoryData?.[0]?.name?.toLowerCase() || item.categoryData?.[0]?.cn_name?.toLowerCase() || '';
    const subcategory = item.subcategoryDataData?.[0]?.name?.toLowerCase() || '';
    const problemType = item.problemtype?.toLowerCase() || '';
    const details = item.details?.toLowerCase() || '';
    const result = item.result?.toLowerCase() || '';
    const solutions = item.solutions?.toLowerCase() || '';

    // Check if item matches search term
    const matchesSearch =
      finder.includes(searchLower) ||
      inputUser.includes(searchLower) ||
      category.includes(searchLower) ||
      subcategory.includes(searchLower) ||
      problemType.includes(searchLower) ||
      details.includes(searchLower) ||
      result.includes(searchLower) ||
      solutions.includes(searchLower);

    // Check if item matches selected filters
    const matchesFinder = !selectedFinder || finder === selectedFinder.label.toLowerCase();
    const matchesUser = !selectedUser || inputUser === selectedUser.label.toLowerCase();
    const matchesType = !selectedType || problemType === selectedType.value.toLowerCase();

    return matchesSearch && matchesFinder && matchesUser && matchesType;
  });
  const fetchOpenTo = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      if (res?.data?.data) {
        const options = res.data.data.map((user: any) => ({
          value: user.id,
          label: user.name,
        }));
        setOpenToOptions(options);
      }
    } catch (error) {
      console.error("Failed to fetch open to options", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRuleLocationData();
    fetchOpenTo();
  }, []);

  const handleDelete = async () => {
    setLoading(true);
    if (!deleteId) return;

    try {
      await deleteProblem(deleteId);
      setIsDeleteModalOpen(false);
      setDeleteId(null);
      fetchRuleLocationData();

      toast.success("Problem deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        style: {
          zIndex: 99999999, // ensures it appears above all elements
          marginTop: "4rem", // gives vertical space from top
        },
      });
    } catch (error) {
      console.error("Failed to delete the problem:", error);

      toast.error("Failed to delete the problem.", {
        position: "top-right",
        autoClose: 3000,
        style: {
          zIndex: 99999999,
          marginTop: "4rem",
        },
      });
    }

    setLoading(false);
  };
  const getProblemType = (type: number): string => {
    switch (type) {
      case 1:
        return "Found By Customer";
      case 2:
        return "Found Before Producing";
      case 3:
        return "Found By Self-Checking";
      default:
        return "N/A";
    }
  };

  const fetchRuleLocationData = async () => {
    setLoading(true);
    try {
      const res = await getAllProblems();
      console.log(res);

      const formattedData: ProblemsItem[] = res.data.data
        .map((item) => ({
          finder: item.finder_data?.[0]?.name || "N/A",
          input_user_data: item.input_user_data?.[0]?.name || "N/A",
          categoryData: item.categoryData || [],
          subcategoryDataData: item.subcategoryDataData || [],
          open_to_names: item.open_to_names?.join(", ") || "N/A", // Assuming it's an array
          problemtype: getProblemType(item.type), // Using helper function
          occure_date: item.occure_date?.slice(0, 10) || "N/A",
          inputdate: item.created_at?.slice(0, 10) || "N/A",
          details: item.details || "N/A",
          result: item.result || "N/A",
          solutions: item.solution || "N/A",
          id: item.id,
        }))
        .reverse();
      setProblemData(formattedData);
      console.log("API Response:", res.data); // Add this to inspect the actual structure
    } catch (error) {
      console.error("Error fetching problem data:", error);
    }
    setLoading(false);
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setCurrentPage(page);
    }, 500);
  };

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFinder, selectedUser, selectedType]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedFinder(null);
    setSelectedUser(null);
    setSelectedType(null);
    // Reset current page to 1 as well if you want
    setCurrentPage(1);
  };

  // const handleSearch = () => {
  //   // Implement search logic if needed
  // };

  return (
    <div className="p-4">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <h1 className="text-gray-500 font-semibold text-xl mb-4">
        View Problems
      </h1>
      <div className="flex justify-between mb-6 mt-3 gap-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="Details..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-11 w-full max-w-[400px] rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
        />
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            className="m1-4 text-blue-400"
            onClick={handleResetFilters}
          >
            Reset Filters
          </Button>
          <Button
            size="sm"
            variant="primary"
            className="m1-4 text-white-400"
          // onClick={handleSearch}
          >
            Search
          </Button>
        </div>
      </div>
      <div className="mb-2">
        <Grid container spacing={1}>
          <Grid item lg={4} sm={4}>
            <Select
              options={openToOptions}
              isClearable
              placeholder="Select Finder..."
              className="w-full max-w-[450px] shadow-md"
              value={selectedFinder}
              onChange={(selectedOption) => setSelectedFinder(selectedOption)}
            />
          </Grid>
          <Grid item lg={4} sm={4}>
            <Select
              options={openToOptions}
              isClearable
              placeholder="Select user..."
              className="w-full max-w-[450px] shadow-md"
              value={selectedUser}
              onChange={(selectedOption) => setSelectedUser(selectedOption)}
            />
          </Grid>
          <Grid item lg={4} sm={4}>
            <Select
              options={typeOptions}
              isClearable
              placeholder="Select Type..."
              className="w-full max-w-[450px] shadow-md"
              value={selectedType}
              onChange={(selectedOption) => setSelectedType(selectedOption)}
            />
          </Grid>
        </Grid>
      </div>
      <span className="text-sm text-gray-500 mt-2">
        1 to {Math.min(itemsPerPage, filteredItems.length)} of{" "}
        {filteredItems.length} entries
      </span>
      <div className="relative w-full">
        <Button
          className="absolute right-0 text-white px-3 py-0 mt-1 me-3 rounded flex items-center gap-2"
          onClick={() => navigate("addProblems")}
          size="sm"
          variant="primary"
        >
          <span className="text-lg">+</span>Add
        </Button>
      </div>
      <div className="mb-2 w-full bg-white shadow h-16 border border-gray-300 rounded-lg">
        <h4 className="p-2 text-gray-600">Problem List</h4>
      </div>
      {paginatedItems.map((item) => (
        <ComponentCard title="" key={item.id} className="mt-2">
          <div style={{ overflow: "auto" }}>
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Finder
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Input User
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Product Category
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Product SubCategory
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Problem Type
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Occur Date
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Input Date
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.5]">
                <React.Fragment>
                  <TableRow>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {item.finder}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {item.input_user_data}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {item.categoryData[0]?.name ||
                        item.categoryData[0]?.cn_name ||
                        "N/A"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {item.subcategoryDataData?.[0]?.name || "N/A"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {item.problemtype}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {item.occure_date}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      {item.inputdate}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                      <div className="flex gap-2">
                        <div
                          className="cursor-pointer hover:bg-blue-400 transition-colors"
                          onClick={() =>
                            navigate(`/problems/editProblems/${item.id}`)
                          }
                        >
                          <Badge size="md" color="info">
                            <EditIcon size={14} />
                          </Badge>
                        </div>
                        <div
                          className="cursor-pointer hover:bg-red-400 transition-colors"
                          onClick={() => {
                            setDeleteId(item.id);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Badge size="sm" color="warning">
                            <Trash2Icon size={14} />
                          </Badge>
                        </div>
                        <div className="w-12px">
                          <button
                            className="cursor-pointer hover:bg-red-400 transition-colors"
                            onClick={() => {
                              navigate(`/problems/addSolution/${item.id}`);
                            }}
                          >
                            <Badge size="sm" color="info">
                              <AiOutlineSolution size={14} />
                            </Badge>
                          </button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="px-4 py-3 text-gray-600 text-start"
                    >
                      <span className="font-medium text-gray-500">
                        Open To:{" "}
                      </span>
                      {item.open_to_names || "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <td colSpan={7} className="px-4 py-3 text-start">
                      <Accordion>
                        <AccordionSummary>
                          <div className="font-medium text-gray-500 mb-1 text-center">
                            Details
                          </div>
                        </AccordionSummary>
                        <AccordionDetails>
                          <p className="text-gray-600">{item.details}</p>
                        </AccordionDetails>
                      </Accordion>
                    </td>
                  </TableRow>
                  <TableRow>
                    <td colSpan={7} className="px-4 py-3 text-start">
                      <Accordion>
                        <AccordionSummary>
                          <div className="font-medium text-gray-500 mb-1 text-center">
                            Result
                          </div>
                        </AccordionSummary>
                        <AccordionDetails>
                          <p className="text-gray-500">{item.result}</p>
                        </AccordionDetails>
                      </Accordion>
                    </td>
                  </TableRow>
                  <TableRow>
                    <td colSpan={7} className="px-4 py-3 text-start">
                      <Accordion>
                        <AccordionSummary>
                          <div className="font-medium text-gray-500 mb-1 text-center">
                            Solutions
                          </div>
                        </AccordionSummary>
                        <AccordionDetails>
                          <p className="text-gray-500">{item.solutions}</p>
                        </AccordionDetails>
                      </Accordion>
                    </td>
                  </TableRow>
                </React.Fragment>
              </TableBody>
            </Table>
          </div>
        </ComponentCard>
      ))}
      <div className="flex flex-wrap justify-between items-center mt-4">
        <span className="text-sm">
          Showing{" "}
          {Math.min((currentPage - 1) * itemsPerPage + 1, filteredItems.length)}{" "}
          to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of{" "}
          {filteredItems.length} entries
        </span>
        <Stack spacing={2}>
          <Pagination
            count={totalPages}
            color="primary"
            page={currentPage}
            onChange={handlePageChange}
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
            <p>Are you sure you want to delete this problem?</p>
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
};
