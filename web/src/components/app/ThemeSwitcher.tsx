import { useState } from 'react'

const THEMES = [
  { key: 'orange', color: 'oklch(0.68 0.20 48)', label: 'Warm Orange' },
  { key: 'green', color: 'oklch(0.62 0.15 162)', label: 'Warehouse Green' },
  { key: 'gray', color: 'oklch(0.35 0 0)', label: 'Graphite Gray' },
] as const

type ThemeKey = (typeof THEMES)[number]['key']

export default function ThemeSwitcher() {
  const [current, setCurrent] = useState<ThemeKey>(
    () => (window.localStorage.getItem('theme') as ThemeKey | null) ?? 'orange'
  )

  function applyTheme(key: ThemeKey) {
    document.documentElement.setAttribute('data-theme', key)
    window.localStorage.setItem('theme', key)
    setCurrent(key)
  }

  return (
    <div className="flex items-center gap-1.5">
      {THEMES.map(({ key, color, label }) => (
        <button
          key={key}
          type="button"
          title={label}
          aria-label={label}
          onClick={() => applyTheme(key)}
          style={{ backgroundColor: color }}
          className={`h-4 w-4 rounded-full transition-transform hover:scale-110 ${
            current === key ? 'scale-110 ring-2 ring-border ring-offset-2 ring-offset-background' : ''
          }`}
        />
      ))}
    </div>
  )
}
