import CoachResume from "./components/ui/CoachResume";

import ChildrenSafetySection from "./components/ui/ChildrenSafetySection ";
import SlidingHero from "./components/ui/SlidingHero";
import FeaturedProducts from "./components/ui/FeaturedProducts";
import ClassRegister from "./components/ui/ClassRegister";

export const metadata = {
  title: "ParsSwim - Professional Swimming Lessons",
  description:
    "Professional swimming instruction for all ages with 15 years of experience. Expert coach with international certifications and proven track record.",
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
