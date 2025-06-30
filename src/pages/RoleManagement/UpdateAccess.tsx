import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPermissionByRole, updatePermission } from "../../services/apis";
import { toast } from "react-toastify";

export const UpdateAccess: React.FC = () => {
    const { roleName } = useParams();
    const navigate = useNavigate();
    const [loader, setLoader] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedModule, setSelectedModule] = useState<string>("");
    const [mongoId, setMongoId] = useState<string>("");

    const permissionKeyMap: Record<string, Record<string, string>> = {
        "User": {
            "View": "view_user",
            "Create": "create_user",
            "Update": "update_user",
            "Delete": "delete_user"
        },
        "Manage Code": {
            "View": "view_code",
            "Create": "create_code",
            "Update": "update_code",
            "Delete": "delete_code"
        },
        "Manage Department": {
            "View": "view_department",
            "Create": "create_department",
            "Update": "update_department",
            "Delete": "delete_department"
        },
        "Contact": {
            "View": "view_contact",
            "Create": "create_contact",
            "Update": "update_contact",
            "Delete": "delete_contact"
        },
        "FAQ": {
            "View": "view_faq",
            "Create": "create_faq",
            "Update": "update_faq",
            "Delete": "delete_faq"
        },
        "MTR": {
            "View": "view_mtr",
            "Create": "create_mtr",
            "Update": "update_mtr",
            "Delete": "delete_mtr"
        },
        "Log": {
            "View": "view_log",
            "Create": "create_log",
            "Update": "update_log",
            "Delete": "delete_log"
        },
        "Category": {
            "View": "view_category",
            "Create": "create_category",
            "Update": "update_category",
            "Delete": "delete_category"
        },
        "Sub-Category": {
            "View": "view_subcategory",
            "Create": "create_subcategory",
            "Update": "update_subcategory",
            "Delete": "delete_subcategory"
        },
        "Product": {
            "View": "view_product",
            "Create": "create_product",
            "Update": "update_product",
            "Delete": "delete_product"
        },
        "Procedure": {
            "View": "view_procedure",
            "Create": "create_procedure",
            "Update": "update_procedure",
            "Delete": "delete_procedure",
            "Verify Delivery": "verify_delivery_procedure",
            "Verify Arrival": "verify_arrival_procedure",
            "Double Check": "double_check_procedure"
        },
        "Stock": {
            "View": "view_stock",
            "Create": "create_stock",
            "Update": "update_stock",
            "Delete": "delete_stock"
        },
        "Quantity": {
            "View": "view_product_quantity",
            "Update": "update_product_quantity"
        },
        "Stock Statistic": {
            "View": "view_stocks_statistic",
            "Create": "create_stocks_statistic"
        },
        "Price Share": {
            "View": "view_product_price_share"
        },
        "Item for Sale": {
            "View": "view_product_items_for_sale"
        },
         "View Stock": {
            "View": "view_product_view_stock"
        },
        "Title": {
            "View": "view_title",
            "Create": "create_title",
            "Update": "update_title",
            "Delete": "delete_title"
        },
        "Quote": {
            "View": "view_quote",
            "Create": "create_quote",
            "Update": "update_quote",
            "Delete": "delete_quote"
        },
        "Sales Order": {
            "View": "view_sale_order",
            "Create": "create_sale_order",
            "Update": "update_sale_order",
            "Delete": "delete_sale_order"
        },
        "Order Invoice": {
            "View": "view_order_invoice",
            "Create": "create_order_invoice",
            "Update": "update_order_invoice",
            "Delete": "delete_order_invoice"
        },
        "Sales Order Statistics": {
            "View": "view_order_statistic"
        },
        "Sales Profit By PN": {
            "View": "view_sale_profit"
        }
    };

    const getDefaultTabs = () => {
        return Object.keys(permissionKeyMap).map(tabName => {
            const functions = Object.entries(permissionKeyMap[tabName]).map(([funcName, permissionKey]) => ({
                tab_functionName: funcName,
                is_showFunction: false,
                permissionKey: permissionKey
            }));

            return {
                tab_name: tabName,
                is_show: false,
                tab_function: functions
            };
        });
    };

    const moduleTabMap: Record<string, string[]> = {
        "1": [
            "Category",
            "Sub-Category",
            "Product",
            "Stock",
            "Procedure",
            "Quantity",
            "Stock Statistic",
            "Price Share",
            "Item for Sale",
            "View Stock",
        ],
        "2": [
            "Title",
            "Quote",
            "Sales Order",
            "Order Invoice",
            "Sales Order Statistics",
            "Sales Profit By PN"
        ],
        "3": [
            "Contact",
            "Log",
            "MTR",
            "FAQ",
            "User",
            "Manage Code",
            "Manage Department",
        ]
    };

    const mergeTabs = (fetchedTabs: any[]) => {
        const defaultTabs = getDefaultTabs();
        return defaultTabs.map(defaultTab => {
            const found = fetchedTabs.find(t => t.tab_name === defaultTab.tab_name);
            if (found) {
                const mergedFunctions = defaultTab.tab_function.map(defFunc => {
                    const foundFunc = found.tab_function?.find((f: any) =>
                        f.tab_functionName === defFunc.tab_functionName ||
                        f.permissionKey === defFunc.permissionKey
                    );
                    return foundFunc
                        ? { ...defFunc, is_showFunction: foundFunc.is_showFunction }
                        : defFunc;
                });

                // Always set is_show based on child permissions
                // const hasAnyPermission = mergedFunctions.some((f: any) => f.is_showFunction);

                return {
                    ...defaultTab,
                    is_show: mergedFunctions.some((f: any) => f.is_showFunction),
                    tab_function: mergedFunctions,
                };
            }
            return defaultTab;
        });
    };


    const [access, setAccess] = useState({
        permission_tab: getDefaultTabs(),
    });

    const filteredTabs = selectedModule
        ? moduleTabMap[selectedModule].map(tabName => {
            return access.permission_tab.find(tab => tab.tab_name === tabName);
        }).filter(tab => tab !== undefined)
        : access.permission_tab;

    const handleCheckbox = (value: boolean, key: string) => {
        let filterData = access.permission_tab.map((res) => {
            if (res.tab_name === key) {
                return {
                    ...res,
                    is_show: value,
                    tab_function: res.tab_function.map((e) => ({
                        ...e,
                        is_showFunction: value,
                    })),
                };
            }
            return res;
        });
        setAccess({ ...access, permission_tab: filterData });
    };

    const handleCheckboxChild = (value: boolean, key: string, child: string) => {
        let filterData = access.permission_tab.map((res) => {
            if (res.tab_name === key) {
                const updatedFunctions = res.tab_function.map((e) => ({
                    ...e,
                    is_showFunction: e.tab_functionName === child ? value : e.is_showFunction,
                }));

                return {
                    ...res,
                    tab_function: updatedFunctions,
                    is_show: updatedFunctions.some((item) => item.is_showFunction),
                };
            }
            return res;
        });
        setAccess({ ...access, permission_tab: filterData });
    };

    const handleUpdate = async () => {
        try {
            setLoader(true);
            setErrorMessage(null);

            const permissionData = {
                permission_tab: access.permission_tab.map(tab => ({
                    ...tab,
                    is_show: tab.tab_function.some(func => func.is_showFunction), 
                    tab_function: tab.tab_function.map(func => ({
                        tab_functionName: func.tab_functionName,
                        is_showFunction: func.is_showFunction,
                        permissionKey: func.permissionKey,
                    })),
                })),
            };

            await updatePermission(mongoId, permissionData);

            toast.success("Role updated successfully!", {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });

            navigate("/roleManagement");
        } catch (error: unknown) {
            let message = "Failed to update role. Please try again.";

            if (error && typeof error === "object") {
                if ("response" in error) {
                    const axiosError = error as { response?: { data?: { message?: string } } };
                    if (axiosError.response?.data?.message) {
                        message = axiosError.response.data.message;
                    }
                } else if ("message" in error) {
                    message = (error as Error).message;
                }
            }

            setErrorMessage(message);
            toast.error(message, {
                position: "top-right",
                autoClose: 3000,
                style: { zIndex: 9999999999, marginTop: "4rem" },
            });
        } finally {
            setLoader(false);
        }
    };


    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const res = await getPermissionByRole({ role: roleName });
                let _id = "";
                if (res.data && res.data._id) {
                    _id = res.data._id;
                } else if (res.data && res.data.data && res.data.data._id) {
                    _id = res.data.data._id;
                }
                setMongoId(_id);

                const findPermissionTabs = (data: any): any[] | null => {
                    if (!data) return null;
                    if (data.permission_tab && Array.isArray(data.permission_tab)) {
                        return data.permission_tab;
                    }
                    if (data.data) {
                        if (data.data.permission_tab && Array.isArray(data.data.permission_tab)) {
                            return data.data.permission_tab;
                        }
                        if (Array.isArray(data.data) && data.data.length > 0) {
                            const firstItem = data.data[0];
                            if (firstItem && firstItem.permission_tab && Array.isArray(firstItem.permission_tab)) {
                                return firstItem.permission_tab;
                            }
                        }
                    }
                    if (Array.isArray(data) && data.length > 0) {
                        const firstItem = data[0];
                        if (firstItem && firstItem.permission_tab && Array.isArray(firstItem.permission_tab)) {
                            return firstItem.permission_tab;
                        }
                    }
                    for (const key in data) {
                        if (data[key] && typeof data[key] === 'object') {
                            const nestedResult = findPermissionTabs(data[key]);
                            if (nestedResult) return nestedResult;
                        }
                    }
                    return null;
                };
                const permissionTabs = findPermissionTabs(res.data);
                if (permissionTabs && permissionTabs.length > 0) {
                    setAccess(prev => ({
                        ...prev,
                        permission_tab: mergeTabs(permissionTabs)
                    }));
                } else {
                    setAccess(prev => ({
                        ...prev,
                        permission_tab: getDefaultTabs()
                    }));
                }
            } catch (error) {
                setErrorMessage("Failed to fetch permissions for the role.");
            }
        };
        fetchPermissions();
    }, [roleName]);

    return (
        <div>
            <div className="p-6 max-w-4xl">
                <h1 className="text-2xl font-bold text-left mb-6">
                    Assign Permissions
                </h1>
                <div className="flex items-center gap-6 mb-8">
                    <div>
                        <label className="block font-semibold mb-1">Role Name</label>
                        <input
                            type="text"
                            className="bg-gray-100 border rounded px-3 py-2 w-48"
                            value={roleName}
                            placeholder="Enter role name"
                            disabled
                        />
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">Module</label>
                        <select
                            className="border rounded px-3 py-2 w-48"
                            value={selectedModule}
                            onChange={e => setSelectedModule(e.target.value)}
                        >
                            <option value="">Select...</option>
                            <option value="1">Product</option>
                            <option value="2">Manage Sales</option>
                            <option value="3">Others</option>
                        </select>
                    </div>
                </div>

                {selectedModule ? (
                    filteredTabs.map((tab, index) => (
                        <div key={index} className="mb-6 border rounded-lg p-4 bg-white">
                            <div className="flex justify-between items-center border-b pb-2 mb-4">
                                <span className="text-lg font-semibold">{tab.tab_name}</span>
                                {/* <div className="flex justify-center w-1/4">
                                    <input
                                        type="checkbox"
                                        checked={tab.is_show}
                                        onChange={(e) => handleCheckbox(e.target.checked, tab.tab_name)}
                                        className="w-5 h-5"
                                    />
                                </div> */}
                            </div>
                            <div className="space-y-3">
                                {tab.tab_function.map((func, idx) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <div>
                                            <span>{func.tab_functionName}</span>
                                            {/* <div className="text-xs text-gray-500">{func.permissionKey}</div> */}
                                        </div>
                                        <div className="flex justify-center w-1/4">
                                            <input
                                                type="checkbox"
                                                checked={func.is_showFunction}
                                                onChange={(e) =>
                                                    handleCheckboxChild(e.target.checked, tab.tab_name, func.tab_functionName)
                                                }
                                                className="w-5 h-5"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        Please select a module to view permissions
                    </div>
                )}

                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        className="px-4 py-2 text-gray rounded hover:bg-gray-500"
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={handleUpdate}
                        disabled={loader}
                    >
                        {loader ? "Updating..." : "Update"}
                    </button>
                </div>
                <button
                    className="mb-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>
                {successMessage && (
                    <div className="text-green-600 mt-4">{successMessage}</div>
                )}
                {errorMessage && (
                    <div className="text-red-600 mt-4">{errorMessage}</div>
                )}
            </div>
        </div>
    );
};

export default UpdateAccess;