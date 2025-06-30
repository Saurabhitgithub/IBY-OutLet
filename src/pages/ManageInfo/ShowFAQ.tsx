import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EditIcon, Trash2Icon, ForwardIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import ComponentCard from "../../components/common/ComponentCard";
import { Box, Modal } from "@mui/material";
import {
  getParentDataById,
  getFaqById,
  deleteParentQuestion,
  deleteChildAnswer,
  deleteFaq,
} from "../../services/apis";

interface AnswerItem {
  id: number;
  answerText: string;
  files: string;
  author: string;
  created_at: string;
}

interface FAQItem {
  id: number;
  question: string;
  author: string;
  created_at: string;
  answers: AnswerItem[];
}

export const ShowFAQ: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: "question" | "answer";
    id: number | null;
  }>({ type: "question", id: null });
  const [faqData, setFaqData] = useState<FAQItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id } = useParams<{ id: string }>();

  const confirmDelete = (type: "question" | "answer", id: number) => {
    setItemToDelete({ type, id });
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete.id) return;
    try {
      setLoading(true);
      if (itemToDelete.type === "question") {
        await deleteParentQuestion(itemToDelete.id.toString());
        await deleteFaq(itemToDelete.id.toString());
        navigate("/faq");
      } else {
        const response = await deleteChildAnswer(itemToDelete.id.toString());
        if (response.status === 200) {
          setFaqData((prev) =>
            prev
              ? {
                  ...prev,
                  answers: prev.answers.filter((a) => a.id !== itemToDelete.id),
                }
              : null
          );
          await deleteFaq(itemToDelete.id.toString());
        } else {
          throw new Error("Failed to delete answer");
        }
      }
    } catch (error) {
      console.error(`Error deleting ${itemToDelete.type}:`, error);
    } finally {
      setLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!id) throw new Error("FAQ ID is missing");

        const questionResponse = await getFaqById(Number(id));
        if (!questionResponse.data?.data) {
          throw new Error("Invalid question data received");
        }

        let questionAuthor = "Unknown";
        if (questionResponse.data.data.authorData?.length > 0) {
          questionAuthor = questionResponse.data.data.authorData[0].name;
        } else if (questionResponse.data.data.author) {
          questionAuthor = questionResponse.data.data.author;
        }

        const answersResponse = await getParentDataById(Number(id));
        if (!answersResponse.data?.data?.parentData) {
          throw new Error("Invalid answers data received");
        }

        if (
          questionAuthor === "Unknown" &&
          answersResponse.data.data.parentData.length > 0
        ) {
          const firstAnswer = answersResponse.data.data.parentData[0];
          if (firstAnswer.authorData?.length > 0) {
            questionAuthor = firstAnswer.authorData[0].name;
          }
        }

        const answers = answersResponse.data.data.parentData.map((item) => ({
          id: item.id,
          answerText: item.question,
          files: item.files,
          author:
            item.authorData?.length > 0 ? item.authorData[0].name : "Unknown",
          created_at: item.created_at,
        }));

        setFaqData({
          id: questionResponse.data.data.id,
          question: questionResponse.data.data.question,
          author: questionAuthor,
          created_at: questionResponse.data.data.created_at || "",
          answers: answers,
        });
      } catch (err) {
        setError("Failed to fetch FAQ data. Please try again later.");
        console.error("Error fetching FAQ data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const filteredAnswers = useMemo(() => {
    if (!faqData) return [];
    return faqData.answers.filter((answer) => {
      return (
        answer.answerText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        answer.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        answer.created_at.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery, faqData]);

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">FAQ Details</h1>
        <div className="flex justify-center items-center h-64">
 {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">FAQ Details</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      </div>
    );
  }

  if (!faqData) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">FAQ Details</h1>
        <div className="text-center py-8 text-gray-400">No FAQ data found.</div>
      </div>
    );
  }

  const filteredFaqData = faqData ? [faqData] : [];

  return (
    <div className="p-4">
      
      <h1 className="text-xl font-bold mb-4">FAQ Details</h1>

      <ComponentCard>
        <div style={{ overflowX: "auto" }}>
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start w-2/5"
                >
                  Questions
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-end w-1/6"
                >
                  Files
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-end w-1/6"
                >
                  Author
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-end w-1/6"
                >
                  Added Time
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-end w-1/12"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {filteredFaqData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="px-4 py-3 text-gray-600 text-start">
                    <div className="whitespace-pre-wrap">{item.question}</div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 text-end">
                    {faqData.answers.length}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 text-end">
                    {item.author || "Unknown"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 text-end">
                    {item.created_at || "-"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 text-end">
                    <div className="flex justify-end gap-2">
                      <div
                        className="cursor-pointer"
                        onClick={() => navigate(`/answerFAQ/${item.id}`)}
                      >
                        <Badge size="sm" color="primary">
                          <ForwardIcon size={14} />
                        </Badge>
                      </div>
                      <div
                        className="cursor-pointer"
                        onClick={() => navigate(`/editFAQ/${item.id}`)}
                      >
                        <Badge size="sm" color="success">
                          <EditIcon size={14} />
                        </Badge>
                      </div>
                      <div
                        className="cursor-pointer"
                        onClick={() => confirmDelete("question", item.id)}
                      >
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

      <div className="mb-4 mt-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            Answers ({filteredAnswers.length})
          </h2>
        </div>

        {filteredAnswers.length > 0 ? (
          <div className="space-y-4">
            {filteredAnswers.map((answer) => (
              <ComponentCard key={answer.id} title="">
                <div style={{ overflowX: "auto" }}>
                  <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableRow>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start w-3/5"
                        >
                          Answer
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-end w-1/6"
                        >
                          Author
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-end w-1/6"
                        >
                          Added Time
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-end w-1/12"
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="px-4 py-3 text-gray-600 text-start">
                          <div className="whitespace-pre-wrap">
                            {answer.answerText}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 text-end">
                          {answer.author || "Unknown"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 text-end">
                          {answer.created_at || "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 text-end">
                          <div className="flex justify-end gap-2">
                            <div
                              className="cursor-pointer"
                              onClick={() =>
                                navigate(`/editanswerFAQ/${answer.id}`)
                              }
                            >
                              <Badge size="sm" color="success">
                                <EditIcon size={14} />
                              </Badge>
                            </div>
                            <div
                              className="cursor-pointer"
                              onClick={() => confirmDelete("answer", answer.id)}
                            >
                              <Badge size="sm" color="warning">
                                <Trash2Icon size={14} />
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </ComponentCard>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            {searchQuery ? "No matching answers found." : "No answers yet."}
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
              {itemToDelete.type === "question"
                ? "Are you sure you want to delete this question and all its answers?"
                : "Are you sure you want to delete this answer?"}
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
                onClick={handleDelete}
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
