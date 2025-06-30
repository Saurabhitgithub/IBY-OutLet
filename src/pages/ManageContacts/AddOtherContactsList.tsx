import Select, { SingleValue } from "react-select";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useParams } from "react-router";
// import Button from "../../components/ui/button/Button";
import { Button } from "@mui/material";


interface Option {
    value: string;
    label: string;
}

// const finderOptions: Option[] = [
//     { value: "sales26", label: "sale26" },
//     { value: "sales27", label: "sale27" },
//     { value: "sales28", label: "sale28" },
//     { value: "sales29", label: "sale29" },
//     { value: "sales21", label: "sale21" },
//     { value: "sales23", label: "sale23" }
// ];

const categoryOptions: Option[] = [
    { value: "Production Equipement", label: "Production Equipement" },
    { value: "Production tools", label: "Production tools" },
    { value: "production machine", label: "production machine" },
    { value: "productive material", label: "productive mapyrt" },
    { value: "kiuy", label: "kiuy" },
    { value: "spyrt", label: "spyrt" }
];

const subCategoryOptions: Option[] = [
    { value: "pumping unit", label: "pumping unit" },
    { value: "pump materail", label: "pump materail" },
    { value: "gtyru", label: "gtyru" },
    { value: "derki", label: "derki" },
    { value: "potu", label: "potu" },
    { value: "vtruiet", label: "vtruiet" }
];
export const AddOtherContacts: React.FC = () => {


    const [formData, setFormData] = useState({
        membershipType: null as Option | null,
        type: null as Option | null,
        userId: "",
        password: "",
        ifPrivate: "",
        importance: "",
        existcustomer: "",
        creditApprove: "",
        company: "",
        category: null as Option | null,
        discountLevel: "",
        vendorId: "",
        preferedFreightForwarder: "",
        accountNumber: "",
        tradeMark: "",
        businessType: null as Option | null,
        employee: null as Option | null,
        products: "",
        contact: "",
        discipline: null as Option | null,
        addressOne: "",
        addressTwo: "",
        country: null as Option | null,
        state: null as Option | null,
        city: "",
        zip: "",
        countryCode: "",
        areaCode: "",
        telePhone: "",
        extension: "",
        faxNumber: "",
        mobile: "",
        email: "",
        homePages: "",
        notes: "",
        opento: "",
        innerUse: "",
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

    const backInfo = { title: "Contact View", path: "/Contacts" };


    return (
        <div className="container mx-auto p-6 rounded">
            <div>
                <PageBreadcrumb
                    pageTitle={id ? "Edit Contacts " : "Add Contacts "}
                    backInfo={backInfo}
                />
            </div>
            {/* <h1 className="text-2xl font-bold mb-4">Add Problems</h1> */}
            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg ">
                <h3 className="text-xl font-semibold mb-3 text-gray-500">Details</h3>
                <hr className=" border-t border-gray-300 mb-3"></hr>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="font-medium mb-2 text-gray-500">MemberShip Type<span className="text-red-500">*</span></label>
                        <Select
                            options={categoryOptions}
                            value={formData.membershipType}
                            onChange={(selected: SingleValue<Option>) => handleChange("membershipType", selected)}
                        />
                    </div>
                    <div>
                        <label className="font-medium mb-2 text-gray-500">Type<span className="text-red-500">*</span></label>
                        <Select
                            options={subCategoryOptions}
                            value={formData.type}
                            onChange={(selected: SingleValue<Option>) => handleChange("type", selected)}
                        />
                    </div>
                </div>


                <div className="grid grid-cols-2  gap-4">
                    <div>
                        <label className="font-medium mb-2 text-gray-500">User ID<span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full  border p-2 rounded"
                            value={formData.userId}
                            onChange={(e) => handleChange("userId", e.target.value)}>
                        </input>
                    </div>
                    <div>
                        <label className="font-medium mb-2 text-gray-500">Password <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full  border p-2 rounded"
                            value={formData.password}
                            onChange={(e) => handleChange("password", e.target.value)}>
                        </input>
                    </div>
                </div>




                <div className="flex gap-4 ">
                    <label className="font-medium mb-2 block text-gray-500">
                        If Private
                    </label>
                    <div >
                        <label className="text-gray-500" >
                            <input
                                type="radio"
                                name="ifPrivate"
                                value="Yes"
                                checked={formData.ifPrivate === "Yes"}
                                onChange={(e) => handleChange("ifPrivate", e.target.value)}
                                className="mr-2"
                            />
                            Yes
                        </label>
                    </div>

                    <div >
                        <label className="text-gray-500">
                            <input
                                type="radio"
                                name="ifPrivate"
                                value="NO"
                                checked={formData.ifPrivate === "NO"}
                                onChange={(e) => handleChange("ifPrivate", e.target.value)}
                                className="mr-2"
                            />
                            NO
                        </label>
                    </div>

                </div>


                <div className="flex gap-4 ">
                    <label className="font-medium mb-2 block text-gray-500">
                        Importance
                    </label>
                    <div >
                        <label >
                            <input
                                type="radio"
                                name="importance"
                                value="*"
                                checked={formData.importance === "*"}
                                onChange={(e) => handleChange("importance", e.target.value)}
                                className="mr-2"
                            />
                            *
                        </label>
                    </div>

                    <div >
                        <label >
                            <input
                                type="radio"
                                name="importance"
                                value="**"
                                checked={formData.importance === "**"}
                                onChange={(e) => handleChange("importance", e.target.value)}
                                className="mr-2"
                            />
                            **
                        </label>
                    </div>

                    <div >
                        <label >
                            <input
                                type="radio"
                                name="importance"
                                value="***"
                                checked={formData.importance === "***"}
                                onChange={(e) => handleChange("importance", e.target.value)}
                                className="mr-2"
                            />
                            ***
                        </label>
                    </div><div >
                        <label >
                            <input
                                type="radio"
                                name="importance"
                                value="****"
                                checked={formData.importance === "****"}
                                onChange={(e) => handleChange("importance", e.target.value)}
                                className="mr-2"
                            />
                            ****
                        </label>
                    </div>
                    <div >
                        <label >
                            <input
                                type="radio"
                                name="importance"
                                value="*****"
                                checked={formData.importance === "*****"}
                                onChange={(e) => handleChange("importance", e.target.value)}
                                className="mr-2"
                            />
                            *****
                        </label>
                        <label className="text text-gray-500"><span>&ensp;(more stars, more important)</span></label>
                    </div>

                </div>



                <div className="grid grid-cols-2  gap-4">
                    <div>
                        <label className="font-medium mb-2 text-gray-500">Exist Customer ID(Have to be blank if no PO)<span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="w-full max-w-[520px] border p-2 rounded"
                                value={formData.existcustomer}
                                onChange={(e) => handleChange("existcustomer", e.target.value)}>
                            </input>
                            <Button

                                variant="contained"
                            >
                                Generate ID
                            </Button>
                        </div>
                    </div>
                    <div>
                        <label className="font-medium mb-2 text-gray-500">Credit Approve <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full  border p-2 rounded"
                            value={formData.creditApprove}
                            onChange={(e) => handleChange("creditApprove", e.target.value)}>
                        </input>
                    </div>
                </div>



                <div className="grid grid-cols-1  gap-4">
                    <div>
                        <label className="font-medium mb-2 text-gray-500">Company<span className="text-red-500">*</span></label>
                        <div className="flex"><input
                            type="text"
                            className="w-full max-w-[750px] border p-2 rounded"
                            value={formData.company}
                            onChange={(e) => handleChange("company", e.target.value)}>

                        </input>
                            <label className="text-gray-500 ml-3">
                                <input
                                    type="radio"
                                    name="company"
                                    value="Bill To"
                                    checked={formData.company === "Bill To"}
                                    onChange={(e) => handleChange("company", e.target.value)}
                                    className="mr-2"
                                />
                                Bill To
                            </label>

                            <label className="text-gray-500 ml-3">
                                <input
                                    type="radio"
                                    name="company"
                                    value="Ship To"
                                    checked={formData.company === "Ship To"}
                                    onChange={(e) => handleChange("company", e.target.value)}
                                    className="mr-2"
                                />
                                Ship To
                            </label>

                            <label className="text-gray-500 ml-3">
                                <input
                                    type="radio"
                                    name="company"
                                    value="Both"
                                    checked={formData.company === "Both"}
                                    onChange={(e) => handleChange("company", e.target.value)}
                                    className="mr-2"
                                />
                                Both
                            </label>

                        </div>
                    </div>

                </div>

                <div className="grid grid-cols-2  gap-4">
                    <div>
                        <label className="font-medium mb-2 text-gray-500">category<span className="text-red-500">*</span></label>
                        <Select
                            options={subCategoryOptions}
                            value={formData.category}
                            onChange={(selected: SingleValue<Option>) => handleChange("category", selected)}
                        />
                    </div>

                    <div>
                        <label className="font-medium mb-2 text-gray-500">Discount Level<span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full  border p-2 rounded"
                            value={formData.discountLevel}
                            onChange={(e) => handleChange("discountLevel", e.target.value)}>
                        </input>
                    </div>


                </div>


                <div className="grid grid-cols-2  gap-4">
                    <div>
                        <label className="font-medium mb-2 text-gray-500">Vendor ID<span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="w-full max-w-[520px] border p-2 rounded"
                                value={formData.vendorId}
                                onChange={(e) => handleChange("vendorId", e.target.value)}>
                            </input>
                            <Button
                                variant="contained">
                                Generate ID
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2  gap-4">
                    <div>
                        <label className="font-medium mb-2 text-gray-500">Prefered Freight Forwarder<span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full  border p-2 rounded"
                            value={formData.preferedFreightForwarder}
                            onChange={(e) => handleChange("preferedFreightForwarder", e.target.value)}>
                        </input>
                    </div>
                    <div>
                        <label className="font-medium mb-2 text-gray-500">Account Number <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full  border p-2 rounded"
                            value={formData.accountNumber}
                            onChange={(e) => handleChange("accountNumber", e.target.value)}>
                        </input>
                    </div>
                </div>

                <div className="grid grid-cols-1  gap-4">
                    <div>
                        <label className="font-medium mb-2 text-gray-500">TradeMark<span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full  border p-2 rounded"
                            value={formData.tradeMark}
                            onChange={(e) => handleChange("tradeMark", e.target.value)}>
                        </input>
                    </div>

                </div>




                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="font-medium mb-2 text-gray-500">Business Type<span className="text-red-500">*</span></label>
                        <Select
                            options={categoryOptions}
                            value={formData.businessType}
                            onChange={(selected: SingleValue<Option>) => handleChange("businessType", selected)}
                        />
                    </div>
                    <div>
                        <label className="font-medium mb-2 text-gray-500">Type<span className="text-red-500">*</span></label>
                        <Select
                            options={subCategoryOptions}
                            value={formData.type}
                            onChange={(selected: SingleValue<Option>) => handleChange("type", selected)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1  gap-4">
                    <div>
                        <label className="font-medium mb-2 text-gray-500">Products<span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full  border p-2 rounded"
                            value={formData.products}
                            onChange={(e) => handleChange("products", e.target.value)}>
                        </input>
                    </div>

                </div>



                <div className="grid grid-cols-2  gap-4">
                    <div>
                        <label className="font-medium mb-2 text-gray-500">Contact<span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full  border p-2 rounded"
                            value={formData.contact}
                            onChange={(e) => handleChange("contact", e.target.value)}>
                        </input>
                    </div>
                    <div>
                        <label className="font-medium mb-2 text-gray-500">Discipline<span className="text-red-500">*</span></label>
                        <Select
                            options={subCategoryOptions}
                            value={formData.discipline}
                            onChange={(selected: SingleValue<Option>) => handleChange("discipline", selected)}
                        />
                    </div>


                </div>




                <div className="grid grid-cols-1  gap-4">
                    <div>
                        <label className="font-medium mb-2 text-gray-500">Address One<span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full  border p-2 rounded"
                            value={formData.addressOne}
                            onChange={(e) => handleChange("addressOne", e.target.value)}>
                        </input>
                    </div>

                </div>



                <div className="grid grid-cols-1  gap-4">
                    <div>
                        <label className="font-medium mb-2 text-gray-500">Address Two<span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full  border p-2 rounded"
                            value={formData.addressTwo}
                            onChange={(e) => handleChange("addressTwo", e.target.value)}>
                        </input>
                    </div>

                </div>



                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <label className="font-medium mb-2 text-gray-500">Country<span className="text-red-500">*</span></label>
                        <Select
                            options={categoryOptions}
                            value={formData.country}
                            onChange={(selected: SingleValue<Option>) => handleChange("country", selected)}
                        />
                    </div>
                    <div>
                        <label className="font-medium mb-2 text-gray-500">State<span className="text-red-500">*</span></label>
                        <Select
                            options={subCategoryOptions}
                            value={formData.state}
                            onChange={(selected: SingleValue<Option>) => handleChange("state", selected)}
                        />
                    </div>

                    <div>
                        <label className="font-medium mb-2 text-gray-500">City<span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full  border p-2 rounded"
                            value={formData.city}
                            onChange={(e) => handleChange("city", e.target.value)}>
                        </input>
                    </div>
                    <div>
                        <label className="font-medium mb-2 text-gray-500">Zip <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full  border p-2 rounded"
                            value={formData.zip}
                            onChange={(e) => handleChange("zip", e.target.value)}>
                        </input>
                    </div>


                </div>



                <div className="grid grid-cols-4 gap-4">


                    <div>
                        <label className="font-medium mb-2 text-gray-500">Country Code<span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full  border p-2 rounded"
                            value={formData.countryCode}
                            onChange={(e) => handleChange("countryCode", e.target.value)}>
                        </input>
                    </div>
                    <div>
                        <label className="font-medium mb-2 text-gray-500">Area Code <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full  border p-2 rounded"
                            value={formData.areaCode}
                            onChange={(e) => handleChange("areaCode", e.target.value)}>
                        </input>
                    </div>



                    <div>
                        <label className="font-medium mb-2 text-gray-500">TelePhone<span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full  border p-2 rounded"
                            value={formData.telePhone}
                            onChange={(e) => handleChange("telePhone", e.target.value)}>
                        </input>
                    </div>
                    <div>
                        <label className="font-medium mb-2 text-gray-500">Extension <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full  border p-2 rounded"
                            value={formData.extension}
                            onChange={(e) => handleChange("extension", e.target.value)}>
                        </input>
                    </div>


                </div>





                <div className="grid grid-cols-2  gap-4">
                    <div>
                        <label className="font-medium mb-2 text-gray-500">Fax Number<span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full  border p-2 rounded"
                            value={formData.faxNumber}
                            onChange={(e) => handleChange("faxNumber", e.target.value)}>
                        </input>
                    </div>
                    <div>
                        <label className="font-medium mb-2 text-gray-500">Mobile<span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full  border p-2 rounded"
                            value={formData.mobile}
                            onChange={(e) => handleChange("mobile", e.target.value)}>
                        </input>
                    </div>
                </div>


                <div className="grid grid-cols-1  gap-4">
                    <div>
                        <label className="font-medium mb-2 text-gray-500">Email<span className="text-red-500">*</span></label>
                        <input
                            type="email"
                            className="w-full  border p-2 rounded"
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}>
                        </input>
                    </div>

                </div>


                <div className="grid grid-cols-1  gap-4">
                    <div>
                        <label className="font-medium mb-2 text-gray-500">Homepages<span className="text-red-500">*</span></label>
                        <input
                            type="email"
                            className="w-full  border p-2 rounded"
                            value={formData.homePages}
                            onChange={(e) => handleChange("homePages", e.target.value)}>
                        </input>
                    </div>

                </div>




                <div>
                    <label className="font-medium mb-2 block text-gray-500">Notes<span className="text-red-500">*</span></label>
                    <textarea
                        className="w-full border p-2 rounded h-22"
                        value={formData.notes}
                        onChange={(e) => handleChange("notes", e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="font-medium mb-2 block text-gray-500">Open To</label>
                    <input
                        type="text"
                        className="w-full border rounded p-2"
                    />
                </div>



                <div className="grid grid-cols-2">
                    <label className="font-medium mb-2 text-gray-500 flex items-center gap-2">
                        If InnerUse<span className="text-red-500">*</span>
                        <input
                            type="checkbox"
                            value={formData.innerUse}
                            onChange={(e) => handleChange("innerUse", e.target.checked)}
                            className="h-4 w-4"
                        />set this user as inner user
                    </label>
                </div>


                <div className="flex justify-end mb-1 mt-2 gap-2">
                    <Button variant="outlined" className="bg-pink-300" onClick={() => navigate("/contacts")}>Cancel</Button>
                    <Button variant="contained" >{id? "Update":"add submit"}</Button>

                </div>



               


            </form>
        </div>

    );

}

