import React, { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import Button from "../../components/ui/button/Button";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import ComponentCard from "../../components/common/ComponentCard";
import { getLogById, updateLog } from "../../services/apis";
import { useParams } from "react-router";
import { Trash2Icon, EyeIcon } from "lucide-react";
import Badge from "../../components/ui/badge/Badge";
import { Box, Modal } from "@mui/material";
import { toast } from "react-toastify";

export const LogsFiles: React.FC = () => {
    const { id } = useParams();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [lofFilesData, setLofFilesData] = useState<any>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [fileToDeleteId, setFileToDeleteId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getLofFilesData();
    }, []);

    async function getLofFilesData() {
        try {
            const res = await getLogById(id);
            setLofFilesData(res.data.data);
        }
        catch (err) {
            console.log(err);
        }
    }

    const handleDeleteClick = (fileId: string) => {
        setFileToDeleteId(fileId);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteFile = async () => {
        if (!fileToDeleteId) return;
        setLoading(true);
        try {
            const updatedFileData = lofFilesData.fileData.filter((file: any) => file._id !== fileToDeleteId);

            const updatedLog = { ...lofFilesData, fileData: updatedFileData };

            await updateLog(updatedLog, lofFilesData.id);

            setLofFilesData(updatedLog);

            toast.success("File deleted successfully!", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
        } catch (error) {
            toast.error("Failed to delete file.", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
        } finally {
            setIsDeleteModalOpen(false);
            setFileToDeleteId(null);
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Log Files</h1>

            <div className="mb-4">
                <Grid container spacing={1}>
                    <Grid item lg={10} sm={8}>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-9 w-full max-w-[400px] rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                        />
                    </Grid>
                    <Grid item lg={2} sm={4}>
                        <Button
                            onClick={() => setSearchTerm("")}
                            size="sm"
                            variant="primary"
                            className="ml-25"
                        >
                            Reset
                        </Button>
                    </Grid>
                </Grid>
            </div>

            <ComponentCard title="Log File List">
                <div style={{ overflow: "auto" }}>
                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                                    Name
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                                    Action
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {lofFilesData?.fileData?.length > 0 ? (
                                lofFilesData.fileData
                                    .filter((file: any) =>
                                        file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .map((file: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell className="px-4 py-3 text-gray-600 text-start">
                                                {file.fileName}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-600 text-start">
                                                <div className="flex gap-2">
                                                    <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                                        <Badge size="sm" color="info">
                                                            <EyeIcon size={14} />
                                                        </Badge>
                                                    </a>
                                                    <div className="cursor-pointer"
                                                        onClick={() => handleDeleteClick(file._id)}>
                                                        <Badge size="sm" color="warning">
                                                            <Trash2Icon size={14} />
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            ) : (
                                <TableRow>
                                    <td colSpan={2} className="text-center py-4 text-gray-500">
                                        No log files found.
                                    </td>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </ComponentCard>
            <Modal
                open={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
            >
                <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
                        <p>Are you sure you want to delete this log file?</p>
                        <div className="flex justify-end mt-4">
                            <button
                                className="text-gray-600 hover:text-gray-900 mr-4"
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center justify-center"
                                onClick={handleDeleteFile}
                                disabled={loading}
                            >
                                {loading ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};