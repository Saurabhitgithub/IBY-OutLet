import Select, { SingleValue } from "react-select";
import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

import {
  addRfqProduct,
  editRfqProduct,
  getAllCategory,
  getAllProductByPageLimit,
  getByIdCategoryAndSubcategory,
  getRfqById,
  getRfqProductById,
} from "../../../services/apis";
import { toast } from "react-toastify";

interface Option {
  value: string;
  label: string;
  user_id: string;
  rfq_id: string;
  product: { label: string; value: number } | null;
  priceQuoted: string;
  quoteWonLost: string;
  resultingSo: string;
  notes: string;
  ourRfq: string;
  customerRfq: string;
  category: { label: string; value: number } | null;
}

interface RfqProductFormData {
  ourRfq: string;
  customerRfq: string;
  category: string;
  product: Option | null;
  priceQuoted: string;
  resultingSo: string;
  quoteWonLost: string;
  notes: string;
  user_id: number;
  rfq_id: number;
  id: number;
}

export const AddRfqProduct: React.FC = () => {
  const [formData, setFormData] = useState<RfqProductFormData>({
    id: 0,
    user_id: 0,
    ourRfq: "",
    customerRfq: "",
    category: "",
    product: null,
    priceQuoted: "",
    resultingSo: "",
    quoteWonLost: "",
    notes: "",
    rfq_id: 0,
    // user_id: req.body.user_id,
    // rfq_id: req.body.rfq_id,
    // product_id: req.body.product_id,
    // price: req.body.price,
    // result: req.body.result,
    // so: req.body.so,
    // notes: req.body.notes,
  });
  //   const { user } = useAuth();

  const [productData, setProductData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);

  const [formErrors, setFormErrors] = useState({
    ourRfq: false,
    customerRfq: false,
    category: false,
    product: false,
    priceQuoted: false,
  });

  const navigate = useNavigate();
  const { rfqId, id } = useParams();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getAllCategory();
      if (res?.data?.data) {
        const options = res.data.data.map((cat: any) => ({
          value: cat.id,
          label: cat.name,
          raw: cat,
        }));
        setCategoryOptions(options);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, [id]);

  // const handleChange = (
  //   name: keyof RfqProductFormData,
  //   value: string | Option | null
  // ) => {
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  //   // Clear error when field is changed
  //   if (formErrors[name as keyof typeof formErrors]) {
  //     setFormErrors((prev) => ({ ...prev, [name]: false }));
  //   }
  // };

  const validateForm = () => {
    const errors = {

      // ourRfq: !formData.ourRfq?.trim(),
      // customerRfq: !formData.customerRfq?.trim(),
      // category: !formData.category?.trim(),
      product: !formData.product,
      priceQuoted: !formData.priceQuoted?.trim(),
    };
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  // const fetchProducts = async () => {
  //   try {
  //     const response = await getAllProductByPageLimit();
  //     const products = response.data?.data || [];
  //     const options = products.map((product: any) => ({
  //       value: product.id.toString(),
  //       label: product.name || `Product ${product.id}`,
  //     }));

  //     setProductData(options);
  //   } catch (error) {
  //     console.error("Error fetching products:", error);
  //     setProductData([]);
  //   }
  // };
  // useEffect(() => {
  //   fetchProducts();
  // }, []);
  const fetchProducts = async () => {
    try {
      const response = await getAllProductByPageLimit();
      const products = response.data?.data?.[0] || [];

      const options = products.map((product: any) => ({
        value: product.id.toString(),
        label: `${product.model} - ${product.parts_no}`, // Customize display here
      }));

      setProductData(options);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProductData([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (field: string, selected: Option | null) => {
    setFormData((prev) => ({ ...prev, [field]: selected }));
    setFormErrors((prev) => ({ ...prev, [field]: !selected }));
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   if (!validateForm()) {
  //     return;
  //   }

  //   try {
  //     const payload = {
  //       user_id: Number(formData.user_id),
  //       rfq_id: Number(formData.rfq_id),
  //       product_id: formData.product?.value || null,
  //       price: Number(formData.priceQuoted),
  //       result: Number(formData.quoteWonLost),
  //       so: formData.resultingSo || "",
  //       notes: formData.notes || "",
  //     };

  //     await addRfqProduct(payload);
  //     navigate("/rfq");
  //   } catch (error) {
  //     console.error("Failed to add RFQ Product:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const payload = {
      //  ...formData,
      user_id: Number(formData.user_id),
      rfq_id: Number(formData.rfq_id),
      product_id: formData.product?.value || null,
      price: Number(formData.priceQuoted),
      result: Number(formData.quoteWonLost),
      so: formData.resultingSo || "",
      notes: formData.notes || "",
      //     ourRfq: formData.ourRfq || "",
      // customerRfq: formData.customerRfq || "",
      // category: formData.category || "",
    };

    try {
      if (formData.id) {
        // Update
        await editRfqProduct(formData.id, payload);
        toast.success("RFQ Product updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      } else {
        // Add
        await addRfqProduct(payload);
        toast.success("RFQ Product added successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { zIndex: 9999999999, marginTop: "4rem" },
        });
      }

      navigate("/rfq");
    } catch (error) {
      console.error("Failed to submit RFQ Product:", error);
    } finally {
      setLoading(false);
    }
  };


  const backInfo = { title: "Rfq", path: "/rfq" };

  useEffect(() => {
    if (rfqId) {
      getRfqById(rfqId).then((response) => {
        const data = response?.data?.data?.[0];
        console.log("rfq data", data);

        if (data) {
          setFormData((prev) => ({
            ...prev,
            user_id: Number(data.user_id) || 0,
            ourRfq: data.rfq || "",
            customerRfq: data.customer_rfq || "",
            category: `${data.categoryData?.[0]?.name || ""} - ${data.subcategoryDataData?.[0]?.name || ""
              }`,

            rfq_id: data.id || 0,

          }));
        }
      });
    }
  }, [rfqId]);

  const productOptions = [
    { value: 21168, label: "4-1/16-5M 4-1/2LCSG Demco Style Mud Gate Valve" },
    { value: 21181, label: "2-1/16" },
    { value: 21182, label: "5x4 5M Mud Valve (gate valve)<" },
    { value: 21183, label: "2-5M BW XXH Mud Valve" },
    { value: 21184, label: "4-5M BW XXH Mud Gate Valve 4130" },
    { value: 21222, label: "2-5M 2LP Mud Valve" },
    { value: 21231, label: "4-1/2 8RD 5000psi Mud Valve Fu" },
    { value: 21235, label: "4-5000psi Mud Valve Threaded" },
    { value: 21236, label: "4-1/2 8RD or LP Mud Valve" },
    { value: 21237, label: "5-1/2 8RD Metal Seat Mud Valve" },
    { value: 21265, label: "4 1-16 3M 4 1-2 LCSG Demco type Mud Valve" },
    { value: 21266, label: "6x4-5M Mud Valve (gate valve)<" },
    { value: 21272, label: "5 1/8 3M Demco Style Mud Gate Valve" },
    { value: 21289, label: "6x4 BW Mud Valve 5000 psi 13Cr" },
    { value: 21305, label: "4-1/16 5000psi Mud Valve R39" },
    { value: 21498, label: "4-3M Union Mud Gate Valve" },
    { value: 21506, label: "4-5M Flange Mud Valve" },
    { value: 21512, label: "4-5M Demco Style Mud Gate Valve" },
    { value: 21513, label: "4-5M Demco Style Mud Gate Valve" },
    { value: 21514, label: "2-5M 2LP Mud Valve" },
    { value: 21515, label: "2-5M Mud Valve LP" },
    { value: 21517, label: "4-1/16-5000 PSI x 4-1/2 LCSG End Connection, DEMCO Style Mud Valve" },
    { value: 21519, label: "4-1/16-3M 4-1/2LCSG  Demco Style Mud Gate Valve" },
    { value: 21520, label: "5 1/8 3M Demco Style Mud Gate Valve" },
    { value: 21526, label: "4 1/16 1M LCSG Mud Gate Valve" },
    { value: 21589, label: "2-1/16 7500psi Mud Gate Valve" },
    { value: 21590, label: "3-1/16 7500psi Mud Gate Valve" },
    { value: 21591, label: "5-1/8 7500psi Mud Gate Valve" },
    { value: 21637, label: "5 1/8 3M Demco Style Mud Gate Valve" },
    { value: 21639, label: "4-3M Demco Style Mud Gate Valve" },
    { value: 21640, label: "4-3M Demco Style Mud Gate Valve" },
    { value: 21716, label: "5-1/8 7500psi Mud Gate Valve Metal Seal Mud Valve" },
    { value: 21717, label: "3-1/16 7500psi Mud Gate Valve, mud valve" },
    { value: 21746, label: "4-5M Flanged Mud Valve  BODY 4130" },
    { value: 21751, label: "4-5M LP Mud gate  Valve DEMCO type MUD VALVE" },
    { value: 21787, label: "4-1M LCSG Mud Gate Valve" },
    { value: 21828, label: "3-5M UNION Mud Gate Valve" },
    { value: 21829, label: "3-3M UNION Mud Gate Valve" },
    { value: 21830, label: "2-5M Union Mud Gate Valve" },
    { value: 21831, label: "4-5M Union Mud Gate Valve" },
    { value: 21833, label: "2-1/16 7500psi Mud Gate Valve, Mud Valve" },
    { value: 21865, label: "2-5M BW XXH mud valve" },
    { value: 21866, label: "4-5M BW XXH Mud Gate Valve A487" },
    { value: 22006, label: "5-5M Mud Gate Valve, XXH" },
    { value: 22055, label: "3-5M LP Mud Gate Valve" },
    { value: 22068, label: "4-5M BW XXH Mud Gate Valve 4130" },
    { value: 22069, label: "5-1/8 7500psi Mud Gate Valve Rubber Seat" },
    { value: 22079, label: "2-5M BW XXH MODEL 72 mud valve, OTECO Style" },
    { value: 22080, label: "4-5M BW XXH Mud Gate Valve,OTECO Style" },
    { value: 22081, label: "3-5M LP Mud Gate Valve,OTECO Style" },
    { value: 22175, label: "4-5M LP Mud gate Valve" },
    { value: 22580, label: "2 1/16 5000PSI flange demco mud valve assy" },
    { value: 22793, label: "4-5M Flanged Mud Valve  BODY 4130" },
    { value: 22801, label: "Flanged mud valve 4-5M A487" },

  ];
  useEffect(() => {
    fetchProducts(); // this sets `productOptions`
  }, []);


  useEffect(() => {
    const fetchAndSetRfqProduct = async () => {
      if (!id || productOptions.length === 0) return;

      try {
        const response = await getRfqProductById(id);
        const data = response?.data?.data;

        if (data) {
          const selectedProduct = productOptions.find(
            (p) => p.value === data.product_id
          );

          setFormData((prev) => ({
            ...prev,
            id: data.id,
            user_id: Number(data.user_id),
            rfq_id: Number(data.rfq_id),
            product: selectedProduct || null,
            priceQuoted: data.price?.toString(),
            quoteWonLost: data.result ?? null,
            resultingSo: data.so || "",
            notes: data.notes || "",
          }));
        }
      } catch (error) {
        console.error("Failed to fetch RFQ product by ID", error);
      }
    };

    fetchAndSetRfqProduct();
  }, [id, productOptions.length]); // ✅ only run when productOptions are loaded


  return (
    <div className="container mx-auto rounded p-6">
      <div>
        <PageBreadcrumb
          pageTitle={id ? "Edit RFQ Product" : "Add RFQ Product"}
          backInfo={backInfo}
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg"
      >
        <h3 className="text-xl text-gray-500 font-semibold mb-3">Details</h3>
        <hr className="border-t border-gray-300 mb-3" />

        {/* Our Rfq# & Customer Rfq */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Our Rfq# <span className="text-red-500">*</span>
            </label>
            <input
              // type="text"
              readOnly
              className={`w-full border p-2 rounded bg-gray-200 border-gray-300 ${formErrors.ourRfq ? "border-red-500" : ""
                }`}
              value={formData.ourRfq}
              onChange={(e) => handleChange("ourRfq", e.target.value)}
            />
            {formErrors.ourRfq && (
              <p className="text-red-500 text-sm mt-1">
                This field is required
              </p>
            )}
          </div>

          <div>
            <label className="font-medium mb-2 text-gray-500">
              Customer Rfq <span className="text-red-500">*</span>
            </label>
            <input
              readOnly
              className={`w-full border p-2 rounded bg-gray-200 border-gray-300 ${formErrors.customerRfq ? "border-red-500" : ""
                }`}
              value={formData.customerRfq}
              onChange={(e) => handleChange("customerRfq", e.target.value)}
            />
            {formErrors.customerRfq && (
              <p className="text-red-500 text-sm mt-1">
                This field is required
              </p>
            )}
          </div>
        </div>

        {/* Category & Product */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Category<span className="text-red-500">*</span>
            </label>
            {/* <Select
              options={categoryOptions}
              value={categoryOptions.find(
                (opt) => opt.value === formData.category
              )}
              onChange={(selected: SingleValue<Option>) =>
                handleChange("category", selected?.value || "")
              }
              className={formErrors.category ? "border-red-500" : ""}
              placeholder="Select category"
            /> */}
            <input
              readOnly
              className={`w-full border p-2 rounded bg-gray-200 border-gray-300 ${formErrors.category ? "border-red-500" : ""
                }`}
              value={formData.category}
              onChange={(e) => handleChange("customerRfq", e.target.value)}
            />
            {formErrors.category && (
              <p className="text-red-500 text-sm mt-1">
                This field is required
              </p>
            )}
          </div>
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Product<span className="text-red-500">*</span>
            </label>

            <Select
              options={productOptions}
              value={formData.product}
              onChange={(selectedOption) =>
                handleChange("product", selectedOption)
              }
              className={
                formErrors.product ? "border border-red-500 rounded" : ""
              }
            />
            {/* <Select
    options={productData}
    
    value={formData.product}
    onChange={(selected) => handleChange("product", selected)}
    className={formErrors.product ? "border-red-500" : ""}
    placeholder="Select Product"
  /> */}
            {formErrors.product && (
              <p className="text-red-500 text-sm mt-1">
                Please select a product
              </p>
            )}
          </div>
        </div>

        {/* Price Quoted & Resulting SO# */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium mb-2 text-gray-500">
              Price Quoted<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full border p-2 rounded ${formErrors.priceQuoted ? "border-red-500" : ""
                }`}
              value={formData.priceQuoted}
              onChange={(e) => handleChange("priceQuoted", e.target.value)}
            />
            {formErrors.priceQuoted && (
              <p className="text-red-500 text-sm mt-1">
                This field is required
              </p>
            )}
          </div>

          <div>
            <label className="font-medium mb-2 text-gray-500">
              Resulting SO#
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={formData.resultingSo}
              onChange={(e) => handleChange("resultingSo", e.target.value)}
            />
          </div>
        </div>

        {/* Quote won/lost */}
        <div className="flex gap-4 items-center">
          <label className="font-medium text-gray-500">Quote Won/Lost</label>

          <label className="flex items-center text-gray-500">
            <input
              type="radio"
              name="quoteWonLost"
              value="1"
              checked={formData.quoteWonLost === 1}
              onChange={(e) =>
                handleChange("quoteWonLost", Number(e.target.value))
              }
              className="mr-2"
            />
            Won
          </label>

          <label className="flex items-center text-gray-500">
            <input
              type="radio"
              name="quoteWonLost"
              value="0"
              checked={formData.quoteWonLost === 0}
              onChange={(e) =>
                handleChange("quoteWonLost", Number(e.target.value))
              }
              className="mr-2"
            />
            Loss
          </label>
        </div>

        {/* Notes */}
        <div>
          <label className="font-medium mb-2 block text-gray-500">Notes</label>
          <textarea
            className="h-32 border p-2 rounded w-full"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
          />
        </div>

        {/* Add & Cancel */}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outlined"
            className="bg-pink-300 hover:bg-pink-400"
            onClick={() => navigate("/rfq")}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {id ? "Update" : "Add Product"}
          </Button>
        </div>
      </form>
    </div>
  );
};
