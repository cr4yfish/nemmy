export default function RenderError() {
  return (
    <>
      <div className="flex flex-col items-center gap-1 p-4 font-mono">
        <h1 className="text-xl font-bold text-red-500">Error</h1>
        <span>Server is unresponsive</span>
      </div>
    </>
  );
}
