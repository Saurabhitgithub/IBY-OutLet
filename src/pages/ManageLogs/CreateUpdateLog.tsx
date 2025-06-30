import { Link, useNavigate, useParams } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Input from "../../components/form/input/InputField";
import Radio from "../../components/form/input/Radio";
import TextArea from "../../components/form/input/TextArea";
import Label from "../../components/form/Label";
import Select from "react-select";
import Button from "../../components/ui/button/Button";
import { Controller, useForm } from "react-hook-form";
import { DragAndDropInput } from "../../components/form/form-elements/DragAndDrop";
import Flatpickr from "react-flatpickr";
import {
  awsUploadFile,
  createLog,
  getAllCategory,
  getAllSubCategoryByCategoryId,
  getAllUsers,
  getLogById,
  updateLog,
} from "../../services/apis";
import { useEffect, useState } from "react";
import "./style.css";
import { toast } from "react-toastify";

interface FormTypes {
  event: any;
  spend_time: any;
  private: any;
  hidden: any;
  keyword: any;
  date: any;
  fileData: any;
  detail: any;
  user_id: any;
  openTo: any[];
  id: string;
  jobNum: string | null;
  subJobNum: string | null;
}
interface Option {
  value: string | number;
  label: string;
}

const EVENTS_WITH_CATEGORIES = [
  "Catalogue Design",
  "Distributor Develop",
  "Promote Document",
  "Sourcing",
  "Training"
];

const EVENTS_OPTIONS = [
  { value: "Computer Admin", label: "Computer Admin" },
  { value: "Catalogue Design", label: "Catalogue Design" },
  { value: "Develop Customerr", label: "Develop Customer" },
  { value: "Data Entry/Verify", label: "Data Entry/Verify" },
  { value: "Distributor Develop", label: "Distributor Develop" },
  { value: "Filing", label: "Filing" },
  { value: "Form Design", label: "Form Design" },
  { value: "Insurance/Annuity", label: "Insurance/Annuity" },
  { value: "Inventory", label: "Inventory" },
  { value: "Manage", label: "Manage" },
  { value: "Order Process", label: "Order Process" },
  { value: "Others", label: "Others" },
  { value: "Out of office", label: "Out of office" },
  { value: "Outside Sales Log", label: "Outside Sales Log" },
  { value: "Promote Document", label: "Promote Document" },
  { value: "Recruit", label: "Recruit" },
  { value: "RFQ (Inquiry/quotation Handling)", label: "RFQ (Inquiry/quotation Handling)" },
  { value: "Sourcing", label: "Sourcing" },
  { value: "Problem Search", label: "Problem Search" },
  { value: "Training", label: "Training" },
  { value: "Update Contact", label: "Update Contact" },
  { value: "Web Edit", label: "Web Edit" },
];

const CreateUpdateLog: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<Option | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
  const [openToOptions, setOpenToOptions] = useState<Option[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Option | null>(null);
  const [subCategoryOptions, setSubCategoryOptions] = useState<Option[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<Option | null>(null);
  const [showCategoryFields, setShowCategoryFields] = useState(false);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  const {
    control,
    getValues,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<FormTypes>({
    defaultValues: {
      event: "",
      spend_time: 2,
      private: true,
      hidden: true,
      keyword: "",
      date: new Date(),
      fileData: null,
      detail: "",
      user_id: 54,
      openTo: [],
      id: "",
      jobNum: null,
      subJobNum: null,
    },
  });

  const jobNum = watch("jobNum");
  const subJobNum = watch("subJobNum");

  async function formSubmit(data: any) {
    try {
      setLoading(true);

      if (data.fileData && data.fileData.length > 0) {
        const nonFileUrl = data.fileData.filter((file: any) => !file.file);
        const withFile = data.fileData.filter((file: any) => file.file);

        const fileData = new FormData();
        for (let i = 0; i < withFile.length; i++) {
          fileData.append("upload", withFile[i].file);
        }

        const fileRes = await awsUploadFile(fileData);
        data.fileData = [...nonFileUrl, ...fileRes.data.data];
      }

      data.private = data.private ? 1 : 0;
      data.hidden = data.hidden ? 1 : 0;

      if (data.event && typeof data.event === "object") {
        data.event = data.event.value;
      }

      data.jobNum = getValues().jobNum ? parseInt(getValues().jobNum) : null;
      data.subJobNum = getValues().subJobNum ? parseInt(getValues().subJobNum) : null;

      if (Array.isArray(data.openTo)) {
        data.openTo = data.openTo.map(id => `"${id}"`).join(",");
      }

      if (id) {
        await updateLog(data, getValues().id);
        toast.success("Log updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      } else {
        await createLog(data);
        toast.success("Log created successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      }

      navigate("/logs");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save log. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        style: { zIndex: 9999999999, marginTop: "4rem" },
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);
  const fetchCategories = async () => {
    try {
      const res = await getAllCategory();
      if (res?.data?.data) {
        const options = res.data.data.map((cat: any) => ({
          value: cat.id.toString(),
          label: cat.name,
          raw: cat,
        }));
        setCategoryOptions(options);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!selectedCategory) {
        setSubCategoryOptions([]);
        setSelectedSubCategory(null);
        return;
      }
      try {
        const res = await getAllSubCategoryByCategoryId(selectedCategory.value);
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
        setSubCategoryOptions([]);
        console.error("Failed to fetch subcategories", error);
      }
    };
    fetchSubCategories();
  }, [selectedCategory]);

  useEffect(() => {
    fetchCategories();
    const load = async () => {
      await fetchUsers();
      if (id) {
        await getData();
      }
    };
    load();
  }, [id]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const email = localStorage.getItem('email');
      const response = await getAllUsers();
      const users = response.data?.data || [];
      const formattedUsers = users.map((user: any) => ({
        value: user.id.toString(),
        label: user.name,
        raw: user,
      }));

      setOpenToOptions(formattedUsers);

      let matchedUser = null;
      if (userId || email) {
        matchedUser = formattedUsers.find((user: any) =>
          (email && user.raw.email === email) ||
          (userId && user.raw.id.toString() === userId)
        );
      }

      if (matchedUser) {
        setCurrentUser(matchedUser);
        if (!id) {
          reset({
            ...getValues(),
            openTo: [matchedUser.value],
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  async function getData() {
    try {
      setLoading(true);

      const response = await getLogById(id);
      const logData = response.data.data;

      const eventOption = EVENTS_OPTIONS.find((opt) => opt.value === logData.event) || {
        value: logData.event,
        label: logData.event,
      };

      let parsedOpenTo = [];
      if (logData.openTo) {
        parsedOpenTo = logData.openTo.replace(/"/g, '').split(',').map(id => id.trim()).filter(id => id !== '');
      } else if (currentUser) {
        parsedOpenTo = [currentUser.value];
      }

      reset({
        event: eventOption.value,
        spend_time: logData.spend_time,
        private: logData.private === 1,
        hidden: logData.hidden === 1,
        keyword: logData.keyword,
        date: new Date(logData.date),
        fileData: logData.fileData || null,
        detail: logData.detail,
        user_id: logData.user_id || 54,
        openTo: parsedOpenTo,
        id: logData.id,
        jobNum: logData.jobNum ? logData.jobNum.toString() : null,
        subJobNum: logData.subJobNum ? logData.subJobNum.toString() : null,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (jobNum && categoryOptions.length > 0) {
      const found = categoryOptions.find(opt => opt.value === jobNum);
      if (found && (!selectedCategory || selectedCategory.value !== found.value)) {
        setSelectedCategory(found);
      }
    }
  }, [categoryOptions, jobNum]);

  useEffect(() => {
    if (subJobNum && subCategoryOptions.length > 0) {
      const found = subCategoryOptions.find(opt => opt.value === subJobNum);
      if (found && (!selectedSubCategory || selectedSubCategory.value !== found.value)) {
        setSelectedSubCategory(found);
      }
    }
  }, [subCategoryOptions, subJobNum]);

  useEffect(() => {
    const eventValue = watch("event");
    const shouldShowCategories = EVENTS_WITH_CATEGORIES.includes(eventValue);
    if (showCategoryFields !== shouldShowCategories) {
      setShowCategoryFields(shouldShowCategories);
      if (!shouldShowCategories) {
        setSelectedCategory(null);
        setSelectedSubCategory(null);
      }
    }
  }, [watch("event")]);

  const backInfo = { title: "log", path: "/logs" };

  return (
    <div>
      <PageBreadcrumb
        pageTitle={id ? "Update Log" : "Add Log"}
        backInfo={backInfo}
      />
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <form onSubmit={handleSubmit(formSubmit)}>
        <div className="bg-white p-4">
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <Label>
                Event <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="event"
                control={control}
                rules={{ required: "The event field is required." }}
                render={({ field }) => (
                  <select
                    {...field}
                    value={field.value}
                    className={`dark:bg-dark-900 w-full border rounded px-3 py-2 ${errors.event ? "border-red-500" : "border-gray-300"
                      }`}
                  >
                    <option value="">Select Option</option>
                    {EVENTS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.event?.message && (
                <span className="text-red-500 text-xs">
                  {String(errors.event.message)}
                </span>
              )}
            </div>
            <div>
              <Label htmlFor="input">
                Keyword <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="keyword"
                control={control}
                rules={{ required: "The keyword field is required." }}
                render={({ field }) => (
                  <Input
                    type="text"
                    id="input"
                    {...field}
                    className={`w-full border rounded ${errors.keyword ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                )}
              />
              {errors.keyword?.message && (
                <span className="text-red-500 text-xs">
                  {String(errors.keyword.message)}
                </span>
              )}
            </div>
          </div>
          {showCategoryFields && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label htmlFor="category" className="font-medium mb-2">
                  Product<span className="text-red-500">*</span>
                </label>
                <Select
                  inputId="category"
                  options={categoryOptions}
                  value={selectedCategory}
                  onChange={async (option) => {
                    setSelectedCategory(option as Option);
                    setSelectedSubCategory(null);
                    reset({
                      ...getValues(),
                      jobNum: option ? option.value : null,
                      subJobNum: null,
                    });
                    if (option) {
                      try {
                        const res = await getAllSubCategoryByCategoryId(option.value);
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
                        setSubCategoryOptions([]);
                        console.error("Failed to fetch subcategories", error);
                      }
                    }
                  }}
                  className={`w-full border rounded ${errors.model ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Category..."
                />
                {errors.category && (
                  <span className="text-red-500 text-xs">{errors.category}</span>
                )}
              </div>
              <div className="flex flex-col">
                <label htmlFor="subCategory" className="font-medium mb-2">
                  Sub Product<span className="text-red-500">*</span>
                </label>
                <Select
                  inputId="subCategory"
                  options={subCategoryOptions}
                  value={selectedSubCategory}
                  onChange={(option) => {
                    setSelectedSubCategory(option as Option);
                    reset({
                      ...getValues(),
                      subJobNum: option ? option.value : null,
                    });
                  }}
                  className="w-full"
                  placeholder="Sub Category..."
                  isDisabled={!selectedCategory}
                />
                {errors.subCategory && (
                  <span className="text-red-500 text-xs">{errors.subCategory}</span>
                )}
              </div>
            </div>
          )}

          <Label>
            Detail <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="detail"
            control={control}
            rules={{ required: "The detail field is required." }}
            render={({ field }) => (
              <TextArea
                {...field}
                rows={6}
                className={`dark:bg-dark-900 w-full border rounded ${errors.detail ? "border-red-500" : "border-gray-300"
                  }`}
              />
            )}
          />
          {errors.detail?.message && (
            <span className="text-red-500 text-xs">
              {String(errors.detail.message)}
            </span>
          )}

          <div className="my-3">
            <Label>Upload File</Label>
            <Controller
              name="fileData"
              control={control}
              render={({ field: { value, onChange } }) => (
                <DragAndDropInput
                  value={value ? value : []}
                  onChange={(newFiles: any) => onChange(newFiles)}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Open To</Label>
              <Controller
                name="openTo"
                control={control}
                rules={{
                  required: "Please select at least one recipient",
                  validate: (value) =>
                    (value && value.length > 0) || "You must select at least one option"
                }}
                render={({ field }) => {
                  const value = field.value && Array.isArray(field.value)
                    ? field.value
                    : (currentUser ? [currentUser.value] : []);

                  return (
                    <>
                      <Select
                        isMulti
                        options={openToOptions}
                        value={openToOptions.filter(opt =>
                          value.includes(opt.value.toString())
                        )}
                        onChange={(selected) => {
                          field.onChange(selected ? selected.map(opt => opt.value) : []);
                        }}
                        className={`dark:bg-dark-900 w-full border rounded ${errors.openTo ? "border-red-500" : "border-gray-300"
                          }`}
                        isLoading={loading}
                        isDisabled={loading}
                      />
                      {errors.openTo && (
                        <p className="mt-1 text-sm text-red-500">{errors.openTo.message}</p>
                      )}
                    </>
                  );
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-5">
              <div>
                <Label>If Private</Label>
                <Controller
                  name="private"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <div className="flex flex-wrap items-center gap-8">
                      <Radio
                        id="radio1"
                        name="groupPrivate"
                        value={true}
                        checked={value}
                        onChange={onChange}
                        label="Yes"
                      />
                      <Radio
                        id="radio2"
                        name="groupPrivate"
                        value={false}
                        checked={!value}
                        onChange={onChange}
                        label="No"
                      />
                    </div>
                  )}
                />
              </div>

              <div>
                <Label>If Hidden</Label>
                <Controller
                  name="hidden"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <div className="flex flex-wrap items-center gap-8">
                      <Radio
                        id="radioButton1"
                        name="groupHidden"
                        value={true}
                        checked={value}
                        onChange={onChange}
                        label="Yes"
                      />
                      <Radio
                        id="radioButton2"
                        name="groupHidden"
                        value={false}
                        checked={!value}
                        onChange={onChange}
                        label="No"
                      />
                    </div>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="mt-3">
              <Label>Date</Label>
              <Controller
                name="date"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Flatpickr
                    value={value}
                    onChange={onChange}
                    options={{ dateFormat: "Y-m-d" }}
                    placeholder="Select an option"
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
                  />
                )}
              />
            </div>

            <div className="mt-3">
              <Label>Spend Time (in Hours)</Label>
              <Controller
                name="spend_time"
                control={control}
                render={({ field }) => (
                  <Input type="number" id="input" {...field} />
                )}
              />
            </div>
          </div>

          <br />
          <div className="flex justify-end gap-3">
            <Link to="/logs">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit">Submit</Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateUpdateLog;