import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes, ReactNode } from "react";

interface TableProps extends HTMLAttributes<HTMLTableElement> { children: ReactNode }
interface TableSectionProps extends HTMLAttributes<HTMLTableSectionElement> { children: ReactNode }
interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> { children: ReactNode }
interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> { children?: ReactNode }
interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> { children?: ReactNode }

export function Table({ className = "", children, ...props }: TableProps) {
  return <table className={`w-full text-sm ${className}`} {...props}>{children}</table>;
}
export function TableHeader({ className = "", children, ...props }: TableSectionProps) {
  return <thead className={`border-b bg-gray-50 ${className}`} {...props}>{children}</thead>;
}
export function TableBody({ className = "", children, ...props }: TableSectionProps) {
  return <tbody className={`divide-y ${className}`} {...props}>{children}</tbody>;
}
export function TableRow({ className = "", children, ...props }: TableRowProps) {
  return <tr className={`hover:bg-gray-50 ${className}`} {...props}>{children}</tr>;
}
export function TableHead({ className = "", children, ...props }: TableHeadProps) {
  return <th className={`px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 ${className}`} {...props}>{children}</th>;
}
export function TableCell({ className = "", children, ...props }: TableCellProps) {
  return <td className={`px-4 py-3 ${className}`} {...props}>{children}</td>;
}
