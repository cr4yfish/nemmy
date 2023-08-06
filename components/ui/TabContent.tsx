export default function TabContent({ text, icon }: { text: string; icon: string }) {
    return (
      <div className="flex items-center gap-1">
        <span
          className="material-symbols-outlined"
          style={{ fontSize: ".75rem" }}
        >
          {icon}
        </span>
        <span className="max-xs:hidden">{text}</span>
      </div>
    )
}