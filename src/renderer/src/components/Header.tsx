import { Page, useNavigate } from '@renderer/navigation'

interface HeaderProps {
  currentPage: Page
}

export default function Header({ currentPage }: HeaderProps): React.JSX.Element {
  const navigate = useNavigate()
  const { backPage } = currentPage

  return (
    <header className="flex h-10 flex-none items-center gap-3.5 border-b border-line bg-surface-2 px-4.5 [-webkit-app-region:drag]">
      {/* Fixed 36px leading slot — always reserves space so the logo never shifts.
          Empty on top-level pages; holds the back button on sub-pages. */}
      <div className="w-12"></div>
      <div className="h-6 w-9 flex-none">
        {backPage && (
          <button
            onClick={() => navigate({ page: backPage, args: undefined })}
            title="Back"
            className="flex h-6 w-9 items-center justify-center [-webkit-app-region:no-drag]"
          >
            <span className="-mt-0.5 text-lg leading-none">←</span>
          </button>
        )}
      </div>

      <button
        onClick={() => navigate({ page: 'dashboard', args: undefined })}
        className="flex items-center [-webkit-app-region:no-drag] justify-center pt-1"
        title="MCP Hub"
      >
        {/*<span className="h-6.5 w-6.5 rounded-[7px] bg-accent" />*/}
        <span className="font-brand text-xl text-ink">MCP&nbsp;Lab</span>
      </button>

      {/* TODO(ui): Settings page is not implemented yet — button is a placeholder. */}
      {/*<button
        title="Settings"
        className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg border border-line-strong bg-surface-3 hover:bg-badge [-webkit-app-region:no-drag]"
      >
        <span className="relative inline-block h-4 w-4 rounded-full border-[1.5px] border-muted-2">
          <span className="absolute inset-[3.5px] rounded-full bg-muted-2" />
        </span>
      </button>*/}
    </header>
  )
}
