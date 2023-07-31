export const metadata = {
  title: "Auth - Nemmy",
  description: "Join and explore the fediverse on Nemmy.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className=" min-h-screen w-full">{children}</div>;
}
