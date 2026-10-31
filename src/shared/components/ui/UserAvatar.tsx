import { useState } from 'react';
import { avatarTint, NEUTRAL_TINT } from '@/shared/helpers/avatar.helper';
import { initials } from '@/shared/helpers/stringUtils.helper';
import styles from './UserAvatar.module.css';

const nameHash = (name: string) => [...name].reduce((hash, char) => hash + char.charCodeAt(0), 0);

interface UserAvatarProps {
    name: string;
    /** Picks the tint of the initials; without it the tint comes from the name. */
    id?: number;
    src?: string | null;
    size?: number;
    /** Square suits companies; people stay round. */
    shape?: 'circle' | 'square';
}

/** Photo, or the person's initials on a tint when there is no photo (or it fails to load). */
export default function UserAvatar({ name, id, src, size = 40, shape = 'circle' }: UserAvatarProps) {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const style = {
        width: size,
        height: size,
        fontSize: size >= 64 ? 22 : 13,
        borderRadius: shape === 'square' ? 'var(--radius-lg)' : undefined,
    };

    if (src && src !== failedSrc) {
        return <img src={src} alt={name} className={styles.avatar} style={style} onError={() => setFailedSrc(src)} />;
    }

    const [background, color] = name.trim() ? avatarTint(id ?? nameHash(name)) : NEUTRAL_TINT;
    return (
        <div className={styles.avatar} style={{ ...style, background, color }} aria-hidden="true">
            {initials(name)}
        </div>
    );
}
