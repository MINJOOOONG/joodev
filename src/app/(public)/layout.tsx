import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import PawFall from "@/components/ui/paw-fall";
import { AuthProvider } from "@/components/ui/auth-provider";
import { ThemeProvider } from "@/components/ui/theme-provider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="relative flex min-h-screen flex-col">
          <PawFall />
          <Header />
          <main className="relative z-10 flex-1">{children}</main>
          <Footer />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
