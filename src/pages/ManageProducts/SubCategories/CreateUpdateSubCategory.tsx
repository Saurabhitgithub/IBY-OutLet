import { useNavigate, useParams } from "react-router";
import Select, { SingleValue } from "react-select";
import { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import {
  getAllCategory,
  addCategoryAndSubcategory,
  editCategoryAndSubCategory,
  getByIdCategoryAndSubcategory,
} from "../../../services/apis";
import { Button } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";

interface FormData {
  name: string;
  belong_to: string | null;
  parent_id: string | null;
  id: "";
}

const CreateUpdateSubCategory = () => {
  //   const location = useLocation();
  //   const state = location.state as { item?: any };
  const navigate = useNavigate();
  const { ids } = useParams();

  const {
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      belong_to: null,
      parent_id: null,
      id: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [getAllDataCategory, setGetAllDataCategory] = useState<any[]>([]);

  const getAllCategoryDataFunction = async () => {
    setLoading(true);
    try {
      const response = await getAllCategory();
      const formattedData = response.data.data.map((item: any) => ({
        value: item.id,
        label: item.name,
      }));
      setGetAllDataCategory(formattedData);
    } catch (error) {
      console.error("Error fetching category data", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubCategoryById = async () => {
    try {
      const res = await getByIdCategoryAndSubcategory(ids);
      console.log(res);
      //   const response = res.data.data.data;
      const { name, parent_id, id } = res.data.data;
      setValue("name", name);
      //   setValue("belong_to", belong_to);
      setValue("parent_id", parent_id || null);
      setValue("id", id || null);
    } catch (error) {
      console.error("Error fetching subcategory by ID:", error);
    }
  };

  useEffect(() => {
  getAllCategoryDataFunction();
  if (ids) {
    fetchSubCategoryById();
  }
}, [ids]);


  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const payload = {
        name: data.name,
        belong_to: null,
        parent_id: data.parent_id,
      };

      if (ids) {
        await editCategoryAndSubCategory(getValues().id, payload);
        toast.success("Subcategory updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: {
            zIndex: 99999999,
            marginTop: "4rem",
          },
        });
      } else {
        await addCategoryAndSubcategory(payload);
        toast.success("Subcategory added successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: {
            zIndex: 99999999,
            marginTop: "4rem",
          },
        });
      }

      navigate("/subcategories");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit subcategory!", {
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

  const backInfo = { title: "Sub Category", path: "/subcategories" };

  return (
    <div>
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <PageBreadcrumb
        pageTitle={ids ? "Update Sub Category" : "Add Sub Category"}
        backInfo={backInfo}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 bg-white p-6 rounded-lg shadow"
      >
        <div>
          <h2 className="font-semibold">Details:</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 block">
              Name<span className="text-red-500">*</span>
            </label>
            <Controller
              name="name"
              control={control}
              rules={{ required: "The name field is required" }}
              render={({ field }) => (
                <input
                  type="text"
                  className={`w-full border p-2 rounded ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  {...field}
                />
              )}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="font-medium mb-2 block">
              Parent Category<span className="text-red-500">*</span>
            </label>
            <Controller
              name="parent_id"
              control={control}
              rules={{ required: "The parent category field is required." }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <>
                  <Select
                    options={getAllDataCategory}
                    value={
                      getAllDataCategory.find((item) => item.value === value) ||
                      null
                    }
                    onChange={(selectedOption: SingleValue<any>) =>
                      onChange(selectedOption?.value || null)
                    }
                    placeholder="Select Parent Category"
                    isClearable
                    classNamePrefix="react-select"
                    className={`react-select-container ${
                      error
                        ? "border border-red-500 rounded"
                        : "border border-gray-300 rounded"
                    }`}
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error.message}</p>
                  )}
                </>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outlined" onClick={() => navigate("/subcategories")}>
            Cancel
          </Button>
          <button
            type="submit"
            className="bg-brand text-white px-4 py-2 rounded"
          >
            {ids ? "Update" : "Add Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUpdateSubCategory;
