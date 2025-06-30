import { Box, Modal } from "@mui/material";
import Select from "react-select";
import { getAllCategory, getAllPressure, getAllSize, getAllSubCategoryByCategoryId } from "../../services/apis";
import { useEffect, useState } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import moment from "moment";

interface Option {
    value: string | number;
    label: string;
}

export const AdvancedSearch = ({
    open,
    onClose,
    onSearch
}: {
    open: boolean;
    onClose: () => void;
    onSearch: (filters: any) => void;
}) => {
    const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
    const [subCategoryOptions, setSubCategoryOptions] = useState<Option[]>([]);
    const [sizeOptions, setSizeOptions] = useState<Option[]>([]);
    const [pressureOptions, setPressureOptions] = useState<Option[]>([]);
    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Option | null>(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState<Option | null>(null);
    const [selectedSize, setSelectedSize] = useState<Option | null>(null);
    const [selectedPressure, setSelectedPressure] = useState<Option | null>(null);
    const [selectedQtyType, setSelectedQtyType] = useState<Option | null>(null);
    const [selectedQtyOperator, setSelectedQtyOperator] = useState<Option | null>(null);
    const [qtyValue, setQtyValue] = useState<number | null>(null);

    // Checkbox states
    const [outOfStockGtZero, setOutOfStockGtZero] = useState(false);
    const [qtyInStockLtMinQty, setQtyInStockLtMinQty] = useState(false);
    const [qtyInStockGtMaxQty, setQtyInStockGtMaxQty] = useState(false);
    const [qtyInStockNePhyQty, setQtyInStockNePhyQty] = useState(false);

    const qtyTypeOptions = [
        { value: "p_qty", label: "Stock" },
        { value: "phy_qty", label: "Physical Qty" },
        { value: "qty_ontheway", label: "On The Way" },
        { value: "qty_inproduce", label: "In Producing" },
    ];

    const qtyFnOptions = [
        { value: "=", label: "=" },
        { value: ">", label: ">" },
        { value: "<", label: "<" },
    ];
    const qtyFn2Options = [
        { value: "<", label: "<" },
    ];
    const handleSearch = () => {
        const filters: any = {};

        if (selectedCategory?.value) filters.category_id = selectedCategory.value;
        if (selectedSubCategory?.value) filters.subcategory_id = selectedSubCategory.value;
        if (selectedSize?.value) filters.size_id = selectedSize.value;
        if (selectedPressure?.value) filters.pressure_id = selectedPressure.value;

        // Format dates to YYYY-MM-DD
        if (fromDate) filters.from_date = moment(fromDate).format('YYYY-MM-DD');
        if (toDate) filters.to_date = moment(toDate).format('YYYY-MM-DD');

        // Quantity filters
        if (selectedQtyType?.value && selectedQtyOperator?.value && qtyValue !== null) {
            filters[`${selectedQtyType.value}_${selectedQtyOperator.value}`] = qtyValue;
        }

        // Checkbox filters
        if (outOfStockGtZero) filters.out_of_stock = true;
        if (qtyInStockLtMinQty) filters.qty_less_than_min = true;
        if (qtyInStockGtMaxQty) filters.qty_more_than_max = true;
        if (qtyInStockNePhyQty) filters.qty_not_equal_physical = true;

        onSearch(filters);
        resetForm();
        onClose();
    };

    useEffect(() => {
        if (!open) return;

        const fetchInitialDropdowns = async () => {
            try {
                const [categoryRes, sizeRes, pressureRes] = await Promise.all([
                    getAllCategory(),
                    getAllSize(),
                    getAllPressure(),
                ]);

                if (categoryRes?.data?.data) {
                    const options = categoryRes.data.data.map((cat: any) => ({
                        value: cat.id ?? cat._id,
                        label: cat.name ?? String(cat),
                        raw: cat,
                    }));
                    setCategoryOptions(options);
                }

                setSizeOptions(
                    (sizeRes.data.data || []).map((sz: any) => ({
                        value: sz.id ?? sz._id,
                        label: sz.name ?? String(sz),
                    }))
                );

                setPressureOptions(
                    (pressureRes.data.data || []).map((pr: any) => ({
                        value: pr.id ?? pr._id,
                        label: pr.name ?? String(pr),
                    }))
                );

            } catch (err) {
                console.error("Error fetching dropdown data:", err);
                setCategoryOptions([]);
                setSizeOptions([]);
                setPressureOptions([]);
            }
        };

        fetchInitialDropdowns();
    }, [open]);

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
                        value: sub.id ?? sub._id,
                        label: sub.name ?? String(sub),
                    }));
                    setSubCategoryOptions(options);
                } else {
                    setSubCategoryOptions([]);
                }
            } catch (error) {
                console.error("Failed to fetch subcategories", error);
                setSubCategoryOptions([]);
            }
        };

        fetchSubCategories();
    }, [selectedCategory]);
    const resetForm = () => {
        setSelectedCategory(null);
        setSelectedSubCategory(null);
        setSelectedSize(null);
        setSelectedPressure(null);
        setSelectedQtyType(null);
        setSelectedQtyOperator(null);
        setQtyValue(null);
        setFromDate(null);
        setToDate(null);

        // Reset checkboxes
        setOutOfStockGtZero(false);
        setQtyInStockLtMinQty(false);
        setQtyInStockGtMaxQty(false);
        setQtyInStockNePhyQty(false);
    };
    const handleClose = () => {
        resetForm();
        onClose();
    };



    const todayStr = new Date().toISOString().slice(0, 10);

    return (
        <div>
            <Modal open={open} onClose={handleClose}>
                <Box className="fixed inset-0 bg-opacity-50 flex justify-center items-start pt-24 z-9999">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-4">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center border-b pb-2 mb-4">
                            <h2 className="text-lg font-semibold">Advanced Search</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-black text-2xl"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Product Info Table */}
                        <div className="mb-4 text-gray-800">
                            <div className="grid grid-cols-2 gap-2 text-sm p-2 text-start items-center">
                                {/* category */}
                                <div className="col-span-1 font-semibold p-2 rounded ">
                                    <label htmlFor="category" className="block mb-2">Category</label>
                                    <Select
                                        inputId="category"
                                        options={categoryOptions}
                                        value={selectedCategory}
                                        onChange={(option) => {
                                            setSelectedCategory(option as Option);
                                            setSelectedSubCategory(null);
                                        }}
                                        placeholder="Category..."
                                        className="w-full"
                                    />
                                </div>

                                {/* Sub category */}
                                <div className="col-span-1 font-semibold p-2 rounded ">
                                    <label htmlFor="subCategory" className="block mb-2">Sub Category</label>
                                    <Select
                                        inputId="subCategory"
                                        options={subCategoryOptions}
                                        value={selectedSubCategory}
                                        onChange={(option) => setSelectedSubCategory(option as Option)}
                                        placeholder="Sub Category..."
                                        className="w-full"
                                        isDisabled={!selectedCategory}
                                    />
                                </div>
                                {/* Size */}
                                <div className="col-span-2 font-semibold p-2 rounded ">
                                    <label htmlFor="size" className="block mb-2">Size</label>
                                    <Select
                                        id="size"
                                        placeholder="Size..."
                                        options={sizeOptions}
                                        value={selectedSize}
                                        onChange={setSelectedSize}
                                    />
                                </div>
                                {/* Pressure */}
                                <div className="col-span-2 font-semibold p-2 rounded ">
                                    <label htmlFor="pressure" className="block mb-2">Pressure</label>
                                    <Select
                                        id="pressure"
                                        placeholder="Pressure..."
                                        options={pressureOptions}
                                        value={selectedPressure}
                                        onChange={setSelectedPressure}
                                    />
                                </div>
                                {/* qty type */}
                                <div className="col-span-1 font-semibold p-2 rounded">
                                    <label className="block mb-2">QTY Type</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Select
                                            options={qtyTypeOptions}
                                            placeholder="QTY"
                                            value={selectedQtyType}
                                            onChange={setSelectedQtyType}
                                        />
                                        <Select
                                            options={qtyFnOptions}
                                            value={selectedQtyOperator}
                                            onChange={setSelectedQtyOperator}
                                        />
                                    </div>
                                </div>
                                {/* And */}
                                <div className="col-span-1 font-semibold p-2 rounded ">
                                    <label htmlFor="pressure" className="block mb-2">And</label>
                                    <div className="grid grid-cols-3 gap-1">
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
                                            value={qtyValue ?? ""}
                                            onChange={e => setQtyValue(e.target.value ? Number(e.target.value) : null)}
                                        />
                                        <Select
                                            options={qtyFn2Options}
                                        />
                                        <input type="number"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
                                        />
                                    </div>
                                </div>
                                {/* date */}
                                <div className="col-span-1 font-semibold p-2 rounded ">
                                    <label htmlFor="from-date" className="block mb-2">From Date</label>
                                    <Flatpickr
                                        options={{
                                            dateFormat: "Y-m-d",
                                            maxDate: todayStr,
                                        }}
                                        value={fromDate ? [fromDate] : []}
                                        onChange={dates => setFromDate(dates[0] ?? null)}
                                        placeholder="Select Date"
                                        className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
                                    />
                                </div>
                                <div className="col-span-1 font-semibold p-2 rounded ">
                                    <label htmlFor="to-date" className="block mb-2">To Date</label>
                                    <Flatpickr
                                        options={{
                                            dateFormat: "Y-m-d",
                                            maxDate: todayStr,
                                        }}
                                        value={toDate ? [toDate] : []}
                                        onChange={dates => setToDate(dates[0] ?? null)}
                                        placeholder="Select Date"
                                        className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
                                    />
                                </div>
                            </div>

                            {/* Checkbox Section */}
                            <div className="row px-2">
                                <div className="col-12 form-group">
                                    <div className="form-check">
                                        <input
                                            id="outofstock_gt_zero"
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={outOfStockGtZero}
                                            onChange={e => setOutOfStockGtZero(e.target.checked)}
                                        />
                                        <label className="form-check-label ms-2" htmlFor="outofstock_gt_zero">
                                            Out of Stock &gt; 0
                                        </label>
                                    </div>
                                </div>
                                <div className="col-12 form-group">
                                    <div className="form-check">
                                        <input
                                            id="qtyinstock_lt_minqty"
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={qtyInStockLtMinQty}
                                            onChange={e => setQtyInStockLtMinQty(e.target.checked)}
                                        />
                                        <label className="form-check-label ms-2" htmlFor="qtyinstock_lt_minqty">
                                            Qty In Stock &lt; Min. Qty
                                        </label>
                                    </div>
                                </div>
                                <div className="col-12 form-group">
                                    <div className="form-check">
                                        <input
                                            id="qtyinstock_gt_maxqty"
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={qtyInStockGtMaxQty}
                                            onChange={e => setQtyInStockGtMaxQty(e.target.checked)}
                                        />
                                        <label className="form-check-label ms-2" htmlFor="qtyinstock_gt_maxqty">
                                            Qty In Stock &gt; Max. Qty
                                        </label>
                                    </div>
                                </div>
                                <div className="col-12 form-group">
                                    <div className="form-check">
                                        <input
                                            id="qtyinstock_ne_phyqty"
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={qtyInStockNePhyQty}
                                            onChange={e => setQtyInStockNePhyQty(e.target.checked)}
                                        />
                                        <label className="form-check-label ms-2" htmlFor="qtyinstock_ne_phyqty">
                                            Qty In Stock != Physical qty
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                            >
                                Close
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                onClick={handleSearch}
                            >
                                Search
                            </button>

                        </div>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};