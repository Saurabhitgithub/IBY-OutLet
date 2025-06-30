import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@mui/material";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Select from "react-select";
import TextArea from "../../components/form/input/TextArea";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useNavigate, useParams } from "react-router";
import { AddMessage, getAllUsers, getMessageById } from "../../services/apis";
import { toast } from "react-toastify";

type ReplyForwardForm = {
  title: string;
  to: Option;
  cc: string[];
  bcc: string[];
  contents: string;
};
interface Option {
  value: string;
  label: string;
}
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

export const ReplyForward: React.FC = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState<boolean>(false)
  const [openToOptions, setOpenToOptions] = useState<Option[]>([]);
  const [messageData, setMessageData] = useState<Message | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [])
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      const users = response.data?.data || [];
      const formattedUsers = users.map((user: any) => ({
        value: user.id,
        label: user.name,
      }));
      setOpenToOptions(formattedUsers);
    } catch (error) {
      console.error("Failed to fetch account managers:", error);
    }
    setLoading(false);
  };
  useEffect(() => {
    const fetchMessageDataById = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchMessageDataById();
  }, [id]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReplyForwardForm>({
    defaultValues: {
      title: "",
      to: "",
      cc: [],
      bcc: [],
      contents: "",
    },
  });

  const onSubmit = async (data: ReplyForwardForm) => {
    setLoading(true);
    const userId = Number(localStorage.getItem("Sql_id"));
    try {
      const payload = {
        user_id: userId,
        title: data.title,
        contents: data.contents,
        to: (data.to as any).value.toString(),
        cc: data.cc.join(","),
        bcc: data.bcc.join(","),
      };
      await AddMessage(payload);
      reset();
      toast.success("Message sent successfully!", {
        position: "top-right",
        autoClose: 3000,
        style: {
          zIndex: 9999999999,
          marginTop: "4rem",
        },
      });

      navigate("/message");
    } catch (error) {
      console.error("Error sending message:", error);

      toast.error("Failed to send message. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        style: {
          zIndex: 9999999999,
          marginTop: "4rem",
        },
      });
    } finally {
      setLoading(false);
    }
  };
  const backInfo = { title: "Messages", path: "/messages" };

  return (
    <div>
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <PageBreadcrumb
        pageTitle={id ? "Forward Message" : "Reply Message"}
        backInfo={backInfo}
      />
      <div className="bg-white p-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4 mb-4 mt-3">
            <div className="col-span-2">
              <Label>
                Title<span className="text-red-500">*</span>
              </Label>
              <Controller
                name="title"
                control={control}
                rules={{ required: "The title field is required" }}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      className={`w-full border rounded ${errors.title ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.title.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="col-span-2">
              <Label>
                To<span className="text-red-500">*</span>
              </Label>
              <Controller
                name="to"
                control={control}
                rules={{ required: "The recipient field is required" }}
                render={({ field }) => (
                  <>
                    <Select
                      options={openToOptions}
                      placeholder="Select..."
                      {...field}
                    />
                    {errors.to && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.to.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="col-span-2">
              <Label>CC</Label>
              <Controller
                name="cc"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={openToOptions}
                    placeholder="Select..."
                    isMulti
                    onChange={(selected: Option[]) => field.onChange(selected.map((s) => s.value))}
                    value={openToOptions.filter((option) => field.value.includes(option.value))}
                  />
                )}
              />
            </div>

            <div className="col-span-2">
              <Label>BCC</Label>
              <Controller
                name="bcc"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={openToOptions}
                    placeholder="Select..."
                    isMulti
                    onChange={(selected: Option[]) => field.onChange(selected.map((s) => s.value))}
                    value={openToOptions.filter((option) => field.value.includes(option.value))}
                  />
                )}
              />
            </div>

            <div className="col-span-2">
              <Label>
                Contents<span className="text-red-500">*</span>
              </Label>
              <Controller
                name="contents"
                control={control}
                rules={{ required: "The contents field are required" }}
                render={({ field }) => (
                  <>
                    <TextArea {...field} rows={4}
                      className={`w-full border rounded ${errors.title ? "border-red-500" : "border-gray-300"
                        }`} />
                    {errors.contents && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.contents.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-3">
            <Button variant="outlined" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button variant="contained" type="submit" color="primary">
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
