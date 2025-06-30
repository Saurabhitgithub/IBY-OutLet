import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useNavigate, useParams } from "react-router";
import {
  addTimeSheet,
  editTimeSheet,
  getAllUsers,
  getTimeSheetById,
} from "../../services/apis";
import { toast } from "react-toastify";

interface Option {
  value: string;
  label: string;
}

interface FormValues {
  user_id: string;
  can_view: string[]; // stored as array in form, sent as comma-separated string
}

export const AddUpdateTimesheet: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      user_id: "",
      can_view: [],
    },
  });

  const backInfo = { title: "Timesheet", path: "/timesheetControl" };
  const [authUserOptions, setAuthUserOptions] = useState<Option[]>([]);

  useEffect(() => {
    fetchUsers();
    if (id) fetchTimeSheetData(id);
  }, [id]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      if (res?.data?.data) {
        const options = res.data.data.map((user: any) => ({
          value: String(user.id),
          label: user.name,
        }));
        setAuthUserOptions(options);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to fetch users", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSheetData = async (timesheetId: string) => {
    setLoading(true);
    try {
      const res = await getTimeSheetById(timesheetId);
      const data = res.data?.data;
      if (!data) return;

      setValue("user_id", data.user_id);
      const canViewArray =
        typeof data.can_view === "string" ? data.can_view.split(",") : [];
      setValue("can_view", canViewArray);
    } catch (error) {
      console.error("Error fetching timesheet data:", error);
      toast.error("Failed to fetch timesheet data", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData: FormValues) => {
    const payload = {
      user_id: formData.user_id,
      can_view: formData.can_view.join(","),
    };

    setLoading(true);
    try {
      if (id) {
        await editTimeSheet(id, payload);
        toast.success("Timesheet updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      } else {
        await addTimeSheet(payload);
        toast.success("Timesheet created successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      }
      navigate("/timesheetControl");
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(
        error.response?.data?.message || 
        error.response?.statusText || 
        "Failed to save timesheet",
        {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 rounded">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <h1 className="text-2xl font-bold mb-4">
        <PageBreadcrumb
          pageTitle={id ? "Edit Timesheet Authentication" : "Add Timesheet Authentication"}
          backInfo={backInfo}
        />
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-3">Details</h3>
        <hr className="border-t border-gray-300 mb-2" />

        {/* Auth User Dropdown */}
        <div>
          <label className="font-medium mb-2 block">
            Auth User<span className="text-red-500">*</span>
          </label>
          <select
            {...register("user_id", { required: "This field is required" })}
            className={`w-full border p-2 rounded ${errors.user_id ? "border-red-500" : ""}`}
            disabled={isSubmitting || loading}
          >
            <option value="">Select User...</option>
            {authUserOptions.map((user) => (
              <option key={user.value} value={user.value}>
                {user.label}
              </option>
            ))}
          </select>
          {errors.user_id && (
            <p className="text-red-500 text-sm mt-1">{errors.user_id.message}</p>
          )}
        </div>

        {/* Can View Multi Select */}
        <div className="mt-3">
          <label className="font-medium block mb-2">
            Can view who<span className="text-red-500">*</span>
          </label>
          <Controller
            name="can_view"
            control={control}
            rules={{ required: "This field is required" }}
            render={({ field }) => (
              <Select
                isMulti
                options={authUserOptions}
                value={authUserOptions.filter((opt) =>
                  field.value?.includes(opt.value)
                )}
                onChange={(selected) =>
                  field.onChange((selected as Option[]).map((opt) => opt.value))
                }
                isDisabled={isSubmitting || loading}
                classNamePrefix="react-select"
                className={errors.can_view ? "border border-red-500 rounded" : ""}
              />
            )}
          />
          {errors.can_view && (
            <p className="text-red-500 text-sm mt-1">{errors.can_view.message}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
            onClick={() => window.history.back()}
            disabled={isSubmitting || loading}
          >
            Back
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={isSubmitting || loading}
          >
            {id ? "Update" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};