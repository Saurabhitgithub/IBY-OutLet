import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Select, { SingleValue } from "react-select";
import TextArea from "../../components/form/input/TextArea";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useNavigate, useParams } from "react-router";
import {
  addSchedule,
  getAllScheduleById,
  getAllUsers,
  updateSchedule,
} from "../../services/apis";
import { toast } from "react-toastify";

interface Option {
  value: string;
  label: string;
}

const IMPORTANCE_OPTIONS: Option[] = [
  { label: "Yes", value: "1" },
  { label: "No", value: "0" },
];

const TYPE_OPTIONS: Option[] = [
  { label: "One time schedule", value: "1" },
  { label: "Repeat schedule", value: "2" },
];

const FREQUENCY_OPTIONS: { label: string; value: string }[] = [
  { label: "Every Day", value: "1" },
  { label: "Every Week", value: "7" },
  { label: "Every Two Weeks", value: "14" },
  { label: "Every Half Month", value: "15" },
  { label: "Every Month", value: "30" },
  { label: "Every Quarter", value: "90" },
  { label: "Every Year", value: "365" },
];

export const AddUpdateSchedule: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const backInfo = { title: "Schedules", path: "/schedule" };

  const [loading, setLoading] = useState<boolean>(false);
  const [sendToOptions, setSendToOptions] = useState<Option[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    sendTo: "",
    startTime: "",
    endTime: "",
    important: "0",
    contents: "",
    type: "1",
    fre: "",
  });

  // Track validation errors
  const [errors, setErrors] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const usersPromise = fetchUsers();
        let schedulePromise;

        if (id) {
          schedulePromise = fetchScheduleById(id);
        }

        await Promise.all([usersPromise, schedulePromise]);
      } catch (error) {
        console.error("Failed to load initial data:", error);
        toast.error("Failed to load initial data", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [id]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      const users = response.data?.data || [];
      const formattedUsers = users.map((user: any) => ({
        value: user.id.toString(),
        label: user.name,
      }));
      setSendToOptions(formattedUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to fetch users", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    }
  };

  const fetchScheduleById = async (scheduleId: string) => {
    try {
      const res = await getAllScheduleById(scheduleId);
      const dataArray = res.data.data;
      if (!Array.isArray(dataArray) || dataArray.length === 0) return;

      const data = dataArray[0];
      setFormData({
        title: data.title || "",
        sendTo: data.send_to?.toString() || "",
        startTime: data.start_time
          ? new Date(data.start_time).toISOString().slice(0, 16)
          : "",
        endTime: data.end_time
          ? new Date(data.end_time).toISOString().slice(0, 16)
          : "",
        important: data.if_imp?.toString() || "0",
        contents: data.details || "",
        type: data.task_type?.toString() || "1",
        fre: data.fre ? data.fre.toString() : "",
        everyDay: data.fre || "",
      });
    } catch (error) {
      console.error("Failed to fetch schedule by ID:", error);
      toast.error("Failed to fetch schedule data", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    }
  };

  const handleChange = (
    field: keyof typeof formData,
    selected: SingleValue<Option>
  ) => {
    setFormData({
      ...formData,
      [field]: selected ? selected.value : "",
    });
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleTextChange = (field: keyof typeof formData, value: string) => {
    let updatedFormData = { ...formData, [field]: value };

    // Only allow one of the two fields to be filled at a time for 'fre'
    if (formData.type === "2") {
      if (field === "fre" && value.trim()) {
        updatedFormData.everyDay = "";
      } else if (field === "everyDay" && value.trim()) {
        updatedFormData.fre = value;
        updatedFormData.fre = value; // Set 'fre' to value of 'everyDay'
      }
    }

    setFormData(updatedFormData);
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title.trim())
      newErrors.title = "The title field is required.";
    if (!formData.sendTo) newErrors.sendTo = "The send to field is required.";
    if (!formData.type) newErrors.type = "The type field is required";
    if (!formData.startTime)
      newErrors.startTime = "The start time field is required.";
    if (!formData.endTime)
      newErrors.endTime = "The end time field is required when type is 1.";
    if (!formData.important)
      newErrors.important = "The important field is required.";
    if (!formData.contents.trim())
      newErrors.contents = "The contents field is required.";

    if (formData.type === "2") {
  if (!String(formData.fre).trim()) {
    newErrors.fre = "Either Frequency or Every Day is required.";
  }
}

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const payload: any = {
      title: formData.title,
      send_to: parseInt(formData.sendTo),
      start_time: new Date(formData.startTime).toISOString(),
      end_time: new Date(formData.endTime).toISOString(),
      if_imp: parseInt(formData.important),
      details: formData.contents,
      task_type: parseInt(formData.type),
      added_by: "admin",
      // added_on: new Date().toISOString(),
    };

  if (!id) {
    payload.created_at = new Date();
  }

    if (formData.type === "2" && formData.fre.trim()) {
      payload.fre = formData.fre;
    }
    try {
      if (id) {
        await updateSchedule(id, payload);
        toast.success("Schedule updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      } else {
        await addSchedule(payload);
        toast.success("Schedule created successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      }

      navigate("/schedule");
    } catch (error: any) {
      console.error("Failed to save schedule:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.statusText ||
          "An unknown error occurred.",
        {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        }
      );
    }
  };

  const selectedSendTo =
    sendToOptions.find((opt) => opt.value === formData.sendTo) || null;
  const selectedType =
    TYPE_OPTIONS.find((opt) => opt.value === formData.type) || null;
  const selectedImportant =
    IMPORTANCE_OPTIONS.find((opt) => opt.value === formData.important) || null;

  // if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div>
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <PageBreadcrumb
        pageTitle={id ? "Edit Schedule" : "New Schedule"}
        backInfo={backInfo}
      />
      <div className="bg-white p-4">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4 mt-3">
            <div className="col-span-2">
              <Label>
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.title}
                onChange={(e) => handleTextChange("title", e.target.value)}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <Label>
                Send To <span className="text-red-500">*</span>
              </Label>
              <Select
                options={sendToOptions}
                value={selectedSendTo}
                onChange={(selected) => handleChange("sendTo", selected)}
                isClearable
                className={errors.sendTo ? "border-red-500" : ""}
              />
              {errors.sendTo && (
                <p className="text-red-500 text-sm mt-1">{errors.sendTo}</p>
              )}
            </div>

            <div>
              <Label>
                Type <span className="text-red-500">*</span>
              </Label>
              <Select
                options={TYPE_OPTIONS}
                value={selectedType}
                onChange={(selected) => handleChange("type", selected)}
                className={errors.type ? "border-red-500" : ""}
              />
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">{errors.type}</p>
              )}
            </div>

            {formData.type === "2" && (
              <div className="grid grid-cols-2 gap-4 col-span-2">
                <div>
                  <Label>
                    Frequency <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="fre"
                    name="fre"
                    className={`form-control w-full h-11 rounded border px-3 py-2 ${
                      errors.fre ? "border-red-500" : ""
                    }`}
                    value={formData.fre}
                    onChange={(e) => handleTextChange("fre", e.target.value.toString())}
                  >
                    <option value="">Please select a frequency</option>
                    {FREQUENCY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.fre && (
                    <p className="text-red-500 text-sm mt-1">{errors.fre}</p>
                  )}
                </div>

                <div>
                  <Label>
                    OR Every Day <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={formData.fre}
                    onChange={(e) => handleTextChange("fre", e.target.value.toString())}
                    className={errors.fre ? "border-red-500" : ""}
                  />
                  {errors.fre && (
                    <p className="text-red-500 text-sm mt-1">{errors.fre}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>
                Start Time <span className="text-red-500">*</span>
              </Label>
              <Input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => handleTextChange("startTime", e.target.value)}
                className={errors.startTime ? "border-red-500" : ""}
              />
              {errors.startTime && (
                <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
              )}
            </div>
            <div>
              <Label>
                End Time <span className="text-red-500">*</span>
              </Label>
              <Input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => handleTextChange("endTime", e.target.value)}
                className={errors.endTime ? "border-red-500" : ""}
              />
              {errors.endTime && (
                <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
              )}
            </div>
          </div>

          <div className="w-1/2 my-3">
            <Label>
              If Important <span className="text-red-500">*</span>
            </Label>
            <Select
              options={IMPORTANCE_OPTIONS}
              value={selectedImportant}
              onChange={(selected) => handleChange("important", selected)}
              className={errors.important ? "border-red-500" : ""}
            />
            {errors.important && (
              <p className="text-red-500 text-sm mt-1">{errors.important}</p>
            )}
          </div>

          <div className="col-span-2">
            <Label>
              Contents <span className="text-red-500">*</span>
            </Label>
            <TextArea
              rows={4}
              value={formData.contents}
              onChange={(value) => handleTextChange("contents", value)}
              className={errors.contents ? "border-red-500" : ""}
            />
            {errors.contents && (
              <p className="text-red-500 text-sm mt-1">{errors.contents}</p>
            )}
          </div>

          <div className="flex justify-end gap-4 mt-3">
            <Button variant="outlined" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {id ? "Update" : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
