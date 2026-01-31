"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaClipboardList,
  FaNetworkWired,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";
import { MdPhoneInTalk, MdDashboard } from "react-icons/md";

const Sidebar = () => {
  const pathname = usePathname();
  const [expandedMenu, setExpandedMenu] = useState(null);

  const toggleMenu = (menu) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

  const isActive = (path) => pathname === path;

  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: MdDashboard,
    },
    {
      name: "OTN",
      icon: FaNetworkWired,
      submenu: [
        { name: "OTN Link Status", href: "/otn-route-status" },
        { name: "OTN Route Details", href: "/otn-route-details" },
        { name: "OTN Services Status", href: "/otn-service-failure-details" },
        { name: "OTN All Service Data", href: "/otn-all-services-detail" },
      ],
    },
    {
      name: "CPAN",
      icon: FaNetworkWired,
      submenu: [
        { name: "CPAN Link Status", href: "/cpan-link-status" },
        { name: "CPAN Link Detail", href: "/cpan-link-detail" },
      ],
    },
    {
      name: "MAAN",
      icon: FaNetworkWired,
      submenu: [
        { name: "MAAN Node Status", href: "/maan-ping" },
        { name: "OTN Port Status", href: "/otn-port-status" },
        { name: "Project Topology", href: "/project-topology" },
      ],
    },
    {
      name: "Reports",
      href: "/reports",
      icon: FaClipboardList,
    },
    {
      name: "Contact",
      href: "/contact",
      icon: MdPhoneInTalk,
    },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white shadow-2xl hidden lg:flex lg:flex-col h-screen sticky top-0">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <FaNetworkWired className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              CNTX Portal
            </h1>
            <p className="text-xs text-slate-400">Network Monitoring</p>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="p-4 space-y-2 overflow-y-auto flex-1">
        {menuItems.map((item, index) => (
          <div key={index}>
            {item.submenu ? (
              // Menu with submenu
              <div>
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                    expandedMenu === item.name
                      ? "bg-slate-700 text-white"
                      : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="text-lg" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {expandedMenu === item.name ? (
                    <FaChevronDown className="text-sm" />
                  ) : (
                    <FaChevronRight className="text-sm" />
                  )}
                </button>

                {/* Submenu */}
                {expandedMenu === item.name && (
                  <div className="mt-2 ml-4 space-y-1 border-l-2 border-slate-700 pl-4">
                    {item.submenu.map((subitem, subindex) => (
                      <Link
                        key={subindex}
                        href={subitem.href}
                        className={`block px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                          isActive(subitem.href)
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                            : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                        }`}
                      >
                        {subitem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Simple menu item
              <Link
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                }`}
              >
                <item.icon className="text-lg" />
                <span className="font-medium">{item.name}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Footer - Fixed at bottom */}
      <div className="p-4 border-t border-slate-700 bg-slate-900 flex-shrink-0">
        <div className="text-center">
          <p className="text-xs text-slate-400">Version 1.0.0</p>
          <p className="text-xs text-slate-500 mt-1">© 2024 FMS Pathankot</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
