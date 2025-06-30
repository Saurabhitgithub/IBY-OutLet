 import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { useParams } from "react-router";
import { Button} from "@mui/material";

interface Option {
  value: string;
  label: string;
}

export const AddAnotherCrossRef: React.FC = () => {
  const [formData, setFormData] = useState({
    product: "",
    manufacture: "",
    oemPN: "",
    ourPN: "",
    type: "",
  });
  const navigate = useNavigate();

  const handleChange = (name: keyof typeof formData, value: string | boolean | Option | null) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", formData);
  };
  let { id } = useParams();

  const backInfo = { title: "CrossRef", path: "/cross" };


  return (

    <div className="container mx-auto p-6 rounded">

      <div>
        <PageBreadcrumb
          pageTitle={id ? "Update Count" : "Add Another CrossRef"}
          backInfo={backInfo}
        />
      </div>
      {/* <h1 className="text-2xl font-bold mb-4 text-gray-600">Add Another Cross Ref</h1> */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-3 text-gray-500">Details</h3>
        <hr className="border-t border-gray-300 mb-2" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 block text-gray-500">Product</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={formData.product}
              onChange={(e) => handleChange("product", e.target.value)}
            />
          </div>

          <div>
            <label className="font-medium mb-2 block text-gray-500">Manufacture</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={formData.manufacture}
              onChange={(e) => handleChange("manufacture", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="font-medium mb-2 block text-gray-500">OEM P/N<span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={formData.oemPN}
              onChange={(e) => handleChange("oemPN", e.target.value)}
            ></input>
          </div>
          <div>
            <label className="font-medium mb-2 block  text-gray-500">OUR P/N <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={formData.ourPN}
              onChange={(e) => handleChange("ourPN", e.target.checked)}
            />
          </div>
          <div>
            <label className="font-medium mb-2 block  text-gray-500">Type <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.checked)}
            />
          </div>
        </div>

        {/* <div>
        <label className="font-medium mb-2 block">FTP Location<span className="text-red-500">*</span></label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={formData.ftpLocation}
          onChange={(e) => handleChange("ftpLocation", e.target.value)}
        />
      </div> */}

        <div>
          <label className="font-medium mb-2 block text-gray-500">Product<span className="text-red-500">*</span></label>
          <textarea
            className="w-full border p-2 rounded h-28"
            value={formData.product}
            onChange={(e) => handleChange("product", e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end gap-2 mb-1 mt-2">
            <Button
            variant="outlined"
            className="bg-pink-300"
            onClick={()=>navigate("/cross")}>
              cancel
            </Button>
            <Button
            variant="contained">
              add submit
            </Button>
        </div>
      </form>
    </div>
  );
};

export default AddAnotherCrossRef;
