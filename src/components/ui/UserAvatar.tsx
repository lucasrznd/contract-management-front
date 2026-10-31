import { useState } from 'react';
import { avatarTint, NEUTRAL_TINT } from '../../functions/avatar';
import { initials } from '../../functions/StringUtils';
import styles from './UserAvatar.module.css';

interface UserAvatarProps {
    name: string;
    /** Picks the tint of the initials; without it the avatar stays gray. */
    id?: number;
    src?: string | null;
    size?: number;
}

/** Photo, or the person's initials on a tint when there is no photo (or it fails to load). */
export default function UserAvatar({ name, id, src, size = 40 }: UserAvatarProps) {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const style = { width: size, height: size, fontSize: size >= 64 ? 22 : 13 };

    if (src && src !== failedSrc) {
        return <img src={src} alt={name} className={styles.avatar} style={style} onError={() => setFailedSrc(src)} />;
    }

    const [background, color] = id !== undefined && name.trim() ? avatarTint(id) : NEUTRAL_TINT;
    return (
        <div className={styles.avatar} style={{ ...style, background, color }} aria-hidden="true">
            {initials(name)}
        </div>
    );
}
