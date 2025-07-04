interface ComponentCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  desc?: string;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
}) => {
  return (
  <div
  className={`component-card rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
>

      {/* Card Header */}
      {title && (
        <div className="px-6 py-5">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
            {title}
          </h3>
          {desc && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {desc}
            </p>
          )}
        </div>
      )}

      {/* Card Body */}
      <div
        className={`p-4 sm:p-6 ${
          title ? "border-t border-gray-100 dark:border-gray-800" : ""
        }`}
      >
        {/* Scrollable table container (only scrolls inside if table overflows) */}
        <div className="overflow-x-auto">
          {/* Table content (applies min-width only when needed) */}
          {/* <div className="min-w-[1600px] xl:min-w-full space-y-6"> */}
          <div className="min-w-[1600px] xl:min-w-full space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentCard;