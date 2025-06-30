import Select, { SingleValue } from "react-select";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { useParams } from "react-router";
import { Button } from "@mui/material";
import {
  getAllCategory,
  getAllSubCategoryByCategoryId,
  getAllUsers,
  getProblemById,
  updatesolution,
} from "../../../services/apis";
import { toast } from "react-toastify";

interface Option {
  value: string;
  label: string;
}

interface ProblemData {
  occurdate: string;
  finder: Option | null;
  category: Option | null;
  subcategory: Option | null;
  problemtype: string;
  details: string;
  result: string;
  opento: string;
  solution: string;
}

export const AddSolution: React.FC = () => {
  const [openToOptions, setOpenToOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState<Option[]>([]);
  const [formErrors, setFormErrors] = useState({ solution: false });

  const [formData, setFormData] = useState<ProblemData>({
    occurdate: "",
    finder: null,
    category: null,
    subcategory: null,
    problemtype: "",
    details: "",
    result: "",
    opento: "",
    solution: "",
  });

  const navigate = useNavigate();
  const { id } = useParams();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getAllCategory();
      if (res?.data?.data) {
        const options = res.data.data.map((cat: any) => ({
          value: cat.id.toString(),
          label: cat.name,
        }));
        setCategoryOptions(options);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOpenTo = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      if (res?.data?.data) {
        const options = res.data.data.map((user: any) => ({
          value: user.id.toString(),
          label: user.name,
        }));
        setOpenToOptions(options);
      }
    } catch (error) {
      console.error("Failed to fetch open to options", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenTo();
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!formData.category) {
        setSubCategoryOptions([]);
        setFormData((prev) => ({ ...prev, subcategory: null }));
        return;
      }

      setLoading(true);
      try {
        const res = await getAllSubCategoryByCategoryId(
          formData.category.value
        );
        if (res?.data?.data) {
          const options = res.data.data.map((sub: any) => ({
            value: sub.id.toString(),
            label: sub.name,
          }));
          setSubCategoryOptions(options);
        } else {
          setSubCategoryOptions([]);
        }
      } catch (error) {
        console.error("Failed to fetch subcategories", error);
        setSubCategoryOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubCategories();
  }, [formData.category]);

  useEffect(() => {
    const loadProblemData = async () => {
      if (!id || !openToOptions.length || !categoryOptions.length) return;

      setLoading(true);
      try {
        const response = await getProblemById(id);
        const data = response.data;

        const selectedCategory = categoryOptions.find(
          (c) => c.value === data.category_id.toString()
        );

        let selectedSubCategory = null;
        if (selectedCategory) {
          const subRes = await getAllSubCategoryByCategoryId(
            selectedCategory.value
          );
          if (subRes?.data?.data) {
            const subOptions = subRes.data.data.map((sub: any) => ({
              value: sub.id.toString(),
              label: sub.name,
            }));
            setSubCategoryOptions(subOptions);
            selectedSubCategory = subOptions.find(
              (sc) => sc.value === data.sub_category_id.toString()
            );
          }
        }

        setFormData({
          occurdate: data.occure_date
            ? new Date(data.occure_date).toLocaleDateString()
            : "",
          finder:
            openToOptions.find((f) => f.value === data.finder?.toString()) ||
            null,
          category: selectedCategory || null,
          subcategory: selectedSubCategory || null,
          problemtype: data.type?.toString() || "",
          details: data.details || "",
          result: data.result || "",
          opento: data.opento || "",
          solution: data.solution || "",
        });
      } catch (error) {
        console.error("Error fetching problem by ID:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProblemData();
  }, [id, openToOptions, categoryOptions]);

  const handleChange = (
    name: keyof ProblemData,
    value: string | Option | null
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "solution") {
      setFormErrors((prev) => ({ ...prev, solution: !value }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.solution.trim()) {
      setFormErrors({ solution: true });

      toast.error("Solution field cannot be empty.", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });

      return;
    }

    try {
      if (id) {
        const solution_user_id = 54; // Consider replacing this with an auth-based value
        await updatesolution(id, {
          solution: formData.solution,
          solution_user_id,
        });

        toast.success("Solution updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });

        navigate("/problems");
      }
    } catch (error) {
      console.error("Error updating solution:", error);

      toast.error("Failed to update solution. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    }
  };


  const backInfo = { title: "Problems", path: "/problems" };

  return (
    <div className="container mx-auto p-6 rounded relative">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}

      <div>
        <PageBreadcrumb
          pageTitle={id ? "Add Solution" : "Add Solution"}
          backInfo={backInfo}
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg"
      >
        <h3 className="text-xl font-semibold mb-3 text-gray-500">Details</h3>
        <hr className="border-t border-gray-300 mb-3" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Occur Date <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded bg-gray-100"
              value={formData.occurdate}
              disabled
            />
          </div>

          <div>
            <label className="font-medium mb-2 text-gray-500">
              Finder <span className="text-red-500">*</span>
            </label>
            <Select
              options={openToOptions}
              value={formData.finder}
              isDisabled={true}
              className="bg-gray-100"
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
              isDisabled={true}
              className="bg-gray-100"
            />
          </div>
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Sub Category <span className="text-red-500">*</span>
            </label>
            <Select
              options={subCategoryOptions}
              value={formData.subcategory}
              isDisabled={true}
              className="bg-gray-100"
            />
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <label className="font-medium text-gray-500">Problem Type</label>
          <label className="flex items-center text-gray-500">
            <input
              type="radio"
              name="problemType"
              value="2"
              checked={formData.problemtype === "2"}
              className="mr-2"
              disabled
            />
            Found By Customer
          </label>
        </div>

        <div>
          <label className="font-medium mb-2 block text-gray-500">
            Details<span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border p-2 rounded h-22 bg-gray-100"
            value={formData.details}
            disabled
          />
        </div>

        <div>
          <label className="font-medium mb-2 block text-gray-500">
            Result<span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border p-2 rounded h-22 bg-gray-100"
            value={formData.result}
            disabled
          />
        </div>

        {/* <div>
          <label className="font-medium mb-2 block text-gray-500">
            Open To
          </label>
          <input
            type="text"
            className="w-full border rounded p-2 bg-gray-100"
            value={formData.opento}
            disabled
          />
        </div> */}

        <div>
          <label className="font-medium mb-2 block text-gray-500">
            Solution<span className="text-red-500">*</span>
          </label>
          <textarea
            className={`w-full border p-2 rounded h-22 ${formErrors.solution ? "border-red-500" : ""
              }`}
            value={formData.solution}
            onChange={(e) => handleChange("solution", e.target.value)}
            required
          />
          {formErrors.solution && (
            <p className="text-red-500 text-sm mt-1">Solution is required</p>
          )}
        </div>

        <div className="flex justify-end gap-2 mb-1 mt-2">
          <Button
            variant="outlined"
            className="bg-pink-300 hover:bg-pink-400"
            onClick={() => navigate("/problems")}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Submit Solution
          </Button>
        </div>
      </form>
    </div>
  );
};
