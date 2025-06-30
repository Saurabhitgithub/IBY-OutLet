import React, { useEffect, useState } from "react";
import Select from "react-select";
import {
  getAllLocation,
  getAllUsers,
  addOrUpdate,
  getInventoryById,
} from "../../services/apis";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router";

interface Option {
  value: string;
  label: string;
}

export const AuthorizeInventory: React.FC = () => {
  const { id, pid } = useParams();
  const navigate = useNavigate();
  const [inventoryLocation, setInventoryLocation] = useState<Option | null>(
    null
  );
  const [openToOptions, setOpenToOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationOptions, setLocationOptions] = useState<Option[]>([]);
  const [statsData, setStatsData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [formErrors, setFormErrors] = useState({
    inventoryLocation: false,
    authShippingUser: false,
    authReceivingUser: false,
    authProducingUser: false,
  });

  const [formData, setFormData] = useState<{
    inventoryLocation: string;
    authShippingUser: Option[];
    authReceivingUser: Option[];
    authProducingUser: Option[];
  }>({
    inventoryLocation: "",
    authShippingUser: [],
    authReceivingUser: [],
    authProducingUser: [],
  });

  const convertIdsToOptions = (
    idsString: string,
    allOptions: Option[]
  ): Option[] => {
    if (!idsString) return [];
    const idsArray = idsString.split(",").map((id) => id.trim());
    return allOptions.filter((option) => idsArray.includes(option.value));
  };

  const fetchAuthorizers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      if (res?.data?.data) {
        const options = res.data.data.map((user: any) => ({
          value: String(user.id),
          label: user.name,
        }));
        setOpenToOptions(options);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Failed to load user data", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await getAllLocation();
      const locations = response.data.data || response.data || [];
      const options = locations.map((location: any) => ({
        value: String(location.id || location._id),
        label: location.name,
      }));
      setLocationOptions(options);
    } catch (error) {
      console.error("Error fetching locations:", error);
      setLocationOptions([]);
      toast.error("Failed to load location data", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    fetchAuthorizers();
    fetchLocations();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await getInventoryById(pid);
      console.log("Raw API response:", res);

    const inventoryData = res.data.data; 
      if (!inventoryData)
        throw new Error("No inventory data found in response");

      console.log("Fetched Inventory Data:", inventoryData);
      setStatsData(inventoryData);

      // Set location
      const selectedLocation = locationOptions.find(
        (option) => String(option.value) === String(inventoryData.location_id)
      );
      console.log("Matched Location Option:", selectedLocation);

      if (selectedLocation) {
        setInventoryLocation(selectedLocation);
      }

      // Set user selections
      const shippingOptions = convertIdsToOptions(
        inventoryData.ship_user,
        openToOptions
      );
      const receivingOptions = convertIdsToOptions(
        inventoryData.receive_user,
        openToOptions
      );
      const producingOptions = convertIdsToOptions(
        inventoryData.producing_user,
        openToOptions
      );

      console.log("Shipping Users:", shippingOptions);
      console.log("Receiving Users:", receivingOptions);
      console.log("Producing Users:", producingOptions);


      setFormData((prev) => ({
        ...prev,
        inventoryLocation: selectedLocation?.value || "",
        authShippingUser: shippingOptions,
        authReceivingUser: receivingOptions,
        authProducingUser: producingOptions,
      }));

      
      console.log("Form Data Before Update:", formData);
    } catch (err: any) {
      console.error("Inventory fetch failed:", err);
      setError(err.message || "Failed to fetch inventory data");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
  if (pid && locationOptions.length && openToOptions.length) {
    fetchStats();
  }
}, [pid, locationOptions, openToOptions]);


  const handleLocationChange = (selectedOption: Option | null) => {
    setInventoryLocation(selectedOption);
    setFormData((prev) => ({
      ...prev,
      inventoryLocation: selectedOption?.value || "",
    }));
    setFormErrors((prev) => ({
      ...prev,
      inventoryLocation: false,
    }));
  };

  const handleMultiSelectChange = (
    name: keyof typeof formData,
    selectedOptions: Option[] | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOptions || [],
    }));
    setFormErrors((prev) => ({
      ...prev,
      [name]: false,
    }));
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   // Validate form
  //   const errors = {
  //     inventoryLocation: !formData.inventoryLocation,
  //     authShippingUser: formData.authShippingUser.length === 0,
  //     authReceivingUser: formData.authReceivingUser.length === 0,
  //     authProducingUser: formData.authProducingUser.length === 0,
  //   };
  //   setFormErrors(errors);

  //   if (Object.values(errors).some((error) => error)) {
  //     toast.error("Please fill all required fields", {
  //       position: "top-right",
  //       autoClose: 3000,
  //     });
  //     return;
  //   }

  //   // Payload with comma-separated string of IDs
  //   const payload = {
  //       id,
  //     location_id: formData.inventoryLocation,
  //     auth_shipping_user: formData.authShippingUser
  //       .map((user) => user.value)
  //       .join(","),
  //     auth_receiving_user: formData.authReceivingUser
  //       .map((user) => user.value)
  //       .join(","),
  //     auth_producing_user: formData.authProducingUser
  //       .map((user) => user.value)
  //       .join(","),
  //   };

  //   setLoading(true);
  //   try {
  //     const response = await addOrUpdate(payload);

  //     if (response.data.success) {
  //       toast.success("Inventory authorization saved successfully!", {
  //         position: "top-right",
  //         autoClose: 3000,
  //       });
  //       navigate("/inventory");
  //     } else {
  //       throw new Error(
  //         response.data.message || "Failed to save authorization"
  //       );
  //     }
  //   } catch (error: any) {
  //     console.error("Error saving inventory authorization:", error);
  //     toast.error(error.message || "Failed to save inventory authorization", {
  //       position: "top-right",
  //       autoClose: 3000,
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const errors = {
    inventoryLocation: !formData.inventoryLocation,
    authShippingUser: formData.authShippingUser.length === 0,
    authReceivingUser: formData.authReceivingUser.length === 0,
    authProducingUser: formData.authProducingUser.length === 0,
  };
  setFormErrors(errors);

  if (Object.values(errors).some((error) => error)) {
    toast.error("Please fill all required fields", {
      position: "top-right",
      autoClose: 3000,
    });
    return;
  }

  const payload = {
    location_id: Number(formData.inventoryLocation),
    ship_user: formData.authShippingUser.map((user) => user.value).join(","),
    receive_user: formData.authReceivingUser.map((user) => user.value).join(","),
    producing_user: formData.authProducingUser.map((user) => user.value).join(","),
  };

  console.log("Submitting payload:", payload);

  setLoading(true);
  try {
     await addOrUpdate(payload);

      toast.success("Inventory authorization saved successfully!", {
           position: "top-right",
            autoClose: 3000,
            style: { zIndex: 9999999999, marginTop: "4rem", },
      });
      navigate("/manageInventory");
   
     
  } catch (error: any) {
    console.error("Error saving inventory authorization:", error);
    toast.error(error.message || "Failed to save inventory authorization", {
      position: "top-right",
      autoClose: 3000,
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="container mx-auto p-6 rounded">
     {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-lg shadow"
      >
        <h3 className="text-xl font-semibold mb-3">Inventory Authorization</h3>
        <hr className="border-t border-gray-300 mb-4" />

        <div>
          <label className="font-medium mb-2 block">
            Inventory Location<span className="text-red-500">*</span>
          </label>
          <div
            className={
              formErrors.inventoryLocation
                ? "border border-red-500 rounded"
                : ""
            }
          >
            <Select
              options={locationOptions}
              value={inventoryLocation}
              onChange={handleLocationChange}
              placeholder="Select location..."
                className=" bg-gray-200 border-gray-300"
            />
          </div>
          {formErrors.inventoryLocation && (
            <p className="text-sm text-red-500 mt-1">This field is required</p>
          )}
        </div>

        <div>
          <label className="font-medium mb-2 block">
            Auth Shipping User<span className="text-red-500">*</span>
          </label>
          <div
            className={
              formErrors.authShippingUser ? "border border-red-500 rounded" : ""
            }
          >
            <Select
              options={openToOptions}
              value={formData.authShippingUser}
              onChange={(selected) =>
                handleMultiSelectChange("authShippingUser", selected)
              }
              placeholder="Select user(s)..."
              isMulti
            />
          </div>
          {formErrors.authShippingUser && (
            <p className="text-sm text-red-500 mt-1">This field is required</p>
          )}
        </div>

        <div>
          <label className="font-medium mb-2 block">
            Auth Receiving User<span className="text-red-500">*</span>
          </label>
          <div
            className={
              formErrors.authReceivingUser
                ? "border border-red-500 rounded"
                : ""
            }
          >
            <Select
              options={openToOptions}
              value={formData.authReceivingUser}
              onChange={(selected) =>
                handleMultiSelectChange("authReceivingUser", selected)
              }
              placeholder="Select user(s)..."
              isMulti
            />
          </div>
          {formErrors.authReceivingUser && (
            <p className="text-sm text-red-500 mt-1">This field is required</p>
          )}
        </div>

        <div>
          <label className="font-medium mb-2 block">
            Auth Producing User<span className="text-red-500">*</span>
          </label>
          <div
            className={
              formErrors.authProducingUser
                ? "border border-red-500 rounded"
                : ""
            }
          >
            <Select
              options={openToOptions}
              value={formData.authProducingUser}
              onChange={(selected) =>
                handleMultiSelectChange("authProducingUser", selected)
              }
              placeholder="Select user(s)..."
              isMulti
            />
          </div>
          {formErrors.authProducingUser && (
            <p className="text-sm text-red-500 mt-1">This field is required</p>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Back
          </button>
        <button
  type="submit"
  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
>
  Submit
</button>
        </div>
      </form>
    </div>
  );
};
