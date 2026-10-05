import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

/**
 * MagneticButton
 * ────────────────────────────────────────────────────────────────────────────
 * Subtle magnetic hover: the control drifts a few pixels toward the cursor and
 * springs back on leave. Works for both internal <Link> routes and external
 * <a> / <button> targets via the `to` / `href` / `onClick` props.
 */

const SPRING = { stiffness: 260, damping: 22, mass: 0.4 };

export default function MagneticButton({
  children,
  to,
  href,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  strength = 0.28,
  disabled = false,
  title,
  ariaLabel,
}) {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, SPRING);
  const sy = useSpring(my, SPRING);

  const handleMove = (e) => {
    if (reduce || disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    mx.set(relX * rect.width * strength * 2);
    my.set(relY * rect.height * strength * 2);
  };

  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  const base = variant === "ghost" ? "btn-ghost" : "btn-primary";
  const motionProps = {
    style: { x: sx, y: sy },
    onMouseMove: handleMove,
    onMouseLeave: reset,
    onBlur: reset,
  };

  const inner = (
    <>
      <span className="relative z-10 inline-flex items-center justify-center gap-2">
        {children}
      </span>
    </>
  );

  if (to) {
    return (
      <motion.div ref={ref} {...motionProps} className={`inline-block ${className}`}>
        <Link to={to} className={base} title={title} aria-label={ariaLabel}>
          {inner}
        </Link>
      </motion.div>
    );
  }

  if (href) {
    return (
      <motion.div ref={ref} {...motionProps} className={`inline-block ${className}`}>
        <a
          href={href}
          className={base}
          target="_blank"
          rel="noreferrer"
          title={title}
          aria-label={ariaLabel}
        >
          {inner}
        </a>
      </motion.div>
    );
  }

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      {...motionProps}
      className={`${base} disabled:opacity-50 disabled:pointer-events-none ${className}`}
    >
      {inner}
    </motion.button>
  );
}