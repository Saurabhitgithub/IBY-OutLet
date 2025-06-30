import Select, { MultiValue, SingleValue } from "react-select";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { useParams } from "react-router";
import { Button } from "@mui/material";
import {
  editProblem,
  getAllCategory,
  getAllSubCategoryByCategoryId,
  getAllUsers,
  getProblemById,
} from "../../../services/apis";
import { toast } from "react-toastify";
import Flatpickr from "react-flatpickr";
interface Option {
  value: string; // Always use string for value to be consistent
  label: string;
  raw?: any;
}
const getProblemTypeLabel = (typeValue: number): string => {
  switch (typeValue) {
    case 1: return "Found By Customer";
    case 2: return "Found Before Producing";
    case 3: return "Found By Self-checking";
    default: return "";
  }
};

const getProblemTypeValue = (typeLabel: string): number => {
  switch (typeLabel) {
    case "Found By Customer": return 1;
    case "Found Before Producing": return 2;
    case "Found By Self-checking": return 3;
    default: return 0;
  }
};
export const EditProblems: React.FC = () => {
  const [formData, setFormData] = useState({
    occure_date: "",
    finder: null as Option | null,
    category: null as Option | null,
    subcategory: null as Option | null,
    problemtype: "",
    details: "",
    result: "",
    opento: [] as string[],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();
  const [subCategoryOptions, setSubCategoryOptions] = useState<Option[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
  const [openToOptions, setOpenToOptions] = useState<Option[]>([]);
  const [errors, setErrors] = useState({
    subCategory: "",

  });
  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsFormLoading(true);
        const [categoriesRes, usersRes] = await Promise.all([
          getAllCategory(),
          getAllUsers(),
        ]);

        // Set category options - ensure value is string
        const categoryOptions =
          categoriesRes?.data?.data.map((cat: any) => ({
            value: cat.id.toString(),
            label: cat.name,
            raw: cat,
          })) || [];
        setCategoryOptions(categoryOptions);

        // Set openTo options - ensure value is string
        const opentoOptions =
          usersRes?.data?.data.map((user: any) => ({
            value: user.id.toString(), 
            label: user.name,
            raw: user,
          })) || [];
        setOpenToOptions(opentoOptions);

        if (id) {
          await fetchProblem(id, categoryOptions, opentoOptions);
        }
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      } finally {
        setIsFormLoading(false);
      }
    };

    fetchInitialData();
  }, [id]);

  // Fetch problem data
  const fetchProblem = async (
    id: string,
    categories: Option[],
    users: Option[]
  ) => {
    try {
      setIsLoading(true);
      const response = await getProblemById(id);
      const problemData = response.data;

      const selectedCategory = categories.find(
        (cat) => cat.value === problemData.category_id?.toString()
      );

      let selectedSubCategory = null;
      if (selectedCategory) {
        const subCatRes = await getAllSubCategoryByCategoryId(
          selectedCategory.value
        );
        const subCatOptions =
          subCatRes?.data?.data.map((sub: any) => ({
            value: sub.id.toString(), 
            label: sub.name,
          })) || [];
        setSubCategoryOptions(subCatOptions);

        selectedSubCategory = subCatOptions.find(
          (sub) => sub.value === problemData.sub_category_id?.toString()
        );
      }

      const selectedFinder = users.find(
        (user) => user.value === problemData.finder?.toString()
      );

      setFormData({
        occure_date: problemData.occure_date || "",
        finder: selectedFinder || null,
        category: selectedCategory || null,
        subcategory: selectedSubCategory || null,
        problemtype: getProblemTypeLabel(problemData.type) || "",
        details: problemData.details || "",
        result: problemData.result || "",
        opento: problemData.opento ? problemData.opento.split(",") : [], 
      });
    } catch (error) {
      console.error("Error fetching problem:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = async (selected: SingleValue<Option>) => {
    setFormData((prev) => ({ ...prev, category: selected, subcategory: null }));

    if (!selected) {
      setSubCategoryOptions([]);
      return;
    }

    try {
      const res = await getAllSubCategoryByCategoryId(selected.value);
      const options =
        res?.data?.data.map((sub: any) => ({
          value: sub.id.toString(),
          label: sub.name,
        })) || [];
      setSubCategoryOptions(options);
    } catch (error) {
      console.error("Failed to fetch subcategories", error);
      setSubCategoryOptions([]);
    }
  };

  const handleChange = (
    name: keyof typeof formData,
    value: string | boolean | Option | Option[] | null
  ) => {
    if (name === "finder" || name === "category" || name === "subcategory") {
      setFormData((prev) => ({ ...prev, [name]: value as Option | null }));
    }
    else if (name === "opento" && Array.isArray(value)) {
      const selectedValues = (value as Option[]).map((opt) => opt.value);
      setFormData((prev) => ({ ...prev, [name]: selectedValues }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value as string }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      console.error("No problem ID provided");
      return;
    }
    let isValid = true;
    const newErrors = { ...errors };

    if (!formData.subcategory && formData.category && subCategoryOptions.length > 0) {
      newErrors.subCategory = "Please select a subcategory";
      isValid = false;
    } else {
      newErrors.subCategory = "";
    }

    setErrors(newErrors);

    if (!isValid) {
      return;
    }
    try {
      setIsLoading(true);
      const typeValue = getProblemTypeValue(formData.problemtype);
      const requestBody = {
        occure_date: formData.occure_date,
        finder: formData.finder ? parseInt(formData.finder.value) : null,
        category_id: formData.category
          ? parseInt(formData.category.value)
          : null,
        sub_category_id: formData.subcategory
          ? parseInt(formData.subcategory.value)
          : null,
        type: typeValue,
        details: formData.details,
        result: formData.result,
        opento: formData.opento.join(","),
      };

      await editProblem(id, requestBody);

      toast.success("Problem updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        style: {
          zIndex: 99999999,
          marginTop: "4rem",
        },
      });

      console.log("Problem updated successfully");
      navigate("/problems");
    } catch (error: any) {
      console.error("Error updating problem:", error);

      toast.error(
        `Failed: ${error?.response?.data?.message || error.message}`,
        {
          position: "top-right",
          autoClose: 3000,
          style: {
            zIndex: 99999999,
            marginTop: "4rem",
          },
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const backInfo = { title: "Problems", path: "/problems" };

  // if (isFormLoading) {
  //   return <div className="container mx-auto p-6 rounded">Loading...</div>;
  // }

  return (
    <div className="container mx-auto p-6 rounded">
       {isFormLoading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <div>
        <PageBreadcrumb
          pageTitle={id ? "Edit Problem" : "Edit Problem"}
          backInfo={backInfo}
        />
      </div>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg "
      >
        <h3 className="text-xl font-semibold mb-3 text-gray-500">Details</h3>
        <hr className=" border-t border-gray-300 mb-3"></hr>
        <div className="grid grid-cols-2  gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Occur Date <span className="text-red-500">*</span>
            </label>

            <Flatpickr
              value={formData.occure_date}
              onChange={(dates) => {
                if (dates.length > 0) {
                  const date = new Date(dates[0]);
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');

                  const formattedDate = `${year}-${month}-${day}`;
                  handleChange("occure_date", formattedDate);
                } else {
                  handleChange("occure_date", "");
                }
              }}
              options={{ dateFormat: "Y-m-d" }}
              placeholder="Select Occur Date"
              className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="font-medium mb-2 text-gray-500">
              Finder <span className="text-red-500">*</span>
            </label>
            <Select
              options={openToOptions}
              value={formData.finder}
              onChange={(selected: SingleValue<Option>) =>
                handleChange("finder", selected)
              }
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Category<span className="text-red-500">*</span>
            </label>
            <Select
              options={categoryOptions}
              value={formData.category}
              onChange={handleCategoryChange}
              required
            />
          </div>

          <div>
            <label className="font-medium mb-2 text-gray-500">
              Sub Category <span className="text-red-500">*</span>
            </label>
            <Select
              options={subCategoryOptions}
              value={formData.subcategory}
              onChange={(selected: SingleValue<Option>) => {
                handleChange("subcategory", selected);
                setErrors(prev => ({ ...prev, subCategory: "" }));
              }}
              placeholder={
                formData.category
                  ? subCategoryOptions.length > 0
                    ? "Select subcategory..."
                    : "No subcategories available"
                  : "Select a category first"
              }
              required
              isDisabled={!formData.category || subCategoryOptions.length === 0}
              onBlur={() => {
                if (!formData.subcategory && formData.category && subCategoryOptions.length > 0) {
                  setErrors(prev => ({
                    ...prev,
                    subCategory: "Please select a subcategory"
                  }));
                }
              }}
            />
            {errors.subCategory && (
              <span className="text-red-500 text-xs">{errors.subCategory}</span>
            )}
          </div>
        </div>

        <div className="flex gap-4 ">
          <label className="font-medium mb-2 block text-gray-500">
            Problem Type
          </label>
          <div>
            <label className="text-gray-500">
              <input
                type="radio"
                name="problemType"
                value="Found By Customer"
                checked={formData.problemtype === "Found By Customer"}
                onChange={(e) => handleChange("problemtype", e.target.value)}
                className="mr-2"
              />
              Found By Customer
            </label>
          </div>

          <div>
            <label className="text-gray-500">
              <input
                type="radio"
                name="problemType"
                value="Found Before Producing"
                checked={formData.problemtype === "Found Before Producing"}
                onChange={(e) => handleChange("problemtype", e.target.value)}
                className="mr-2"
              />
              Found Before Producing
            </label>
          </div>
          <div>
            <label className="text-gray-500">
              <input
                type="radio"
                name="problemType"
                value="Found By Self-checking"
                checked={formData.problemtype === "Found By Self-checking"}
                onChange={(e) => handleChange("problemtype", e.target.value)}
                className="mr-2"
              />
              Found By Self-checking
            </label>
          </div>
        </div>

        <div>
          <label className="font-medium mb-2 block text-gray-500">
            Details<span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border p-2 rounded h-22"
            value={formData.details}
            onChange={(e) => handleChange("details", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="font-medium mb-2 block text-gray-500">
            Result<span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border p-2 rounded h-22"
            value={formData.result}
            onChange={(e) => handleChange("result", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="font-medium mb-2 block text-gray-500">
            Open To
          </label>
          <Select
            isMulti
            options={openToOptions}
            value={openToOptions.filter((opt) =>
              formData.opento.includes(opt.value)
            )}
            onChange={(selected: MultiValue<Option>) =>
              handleChange("opento", selected as Option[])
            }
            placeholder="Select users..."
            className="dark:bg-dark-900"
          />
        </div>

        <div className="flex justify-end gap-2 items-center">
          <Button
            variant="outlined"
            className="bg-pink-300"
            onClick={() => navigate("/problems")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button variant="contained" type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </div>
  );
};
