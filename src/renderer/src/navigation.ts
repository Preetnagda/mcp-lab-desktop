import { createContext, useContext } from 'react'

export interface Page {
  page: string
  args: unknown
  title?: string
  backPage?: string
}

export type NavigateFn = (page: Page) => void

const NavigationContext = createContext<NavigateFn | null>(null)

export function useNavigate(): NavigateFn {
  const navigate = useContext(NavigationContext)
  if (!navigate) throw new Error('useNavigate must be used within <NavigationProvider>')
  return navigate
}

export const NavigationProvider = NavigationContext.Provider
