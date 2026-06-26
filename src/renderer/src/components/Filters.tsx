interface FiltersProps {
  search: string
  onSearchChange: (value: string) => void
  transport: string
  onTransportChange: (value: string) => void
  transports: string[]
}

export default function Filters({
  search,
  onSearchChange,
  transport,
  onTransportChange,
  transports
}: FiltersProps): React.JSX.Element {
  return (
    <div className="mb-4.5 flex gap-2.5">
      <div className="flex h-9.5 flex-1 items-center gap-2 rounded-lg border border-line-strong bg-surface px-3">
        <span className="h-3.25 w-3.25 flex-none rounded-full border-[1.5px] border-off" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search servers…"
          className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-faint-2"
        />
      </div>

      {/* Native <select>; the open popup uses platform styling, the closed control matches the theme. */}
      <div className="relative flex h-9.5 items-center rounded-lg border border-line-strong bg-surface">
        <select
          value={transport}
          onChange={(event) => onTransportChange(event.target.value)}
          className="h-full cursor-pointer appearance-none bg-transparent pl-3.5 pr-9 text-[13px] text-muted outline-none"
        >
          <option value="all">All transports</option>
          {transports.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 text-faint-2">▾</span>
      </div>
    </div>
  )
}
