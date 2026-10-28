import HomeClient from "@/components/HomeClient";
import { SAMPLE_COURSES } from "@/lib/sample-courses";

// Server component: Step 2 replaces SAMPLE_COURSES with a Supabase query here.
export default function Home() {
  return <HomeClient courses={SAMPLE_COURSES} />;
}
