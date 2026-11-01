// Background/foreground pairs for avatars without a photo, picked by record id.
// They are CSS variables (tokens.css) so the tints follow the light/dark theme.
const AVATAR_TINT_COUNT = 6;

export const NEUTRAL_TINT: [background: string, foreground: string] = [
    'var(--color-gray-200)',
    'var(--color-gray-500)',
];

export function avatarTint(id: number): [background: string, foreground: string] {
    const n = ((((id - 1) % AVATAR_TINT_COUNT) + AVATAR_TINT_COUNT) % AVATAR_TINT_COUNT) + 1;
    return [`var(--avatar-${n}-bg)`, `var(--avatar-${n}-fg)`];
}
