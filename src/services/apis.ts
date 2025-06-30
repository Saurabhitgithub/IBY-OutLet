import axios from "axios";
import { APIS, base_url } from "./endpoints";

export const createLog = (body: any) => {
  return axios.post(base_url + APIS.createLog, body);
};
export const getLogService = (body: any) => {
  return axios.post(base_url + APIS.getLogService, body);
};
export const updateLog = (body: any, id: any) => {
  return axios.post(base_url + APIS.updateLogService + id, body);
};

export const getLogById = (id: any) => {
  return axios.get(base_url + APIS.getLogById + id);
};
export const awsUploadFile = (body: any) => {
  return axios.post(base_url + APIS.awsUploadFile, body);
};

export const deleteLogService = async (id: string) => {
  return await axios.delete(base_url + APIS.deleteLogService + id);
};
export const addRole = (body: any) => {
  return axios.post(base_url + APIS.addRole, body);
};
export const getRole = () => {
  return axios.get(base_url + APIS.getRole);
};

export const getAllTerms = () => {
  return axios.get(base_url + APIS.getAllTerms);
};

export const updatePermission = async (id: string, body: any) => {
  return await axios.put(base_url + APIS.updatePermission + id, body);
};
export const getPermissionByRole = async (body: any) => {
  return axios.post(base_url + APIS.getPermissionByRole, body);
};
export const deleteRole = (id: string) => {
  return axios.delete(`${base_url}${APIS.deleteRole.replace(":id", id)}`);
};

export const addCategoryAndSubcategory = (body: any) => {
  return axios.post(base_url + APIS.addCategoryAndSubcategory, body);
};

export const getAllCategory = () => {
  return axios.get(base_url + APIS.getAllCategory);
};

export const activeAndInactiveCategory = (id: string, body: any) => {
  return axios.put(base_url + APIS.activeAndInactiveCategory + id, body);
};

export const getAllSubCategory = () => {
  return axios.get(base_url + APIS.getAllSubCategory);
};

export const editCategoryAndSubCategory = (id: any, body: any) => {
  return axios.put(base_url + APIS.editCategoryAndSubCategory + id, body);
};

export const getByIdCategoryAndSubcategory = (id: any) => {
  return axios.get(base_url + APIS.getByIdCategoryAndSubcategory + id);
};

export const getTitle = () => {
  return axios.get(base_url + APIS.getTitle);
};

export const addTitle = (body: any) => {
  return axios.post(base_url + APIS.addTitle, body);
};

export const editTitle = (body: any) => {
  return axios.put(base_url + APIS.editTitle, body, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
export const getTitleById = async (id: string) => {
  return axios.get(base_url + APIS.getTitleById + id);
};
export const deleteTitle = async (payload: {
  sql_id: number;
  mongo_id: string;
}) => {
  return axios.delete(base_url + APIS.deleteTitle, { data: payload });
};
// Department
export const getDepartment = () => {
  return axios.get(base_url + APIS.getDepartment);
};

export const addOrEditDepartment = (body: any) => {
  return axios.post(base_url + APIS.addOrEditDepartment, body);
};

export const deleteDepartment = (id: number) => {
  return axios.delete(`${base_url}${APIS.deleteDepartment}${id}`);
};

export const getDepartmentById = (id: any) => {
  return axios.get(`${base_url}${APIS.getdepartmentBysqlId}${id}`);
};
// User
export const getAllUsers = () => {
  return axios.get(base_url + APIS.getAllUsers);
};
export const addUser = (body: any) => {
  return axios.post(base_url + APIS.addUser, body);
};
export const getAllUsersById = (id: string) => {
  return axios.get(base_url + APIS.geTUserById + id);
};
export const updateUser = (id: string, body: any) => {
  return axios.put(base_url + APIS.updateUser + id, body);
};
export const changeUserName = (body: any) => {
  return axios.post(base_url + APIS.updateUserName, body);
};
export const changePassword = (body: any) => {
  return axios.post(base_url + APIS.changePassword, body);
};
//
export const getAllCompanies = () => {
  return axios.get(base_url + APIS.getAllCompanies);
};
//
// Code
export const getAllCode = () => {
  return axios.get(base_url + APIS.getAllCode);
};
export const addCode = (body: any) => {
  return axios.post(base_url + APIS.addCode, body);
};
export const deleteCode = async (id: string) => {
  return axios.delete(base_url + APIS.deleteCode + id);
};
export const getCodeById = async (id: string) => {
  return axios.get(base_url + APIS.getCodeById + id);
};
export const updateCode = async (id: string, body: any) => {
  return axios.put(base_url + APIS.updateCode + id, body);
};

//job>>mtr
export const getJobMtr = () => {
  return axios.get(base_url + APIS.getAllJobMtr);
};
export const getJobmtrbyPageLimits = (
  payload: number | { page: number; limit: number; filters?: any },
  limit?: number,
  filters?: any
) => {
  let rPayload: { page: number; limit: number; filters?: any };

  if (typeof payload === "object") {
    rPayload = payload;
  } else {
    rPayload = {
      page: payload,
      limit: limit || 10,
      filters: filters || {},
    };
  }
  return axios.post(`${base_url}${APIS.getJobMtrByPageLimits}`, rPayload);
};

export const deleteJobMtr = (body: any) => {
  return axios.post(`${base_url}${APIS.deleteJobMtr}`, body);
};
export const addJobMtr = (body: any) => {
  return axios.post(base_url + APIS.addJobMtr, body);
};

export const editJobMtr = (body: any) => {
  return axios.post(base_url + APIS.editJobMtr, body);
};

export const getJobMtrById = (id: any) => {
  return axios.get(base_url + APIS.getJobMtrById + id);
};
export const getAllSubCategoryByCategoryId = (id: any) => {
  return axios.get(base_url + APIS.getAllSubCategoryByCategoryId + id);
};

// country and states
export const getAllCountry = () => {
  return axios.get(base_url + APIS.getAllCountry);
};
export const getAllStates = (code: any) => {
  return axios.get(base_url + APIS.getAllStates + code);
};
// contact
export const getAllContact = () => {
  return axios.get(base_url + APIS.getAllContact);
};

export const getAllContactsBillTo = () => {
  return axios.get(base_url + APIS.getAllContactsBillTo);
};
export const createContact = (body: any) => {
  return axios.post(base_url + APIS.createContact, body);
};
export const getContactById = (id: any) => {
  return axios.get(base_url + APIS.getContactById + id);
};
export const updateContact = (id: any, body: any) => {
  return axios.put(base_url + APIS.updateContactById + id, body);
};
export const deleteContact = (id: any) => {
  return axios.delete(base_url + APIS.deleteContact + id);
};
//
export const getAllLocation = () => {
  return axios.get(base_url + APIS.getAllLocation);
};
export const getAllSize = () => {
  return axios.get(base_url + APIS.getAllSize);
};
export const getAllMaterial = () => {
  return axios.get(base_url + APIS.getAllMaterial);
};
export const getAllPressure = () => {
  return axios.get(base_url + APIS.getAllPressure);
};
export const getAllManufacturer = () => {
  return axios.get(base_url + APIS.getAllManufacturer);
};
export const getAllOEM = () => {
  return axios.get(base_url + APIS.getAllOEM);
};
// products
export const getAllProducts = () => {
  return axios.get(base_url + APIS.getAllProducts);
};
export const addProduct = (body: any) => {
  return axios.post(base_url + APIS.addProduct, body);
};
export const getProductById = (id: any) => {
  return axios.get(base_url + APIS.getProductById + id);
};
export const updateProduct = (id: any, body: any) => {
  return axios.put(base_url + APIS.updateProductById + id, body);
};
export const deleteProduct = (id: any) => {
  return axios.delete(base_url + APIS.deleteProduct + id);
};

// manage logs
export const createDriveInfo = (body: any) => {
  return axios.post(base_url + APIS.createDriveInfo, body);
};

export const getAllDriveInfo = () => {
  return axios.get(base_url + APIS.getAllDriveInfo);
};
export const getDriveInfoById = (id: string) => {
  console.log("Fetching drive info for ID:", id);
  return axios.get(base_url + APIS.getDriveInfoById.replace(":id", id));
};

export const deleteDriveInfo = async (id: any) => {
  return await axios.post(base_url + APIS.deleteDriveInfo, {
    sql_id: id,
  });
};
interface DriveInfoData {
  drivefrom: string;
  driveto: string;
  drivethrough1: string;
  drivethrough2: string;
  distance: string;
  start_distance: string;
  date: string;
  car: string;
  purpose: string;
}
export const updateDriveInfo = (id: string, body: DriveInfoData) => {
  return axios.put(base_url + APIS.updateDriveInfo + id, body);
};

// RFQ
export const getAllRfqs = () => {
  return axios.get(base_url + APIS.getAllRfq);
};

export const addRfq = (body: any) => {
  return axios.post(base_url + APIS.addRfq, body);
};

export const getRfqById = (id: any) => {
  return axios.get(base_url + APIS.getRfqById + id);
};

export const updateRfq = (id: any, body: any) => {
  return axios.put(base_url + APIS.updateRfq + id, body);
};

export const deleteRfq = (id: any) => {
  return axios.post(base_url + APIS.deleteRfq, {
    sql_id: id,
  });
};
//RFQ PRODUCTS
export const addRfqProduct = (body: any) => {
  return axios.post(base_url + APIS.addRfqProduct, body);
};

export const editRfqProduct = (id: any, body: any) => {
  return axios.put(base_url + APIS.editRfqProduct + id, body);
};
export const deleteRfqProduct = (id: any) => {
  return axios.post(base_url + APIS.deleteRfqProduct + id);
};
export const getAllRfqProductByRfqId = (id: any) => {
  return axios.get(base_url + APIS.getAllRfqProductByRfqId + id);
};
export const getRfqProductById = (id: any) => {
  return axios.get(base_url + APIS.getRfqProductById + id);
};
// RFQ STATS
export const getAllPurchaser = () => {
  return axios.get(base_url + APIS.getAllPurchaser);
};
export const getAllSalesman = () => {
  return axios.get(base_url + APIS.getAllSalesman);
};


// Quotation
export const getAllQuotation = () => {
  return axios.get(base_url + APIS.getAllQuotation);
};

export const addQuotation = (body: any) => {
  return axios.post(base_url + APIS.addQuotation, body);
};
export const getQuotationById = (id: any) => {
  return axios.get(base_url + APIS.getQuotationById + id);
};
export const updateQuotation = (id: any, body: any) => {
  return axios.put(base_url + APIS.updateQuotationById + id, body);
};
export const deleteQuotation = (id: any) => {
  return axios.delete(base_url + APIS.deleteQuotation + id);
};

export const addSchedule = (body: any) => {
  return axios.post(base_url + APIS.addSchedule, body);
};
export const getAllSchedule = () => {
  return axios.get(base_url + APIS.getAllSchedule);
};
export const getAllScheduleById = (id: any) => {
  return axios.get(base_url + APIS.getAllScheduleById + id);
};
export const deleteSchedule = (id: any) => {
  return axios.delete(base_url + APIS.deleteSchedule + id);
};
//
export const completeSchedule = (id: any) => {
  return axios.put(base_url + APIS.completeSchedule + id);
};
//
export const getAllRuleLocation = () => {
  return axios.get(base_url + APIS.getAllRuleLocation);
};
export const addRuleLocation = (body: any) => {
  return axios.post(base_url + APIS.addRuleLocation, body);
};
export const getRuleLocationById = (id: any) => {
  return axios.get(base_url + APIS.getRuleLocationById + id);
};
export const deleteRuleLocation = (id: any) => {
  return axios.delete(base_url + APIS.deleteRuleLocation + id);
};
export const updateRuleLocation = (id: any, body: any) => {
  return axios.put(base_url + APIS.updateRuleLocation + id, body);
};

//statement
export const addStatement = (payload: any) => {
  return axios.post(base_url + APIS.addStatement, payload);
};

export const getAllStatement = () => {
  return axios.get(base_url + APIS.getAllStatement);
};

// export const deleteStatement = (id: string) => {
//   return axios.delete(`${base_url}${APIS.deleteStatement});
// };
export const deleteStatement = (id: any) => {
  return axios.delete(base_url + APIS.deleteStatement + id);
};

export const getStatementById = (id: any) => {
  return axios.get(base_url + APIS.getStatementById + id);
};
export const updateStatement = (id: any, body: any) => {
  return axios.put(base_url + APIS.updateStatement + id, body);
};
export const updateSchedule = (id: any, body: any) => {
  return axios.put(base_url + APIS.updateSchedule + id, body);
};

export const addBusinessLine = (body: any) => {
  return axios.post(base_url + APIS.addBusinessLine, body);
};
export const getAllBusinessLine = () => {
  return axios.get(base_url + APIS.getAllBusinessLine);
};
export const getBusinessLineById = (id: any) => {
  return axios.get(base_url + APIS.getBusinessLineById + id);
};
export const deleteBusinessLine = (id: any) => {
  return axios.delete(base_url + APIS.deleteBusinessLine + id);
};
export const editBusinessLine = (id: any, body: any) => {
  return axios.put(base_url + APIS.editBusinessLine + id, body);
};
export const getAllFunctionAuthorization = () => {
  return axios.get(base_url + APIS.getAllFunctionAuthorization);
};
export const addFunctionAuthorization = (body: any) => {
  return axios.post(base_url + APIS.addFunctionAuthorization, body);
};
export const getFunctionAuthorizationById = (id: any) => {
  return axios.get(base_url + APIS.getFunctionAuthorizationById + id);
};
export const deleteFunctionAuthorization = (id: any) => {
  return axios.delete(base_url + APIS.deleteFunctionAuthorization + id);
};
export const editFunctionAuthorization = (id: any, body: any) => {
  return axios.put(base_url + APIS.editFunctionAuthorization + id, body);
};

export const addTimeSheet = (body: any) => {
  return axios.post(base_url + APIS.addTimeSheet, body);
};
export const getAllTimeSheet = () => {
  return axios.get(base_url + APIS.getAllTimeSheet);
};
// Rule Authorization
export const getAllRuleAuthorization = () => {
  return axios.get(base_url + APIS.getAllRuleAuthorization);
};
export const addRuleAuthorization = (body: any) => {
  return axios.post(base_url + APIS.addRuleAuthorization, body);
};
export const getRuleAuthorizationById = (id: any) => {
  return axios.get(base_url + APIS.getRuleAuthorizationById + id);
};
export const editRuleAuthorization = (id: any, body: any) => {
  return axios.put(base_url + APIS.editRuleAuthorization + id, body);
};
export const deleteRuleAuthorization = (id: any) => {
  return axios.delete(base_url + APIS.deleteRuleAuthorization + id);
};
export const editTimeSheet = (id: any, body: any) => {
  return axios.put(base_url + APIS.editTimeSheet + id, body);
};
export const deleteTimeSheet = (id: any) => {
  return axios.delete(base_url + APIS.deleteTimeSheet + id);
};
export const getTimeSheetById = (id: any) => {
  return axios.get(base_url + APIS.getTimeSheetById + id);
};

//problems

export const addProblem = (body: any) => {
  return axios.post(base_url + APIS.addProblem, body);
};
export const getAllProblems = () => {
  return axios.get(base_url + APIS.getAllProblems);
};
export const editProblem = (id: any, body: any) => {
  console.log(id);
  return axios.put(base_url + APIS.editProblem + id, body);
};
export const getProblemById = async (id: string) => {
  const response = await axios.get(`${base_url}/problem/getProblemById/${id}`);
  return response.data;
};

export const deleteProblem = async (id: string) => {
  try {
    const response = await axios.delete(
      `${base_url}/problem/deleteProblem/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting problem:", error);
    throw error;
  }
};

export const updatesolution = (id: any, body: any) => {
  const url = `${base_url}${APIS.updatesolution.replace("{id}", id)}`;
  console.log("PUT URL:", url);
  return axios.put(url, body);
};

// Cross ref
export const getAllCrossRef = () => {
  return axios.get(base_url + APIS.getAllCrossRef);
};
export const addCrossRef = (body: any) => {
  return axios.post(base_url + APIS.addCrossRef, body);
};
export const getCrossrefById = (id: any) => {
  return axios.get(base_url + APIS.getCrossrefById + id);
};
export const updateCrossRef = async (id: any, body: any) => {
  return axios.put(base_url + APIS.updateCrossRef + id, body);
};
export const deleteCrossRefById = async (id: any) => {
  return axios.delete(base_url + APIS.deleteCrossRef + id);
};
//  Catalogue
export const getAllCatalogue = () => {
  return axios.get(base_url + APIS.getAllCatalogue);
};
export const addCatalogue = (body: any) => {
  return axios.post(base_url + APIS.addCatalogue, body);
};
export const getCatalogueById = (id: any) => {
  return axios.get(base_url + APIS.getCatalogueById + id);
};
export const updateCatalogue = async (id: any, body: any) => {
  return axios.put(base_url + APIS.updateCatalogue + id, body);
};
export const deleteCatalogueById = async (id: any) => {
  return axios.delete(base_url + APIS.deleteCatalogue + id);
};

//faq
export const addFaq = (body: any) => {
  return axios.post(base_url + APIS.addFaq, body);
};
export const getAllFaq = () => {
  return axios.get(base_url + APIS.getAllFaq);
};
export const getFaqById = (id: any) => {
  const url = base_url + APIS.getFaqById.replace("{id}", id);
  return axios.get(url);
};
export const updateFaq = async (payload: any) => {
  const { id, ...rest } = payload;
  return axios.put(`${base_url}/faq/editFaq/${id}`, rest);
};
export const deleteFaq = async (id: string) => {
  const url = base_url + APIS.deleteFaq.replace("{id}", id);
  return axios.delete(url);
};

// export const addFaqFile = async (body: any) => {
//   return axios.post(base_url + APIS.addFaqFile, body);
// };
export type AnswerPayload = {
  user_id: number;
  parent: string;
  question: string;
  name?: string;
  file_name?: string;
};

export const addFaqChildAns = async (body: AnswerPayload) => {
  try {
    const response = await axios.post(
      `${base_url}/faq/addFaqChildAnswerData`,
      body
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting FAQ answer:", error);
    throw error;
  }
};

export const getParentDataById = (id: number) => {
  return axios.get(`${base_url}${APIS.getParentDataById}/${id}`);
};
export const getFaqFileDataById = (id: number) => {
  const url = `${base_url}${APIS.getFaqFileDataById.replace(
    ":id",
    id.toString()
  )}`;
  return axios.get(url);
};

//delete parent quesiton
export const deleteParentQuestion = async (id: string) => {
  return axios.delete(base_url + APIS.deleteParentQuestion + id);
};
//delete children answer
export const deleteChildAnswer = async (id: string) => {
  return await axios.delete(`${base_url}${APIS.deleteChildAnswer}${id}`);
};

//update answer
export const updateAnswerFileData = async (id: string, data: any) => {
  return await axios.put(`${base_url}${APIS.updateAnswerFileData}${id}`, data);
};
// Sales
export const getAllSales = (payload = {}) => {
  return axios.post(base_url + APIS.getAllSales, payload);
};

export const addSales = (body: any) => {
  return axios.post(base_url + APIS.addSales, body);
};

export const getSalesById = (id: any) => {
  return axios.get(base_url + APIS.getSalesById + id);
};
export const updateSales = async (id: any, body: any) => {
  return axios.put(base_url + APIS.updateSales + id, body);
};
export const deleteSalesById = async (id: any) => {
  return axios.delete(base_url + APIS.deleteSales + id);
};
export const getSalesCount = () => {
  return axios.get(base_url + APIS.fecthSalesCount);
};

//packages
export const addPackage = (body: any) => {
  return axios.post(base_url + APIS.addPackage, body);
};
export const editPackage = async (id: any, body: any) => {
  return axios.put(base_url + APIS.editPackage + id, body);
};
export const deletePackage = async (id: any) => {
  return axios.delete(base_url + APIS.deletePackage + id);
};
export const getPackageById = (id: any) => {
  return axios.get(base_url + APIS.getPackageById + id);
};

//Payment

export const addPayment = (body: any) => {
  return axios.post(base_url + APIS.addPayment, body);
};
export const getAllPayment = (id: any) => {
  return axios.get(base_url + APIS.getAllPayment + id);
};
export const getPaymentById = (id: any) => {
  return axios.get(base_url + APIS.getPaymentById + id);
};
export const deletePayment = async (id: any) => {
  return axios.delete(base_url + APIS.deletePayment + id);
};
export const updatePayment = async (id: any, body: any) => {
  return axios.put(base_url + APIS.updatePayment + id, body);
};

// manage products
export const getAllManageProducts = () => {
  return axios.get(base_url + APIS.getAllManageProducts);
};

export const updateManageProducts = (body: any) => {
  return axios.put(base_url + APIS.updateManageProducts, body);
};

export const getManageProductsById = (id: any) => {
  return axios.get(base_url + APIS.getManageProductsById + id);
};

//stock statistics
export const isProductDataAvailableByDate = (date: string) => {
  return axios.post(`${base_url}${APIS.isProductDataAvailableByDate}`, {
    date,
  });
};
export const getProductsDataByDateAndLocation = (
  date: string,
  location_id: number
) => {
  return axios.post(`${base_url}${APIS.getProductsDataByDateAndLocation}`, {
    date,
    location_id,
  });
};

//procedure
export interface ProcedurePayload {
  user_id: number;
  product_id: number;
  delivery_date: string;
  notes: string;
  status: string;
  edited_by: number;
  produce_qty: number;
}

export const addProcedure = (body: ProcedurePayload) => {
  return axios.post(base_url + APIS.addProcedure, body);
};
export const updateProcedure = (id: string, body: ProcedurePayload) => {
  return axios.put(
    `${base_url}${APIS.updateProcedure.replace("{id}", id)}`,
    body
  );
};

export const getProcedureById = (id: any) => {
  return axios.get(base_url + APIS.getProcedureById.replace("{id}", id));
};
export const getAllProcedures = (id: any) => {
  const endpoint = APIS.getAllProcedures.replace("{product_id}", id);
  return axios.get(base_url + endpoint);
};

export const getOrderDataBySalesId = (id: any) => {
  return axios.get(base_url + APIS.getOrderDataBySalesId + id);
};
export const addOrderItem = (body: any) => {
  return axios.post(base_url + APIS.addOrderItem, body);
};
export const getOrderDataById = (id: any) => {
  return axios.get(base_url + APIS.getOrderDataById + id);
};
export const editOrderItem = (id: any, body: any) => {
  return axios.put(base_url + APIS.editOrderItem + id, body);
};
export const addInvoice = (body: any) => {
  return axios.post(base_url + APIS.addInvoice, body);
};
export const getInvoiceById = (id: any) => {
  return axios.get(base_url + APIS.getInvoiceById + id);
};
export const editInvoiceById = (id: any, body: any) => {
  return axios.put(base_url + APIS.editInvoiceById + id, body);
};
export const deleteInvoiceById = (id: any) => {
  return axios.delete(base_url + APIS.deleteInvoiceById + id);
};
export const addOrderFile = (id: string, body: any) => {
  return axios.post(`${base_url}${APIS.addOrderFile}/${id}`, body);
};
//
export const loginUser = (body: any) => {
  return axios.post(base_url + APIS.loginUser, body);
};
//
//Quotation Items
export const addQuoteItem = (body: any) => {
  return axios.post(base_url + APIS.addQuoteItem, body);
};
export const getAllQuoteItemsById = (id: any) => {
  return axios.get(base_url + APIS.getAllQuoteItemsById + id);
};
export const getQuoteItemById = (id: any) => {
  return axios.get(base_url + APIS.getQuoteItemById + id);
};
export const editQuoteItem = (id: any, body: any) => {
  return axios.put(base_url + APIS.editQuoteItem + id, body);
};
export const deleteQuoteItem = (id: any) => {
  return axios.delete(base_url + APIS.deleteQuoteItem + id);
};

//

export const getAllProductByPageLimit = (
  pageOrPayload: number | { page: number; limit: number; filters?: any },
  limit?: number,
  filters?: any
) => {
  let requestPayload: { page: number; limit: number; filters?: any };
  if (typeof pageOrPayload === "object") {
    requestPayload = pageOrPayload;
  } else {
    requestPayload = {
      page: pageOrPayload,
      limit: limit || 10,
      filters: filters || {},
    };
  }

  return axios.post(
    `${base_url}${APIS.getAllProductByPageLimit}`,
    requestPayload
  );
};

//

// Manage payable
export const addAccountPayable = (body: any) => {
  return axios.post(base_url + APIS.addAccountPayable, body);
};
export const updateAccountPayable = async (id: any, body: any) => {
  return axios.put(base_url + APIS.updateAccountPayable + id, body);
};

export const getAllAccountPayableDataById = (id: any) => {
  return axios.get(base_url + APIS.getByIdAccountPayable + id);
};

// export const getAllAccountPayable = (page: number, limit: number) => {
//   return axios.post(`${base_url}${APIS.getAllAccountPayable}`, {
//     page,
//     limit,
//   });
// };

//
export const getSalesCommissionById = (id: any) => {
  return axios.get(base_url + APIS.getSalesCommissionById + id);
};
export const getSalesCommissionBy3A = (id: any) => {
  return axios.get(base_url + APIS.getSalesCommissionBy3A + id);
};
export const getAllOrderhistoryById = (id: any) => {
  return axios.get(base_url + APIS.getAllOrderhistoryById + id);
};
//
//manage AP
export const getAllVerifyAccount = (
  page: number,
  limit: number,
  filter: { [key: string]: any } = {}
) => {
  return axios.post(`${base_url}${APIS.getAllVerifyAccount}`, {
    page,
    limit,
    filter,
  });
};

export const getAccountCount = () => {
  return axios.get(base_url + APIS.getAccountCount);
};

export const getAllItemProduct = (
  page: number,
  limit: number,
  filters: any = {}
) => {
  return axios.post(`${base_url}${APIS.getAllItemProduct}`, {
    page,
    limit,
    filters,
  });
};
export const addAddLostData = (body: any) => {
  return axios.post(base_url + APIS.addAddLostData, body);
};
// apis.ts
export const getProductCount = () => {
  return axios.get(base_url + APIS.getProductCount);
};

export const getAccountPayableDataById = (id: any) => {
  return axios.get(base_url + APIS.getByIdAccountPayable + id);
};

export const getAllAccountPayable = (
  page: number,
  limit: number,
  filter: { [key: string]: any } = {}
) => {
  return axios.post(`${base_url}${APIS.getAllAccountPayable}`, {
    page,
    limit,
    filter,
  });
};

export const deleteAccountPayableData = (id: any) => {
  return axios.delete(base_url + APIS.deleteAccountPayable + id);
};
// manage quantity

export const getAllManageProductByPageLimit = (
  page: number,

  limit: number,

  filters: any = {}
) => {
  return axios.post(`${base_url}${APIS.getAllManageProductByPageLimit}`, {
    page,

    limit,

    filters,
  });
};

export const addPdHistoryCheck = (body: any) => {
  return axios.post(base_url + APIS.addPdHistoryCheck, body);
};

export const getManageProductCount = () => {
  return axios.get(base_url + APIS.getManageProductCount);
};

export const getAllPdHistory = (id: any) => {
  return axios.get(base_url + APIS.getAllPdHistory + id);
};

export const getAllProductOutsbyProductId = (id: any) => {
  return axios.get(base_url + APIS.getAllProductOutsbyProductId + id);
};
export const getAllContactPageLimit = (
  pageOrPayload: number | { page: number; limit: number; filters?: any },
  limit?: number,
  filters?: any
) => {
  let requestPayload: { page: number; limit: number; filters?: any };
  if (typeof pageOrPayload === "object") {
    requestPayload = pageOrPayload;
  } else {
    requestPayload = {
      page: pageOrPayload,
      limit: limit || 10,
      filters: filters || {},
    };
  }

  return axios.post(
    `${base_url}${APIS.getAllContactPageLimits}`,
    requestPayload
  );
};
export const deleteProductOutByProduct = (id: any) => {
  return axios.delete(base_url + APIS.deleteProductOutByProduct + id);
};

export const editProcedureOnWay = async (id: any, body: any) => {
  const url = `${base_url}${APIS.editProcedureOnWay.replace("{id}", id)}`;
  return axios.put(url, body);
};
//procedure
export interface ProcedurePayloadVerify {
  user_id: number;
  product_id: number;
  delivery_date: string;
  notes: string;
  status: string;
  edited_by: number;
  produce_qty: number;
  instock_qty?: number;
  instock_date?: string;
  rack?: string;
  container?: string;
  eta?: string;
  ontheway_qty?: number;
}
export const verifyProcedure = (id: string, body: ProcedurePayloadVerify) => {
  return axios.put(
    `${base_url}${APIS.editProcedureVerify.replace("{id}", id)}`,
    body
  );
};
export const editProcedureDoubleCheck = (
  id: string,
  body: ProcedurePayloadVerify
) => {
  return axios.put(
    `${base_url}${APIS.editProcedureDoubleCheck.replace("{id}", id)}`,
    body
  );
};
export const getAllPackageByinvoiceId = (id: any) => {
  return axios.get(base_url + APIS.getAllPackageByinvoiceId + id);
};

export const addRfqStates = (body: any) => {
  return axios.post(base_url + APIS.addRfqStats, body);
};

export const getallRfqStatsById = (id: any) => {
  return axios.get(base_url + APIS.getallRfqStatsById + id);
};

export const getRfqStatesById = (id: any) => {
  return axios.get(base_url + APIS.getRfqStatesById + id);
};

export const updateRfqStatesById = async (id: any, body: any) => {
  return axios.put(base_url + APIS.updateRfqStatesById + id, body);
};

export const deleteRfqstats = (id: any) => {
  return axios.delete(base_url + APIS.deleteRfqstats + id);
};

export const isPrivateRfqState = (id: any, body: { isPrivate: number }) => {
  return axios.post(base_url + APIS.isPrivateRfqState + id, body);
};

export const closeRfqStatus = (id: any, body: any) => {
  return axios.post(base_url + APIS.closeRfqStatus + id, body);
};

export const addOrUpdate = (body: any) => {
  return axios.post(base_url + APIS.addOrUpdate, body);
};
export const getAllInventory = () => {
  return axios.get(base_url + APIS.getAllInventory);
};
export const getInventoryById = (id: any) =>
  axios.get(base_url + APIS.getInventoryById + id);

export const addStock = (body: any) => {
  return axios.post(base_url + APIS.addStock, body);
};

export const getStockById = (id: any) =>
  axios.get(base_url + APIS.getStockById + id);

export const getAllstockByproductid = (id: any) => {
  return axios.get(base_url + APIS.getAllstockByproductid + id);
};
export const deleteStock = (id: any) => {
  return axios.delete(base_url + APIS.deleteStock + id);
};
export const updateStock = async (id: any, body: any) => {
  return axios.put(base_url + APIS.updateStock + id, body);
};
export const deleteProductOut = (id: any) => {
  return axios.delete(base_url + APIS.deleteProductOut + id);
};

//Rules
export const getRules = () => {
  return axios.get(base_url + APIS.getRules);
};
export const addRule = (body: any) => {
  return axios.post(base_url + APIS.addRule, body);
};

export const updateRule = (id: any, body: any) => {
  return axios.put(base_url + APIS.updateRule + id, body);
};

export const getRuleById = (id: any) => {
  return axios.get(base_url + APIS.getRuleById + id);
};
export const deleteRule = (id: any) => {
  return axios.delete(base_url + APIS.deleteRule + id);
};

//forgot password
export const forgotPassword = (email: string) => {
  return axios.post(base_url + APIS.forgotPassword, { email });
}


//Messages
export const getInboxMessages = (payload: any) => {
  return axios.post(base_url + APIS.getInboxMessages, payload);
}
export const getSentMessages = (payload: any) => {
  return axios.post(base_url + APIS.getSentMessages, payload);
}
export const getTrashedMessages = (payload: any) => {
  return axios.post(base_url + APIS.getTrashedMessages, payload);
}
export const AddMessage = (body: any) => {
  return axios.post(base_url + APIS.AddMessage, body);
};
export const moveMessageToTrash = (id: any, body: any) => {
  return axios.put(base_url + APIS.moveMessageToTrash + id, body);
}
export const deleteMessageFromTrash = (body: any) => {
  return axios.put(base_url + APIS.deleteMessageFromTrash, body);
}
export const restoreTrashMessage = (body: any) => {
  return axios.post(base_url + APIS.restoreTrashMessage, body);
}
export const getMessageById = (id: any) => {
  return axios.get(base_url + APIS.getMessageById + id);
}


// PO
export const getAllPO = (payload: { search?: string; userId?: number; page?: number; limit?: number }) => {
  return axios.post(base_url + APIS.getAllPO, payload);
};
export const addPO = (payload: any) => {
  return axios.post(base_url + APIS.addPo, payload);
};
export const deletePo = (id: any) => {
  return axios.delete(base_url + APIS.deletePo + id);
};
export const editPo = (id: number, body: any) => {
  return axios.put(`${base_url}${APIS.editPo}/${id}`, body);
};
export const getPoById = (id: any) => {
  return axios.get(base_url + APIS.getPoById + id);
};

//changeLog

export const getAllChangeLogs = (params: any) => {
  return axios.post(`${base_url}${APIS.getAllChangeLogs}`, params);
};
