import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { IconArrowRight, IconQuote } from "../../../components/ui/PublicIcons";

const founderQuote = {
  title: "A Vision Beyond Limits",
  text: "When I established Quest Technologies, my vision was clear—to build a platform where knowledge meets innovation. Over the past 18 years, we have grown beyond expectations, forging collaborations with educational institutions, conducting impactful workshops, and venturing into emerging domains. Our vertical CaddCamm Solutions empowers mechanical, civil, and electrical engineers through training in industry-standard design tools such as AutoCAD, SolidWorks, Revit, and more. In parallel, the Global Bio Invention Centre represents our expansion into biotechnology, with a focus on Microbiology, Genomics, and Molecular Biology. Our journey is defined not just by technology, but by the impact we create—on students, professionals, and industries alike. From the MoUs we've signed to the thousands of students we've trained, every milestone reflects our commitment to excellence and innovation. I warmly invite you to join us in this dynamic journey. Quest Technologies is more than just an institution—it's a movement toward a smarter, more empowered future.",
  author: "Sudhakar",
  role: "Founder",
  image: "/founder.jpg",
};

const ease = [0.16, 1, 0.3, 1];

export default function FounderVision() {
  const reduce = useReducedMotion();

  const wrap = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: reduce ? 0 : 14, filter: "blur(10px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease } },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.7, ease } },
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Neo mesh background (local) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_420px_at_12%_-10%,rgba(34,211,238,0.14),transparent_60%),radial-gradient(850px_420px_at_92%_10%,rgba(167,139,250,0.12),transparent_60%),radial-gradient(900px_520px_at_40%_120%,rgba(34,211,238,0.10),transparent_60%)] dark:bg-[radial-gradient(900px_420px_at_12%_-10%,rgba(34,211,238,0.11),transparent_60%),radial-gradient(850px_420px_at_92%_10%,rgba(167,139,250,0.10),transparent_60%),radial-gradient(900px_520px_at_40%_120%,rgba(34,211,238,0.08),transparent_60%)]" />
      </div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className={[
          "group relative overflow-hidden rounded-3xl border border-white/12 bg-white/70 shadow-soft backdrop-blur-2xl",
          "dark:border-white/10 dark:bg-slate-950/45",
          "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition before:duration-500",
          "before:bg-[radial-gradient(circle_at_30%_15%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(circle_at_75%_70%,rgba(167,139,250,0.16),transparent_55%)]",
          "group-hover:before:opacity-100",
        ].join(" ")}
      >
        {/* ring + shine */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.28),transparent)] opacity-0 transition duration-700 group-hover:opacity-100" />

        <div className="grid gap-0 lg:grid-cols-[1fr_1.05fr]">
          {/* IMAGE SIDE */}
          <motion.div variants={fadeIn} className="relative overflow-hidden rounded-3xl lg:rounded-r-none">
            <motion.img
              src={founderQuote.image}
              alt={founderQuote.author}
              className="h-full w-full object-cover lg:min-h-[540px]"
              initial={{ scale: 1.08 }}
              whileInView={{ scale: 1.02 }}
              transition={{ duration: 1.1, ease }}
              viewport={{ once: true, amount: 0.4 }}
            />

            {/* overlay gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent lg:bg-gradient-to-r lg:from-slate-950/75 lg:via-slate-950/10" />

            {/* floating badge */}
            <motion.div
              initial={{ opacity: 0, y: reduce ? 0 : 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.15 }}
              viewport={{ once: true, amount: 0.35 }}
              className="absolute left-5 top-5 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md"
            >
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/80">
                Founder Message
              </p>
              <p className="mt-1 text-sm font-extrabold text-white">{founderQuote.author}</p>
            </motion.div>

            {/* bottom gradient pill */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/85 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-400" />
                  Quest Technologies
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/85 backdrop-blur">
                  18+ Years
                </span>
              </div>
            </div>
          </motion.div>

          {/* CONTENT SIDE */}
          <motion.div
            variants={wrap}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className="relative flex flex-col justify-center p-6 md:p-10"
          >
            <motion.span
              variants={fadeUp}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/14 bg-white/60 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white/70"
            >
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-400" />
              Our Vision
            </motion.span>

            <motion.h2
              variants={fadeUp}
              className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl dark:text-white"
            >
              {founderQuote.title}
            </motion.h2>

            <motion.div variants={fadeUp} className="mt-6">
              <div className="relative rounded-3xl border border-white/14 bg-white/60 p-5 shadow-soft backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
                <span className="absolute -top-3 left-5 inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/70 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-700 dark:border-white/10 dark:bg-slate-950/60 dark:text-white/70">
                  <IconQuote className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
                  Note from Founder
                </span>

                <blockquote className="mt-3 text-[15px] leading-7 text-slate-800 dark:text-white/80">
                  “{founderQuote.text}”
                </blockquote>
              </div>
            </motion.div>

            {/* author row */}
            <motion.div variants={fadeUp} className="mt-8 flex items-center gap-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-cyan-400/45 dark:ring-cyan-300/20">
                <img src={founderQuote.image} alt={founderQuote.author} className="h-full w-full object-cover" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-cyan-400/10 to-violet-400/10" />
              </div>

              <div className="min-w-0">
                <p className="text-[15px] font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {founderQuote.author}
                </p>
                <p className="text-xs font-semibold tracking-wide text-slate-600 dark:text-white/60">
                  {founderQuote.role}, Quest Technologies
                </p>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div variants={fadeUp} className="mt-8">
              <motion.div whileTap={{ scale: 0.99 }}>
                <Link
                  to="/enquiry"
                  className={[
                    "inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-3 text-sm font-extrabold text-white",
                    "transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-400/35",
                  ].join(" ")}
                >
                  Join Our Journey
                  <IconArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>

              <p className="mt-3 text-xs font-semibold text-slate-600 dark:text-white/60">
                We’ll guide you with the right course path + batches + fee plan.
              </p>
            </motion.div>

            {/* micro decorative line */}
            <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent dark:via-white/10" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}