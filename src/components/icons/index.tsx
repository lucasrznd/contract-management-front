import type { ReactNode, SVGProps } from 'react';

// Stroke icons from the EducadoraGC design. PrimeIcons draws them differently, so the design's paths are kept as-is.

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
    size?: number;
}

function createIcon(paths: ReactNode, defaultStrokeWidth: number) {
    return function Icon({ size = 16, strokeWidth = defaultStrokeWidth, ...props }: IconProps) {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
                {...props}
            >
                {paths}
            </svg>
        );
    };
}

export const FolderIcon = createIcon(
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
    1.75,
);

export const BuildingIcon = createIcon(
    <>
        <rect x="5" y="3" width="14" height="18" rx="1" />
        <path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10 21v-3h4v3" />
    </>,
    1.75,
);

export const UsersIcon = createIcon(
    <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
        <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5" />
    </>,
    1.75,
);

export const UserPlusIcon = createIcon(
    <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
        <path d="M19 8v6M16 11h6" />
    </>,
    1.75,
);

export const UserIcon = createIcon(
    <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
    </>,
    1.9,
);

export const SearchIcon = createIcon(
    <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
    </>,
    2,
);

export const PlusIcon = createIcon(<path d="M12 5v14M5 12h14" />, 2.25);

export const CloseIcon = createIcon(<path d="M6 6l12 12M18 6 6 18" />, 2);

export const PencilIcon = createIcon(<path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z" />, 1.9);

export const TrashIcon = createIcon(
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />,
    1.9,
);

export const PhoneIcon = createIcon(
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />,
    2,
);

export const CameraIcon = createIcon(
    <>
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z" />
        <circle cx="12" cy="13" r="3" />
    </>,
    2,
);

export const LinkIcon = createIcon(
    <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />,
    2,
);

export const AlertCircleIcon = createIcon(
    <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 16h.01" />
    </>,
    2.2,
);

export const CheckIcon = createIcon(<path d="M20 6 9 17l-5-5" />, 2.4);

export const ChevronLeftIcon = createIcon(<path d="m15 18-6-6 6-6" />, 2.2);

export const ChevronRightIcon = createIcon(<path d="m9 18 6-6-6-6" />, 2.2);

export const CloudOffIcon = createIcon(
    <path d="M2 2l20 20M5.8 5.8A7 7 0 0 0 7 19h10.5M21.5 15.6A4.5 4.5 0 0 0 17.5 9h-1.3A7 7 0 0 0 9.9 4.6" />,
    1.9,
);
