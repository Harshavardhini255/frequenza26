import { motion, useReducedMotion } from "framer-motion";

/**
 * Reveal — scroll-triggered fade + rise, used across every section.
 * Fires once, respects prefers-reduced-motion, and animates only when the
 * element is actually in view.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  y = 26,
  x = 0,
  duration = 0.7,
  amount = 0.2,
  as = "div",
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] ?? motion.div;

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, x: reduce ? 0 : x, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{
        duration: reduce ? 0 : duration,
        delay: reduce ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </MotionTag>
  );
}