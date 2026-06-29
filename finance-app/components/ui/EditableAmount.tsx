'use client'

import { useState, useRef } from 'react'

interface Props {
  value: number
  onChange: (val: number) => void
  className?: string
  prefix?: string
}

export default function EditableAmount({ value, onChange, className = '', prefix = '$' }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setDraft(String(value))
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function commit() {
    const n = parseFloat(draft.replace(/[^0-9.-]/g, ''))
    if (!isNaN(n) && n >= 0) onChange(Math.round(n * 100) / 100)
    setEditing(false)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKey}
        className={`editable-cell text-sm w-24 ${className}`}
        min={0}
        step={1}
      />
    )
  }

  return (
    <span
      onClick={startEdit}
      title="Click to edit"
      className={`cursor-pointer hover:text-indigo-700 font-medium ${className}`}
    >
      {prefix}{value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
    </span>
  )
}
