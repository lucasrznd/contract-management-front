// Background/foreground pairs for avatars without a photo, picked by record id.
const AVATAR_TINTS: [background: string, foreground: string][] = [
    ['#E8EEFD', '#2F5BD3'],
    ['#E3F4EC', '#1F7A55'],
    ['#FDF0E3', '#A9520F'],
    ['#F0EAFB', '#6B46C1'],
    ['#FCE8EE', '#B4234D'],
    ['#E3F2F7', '#1B6B86'],
];

export const NEUTRAL_TINT: [background: string, foreground: string] = ['#E5E7EB', '#6B7280'];

export function avatarTint(id: number) {
    return AVATAR_TINTS[(((id - 1) % AVATAR_TINTS.length) + AVATAR_TINTS.length) % AVATAR_TINTS.length];
}
