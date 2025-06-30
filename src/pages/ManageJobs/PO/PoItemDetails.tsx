import React, { useState } from 'react';
import ComponentCard from '../../../components/common/ComponentCard';
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { useNavigate } from 'react-router';
import { Modal, IconButton } from "@mui/material";
import { CloseIcon } from "../../../icons";
import Select, { SingleValue } from "react-select";
// import { Grid } from '@mui/material'


interface OrderedProduct {
    model: string;
    pn: string;
    size: string;
    qtyInProcessing: string;
    location: string;
    ordered: string;
    unitPrice: string;
    totalPrice: string;
    action: string;
}

const orderedProductData: OrderedProduct[] = [
    { model: "", pn: "", size: "", qtyInProcessing: "", location: "", ordered: "", unitPrice: "", totalPrice: "", action: "", },
];



interface Option {
    value: string;
    label: string;
}


const categoryOptions: Option[] = [
    { value: "Production Equipement", label: "Production Equipement" },
    { value: "Production tools", label: "Production tools" },
    { value: "production machine", label: "production machine" },
    { value: "productive material", label: "productive mapyrt" },
    { value: "kiuy", label: "kiuy" },
    { value: "spyrt", label: "spyrt" }
];


export const PoItemDetails: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm] = useState("");
    const filteredItems = orderedProductData.filter((item) =>
        item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.pn.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    // const handleSubmit = () => {
    //     alert("form submitted");
    //     handleClose();
    // }

const [formData, setFormData] = useState({
        category: null as Option | null,
        subcategory: null as Option | null,
        location: null as Option | null,
        size: null as Option | null,
        pressure: null as Option | null,
        model:"",
        pn:"",
    });


const handleChange = (name: keyof typeof formData, value: string | boolean | Option | null) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form Data:", formData);
    };


    return (
        <div className=" p-4 ">

            <div className="relative w-full">
                <button className="absolute bg-blue-500 w-full max-w-[140px] h-9 p-2 text-white mt-4 rounded flex items-center  right-6" onClick={() => navigate("/po")}>Back to last page</button>
            </div>

            <ComponentCard title="Po items Detail">
                <Table>
                    <TableHeader className=" border-b border-gray-100 dark:border-white/[0.05]  ">
                        <TableRow>
                            <TableCell isHeader className=" px-5 py-3 font-medium text-gray-500 text-start ">SO Number</TableCell>
                            <TableCell className=" px-5 py-3  text-gray-600 text-start ">Iby Invoice 2025</TableCell>
                            <TableCell className=" px-5 py-3  text-gray-600 text-start ">Customer PO#</TableCell>
                            <TableCell className=" px-5 py-3  text-gray-600 text-start ">Upload all IBY Invoices here</TableCell>

                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.5]">
                        <TableRow>
                            <TableCell isHeader className=" px-5 py-3 font-medium text-gray-500 text-start">Order Date</TableCell>
                            <TableCell className=" px-5 py-3  text-gray-600 text-start ">01/20/2025</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </ComponentCard>
            <div className="relative w-full mt-2">
                <button className="absolute bg-blue-500 w-full max-w-[200px] h-8 p-2 text-white mt-4 rounded flex items-center  right-6" onClick={handleOpen}>Select Ordered Product</button>
            </div>

            <ComponentCard title="" className="mt-4">
                <div style={{overflow:"auto"}}>
                <Table>
                    <TableHeader className=" border-b border-gray-100 dark:border-white/[0.05]  ">
                        <TableRow>
                            <TableCell isHeader className=" px-5 py-3 font-medium text-gray-500 text-start ">Model</TableCell>
                            <TableCell isHeader className=" px-5 py-3 font-medium text-gray-500 text-start ">P/N</TableCell>
                            <TableCell isHeader className=" px-5 py-3 font-medium text-gray-500 text-start ">Size</TableCell>
                            <TableCell isHeader className=" px-5 py-3 font-medium text-gray-500 text-start ">Qty In Processing</TableCell>
                            <TableCell isHeader className=" px-5 py-3 font-medium text-gray-500 text-start ">Location</TableCell>
                            <TableCell isHeader className=" px-5 py-3 font-medium text-gray-500 text-start ">Ordered</TableCell>
                            <TableCell isHeader className=" px-5 py-3 font-medium text-gray-500 text-start ">Unit Price</TableCell>
                            <TableCell isHeader className=" px-5 py-3 font-medium text-gray-500 text-start ">Total Price</TableCell>
                            <TableCell isHeader className=" px-5 py-3 font-medium text-gray-500 text-start ">Action</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.5]">
                        {filteredItems.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell className=" px-4 py-3  text-gray-500 text-start">{item.model}</TableCell>
                                <TableCell className=" px-4 py-3  text-gray-600 text-start ">{item.pn}</TableCell>
                                <TableCell className=" px-4 py-3  text-gray-500 text-start">{item.size}</TableCell>
                                <TableCell className=" px-4 py-3  text-gray-600 text-start ">{item.qtyInProcessing}</TableCell>
                                <TableCell className=" px-4 py-3  text-gray-500 text-start">{item.location}</TableCell>
                                <TableCell className=" px-4 py-3  text-gray-600 text-start ">{item.ordered}</TableCell>
                                <TableCell className=" px-4 py-3  text-gray-500 text-start">{item.unitPrice}</TableCell>
                                <TableCell className=" px-4 py-3  text-gray-600 text-start ">{item.totalPrice}</TableCell>
                                <TableCell className=" px-4 py-3  text-gray-500 text-start">{item.action}</TableCell>

                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                </div>
            </ComponentCard>

            {/* <Grid container spacing={1}>
                <Grid size={{sm:8}}> */}
           <Modal
  open={open}
  onClose={handleClose}
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <div className="bg-white border-2 border-gray-600 rounded-lg shadow-lg p-4 sm:p-6 w-[95%] sm:w-[95%] md:w-[700px] lg:w-[900px] max-h-screen overflow-y-auto absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
    <IconButton
      onClick={handleClose}
      className="!absolute !top-2 !right-2"
      size="small"
      aria-label="close"
    >
      <CloseIcon />
    </IconButton>

    <h2 id="modal-title" className="text-xl font-semibold text-gray-500 mb-6 mt-0">
      Select Shipped Products
    </h2>

    <form
      id="modal-description"
      onSubmit={handleSubmit}
      className="space-y-4 bg-white rounded-lg"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="font-medium mb-3 text-gray-500">Category<span className="text-red-500">*</span></label>
          <Select
            options={categoryOptions}
            value={formData.category}
            onChange={(selected: SingleValue<Option>) => handleChange("category", selected)}
          />
        </div>
        <div>
          <label className="font-medium mb-3 text-gray-500">Sub Category<span className="text-red-500">*</span></label>
          <Select
            options={categoryOptions}
            value={formData.subcategory}
            onChange={(selected: SingleValue<Option>) => handleChange("subcategory", selected)}
          />
        </div>
        <div>
          <label className="font-medium mb-3 text-gray-500">Location<span className="text-red-500">*</span></label>
          <Select
            options={categoryOptions}
            value={formData.location}
            onChange={(selected: SingleValue<Option>) => handleChange("location", selected)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="font-medium mb-2 text-gray-500">Model<span className="text-red-500">*</span></label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={formData.model}
            onChange={(e) => handleChange("model", e.target.value)}
          />
        </div>
        <div>
          <label className="font-medium mb-2 text-gray-500">PN<span className="text-red-500">*</span></label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={formData.pn}
            onChange={(e) => handleChange("pn", e.target.value)}
          />
        </div>
        <div>
          <label className="font-medium mb-3 text-gray-500">Sub Category<span className="text-red-500">*</span></label>
          <Select
            options={categoryOptions}
            value={formData.subcategory}
            onChange={(selected: SingleValue<Option>) => handleChange("subcategory", selected)}
          />
        </div>
        <div>
          <label className="font-medium mb-3 text-gray-500">Location<span className="text-red-500">*</span></label>
          <Select
            options={categoryOptions}
            value={formData.location}
            onChange={(selected: SingleValue<Option>) => handleChange("location", selected)}
          />
        </div>
      </div>
    </form>

    <ComponentCard title="" className="h-80 mt-6">
      <div className="overflow-auto">
        <Table>
          <TableHeader className="border-b border-gray-100">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Select</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Model</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">PN</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Size</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Description</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Location</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">Qty In Stock</TableCell>
            </TableRow>
          </TableHeader>
        </Table>
      </div>
    </ComponentCard>
  </div>
</Modal>

            {/* </Grid>
            </Grid> */}
        </div>
    );
}