import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { Button } from "@mui/material";
import { updateDriveInfo, getDriveInfoById } from "../../../services/apis";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { toast } from "react-toastify";

// import toast from "react-hot-toast";
// import dayjs from "dayjs";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

interface DriveInfoData {
  drivefrom: string;
  driveto: string;
  drivethrough1: string;
  drivethrough2: string;
  distance: string;
  start_distance: string;
  date: string;
  car: string;
  purpose: string;
}

export const EditDriveInfo: React.FC = () => {
  const [formData, setFormData] = useState<DriveInfoData>({
    drivefrom: "",
    driveto: "",
    drivethrough1: "",
    drivethrough2: "",
    distance: "",
    start_distance: "",
    date: "",
    car: "",
    purpose: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchDriveInfo = async () => {
      try {
        if (!id) {
          console.error("No ID provided");
          return;
        }

        console.log("Making API call with ID:", id);
        const response = await getDriveInfoById(id);
        console.log("API Response:", response);

        if (!response.data?.data) {
          console.error("No data in response");
          return;
        }

        const data = response.data.data;
        console.log("Response Data:", data);

        setFormData({
          drivefrom: data.drivefrom || "",
          driveto: data.driveto || "",
          drivethrough1: data.drivethrough1 || "",
          drivethrough2: data.drivethrough2 || "",
          distance: data.distance?.$numberDecimal?.toString() || "0",
          start_distance:
            data.start_distance?.$numberDecimal?.toString() || "0",
          date: data.date || new Date().toISOString(),
          car: data.car || "",
          purpose: data.purpose || "",
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching drive info:", error);
        // toast.error("Failed to load drive info");
        setLoading(false);
      }
    };

    fetchDriveInfo();
  }, [id]);

  const handleChange = (name: keyof DriveInfoData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateTimeChange = (dates: Date[]) => {
    if (dates && dates.length > 0) {
      const selectedDate = dates[0];
      setFormData((prev) => ({
        ...prev,
        date: selectedDate.toISOString(),
      }));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      const response = await updateDriveInfo(id, formData);
      if (response.status === 200) {
        toast.success("Drive info updated successfully", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
        navigate("/drive");
      } else {
        toast.error(`Update failed: ${response.data.message}`, {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      }
    } catch (error: any) {
      console.error("Update error details:", {
        config: error.config,
        response: error.response?.data,
      });
      // toast.error(
      //   `Update failed: ${error.response?.data?.message || error.message}`
      // );
    }
  };



  const backInfo = { title: "Drive", path: "/drive" };

  return (
    <div className="container mx-auto p-6 rounded">
      <div>
        <PageBreadcrumb
          pageTitle={id ? "Edit Drive" : "Edit Drive"}
          backInfo={backInfo}
        />
      </div>
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg shadow"
      >
        <h3 className="text-xl font-semibold mb-3 text-gray-500">Details</h3>
        <hr className="border-t border-gray-300 mb-2" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 block text-gray-500">
              Drive From <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={formData.drivefrom}
              onChange={(e) => handleChange("drivefrom", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="font-medium mb-2 block text-gray-500">
              Drive To <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={formData.driveto}
              onChange={(e) => handleChange("driveto", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 block text-gray-500">
              Drive Through 1
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={formData.drivethrough1}
              onChange={(e) => handleChange("drivethrough1", e.target.value)}
            />
          </div>

          <div>
            <label className="font-medium mb-2 block text-gray-500">
              Drive Through 2
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={formData.drivethrough2}
              onChange={(e) => handleChange("drivethrough2", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 block text-gray-500">
              Distance (Miles/Kms) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={formData.distance}
              onChange={(e) => handleChange("distance", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="font-medium mb-2 block text-gray-500">
              Start Miles/Kms <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={formData.start_distance}
              onChange={(e) => handleChange("start_distance", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 block text-gray-500">
              Date <span className="text-red-500">*</span>
            </label>
            {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={formData.date ? dayjs(formData.date) : null}
                onChange={handleDateChange}
                className="w-full"
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider> */}
            <Flatpickr
              options={{
                enableTime: true,
                dateFormat: "Y-m-d H:i",
                time_24hr: true,
                defaultDate: formData.date ? new Date(formData.date) : new Date()
              }}
              value={formData.date ? new Date(formData.date) : new Date()}
              onChange={handleDateTimeChange}
              disabled={loading}
              className="border p-2 rounded w-full"
              placeholder="Select date and time"
            />
          </div>

          <div>
            <label className="font-medium mb-2 block text-gray-500">
              Car <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={formData.car}
              onChange={(e) => handleChange("car", e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="font-medium mb-2 block text-gray-500">
            Purpose <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border p-2 rounded h-28"
            value={formData.purpose}
            onChange={(e) => handleChange("purpose", e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end gap-2 mb-1 mt-2">
          <Button
            variant="outlined"
            className="bg-gray-100 hover:bg-gray-200"
            onClick={() => navigate("/drive")}
          >
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Update
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditDriveInfo;
