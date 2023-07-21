
export default function RenderError() {
    return (
        <>
        <div className="flex flex-col gap-1 p-4 items-center font-mono">
            <h1 className="font-bold text-xl text-red-500">Error</h1>
            <span>Server is unresponsive</span>
        </div>
        </>
    )
}