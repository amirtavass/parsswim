// Static English metadata (default)
export const metadata = {
  title: "Butterfly Swimming Articles - parsswim",
  description:
    "Complete butterfly swimming training - technique, tips and tricks",
  keywords: "butterfly stroke, swimming training, swimming technique",
  openGraph: {
    title: "Butterfly Swimming Articles - parsswim",
    description:
      "Complete butterfly swimming training - technique, tips and tricks",
    type: "website",
    locale: "en_US",
  },
};

export default function ButterflyLayout({ children }) {
  return <>{children}</>;
}
