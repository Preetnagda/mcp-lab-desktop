import { Page, useNavigate } from '@renderer/navigation'

interface HeaderProps {
  currentPage: Page
}

export default function Header({ currentPage }: HeaderProps): React.JSX.Element {
  const navigate = useNavigate()
  const { title, backPage } = currentPage

  return (
    <div className="h-12 p-4 flex items-center gap-3">
      {backPage && (
        <button onClick={() => navigate({ page: backPage, args: undefined })}>← Back</button>
      )}
      <div>{title ?? 'MCP Lab'}</div>
    </div>
  )
}
