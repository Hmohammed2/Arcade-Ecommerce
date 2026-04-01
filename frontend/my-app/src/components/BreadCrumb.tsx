import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-1"
            >
              {!isLast && item.href ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-gray-900 dark:hover:text-gray-100"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="font-medium text-gray-900 dark:text-gray-100"
                  aria-current="page"
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <span className="px-1 text-gray-400 dark:text-gray-500">/</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
