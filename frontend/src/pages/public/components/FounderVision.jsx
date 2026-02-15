import { Link } from "react-router-dom";
import { IconArrowRight } from "../../../components/ui/PublicIcons";

const founderQuote = {
  title: "A Vision Beyond Limits",
  text: "When I established Quest Technologies, my vision was clear—to build a platform where knowledge meets innovation. Over the past 18 years, we have grown beyond expectations, forging collaborations with educational institutions, conducting impactful workshops, and venturing into emerging domains. Our vertical CaddCamm Solutions empowers mechanical, civil, and electrical engineers through training in industry-standard design tools such as AutoCAD, SolidWorks, Revit, and more. In parallel, the Global Bio Invention Centre represents our expansion into biotechnology, with a focus on Microbiology, Genomics, and Molecular Biology. Our journey is defined not just by technology, but by the impact we create—on students, professionals, and industries alike. From the MoUs we've signed to the thousands of students we've trained, every milestone reflects our commitment to excellence and innovation. I warmly invite you to join us in this dynamic journey. Quest Technologies is more than just an institution—it's a movement toward a smarter, more empowered future.",
  author: "Sudhakar",
  role: "Founder",
  image: "/founder.jpg",
};

export default function FounderVision() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-peacock-border/60 bg-white/70 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/35">
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-peacock-blue/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-peacock-green/10 blur-3xl" />

        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          {/* Founder Image */}
          <div className="relative overflow-hidden rounded-3xl lg:rounded-r-none">
            <img
              src={founderQuote.image}
              alt={founderQuote.author}
              className="h-full w-full object-cover lg:min-h-[500px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-peacock-navy/60 via-transparent to-transparent lg:bg-gradient-to-r" />
          </div>

          {/* Founder Quote Content */}
          <div className="flex flex-col justify-center p-6 md:p-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-peacock-border/60 bg-peacock-bg/70 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-peacock-muted dark:border-white/10 dark:bg-white/5 dark:text-white/60">
              Our Vision
            </span>

            <h2 className="mt-4 text-3xl font-extrabold text-peacock-navy md:text-4xl dark:text-white">
              {founderQuote.title}
            </h2>

            <blockquote className="mt-6 text-sm leading-relaxed text-peacock-muted md:text-base dark:text-white/70">
              "{founderQuote.text}"
            </blockquote>

            <div className="mt-8 flex items-center gap-4">
              <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-peacock-blue">
                <img
                  src={founderQuote.image}
                  alt={founderQuote.author}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-lg font-extrabold text-peacock-navy dark:text-white">
                  {founderQuote.author}
                </p>
                <p className="text-sm text-peacock-muted dark:text-white/60">
                  {founderQuote.role}, Quest Technologies
                </p>
              </div>
            </div>

            <div className="mt-8">
              <Link
                to="/enquiry"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-peacock-blue to-peacock-green px-5 py-3 text-sm font-extrabold text-white transition hover:brightness-110 active:scale-[0.99]"
              >
                Join Our Journey
                <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
