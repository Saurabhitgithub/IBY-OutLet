import React, { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Link, useNavigate, useParams } from "react-router";
import Button from "../../components/ui/button/Button";
import { addCatalogue, getCatalogueById, updateCatalogue } from "../../services/apis";
import { toast } from "react-toastify";

interface Option {
  value: string;
  label: string;
}

const locationOptions: Option[] = [
  { value: "Canada", label: "Canada" },
  { value: "China", label: "China" },
];

export const CatalogUpdate: React.FC = () => {
  let { id } = useParams()
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    catalogueNo: "",
    companyName: "",
    location: null as Option | null,
    ftpLocation: "",
    product: "",
    secrecy: false,
    notes: ""
  });
  const [errors, setErrors] = useState({
    catalogueNo: "",
    companyName: "",
    ftpLocation: "",
  });
  useEffect(() => {
    if (id) {
      fetchCatalogueData(id);
    }
  }, [id]);

  const fetchCatalogueData = async (functionId: string) => {
    setLoading(true);
    try {
      const res = await getCatalogueById(functionId);
      const data = res.data?.data;
      if (!data) return;
      setFormData({
        id: data.id,
        catalogueNo: data.file_id,
        companyName: data.company,
        location: data.location ? { value: data.location, label: data.location } : null,
        ftpLocation: data.flocation,
        product: data.product,
        secrecy: data.secrecy,
        notes: data.notes || ""
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };
  const handleChange = (name: keyof typeof formData, value: string | boolean | Option | null) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value ?? "",
    }));
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



  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();

    if (!validate()) {
      setLoading(false); // Stop loading if validation fails
      return;
    }

    const payload = {
      user_id: 0,
      file_id: formData.catalogueNo || "",
      company: formData.companyName,
      location: formData.location?.value || "",
      product: formData.product,
      secrecy: formData.secrecy,
      flocation: formData.ftpLocation,
      notes: formData.notes || "",
    };

    try {
      if (id) {
        await updateCatalogue(formData.id, payload);
        toast.success("Catalogue updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      } else {
        await addCatalogue(payload);
        toast.success("Catalogue added successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      }

      navigate("/catalog");
    } catch (error) {
      console.error("Error saving code:", error);
      toast.error("Failed to save catalogue.", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setLoading(false);
    }
  };

  const backInfo = { title: "Catalogue", path: "/catalog" };
  return (
    <div>
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <PageBreadcrumb pageTitle={id ? "Update Catalogue" : "Add Catalogue"} backInfo={backInfo} />
      <div className="bg-white p-4">
        {/* <h1 className="text-2xl font-bold mb-4">Add Catalogue</h1> */}
        <form onSubmit={handleSubmit} className="space-y-4   ">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium mb-2 block text-gray-500">Catalogue No<span className="text-red-500">*</span></label>
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
              <label className="font-medium mb-2 block text-gray-500">Company Name<span className="text-red-500">*</span></label>
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
                onChange={(selected: SingleValue<Option>) => handleChange("location", selected)}
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
