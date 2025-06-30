import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { InboxIcon, MailIcon, Trash2Icon, ChevronLeftIcon } from "lucide-react";
import Badge from "../../components/ui/badge/Badge";
import { getMessageById, getTrashedMessages, moveMessageToTrash, restoreTrashMessage } from "../../services/apis";
import moment from "moment";
import { Box, Modal } from "@mui/material";

type TabType = "inbox" | "sent" | "trash";

interface Recipient {
    user_id: number;
    type: string;
    name: string;
    email: string;
    seen_at: string | null;
    trashed_at: string | null;
    deleted_at: string | null;
}

interface Message {
    id: number;
    user_id: number;
    title: string;
    body: string;
    created_at: string;
    updated_at: string;
    sender: {
        user_id: number;
        name: string;
        email: string;
    };
    recipients: Recipient[];
}

export const ReadMessage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const initialTab = location.state?.tab || "inbox";
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>(initialTab);
    const [messageData, setMessageData] = useState<Message | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const userId = Number(localStorage.getItem("Sql_id"));
    const [trashMessages, setTrashMessages] = useState<Message[]>([]);

    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => setLoading(false), 400);
        return () => clearTimeout(timeout);
    }, [activeTab]);
    useEffect(() => {
        const fetchTrashedMessages = async () => {
            if (activeTab !== "trash") return;
            try {
                setLoading(true);
                const res = await getTrashedMessages({
                    user_id: userId,
                    search: "",
                    page: 1,
                    limit: 100,
                });
                setTrashMessages(res.data?.data?.messages || []);
            } catch (error) {
                console.error("Error fetching trashed messages:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrashedMessages();
    }, [activeTab, userId]);
    const handleTabSwitch = (tab: TabType) => {
        navigate(`/message?tab=${tab}`);
    };

    const handleRestore = async () => {
        if (!messageData) return;
        try {
            await restoreTrashMessage({ user_id: messageData.user_id, message_id: messageData.id });
            navigate(-1);
        } catch (error) {
            console.error("Error restoring message:", error);
        }
    };
    useEffect(() => {
        const fetchMessageDataById = async () => {
            try {
                setLoading(true);
                setError(null);
                if (!id) {
                    throw new Error("No message ID provided");
                }

                const response = await getMessageById(id);
                if (!response.data) {
                    throw new Error("Message not found");
                }

                setMessageData(response.data.data);
            } catch (err) {
                console.error("Error fetching message data:", err);
                setError(err instanceof Error ? err.message : "Failed to load message");
            } finally {
                setLoading(false);
            }
        };

        fetchMessageDataById();
    }, [id]);

    const handleDelete = () => {
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!messageData) return;
        try {
            await moveMessageToTrash(messageData.id, { user_id: messageData.user_id });
            setIsDeleteModalOpen(false);
            navigate(-1);
        } catch (error) {
            console.error("Error moving message to trash:", error);
            setIsDeleteModalOpen(false);
        }
    };

    const handleReply = () => {
        navigate("/reply/:id", { state: { message: messageData } });
    };

    const handleForward = () => {
        navigate("/forward/:id", { state: { message: messageData } });
    };

    const getRecipientsByType = (type: string) => {
        if (!messageData || !Array.isArray(messageData.recipients)) return "";
        return messageData.recipients
            .filter(recipient => recipient.type === type)
            .map(recipient =>
                recipient.name
                    ? `${recipient.name} (${recipient.email})`
                    : recipient.email
            )
            .join(", ");
    };

    const getSender = () => {
        if (messageData?.sender) {
            return `${messageData.sender.name} (${messageData.sender.email})`;
        }
        if (Array.isArray(messageData?.recipients)) {
            const from = messageData.recipients.find(r => r.type === "from");
            if (from) return `${from.name} (${from.email})`;
        }
        return "";
    };

    if (loading) {
        return (
            <div className="loader-overlay">
                <div className="loader"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <div className="flex items-center mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="mr-2 p-1 rounded-full hover:bg-gray-100"
                    >
                        <ChevronLeftIcon size={20} />
                    </button>
                    <h1 className="text-xl font-bold">Error</h1>
                </div>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (!messageData) {
        return (
            <div className="p-4">
                <div className="flex items-center mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="mr-2 p-1 rounded-full hover:bg-gray-100"
                    >
                        <ChevronLeftIcon size={20} />
                    </button>
                    <h1 className="text-xl font-bold">Message Not Found</h1>
                </div>
                <p className="text-gray-500 mb-4">The requested message could not be found.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="flex items-center mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="mr-2 p-1 rounded-full hover:bg-gray-100"
                >
                    <ChevronLeftIcon size={20} />
                </button>
                <h1 className="text-xl font-bold">Read Message</h1>
            </div>

            <div className="inline-flex mb-6 border border-gray-400 rounded-md p-1">
                {[
                    { value: "inbox", icon: InboxIcon, label: "Inbox" },
                    { value: "sent", icon: MailIcon, label: "Sent" },
                    { value: "trash", icon: Trash2Icon, label: "Trash" },
                ].map(({ value, icon: Icon, label }) => (
                    <div
                        key={value}
                        className={`cursor-pointer p-1 ${activeTab === value ? "bg-gray-200" : "hover:bg-gray-100"
                            } active:bg-gray-200 transition-all`}
                        onClick={() => handleTabSwitch(value as TabType)}
                    >
                        <Badge
                            size="sm"
                            color={activeTab === value ? "primary" : "light"}
                        >
                            <Icon size={18} className="text-inherit mr-1" />
                            {label}
                        </Badge>
                    </div>
                ))}
            </div>

            <div className="border rounded-lg shadow-sm bg-white p-0 max-w-4xl">
                {/* Subject and Date Row */}
                <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-50">
                    <span className="text-lg font-semibold">{messageData.title}</span>
                    <span className="text-sm text-gray-500">
                        {moment(messageData.created_at).format("DD MMM, YYYY hh:mm A")}
                    </span>
                </div>
                {/* From, To, CC, BCC */}
                <div className="px-6 py-4 border-b">
                    <div className="mb-1 text-sm">
                        <span className="font-medium">From:</span>{" "}
                        {activeTab === "inbox" ? getRecipientsByType("to") : getSender()}
                    </div>
                    <div className="mb-1 text-sm">
                        <span className="font-medium">To:</span>{" "}
                        {activeTab === "inbox" || activeTab === "trash" ? getSender() : getRecipientsByType("to")}
                    </div>
                    {getRecipientsByType("cc") && (
                        <div className="mb-1 text-sm">
                            <span className="font-medium">CC:</span> {getRecipientsByType("cc")}
                        </div>
                    )}
                    {activeTab === "sent" && getRecipientsByType("bcc") && (
                        <div className="mb-1 text-sm">
                            <span className="font-medium">BCC:</span> {getRecipientsByType("bcc")}
                        </div>
                    )}
                </div>
                {/* Actions */}
                <div className="flex gap-2 px-6 py-3 border-b bg-gray-50 justify-center">
                    {activeTab === "inbox" && (
                        <>
                            <button
                                className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
                                onClick={handleReply}
                            >
                                Reply
                            </button>
                            <button
                                className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
                                onClick={handleReply}
                            >
                                Reply All
                            </button>
                            <button
                                className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
                                onClick={handleForward}
                            >
                                Forward
                            </button>
                            <button
                                className="px-3 py-1 bg-gray-100 rounded text-sm text-red-500 hover:bg-gray-200"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        </>
                    )}
                    {activeTab === "sent" && (
                        <>
                            <button
                                className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
                                onClick={handleForward}
                            >
                                Forward
                            </button>
                            <button
                                className="px-3 py-1 bg-gray-100 rounded text-sm text-red-500 hover:bg-gray-200"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        </>
                    )}
                    {activeTab === "trash" && (
                        <button
                            className="px-3 py-1 bg-gray-100 rounded text-sm text-green-600 hover:bg-gray-200"
                            onClick={handleRestore}
                        >
                            Restore
                        </button>
                    )}
                </div>
                {/* Message Body */}
                <div className="flex justify-between items-center p-4 ">
                    <div className="px-6 text-sm whitespace-pre-line">
                        {messageData.body}
                    </div>
                    {activeTab === "trash" && (
                        <button
                            className="px-3 py-1 bg-gray-100 rounded text-sm text-green-600 hover:bg-gray-200"
                            onClick={handleRestore}
                        >
                            Restore
                        </button>
                    )}
                    {(activeTab === "inbox" || activeTab === "sent") && (
                        <button
                            className="px-3 py-1 bg-gray-100 rounded text-sm text-red-500 hover:bg-gray-200"
                            onClick={handleDelete}
                        >
                            Delete
                        </button>
                    )}
                </div>
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