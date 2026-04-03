import "bootstrap/dist/css/bootstrap.min.css";
import "./global.css";
import { LayoutWrapper } from "./layout-wrapper";

export const metadata = {
  title: "Khushi Crochet | Handmade Crochet Creations",
  description:
    "Khushi Crochet offers handmade crochet flowers, gifts, accessories, and custom creations crafted with love.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
