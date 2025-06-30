import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import Select from "react-select";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { useParams, useNavigate } from "react-router";
import {
    getAllCategory,
    getAllSubCategoryByCategoryId,
    getAllMaterial,
    getAllPressure,
    getAllSize,
    getAllOEM,
    getAllLocation,
    getAllManufacturer,
    addQuoteItem,
    getQuoteItemById,
    editQuoteItem
} from "../../../services/apis";
import { toast } from "react-toastify";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";

interface Option {
    value: string;
    label: string;
}

interface FormData {
    id?: string;
    category: Option | null;
    subCategory: Option | null;
    model: string;
    pn: string;
    size: Option | null;
    pressure: Option | null;
    material: Option | null;
    weight: string;
    location: Option | null;
    manufacturer: Option | null;
    oem: Option | null;
    oemPn: string;
    brand: string;
    unitPrice: string;
    distributorPrice: string;
    quantity: string;
    extPrice: string;
    normalDays: string;
    inventory: string;
    description: string;
    internalNote: string;
    recommended: 'Yes' | 'No';
    validSince?: string;
}

export const AddItem: React.FC = () => {
    const { pid, id } = useParams();
    const mode = pid && id ? 'add' : 'edit';
    const navigate = useNavigate();
    const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
    const [subCategoryOptions, setSubCategoryOptions] = useState<Option[]>([]);
    const [materialOptions, setMaterialOptions] = useState<Option[]>([]);
    const [pressureOptions, setPressureOptions] = useState<Option[]>([]);
    const [sizeOptions, setSizeOptions] = useState<Option[]>([]);
    const [OEMOptions, setOEMOptions] = useState<Option[]>([]);
    const [locationOptions, setLocationOptions] = useState<Option[]>([]);
    const [manufacturerOptions, setManufacturerOptions] = useState<Option[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Option | null>(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState<Option | null>(null);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<FormData>({
        category: null,
        subCategory: null,
        model: '',
        pn: '',
        size: null,
        pressure: null,
        material: null,
        weight: '',
        location: null,
        manufacturer: null,
        oem: null,
        oemPn: '',
        brand: '',
        unitPrice: '',
        distributorPrice: '',
        quantity: '',
        extPrice: '',
        normalDays: '',
        inventory: '',
        description: '',
        internalNote: '',
        recommended: 'No',

    });

    const fetchQuoteItem = async (itemId: string) => {
        try {
            const response = await getQuoteItemById(itemId);
            const itemData = response.data.data;

            const matchedCategory = categoryOptions.find(
                (cat) => cat.value === String(itemData.category_id)
            );

            const matchedSubCategory = subCategoryOptions.find(
                (sub) => sub.value === String(itemData.subcategory_id)
            );

            const matchedSize = sizeOptions.find(
                (size) => size.value === String(itemData.size)
            );

            const matchedPressure = pressureOptions.find(
                (press) => press.value === String(itemData.pressure)
            );

            const matchedMaterial = materialOptions.find(
                (mat) => mat.value === String(itemData.material)
            );

            const matchedLocation = locationOptions.find(
                (loc) => loc.value === String(itemData.location)
            );

            const matchedManufacturer = manufacturerOptions.find(
                (man) => man.value === String(itemData.manufacturer)
            );

            const matchedOEM = OEMOptions.find(
                (oem) => oem.value === String(itemData.oem)
            );

            setFormData({
                ...formData,
                id: itemData.id,
                category: matchedCategory || null,
                subCategory: matchedSubCategory || null,
                model: itemData.model || '',
                pn: itemData.pn || '',
                size: matchedSize || null,
                pressure: matchedPressure || null,
                material: matchedMaterial || null,
                weight: itemData.weight || '',
                location: matchedLocation || null,
                manufacturer: matchedManufacturer || null,
                oem: matchedOEM || null,
                oemPn: itemData.oem_pn || '',
                brand: itemData.brand || '',
                unitPrice: itemData.unit_price || '',
                distributorPrice: itemData.price_wholesale || '',
                quantity: itemData.quantity || '',
                extPrice: itemData.ext_price || '',
                normalDays: itemData.delivery || '',
                inventory: itemData.qty || '',
                description: itemData.brief || '',
                internalNote: itemData.note_seller || '',
                recommended: itemData.recom_seller === "Yes" ? "Yes" : "No",
                validSince: itemData.created_at // Add this line to set the created_at timestamp
            });

            if (itemData.category_id) {
                setSelectedCategory(matchedCategory || null);
            }
        } catch (error) {
            console.error("Failed to fetch quote item:", error);
        }
    };

    const handleDateChange = (dates: Date[]) => {
        if (dates && dates.length > 0) {
            const selectedDate = dates[0];
            const isoString = selectedDate.toISOString();
            setFormData((prev: any) => ({
                ...prev,
                validSince: isoString
            }));
        }
    };

    useEffect(() => {
        const fetchOptions = async () => {
            setLoading(true);
            try {
                const [
                    categoriesRes,
                    materialsRes,
                    pressuresRes,
                    sizesRes,
                    oemsRes,
                    locationsRes,
                    manufacturersRes,
                ] = await Promise.all([
                    getAllCategory(),
                    getAllMaterial(),
                    getAllPressure(),
                    getAllSize(),
                    getAllOEM(),
                    getAllLocation(),
                    getAllManufacturer(),
                ]);

                // Transform all options
                const transformedCategories = categoriesRes.data.data.map((cat: any) => ({
                    value: String(cat.id),
                    label: cat.name,
                }));

                const transformedMaterials = materialsRes.data.data.map((mat: any) => ({
                    value: String(mat.id),
                    label: mat.name,
                }));

                const transformedPressures = pressuresRes.data.data.map((press: any) => ({
                    value: String(press.id),
                    label: press.name,
                }));

                const transformedSizes = sizesRes.data.data.map((size: any) => ({
                    value: String(size.id),
                    label: size.name,
                }));

                const transformedOEMs = oemsRes.data.data.map((oem: any) => ({
                    value: String(oem.id),
                    label: oem.name,
                }));

                const transformedLocations = locationsRes.data.data.map((loc: any) => ({
                    value: String(loc.id),
                    label: loc.name,
                }));

                const transformedManufacturers = manufacturersRes.data.data.map((man: any) => ({
                    value: String(man.id),
                    label: man.name,
                }));

                // Set all options
                setCategoryOptions(transformedCategories);
                setMaterialOptions(transformedMaterials);
                setPressureOptions(transformedPressures);
                setSizeOptions(transformedSizes);
                setOEMOptions(transformedOEMs);
                setLocationOptions(transformedLocations);
                setManufacturerOptions(transformedManufacturers);

                // Now fetch the quote item if in edit mode
                if (id && !pid) {
                    setIsEditMode(true);
                    const itemRes = await getQuoteItemById(id);
                    const itemData = itemRes.data.data;

                    const matchedCategory = transformedCategories.find(
                        (cat: Option) => cat.value === String(itemData.category_id)
                    );

                    setFormData(prev => ({
                        ...prev,
                        category: matchedCategory || null,
                    }));

                    setSelectedCategory(matchedCategory || null);
                }
            } catch (error) {
                console.error("Failed to fetch options:", error);
            }
            setLoading(false);
        };

        fetchOptions();
    }, [id, pid]);

    useEffect(() => {
        if (isEditMode && id) {
            fetchQuoteItem(id);
        }
    }, [isEditMode, id, categoryOptions, subCategoryOptions, sizeOptions, pressureOptions,
        materialOptions, locationOptions, manufacturerOptions, OEMOptions]);

    useEffect(() => {
        const fetchSubCategories = async () => {
            if (!selectedCategory) {
                setSubCategoryOptions([]);
                setSelectedSubCategory(null);
                return;
            }

            try {
                const res = await getAllSubCategoryByCategoryId(selectedCategory.value);
                const subOptions = res.data.data.map((sub: any) => ({
                    value: String(sub.id),
                    label: sub.name,
                }));

                setSubCategoryOptions(subOptions);

                if (formData.subCategory) {
                    const matchedSub = subOptions.find(
                        (sub: Option) => sub.value === formData.subCategory?.value
                    );
                    setSelectedSubCategory(matchedSub || null);
                }
            } catch (error) {
                console.error("Failed to fetch subcategories:", error);
                setSubCategoryOptions([]);
            }
        };

        fetchSubCategories();
    }, [selectedCategory]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { id, value, type } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [id]:
                type === "number" ? (value === "" ? "" : Number(value)) : value,
        }));
    };

    const handleSelectChange = (field: string, option: Option | null) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: option,
        }));
    };

    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.category) newErrors.category = "Category is required";
        if (!formData.model) newErrors.model = "Model is required";
        if (!formData.pn) newErrors.pn = "P/N is required";
        if (!formData.size) newErrors.size = "Size is required";
        if (!formData.pressure) newErrors.pressure = "Pressure is required";
        if (!formData.unitPrice) newErrors.unitPrice = "Unit price is required";
        if (!formData.quantity) newErrors.quantity = "Quantity is required";
        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        const payload = {
            id: formData.id,
            quote_id: isEditMode ? formData.quote_id : Number(pid),
            item_id: 0,
            user_id: 1,
            category_id: Number(formData.category?.value || 0),
            subcategory_id: Number(formData.subCategory?.value || 0),
            pn: formData.pn || "",
            model: formData.model || "",
            brand: formData.brand || "",
            manufacturer: formData.manufacturer?.value || "",
            size: Number(formData.size?.value || 0),
            oem: Number(formData.oem?.value || 0),
            oem_pn: formData.oemPn || "",
            brief: formData.description || "",
            term: "Ex-Works",
            material: Number(formData.material?.value || 0),
            weight: formData.weight ? String(formData.weight) : "",
            price_term: "Ex-Works",
            price_wholesale: formData.distributorPrice ? String(formData.distributorPrice) : "",
            location: Number(formData.location?.value || 0),
            note_seller: formData.internalNote || "",
            recom_seller: formData.recommended === "Yes" ? "Yes" : "No",
            unit_price: formData.unitPrice ? String(formData.unitPrice) : "",
            ext_price: formData.extPrice ? String(formData.extPrice) : "",
            quantity: formData.quantity ? String(formData.quantity) : "",
            delivery: formData.normalDays ? String(formData.normalDays) : "",
            qty: formData.inventory ? String(formData.inventory) : "",
            pressure: Number(formData.pressure?.value || 0),
        };

        try {
            if (isEditMode && id) {
                await editQuoteItem(formData.id, payload);
                toast.success("Item updated successfully!", {
                    position: "top-right",
                    autoClose: 3000,
                    style: { zIndex: 9999999999, marginTop: "4rem" },
                });
            } else {
                await addQuoteItem(payload);
                toast.success("Item added successfully!", {
                    position: "top-right",
                    autoClose: 3000,
                    style: { zIndex: 9999999999, marginTop: "4rem" },
                });
            }

            navigate("/quote");
        } catch (error) {
            console.error("Failed to save quote item:", error);
            toast.error(`Failed to ${isEditMode ? "update" : "add"} item. Please try again.`, {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
        }
    };

    const backInfo = { title: "Back", path: "/quote" };

    return (
        <div>
            {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            <PageBreadcrumb
                pageTitle={mode === 'edit' ? "Edit Item to the Quote" : "Add Item to the Quote"}
                backInfo={backInfo}
            />
            <div className="bg-white p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Category */}
                        <div className="flex flex-col">
                            <label htmlFor="category" className="font-medium mb-2">
                                Category<span className="text-red-500">*</span>
                            </label>
                            <Select
                                inputId="category"
                                options={categoryOptions}
                                value={formData.category}
                                onChange={(option) => {
                                    handleSelectChange("category", option);
                                    setSelectedCategory(option);
                                }}
                                className={`w-full ${errors.category ? "border-red-500" : ""}`}
                                placeholder="Select category..."
                            />
                            {errors.category && (
                                <span className="text-red-500 text-xs">{errors.category}</span>
                            )}
                        </div>

                        {/* Sub Category */}
                        <div className="flex flex-col">
                            <label htmlFor="subCategory" className="font-medium mb-2">
                                Sub Category<span className="text-red-500">*</span>
                            </label>
                            <Select
                                inputId="subCategory"
                                options={subCategoryOptions}
                                value={formData.subCategory}
                                onChange={(option) => handleSelectChange("subCategory", option)}
                                className={`w-full ${errors.subCategory ? "border-red-500" : ""}`}
                                placeholder="Select sub category..."
                                isDisabled={!formData.category}
                            />
                            {errors.subCategory && (
                                <span className="text-red-500 text-xs">{errors.subCategory}</span>
                            )}
                        </div>

                        {/* Model */}
                        <div className="flex flex-col">
                            <label htmlFor="model" className="font-medium mb-2">
                                Model<span className="text-red-500">*</span>
                            </label>
                            <input
                                id="model"
                                type="text"
                                className={`w-full border p-2 rounded ${errors.model ? "border-red-500" : "border-gray-300"
                                    }`}
                                placeholder="Enter model..."
                                value={formData.model}
                                onChange={handleInputChange}
                            />
                            {errors.model && (
                                <span className="text-red-500 text-xs">{errors.model}</span>
                            )}
                        </div>

                        {/* Weight */}
                        <div className="flex flex-col">
                            <label htmlFor="weight" className="font-medium mb-2">
                                Weight
                            </label>
                            <input
                                id="weight"
                                type="text"
                                className="w-full border p-2 rounded border-gray-300"
                                placeholder="Enter weight..."
                                value={formData.weight}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* P/N */}
                        <div className="flex flex-col">
                            <label htmlFor="pn" className="font-medium mb-2">
                                P/N<span className="text-red-500">*</span>
                            </label>
                            <input
                                id="pn"
                                type="text"
                                className={`w-full border p-2 rounded ${errors.pn ? "border-red-500" : "border-gray-300"
                                    }`}
                                placeholder="Enter P/N..."
                                value={formData.pn}
                                onChange={handleInputChange}
                            />
                            {errors.pn && (
                                <span className="text-red-500 text-xs">{errors.pn}</span>
                            )}
                        </div>

                        {/* Size */}
                        <div className="flex flex-col">
                            <label htmlFor="size" className="font-medium mb-2">
                                Size<span className="text-red-500">*</span>
                            </label>
                            <Select
                                inputId="size"
                                options={sizeOptions}
                                value={formData.size}
                                onChange={(option) => handleSelectChange("size", option)}
                                className={`w-full ${errors.size ? "border-red-500" : ""}`}
                                placeholder={sizeOptions.length ? "Select size..." : "Loading sizes..."}
                                isLoading={sizeOptions.length === 0}
                                isDisabled={sizeOptions.length === 0}
                            />
                            {errors.size && (
                                <span className="text-red-500 text-xs">{errors.size}</span>
                            )}
                        </div>

                        {/* Material */}
                        <div className="flex flex-col">
                            <label htmlFor="material" className="font-medium mb-2">
                                Material
                            </label>
                            <Select
                                inputId="material"
                                options={materialOptions}
                                value={formData.material}
                                onChange={(option) => handleSelectChange("material", option)}
                                className="w-full"
                                placeholder="Select material..."
                            />
                        </div>

                        {/* Pressure */}
                        <div className="flex flex-col">
                            <label htmlFor="pressure" className="font-medium mb-2">
                                Pressure<span className="text-red-500">*</span>
                            </label>
                            <Select
                                inputId="pressure"
                                options={pressureOptions}
                                value={formData.pressure}
                                onChange={(option) => handleSelectChange("pressure", option)}
                                className={`w-full ${errors.pressure ? "border-red-500" : ""}`}
                                placeholder="Select pressure..."
                            />
                            {errors.pressure && (
                                <span className="text-red-500 text-xs">{errors.pressure}</span>
                            )}
                        </div>

                        {/* Inventory */}
                        <div className="flex flex-col">
                            <label htmlFor="inventory" className="font-medium mb-2">
                                Inventory
                            </label>
                            <input
                                id="inventory"
                                type="number"
                                className="w-full border p-2 rounded border-gray-300"
                                placeholder="Enter inventory..."
                                value={formData.inventory}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Location */}
                        <div className="flex flex-col">
                            <label htmlFor="location" className="font-medium mb-2">
                                Location
                            </label>
                            <Select
                                inputId="location"
                                options={locationOptions}
                                value={formData.location}
                                onChange={(option) => handleSelectChange("location", option)}
                                className="w-full"
                                placeholder="Select location..."
                            />
                        </div>

                        {/* Manufacturer */}
                        <div className="flex flex-col">
                            <label htmlFor="manufacturer" className="font-medium mb-2">
                                Manufacturer
                            </label>
                            <Select
                                inputId="manufacturer"
                                options={manufacturerOptions}
                                value={formData.manufacturer}
                                onChange={(option) => handleSelectChange("manufacturer", option)}
                                className="w-full"
                                placeholder="Select manufacturer..."
                            />
                        </div>

                        {/* Normal Days */}
                        <div className="flex flex-col">
                            <label htmlFor="normalDays" className="font-medium mb-2">
                                Normal Ex-Works (days)
                            </label>
                            <input
                                id="normalDays"
                                type="number"
                                className="w-full border p-2 rounded border-gray-300"
                                placeholder="Enter days..."
                                value={formData.normalDays}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* OEM */}
                        <div className="flex flex-col">
                            <label htmlFor="oem" className="font-medium mb-2">
                                OEM
                            </label>
                            <Select
                                inputId="oem"
                                options={OEMOptions}
                                value={formData.oem}
                                onChange={(option) => handleSelectChange("oem", option)}
                                className="w-full"
                                placeholder="Select OEM..."
                            />
                        </div>

                        {/* OEM P/N */}
                        <div className="flex flex-col">
                            <label htmlFor="oemPn" className="font-medium mb-2">
                                OEM P/N
                            </label>
                            <input
                                id="oemPn"
                                type="text"
                                className="w-full border p-2 rounded border-gray-300"
                                placeholder="Enter OEM P/N..."
                                value={formData.oemPn}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Brand */}
                        <div className="flex flex-col">
                            <label htmlFor="brand" className="font-medium mb-2">
                                Brand
                            </label>
                            <input
                                id="brand"
                                type="text"
                                className="w-full border p-2 rounded border-gray-300"
                                placeholder="Enter brand..."
                                value={formData.brand}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Valid Since */}
                        <div className="flex flex-col">
                            <label htmlFor="validSince" className="font-medium mb-2">
                                Valid Since
                            </label>
                            <Flatpickr
                                options={{
                                    dateFormat: "Y-m-d",
                                    allowInput: true,
                                    defaultDate: formData.validSince || null
                                }}
                                value={formData.validSince}
                                onChange={handleDateChange}
                                className={`w-full border p-2 rounded ${errors.validSince ? "border-red-500" : "border-gray-300"}`}
                                placeholder="Select date..."
                            />
                        </div>

                        {/* Unit Price */}
                        <div className="flex flex-col">
                            <label htmlFor="unitPrice" className="font-medium mb-2">
                                Unit Price (USD)<span className="text-red-500">*</span>
                            </label>
                            <input
                                id="unitPrice"
                                type="number"
                                className={`w-full border p-2 rounded ${errors.unitPrice ? "border-red-500" : "border-gray-300"
                                    }`}
                                placeholder="Enter unit price..."
                                value={formData.unitPrice}
                                onChange={handleInputChange}
                            />
                            {errors.unitPrice && (
                                <span className="text-red-500 text-xs">{errors.unitPrice}</span>
                            )}
                        </div>

                        {/* Distributor Price */}
                        <div className="flex flex-col">
                            <label htmlFor="distributorPrice" className="font-medium mb-2">
                                Distributor Price (USD)
                            </label>
                            <input
                                id="distributorPrice"
                                type="number"
                                className="w-full border p-2 rounded border-gray-300"
                                placeholder="Enter distributor price..."
                                value={formData.distributorPrice}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Quantity */}
                        <div className="flex flex-col">
                            <label htmlFor="quantity" className="font-medium mb-2">
                                Quantity<span className="text-red-500">*</span>
                            </label>
                            <input
                                id="quantity"
                                type="number"
                                className={`w-full border p-2 rounded ${errors.quantity ? "border-red-500" : "border-gray-300"
                                    }`}
                                placeholder="Enter quantity..."
                                value={formData.quantity}
                                onChange={handleInputChange}
                            />
                            {errors.quantity && (
                                <span className="text-red-500 text-xs">{errors.quantity}</span>
                            )}
                        </div>

                        {/* Ext. Price */}
                        <div className="flex flex-col">
                            <label htmlFor="extPrice" className="font-medium mb-2">
                                Ext. Price (USD)
                            </label>
                            <input
                                id="extPrice"
                                type="number"
                                className="w-full border p-2 rounded border-gray-300"
                                placeholder="Enter extended price..."
                                value={formData.extPrice}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mt-3">
                        <label htmlFor="description" className="font-medium mb-2">
                            Description
                        </label>
                        <textarea
                            id="description"
                            className="w-full border p-2 rounded border-gray-300"
                            rows={3}
                            placeholder="Enter description..."
                            value={formData.description}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Internal Note */}
                    <div>
                        <label htmlFor="internalNote" className="font-medium mb-2">
                            Internal Note (from seller)
                        </label>
                        <textarea
                            id="internalNote"
                            className="w-full border p-2 rounded border-gray-300"
                            rows={3}
                            placeholder="Enter internal note..."
                            value={formData.internalNote}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Recommended */}
                    <div>
                        <label className="font-medium mb-2">
                            Recommended by Sellers
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="recommended"
                                    value="Yes"
                                    checked={formData.recommended === "Yes"}
                                    onChange={handleRadioChange}
                                />
                                Yes
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="recommended"
                                    value="No"
                                    checked={formData.recommended === "No"}
                                    onChange={handleRadioChange}
                                />
                                No
                            </label>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-4 mt-4">
                        <button className="bg-brand p-4  rounded-xl" onClick={() => navigate(-1)}>
                            Cancel
                        </button >
                        <button className="bg-brand p-4 rounded-xl" type="submit" color="primary">
                            {id ? "Save" : "Submit"}
                        </button >
                    </div>
                </form>
            </div>
        </div>
    );
};