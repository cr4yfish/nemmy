import Navbar from "@/components/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {


  return (
    <>
    <Navbar params={{
      titleOverride: "Settings",
      icon: "page_info",
    }} />
    <div className="flex-col, mb-6  flex min-h-screen w-full justify-center py-4">
      {children}
    </div>
    </>
  );
}
