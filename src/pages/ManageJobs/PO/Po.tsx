import { useEffect, useState } from "react";
import Select from "react-select";
import Button from "../../../components/ui/button/Button";
import { Grid, Pagination, Stack } from "@mui/material";
import { useNavigate } from "react-router";
import ComponentCard from "../../../components/common/ComponentCard";
import { Box, Modal, IconButton } from "@mui/material";
import { CloseIcon } from "../../../icons";
import Label from "../../../components/form/Label";
import { useForm, Controller } from "react-hook-form";
import { DragAndDropInput } from "../../../components/form/form-elements/DragAndDrop";
import { deletePo, getAllPO, getAllUsers } from "../../../services/apis";

interface POData {
  soNo: string;
  description: string;
  customerPo: string;
  billTo: string | null;
  shipTo: string;
  // ... other fields
}
export const Po = () => {
  const [poData, setPoData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const navigate = useNavigate();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectValue, setSelectValue] = useState(null);
  const [searchInProcesses, setSearchInProcesses] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const { control } = useForm();
  const [openToOptions, setOpenToOptions] = useState<Option[]>([]);
  const [selectedPoId, setSelectedPoId] = useState<string | number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const customStyles = {
    control: (base: any) => ({
      ...base,
      height: 44,
      borderRadius: 8,
      borderColor: '#e5e7eb',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      paddingLeft: '10px',
    }),
    singleValue: (base: any) => ({
      ...base,
      color: '#1f2937',
    }),
  };
  useEffect(() => {
    fetchAllPo();
  }, [searchTerm, currentPage]);


  const fetchOpenTo = async () => {
    try {
      const res = await getAllUsers();
      if (res?.data?.data) {
        const options = res.data.data.map((user: any) => ({
          value: user.id,
          label: user.name,
        }));
        setOpenToOptions(options);
      }
    } catch (error) {
      console.error("Failed to fetch open to options", error);
    }
  };
  useEffect(() => {
    fetchOpenTo();
  }, [])
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  const getUserName = (userId: string) => {
    const user = openToOptions.find(u => u.value === userId);
    return user ? user.label : 'Unknown';
  };
  const handleDelete = async (poId: string | number) => {
    try {
      setLoading(true);
      await deletePo(poId);
      setIsDeleteModalOpen(false);
      await fetchAllPo();
    } catch (error) {
      console.error('Error deleting PO:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchAllPo = async () => {
    try {
      setLoading(true);
      const response = await getAllPO({
        search: searchTerm,
        userId: selectValue?.value,
        page: currentPage,
        limit: itemsPerPage,
      });

      console.log('Full API Response:', response);
      console.log('Response Data:', response.data);
      console.log('Response Data Data:', response.data.data);
      console.log('Response Data Data data:', response.data.data.data);
      console.log('First Item:', response.data.data.data[0]);
      if (response.data && response.data.data.data) {
        const mappedData = response.data.data.data.map(item => ({
          _id: item._id, 
          id: item.id,
          soNo: item.so_number || 'N/A',
          description: item.description || 'N/A',
          customerPo: item.customer_po || 'N/A',
          billTo: item.bill_to || 'N/A',
          shipTo: item.shipToData?.company_name || item.ship_to || 'N/A',
          orderDate: item.order_date ? formatDate(item.order_date) : 'N/A',
          reqDeliveryDate: item.delivery_date ? formatDate(item.delivery_date) : 'N/A',
          shipDate: item.ship_date ? formatDate(item.ship_date) : 'N/A',
          arriveDate: item.arrival_date ? formatDate(item.arrival_date) : 'N/A',
          invoiceDate: item.invoice_date ? formatDate(item.invoice_date) : 'N/A',
          dueDate: item.due_date ? formatDate(item.due_date) : 'N/A',
          recPaymentDate: item.receivable_date ? formatDate(item.receivable_date) : 'N/A',
          fileName: item.file || 'No file',
          author: item.user_id ? getUserName(item.user_id) : 'Unknown',
          process: item.processInfo || [],
          addDate: item.created_at ? formatDate(item.created_at) : 'N/A'
        }));

        setPoData(mappedData);
        setTotalCount(response.data.total || 0);
        console.log(mappedData)
      } else {
        setPoData([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch POs:", error);
      setPoData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };
  const toggleCard = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };
  useEffect(() => {
    console.log('Current PO Data:', poData); // Debug what's in state
    console.log('Total Count:', totalCount);
  }, [poData, totalCount]);
  const handleReset = () => {
    setSearchTerm("");
    setSelectValue(null);
    setSearchInProcesses(false);
    setCurrentPage(1);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSubmit = () => {
    alert("form submitted");
    handleClose();
  };

  const handleOpen2 = () => setOpen2(true);
  const handleClose2 = () => setOpen2(false);
  const handleSubmit2 = () => {
    alert("form submitted");
    handleClose2();
  };

  // const filteredProducts = poData?.filter((product) => {
  //   const term = searchTerm.toLowerCase();
  //   return (
  //     product.soNo.toLowerCase().includes(term) ||
  //     product.description.toLowerCase().includes(term) ||
  //     product.customerPo.toLowerCase().includes(term) ||
  //     product.billTo.toLowerCase().includes(term) ||
  //     product.process.toLowerCase().includes(term)
  //   );
  // });

  // const indexOfLastItem = currentPage * itemsPerPage;
  // const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // const currentItems = filteredProducts?.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setLoading(true);
    setTimeout(() => {
      setCurrentPage(page);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="py-3 ">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white/90">
        PO
      </h2>

      <Grid container spacing={2} className="items-center mb-5  ">
        <Grid size={{ lg: 4, md: 6, sm: 6 }}>
          <input
            type="text"
            placeholder="Search... "
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 w-full  rounded-lg border  bg-white border-gray-200 dark:border-gray-800 dark:bg-white/[0.03] text-gray-800 dark:text-white/90 px-4 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
          />
        </Grid>

        <Grid size={{ lg: 3, md: 6, sm: 6 }}>
          <Select
            styles={customStyles}
            options={openToOptions}
            value={selectValue}
            onChange={(value) => setSelectValue(value)}
            isClearable
            placeholder="Select user..."
          />
        </Grid>
        <Grid size={{ lg: 3, md: 6, sm: 6 }}>
          <div>
            <input
              type="checkbox"
              id="searchProcess"
              checked={searchInProcesses}
              onChange={(e) => setSearchInProcesses(e.target.checked)}
            />
            <label htmlFor="searchProcess" className="text-gray-500">
              {" "}
              Search in Processes
            </label>
          </div>
        </Grid>
        <Grid size={{ lg: 2, md: 6, sm: 6 }} className="justify-end flex">
          <Button
            size="md"
            variant="primary"
            className="ml-4"
            onClick={handleReset}
          >
            Reset
          </Button>
        </Grid>
      </Grid>
      <div
        className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] 
             items-center flex p-2 justify-between mb-5 item"
      >
        <h2 className="inline-block text-xl font-semibold dark:text-white/90 ml-4">
          PO List
        </h2>
        <Button
          size="sm"
          variant="primary"
          className="ml-4"
          onClick={() => navigate(`/po/add`)}
        >
          <span className="text-xl">+ Add</span>
        </Button>
      </div>

      {/* PO listing */}
      <div className="relative w-full">
        {poData?.map((data, index) => (
          <div
            key={index}
            className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] mb-6 overflow-x-auto"
          >
            <div className="border-gray-100 dark:border-gray-800 p-6">
              <div className="grid grid-cols-9 grid-rows-5 gap-2 p-4 text-sm items-center">

                {/* Column 1 */}
                <div className="row-span-1 text-gray-500 p-2">SO Number</div>
                <div className="row-span-2 col-start-1 row-start-2 text-gray-800 dark:text-white/90 p-2">
                  IBY Invoices 2025
                </div>
                <div
                  className="col-start-1 row-start-4 text-blue-500 cursor-pointer p-2"
                  onClick={() => toggleCard(index)}
                >
                  {expandedIndex === index ? "Hide Process" : "View Process"}
                </div>

                {/* Column 2 */}
                <div className="col-start-2 row-start-1 text-gray-500 p-2">Description</div>
                <div className="col-start-2 row-start-2 row-span-4 text-gray-800 dark:text-white/90 p-2">
                  Upload all IBY PO documents
                </div>

                {/* Column 3 - Labels */}
                <div className="col-start-3 row-start-1 text-gray-500 p-2">Customer PO#</div>
                <div className="col-start-3 row-start-3 text-gray-500 p-2">Request Delivery Date</div>
                <div className="col-start-3 row-start-4 text-gray-500 p-2">Add Date</div>
                <div className="col-start-3 row-start-5 text-gray-500 p-2">File Name</div>

                {/* Row 2 - Ship To spanning columns 3-8 */}
                <div className="col-span-6 col-start-3 row-start-2 grid grid-cols-6 gap-2">
                  <div className="col-span-1 text-gray-500 p-2">Ship To</div>
                  <div className="col-span-2 text-gray-800 dark:text-white/90 p-2">
                    BlackGold Equipment LLC
                  </div>
                  <div className="col-span-1 text-gray-500 p-2">Bill To</div>
                  <div className="col-span-2 text-gray-800 dark:text-white/90 p-2">
                    BlackGold Equipment LLC
                  </div>
                </div>

                {/* Column 4 - Customer Data */}
                <div className="col-start-4 row-start-1 text-gray-800 dark:text-white/90 p-2">
                  Upload all IBY invoices here
                </div>
                <div className="col-start-4 row-start-3 text-gray-800 dark:text-white/90 p-2"></div>
                <div className="col-start-4 row-start-4 text-gray-800 dark:text-white/90 p-2">
                  2025-01-27 08:16 AM
                </div>
                <div className="col-start-4 row-start-5 text-gray-800 dark:text-white/90 p-2"></div>

                {/* Column 5 - Order Labels */}
                <div className="col-start-5 row-start-1 text-gray-500 p-2">Order Date</div>
                <div className="col-start-5 row-start-4 text-gray-500 p-2">Ship Date</div>
                <div className="col-start-5 row-start-5 text-gray-500 p-2">Author</div>

                {/* Column 6 - Order Data */}
                <div className="col-start-6 row-start-1 text-gray-800 dark:text-white/90 p-2">
                  2025-01-27 12:00 AM
                </div>
                <div className="col-start-6 row-start-3 text-gray-500 p-2">Invoice Date</div>
                <div className="col-start-6 row-start-4 text-gray-800 dark:text-white/90 p-2">
                  2025-01-20 12:00 AM
                </div>
                <div className="col-start-6 row-start-5 text-gray-800 dark:text-white/90 p-2"></div>

                {/* Column 7 - Delivery Labels */}
                <div className="col-start-7 row-start-1 text-gray-500 p-2">Arrive Date</div>
                <div className="col-start-7 row-start-4 text-gray-500 p-2">Due Date</div>
                <div className="col-start-7 row-start-5 text-gray-500 p-2">Received Payment Date</div>

                {/* Column 8 - Delivery Data */}
                <div className="col-start-8 row-start-1 text-gray-800 dark:text-white/90 p-2">
                  2025-01-24 12:00 AM
                </div>
                <div className="col-start-8 row-start-3 text-gray-800 dark:text-white/90 p-2">
                  2025-01-15 12:00 AM
                </div>
                <div className="col-start-8 row-start-4 text-gray-800 dark:text-white/90 p-2">
                  2025-01-22 12:00 AM
                </div>
                <div className="col-start-8 row-start-5 text-gray-800 dark:text-white/90 p-2">
                  2025-01-25 12:00 AM
                </div>

                {/* Column 9 - Actions */}
                <div
                  className="col-start-9 row-start-1 text-blue-500 p-2 hover:underline cursor-pointer"
                  onClick={() => navigate("/po/addProcess")}
                >
                  Add Process
                </div>
                <div className="col-start-9 row-start-2 space-y-2">
                  <div
                    className="text-blue-500 hover:underline cursor-pointer"
                    onClick={() => navigate("/po/itemDetails")}
                  >
                    Item Details
                  </div>
                  <div
                    className="text-blue-500 hover:underline cursor-pointer"
                    onClick={handleOpen2}
                  >
                    View Invoice File
                  </div>
                  <div
                    className="text-blue-500 hover:underline cursor-pointer"
                    onClick={handleOpen}
                  >
                    Upload PO
                  </div>
                </div>
                <div className="col-start-9 row-start-3 space-y-2">
                  <div
                    className="text-blue-500 hover:underline cursor-pointer"
                    onClick={() => alert("Are you sure you want to change status of this PO.")}
                  >
                    Close
                  </div>
                  <div
                    className="cursor-pointer hover:underline text-red-500"
                    onClick={() => {
                      setSelectedPoId(data.id);
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    Delete
                  </div>
                  <div
                    className="text-blue-500 hover:underline cursor-pointer"
                    onClick={() => navigate(`/po/edit/${data._id}`)}
                  >
                    Edit
                  </div>
                </div>
              </div>
            </div>
            {expandedIndex === index && (
              <ComponentCard title="Process List" className=" rounded-t-none ">
                <div className="grid grid-cols-9 grid-rows-4 gap-2 p-4 text-sm items-center space-y-6">
                  <div className="row-span-2 col-start-1 row-start-1 text-gray-500 p-2 ">
                    Process
                    <span className="block text-gray-900">
                      This is testing #2
                    </span>
                  </div>
                  <div className="row-span-2 col-start-1 row-start-3 text-gray-500 p-2">
                    Process
                    <span className="block text-gray-900">
                      This is testing{" "}
                    </span>
                  </div>

                  <div className="row-span-2 col-start-2 row-start-1 text-gray-800 dark:text-white/90 p-2">
                    {data.process}
                  </div>
                  <div className="row-span-2 col-start-2 row-start-3 text-gray-800 dark:text-white/90 p-2">
                    {data.process}
                  </div>

                  <div className="row-span-2 col-start-3 row-start-1 text-gray-500 p-2">
                    Author
                  </div>
                  <div className="row-span-2 col-start-3 row-start-3 text-gray-500 p-2">
                    Author
                  </div>

                  <div className="row-span-2 col-start-4 row-start-1 text-gray-800 dark:text-white/90 p-2">
                    {data.author}
                  </div>
                  <div className="row-span-2 col-start-4 row-start-3 text-gray-800 dark:text-white/90 p-2">
                    {data.author}
                  </div>

                  <div className="row-span-2 col-start-5 row-start-1 text-gray-500 p-2">
                    Date
                  </div>
                  <div className="row-span-2 col-start-5 row-start-3 text-gray-500 p-2">
                    Date
                  </div>

                  <div className="row-span-2 col-start-6 row-start-1 text-gray-800 dark:text-white/90 p-2">
                    {data.addDate}
                  </div>
                  <div className="row-span-2 col-start-6 row-start-3 text-gray-800 dark:text-white/90 p-2">
                    {data.addDate}
                  </div>

                  <div className="row-span-2 col-start-7 row-start-1 text-gray-500 p-2">
                    File
                  </div>
                  <div className="row-span-2 col-start-7 row-start-3 text-gray-500 p-2">
                    File
                  </div>

                  <div className="row-span-2 col-start-8 row-start-1 text-gray-800 dark:text-white/90 p-2">
                    {data.fileName}
                  </div>
                  <div className="row-span-2 col-start-8 row-start-3 text-gray-800 dark:text-white/90 p-2">
                    {data.fileName}
                  </div>

                  <div className="row-span-2 col-start-9 row-start-1 text-blue-500 p-2 flex space-x-3 ">
                    <div
                      className="cursor-pointer hover:underline "
                      onClick={() => navigate(`/po/editProcess`)}
                    >
                      Edit
                    </div>

                    <div
                      className="text-blue-500 hover:underline cursor-pointer"
                      onClick={() => {
                        setSelectedPoId(data.id); // Set the ID of the PO to be deleted
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      Delete
                    </div>
                  </div>
                  <div className="row-span-2 col-start-9 row-start-3 text-blue-500 p-2 flex space-x-3">
                    <div
                      className="cursor-pointer hover:underline "
                      onClick={() => navigate(`/po/editProcess/${data._id}`)}
                    >
                      Edit
                      <div
                        className="text-blue-500 hover:underline cursor-pointer"
                        onClick={() => {
                          setSelectedPoId(data.id); // Set the ID of the PO to be deleted
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        Delete
                      </div>
                    </div>
                  </div>
                </div>
              </ComponentCard>
            )}
          </div>
        ))}

        {/* Pagination remains the same */}
        <div className="flex flex-wrap justify-between items-center mt-4">
          <span className="text-sm text-gray-800 dark:text-white/90">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} entries
          </span>
          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Stack>
        </div>
      </div>
      {/* PO listing */}

      {/* delete modal  */}
      <Modal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <Box className="fixed inset-0 flex items-center justify-center bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete this PO?</p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md disabled:opacity-50"
                onClick={() => {
                  if (selectedPoId) {
                    handleDelete(selectedPoId);
                  }
                }}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Box>
      </Modal>
      {/* delete modal  */}

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div className="bg-white border-2 border-gray-600 rounded-lg shadow-lg p-4 sm:p-6 w-full sm:w-[90%] md:w-[70%] lg:w-[40%] xl:w-[30%] max-h-screen overflow-y-auto absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <IconButton
            onClick={handleClose}
            className="!absolute !top-2 !right-2"
            size="small"
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>

          {/* Modal Content */}
          <h2
            id="modal-title"
            className="text-xl font-semibold text-gray-500 mb-8"
          >
            Upload Po Vendor
          </h2>
          <form id="modal-description" className="text-gray-600 mb-6">
            <div className="my-3">
              <Label>Upload File</Label>

              <Controller
                name="fileData"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <DragAndDropInput
                    value={value ? value : []}
                    onChange={(newFiles: any) => {
                      onChange(newFiles);
                    }}
                  />
                )}
              />
            </div>
          </form>

          {/* Footer Buttons */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded bg-brand text-white"
            >
              Submit
            </button>
          </div>
        </div>
      </Modal>


      {/* Modal for upload Invoice */}
      <Modal
        open={open2}
        onClose={handleClose2}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div className="bg-white border-2 border-gray-600 rounded-lg shadow-lg p-4 sm:p-6 w-full sm:w-[90%] md:w-[70%] lg:w-[40%] xl:w-[30%] max-h-screen overflow-y-auto absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <IconButton
            onClick={handleClose2}
            className="!absolute !top-2 !right-2"
            size="small"
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>

          {/* Modal Content */}
          <h2
            id="modal-title"
            className="text-xl font-semibold text-gray-500 mb-8"
          >
            Upload Invoice
          </h2>

          <form id="modal-description" className="text-gray-600 mb-6">
            <div className="my-3">
              <Label>Upload File</Label>

              <Controller
                name="fileData"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <DragAndDropInput
                    value={value ? value : []}
                    onChange={(newFiles: any) => {
                      onChange(newFiles);
                    }}
                  />
                )}
              />
            </div>
          </form>

          {/* Footer Buttons */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleClose2}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit2}
              className="px-4 py-2 rounded bg-brand text-white"
            >
              Submit
            </button>
          </div>
        </div>
      </Modal>
      {/* Modal for upload Invoice */}

    </div>
  );
};  