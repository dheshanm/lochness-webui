export type HeadingProps = {
    title: string
    icon?: React.ReactNode
}

export function Heading({ title, icon }: HeadingProps) {
    return (
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-3">
            {icon && <span className="p-2 rounded-lg">{icon}</span>}
            {title}
        </h1>
    )
}
