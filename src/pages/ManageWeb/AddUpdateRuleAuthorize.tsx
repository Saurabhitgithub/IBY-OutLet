import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useNavigate, useParams } from "react-router";
import Select from "react-select";
import {
  addRuleAuthorization,
  editRuleAuthorization,
  getAllCompanies,
  getAllUsers,
  getRuleAuthorizationById,
} from "../../services/apis";
import { toast } from "react-toastify";

interface Option {
  value: string;
  label: string;
}

export const AddUpdateRuleAuthorize: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [companyOptions, setCompanyOptions] = useState<Option[]>([]);
  const [openToOptions, setOpenToOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  const [formErrors, setFormErrors] = useState({
    company: false,
    firstAuthorizer: false,
    finalAuthorizer: false,
  });

  const [formData, setFormData] = useState({
    id: null,
    company: "",
    firstAuthorizer: "",
    finalAuthorizer: "",
  });

  useEffect(() => {
    if (id) fetchRuleAuthorizationData(id);
  }, [id]);

  const fetchRuleAuthorizationData = async (ruleId: string) => {
    setLoading(true);
    try {
      const res = await getRuleAuthorizationById(ruleId);
      const data = res.data?.data;
      setFormData((prev) => ({
        ...prev,
        id: data.id,
        company: data.company_id,
        firstAuthorizer: String(data.first_auth_id),
        finalAuthorizer: String(data.final_auth_id),
      }));
    } catch (error) {
      console.error("Failed to fetch rule authorization data", error);
    }
    finally {
      setLoading(false);
    }
  };

  const handleCompanyChange = (selectedOption: any) => {
    setFormData((prev) => ({ ...prev, company: selectedOption?.value || "" }));
  };

  const handleSingleChange = (
    name: "firstAuthorizer" | "finalAuthorizer",
    selectedOption: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption?.value || "",
    }));
  };

  useEffect(() => {
    fetchCompanies();
    fetchAuthorizers();
  }, []);

  const fetchAuthorizers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      if (res?.data?.data) {
        const options = res.data.data.map((user: any) => ({
          value: String(user.id),
          label: user.name,
        }));
        setOpenToOptions(options);
      }
    } catch (error) {
      console.error("Failed to fetch open to options", error);
    }
    setLoading(false);
  };

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await getAllCompanies();
      if (res?.data?.data) {
        const options = res.data.data.map((company: any) => ({
          value: company.id,
          label: company.name,
        }));
        setCompanyOptions(options);
      }
    } catch (error) {
      console.error("Failed to fetch companies", error);
    }
    setLoading(false);
  };


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const errors = {
    company: !formData.company,
    firstAuthorizer: !formData.firstAuthorizer,
    finalAuthorizer: !formData.finalAuthorizer,
  };
  setFormErrors(errors);

  if (errors.company || errors.firstAuthorizer || errors.finalAuthorizer) {
    return;
  }

  const payload = {
    company_id: Number(formData.company),
    first_auth_id: Number(formData.firstAuthorizer),
    final_auth_id: Number(formData.finalAuthorizer),
  };

  try {
    if (id) {
      await editRuleAuthorization(formData.id, payload);
      toast.success("Authorization rule updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } else {
      await addRuleAuthorization(payload);
      toast.success("Authorization rule added successfully!", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    }

    navigate("/ruleAuthorizer");
  } catch (error) {
    console.error("Error saving rule:", error);
    toast.error("Failed to save the authorization rule.", {
      position: "top-right",
      autoClose: 3000,
      style: { zIndex: 9999999999, marginTop: "4rem" },
    });
  }
};

  const backInfo = { title: "Rule Authorization", path: "/ruleAuthorizer" };

  return (
    <div className="container mx-auto p-6 rounded">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <h1 className="text-2xl font-bold mb-4">
        <PageBreadcrumb
          pageTitle={id ? "Edit Rules Authorizer" : "Add Rules Authorizer"}
          backInfo={backInfo}
        />
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-3">Details</h3>
        <hr className="border-t border-gray-300 mb-4" />

        <div>
          <label className="font-medium mb-2 block">
            Company<span className="text-red-500">*</span>
          </label>
          <div className={formErrors.company ? "border border-red-500 rounded" : ""}>
            <Select
              options={companyOptions}
              value={companyOptions.find((opt) => opt.value === formData.company) || null}
              onChange={handleCompanyChange}
            />
          </div>
          {formErrors.company && (
            <p className="text-sm text-red-500 mt-1"></p>
          )}
        </div>

        <div>
          <label className="font-medium mb-2 block">
            First Authorizer<span className="text-red-500">*</span>
          </label>
          <div className={formErrors.firstAuthorizer ? "border border-red-500 rounded" : ""}>
            <Select
              options={openToOptions}
              value={openToOptions.find((opt) => opt.value === formData.firstAuthorizer) || null}
              onChange={(selected) => handleSingleChange("firstAuthorizer", selected)}
            />
          </div>
          {formErrors.firstAuthorizer && (
            <p className="text-sm text-red-500 mt-1">The first auth field is required.</p>
          )}
        </div>

        <div>
          <label className="font-medium mb-2 block">
            Final Authorizer<span className="text-red-500">*</span>
          </label>
          <div className={formErrors.finalAuthorizer ? "border border-red-500 rounded" : ""}>
            <Select
              options={openToOptions}
              value={openToOptions.find((opt) => opt.value === formData.finalAuthorizer) || null}
              onChange={(selected) => handleSingleChange("finalAuthorizer", selected)}
            />
          </div>
          {formErrors.finalAuthorizer && (
            <p className="text-sm text-red-500 mt-1">The final auth field is required.</p>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
            onClick={() => window.history.back()}
          >
            Back
          </button>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};
