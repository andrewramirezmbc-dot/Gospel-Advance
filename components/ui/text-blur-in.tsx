"use client";
import * as React from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

export interface TextBlurInProps extends Omit<HTMLMotionProps<"p">, "children"> {
  children: string;
  duration?: number;
  delay?: number;
  by?: "character" | "word";
  staggerDelay?: number;
  as?: "p" | "span";
  startImmediately?: boolean;
}

export function TextBlurIn({
  children, className, duration = 0.3, delay = 0, by = "word",
  staggerDelay = 0.025, as = "p", startImmediately = false, ...props
}: TextBlurInProps) {
  const reduced = useReducedMotion();
  const units = by === "word" ? children.split(/(\s+)/) : Array.from(children);
  const Tag = as === "span" ? motion.span : motion.p;
  let index = 0;
  return (
    <Tag className={cn(className)} {...props}
      initial="hidden" whileInView={startImmediately ? undefined : "visible"}
      animate={reduced || startImmediately ? "visible" : undefined}
      viewport={{ once: true, amount: 0.1 }}>
      {units.map((unit, key) => {
        if (/^\s+$/.test(unit)) return <React.Fragment key={key}>{unit}</React.Fragment>;
        const wordIndex = index++;
        return (
          <motion.span key={key}
            variants={{
              hidden: { opacity: reduced ? 1 : 0.4, filter: reduced ? "blur(0px)" : "blur(4px)" },
              visible: { opacity: 1, filter: "blur(0px)" }
            }}
            transition={{ duration: reduced ? 0 : duration, delay: reduced ? 0 : Math.min(0.18, delay + wordIndex * staggerDelay) }}
            style={{ display: "inline-block" }}>
            {unit}
          </motion.span>
        );
      })}
    </Tag>
  );
}

export default TextBlurIn;
