"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaChevronRight } from "react-icons/fa";

export default function Breadcrumb() {
  const pathname = usePathname();

  // Generate breadcrumb dynamically based on the path
  const pathSegments = pathname.split("/").filter(Boolean);

  // Format segment name
  const formatSegment = (segment) => {
    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <nav className="bg-white border-b border-gray-200 py-3 px-6 shadow-sm">
      <ol className="flex items-center space-x-2 text-sm">
        {/* Home Link */}
        <li>
          <Link
            href="/"
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <FaHome className="mr-1" />
            <span className="font-medium">Home</span>
          </Link>
        </li>

        {/* Path Segments */}
        {pathSegments.map((segment, index) => {
          const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
          const isLast = index === pathSegments.length - 1;

          return (
            <li key={index} className="flex items-center">
              <FaChevronRight className="text-gray-400 mx-2 text-xs" />
              {isLast ? (
                <span className="text-blue-600 font-semibold">
                  {formatSegment(segment)}
                </span>
              ) : (
                <Link
                  href={href}
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                >
                  {formatSegment(segment)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
