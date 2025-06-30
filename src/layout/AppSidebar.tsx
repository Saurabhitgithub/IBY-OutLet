import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDownIcon, HorizontaLDots } from "../icons";
import { AiOutlineProduct } from "react-icons/ai";
import { IoCartOutline } from "react-icons/io5";
import { FaListCheck, FaPhone, FaCircleInfo, FaGlobe } from "react-icons/fa6";
import { FaUsers } from "react-icons/fa";
import { useSidebar } from "../context/SidebarContext";
import { CgMail, CgProfile } from "react-icons/cg";
import { IoCellularOutline } from "react-icons/io5";
import { RiDashboardFill } from "react-icons/ri";
import { getPermissionByRole } from "../services/apis";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  alwaysShow?: boolean; // Add this
  subItems?: {
    key: string;
    name: string;
    path: string;
    pro?: boolean;
    new?: boolean;
  }[];
};

const navItems: NavItem[] = [
  {
    icon: <RiDashboardFill />,
    name: "Dashboard",
    path: "dashboard",
  },
  {
    icon: <FaUsers />,
    name: "User Management",
    subItems: [{ key: "User", name: "Users List", path: "list" }],
  },
  {
    icon: <CgMail />,
    name: "Messages",
    path: "message",
  },
  {
    icon: <FaPhone />,
    name: "Manage Contacts",
    subItems: [
      { key: "Contact", name: "Contacts List", path: "contactsList" },
      { key: "Contact", name: "Contact", path: "/contacts" },
    ],
  },
  {
    icon: <FaListCheck />,
    name: "Manage Logs",
    subItems: [
      { key: "Log", name: "Logs", path: "logs" },
      { key: "", name: "Catalogue", path: "catalog" },
      { key: "", name: "Cross Ref", path: "cross" },
      { key: "", name: "Drive Info", path: "drive" },
      { key: "", name: "Log Of Reading Rules", path: "LORR" },
      { key: "", name: "Problems", path: "problems" },
      { key: "", name: "RFQ", path: "rfq" },
    ],
  },
  {
    icon: <IoCartOutline />,
    name: "Manage Jobs",
    subItems: [
      { key: "MTR", name: "MTR", path: "mtr" },
      { key: "", name: "PO", path: "po" },
    ],
  },
  {
    icon: <FaCircleInfo />,
    name: "Manage Info",
    subItems: [
      { key: "", name: "Schedules", path: "schedule" },
      { key: "FAQ", name: "FAQ", path: "faq" },
      { key: "", name: "Rules and Regulations", path: "rules" },
    ],
  },
  {
    icon: <FaGlobe />,
    name: "Manage Web",
    subItems: [
      { key: "", name: "Change Log", path: "changeLog" },
      { key: "", name: "Statement", path: "statement" },
      { key: "", name: "Business Line", path: "businessLine" },
      { key: "", name: "Manage Inventory", path: "manageInventory" },
      { key: "", name: "Timesheet Control", path: "timesheetControl" },
      { key: "", name: "Rule Location", path: "ruleLocation" },
      {
        key: "",
        name: "Function Authorization",
        path: "functionAuthorization",
      },
      { key: "", name: "Rule Authorizer", path: "ruleAuthorizer" },
    ],
  },
  {
    icon: <AiOutlineProduct />,
    name: "Manage Products",
    subItems: [
      { key: "Product", name: "Products", path: "products" },
      { key: "Quantity", name: "Manage Quantity", path: "managequantity" },
      { key: "Category", name: "Categories", path: "categories" },
      { key: "Sub-Category", name: "Sub Categories", path: "subcategories" },
      { key: "Price Share", name: "Price Share", path: "priceShare" },
      { key: "Item for Sale", name: "Item for Sale", path: "itemForSale" },
      { key: "View Stock", name: "View Stock", path: "viewStock" },
      {
        key: "Stock Statistic",
        name: "Stock Statistics",
        path: "stockStatistics",
      },
    ],
  },
  {
    icon: <IoCellularOutline />,
    name: "Manage Sales",
    subItems: [
      { key: "Title", name: "Company", path: "title" },
      { key: "Quote", name: "Quote", path: "quote" },
      { key: "Sales Order", name: "Sales", path: "sales" },
      {
        key: "Sales Order Statistics",
        name: "Sales Order Statistics",
        path: "salesStatistics",
      },
      {
        key: "Sales Profit By PN",
        name: "Sales Profit By PN",
        path: "salesProfit",
      },
    ],
  },
  {
    icon: <IoCartOutline />,
    name: "Manage AP",
    subItems: [
      { key: "", name: "Account Payable", path: "accountPayable" },
      { key: "", name: "Verify Account Payable", path: "verifyAccountPayable" },
    ],
  },
  {
    icon: <CgProfile />,
    name: "System",
    subItems: [
      { key: "Manage Code", name: "Manage Code", path: "manageCode" },
      {
        key: "Manage Department",
        name: "Manage Department",
        path: "manageDepartment",
      },
    ],
  },
  {
    icon: <CgProfile />,
    name: "Role Management",
    path: "roleManagement",
    alwaysShow: true, // Add this
  },
  // {
  //   icon: <CalenderIcon />,
  //   name: "Calendar",
  //   path: "/calendar",
  // },
  // {
  //   icon: <UserCircleIcon />,
  //   name: "User Profile",
  //   path: "/profile",
  // },
  // {
  //   name: "Forms",
  //   icon: <ListIcon />,
  //   subItems: [{ name: "Form Elements", path: "/form-elements", pro: false }],
  // },
  // {
  //   name: "Tables",
  //   icon: <TableIcon />,
  //   subItems: [{ name: "Basic Tables", path: "/basic-tables", pro: false }],
  // },
  // {
  //   name: "Pages",
  //   icon: <PageIcon />,
  //   subItems: [
  //     { name: "Blank Page", path: "/blank", pro: false },
  //     { name: "404 Error", path: "/error-404", pro: false },
  //   ],
  // },
];

const othersItems: NavItem[] = [
  // {
  //   icon: <PieChartIcon />,
  //   name: "Charts",
  //   subItems: [
  //     { name: "Line Chart", path: "/line-chart", pro: false },
  //     { name: "Bar Chart", path: "/bar-chart", pro: false },
  //   ],
  // },
  // {
  //   icon: <BoxCubeIcon />,
  //   name: "UI Elements",
  //   subItems: [
  //     { name: "Alerts", path: "/alerts", pro: false },
  //     { name: "Avatar", path: "/avatars", pro: false },
  //     { name: "Badge", path: "/badge", pro: false },
  //     { name: "Buttons", path: "/buttons", pro: false },
  //     { name: "Images", path: "/images", pro: false },
  //     { name: "Videos", path: "/videos", pro: false },
  //   ],
  // },
  // {
  //   icon: <PlugInIcon />,
  //   name: "Authentication",
  //   subItems: [
  //     { name: "Sign In", path: "/signin", pro: false },
  //     { name: "Sign Up", path: "/signup", pro: false },
  //   ],
  // },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [permissions, setPermissions] = useState<any[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [filteredNavItems, setFilteredNavItems] = useState<NavItem[]>(navItems);
  const [filteredOthersItems, setFilteredOthersItems] =
    useState<NavItem[]>(othersItems);

  useEffect(() => {
    const fetchPermissions = async () => {
      setLoadingPermissions(true);
      try {
        const role = localStorage.getItem("role");
        if (!role) return;
        const res = await getPermissionByRole({ role });
        let permissionTabs = [];
        if (res.data?.permission_tab) permissionTabs = res.data.permission_tab;
        else if (res.data?.data?.permission_tab)
          permissionTabs = res.data.data.permission_tab;
        else if (Array.isArray(res.data?.data))
          permissionTabs = res.data.data[0]?.permission_tab || [];
        setPermissions(permissionTabs || []);
      } catch (err) {
        console.error("Error fetching permissions:", err);
        setPermissions([]);
      } finally {
        setLoadingPermissions(false);
      }
    };
    fetchPermissions();
  }, []);
  const hasPermission = useCallback(
    (key: string | undefined, item: NavItem): boolean => {
      const userRole = localStorage.getItem("role");

      // Always show dashboard and message
      if (item.path === "dashboard" || item.path === "message") return true;

      // Restrict Role Management to general_manager only
      console.log(userRole,item.name === "Role Management"

      )
      if (item.name === "Role Management") {
        return userRole === "general_manager";
      }

      if (!key) return true;

      const tab = permissions.find(
        (p) => p.tab_name?.toLowerCase() === key.toLowerCase()
      );

      if (!tab || tab.is_show === false) return false;

      if (tab.tab_function?.length > 0) {
        return tab.tab_function.some((f: any) => f.is_showFunction === true);
      }

      return true;
    },
    [permissions]
  );

  useEffect(() => {
    if (loadingPermissions) return;

    const filterItems = (items: NavItem[]): NavItem[] => {
      return items
        .map((item) => {
          // Handle direct links
          if (!item.subItems) {
            return item.path
              ? hasPermission(item.name, item)
                ? item
                : null
              : item;
          }

          // Handle items with subItems
          const filteredSubItems = item.subItems.filter((subItem) =>
            hasPermission(subItem.key, item)
          );

          return filteredSubItems.length > 0
            ? { ...item, subItems: filteredSubItems }
            : null;
        })
        .filter(Boolean) as NavItem[];
    };
console.log(filterItems(navItems),"nav",filterItems(othersItems),"other")
    setFilteredNavItems(filterItems(navItems));
    setFilteredOthersItems(filterItems(othersItems));
  }, [loadingPermissions, permissions, hasPermission]);

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;

    const checkItems = (items: NavItem[], type: "main" | "others") => {
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({ type, index });
              submenuMatched = true;
            }
          });
        }
      });
    };

    checkItems(filteredNavItems, "main");
    checkItems(filteredOthersItems, "others");

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, filteredNavItems, filteredOthersItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      const ref = subMenuRefs.current[key];
      if (ref) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: ref.scrollHeight,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) =>
      prev?.type === menuType && prev.index === index
        ? null
        : { type: menuType, index }
    );
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={`${menuType}-${index}-${nav.name}`}>
          {nav.subItems ? (
            <>
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span className="menu-item-icon-size">{nav.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <>
                    <span className="menu-item-text">{nav.name}</span>
                    <ChevronDownIcon
                      className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                        openSubmenu?.type === menuType &&
                        openSubmenu?.index === index
                          ? "rotate-180 text-brand-500"
                          : ""
                      }`}
                    />
                  </>
                )}
              </button>

              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? `${subMenuHeight[`${menuType}-${index}`] || "auto"}px`
                      : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems.map((subItem, subIndex) => (
                    <li key={`${menuType}-${index}-${subIndex}`}>
                      <Link
                        to={subItem.path}
                        className={`menu-dropdown-item ${
                          isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                        }`}
                      >
                        {subItem.name}
                        {(subItem.new || subItem.pro) && (
                          <span className="flex items-center gap-1 ml-auto">
                            {subItem.new && (
                              <span className="menu-dropdown-badge">new</span>
                            )}
                            {subItem.pro && (
                              <span className="menu-dropdown-badge">pro</span>
                            )}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            nav.path &&
            hasPermission(nav.name, nav) && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span className="menu-item-icon-size">{nav.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/favicon.png"
                alt="Logo"
                width={60}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>

              {renderMenuItems(filteredNavItems, "main")}
            </div>
            {filteredOthersItems.length > 0 && (
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Others"
                  ) : (
                    <HorizontaLDots className="size-6" />
                  )}
                </h2>
                {renderMenuItems(filteredOthersItems, "others")}
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
