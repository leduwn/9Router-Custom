import PropTypes from "prop-types";
import { cn } from "@/shared/utils/cn";

const sizes = {
  sm: "size-7 rounded-[9px]",
  md: "size-9 rounded-[11px]",
  lg: "size-12 rounded-[15px]",
  xl: "size-16 rounded-[20px]",
};

export default function BrandMark({ size = "md", className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "brand-mark relative inline-flex shrink-0 items-center justify-center overflow-hidden",
        sizes[size],
        className
      )}
    >
      <svg viewBox="0 0 28 28" className="size-[68%]" fill="none">
        <path
          d="M7.5 6.5h6.2c4.55 0 7.3 2.8 7.3 7.5s-2.75 7.5-7.3 7.5H7.5v-15Zm4.05 3.45v8.1h1.8c2.25 0 3.55-1.42 3.55-4.05s-1.3-4.05-3.55-4.05h-1.8Z"
          fill="currentColor"
        />
        <circle cx="21.35" cy="6.65" r="1.7" fill="currentColor" opacity=".72" />
      </svg>
    </span>
  );
}

BrandMark.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  className: PropTypes.string,
};
