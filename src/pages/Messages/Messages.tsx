import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Trash2Icon, EyeIcon, InboxIcon, MailIcon, ArchiveRestoreIcon } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    // TableHeader,
    TableRow,
} from "../../components/ui/table";
import ComponentCard from "../../components/common/ComponentCard";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Badge from "../../components/ui/badge/Badge";
import { Box, Modal } from "@mui/material";
import { getInboxMessages, getSentMessages, getTrashedMessages, moveMessageToTrash, deleteMessageFromTrash, restoreTrashMessage } from "../../services/apis";
import moment from "moment";

interface Recipient {
    user_id: number;
    type: string;
    user_name: string;
    user_email: string | null;
    seen_at: string | null;
    trashed_at: string | null;
    deleted_at: string | null;
}

interface Message {
    id: number;
    title: string;
    body: string;
    created_at: string;
    updated_at?: string;
    recipients?: Recipient[];
    from?: {
        user_id: number;
        sender_name: string;
        sender_email: string;
    };
}

interface NormalizedMessage {
    id: number;
    sender: string;
    body: string;
    date: string;
    type: "inbox" | "sent" | "trash";
}

export const Messages: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [inboxData, setInboxData] = useState<NormalizedMessage[]>([]);
    const [sentData, setSentData] = useState<NormalizedMessage[]>([]);
    const [trashData, setTrashData] = useState<NormalizedMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const initialTab = (params.get("tab") as "inbox" | "sent" | "trash") || "inbox";
    const [activeTab, setActiveTab] = useState<"inbox" | "sent" | "trash">(initialTab);
    const [total, setTotal] = useState(0);
    const itemsPerPage = 5;
    const userId = Number(localStorage.getItem("Sql_id"));
    const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);

    const tabData =
        activeTab === "inbox"
            ? inboxData
            : activeTab === "sent"
                ? sentData
                : trashData;

    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true);
            try {
                if (activeTab === "inbox") {
                    const res = await getInboxMessages({
                        user_id: userId,
                        search: searchTerm,
                        page: currentPage,
                        limit: itemsPerPage,
                    });
                    const transformedData = transformMessageData(res.data?.data?.messages || [], "inbox");
                    setInboxData(transformedData);
                    setTotal(res.data?.data?.total || 0);
                } else if (activeTab === "sent") {
                    const res = await getSentMessages({
                        user_id: userId,
                        search: searchTerm,
                        page: currentPage,
                        limit: itemsPerPage,
                    });
                    const transformedData = transformMessageData(res.data?.data?.messages || [], "sent");
                    setSentData(transformedData);
                    setTotal(res.data?.data?.total || 0);
                }
                else if (activeTab === "trash") {
                    const res = await getTrashedMessages({
                        user_id: userId,
                        search: searchTerm,
                        page: currentPage,
                        limit: itemsPerPage,
                    });
                    const transformedData = transformMessageData(res.data?.data?.messages || [], "trash");
                    setTrashData(transformedData);
                    setTotal(res.data?.data?.total || 0);
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
            setLoading(false);
        };
        fetchMessages();
    }, [activeTab, searchTerm, currentPage]);

    const transformMessageData = (messages: Message[], activeTab: string) => {
        return messages.map(message => {
            if (activeTab === "sent") {
                const toRecipients = message.recipients
                    ?.filter(r => r.type === "to")
                    .map(r => r.user_name)
                    .join(", ");
                return {
                    id: message.id,
                    sender: toRecipients || "Unknown",
                    body: message.title,
                    date: message.created_at,
                    type: "sent" as "inbox" | "sent" | "trash"
                };
            }
            if (activeTab === "trash") {
                return {
                    id: message.id,
                    sender: message.from?.sender_name || "Unknown",
                    body: message.title,
                    date: message.created_at,
                    type: "trash" as "inbox" | "sent" | "trash"
                };
            }
            return {
                id: message.id,
                sender: message.from?.sender_name || "Unknown",
                body: message.title,
                date: message.created_at,
                type: "inbox" as "inbox" | "sent" | "trash"
            };
        });
    };

    const filteredData = tabData.filter((item) =>
        Object.values(item).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const totalPages = Math.ceil((total || filteredData.length) / itemsPerPage);
    const paginatedItems = filteredData.slice(0, itemsPerPage);

    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };
    const handleRestoreClick = async (id: number) => {
        setLoading(true);
        try {
            await restoreTrashMessage({ user_id: userId, message_id: id });
            const res = await getTrashedMessages({
                user_id: userId,
                search: searchTerm,
                page: currentPage,
                limit: itemsPerPage,
            });
            const transformedData = transformMessageData(res.data?.data?.messages || [], "trash");
            setTrashData(transformedData);
            setTotal(res.data?.data?.total || 0);
        } catch (error) {
            console.error("Error restoring message:", error);
        }
        setLoading(false);
    };

    const handleDeleteClick = (id: number) => {
        setSelectedMessageId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedMessageId !== null) {
            setLoading(true);
            try {
                if (activeTab === "trash") {
                    await deleteMessageFromTrash({ user_id: userId, message_id: selectedMessageId });
                    const res = await getTrashedMessages({
                        user_id: userId,
                        search: searchTerm,
                        page: currentPage,
                        limit: itemsPerPage,
                    });
                    const transformedData = transformMessageData(res.data?.data?.messages || [], "trash");
                    setTrashData(transformedData);
                    setTotal(res.data?.data?.total || 0);
                } else {
                    await moveMessageToTrash(selectedMessageId, { user_id: userId });
                    if (activeTab === "inbox") {
                        const res = await getInboxMessages({
                            user_id: userId,
                            search: searchTerm,
                            page: currentPage,
                            limit: itemsPerPage,
                        });
                        const transformedData = transformMessageData(res.data?.data?.messages || [], "inbox");
                        setInboxData(transformedData);
                        setTotal(res.data?.data?.total || 0);
                    } else if (activeTab === "sent") {
                        const res = await getSentMessages({
                            user_id: userId,
                            search: searchTerm,
                            page: currentPage,
                            limit: itemsPerPage,
                        });
                        const transformedData = transformMessageData(res.data?.data?.messages || [], "sent");
                        setSentData(transformedData);
                        setTotal(res.data?.data?.total || 0);
                    }
                }
            } catch (error) {
                console.error("Error deleting message:", error);
            }
            setLoading(false);
            setIsDeleteModalOpen(false);
            setSelectedMessageId(null);
        }
    };
    const getHeadingText = () => {
        switch (activeTab) {
            case "inbox":
                return "Inbox";
            case "sent":
                return "Sent Messages";
            case "trash":
                return "Trash Messages";
            default:
                return "Messages";
        }
    };
    const getCardTitle = () => {
        switch (activeTab) {
            case "inbox":
                return "Inbox";
            case "sent":
                return "Sent";
            case "trash":
                return "Trash";
            default:
                return "Message";
        }
    };

    return (
        <div className="p-4">
            {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            <h1 className="text-xl font-bold mb-4">{getHeadingText()}</h1>
            <div className="flex mb-4 justify-between">
                <div className="w-1/2">
                    <input
                        type="text"
                        placeholder="Search...."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="h-10 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                    />
                </div>
                <button className=" text-white rounded-xl bg-brand px-4 py-3"
                    onClick={() => navigate("/reply")}
                >Compose</button>
            </div>

            <div className="inline-flex mb-4 border-1 border-gray-400 rounded-md p-1">
                <div
                    className={`cursor-pointer p-1 ${activeTab === "inbox" ? "bg-gray-200" : "hover:bg-gray-100"} active:bg-gray-200 transition-all`}
                    onClick={() => {
                        setActiveTab("inbox");
                        setCurrentPage(1);
                    }}
                >
                    <Badge size="md" color={activeTab === "inbox" ? "primary" : "light"}>
                        <InboxIcon size={18} className="text-inherit mr-1" />
                        Inbox
                    </Badge>
                </div>
                <div
                    className={`cursor-pointer p-1 ${activeTab === "sent" ? "bg-gray-200" : "hover:bg-gray-100"} active:bg-gray-200 transition-all`}
                    onClick={() => {
                        setActiveTab("sent");
                        setCurrentPage(1);
                    }}
                >
                    <Badge size="sm" color={activeTab === "sent" ? "primary" : "light"}>
                        <MailIcon size={18} className="text-inherit mr-1" />
                        Sent
                    </Badge>
                </div>
                <div
                    className={`cursor-pointer p-1 ${activeTab === "trash" ? "bg-gray-200" : "hover:bg-gray-100"} active:bg-gray-200 transition-all`}
                    onClick={() => {
                        setActiveTab("trash");
                        setCurrentPage(1);
                    }}
                >
                    <Badge size="sm" color={activeTab === "trash" ? "primary" : "light"}>
                        <Trash2Icon size={18} className="text-inherit mr-1" />
                        Trash
                    </Badge>
                </div>
            </div>

            <div className="relative w-full">
                <ComponentCard title={getCardTitle()}>
                    <div style={{ overflowX: "auto" }}>
                        <Table>
                            {/* <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Sender</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Message</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Date</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Action</TableCell>
                                </TableRow>
                            </TableHeader> */}
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {paginatedItems.length > 0 ? (
                                    paginatedItems.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="px-4 py-3 text-blue-500 cursor-pointer text-start font-medium hover:underline">
                                                <button onClick={() => navigate(`/readMessage/${item.id}`, { state: { tab: activeTab } })}>
                                                    {item.sender}
                                                </button>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-blue-500 cursor-pointer text-start font-medium hover:underline">
                                                <button onClick={() => navigate(`/readMessage/${item.id}`, { state: { tab: activeTab } })}>
                                                    {item.body}
                                                </button>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-600 text-start">
                                                {moment(item.date).format("YYYY-MM-DD")}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-600 text-start">
                                                <div className="flex gap-2">
                                                    {activeTab === "trash" ? (
                                                        <div className="cursor-pointer" onClick={() => handleRestoreClick(item.id)}>
                                                            <Badge size="sm" color="success">
                                                                <ArchiveRestoreIcon size={14} />
                                                            </Badge>
                                                        </div>
                                                    ) : (
                                                        <div className="cursor-pointer" onClick={() => navigate(`/readMessage/${item.id}`)}>
                                                            <Badge size="sm" color="info">
                                                                <EyeIcon size={14} />
                                                            </Badge>
                                                        </div>
                                                    )}

                                                    <div className="cursor-pointer" onClick={() => handleDeleteClick(item.id)}>
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
                                        <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                                            No messages found in {activeTab}
                                        </td>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </ComponentCard>

                {filteredData.length > 0 && (
                    <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
                        <span className="text-sm">
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} entries
                        </span>
                        <Stack spacing={2}>
                            <Pagination
                                count={totalPages}
                                page={currentPage}
                                onChange={handlePageChange}
                                color="primary"
                            />
                        </Stack>
                    </div>
                )}
            </div>
            <Modal
                open={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
            >
                <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
                        <p>
                            Are you sure you want to delete this message?
                        </p>
                        <div className="flex justify-end mt-4">
                            <button
                                className="text-gray-600 hover:text-gray-900 mr-4"
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                                onClick={handleConfirmDelete}
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