import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm, Controller } from "react-hook-form";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
// import { EVENTS_OPTIONS } from "../../../constants/constants";
import { Box, Button, Modal } from "@mui/material";
import TextArea from "../../../components/form/input/TextArea";
import { toast } from "react-toastify";
import {
  addJobMtr,
  editJobMtr,
  getAllCategory,
  getAllSubCategoryByCategoryId,
  getJobMtrById,
  awsUploadFile,
} from "../../../services/apis";
import { DragAndDropInput } from "../../../components/form/form-elements/DragAndDrop";
// import { Categories } from "../../ManageProducts/Categories";
import { useWatch } from "react-hook-form";

type FormData = {
  user_id: string;
  user_sql_id: number;
  category_id: number;
  subCategory_id: number;
  mtr: string;
  product_name: string;
  jobNum: string;
  subJobNum: string;
  file_name: string;
  file_url: string;
  file: File[]; // Ensure this is an array to match DragAndDropInput
  sn: string;
  rn: string;
  cn: string;
  po: string;
  pn: string;
  ht: string;
  file_sql_name: string;
  manufacture: string;
  description: string;
  front_sn: string;
  begin_sn: string;
  end_sn: string;
};
type OptionType = { label: string; value: string };

export default function AddAndUpdateMtr() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<OptionType[]>([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState<OptionType[]>(
    []
  );
  const [
    getAllSubCtaegotyByCategoryIdOptions,
    setGetAllSubCtaegotyByCategoryIdOptions,
  ] = useState<OptionType[]>([]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      user_id: localStorage.getItem("userId") || "",
      user_sql_id: localStorage.getItem("Sql_id") || 0,
      category_id: 0,
      subCategory_id: 0,
      mtr: "",
      product_name: "",
      jobNum: "33",
      subJobNum: "33",
      file_name: "",
      file_url: [],
      sn: "",
      rn: "",
      cn: "",
      po: "",
      pn: "",
      ht: "",
      manufacture: "",
      description: "",
      front_sn: "",
      begin_sn: "",
      end_sn: "",
      file: [], // Ensure this is an array to match DragAndDropInput
    },
  });

  const fetchEditMtr = async () => {
    try {
      const response = await getJobMtrById(id);
      const mtrData = response.data.data?.[0];
      console.log("mtr data", mtrData);
      setUser(mtrData);

      Object.keys(mtrData).forEach((key) => {
        if (key in getValues()) {
          setValue(key as keyof FormData, mtrData[key]);
        }
      });
      setValue(
        "file",
        mtrData?.file_name
          ? [
            {
              fileUrl: mtrData.file_url,
              fileName: mtrData?.file_name,
            },
          ]
          : [
            {
              fileUrl: `http://99.91.196.91/cn/assets/mtr/${mtrData.file_sql_name}`,
              fileName: mtrData?.file_sql_name,
            },
          ]
      );
      user(setUser);
    } catch (error) {
      console.log("fetchediterror", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEditMtr();
    }
  }, [id]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategory();
        console.log("Raw API response:", res);

        const categories = res?.data?.data ?? [];

        const options = Array.isArray(categories)
          ? categories
            .filter((item: any) => item.active_status)
            .map((item: any) => ({
              label: item.name,
              value: item.id,
              // mongoId: item._id,
            }))
          : [];

        console.log("Mapped Category Options:", options);
        setCategoryOptions(options);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, []);

  const selectedCategoryId = useWatch({
    control,
    name: "category_id",
  });

  const fetchSubCategories = async () => {
    if (!selectedCategoryId) {
      setGetAllSubCtaegotyByCategoryIdOptions([]);
      return;
    }

    try {
      const res = await getAllSubCategoryByCategoryId(getValues().category_id);
      const categories = res?.data?.data ?? [];

      const options = categories?.map((item: any) => ({
        label: item.name,
        value: item.id,
        // mongoId: item._id,
      }));

      console.log(options);
      setSubCategoryOptions(options);

      setGetAllSubCtaegotyByCategoryIdOptions(options);
    } catch (err) {
      console.error("Failed to fetch subcategories:", err);
    }
  };
  useEffect(() => {
    fetchSubCategories();
  }, [selectedCategoryId]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        user_id: data.user_sql_id,
        file_url: data.file_name,

        ...(id && {
          sql_id: id,
          mongo_id: id,
        }),
      };
      if (data?.file && data?.file[0]?.file) {
        let fileInfo = new FormData();
        fileInfo.append("upload", data.file[0].file);
        const uploadedUrls = await awsUploadFile(fileInfo).then(
          (res) => res.data.data
        );

        payload.file_name = uploadedUrls[0].fileName;
        payload.file_url = uploadedUrls[0].fileUrl;
        payload.file_sql_name = uploadedUrls[0].fileName;
      }
      console.log("Payload to submit:", payload, data);

      if (id) {
        await editJobMtr(payload);
        toast.success("mtr data updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      } else {
        await addJobMtr(payload);
        toast.success("mtr created successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      }
      navigate("/mtr");
    } catch (error) {
      console.error("Error submitting MTR:", error);
    } finally {
      setLoading(false);
    }
  };

  const backInfo = { title: "MTR", path: "/mtr" };

  return (
    <div>
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <PageBreadcrumb
        pageTitle={id ? "Update MTR" : "Add MTR"}
        backInfo={backInfo}
      />
      <div className="bg-white p-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <Label className="text-gray-500">
                MTR <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="mtr"
                control={control}
                rules={{
                  required: "The mtr field is required.",
                  minLength: {
                    value: 2,
                    message: "MTR must be at least 2 characters",
                  },
                }}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      placeholder="Enter mtr"
                      type="text"
                      className={`w-full border rounded-md p-2 ${errors.mtr ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                    {errors.mtr && (
                      <p className="text-red-500 text-sm">
                        {errors.mtr.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div>
              <Label className="text-gray-500">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="product_name"
                control={control}
                rules={{
                  required: "The product name field is required.",
                  minLength: {
                    value: 2,
                    message: "Product name must be at least 2 characters",
                  },
                }}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      placeholder="Enter product name"
                      type="text"
                      className={`w-full border rounded-md p-2 ${errors.product_name
                        ? "border-red-500"
                        : "border-gray-300"
                        }`}
                    />
                    {errors.product_name && (
                      <p className="text-red-500 text-sm">
                        {errors.product_name.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            {/* Category */}
            <div>
              <Label className="text-gray-500">Category  (optional) </Label>
              <Controller
                name="category_id"
                control={control}
                // rules={{ required: "The category field is required." }}
                render={({ field }) => (
                  <>
                    <select
                      {...field}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value=""></option>
                      {categoryOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              />
            </div>

            {/* Sub Category */}
            <div>
              <Label className="text-gray-500">Sub Category (optional) </Label>
              <Controller
                name="subCategory_id"
                control={control}
                // rules={{ required: "The subcategory field is required." }}
                render={({ field }) => (
                  <>
                    <select
                      {...field}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value=""></option>
                      {subCategoryOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="font-medium mb-2 text-gray-500">
                Upload File (optional)
              </label>

              <div className="my-3">
                <Controller
                  name="file"
                  control={control}
                  // rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <DragAndDropInput
                      value={Array.isArray(value) ? value : []} // ensure it's an array bcos we define file in array above
                      onChange={(newFiles: File[]) => {
                        onChange(newFiles), console.log(newFiles);
                      }}
                    />
                  )}
                />
              </div>
            </div>
          </div>
          <div className="mb-4">
            <Label className="text-gray-500">
              SN <span className="text-red-500">*</span>
            </Label>
            <button
              type="button"  // Add this
              onClick={() => setIsModalOpen(true)}
              className="bg-brand text-white px-4 py-2 rounded-xl hover:bg-brand-dark transition-colors"
            >
              Generate SN
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-3">
            <div>
              {/* <Label className="text-gray-500">Description</Label> */}
              <Controller
                name="sn"
                control={control}
                // rules={{ required: true }}
                rules={{ required: "The sn field is required." }}
                render={({ field }) => (
                  <>
                    {" "}
                    <TextArea
                      {...field}
                      rows={6}
                      className={`w-full border rounded-md p-2 ${errors.pn ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                    {errors.sn && (
                      <p className="text-red-500 text-sm">
                        {errors.sn.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <Label className="text-gray-500">RN</Label>
              <Controller
                name="rn"
                control={control}
                // rules={{ required: true }}
                render={({ field }) => (
                  <Input {...field} placeholder="Enter rn" type="text" />
                )}
              />
            </div>
            <div>
              <Label className="text-gray-500">
                CN<span className="text-red-500">*</span>
              </Label>
              <Controller
                name="cn"
                control={control}
                rules={{
                  required: "The cn field is required.",
                  minLength: { value: 1, message: "CN must not be empty" },
                }}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      placeholder="Enter cn"
                      type="text"
                      className={`w-full border rounded-md p-2 ${errors.pn ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                    {errors.cn && (
                      <p className="text-red-500 text-sm">
                        {errors.cn.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <Label className="text-gray-500">PO</Label>
              <Controller
                name="po"
                control={control}
                // rules={{ required: true }}
                render={({ field }) => (
                  <Input {...field} placeholder="Enter po" type="text" />
                )}
              />
            </div>
            <div>
              <Label className="text-gray-500">
                P/N<span className="text-red-500">*</span>
              </Label>
              <Controller
                name="pn"
                control={control}
                rules={{ required: "The pn field is required." }}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      placeholder="Enter p/n"
                      type="text"
                      className={`w-full border rounded-md p-2 ${errors.pn ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                    {errors.pn && (
                      <p className="text-red-500 text-sm">
                        {errors.pn.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <Label className="text-gray-500">HT</Label>
              <Controller
                name="ht"
                control={control}
                // rules={{ required: true }}
                render={({ field }) => (
                  <Input {...field} placeholder="Enter ht" type="text" />
                )}
              />
            </div>
            <div>
              <Label className="text-gray-500">Manufacture</Label>
              <Controller
                name="manufacture"
                control={control}
                // rules={{ required: true }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter manufacture"
                    type="text"
                  />
                )}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              className="border-2 border-bg-brand text-bg-brand hover:bg-bg-brand/10 rounded-xl px-4 py-2 transition-colors"
              onClick={() => navigate("/mtr")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-brand text-white px-4 py-2 rounded-xl"
            >
              {id ? "Update" : "Add Submit"}
            </button>
          </div>
        </form>
      </div>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
          }}
        >
          <div className="bg-white w-full max-w-2xl p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-500">
              Generate SN
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <Label className="text-gray-500">
                  Front SN <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="front_sn"
                  control={control}
                  rules={{
                    required: "The front sn is required.",
                  }}
                  render={({ field }) => (
                    <>
                      <Input
                        {...field}
                        placeholder="Enter front sn"
                        type="text"
                        className={`w-full border rounded-md p-2 ${errors.front_sn ? "border-red-500" : "border-gray-300"
                          }`}
                      />

                      {errors.front_sn && (
                        <p className="text-red-500 text-sm">
                          {errors.front_sn.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>
              <div>
                <Label className="text-gray-500">
                  Begin SN <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="begin_sn"
                  control={control}
                  rules={{
                    required: "The begin sn is required.",
                  }}
                  render={({ field }) => (
                    <>
                      <Input
                        {...field}
                        placeholder="Enter begin sn"
                        type="text"
                        className={`w-full border rounded-md p-2 ${errors.begin_sn ? "border-red-500" : "border-gray-300"
                          }`}
                      />
                      {errors.begin_sn && (
                        <p className="text-red-500 text-sm">
                          {errors.begin_sn.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>
              <div>
                <Label className="text-gray-500">
                  End SN <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="end_sn"
                  control={control}
                  rules={{
                    required: "The end sn is required.",
                  }}
                  render={({ field }) => (
                    <>
                      <Input
                        {...field}
                        placeholder="Enter end sn"
                        type="text"
                        className={`w-full border rounded-md p-2 ${errors.end_sn ? "border-red-500" : "border-gray-300"
                          }`}
                      />

                      {errors.end_sn && (
                        <p className="text-red-500 text-sm">
                          {errors.end_sn.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 bg-brand py-2 rounded-xl text-gray-700  transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-brand text-white px-4 py-2 rounded-xl  transition-colors"
                onClick={async () => {
                  const isValid = await trigger([
                    "front_sn",
                    "begin_sn",
                    "end_sn",
                  ]);
                  if (!isValid) return;

                  const front = watch("front_sn");
                  const begin = watch("begin_sn");
                  const end = watch("end_sn");
                  const sn = `${front}${begin}-${end}`;
                  setValue("sn", sn);

                  const prevDescription = watch("description") || "";
                  const updatedDescription = `${prevDescription}\nSN Generated: ${sn}`;
                  setValue("description", updatedDescription);

                  setIsModalOpen(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
