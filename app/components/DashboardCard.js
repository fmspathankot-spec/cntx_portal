import Link from 'next/link'

export default function DashboardCard({
  icon: Icon,
  title,
  description,
  buttonText,
  href,
  bgColor,
  hoverColor,
  titleColor,
  iconColor
}) {
  return (
    <div
      className={`${bgColor} ${hoverColor} p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl border border-gray-100`}
    >
      {/* Icon */}
      <div className={`${iconColor} mb-4`}>
        <Icon className="w-10 h-10" />
      </div>

      {/* Title */}
      <h2 className={`text-2xl font-semibold ${titleColor} mb-4`}>
        {title}
      </h2>

      {/* Description */}
      <p className="text-gray-700 mb-6 min-h-[60px] leading-relaxed">
        {description}
      </p>

      {/* Button */}
      <Link href={href}>
        <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm hover:shadow-md">
          {buttonText}
        </button>
      </Link>
    </div>
  )
}
