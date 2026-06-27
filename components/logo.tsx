import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
    size?: number        // px – controls both width and height of the image box
    showName?: boolean   // show "Oyru" text beside logo
    label?: string       // override label text (e.g. "Oyru Admin", "Oyru Driver")
    href?: string        // wrap in link; pass undefined to skip link
    className?: string
    imgClassName?: string
}

/**
 * Shared Oyru logo component.
 * Renders logo.jpg from /public with optional label text.
 */
export function Logo({
    size = 36,
    showName = true,
    label,
    href = '/',
    className,
    imgClassName,
}: LogoProps) {
    const content = (
        <span className={cn('flex items-center gap-2', className)}>
            <span
                className={cn(
                    'relative flex-shrink-0 rounded-xl overflow-hidden shadow-md',
                    imgClassName
                )}
                style={{ width: size, height: size }}
            >
                <Image
                    src="/logo.jpg"
                    alt="Oyru logo"
                    fill
                    className="object-cover"
                    sizes={`${size}px`}
                    priority
                />
            </span>
            {showName && (
                <span className="font-bold text-foreground leading-none">
                    {label ?? 'Oyru'}
                </span>
            )}
        </span>
    )

    if (!href) return content

    return (
        <Link href={href} className="inline-flex items-center">
            {content}
        </Link>
    )
}
