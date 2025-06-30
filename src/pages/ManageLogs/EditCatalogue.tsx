import React, { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Link } from "react-router";
import Button from "../../components/ui/button/Button";

interface Option {
  value: string;
  label: string;
}

export const EditCatalogue: React.FC = () => {
  const locationOptions: Option[] = [
    { value: "clouds", label: "Clouds" },
    { value: "factory", label: "Factory" },
  ];

  const [formData, setFormData] = useState({
    catalogueNo: "",
    companyName: "",
    location: null as Option | null,
    ftpLocation: "",
    product: "",
    secrecy: false,
  });

  const handleChange = (name: keyof typeof formData, value: string | boolean | Option | null) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", formData);
  };
  const backInfo = { title: " Catalogue", path: "/catalog" };
  return (
    <div>
      <PageBreadcrumb pageTitle={"Edit Catalogue"} backInfo={backInfo} />
      <div className="bg-white p-4">
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium mb-2 block text-gray-500">Catalogue No<span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={formData.catalogueNo}
                onChange={(e) => handleChange("catalogueNo", e.target.value)}
              />
            </div>

            <div>
              <label className="font-medium mb-2 block text-gray-500">Company Name<span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium mb-2 block text-gray-500">Location<span className="text-red-500">*</span></label>
              <select
                className="w-full border p-2 rounded"
                value={formData.location?.value || ""}
                onChange={(e) => handleChange("location", locationOptions.find(opt => opt.value === e.target.value) || null)}
              >
                <option value="" disabled className="text-gray-500">Select a location</option>
                {locationOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="mt-5 pt-2">
              <label className="font-medium mb-2 block flex items-center text-gray-500">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={formData.secrecy}
                  onChange={(e) => handleChange("secrecy", e.target.checked)}
                />
                Secrecy
              </label>
            </div>
          </div>

          <div>
            <label className="font-medium mb-2 block text-gray-500">FTP Location<span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={formData.ftpLocation}
              onChange={(e) => handleChange("ftpLocation", e.target.value)}
            />
          </div>

          <div>
            <label className="font-medium mb-2 block text-gray-500">Product<span className="text-red-500">*</span></label>
            <textarea
              className="w-full border p-2 rounded h-28"
              value={formData.product}
              onChange={(e) => handleChange("product", e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end items-center gap-3">
            <Link to={"/catalog"}>
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit">Update</Button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCatalogue;
