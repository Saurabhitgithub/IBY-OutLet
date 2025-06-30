import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { awsUploadFile, editTitle, getAllCompanies, getTitleById } from "../../services/apis";
import { useForm, Controller } from "react-hook-form";
import { DragAndDropInput } from "../../components/form/form-elements/DragAndDrop";
import { toast } from "react-toastify";

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export const EditTitle: React.FC = () => {
  const navigate = useNavigate();
  const { id: titleId } = useParams<{ id: string }>();
  const [titleData, setTitleData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [accountMan, setAccountMan] = useState<number | null>(null);
  const [address, setAddress] = useState("");
  const [codeIdData, setCodeIdData] = useState("");
  const [phone, setPhone] = useState("");
  const [fax, setFax] = useState("");
  const [homepage, setHomepage] = useState("");
  const [bankInfo, setBankInfo] = useState("");
  const [makeCheck, setMakeCheck] = useState("");
  const [file,] = useState<File | null>(null);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");

  useEffect(() => {
    const fetchTitleData = async () => {
      setLoading(true);
      try {
        const response = await getTitleById(titleId!);
        const data = response.data.data;
        setTitleData(data);

        setAccountMan(data.acc_man || null);
        setAddress(data.address || "");
        setCodeIdData(data.code_id || "");  // Initialize codeIdData from API
        setPhone(data.phone || "");
        setFax(data.fax || "");
        setHomepage(data.homepage || "");
        setBankInfo(data.bank || "");
        setMakeCheck(data.make_check || "");
        setSelectedCompany(data.company_id || "");
      } catch (error) {
        console.error("Error fetching title data:", error);
      }
      setLoading(false);
    };

    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const response = await getAllCompanies();
        const companyList = response.data?.data || [];
        setCompanies(companyList);
      } catch (error) {
        console.error("Failed to fetch companies:", error);
      }
      setLoading(false);
    };

    if (titleId) {
      fetchTitleData();
    }
    fetchCompanies();
  }, [titleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titleData) {
      toast.error("Invalid data. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
      return;
    }

    let logoBase64 = "";
    if (file) {
      try {
        logoBase64 = await fileToBase64(file);
      } catch (err) {
        toast.error("Failed to process file.", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
        return;
      }
    }

    const payload = {
      sql_id: titleData.id,
      mongo_id: titleData._id,
      code_id: codeIdData,
      address,
      phone,
      fax,
      homepage,
      bank: bankInfo,
      acc_man: accountMan || 0,
      make_check: makeCheck,
      company_id: selectedCompany,
      logo: logoBase64,
    };

    try {
      const response = await editTitle(payload);
      console.log("API response:", response.data);

      toast.success("Company updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });

      navigate("/title");
    } catch (error: any) {
      console.error("API error:", error);
      toast.error("Failed to update company. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    }
  };

  const handleFileUpload = async (newFiles: FileList | null, onChange: (files: any) => void) => {
    if (!newFiles || newFiles.length === 0) return;
    const formData = new FormData();
    for (let i = 0; i < newFiles.length; i++) {
      console.log("Uploading file:", newFiles[i].name);
      formData.append("upload", newFiles[i]);
    }

    try {
      const response = await awsUploadFile(formData);
      console.log("Files uploaded successfully:", response.data);
      const uploadedFiles = response.data.data || [];
      onChange(uploadedFiles);
    } catch (error: any) {
      console.error("Error uploading files:", error.response?.data || error.message || error);
      alert("Failed to upload files. Please try again.");
    }
  };
  const { control } = useForm();
  return (
    <div className="p-6 min-h-screen">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <h1 className="text-2xl font-bold mb-4">Edit Company</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow w-full">
        <h3 className="text-xl font-semibold mb-4">Details</h3>
        <hr className="border-t border-gray-300 mb-4" />

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">Upload File<span className="text-red-500">*</span></label>
            <div className="my-3">
              <Controller
                name="fileData"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <DragAndDropInput
                    value={value ? value : []}
                    onChange={(newFiles: FileList | null) => handleFileUpload(newFiles, onChange)}
                  />
                )}
              />
            </div>
          </div>
        </div>

        <label className="block mb-2">Account Manager (ID)<span className="text-red-500">*</span></label>
        <input
          type="number"
          className="w-full p-2 border rounded mb-4"
          value={accountMan || ""}
          onChange={(e) => setAccountMan(parseInt(e.target.value) || null)}
        />

        <label className="block mb-2">Address<span className="text-red-500">*</span></label>
        <input
          name="Address"
          type="text"
          className="w-full p-2 border rounded mb-4"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <label className="block mb-2">Companies<span className="text-red-500">*</span></label>
        <select
          className="w-full p-2 border rounded mb-4"
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
        >
          <option value="">Select a Company</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2">Phone<span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2">Fax<span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={fax}
              onChange={(e) => setFax(e.target.value)}
            />
          </div>
        </div>

        <label className="block mb-2">Homepage<span className="text-red-500">*</span></label>
        <input
          type="text"
          className="w-full p-2 border rounded mb-4"
          value={homepage}
          onChange={(e) => setHomepage(e.target.value)}
        />

        <label className="block mb-2">Bank Info<span className="text-red-500">*</span></label>
        <textarea
          className="w-full p-2 border rounded mb-4"
          rows={2}
          value={bankInfo}
          onChange={(e) => setBankInfo(e.target.value)}
        />

        <label className="block mb-2">Make Check<span className="text-red-500">*</span></label>
        <textarea
          className="w-full p-2 border rounded mb-6"
          rows={2}
          value={makeCheck}
          onChange={(e) => setMakeCheck(e.target.value)}
        />

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-300 text-black px-4 py-2 rounded-xl hover:bg-gray-400"
          >
            Cancel
          </button>

          <button
            type="submit"
            className=" text-white px-4 py-2 rounded-xl bg-brand"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};