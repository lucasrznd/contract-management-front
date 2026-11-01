import Logo from '@/assets/brand/radio-educadora-logo.svg?react';

/**
 * The Rádio Educadora logo, inlined so its wordmark gradient follows the theme (--logo-ink-* in tokens.css).
 * Its gradient ids are fixed, so a second copy reuses the first one's defs: don't hide a copy with
 * `display: none` (that drops its defs in some browsers); render it conditionally instead.
 */
export default function BrandLogo({ className }: { className?: string }) {
    return <Logo role="img" aria-label="Rádio Educadora" className={className} />;
}
