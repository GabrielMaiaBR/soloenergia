import { cn } from "@/lib/utils";

interface AvatarInitialsProps {
    name: string;
    size?: "sm" | "md" | "lg";
    className?: string;
}

/**
 * Gera uma cor consistente baseada no nome
 */
function getColorFromName(name: string): string {
    const colors = [
        "bg-red-500",
        "bg-orange-500",
        "bg-amber-500",
        "bg-yellow-500",
        "bg-lime-500",
        "bg-green-500",
        "bg-emerald-500",
        "bg-teal-500",
        "bg-cyan-500",
        "bg-sky-500",
        "bg-blue-500",
        "bg-indigo-500",
        "bg-violet-500",
        "bg-purple-500",
        "bg-fuchsia-500",
        "bg-pink-500",
        "bg-rose-500",
    ];

    // Hash simples do nome para gerar índice consistente
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

/**
 * Extrai iniciais do nome (até 2 letras)
 */
function getInitials(name: string): string {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
};

export function AvatarInitials({ name, size = "md", className }: AvatarInitialsProps) {
    const initials = getInitials(name);
    const bgColor = getColorFromName(name);

    return (
        <div
            className={cn(
                "flex items-center justify-center rounded-full font-semibold text-white shrink-0",
                sizeClasses[size],
                bgColor,
                className
            )}
            title={name}
        >
            {initials}
        </div>
    );
}
