import { useParams, useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useState, useEffect } from "react";
import {
  addCategoryAndSubcategory,
  editCategoryAndSubCategory,
  getByIdCategoryAndSubcategory,
} from "../../services/apis";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";

interface Option {
  value: string;
  label: string;
}

interface FormData {
  name: string;
  belong_to: string;
  parent_id: string | null;
  id: "";
}

const CreateUpdateCategory: React.FC = () => {
  // const location = useLocation();
  // const state = location.state as { item?: any };
  const { ids } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const belongToOptions: Option[] = [
    { value: "oemic.com", label: "oemic.com" },
    { value: "oemicparts.com", label: "oemicparts.com" },
    { value: "ipayless2.com", label: "ipayless2.com" },
    { value: "valvedepot.com", label: "valvedepot.com" },
    { value: "ngquip.com", label: "ngquip.com" },
    { value: "wellheaddepot.com", label: "wellheaddepot.com" },
    { value: "pecosoilfield.com", label: "pecosoilfield.com" },
    { value: "valve123.com", label: "valve123.com" },
  ];

  const {
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      id: "",
    },
  });

  const fetchCategory = async () => {
    if (!ids) return;
    setLoading(true);
    try {
      const response = await getByIdCategoryAndSubcategory(ids);
      console.log(response.data);
      const { name, belong_to, parent_id, id } = response.data.data;
      setValue("name", name);
      setValue("belong_to", belong_to);
      setValue("parent_id", parent_id || null);
      setValue("id", id || null);
    } catch (error) {
      console.error("Error fetching category:", error);
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
  if (ids) {
    fetchCategory();
  }
}, [ids, setValue]);



  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      if (ids) {
        await editCategoryAndSubCategory(getValues().id, data);
        toast.success("Category updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: {
            zIndex: 99999999,
            marginTop: "4rem",
          },
        });
      } else {
        await addCategoryAndSubcategory(data);
        toast.success("Category added successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: {
            zIndex: 99999999,
            marginTop: "4rem",
          },
        });
      }
      navigate("/Categories");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Something went wrong!", {
        position: "top-right",
        autoClose: 3000,
        style: {
          zIndex: 99999999,
          marginTop: "4rem",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const backInfo = { title: "Category", path: "/Categories" };

  return (
    <div>
      <PageBreadcrumb
        pageTitle={ids ? "Update Category" : "Add Category"}
        backInfo={backInfo}
      />

      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 bg-white p-6 rounded-lg shadow"
      >
        <div className="grid grid-cols-4 gap-4 text-gray-500">
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
                  className={`w-full border p-2 rounded ${
                    errors.name ? "border-red-500" : ""
                  }`}
                  {...field}
                />
              )}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-gray-500">
          <div>
            <label className="font-medium mb-2 block">
              Belong to<span className="text-red-500">*</span>
            </label>
            <Controller
              name="belong_to"
              control={control}
              rules={{ required: "Please select a value" }}
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  {belongToOptions.map((option) => (
                    <label
                      key={option.value}
                      className="inline-flex items-center"
                    >
                      <input
                        type="radio"
                        value={option.value}
                        checked={field.value === option.value}
                        onChange={() => field.onChange(option.value)}
                        className="mr-2"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              )}
            />
            {errors.belong_to && (
              <p className="text-red-500 text-sm mt-1">
                {errors.belong_to.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            type="submit"
            className="bg-brand text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            {ids ? "Update" : "Submit"}
          </button>
          <span className="text-sm text-gray-500">
            Copyright © 2025 IITO Outlet. All rights reserved.
          </span>
        </div>
      </form>
    </div>
  );
};

export default CreateUpdateCategory;
