'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'

export interface StatusOption {
    value: string
    label: string
    color: string
}

interface StatusDropdownProps {
    current: string
    options: StatusOption[]
    onChange: (value: string) => void
    disabled?: boolean
}

export function StatusDropdown({ current, options, onChange, disabled }: StatusDropdownProps) {
    const [open, setOpen] = useState(false)
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
    const triggerRef = useRef<HTMLButtonElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    const currentOption = options.find(o => o.value === current) ?? {
        value: current,
        label: current.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        color: '#6b7280',
    }

    // Compute fixed position of dropdown based on trigger button position
    const openDropdown = useCallback(() => {
        if (!triggerRef.current) return
        const rect = triggerRef.current.getBoundingClientRect()
        const dropdownHeight = options.length * 56 + 16 // approximate
        const spaceBelow = window.innerHeight - rect.bottom
        const showAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight

        setDropdownStyle({
            position: 'fixed',
            left: rect.left,
            width: rect.width,
            zIndex: 9999,
            ...(showAbove
                ? { bottom: window.innerHeight - rect.top + 8 }
                : { top: rect.bottom + 8 }),
        })
        setOpen(true)
    }, [options.length])

    // Close on outside click or scroll
    useEffect(() => {
        if (!open) return
        const close = (e: MouseEvent | Event) => {
            if (
                triggerRef.current?.contains(e.target as Node) ||
                dropdownRef.current?.contains(e.target as Node)
            ) return
            setOpen(false)
        }
        document.addEventListener('mousedown', close)
        window.addEventListener('scroll', close, true)
        window.addEventListener('resize', () => setOpen(false))
        return () => {
            document.removeEventListener('mousedown', close)
            window.removeEventListener('scroll', close, true)
            window.removeEventListener('resize', () => setOpen(false))
        }
    }, [open])

    const dropdown = open && mounted ? createPortal(
        <div
            ref={dropdownRef}
            style={{
                ...dropdownStyle,
                background: '#111113',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '1rem',
                boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
                overflow: 'hidden',
                padding: '8px 0',
            }}
        >
            {options.map(option => {
                const isSelected = option.value === current
                return (
                    <button
                        key={option.value}
                        type="button"
                        onMouseDown={e => {
                            e.preventDefault()
                            onChange(option.value)
                            setOpen(false)
                        }}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '14px 20px',
                            background: isSelected ? 'rgba(255,255,255,0.06)' : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                            fontFamily: "'Cambria Math', Cambria, Georgia, serif",
                        }}
                        onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
                        onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <span style={{
                                width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0,
                                backgroundColor: option.color,
                                boxShadow: isSelected ? `0 0 8px ${option.color}` : 'none',
                            }} />
                            <span style={{
                                color: isSelected ? '#ffffff' : '#d1d5db',
                                fontSize: '15px',
                                fontWeight: isSelected ? '600' : '400',
                                fontFamily: "'Cambria Math', Cambria, Georgia, serif",
                            }}>
                                {option.label}
                            </span>
                        </span>
                        {isSelected && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        )}
                    </button>
                )
            })}
        </div>,
        document.body
    ) : null

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                disabled={disabled}
                onClick={() => open ? setOpen(false) : openDropdown()}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '14px 20px',
                    borderRadius: '1rem',
                    border: `2px solid ${currentOption.color}`,
                    background: '#0a0a0a',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.5 : 1,
                    boxShadow: open ? `0 0 0 1px ${currentOption.color}40, 0 0 16px ${currentOption.color}20` : 'none',
                    transition: 'all 0.2s',
                    fontFamily: "'Cambria Math', Cambria, Georgia, serif",
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                        width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0,
                        backgroundColor: currentOption.color,
                        boxShadow: `0 0 8px ${currentOption.color}80`,
                    }} />
                    <span style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: currentOption.color,
                        fontFamily: "'Cambria Math', Cambria, Georgia, serif",
                    }}>
                        {currentOption.label}
                    </span>
                </span>
                <ChevronDown
                    style={{
                        width: '16px', height: '16px',
                        color: '#6b7280',
                        transform: open ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s',
                    }}
                />
            </button>

            {dropdown}
        </>
    )
}
