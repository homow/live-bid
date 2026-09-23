import Footer from "@/Components/layout/Footer/Footer";
import Header from "@/Components/layout/Header/Header";

export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />

      <main>{children}</main>

      <Footer />
    </>
  );
}
