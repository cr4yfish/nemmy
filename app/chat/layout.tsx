import Navbar from "@/components/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {

  return (
    <>
    <Navbar 
      params={{
        titleOverride: "Chat",
        icon: "chat_bubble",
      }}
    />
    <div className="flex-col, mb-6 mt-24 flex min-h-screen w-full justify-center py-4">
      {children}
    </div>
    </>
  );
}
