import { availableIcons } from "./icons";

interface IconProps extends React.SVGProps<SVGSVGElement> {
    /** The name of the icon to render */
    name: keyof typeof availableIcons;
}

/**
 * Icon component for rendering SVG icons.
 * @param props - The properties for the icon component.
 * @returns The SVG element for the specified icon, or null if the icon is not found.
 */
export function Icon({ name, ...props }: IconProps): React.ReactNode {
    const IconComponent = availableIcons[name];

    return IconComponent ? <IconComponent {...props} /> : null;
}
