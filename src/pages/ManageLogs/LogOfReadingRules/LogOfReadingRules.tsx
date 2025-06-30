import React, { useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
import Select from "react-select";
// import { EditIcon, Trash2Icon } from "lucide-react";
import Button from "../../../components/ui/button/Button";
import ComponentCard from "../../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
// import Badge from "../../../components/ui/badge/Badge";
import { Grid } from '@mui/material';

interface LorrItem {
    no: string;
    fullname: string;
    logdate: string;
    page: string;

}

const lorrData: LorrItem[] = [
    { no: "1", fullname: "Sales No.1", logdate: "2025-04-07 11:10 AM", page: "Rules" },
    { no: "2", fullname: "Sales No.1", logdate: "2025-04-07 06:31 AM", page: "Rules" },
    { no: "3", fullname: "Purchase55", logdate: "2025-01-09 02:37 AM", page: "Rules" },
    { no: "4", fullname: "Test-gm", logdate: "2025-01-09 02:37 AM", page: "Rules" },
    { no: "5", fullname: "test-s", logdate: "2025-04-07 11:10 AM", page: "Rules" },
    { no: "6", fullname: "Sales No.1", logdate: "2025-04-07 11:10 AM", page: "Rules" },
    { no: "7", fullname: "test-ss", logdate: "2025-04-07 11:10 AM", page: "Rules" },

];

const fullnameOptions = [
    { value: "Sales No.1", label: "Sales No.1" },
    { value: "Purchase55", label: "Purchase55" },
    { value: "Test-gm", label: "Test-gm" },
    { value: "test-s", label: "test-s" },

];

export const LogOfReadingRules: React.FC = () => {
    const [selectedfullname, setSelectedfullname] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
      const [loading, setLoading] = useState<boolean>(false);
    // const navigate = useNavigate();
    const inputRef = useRef(null);

    // const handleEdit = (item: CatalogueItem) => {
    //     // Handle edit action
    //     console.log("Editing:", item);
    //     navigate("/edit"); // Or your edit route
    // };

    // const handleDelete = (item: CatalogueItem) => {
    //     // Handle delete action
    //     console.log("Deleting:", item);
    //     // Add your delete logic here
    // };

    const filteredItems = lorrData.filter((item) => {
        const matchesSearch =
            searchTerm === "" ||
            item.no.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.logdate.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFullname =
            selectedfullname === null || item.fullname === selectedfullname;

        return matchesSearch && matchesFullname;
    });


    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="p-4">
             {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
 
            <h1 className="text-xl font-bold mb-4">View Log Of Reading Rules</h1>
            {/* <span className="text-sm text-gray-500">1 to {Math.min(itemsPerPage, filteredItems.length)} of {filteredItems.length} entries</span> */}


            <div >
                <Grid container spacing={1}>
                    <Grid size={{ lg: 5, sm: 5 }}>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search...."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 w-full max-w-[400px] rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                        />
                    </Grid>

                    <Grid size={{ lg: 5, sm: 5 }}>
                        <div className="w-full max-w-[400px] shadow-lg rounded-lg ">
                            <Select
                                options={fullnameOptions}
                                isClearable
                                placeholder=""
                                onChange={(selected) => setSelectedfullname(selected ? selected.value : null)}
                            />
                        </div>
                    </Grid>
                    <Grid size={{ lg: 2, sm: 2 }}>
                        <Button
                            onClick={() => { setSearchTerm(""); setSelectedfullname(null); }}
                            size="sm"
                            variant="primary"
                            className="ml-4"
                        >
                            Reset
                        </Button>
                    </Grid>

                </Grid >
            </div>




            <ComponentCard title="Reading Rules List"
                className="mt-2">
                <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                                No.#
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                                Full Name
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                                Log Date
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                                Page
                            </TableCell>

                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {paginatedItems.length > 0 ? (
                            paginatedItems.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                                        {item.no}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                                        {item.fullname}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                                        {item.logdate}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                                        {item.page}
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
                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredItems.length)} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} entries
                </span>
                <div className="flex gap-2">
                    <button
                        className="px-2 py-1 bg-gray-200 rounded"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    >
                        Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            className={`px-2 py-1 rounded ${currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                            onClick={() => setCurrentPage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        className="px-2 py-1 bg-gray-200 rounded"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div >

    );
};