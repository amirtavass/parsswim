// Static English metadata (default)
export const metadata = {
  title: "Freestyle Swimming Articles - parsswim",
  description:
    "Complete freestyle swimming training - technique, tips and tricks",
  keywords: "freestyle, front crawl, swimming training, swimming technique",
  openGraph: {
    title: "Freestyle Swimming Articles - parsswim",
    description:
      "Complete freestyle swimming training - technique, tips and tricks",
    type: "website",
    locale: "en_US",
  },
};

export default function ArticlesLayout({ children }) {
  return <>{children}</>;
}
