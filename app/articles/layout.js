// Static English metadata (default)
export const metadata = {
  title: "Swimming Training Articles - parsswim",
  description: "Latest articles about the 4 main swimming styles",
  keywords:
    "swimming, swimming training, swimming articles, freestyle, butterfly, breaststroke, backstroke",
  openGraph: {
    title: "Swimming Training Articles - parsswim",
    description: "Latest articles about the 4 main swimming styles",
    type: "website",
    locale: "en_US",
  },
};

export default function ArticlesLayout({ children }) {
  return <>{children}</>;
}
