import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type Likes = Record<string, number>

interface LikesContextValue {
  likes: Likes
  like: (slug: string) => void
  globalTotal: number
}

const STORAGE_KEY = 'v2-react-likes'

function load(): Likes {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (typeof parsed === 'object' && parsed !== null) return parsed as Likes
  } catch {
    // ignore
  }
  return {}
}

const LikesContext = createContext<LikesContextValue>({
  likes: {},
  like: () => {},
  globalTotal: 0,
})

export function LikesProvider({ children }: { children: ReactNode }) {
  const [likes, setLikes] = useState<Likes>(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(likes))
  }, [likes])

  const like = (slug: string) => {
    setLikes((prev) => ({ ...prev, [slug]: (prev[slug] ?? 0) + 1 }))
  }

  const globalTotal = Object.values(likes).reduce((sum, n) => sum + n, 0)

  return (
    <LikesContext.Provider value={{ likes, like, globalTotal }}>
      {children}
    </LikesContext.Provider>
  )
}

export function useLikes() {
  return useContext(LikesContext)
}
