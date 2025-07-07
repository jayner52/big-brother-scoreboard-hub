import * as React from "react"

// Mobile breakpoints for responsive design
export const BREAKPOINTS = {
  xs: 320,
  sm: 375, 
  md: 414,
  lg: 768,
  xl: 1024
} as const

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.lg - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.lg)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < BREAKPOINTS.lg)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<keyof typeof BREAKPOINTS>('xl')

  React.useEffect(() => {
    const getBreakpoint = (): keyof typeof BREAKPOINTS => {
      const width = window.innerWidth
      if (width < BREAKPOINTS.xs) return 'xs'
      if (width < BREAKPOINTS.sm) return 'xs'
      if (width < BREAKPOINTS.md) return 'sm'
      if (width < BREAKPOINTS.lg) return 'md'
      return 'xl'
    }

    const updateBreakpoint = () => setBreakpoint(getBreakpoint())
    
    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return {
    breakpoint,
    isXs: breakpoint === 'xs',
    isSm: breakpoint === 'sm', 
    isMd: breakpoint === 'md',
    isLg: breakpoint === 'lg',
    isXl: breakpoint === 'xl',
    isMobile: breakpoint !== 'xl'
  }
}
