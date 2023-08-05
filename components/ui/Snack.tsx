export default function Snack({
  text,
  icon,
}: {
  text?: string;
  icon?: string;
}) {
  return (
    <div className="flex flex-row items-center gap-1 text-xs text-neutral-700 dark:text-neutral-400">
      <span
        className="material-symbols-outlined h-fit"
        style={{ fontSize: "1rem" }}
      >
        {icon}
      </span>
      <span>{text}</span>
    </div>
  );
}
