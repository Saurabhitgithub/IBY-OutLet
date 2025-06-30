// import { addJobMtr } from "./apis"

import { deleteRfq } from "./apis";

// export const base_url = "http://192.168.29.125:8080"
// export const base_url = "http://54.198.100.26:8080"
export const base_url = "https://backend-apis-334f29c8c760.herokuapp.com";

export const APIS = {
  createLog: "/logs/addLogService",
  getLogService: "/logs/getLogService",
  updateLogService: "/logs/updateLogService/",
  getLogById: "/logs/getLogById/",
  deleteLogService: "/logs/deleteLogById/",
  awsUploadFile: "/docs/uploadMultipleDocsData",
  addRole: "/role/addRole",
  getAllContactsBillTo: "/contact/getAllContactsBillTo",
  getRole: "/role/getAllRoleData",
  deleteRole: "/role/deleteRole/:id",
  updatePermission: "/role/updateRolePermissionById/",
  getPermissionByRole: "/role/getPermissionByRole",
  addCategoryAndSubcategory: "/category/addCategory",
  getAllCategory: "/category/getAllCategory",
  activeAndInactiveCategory: "/category/editStatus/",
  getAllSubCategory: "/category/getAllSubCategory",
  editCategoryAndSubCategory: "/category/editCategorySubcategory/",
  getByIdCategoryAndSubcategory: "/category/getCategorySubcategorybyid/",
  getAllSubCategoryByCategoryId: "/category/getAllSubCategorybyCategory_id/",
  getTitle: "/company/all",
  getTitleById: "/company/",
  addTitle: "/company/add",
  editTitle: "/company/edit",
  deleteTitle: "/company/delete",
  getDepartment: "/department/getAll",
  addOrEditDepartment: "/department/addOrEdit",
  getdepartmentBysqlId: "/department/getById/",
  deleteDepartment: "/department/delete/",
  getAllUsers: "/api/getAllUser",
  geTUserById: "/api/getUserbyid/",
  addUser: "/api/createUser",
  updateUser: "/api/updateUser/",
  updateUserName: "/api/changeUsername",
  changePassword: "/api/changeUserPassword",
  getAllCode: "/code/all",
  addCode: "/code/add",
  deleteCode: "/code/delete/",
  getCodeById: "/code/getCodebyid/",
  updateCode: "/code/update/",

  getAllCompanies: "/code/getAllTitle",
  //job>>Mtr

  getJobMtrByPageLimits: "/job/getJobmtrbyPageLimits",

  addJobMtr: "/job/addJobmtr",
  editJobMtr: "/job/editJobmtr",
  getAllJobMtr: "/job/getAlljobmtr",
  deleteJobMtr: "/job/deleteJobmtr",
  getJobMtrById: "/job/getjobmtrbyid/",
  getAllCountry: "/commonApi/countries",
  getAllStates: "/commonApi/states/",
  getAllContact: "/contact/getAllContacts",
  createContact: "/contact/createContact",
  getAllProducts: "/product/getAllProducts",
  addProduct: "/product/addProduct",
  getProductById: "/product/getProductById/",
  updateProductById: "/product/updateProduct/",
  deleteProduct: "/product/deleteProduct/",
  getContactById: "/contact/getContactById/",
  updateContactById: "/contact/updateContact/",
  deleteContact: "/contact/deleteContact/",
  getAllLocation: "/code/getAllLocation",
  getAllSize: "/code/getAllSize",
  getAllMaterial: "/code/getAllMaterial",
  getAllPressure: "/code/getAllPressure",
  getAllManufacturer: "/code/getAllManufacturer",
  getAllOEM: "/code/getAllOEM",

  //manage logs
  createDriveInfo: "/driveInfo/addDriveInfo",
  getAllDriveInfo: "/driveInfo/getAllDriveInfo",
  getDriveInfoById: "/driveInfo/getDriveInfoById/:id",
  updateDriveInfo: "/driveInfo/updateDriveInfo/",
  deleteDriveInfo: "/driveInfo/deleteDriveInfo/",

  // Quotation
  getAllQuotation: "/quote/getAllQuote",
  addQuotation: "/quote/addQuote",
  getQuotationById: "/quote/getQuoteById/",
  updateQuotationById: "/quote/editQuote/",
  deleteQuotation: "/quote/deleteQuote/",

  //RFQ
  addRfq: "/rfq/addRfq",
  getAllRfq: "/rfq/getAllRfq",
  getRfqById: "/rfq/getRfqById/",
  updateRfq: "/rfq/updateRfq/",
  deleteRfq: "/rfq/deleteRfq/",
  addSchedule: "/schedule/addSchedule",
  getAllSchedule: "/schedule/getAllSchedule",
  getAllScheduleById: "/schedule/getScheduleById/",
  deleteSchedule: "/schedule/deleteSchedule/",
  completeSchedule: "/schedule/completeSchedule/",
  //rfqproduct
  addRfqProduct: "/rfq/addRfqProduct",

  editRfqProduct: "/rfq/editRfqProduct/",
  deleteRfqProduct: "/rfq/deleteRfqProduct/",
  getAllRfqProductByRfqId: "/rfq/getAllRfqProductsByRfqId/",
  getRfqProductById: "/rfq/getRfqProductById/",
  // rfqStats
  getAllPurchaser: "/api/getAllPurchaser",

  // Rule Location
  getAllRuleLocation: "/ruleLocations/getAllRuleLocation",
  addRuleLocation: "/ruleLocations/addRuleLocation",
  getRuleLocationById: "/ruleLocations/getRuleLocationById/",
  deleteRuleLocation: "/ruleLocations/deleteRuleLocation/",
  updateRuleLocation: "/ruleLocations/editRuleLocation/",

  //Statement
  addStatement: "/statement/addstatement",
  getAllStatement: "/statement/getAllStatement",
  deleteStatement: "/statement/deleteStatement/",

  getStatementById: "/statement/getStatementById/",
  updateStatement: "/statement/editStatement/",

  updateSchedule: "/schedule/updateSchedule/",

  addBusinessLine: "/businessLine/addBusinessLine",
  getAllBusinessLine: "/businessLine/getAllBusinessLine",
  getBusinessLineById: "/businessLine/getBusinessLineById/",
  deleteBusinessLine: "/businessLine/deleteBusinessLine/",
  // editBusinessLine: "/businessLine/editBusinessLine/",
  // Function Authorization
  getAllFunctionAuthorization: "/functionAuths/getAllFunctionAuths",
  addFunctionAuthorization: "/functionAuths/addFunctionAuth",
  getFunctionAuthorizationById: "/functionAuths/getFunctionAuthById/",
  editFunctionAuthorization: "/functionAuths/editFunctionAuth/",
  deleteFunctionAuthorization: "/functionAuths/deleteFunctionAuth/",
  editBusinessLine: "/businessLine/editBusinessLine/",
  //Timesheet
  addTimeSheet: "/timeSheet/addTimeSheet",
  getAllTimeSheet: "/timeSheet/getAllTimeSheet",

  //Rule Authorization
  getAllRuleAuthorization: "/rule-auth/all",
  addRuleAuthorization: "/rule-auth/add",
  getRuleAuthorizationById: "/rule-auth/",
  editRuleAuthorization: "/rule-auth/edit/",
  deleteRuleAuthorization: "/rule-auth/delete/",
  //Timesheet
  editTimeSheet: "/timeSheet/editTimeSheet/",
  deleteTimeSheet: "/timeSheet/deleteTimeSheet/",
  getTimeSheetById: "/timeSheet/getTimeSheetById/",
  // Cross Ref
  getAllCrossRef: "/crossRef/getAllCrossRef",
  getCrossrefById: "/crossRef/getCrossrefById/",
  updateCrossRef: "/crossRef/updateCrossRef/",
  deleteCrossRef: "/crossRef/deleteCrossRef/",
  addCrossRef: "/crossRef/addCrossRef",
  // Catalogue
  getAllCatalogue: "/catalogue/getAllCatalogue",
  addCatalogue: "/catalogue/addCatalogue",
  getCatalogueById: "/catalogue/getCatalogueByMongoId/",
  updateCatalogue: "/catalogue/editCatalogue/",
  deleteCatalogue: "/catalogue/deleteCatalogue/",

  // problems
  addProblem: "/problem/addProblem",
  getAllProblems: "/problem/getAllProblem",
  editProblem: "/problem/editProblem/",
  getProblemById: "/problem/getProblemById/{id}",
  deleteProblem: "/problem/deleteProblem/{id}",

  updatesolution: "/problem/editProblemSolution/{id}",

  //stock statistics
  getProductsDataByDateAndLocation: "/product/getProductsDataByDateAndLocation",

  isProductDataAvailableByDate: "/product/isProductDataAvailableByDate",
  getAllProductByPageLimit: "/product/getAllProductsPageLimit",

  //FAQ
  addFaq: "/faq/addFaq",
  getAllFaq: "/faq/getAllFaq",
  getFaqById: "/faq/getFaqById/{id}",
  updateFaq: "/faq/editFaq/",

  deleteFaq: "/faq/deleteFaq/{id}",
  // addFaqFile: "/faq/addFaqFile",
  addFaqChildAns: "faq/addFaqChildAnswerData",
  getParentDataById: "/faq/getParentDataByParentId",
  deleteParentQuestion: "/faq/deleteFaq/",
  deleteChildAnswer: "/faq/deleteFaqFileData/",
  updateAnswerFileData: "/faq/editFaqFileAndAnswerData/",
  getFaqFileDataById: "/faq/getFaqFileDataById/:id",
  // Sales
  getAllSales: "/sales/getAllSalesPageLimit",
  getAllSalesman: "/api/getAllSalesMan",

  addSales: "/sales/addSales",
  getSalesById: "/sales/getSalesById/",
  updateSales: "/sales/editSales/",
  deleteSales: "/sales/deleteSales/",
  fecthSalesCount: "/sales/getSalesCount",
  getOrderDataBySalesId: "/sales/getOrderDatabySalesId/",
  addOrderItem: "/sales/addOrderItem",
  getOrderDataById: "/sales/getOrderDatabyid/",
  editOrderItem: "/sales/editOrderItem/",
  addInvoice: "/invoices/addInvoice",
  getInvoiceById: "/invoices/getInvoiceById/",
  editInvoiceById: "/invoices/editInvoice/",
  deleteInvoiceById: "/invoices/deleteInvoice/",
  getAllTerms: "/code/getAllTerm",
  addOrderFile: "/sales/addOrderFile",

  // packages
  addPackage: "/sales/addPackage",
  editPackage: "/sales/editPackage/{id}",
  deletePackage: "/sales/deletePackage/",
  getPackageById: "/sales/getPackageById/",

  // payment
  addPayment: "/payment/addPayment",
  getAllPayment: "/payment/getAllPayments/",
  getPaymentById: "/payment/getPaymentById/",
  deletePayment: "/payment/deletePayment/",
  updatePayment: "/payment/updatePayment/",

  //
  loginUser: "/api/loginUser",

  //manage products
  getAllManageProducts: "/product/getAllProducts",
  updateManageProducts: "/product/manageQuantity",
  getManageProductsById: "/product/getProductById/",

  //procedure
  addProcedure: "/product/addProcedure",
  updateProcedure: "/product/editProcedure/{id}",
  getProcedureById: "/product/getProcedureById/{id}",
  getAllProcedures: "/product/getAllProcedures/{product_id}",

  // Quotaion Items
  addQuoteItem: "/quote/addQuoteItem",
  getAllQuoteItemsById: "/quote/getAllQuoteItems/",

  getQuoteItemById: "/quote/getQuoteItemById/",
  editQuoteItem: "/quote/editQuoteItem/",
  deleteQuoteItem: "/quote/deleteQuoteItem/",
  //

  // Manage Account Payable
  addAccountPayable: "/account-payables",
  updateAccountPayable: "/account-payables/",
  getAllAccountPayable: "/account-payables/getAllAccountPayables",
  getByIdAccountPayable: "/account-payables/getAccountPayableById/",
  deleteAccountPayable: "/account-payables/",

  //
  getSalesCommissionById: "/sales/getSalesCommissionBySalesman/",
  getSalesCommissionBy3A: "/sales/getSalesCommission3aBySalesman/",
  getAllOrderhistoryById: "/sales/getSalesOrderHistoryBySalesman/",

  //get all products api updated
  getProductCount: "/product/getProductCount",
  getAllItemProduct: "/product/getAllProductsPageLimit/",
  //

  oductByPageLimit: "/product/getAllProductsPageLimit/",
  //
  //get all products api updated

  addAddLostData: "/product/addProductOut",

  //manage AP
  getAllVerifyAccount: "/account-payables/getAllAccountPayables",

  getAccountCount: "/account-payables/getAccountPayableCount",
  //mange quantity
  getAllManageProductByPageLimit: "/product/getAllProductsPageLimit/",
  addPdHistoryCheck: "/product/addPdHistory",
  getManageProductCount: "/product/getProductCount",
  getAllPdHistory: "/product/getAllPdHistory/",
  getAllProductOutsbyProductId: "/product/getAllProductOutsbyProductId/",
  getAllContactPageLimits: "/contact/getAllContactsPageLimits",
  //procedure management
  editProcedureOnWay: "/product/editProcedureOnWay/{id}",
  editProcedureVerify: "/product/editProcedureVerify/{id}",
  editProcedureDoubleCheck: "/product/editProcedureDoubleCheck/{id}",
  getAllPackageByinvoiceId: "/sales/getAllPackagebyInvoice/",

  // rfq stats
  addRfqStats: "/rfq/addRfqState",
  getallRfqStatsById: "/rfq/getAllRfqStates/",
  getRfqStatesById: "/rfq/getRfqStateById/",
  updateRfqStatesById: "/rfq/editRfqState/",
  deleteRfqstats: "/rfq/deleteRfqState/",
  isPrivateRfqState: "/rfq/isPrivateRfqState/",
  closeRfqStatus: "/rfq/updateRfqStatus/",

  addOrUpdate: "/inventory/addOrUpdate/",
  getAllInventory: "/inventory/getAll",
  getInventoryById: "/inventory/",

  addStock: "/product/addStock",
  getStockById: "/product/getStockById/",
  getAllstockByproductid: "/product/getAllstockByproductid/",
  deleteStock: "/product/deleteStock/",
  updateStock: "/product/updateStock/",
  deleteProductOut: "/product/deleteProductOut/",

  //rules
  getRules: "/rules/getAllRules",
  addRule: "/rules/addRule",
  updateRule: "/rules/updateRule/",
  getRuleById: "/rules/getRuleById/",
  deleteRule: "/rules/deleteRule/",

  forgotPassword: "/api/sendForgetPassword",



  // messages 
  getInboxMessages: "/messages/inbox",
  getSentMessages: "/messages/sent",
  getTrashedMessages: "/messages/getTrashedMessages",
  AddMessage: "/messages/add",
  moveMessageToTrash: "/messages/trash/",
  deleteMessageFromTrash: "/messages/deleteMessage",
  restoreTrashMessage: "/messages/restoreTrashedMessages",
  getMessageById: "/messages/getMessageById/",
  // PO
  getAllPO: "/po/getAllPOs",
  addPo: "/po/addPO",
  deletePo: "/po/deletePO/",
  editPo:"/po/editPO",
  getPoById: "/po/getPOById/",

//changeLog
getAllChangeLogs:"/logs/getAllChangeLogs",

};

