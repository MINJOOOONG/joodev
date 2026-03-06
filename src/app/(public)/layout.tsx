import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import PawSnow from "@/components/ui/paw-snow";
import { AuthProvider } from "@/components/ui/auth-provider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="relative flex min-h-screen flex-col">
        <PawSnow />
        <Header />
        <main className="relative z-10 flex-1">{children}</main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
