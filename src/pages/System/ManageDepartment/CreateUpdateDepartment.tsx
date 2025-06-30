import { useNavigate, useParams } from "react-router";
import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import { addOrEditDepartment, getDepartmentById } from "../../../services/apis";
import { toast } from "react-toastify";

interface FormData {
  name: string;
  id?: number;
}

const CreateUpdateDepartment = () => {
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      id: undefined,
    },
  });


  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  const fetchDepartment = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await getDepartmentById(id);
      const { name } = response.data.data;

      setValue("name", name);
      setValue("id", parseInt(id));
    } catch (error) {
      console.error("Error fetching department:", error);
      toast.error("Failed to fetch department details.", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      await addOrEditDepartment(data);

      toast.success(`Department ${id ? "updated" : "created"} successfully!`, {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });

      navigate("/manageDepartment");
    } catch (error) {
      console.error("Error submitting form:", error);

      toast.error("Failed to save department. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (id) {
      fetchDepartment();
    }
  }, [id]);

  const backInfo = { title: "Manage Departments", path: "/manageDepartment" };

  return (
    <div>
      <PageBreadcrumb
        pageTitle={id ? "Update Department" : "Add Department"}
        backInfo={backInfo}
      />

      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}

      <ComponentCard title="Details">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4 text-gray-800 dark:text-white/90">
            <div>
              <label className="font-medium mb-2 block">
                Name<span className="text-red-500">*</span>
              </label>
              <Controller
                name="name"
                control={control}
                rules={{ required: "Name is required" }}
                render={({ field }) => (
                  <input
                    type="text"
                    className={`w-full border p-2 rounded ${errors.name ? "border-red-500" : ""
                      }`}
                    {...field}
                  />
                )}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              {id ? "Update" : "Submit"}
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default CreateUpdateDepartment;
