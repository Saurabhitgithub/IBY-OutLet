import * as React from "react";
import { useState, useEffect } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { useNavigate } from "react-router";
import Select from "react-select";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { Grid } from "@mui/material";
import Button from "../../components/ui/button/Button";
import { getAllContactPageLimit } from "../../services/apis";

const companyOptions = [
    { value: "company", label: "Company" },
    { value: "customerId", label: "Customer Id" },
    { value: "vendorId", label: "Vendor Id" },
];

const orderOptions = [
    { value: "ascendingOrder", label: "Ascending" },
    { value: "descendingOrder", label: "Descending" },
];

export const ContactsList: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const [contactsData, setContactsData] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [selectedCompany, setSelectedCompany] = useState<any>(null);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchField, setSearchField] = useState('company_name');
    const navigate = useNavigate();

    

    // Prepare filters for API
    const buildFilterPayload = () => {
        let sortField = "";
        let sortOrder = "";

        if (selectedCompany) {
            if (selectedCompany.value === "customerId") {
                sortField = "customer_id";
            } else if (selectedCompany.value === "vendorId") {
                sortField = "vendor_id";
            } else if (selectedCompany.value === "company") {
                sortField = "company_name";
            }
        }

        if (selectedOrder) {
            sortOrder = selectedOrder.value === "ascendingOrder" ? "asc" : "desc";
        }

        return {
            sortField: sortField || undefined,
            sortOrder: sortOrder || undefined,
            searchField: searchTerm ? searchField : undefined,
            searchValue: searchTerm || undefined,
        };
    };

    const fetchContacts = async (page = 1) => {
        setLoading(true);
        try {
            const payload = {
                page,
                limit: itemsPerPage,
                filters: buildFilterPayload()
            };

            const response = await getAllContactPageLimit(payload);
            const data = response.data?.data?.data || [];
            const total = response.data?.data?.total || 0;

            setContactsData(data.reverse());
            setTotalCount(total);
        } catch (error) {
            console.error("Error fetching contacts:", error);
            setContactsData([]);
            setTotalCount(0);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchContacts(currentPage);
        // eslint-disable-next-line
    }, [currentPage, selectedCompany, selectedOrder]);

    const handleReset = () => {
        setSelectedCompany(null);
        setSelectedOrder(null);
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };

    return (
        <div>
            {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            <h1 className="text-gray-500 font-semibold mb-4 text-xl">Contact Info List</h1>
            <div className="mb-5">
                <Grid container spacing={1}>
                   <Grid size={{ lg: 4, md: 6, sm: 6 }}>
                        <Select
                            placeholder="Company"
                            value={selectedCompany}
                            onChange={option => { setSelectedCompany(option); setCurrentPage(1); }}
                            options={companyOptions}
                            className="w-full max-w-[500px] shadow-lg"
                            isClearable
                        />
                    </Grid>
                    <Grid size={{ lg: 4, md: 6, sm: 6 }}>
                        <Select
                            placeholder="Order"
                            value={selectedOrder}
                            onChange={option => { setSelectedOrder(option); setCurrentPage(1); }}
                            options={orderOptions}
                            className="w-full max-w-[500px] shadow-lg"
                            isClearable
                            
                        />
                    </Grid>
                     <Grid size={{ lg: 4, md: 6, sm: 6 }}>
                        <Button
                            size="sm"
                            variant="primary"
                            className="text-lg text-white-400 w-48 mb-2 h-10 "
                            onClick={handleReset}
                        >
                            Reset
                        </Button>
                    </Grid>
                </Grid>
            </div>

            <div className="relative w-full">
                <button
                    className="absolute right-2 bg-blue-500 text-white px-3 py-1 mt-3 me-2 rounded flex items-center gap-2"
                    onClick={() => navigate("/addContactsList", { state: { from: 'contactList' } })}
                >
                    <span className="text-lg">+</span>Add
                </button>
            </div>
            <ComponentCard title="Contact List">
                <div style={{ overflow: "auto" }}>
                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell isHeader className="font-medium text-gray-500">No.</TableCell>
                                <TableCell isHeader className="font-medium text-gray-500 t">Company</TableCell>
                                <TableCell isHeader className="font-medium text-gray-500 ">Customer ID</TableCell>
                                <TableCell isHeader className="font-medium text-gray-500 ">Vendor ID</TableCell>
                                <TableCell isHeader className="font-medium text-gray-500 ">Contact Man</TableCell>
                                <TableCell isHeader className="font-medium text-gray-500 ">Phone Number</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.5]">
                            {contactsData.length > 0 ? (
                                contactsData.map((data, idx) => (
                                    <TableRow key={data.id ?? idx}>
                                        <TableCell className="text-gray-600 text-start">{data.id || "--"}</TableCell>
                                        <TableCell className="text-gray-600 text-start">{data.company_name || "--"}</TableCell>
                                        <TableCell className="text-gray-600 text-start">{data.customer_id || "--"}</TableCell>
                                        <TableCell className="text-gray-600 text-start">{data.vendor_id || "--"}</TableCell>
                                        <TableCell className="text-gray-600 text-start">{data.user_name || "--"}</TableCell>
                                        <TableCell className="text-gray-600 text-start">{data.phone || "--"}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell className="text-center py-4 text-gray-500">No results found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </ComponentCard>
            <div className="flex flex-wrap justify-between items-center mt-4">
                <span className="text-sm">
                    Showing {contactsData.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage + 1)} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} entries
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
    );
};