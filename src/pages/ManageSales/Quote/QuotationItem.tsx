import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Box, Modal } from "@mui/material";
import ComponentCard from "../../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { EditIcon, Trash2Icon } from "lucide-react";
import Badge from "../../../components/ui/badge/Badge";
import { deleteQuoteItem, getAllQuoteItemsById } from "../../../services/apis";
import { toast } from "react-toastify";

export const QuotationItem: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [quotationItems, setQuotationItems] = useState<any[]>([]);
    const [deleteId, setDeleteId] = useState<string | number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const data = await getAllQuoteItemsById(id);
            setQuotationItems(data?.data.data);
        } catch (err) {
            console.error("Failed to fetch items:", err);
        }
        setLoading(false);
    };
    // console.log(quotationItems,"dddddddd");
    const handleDelete = async () => {
        setLoading(true);
        if (!deleteId) {
            setLoading(false);
            return;
        }

        try {
            await deleteQuoteItem(deleteId);
            setIsDeleteModalOpen(false);
            setDeleteId(null);
            await fetchItems();

            toast.success("Quote item deleted successfully!", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
        } catch (error) {
            toast.error("Failed to delete the quote item.", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
        } finally {
            setLoading(false);
        }
    };
    return (
        <div>
            {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Quotation Item Management</h2>
                <button className="bg-brand p-4 rounded-xl" onClick={() => navigate(-1)} >Back</button>
            </div>

            <ComponentCard title="">
                <div style={{ overflowX: "auto" }}>
                    <div className="mb-4 flex justify-between items-center px-4">
                        <h2 className="text-xl font-semibold">List</h2>
                        <button className="bg-brand p-4 rounded-xl" color="primary" onClick={() => navigate(`/addQuote`)}>Generate Quote</button>
                    </div>

                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Item No.</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Description</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Quantity</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Unit Price</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Ext. Price</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Delivery Days</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Action</TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {quotationItems?.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell className="px-4 py-3 text-gray-600 text-start">{index + 1}</TableCell>
                                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                                        <table className="w-full text-sm text-gray-800">
                                            <tbody>
                                                {[
                                                    ["Category", item?.categorieData?.name || "N/A"],
                                                    ["Sub Category", item?.subcategoryData?.name || "N/A"],
                                                    ["Model", item?.model || "N/A"],
                                                    ["Size", item?.sizeData?.name || "N/A"],
                                                    ["Pressure", item?.pressureData?.name || "N/A"],
                                                    ["Material", item?.materialData?.name || "N/A"],
                                                    ["Weight", item?.weight || "N/A"],
                                                    ["Location", item?.locationData?.name || "N/A"],
                                                    ["Valid Since", item?.validSince || "N/A"],
                                                    ["Distributer Price", item?.distributorPrice || "N/A"],
                                                    ["Brand", item?.brand || "N/A"],
                                                    ["Description", item?.productData?.description || "N/A"]
                                                ].map(([label, value], idx) => (
                                                    <tr key={idx}>
                                                        <td className="w-40 font-medium bg-yellow-50 p-1">{label}:</td>
                                                        <td className="p-1">{value}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-600 text-start">{item.quantity}</TableCell>
                                    <TableCell className="px-4 py-3 text-gray-600 text-start">{item.unit_price}</TableCell>
                                    <TableCell className="px-4 py-3 text-gray-600 text-start">{item.ext_price}</TableCell>
                                    <TableCell className="px-4 py-3 text-gray-600 text-start">{item.delivery}</TableCell>
                                    <TableCell className="px-4 py-3 text-gray-600 text-start">
                                        <div className="flex gap-2">
                                            <div className="cursor-pointer" onClick={() => navigate(`/editItem/${item._id}`)}>
                                                <Badge size="sm" color="success">
                                                    <EditIcon size={14} />
                                                </Badge>
                                            </div>
                                            <div className="cursor-pointer" onClick={() => {
                                                setDeleteId(item.id ?? null);
                                                setIsDeleteModalOpen(true);
                                            }}>
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

            {/* Delete Modal remains unchanged */}
            <Modal open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
                        <p>Are you sure you want to delete this list?</p>
                        <div className="flex justify-end mt-4">
                            <button className="text-gray-600 hover:text-gray-900 mr-4" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
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

export default QuotationItem;
