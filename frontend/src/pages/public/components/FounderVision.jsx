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
    show: {
      transition: { staggerChildren: 0.12, delayChildren: 0.08 },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: reduce ? 0 : 14, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease } },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.7, ease } },
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className="group relative overflow-hidden rounded-3xl border border-peacock-border/60 bg-white/70 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/35"
      >
        {/* Premium glows */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-peacock-blue/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-peacock-green/15 blur-3xl" />

        {/* subtle shine */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.35),transparent)] opacity-0 transition duration-700 group-hover:opacity-100" />

        <div className="grid gap-0 lg:grid-cols-[1fr_1.05fr]">
          {/* IMAGE SIDE */}
          <motion.div
            variants={fadeIn}
            className="relative overflow-hidden rounded-3xl lg:rounded-r-none"
          >
            <motion.img
              src={founderQuote.image}
              alt={founderQuote.author}
              className="h-full w-full object-cover lg:min-h-[520px]"
              initial={{ scale: 1.06 }}
              whileInView={{ scale: 1.01 }}
              transition={{ duration: 1.2, ease }}
              viewport={{ once: true, amount: 0.4 }}
            />

            {/* overlay gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-peacock-navy/70 via-peacock-navy/10 to-transparent lg:bg-gradient-to-r lg:from-peacock-navy/70 lg:via-peacock-navy/10" />

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
              <p className="mt-1 text-sm font-extrabold text-white">
                {founderQuote.author}
              </p>
            </motion.div>
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
              className="inline-flex w-fit items-center gap-2 rounded-full border border-peacock-border/60 bg-peacock-bg/70 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.22em] text-peacock-muted dark:border-white/10 dark:bg-white/5 dark:text-white/60"
            >
              Our Vision
            </motion.span>

            <motion.h2
              variants={fadeUp}
              className="mt-4 text-3xl font-extrabold tracking-tight text-peacock-navy md:text-4xl dark:text-white"
            >
              {founderQuote.title}
            </motion.h2>

            <motion.div variants={fadeUp} className="mt-6">
              <div className="relative rounded-3xl border border-peacock-border/60 bg-white/55 p-5 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <span className="absolute -top-3 left-5 inline-flex items-center gap-2 rounded-full border border-peacock-border/60 bg-peacock-bg/80 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-peacock-muted dark:border-white/10 dark:bg-white/10 dark:text-white/60">
                  <IconQuote className="h-4 w-4 text-peacock-blue dark:text-sky-200" />
                  Note from Founder
                </span>

                <blockquote className="mt-3 text-[15px] leading-7 text-peacock-ink dark:text-white/80">
                  “{founderQuote.text}”
                </blockquote>
              </div>
            </motion.div>

            {/* author row */}
            <motion.div variants={fadeUp} className="mt-8 flex items-center gap-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-peacock-blue/70 dark:ring-sky-300/25">
                <img
                  src={founderQuote.image}
                  alt={founderQuote.author}
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-peacock-blue/10 to-peacock-green/10" />
              </div>

              <div>
                <p className="text-[15px] font-extrabold tracking-tight text-peacock-navy dark:text-white">
                  {founderQuote.author}
                </p>
                <p className="text-xs font-semibold tracking-wide text-peacock-muted dark:text-white/60">
                  {founderQuote.role}, Quest Technologies
                </p>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div variants={fadeUp} className="mt-8">
              <motion.div whileTap={{ scale: 0.99 }}>
                <Link
                  to="/enquiry"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-peacock-blue to-peacock-green px-5 py-3 text-sm font-extrabold text-white transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-sky-400/35"
                >
                  Join Our Journey
                  <IconArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>

              <p className="mt-3 text-xs font-semibold text-peacock-muted dark:text-white/60">
                We’ll guide you with the right course path + batches + fee plan.
              </p>
            </motion.div>

            {/* micro decorative line */}
            <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-peacock-border/70 to-transparent dark:via-white/10" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
