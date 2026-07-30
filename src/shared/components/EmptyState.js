import PropTypes from "prop-types";
import { cn } from "@/shared/utils/cn";

export default function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
  compact = false,
  className,
}) {
  return (
    <div
      className={cn(
        "empty-state flex flex-col items-center justify-center text-center",
        compact ? "px-5 py-8" : "px-6 py-12",
        className
      )}
    >
      <div className="empty-state-icon mb-4 flex size-12 items-center justify-center rounded-2xl">
        <span className="material-symbols-outlined text-[24px]">{icon}</span>
      </div>
      <p className="text-sm font-semibold text-text-main">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm leading-6 text-text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.node,
  compact: PropTypes.bool,
  className: PropTypes.string,
};
