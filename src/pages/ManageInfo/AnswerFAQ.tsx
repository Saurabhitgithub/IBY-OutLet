import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, CircularProgress } from "@mui/material";
import Label from "../../components/form/Label";
import TextArea from "../../components/form/input/TextArea";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  addFaqChildAns,
  getFaqById,
  updateAnswerFileData,
  getFaqFileDataById,
  awsUploadFile,
  // getByIdCategoryAndSubcategory,
} from "../../services/apis";
import { DragAndDropInput } from "../../components/form/form-elements/DragAndDrop";
import { toast } from "react-toastify";

type AnswerFAQForm = {
  question: string;
  fileUrl: File[] | string[] | null;
  answer: string;
  user_id: number;
};

export const AnswerFAQ: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  // const [category, setCategory] = useState("");

  const isEditMode = location.pathname.includes("edit");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { control, handleSubmit, setValue, watch } = useForm<AnswerFAQForm>({
    defaultValues: {
      question: "",
      fileUrl: null,
      answer: "",
      user_id: 54,
    },
  });

  const fetchAnswerData = async () => {
  if (!id) return;

  try {
    setLoading(true);

    if (isEditMode) {
      const [faqResponse, fileDataResponse] = await Promise.all([
        getFaqById(id),
        getFaqFileDataById(parseInt(id)),
      ]);

      // Set question from getFaqById
      const answer = faqResponse?.data?.data?.question || "";
      setValue("answer", answer);


      // Set answer and file from getFaqFileDataById
      const question = fileDataResponse?.data?.data?.name || "";
      const fileName = fileDataResponse?.data?.data?.file_name || "";
      setValue("question", question);

      setValue("fileUrl", fileName ? [fileName] : null);
    } else {
      // In add mode, only fetch question
      const faqResponse = await getFaqById(id);
      const question = faqResponse?.data?.data?.question || "";
      setValue("question", question);
    }
  } catch (error) {
    console.error("Error fetching answer data:", error);
    setError("Failed to load FAQ data");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchAnswerData();
  }, [id, isEditMode]);

  // const fetchCategory = async () => {
  //   if (!id) return;
  //   try {
  //     const response = await getByIdCategoryAndSubcategory(id);
  //     const { name } = response.data?.data || {};
  //     setCategory(name || "");
  //   } catch (error) {
  //     console.error("Error fetching category:", error);
  //   }
  // };

  // useEffect(() => {
  //   if (isEditMode) {
  //     fetchCategory();
  //   }
  // }, [id, isEditMode]);

  // const uploadFilesToAWS = async (files: File[]): Promise<string[]> => {
  //   try {
  //     const base64Promises = files.map((file) => {
  //       return new Promise<string>((resolve, reject) => {
  //         const reader = new FileReader();
  //         reader.onload = () => {
  //           const base64String = (reader.result as string).split(",")[1];
  //           resolve(base64String);
  //         };
  //         reader.onerror = reject;
  //         reader.readAsDataURL(file);
  //       });
  //     });

  //     const base64Files = await Promise.all(base64Promises);

  //     console.log("About to call awsUploadFile with:", base64Files);
  //     const uploadResponse = await awsUploadFile(base64Files);
  //     console.log("Upload response received:", uploadResponse);

  //     if (uploadResponse.data && Array.isArray(uploadResponse.data)) {
  //       return uploadResponse.data;
  //     }
  //     throw new Error("Unexpected response format from AWS upload");
  //   } catch (error) {
  //     console.error("AWS Upload Error:", error);
  //     throw error;
  //   }
  // };

  const onSubmit = async (data: AnswerFAQForm) => {
    if (!id) {
      setError("FAQ ID is missing");
      return;
    }

    if (!data.answer.trim()) {
      setError("Answer is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let fileUrls: string[] = [];

      if (data.fileUrl && data.fileUrl.length > 0) {
        const existingUrls = data.fileUrl.filter(
          (file) => typeof file === "string"
        ) as string[];
        const newFiles = data.fileUrl
          .filter((file) => file.fileUrl?.includes("blob:"))
          .map((ress) => ress.file) as File[];

        if (newFiles.length > 0) {
          let fileInfo = new FormData();
          for (let i = 0; i < newFiles.length; i++) {
            fileInfo.append("upload", newFiles[i]);
          }
          const uploadedUrls = await awsUploadFile(fileInfo).then(
            (res) => res.data.data
          );
          console.log(uploadedUrls);
          fileUrls = [...existingUrls, ...uploadedUrls];
        } else {
          fileUrls = existingUrls;
        }
      }

      const payload = {
        user_id: data.user_id,
        parent: id,
        question: data.answer,
        name: data.question,
        file_name: fileUrls.length > 0 ? fileUrls[0].fileName : "",
        fileUrl: fileUrls.length > 0 ? fileUrls[0].fileUrl : "",
      };

      console.log("Submitting payload:", payload, isEditMode);

      if (isEditMode) {
        await updateAnswerFileData(parseInt(id), payload);
        toast.success("Answer updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      } else {
        console.log("Calling addFaqChildAns API");
        await addFaqChildAns(payload);
        toast.success("Answer created successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
        console.log("addFaqChildAns API call successful");
      }

      navigate("/faq", { state: { success: true } });
    } catch (error) {
      console.error("Submission Error:", error);
      setError(error.message || "There was an error. Please try again.");
      toast.error("Failed to submit answer. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setLoading(false);
    }
  };

  const backInfo = { title: "FAQ", path: "/faq" };

  return (
    <div>
      <PageBreadcrumb
        pageTitle={isEditMode ? "Edit Answer FAQ" : "Answer FAQ"}
        backInfo={backInfo}
      />
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <div className="bg-white p-4">
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 mb-4 mt-3">
            <div>
              <h2 className="text-lg font-semibold mb-2">Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Question</h3>
                  <p className="text-gray-600 mt-1">{watch("question")}</p>
                </div>

                <div>
                  <Label>
                    Upload File{" "}
                    <span className="text-gray-400">
                      (Note: only PDF, DOC, XLS, RAR, ZIP, JPG files are
                      permitted.)
                    </span>
                  </Label>

                  <div className="my-3">
                    <Controller
                      name="fileUrl"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <DragAndDropInput
                          value={value || []}
                          onChange={(files: any[]) => {
                            onChange(files.length > 0 ? files : null);
                          }}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.rar,.zip,.jpg,.jpeg"
                          multiple={false} // Set to true if you want multiple files
                        />
                      )}
                    />
                  </div>
                </div>

                <div>
                  <Label>
                    Answer <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="answer"
                    control={control}
                    rules={{ required: "Answer is required" }}
                    render={({ field, fieldState: { error } }) => (
                      <div>
                        <TextArea
                          {...field}
                          rows={4}
                          placeholder="Enter your answer here..."
                          error={!!error}
                        />
                        {error && (
                          <p className="text-red-500 text-sm mt-1">
                            {error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-3">
            <Button variant="outlined" onClick={() => navigate("/faq")}>
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={loading}
              color="primary"
            >
              {loading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
