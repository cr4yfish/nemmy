import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Privacy Policy - Nemmy",
  description: "View the privacy policy of Nemmy",
};

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar
        params={{
          titleOverride: "Privacy Policy",
          icon: "page_info",
        }}
      />
      <div className="mt-20 p-6">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <div>
          I dont collect any personal data on the app. 
        </div>
      </div>
    </>
  );
}
