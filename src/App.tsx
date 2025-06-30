import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import { Logs } from "./pages/ManageLogs/Logs";
import CreateUpdateLog from "./pages/ManageLogs/CreateUpdateLog";
import { AddUser } from "./pages/UserManagement/AddUser";
import { UserList } from "./pages/UserManagement/UsersList";
import { EditUser } from "./pages/UserManagement/EditUser";
import { Catalogue } from "./pages/ManageLogs/Catalogue";
import { CatalogUpdate } from "./pages/ManageLogs/CatalogUpdate";
// import { EditCatalogue } from "./pages/ManageLogs/EditCatalogue";
import { RoleManagement } from "./pages/RoleManagement/RoleManagement";
import { UpdateAccess } from "./pages/RoleManagement/UpdateAccess";
import MtrListing from "./pages/ManageJobs/MTR/MtrListing";
import AddAndUpdateMtr from "./pages/ManageJobs/MTR/AddAndUpdateMtr";
import { Categories } from "./pages/ManageProducts/Categories";
import CreateUpdateCategory from "./pages/ManageProducts/CreateUpdateCategory";
import { SubCategory } from "./pages/ManageProducts/SubCategories/SubCategory";
import CreateUpdateSubCategory from "./pages/ManageProducts/SubCategories/CreateUpdateSubCategory";
import { Products } from "./pages/ManageProducts/Products/Products";
import { Sales } from "./pages/ManageSales/Sales";
import { CrossRef } from "./pages/ManageLogs/CrossInfo/CrossRef";
import { AddInvoice } from "./pages/ManageSales/AddInvoice";
import { AddTitle } from "./pages/ManageSales/AddTitle";
import { Title } from "./pages/ManageSales/Title";
import { EditTitle } from "./pages/ManageSales/EditTitle";
import AddCrossRef from "./pages/ManageLogs/CrossInfo/AddCrossRef";
import { EditCrossRef } from "./pages/ManageLogs/CrossInfo/EditCrossRef";
import AddAnotherCrossRef from "./pages/ManageLogs/CrossInfo/AddAnotherCrossRef";
import { DriveinfoUI } from "./pages/ManageLogs/DriveInfo/DriveinfoUI";
import { AddDriveInfo } from "./pages/ManageLogs/DriveInfo/AddDriveInfo";
import { CounterItem } from "./pages/ManageLogs/DriveInfo/CounterItem";
import EditDriveInfo from "./pages/ManageLogs/DriveInfo/EditDriveInfo";
import { ManageDepartments } from "./pages/System/ManageDepartment/ManageDepartments";
import CreateUpdateDepartment from "./pages/System/ManageDepartment/CreateUpdateDepartment";
import { ManageQuantity } from "./pages/ManageProducts/ManageQuantity/ManageQuantity";
// import { CreateUpdateProcedure } from "./pages/ManageProducts/ManageQuantity/CreateUpdateProcedure";
import { ProceduresManagement } from "./pages/ManageProducts/ManageQuantity/ProceduresManagement";
import { UpdateQuantity } from "./pages/ManageProducts/ManageQuantity/UpdateQuantity";
import { ViewStockList } from "./pages/ManageProducts/ManageQuantity/ViewStockList";
import { StockHistory } from "./pages/ManageProducts/ManageQuantity/StockHistory";
import { CreateUpdateProduct } from "./pages/ManageProducts/Products/CreateUpdateProduct";
import { ProductStock } from "./pages/ManageProducts/Products/ProductStock";
import { AddStock } from "./pages/ManageProducts/Products/AddStock";
 
import { SalesPayment } from "./pages/ManageSales/SalesPayment";
import { AddSales } from "./pages/ManageSales/AddSales";
import { AddSales2 } from "./pages/ManageSales/AddSales2";
import { EditPacking } from "./pages/ManageSales/EditPackingList";
import { DeliveryTicket } from "./pages/ManageSales/DeliveryTicket";
import { SONumber } from "./pages/ManageSales/SONumber";
import { ViewCountDetailsInfo } from "./pages/ManageLogs/DriveInfo/ViewCountDetailsInfo";
import { LogOfReadingRules } from "./pages/ManageLogs/LogOfReadingRules/LogOfReadingRules";
import { ProblemsUI } from "./pages/ManageLogs/Problems/Problems";
 
import { PriceShare } from "./pages/ManageProducts/PriceShare/PriceShare";
import { ItemForSale } from "./pages/ManageProducts/ItemForSale/ItemForSale";
import { ViewStock } from "./pages/ManageProducts/StockList/ViewStock";
import { StockStatistics } from "./pages/ManageProducts/StockStatistics/StockStatistics";
 
import { AddProblems } from "./pages/ManageLogs/Problems/AddProblems";
import { EditProblems } from "./pages/ManageLogs/Problems/EditProblems";
import { AddSolution } from "./pages/ManageLogs/Problems/AddSolution";
import { CodeManagement } from "./pages/System/ManageCodes/CodeManagement";
import { CreateUpdateCode } from "./pages/System/ManageCodes/CreateUpdateCode";
 
import { Quotation } from "./pages/ManageSales/Quote/Quotation";
import { AddQuote } from "./pages/ManageSales/Quote/AddQuotation";
import { AddItem } from "./pages/ManageSales/Quote/AddItem";
import { StockListing } from "./pages/ManageSales/Quote/StockListing";
import { QuotationItem } from "./pages/ManageSales/Quote/QuotationItem";
 
import { Rfq } from "./pages/ManageLogs/RFQ/Rfq";
import { AccountPayable } from "./pages/ManageAp/AccountPayable/AccountPayable";
import { AddNewPayable } from "./pages/ManageAp/AccountPayable/AddNewPayable";
import { VerifyAccountPayable } from "./pages/ManageAp/VerifyAccountPayable/VerifyAccountPayable";
import { SalesOrderByStats } from "./pages/ManageSales/SalesOrder/SalesOrderStats";
import { SalesProfitByPN } from "./pages/ManageSales/SalesOrder/SalesProfitByPN";
import { ChangeLog } from "./pages/ManageWeb/Changelog";
import { Statement } from "./pages/ManageWeb/Statement";
import { AddUpdateStatement } from "./pages/ManageWeb/AddUpdateStatement";
import { BusinessLine } from "./pages/ManageWeb/BusinessLine";
import { AddUpdateBusiness } from "./pages/ManageWeb/AddUpdateBusinessLine";
import { ManageInventory } from "./pages/ManageWeb/ManageInventory";
import { AuthorizeInventory } from "./pages/ManageWeb/AuthorizeInventory";
import { AddRfq } from "./pages/ManageLogs/RFQ/AddRfq";
import { AddPo } from "./pages/ManageJobs/PO/AddPo";
import { Po } from "./pages/ManageJobs/PO/Po";
import { FunctionAuthorization } from "./pages/ManageWeb/FunctionAuthorization";
import { RuleAuthorizer } from "./pages/ManageWeb/RuleAuthorizer";
import { Timesheet } from "./pages/ManageWeb/TimesheetContol";
import { RuleLocation } from "./pages/ManageWeb/RuleLocation";
import { AddUpdateRuleAuthorize } from "./pages/ManageWeb/AddUpdateRuleAuthorize";
import { AddUpdateRuleLocation } from "./pages/ManageWeb/AddUpdateRuleLocation";
import { AddUpdateFunctionAuthorize } from "./pages/ManageWeb/AddUpdateFunctionAuthorize";
import { AddUpdateTimesheet } from "./pages/ManageWeb/AddUpdateTimesheet";
import { AddRfqStats } from "./pages/ManageLogs/RFQ/AddRfqStats";
import { AddRfqProduct } from "./pages/ManageLogs/RFQ/AddRfqProducts";
import { ContactsList } from "./pages/ManageContacts/ContactList";
import { FAQ } from "./pages/ManageInfo/FAQ";
import { Schedules } from "./pages/ManageInfo/Schedules";
import { RulesAndRegulation } from "./pages/ManageInfo/RulesAndregulations";
import { AddUpdateSchedule } from "./pages/ManageInfo/AddUpdateSchedule";
import { AddUpdateFAQ } from "./pages/ManageInfo/AddUpdateFAQ";
import { AnswerFAQ } from "./pages/ManageInfo/AnswerFAQ";
import { ShowFAQ } from "./pages/ManageInfo/ShowFAQ";
import { AddUpdateRules } from "./pages/ManageInfo/AddUpdateRules";
import { Contacts } from "./pages/ManageContacts/Contacts";
import { AddOtherContacts } from "./pages/ManageContacts/AddOtherContactsList";
import { Messages } from "./pages/Messages/Messages";
import { ReplyForward } from "./pages/Messages/ReplyForward";
import { ReadMessage } from "./pages/Messages/ReadMessage";
import ForgetPassword from "./pages/AuthPages/ForgetPasword";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import { AddContactsList } from "./pages/ManageContacts/AddContactsList";
import { PoItemDetails } from "./pages/ManageJobs/PO/PoItemDetails";
import { EditProcess } from "./pages/ManageJobs/PO/EditProcess";
import { ToastContainer } from "react-toastify";
import { LogsFiles } from "./pages/ManageLogs/LogsFiles";
import "react-toastify/dist/ReactToastify.css";
import { AddProcess } from "./pages/ManageJobs/PO/AddProcess";
import { ViewStatistics } from "./pages/ManageProducts/StockStatistics/ViewStatistics";
import { HistoryStatistics } from "./pages/ManageProducts/StockStatistics/HistoryStatistics";
import { SalesCommission } from "./pages/ManageSales/SalesOrder/Commission";
import { SalesCommissionby3A } from "./pages/ManageSales/SalesOrder/CommissionBy3A";
import { SalesOrderHistoryByProducts } from "./pages/ManageSales/SalesOrder/SalesOrderHistoryByProducts";
import { CreateProcedure } from "./pages/ManageProducts/ManageQuantity/CreateProcedure";
import { UpdateProcedure } from "./pages/ManageProducts/ManageQuantity/UpdateProcedure";
import { VerifyArrival } from "./pages/ManageProducts/ManageQuantity/VerifyArrival";
import { DoubleCheck } from "./pages/ManageProducts/ManageQuantity/DoubleCheck";
import { PaymentManagement } from "./pages/ManageSales/PaymentManagement";
import ForgetPasswordForm from "./components/auth/ForgetPaswordForm";
import { AddSimilar } from "./pages/ManageProducts/Products/AddSimilar";
 
 
 
 
const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("token");
};
 
const ProtectedRoute: React.FC<{ children: any }> = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/signin" />;
};
 
const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <ToastContainer
        position="bottom-left"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
 
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/forgotpassword" element={<ForgetPasswordForm />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgetpassword" element={<ForgetPassword />} />
        <Route path="/resetpassword/:id" element={<ResetPassword />} />
 
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index path="/" element={<Home />} />
          <Route index path="/Dashboard" element={<Home />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/list" element={<UserList />} />
          <Route path="/add" element={<AddUser />} />
          <Route path="/edit/:id" element={<EditUser />} />
          <Route path="/catalog" element={<Catalogue />} />
          <Route path="/addCatalog" element={<CatalogUpdate />} />
          <Route path="/editCatalog/:id" element={<CatalogUpdate />} />
          <Route path="/roleManagement" element={<RoleManagement />} />
         <Route path="/updateAccess/:roleName" element={<UpdateAccess />} />
          <Route path="/mtr" element={<MtrListing />} />
          <Route path="/mtr/add" element={<AddAndUpdateMtr />} />
          <Route path="/mtr/update/:id" element={<AddAndUpdateMtr />} />
          <Route path="/po" element={<Po />} />
          <Route path="/po/add" element={<AddPo />} />
          <Route path="/po/edit/:id" element={<AddPo />} />
          <Route path="/po/itemDetails" element={<PoItemDetails />} />
          <Route path="/po/editProcess" element={<EditProcess />} />
          <Route path="/po/addProcess" element={<AddProcess />} />
          <Route path="/logs/add" element={<CreateUpdateLog />} />
          <Route path="/logs/update/:id" element={<CreateUpdateLog />} />
          <Route path="/logsfiles/:id" element={<LogsFiles />} />
          {/* <Route path="/logs/update/:id/:sqlId" element={<CreateUpdateLog />} /> */}
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/add" element={<CreateUpdateCategory />} />
          <Route
            path="/categories/update/:ids"
            element={<CreateUpdateCategory />}
          />
          <Route path="/subcategories" element={<SubCategory />} />
          <Route
            path="/subcategories/add"
            element={<CreateUpdateSubCategory />}
          />
          <Route
            path="/subcategories/update/:ids"
            element={<CreateUpdateSubCategory />}
          />
          <Route path="/products" element={<Products />} />
          <Route path="/products/add" element={<CreateUpdateProduct />} />
          <Route path="/products/addSimilar/:id" element={<AddSimilar />} />
          <Route
            path="/products/update/:id"
            element={<CreateUpdateProduct />}
          />
          <Route
            path="/products/procedure/:id"
            element={<ProceduresManagement />}
          />
 
          <Route path="/products/stockManagement/:id" element={<ProductStock />} />
          <Route path="/products/stockManagement/add/:pid" element={<AddStock />} />
          <Route
            path="/products/stockManagement/update/:pid/:id/:idd"
            element={<AddStock />}
          />
          {/* Manage Info */}
          <Route path="/schedule" element={<Schedules />} />
          <Route path="/rules" element={<RulesAndRegulation />} />
          <Route path="/addRule" element={<AddUpdateRules />} />
          <Route path="/editRule/:id" element={<AddUpdateRules />} />
          <Route path="/addSchedule" element={<AddUpdateSchedule />} />
          <Route path="/editSchedule/:id" element={<AddUpdateSchedule />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/addFAQ" element={<AddUpdateFAQ />} />
          <Route path="/editFAQ/:id" element={<AddUpdateFAQ />} />
          <Route path="/answerFAQ/:id" element={<AnswerFAQ />} />
          <Route path="/editanswerFAQ/:id" element={<AnswerFAQ />} />
          <Route path="/showFAQ/:id" element={<ShowFAQ />} />
          {/* Messages */}
          <Route path="/message" element={<Messages />} />
          <Route path="/reply/:id" element={<ReplyForward />} />
          <Route path="/forward/:id" element={<ReplyForward />} />
          <Route path="/readMessage/:id" element={<ReadMessage />} />
          {/* Manage Sales */}
          <Route path="/sales" element={<Sales />} />
          <Route path="/addSales" element={<AddSales />} />
          <Route path="/modifySales/:id" element={<AddSales />} />
          <Route path="/addSales2/:id" element={<AddSales2 />} />
          <Route path="/salesPayment/:id" element={<SalesPayment />} />
          <Route path="/paymentManagement/:id/:invoiceid/:salesdid" element={<PaymentManagement />} />
          <Route path="/invoice/:sid" element={<AddInvoice />} />
          <Route path="/editinvoice/:id/:sid" element={<AddInvoice />} />
          <Route path="/editpacking/:id/:pid" element={<EditPacking />} />{" "}
          <Route path="/deliveryTicket/:id/:pid" element={<DeliveryTicket />} />
          <Route path="/soNumber/:id" element={<SONumber />} />
          <Route path="/modifysoNumber" element={<SONumber />} />
          <Route path="/quote" element={<Quotation />} />
          <Route path="/addQuote" element={<AddQuote />} />
          <Route path="/editQuote/:id" element={<AddQuote />} />
          <Route path="/stockList/:id" element={<StockListing />} />
          <Route path="/addItem/:pid/:id" element={<AddItem />} />
          <Route path="/editItem/:id" element={<AddItem />} />
          <Route path="/quotationItem/:id" element={<QuotationItem />} />
          <Route path="/salesStatistics" element={<SalesOrderByStats />} />
          <Route path="/commission" element={<SalesCommission />} />
          <Route path="/commissionby3A" element={<SalesCommissionby3A />} />
          <Route path="/salesOrderHistory/:id" element={<SalesOrderHistoryByProducts />} />
          <Route path="/salesProfit" element={<SalesProfitByPN />} />
          <Route path="/cross" element={<CrossRef />} />
          <Route path="/cross/addCrossRef" element={<AddCrossRef />} />
          <Route path="/cross/editCrossRef/:id" element={<EditCrossRef />} />
          <Route path="/cross/addAnother" element={<AddAnotherCrossRef />} />
          <Route path="/manageDepartment" element={<ManageDepartments />} />
          <Route
            path="/manageDepartment/create"
            element={<CreateUpdateDepartment />}
          />
          <Route
            path="/manageDepartment/update/:id"
            element={<CreateUpdateDepartment />}
          />
          <Route path="/managequantity" element={<ManageQuantity />} />
          <Route
            path="/managequantity/procedure/:id"
            element={<ProceduresManagement />}
          />
          <Route
            path="/managequantity/procedure/create/:pid"
            element={<CreateProcedure />}
          />
          {/* <Route
            path="/managequantity/procedure/create/:pid"
            element={<CreateUpdateProcedure />}
          /> */}
          <Route
            path="/managequantity/procedure/update/:pid/:id/:mid"
            element={<UpdateProcedure />}
          />
          {/* <Route
            path="/managequantity/procedure/update/:pid/:id"
            element={<CreateUpdateProcedure />}
          /> */}
          <Route
            path="/managequantity/updateQuantity/:id"
            element={<UpdateQuantity />}
          />
          <Route
            path="/managequantity/procedure/verify/:mid/:id/:pid"
            element={<VerifyArrival />}
          />
          <Route
            path="/managequantity/procedure/doubleCheck/:mid/:id/:pid"
            element={<DoubleCheck />}
          />
          <Route
            path="/managequantity/viewStockList/:id"
            element={<ViewStockList />}
          />
          <Route
            path="/managequantity/procedure"
            element={<ProceduresManagement />}
          />
          <Route
            path="/managequantity/stockHistory/:id"
            element={<StockHistory />}
          />
          <Route path="/priceShare" element={<PriceShare />} />
          <Route path="/priceShare" element={<PriceShare />} />
          <Route path="/itemForSale" element={<ItemForSale />} />
          <Route path="/viewStock" element={<ViewStock />} />
          <Route path="/stockStatistics" element={<StockStatistics />} />
          <Route path="/stockStatistics/view" element={<ViewStatistics />} />
          <Route
            path="/stockStatistics/history"
            element={<HistoryStatistics />}
          />
          <Route path="/manageCode" element={<CodeManagement />} />
          <Route path="/manageCode/add" element={<CreateUpdateCode />} />
          <Route path="/manageCode/edit/:id" element={<CreateUpdateCode />} />
          <Route path="/priceShare" element={<PriceShare />} />
          <Route path="/priceShare" element={<PriceShare />} />
          <Route path="/itemForSale" element={<ItemForSale />} />
          <Route path="/viewStock" element={<ViewStock />} />
          <Route path="/stockStatistics" element={<StockStatistics />} />
          <Route path="/accountPayable" element={<AccountPayable />} />
          <Route
            path="/accountPayable/newAccountPayable"
            element={<AddNewPayable />}
          />
          <Route
            path="/accountPayable/editAccountPayable/:id"
            element={<AddNewPayable />}
          />
          <Route
            path="/verifyAccountPayable"
            element={<VerifyAccountPayable />}
          />
          <Route path="/title" element={<Title />} />
          <Route path="/title/addTitle" element={<AddTitle />} />
          <Route path="/edit-title/:id" element={<EditTitle />} />
          <Route path="/changeLog" element={<ChangeLog />} />
          <Route path="/statement" element={<Statement />} />
          <Route path="/addUpdate" element={<AddUpdateStatement />} />
          <Route path="/editUpdate/:id" element={<AddUpdateStatement />} />
          <Route path="/businessLine" element={<BusinessLine />} />
          <Route path="/addUpdatebusiness" element={<AddUpdateBusiness />} />
          <Route path="/editbusiness/:id" element={<AddUpdateBusiness />} />
          <Route path="/manageInventory" element={<ManageInventory />} />
           <Route path="/authorize/:id/:pid" element={<AuthorizeInventory />} />
          <Route path="/timesheetControl" element={<Timesheet />} />
          <Route path="/ruleLocation" element={<RuleLocation />} />
          <Route
            path="/functionAuthorization"
            element={<FunctionAuthorization />}
          />
          <Route path="/ruleAuthorizer" element={<RuleAuthorizer />} />
          <Route
            path="/addRulesAuthorize"
            element={<AddUpdateRuleAuthorize />}
          />
          <Route
            path="/editRulesAuthorize/:id"
            element={<AddUpdateRuleAuthorize />}
          />
          <Route path="/addRulesLocation" element={<AddUpdateRuleLocation />} />
          <Route
            path="/editRulesLocation/:id"
            element={<AddUpdateRuleLocation />}
          />
          <Route
            path="/addfuctionAuthorize"
            element={<AddUpdateFunctionAuthorize />}
          />
          <Route
            path="/editfuctionAuthorize/:id"
            element={<AddUpdateFunctionAuthorize />}
          />
    {/* <Route path="/reset-password" element={<ResetPasswordForm />} /> */}

          <Route path="/addTimesheet" element={<AddUpdateTimesheet />} />
          <Route path="/editTimesheet/:id" element={<AddUpdateTimesheet />} />
          {/* DriveInfo */}
          <Route path="/drive" element={<DriveinfoUI />} />
          <Route path="/drive/addDriveInfo" element={<AddDriveInfo />} />
          <Route path="/drive/editDriveInfo/:id" element={<EditDriveInfo />} />
          <Route path="/drive/counterInfo" element={<CounterItem />} />
          <Route
            path="/drive/viewcounterInfo"
            element={<ViewCountDetailsInfo />}
          />
          {/* Log of Reading Rules */}
          <Route path="/LORR" element={<LogOfReadingRules />} />
          {/* Problems */}
          <Route path="/problems" element={<ProblemsUI />} />
          <Route path="/problems/addProblems" element={<AddProblems />} />
          <Route path="/problems/editProblems/:id" element={<EditProblems />} />
          <Route path="/problems/addSolution/:id" element={<AddSolution />} />
          {/* RFQ */}
          <Route path="/rfq" element={<Rfq />} />
          <Route path="/rfq/addRfq" element={<AddRfq />} />
          <Route path="/rfq/editRfq/:id" element={<AddRfq />} />
          <Route path="/rfq/addStats/:statsId" element={<AddRfqStats />} />
          <Route path="/rfq/editStats/:rfqID/:id" element={<AddRfqStats />} />
       <Route path="/rfq/editRfqProduct/:rfqId/:id" element={<AddRfqProduct />} />
              <Route path="/rfq/addRfqProduct/:rfqId" element={<AddRfqProduct />} />
          {/* Manage Contacts */}
          {/* ContactList  */}
          <Route path="/contactsList" element={<ContactsList />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/addOtherContacts" element={<AddOtherContacts />} />
          <Route path="/editOtherContacts/:id" element={<AddOtherContacts />} />
          <Route path="/addcontactsList" element={<AddContactsList />} />
          <Route path="/editcontactsList/:id" element={<AddContactsList />} />
          {/* User Management */}
          {/* Other Pages */}
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/blank" element={<Blank />} />
          {/* Forms */}
          <Route path="/form-elements" element={<FormElements />} />
          {/* Tables */}
          <Route path="/basic-tables" element={<BasicTables />} />
          {/* UI Elements */}
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/avatars" element={<Avatars />} />
          <Route path="/badge" element={<Badges />} />
          <Route path="/buttons" element={<Buttons />} />
          <Route path="/images" element={<Images />} />
          <Route path="/videos" element={<Videos />} />
          {/* Charts */}
          <Route path="/line-chart" element={<LineChart />} />
          <Route path="/bar-chart" element={<BarChart />} />
          <Route path="/salesPayment/:id/:invoiceid/:salesdid" element={<SalesPayment />} />
        </Route>
 
        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};
 
export default App;
 