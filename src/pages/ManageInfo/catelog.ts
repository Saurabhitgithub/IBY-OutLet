import React, { useState } from "react";
import Select, { SingleValue } from "react-select";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Link, useParams } from "react-router";
import Button from "../../components/ui/button/Button";

interface Option {
  value: string;
  label: string;
}

const locationOptions: Option[] = [
  { value: "clouds", label: "Clouds" },
  { value: "factory", label: "Factory" },
];

export const CatalogUpdate: React.FC = () => {
  const [formData, setFormData] = useState({
    catalogueNo: "",
    companyName: "",
    location: null as Option | null,
    ftpLocation: "",
    product: "",
    secrecy: false,
  });

  const [errors, setErrors] = useState({
    catalogueNo: "",
    companyName: "",
    ftpLocation: "",
  });

  let { id } = useParams();

  const handleChange = (
    name: keyof typeof formData,
    value: string | boolean | Option | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value ?? "",
    }));

    // Clear error when user starts typing
    if (name in errors) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {
      catalogueNo: "",
      companyName: "",
      ftpLocation: "",
    };
    let isValid = true;

    if (!formData.catalogueNo.trim()) {
      newErrors.catalogueNo = "The catalogue no field is required.";
      isValid = false;
    }
    if (!formData.companyName.trim()) {
      newErrors.companyName = "The company name field is required.";
      isValid = false;
    }
    if (!formData.ftpLocation.trim()) {
      newErrors.ftpLocation = "The ftp location field is required.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    console.log("Form Data:", formData);
  };

  const backInfo = { title: "Catalogue", path: "/catalog" };

  return (
    <div>
      <PageBreadcrumb
        pageTitle={id ? "Update Catalogue" : "Add Catalogue"}
        backInfo={backInfo}
      />
      <div className="bg-white p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium mb-2 block text-gray-500">
                Catalogue No<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={formData.catalogueNo}
                onChange={(e) => handleChange("catalogueNo", e.target.value)}
              />
              {errors.catalogueNo && (
                <span className="text-red-500 text-xs">
                  {errors.catalogueNo}
                </span>
              )}
            </div>

            <div>
              <label className="font-medium mb-2 block text-gray-500">
                Company Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
              />
              {errors.companyName && (
                <span className="text-red-500 text-xs">
                  {errors.companyName}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium mb-2 block text-gray-500">
                Location<span className="text-red-500">*</span>
              </label>
              <Select
                options={locationOptions}
                value={formData.location}
                onChange={(selected: SingleValue<Option>) =>
                  handleChange("location", selected)
                }
              />
            </div>

            <div className="flex items-center mt-5">
              <input
                type="checkbox"
                className="mr-2"
                checked={formData.secrecy}
                onChange={(e) => handleChange("secrecy", e.target.checked)}
              />
              <label className="font-medium text-gray-500">Secrecy</label>
            </div>
          </div>

          <div>
            <label className="font-medium mb-2 block text-gray-500">
              FTP Location<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={formData.ftpLocation}
              onChange={(e) => handleChange("ftpLocation", e.target.value)}
            />
            {errors.ftpLocation && (
              <span className="text-red-500 text-xs">{errors.ftpLocation}</span>
            )}
          </div>

          <div>
            <label className="font-medium mb-2 block text-gray-500">
              Product<span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full border p-2 rounded h-28"
              value={formData.product}
              onChange={(e) => handleChange("product", e.target.value)}
              
            />
          </div>

          <div className="flex justify-end items-center gap-3">
            <Link to={"/catalog"}>
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CatalogUpdate;
