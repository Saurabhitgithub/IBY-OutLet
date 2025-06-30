import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { useParams } from "react-router";
import { Button } from "@mui/material";
import { createDriveInfo } from "../../../services/apis";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { toast } from "react-toastify";

interface Option {
  value: string;
  label: string;
}

export const AddDriveInfo: React.FC = () => {
  const [formData, setFormData] = useState({
    drivefrom: "",
    driveto: "",
    drivethrough1: "",
    drivethrough2: "",
    distance: "",
    startmiles: "",
    date: "",
    car: "",
    purpose: "",
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const user_id = Number(localStorage.getItem("user_id"));
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (
    name: keyof typeof formData,
    value: string | boolean | Option | null
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.drivefrom.trim())
      errors.drivefrom = "The drivefrom field is required.";
    if (!formData.driveto.trim())
      errors.driveto = "The drivefrom field is required.";
    if (!formData.distance.trim()) {
      errors.distance = "The distance field is required.";
    } else if (isNaN(Number(formData.distance))) {
      errors.distance = "The distance field must be a number";
    }
    if (!formData.startmiles.trim()) {
      errors.startmiles = "The start distance field is required";
    } else if (isNaN(Number(formData.startmiles))) {
      errors.startmiles = "The start distance field must be a number";
    }
    if (!formData.date.trim()) {
      errors.date = "The date field is required";
    }
    if (!formData.car.trim()) errors.car = "The car field is required.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDateChange = (dates: Date[]) => {
    if (dates && dates.length > 0) {
      const selectedDate = dates[0];

      const isoString = selectedDate.toISOString();
      handleChange("date", isoString);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        user_id: user_id,
        drivefrom: formData.drivefrom,
        driveto: formData.driveto,
        drivethrough1: formData.drivethrough1,
        drivethrough2: formData.drivethrough2,
        date: formData.date,
        distance: parseFloat(formData.distance),
        start_distance: parseFloat(formData.startmiles),
        car: formData.car,
        purpose: formData.purpose,
      };

      const response = await createDriveInfo(payload);
      console.log("Drive Info added:", response.data);

      toast.success("Drive info added successfully!", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });

      navigate("/drive");
    } catch (error) {
      console.error("Error adding drive info:", error);

      toast.error("Failed to add drive info. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };


  const inputClass = (field: string) =>
    `w-full border p-2 rounded ${formErrors[field] ? "border-red-500" : ""}`;

  const renderError = (field: string) =>
    formErrors[field] ? (
      <p className="text-red-500 text-sm mt-1">{formErrors[field]}</p>
    ) : null;

  let { id } = useParams();
  const backInfo = { title: "Drive", path: "/drive" };

  return (
    <div className="container mx-auto p-6 rounded">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <PageBreadcrumb pageTitle="Add Drive" backInfo={backInfo} />

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
              className={inputClass("drivefrom")}
              value={formData.drivefrom}
              onChange={(e) => handleChange("drivefrom", e.target.value)}
            />
            {renderError("drivefrom")}
          </div>

          <div>
            <label className="font-medium mb-2 block text-gray-500">
              Drive To <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={inputClass("driveto")}
              value={formData.driveto}
              onChange={(e) => handleChange("driveto", e.target.value)}
            />
            {renderError("driveto")}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 block text-gray-500">
              Drive Through 1
            </label>
            <input
              type="text"
              className={inputClass("drivethrough1")}
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
              className={inputClass("drivethrough2")}
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
              type="text"
              className={inputClass("distance")}
              value={formData.distance}
              onChange={(e) => handleChange("distance", e.target.value)}
            />
            {renderError("distance")}
          </div>

          <div>
            <label className="font-medium mb-2 block text-gray-500">
              Start Miles/Kms <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={inputClass("startmiles")}
              value={formData.startmiles}
              onChange={(e) => handleChange("startmiles", e.target.value)}
            />
            {renderError("startmiles")}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 block text-gray-500">
              Date & Time <span className="text-red-500">*</span>
            </label>
            <Flatpickr
              options={{
                enableTime: true,
                dateFormat: "Y-m-d H:i",
                time_24hr: true,
                defaultDate: formData.date || new Date(),

              }}
              value={formData.date}
              onChange={handleDateChange}
              className={`w-full border p-2 rounded ${formErrors.date ? "border-red-500" : ""
                }`}
              placeholder="Select date and time"

            />
            {renderError("date")}
          </div>

          <div>
            <label className="font-medium mb-2 block text-gray-500">
              Car <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={inputClass("car")}
              value={formData.car}
              onChange={(e) => handleChange("car", e.target.value)}
            />
            {renderError("car")}
          </div>
        </div>

        <div>
          <label className="font-medium mb-2 block text-gray-500">
            Purpose
          </label>
          <textarea
            className="w-full border p-2 rounded h-28"
            value={formData.purpose}
            onChange={(e) => handleChange("purpose", e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 mb-1 mt-2">
          <Button
            variant="outlined"
            onClick={() => navigate("/drive")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button variant="contained" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Add Drive"}
          </Button>
        </div>
      </form>
    </div>
  );
};