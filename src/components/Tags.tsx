interface Tag {
  label: string;
  colorClass: string;
}

export function Tags({ items }: { items: Tag[] }) {
  if (!items?.length) return null
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {items.map((t) => (
        <span key={t.label} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border ${t.colorClass}`}>
          {t.label}
        </span>
      ))}
    </div>
  )
}


