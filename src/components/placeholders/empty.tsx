export type EmptyBoxProps = {
    message?: string
}

export default function EmptyBox({
    message
}: EmptyBoxProps) {

    return (
        <div className="flex flex-col items-center justify-center h-[240px] w-full rounded-lg border border-dashed border-gray-300/70 dark:border-gray-700/50 bg-gray-50/50 dark:bg-slate-800/30">
            <p className="text-gray-500 dark:text-gray-400 mb-2"> {message || 'Loading...'}</p>
        </div>
    )
}