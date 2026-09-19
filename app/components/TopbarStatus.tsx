'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

// Topbar is rendered by the layout — a sibling of the page content, not a
// parent of it — so a page has no prop path to put anything inside it.
// This bridges that gap: a page renders <TopbarStatus> around whatever it
// wants shown next to the week selector, and <TopbarStatusSlot> (inside
// Topbar) renders it there. Outside a <TopbarStatusProvider> (e.g. the
// employee layout, which doesn't need this) both are harmless no-ops.
const TopbarStatusContext = createContext<{
  content: ReactNode
  setContent: (content: ReactNode) => void
} | null>(null)

export function TopbarStatusProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ReactNode>(null)
  return (
    <TopbarStatusContext.Provider value={{ content, setContent }}>
      {children}
    </TopbarStatusContext.Provider>
  )
}

export function TopbarStatusSlot() {
  const ctx = useContext(TopbarStatusContext)
  return <>{ctx?.content}</>
}

export function TopbarStatus({ children }: { children: ReactNode }) {
  const ctx = useContext(TopbarStatusContext)
  useEffect(() => {
    ctx?.setContent(children)
    return () => ctx?.setContent(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children])
  return null
}
