import React, { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@mui/material";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";
import TextArea from "../../components/form/input/TextArea";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useNavigate, useParams } from "react-router";
import {
  addRule,
  getAllCompanies,
  getAllRuleLocation,
  awsUploadFile,
  updateRule,
  getRuleById,
} from "../../services/apis";
import { toast } from "react-toastify";
import { DragAndDropInput } from "../../components/form/form-elements/DragAndDrop";

interface Option {
  value: string;
  label: string;
}

type RulesForm = {
  title: string;
  company: string;
  type: string;
  files: any[];
  contents: string;
  comment?: string;
};

export const AddUpdateRules: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [companyOptions, setCompanyOptions] = useState<Option[]>([]);
  const [ruleLocationData, setRuleLocationData] = useState<any[]>([]);
  const [sqlRuleId, setSqlRuleId] = useState<number | null>(null);
  const [optionsLoaded, setOptionsLoaded] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<RulesForm>({
    defaultValues: {
      title: "",
      company: "",
      type: "",
      files: [],
      contents: "",
      comment: "",
    },
  });

  useEffect(() => {
    let companiesLoaded = false;
    let locationsLoaded = false;

    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const res = await getAllCompanies();
        if (res?.data?.data) {
          const options = res.data.data.map((company: any) => ({
            value: String(company.id),
            label: company.name,
          }));
          setCompanyOptions(options);
          console.log("Company options:", options);
        }
      } catch (error) {
        console.error("Failed to fetch companies", error);
      }
      companiesLoaded = true;
      if (companiesLoaded && locationsLoaded) setOptionsLoaded(true);
      setLoading(false);
    };

    const fetchRuleLocationData = async () => {
      setLoading(true);
      try {
        const res = await getAllRuleLocation();
        setRuleLocationData(res.data.data);
        console.log("Rule location data:", res.data.data);
      } catch (error) {
        console.error("Error fetching rule locations:", error);
      }
      locationsLoaded = true;
      if (companiesLoaded && locationsLoaded) setOptionsLoaded(true);
      setLoading(false);
    };

    fetchCompanies();
    fetchRuleLocationData();
  }, []);

  useEffect(() => {
    const fetchRuleRegulationData = async (codeId: string) => {
      setLoading(true);
      try {
        const response = await getRuleById(codeId);
        const data = response.data.data;
        console.log("Rule data:", data);
        setSqlRuleId(data.id);

        const companyExists = companyOptions.some(
          (opt) => opt.value === String(data.code_id)
        );
        const typeExists = ruleLocationData.some(
          (item) => String(item.id) === String(data.rule_location_id)
        );
        console.log("companyExists:", companyExists, "typeExists:", typeExists);

        reset({
          title: data.title || "",
          company: data.code_id ? String(data.code_id) : "",
          type: data.rule_location_id ? String(data.rule_location_id) : "",
          files: data.rule_file ? [{ url: data.rule_file }] : [],
          contents: data.contents || "",
          comment: "",
        });
      } catch (error) {
        console.error("Error fetching code data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id && optionsLoaded) {
      fetchRuleRegulationData(id);
    }
  }, [id, optionsLoaded, companyOptions, ruleLocationData, reset]);

  const onSubmit = async (data: RulesForm) => {
    if (loading) return;
    setLoading(true);
    try {
      let fileUrl = "";
      if (data.files && data.files.length > 0) {
        const nonFileUrl = data.files.filter((file: any) => !file.file);
        const withFile = data.files.filter((file: any) => file.file);

        if (withFile.length > 0) {
          const fileData = new FormData();
          withFile.forEach((f: any) => {
            fileData.append("upload", f.file);
          });

          const fileRes = await awsUploadFile(fileData);
          fileUrl = fileRes.data.data[0]?.fileUrl || "";
        } else if (nonFileUrl.length > 0) {
          fileUrl = nonFileUrl[0].fileUrl || nonFileUrl[0].url || "";
        }
      }

      const payload = {
        user_id: Number(localStorage.getItem("Sql_id")),
        code_id: data.company ? Number(data.company) : 0,
        rule_location_id: data.type ? Number(data.type) : 0,
        title: data.title,
        contents: data.contents,
        rule_file: fileUrl,
        if_app_1: 0,
        app_1_by: 0,
        app_1_time: "",
        if_app_2: 0,
        app_2_by: 0,
        app_2_time: "",
        // Include the comment in the payload when updating
        ...(id && { comment: data.comment || "" }),
      };

      let response;
      if (sqlRuleId) {
        response = await updateRule(sqlRuleId, payload);
        toast.success("Rule updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      } else {
        response = await addRule(payload);
        toast.success("Rule created successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      }

      console.log("API response:", response);
      reset();
      navigate("/rules");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Something went wrong while submitting the rule.");
    }
    setLoading(false);
  };
  return (
    <div>
      <PageBreadcrumb
        pageTitle={
          id ? "Edit Rules and regulations" : "Add Rules and regulations"
        }
        backInfo={{ title: "Rules and Regulations", path: "/rules" }}
      />
      <div className="bg-white p-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4 mb-4 mt-3">
            {/* Title */}
            <div className="col-span-2">
              <Label>
                Title<span className="text-red-500">*</span>
              </Label>
              <Controller
                name="title"
                control={control}
                rules={{ required: "Title is required" }}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      className={`${errors.title ? "border-red-500" : ""}`}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.title.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            {/* Company */}
            <div>
              <Label>
                Company<span className="text-red-500">*</span>
              </Label>
              <Controller
                name="company"
                control={control}
                rules={{ required: "Company is required" }}
                render={({ field }) => (
                  <Select
                    options={companyOptions}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    className={`${errors.title ? "border-red-500" : ""}`}
                    placeholder="Select company"
                  />
                )}
              />
              {errors.company && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.company.message}
                </p>
              )}
            </div>

            {/* Type */}
            <div>
              <Label>Type</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => {
                  const typeOptions = ruleLocationData.map((item) => ({
                    value: String(item.id),
                    label: item.title,
                  }));
                  return (
                    <Select
                      options={typeOptions}
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                      }}
                      placeholder="Select Type..."
                    />
                  );
                }}
              />
            </div>

            {/* File Upload */}
            <div className="col-span-2">
              <Label>File</Label>
              <Controller
                name="files"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <DragAndDropInput
                    value={value ? value : []}
                    onChange={(newFiles: any) => onChange(newFiles)}
                    accept=".jpg,.jpeg,.png,.doc,.docx,.pdf"
                  />
                )}
              />
              <p className="text-gray-500 text-sm mt-1">
                Note: Only JPG, JPEG, PNG, DOC, DOCX and PDF files are
                permitted.
              </p>
            </div>

            {/* Contents */}
            <div className="col-span-2">
              <Label>Contents</Label>
              <Controller
                name="contents"
                control={control}
                render={({ field }) => (
                  <>
                    <TextArea
                      {...field}
                      rows={4}
                      className={`${errors.contents ? "border-red-500" : ""}`}
                    />
                  </>
                )}
              />
            </div>

            {id && (
              <div className="col-span-2">
                <Label>
                  Comments<span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="comment"
                  control={control}
                  rules={{
                    required: "Comment is required", // Proper required validation with message
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <TextArea
                        {...field}
                        rows={2}
                        className={error ? "border-red-500" : ""}
                      />
                      {error && (
                        <p className="text-red-500 text-sm mt-1">
                          {error.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-3">
            <Button
              variant="outlined"
              type="button"
              onClick={() => window.history.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              color="primary"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
