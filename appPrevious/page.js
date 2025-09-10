import CoachResume from "./components/ui/CoachResume";

import ChildrenSafetySection from "./components/ui/ChildrenSafetySection ";
import SlidingHero from "./components/ui/SlidingHero";
import FeaturedProducts from "./components/ui/FeaturedProducts";
import ClassRegister from "./components/ui/ClassRegister";

export const metadata = {
  title: "parsswim - آموزش شنا حرفه‌ای",
  description:
    "آموزش شنا حرفه‌ای برای تمام سنین با ۱۵ سال تجربه. مربی مجرب با مدارک بین‌المللی.",
};
export default function page() {
  return (
    <>
      <SlidingHero />
      <FeaturedProducts />
      <ChildrenSafetySection />
      <ClassRegister />
      <CoachResume />
    </>
  );
}
