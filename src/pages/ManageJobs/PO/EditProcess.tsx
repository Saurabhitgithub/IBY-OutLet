import Select, { SingleValue } from "react-select";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { useParams } from "react-router";
import { Button } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { DragAndDropInput } from "../../../components/form/form-elements/DragAndDrop";


interface Option {
    value: string;
    label: string;
}

type FormValues = {
    uploadFiles: any,
    salesMan: string,
    process: string,
    openTo: string,
}


const categoryOptions: Option[] = [
    { value: "Production Equipement", label: "Production Equipement" },
    { value: "Production tools", label: "Production tools" },
    { value: "production machine", label: "production machine" },
    { value: "productive material", label: "productive mapyrt" },
    { value: "kiuy", label: "kiuy" },
    { value: "spyrt", label: "spyrt" }
];


export const EditProcess: React.FC = () => {


    const [formData, setFormData] = useState({
        salesMan: null as Option | null,
        uploadFiles:"",
        process: "",
        openTo: "",
    });
    const navigate = useNavigate();
     const {
            control,
            register,
            handleSubmit,
            formState: { errors },
            setValue,
        } = useForm<FormValues>({
            defaultValues: {
                salesMan: "",
                uploadFiles: formData.uploadFiles,
                process: formData.process,
                openTo: formData.openTo,
            },
        });


   const handleChange = (
    name: keyof typeof formData,
    value: string | boolean | Option | null
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValue(name as any, value, { shouldValidate: true, shouldDirty: true });
  };


   

    let { id } = useParams();

      const onSubmit = handleSubmit((data) => {
        console.log("Form Data:", data);
    });

    const backInfo = { title: "PO", path: "/po" };



    return (
        <div className="container mx-auto p-6 rounded">
            <div>
                <PageBreadcrumb
                    pageTitle={id ? "Reply PO" : "Reply PO "}
                    backInfo={backInfo}
                />
            </div>
            {/* <h1 className="text-2xl font-bold mb-4">Add Problems</h1> */}
            <form onSubmit={onSubmit}
        className="space-y-4 bg-white p-6 rounded-lg "
        noValidate>
                <h3 className="text-xl font-semibold mb-3 text-gray-500">Modify Reply PO</h3>
                <hr className=" border-t border-gray-300 mb-3"></hr>

                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="font-medium mb-2 text-gray-500">Upload File<span className="text-red-500">*</span></label>
                        <div className="my-3">
                                                    <Controller
                                                     name="uploadFiles"
                                                        control={control}
                                                        render={({ field: { value, onChange } }) => (
                                                            <DragAndDropInput
                                                                value={value ? value : []}
                                                                onChange={(newFiles: any) => {
                                                                    onChange(newFiles);
                                                                }} />
                                                        )}
                                                    />
                                                    {errors.uploadFiles && (
                            <p className="text-red-500 text-sm mt-1">{errors.uploadFiles.message?.toString()}</p>
                        )}
                                                </div>
                    </div>
                </div>
                <div className="grid grid-cols-1">
                    <div>
                        <label className="font-medium mb-2 text-gray-500">Sales Man<span className="text-red-500">*</span></label>
                        <Select
                            options={categoryOptions}
                             className={`w-full border p-2 rounded ${errors.salesMan ? "border-red-500" : ""
                                }`}
                            {...register("salesMan", { required: "The sales man field is required." })}
                            value={formData.salesMan}
                            onChange={(selected: SingleValue<Option>) => handleChange("salesMan", selected)}
                        />
                        {errors.salesMan && (
                            <p className="text-red-500 text-sm mt-1">{errors.salesMan.message}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="font-medium mb-2 block text-gray-500">Process<span className="text-red-500">*</span></label>
                    <textarea
                         className={`w-full border p-2 rounded ${errors.process ? "border-red-500" : ""
                                }`}
                            {...register("process", { required: "The process field is required." })}
                        value={formData.process}
                        onChange={(e) => handleChange("process", e.target.value)}
                        required
                    />
                     {errors.process && (
                            <p className="text-red-500 text-sm mt-1">{errors.process.message}</p>
                        )}
                </div>

                <div>
                    <label className="font-medium mb-2 block text-gray-500">Open To</label>
                    <input
                        type="text"
                        className="w-full border rounded p-2"
                    />
                </div>

                <div className="flex justify-end mb-2 mt-2 gap-2">
                    <Button variant="outlined" className="bg-pink-300" onClick={() => navigate("/po")}>Cancel</Button>
                     <Button variant="contained" type="submit">
                                                   {id ? "update" : "add submit"}
                                                 </Button>

                </div>


            </form>
        </div>
    );

}
