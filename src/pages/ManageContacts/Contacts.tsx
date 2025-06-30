import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import Select from "react-select";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Button from "../../components/ui/button/Button";
import { deleteContact, getAllContactPageLimit } from "../../services/apis";
import { Box, Modal, Grid } from "@mui/material";
import { toast } from "react-toastify";

interface ContactsItems {
    // Original fields
    userId: string;
    user_id?: string;
    blank?: string;
    type?: string;
    private?: string;
    id?: string;


    // Date fields
    recentMeetDate?: string;
    recentOrderDate?: string;
    recent_meet_date?: string;
    recent_order_date?: string;
    authorize_date?: string;
    recentAuthorizeDate?: string;

    // ID fields
    customerId?: string;
    customer_id?: string;
    vendorId?: string;
    vendor_id?: string;

    // Business fields
    creditApprove?: string;
    credit_approve?: string;
    discountLevel?: string;
    discount_level?: string;
    accountNumber?: string;
    account_number?: string;
    freight?: string;

    // Contact info
    contact?: string;
    company?: string;
    company_name?: string;
    tradeMark?: string;
    trade_mark?: string;
    business_type?: string;
    membershipType?: string;
    membership_type?: string;

    // Address
    addressTwo?: string;
    addressOne?: string;
    address1?: string;
    address2?: string;
    state?: string;
    city?: string;
    zip?: string;
    country?: string;
    country_id?: string;
    country_name?: string;
    // Communication
    phoneNumber?: string;
    phone?: string;
    faxNumber?: string;
    fax?: string;
    email?: string;
    mobile?: string;
    homepages?: string;
    homepage?: string;

    // Other
    employee?: string;
    category?: string;
    distributor?: string;
    discipline?: string;
    products?: string;
    notes?: string;
}

const getTypeLabel = (typeValue: string | undefined) => {
    if (!typeValue) return "--";
    const foundType = typeOptions.find(option => option.value === typeValue);
    return foundType ? foundType.label : typeValue; // fallback to raw value if not found
};

const contactFields = [
    { label: "UserID", key: "user_id" },
    { label: "ID", key: "id" },
    {
        label: "Type",
        key: "type",
        render: (value: string) => getTypeLabel(value)
    },
    { label: "Recent Order Date", key: "recentOrderDate" },
    { label: "Recent Meet Date", key: "recentMeetDate" },
    { label: "Recent Authorize Date", key: "authorize_date" },
    { label: "Customer ID", key: "customer_id" },
    { label: "Credit Approve", key: "credit_approve" },
    { label: "Vendor ID", key: "vendor_id" },
    {
        label: "Discount Level",
        key: "discount_level",
        render: (value: string) => value ? `${value}%` : "--"
    },
    { label: "Prefered freight forwarder", key: "freight" },
    { label: "Account Number", key: "account_number" },
    {
        label: "Contact",
        key: "contact",
        //render: (value: string, item: ContactsItems) => value || item.user_name || "--"
    },
    { label: "Company", key: "company_name" },
    { label: "Trade Mark", key: "trade_mark" },
    { label: "Bussiness Type ", key: "business_type" },
    { label: "Membership Type", key: "membership_type" },
    { label: "Address one", key: "address1" },
    { label: "Address two", key: "address2" },
    { label: "City", key: "city" },
    { label: "State", key: "state_name" },
    { label: "Country", key: "country_name" },
    { label: "Zip", key: "zip" },
    { label: "Phone Number", key: "phone" },
    { label: "Fax Number", key: "fax" },
    { label: "Email", key: "email" },
    { label: "Mobile", key: "mobile" },
    { label: "Homepages", key: "homepage" },
    { label: "Employee", key: "employee" },
    { label: "Category", key: "category" },
    { label: "Membership Type", key: "membership_type" },
    { label: "Distributor", key: "distributor" },
    { label: "Discipline", key: "discipline" },
    { label: "Products", key: "products" },
    { label: "Notes", key: "notes" },
];

const typeOptions = [
    { value: "1", label: "Private" },
    { value: "2", label: "VIP Private" },
    { value: "3", label: "Vendor" },
    { value: "4", label: "VIP Vendor" },
    { value: "5", label: "Forwarder" },
    { value: "6", label: "VIP Forwarder" },
    { value: "7", label: "User" },
    { value: "8", label: "VIP User" },
    { value: "9", label: "OLD User" },
    { value: "10", label: "Employee" },
    { value: "11", label: "Others" },
];

const getRows = (fields: any[], data: any) => {
    const rows = [];
    for (let i = 0; i < fields.length; i += 2) {
        rows.push([fields[i], fields[i + 1]]);
    }
    return rows;
};

export const Contacts: React.FC = () => {
    const navigate = useNavigate();
    const generalSearchRef = useRef<HTMLInputElement>(null);
    const fieldSearchRef = useRef<HTMLInputElement>(null);
    const [generalSearchTerm, setGeneralSearchTerm] = useState<string>("");
    const [fieldSearchTerm, setFieldSearchTerm] = useState<string>("");
    const [selectedFilter, setSelectedFilter] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [allContacts, setAllContacts] = useState<ContactsItems[]>([]);
    const [contactData, setContactData] = useState<ContactsItems[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | number | null>(null);
    const itemsPerPage = 10;
    const [loading, setLoading] = useState(false);
    const [totalContacts, setTotalContacts] = useState(0);
     const [stateMap, setStateMap] = useState<Record<string, string>>({});

    // function getCountryName(countryId: string, countryName?: string): string {
    //     // If we already have the country name, use it
    //     if (countryName && countryName !== countryId) {
    //         return countryName;
    //     }
        
       const countryMap: Record<string, string> = {
    "19": "United States",
    "101": "India",
    "44": "United Kingdom",
    // ... add the rest of your country codes and names
};

function getCountryName(countryId?: string, fallback?: string): string {
    if (!countryId) return fallback || "--";
    return countryMap[countryId] || fallback || "--";
}

function mapContactItem(raw: any): ContactsItems {
    return {
        ...raw,
        userId: raw.userId || raw.user_id || raw.user_name || "",
        id: raw.id || "",
        contact: raw.contact || raw.user_name || "",
        company: raw.company_name || raw.name || "",
        email: raw.email || "",
        phoneNumber: raw.phone || "",
        city: raw.city || "",
        country_name: getCountryName(raw.country_id?.toString(), raw.country_name || raw.country),
        products: raw.business_line || raw.products || "",
    };
}

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                console.log(`Loading page ${currentPage} with ${itemsPerPage} items per page`);
                const response = await getAllContactPageLimit({ page: currentPage, limit: itemsPerPage, filters: {} });
                console.log("Initial data response:", response.data?.data);

                const all = (response.data?.data?.data || []).map(mapContactItem);
                setAllContacts(all);
                setContactData(all);
                setTotalContacts(response.data?.data?.total || 0);

                console.log(`Loaded ${all.length} contacts out of ${response.data?.data?.total || 0} total`);
            } catch (error) {
                console.error("Error fetching contacts:", error);
                setAllContacts([]);
                setContactData([]);
                setTotalContacts(0);
            }
            setLoading(false);
        })();
    }, [currentPage, itemsPerPage]);

    useEffect(() => {
        const fetchFilteredData = async () => {
            setLoading(true);
            try {
                const filters: any = {};

                // General search (searches all fields)
                if (generalSearchTerm.trim()) {
                    filters.search = generalSearchTerm.trim();
                    console.log(`General searching all fields for: ${generalSearchTerm.trim()}`);
                }

                // Field-specific search (searches only the selected field)
                if (fieldSearchTerm.trim() && selectedFilter && selectedFilter.value) {
                    filters[selectedFilter.value] = fieldSearchTerm.trim();
                    console.log(`Field searching by ${selectedFilter.label} with value: ${fieldSearchTerm.trim()}`);
                }

                console.log("Sending filters to API:", JSON.stringify(filters));

                const response = await getAllContactPageLimit({
                    page: currentPage,
                    limit: itemsPerPage,
                    filters: filters
                });

                console.log("API response:", response.data?.data);

                const all = (response.data?.data?.data || []).map(mapContactItem);
                setAllContacts(all);
                setContactData(all);
                setTotalContacts(response.data?.data?.total || 0);

                console.log(`Found ${all.length} contacts out of ${response.data?.data?.total || 0} total`);
            } catch (error) {
                console.error("Error fetching filtered contacts:", error);
                setAllContacts([]);
                setContactData([]);
                setTotalContacts(0);
            }
            setLoading(false);
        };

        // Debounce the search to avoid too many API calls
        const timeoutId = setTimeout(() => {
            fetchFilteredData();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [generalSearchTerm, fieldSearchTerm, selectedFilter, currentPage, itemsPerPage]);

    // Reset page to 1 when search/filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [generalSearchTerm, fieldSearchTerm, selectedFilter]);

    const allOptions = contactFields.map(field => ({
        value: field.key,
        label: field.label
    }));

    const handleReset = async () => {
        setGeneralSearchTerm("");
        setFieldSearchTerm("");
        setSelectedFilter(null);
        setCurrentPage(1);
        if (generalSearchRef.current) {
            generalSearchRef.current.value = "";
        }
        if (fieldSearchRef.current) {
            fieldSearchRef.current.value = "";
        }

        // Fetch fresh data without filters
        setLoading(true);
        try {
            const response = await getAllContactPageLimit({ page: 1, limit: itemsPerPage, filters: {} });
            const all = (response.data?.data?.data || []).map(mapContactItem);
            setAllContacts(all);
            setContactData(all);
            setTotalContacts(response.data?.data?.total || 0);
        } catch (error) {
            console.error("Error resetting contacts:", error);
            setAllContacts([]);
            setContactData([]);
            setTotalContacts(0);
        }
        setLoading(false);
    };

    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };

    const handleDelete = async () => {
        setLoading(true);
        if (!deleteId) return;
        try {
            await deleteContact(deleteId);
            setIsDeleteModalOpen(false);
            setDeleteId(null);

            // Refresh contacts with current pagination settings
            const response = await getAllContactPageLimit({
                page: currentPage,
                limit: itemsPerPage,
                filters: {
                    ...(generalSearchTerm.trim() ? { search: generalSearchTerm.trim() } : {}),
                    ...(fieldSearchTerm.trim() && selectedFilter?.value ? { [selectedFilter.value]: fieldSearchTerm.trim() } : {})
                }
            });

            const all = response.data?.data?.data || [];
            setAllContacts(all);
            setContactData(all);
            setTotalContacts(response.data?.data?.total || 0);

            // If we deleted the last item on the page, go back one page
            if (all.length === 0 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }

            toast.success("Contact deleted successfully!", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
        } catch (error) {
            console.error("Delete failed:", error);
            toast.error("Failed to delete contact.", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(totalContacts / itemsPerPage);

    return (
        <div>
            {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            <h1 className="text-gray-500 font-semibold text-xl mb-4">View Contact</h1>

            <div className="mb-5">
                <div className="mb-5">
                    <Grid container spacing={2}>
                        {/* General Search */}
                       <Grid size={{ lg: 4, md: 6, sm: 6 }}>
                            <div className="mb-2">
                                
                                <input
                                    ref={generalSearchRef}
                                    type="text"
                                    value={generalSearchTerm}
                                    onChange={(e) => setGeneralSearchTerm(e.target.value)}
                                    className="h-9 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                                    placeholder="Search across all fields..."
                                    disabled={loading}
                                />
                            </div>
                        </Grid>

                        {/* Field Search */}
                      <Grid size={{ lg: 4, md: 6, sm: 6 }}>
                            <div className="mb-2">
                              
                                <Select
                                    options={allOptions}
                                    isClearable
                                    placeholder="Select field to search"
                                    value={selectedFilter}
                                    onChange={(option) => setSelectedFilter(option)}
                                    className="w-full shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                                    isDisabled={loading}
                                />
                            </div>
                        </Grid>

                        {/* Reset Button */}
                        <Grid size={{ lg: 4, md: 6, sm: 6 }}>
                            <Button
                                size="sm"
                               className="text-lg text-white-400 w-48 mb-2 h-10 "
                                onClick={handleReset}
                                disabled={loading}
                            >
                                Reset
                            </Button>
                        </Grid>
                    </Grid>
                </div>
            </div>

            {contactData && contactData.length > 0 ? contactData.map((contact, idx) => (
                <ComponentCard key={idx} title="View Contact" className=" text-gray-500 mb-6">
                    <div>
                        <table className="min-w-full">
                            <tbody>
                                {getRows(contactFields, contact).map((row, i) => (
                                    <tr key={i} className="border-b border-gray-100">
                                        <td className="px-4 py-2 font-medium text-gray-600 w-1/6">{row[0]?.label}</td>
                                        <td className="px-4 py-2 text-gray-800 w-1/3">
                                            {row[0]?.render
                                                ? row[0].render(contact[row[0]?.key as keyof ContactsItems] as string, contact)
                                                : (contact[row[0]?.key as keyof ContactsItems] || "--")}
                                        </td>
                                        <td className="px-4 py-2 font-medium text-gray-600 w-1/6">{row[1]?.label}</td>
                                        <td className="px-4 py-2 text-gray-800 w-1/3">
                                            {row[1]
                                                ? (row[1]?.render
                                                    ? row[1].render(contact[row[1]?.key as keyof ContactsItems] as string)
                                                    : (contact[row[1]?.key as keyof ContactsItems] || "--"))
                                                : ""}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 text-sm text-gray-500 text-end">
                        <button
                            className="text-blue-500 hover:text-blue-700 ml-2"
                            onClick={() => navigate("/addContactsList", { state: { from: 'contact' } })}
                        >
                            Add Other
                        </button>|
                        <button
                            className="text-blue-500 hover:text-blue-700 ml-2"
                            onClick={() => {
                                setDeleteId(contact.id ?? null);
                                setIsDeleteModalOpen(true);
                            }}
                        >Delete</button> |
                        <button
                            className="text-blue-500 hover:text-blue-700 ml-2"
                            onClick={() => navigate(`/editcontactsList/${contact.id}`, {
                                state: { from: 'contact' }
                            })}
                        >
                            Modify
                        </button>
                    </div>
                </ComponentCard>
            )) : (
                <ComponentCard title="View Contact" className="text text-gray-500 mb-6">
                    <div className="text-center py-4 text-gray-500">No results found</div>
                </ComponentCard>
            )}

            <div className="flex flex-wrap justify-between items-center mt-4">
                <span className="text-sm">
                    Showing {totalContacts === 0 ? 0 : ((currentPage - 1) * itemsPerPage + 1)}
                    to {Math.min(currentPage * itemsPerPage, totalContacts)}
                    of {totalContacts} entries
                </span>
                <span className="flex justify-end mt-2">
                    <Stack spacing={2}>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            disabled={loading}
                        />
                    </Stack>
                </span>
            </div>
            <Modal
                open={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteId(null);
                }}
            >
                <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
                        <p>
                            Are you sure you want to delete this contact?
                        </p>
                        <div className="flex justify-end mt-4">
                            <button
                                className="text-gray-600 hover:text-gray-900 mr-4"
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setDeleteId(null);
                                }}
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