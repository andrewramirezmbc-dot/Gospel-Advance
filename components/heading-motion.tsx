import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { TextBlurIn } from "@/components/ui/text-blur-in";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (reduced.matches) continue;
      const walker = document.createTreeWalker(entry.target, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      while (walker.nextNode()) nodes.push(walker.currentNode as Text);
      let wordOffset = 0;
      for (const node of nodes) {
        const text = node.textContent || "";
        if (!text.trim()) continue;
        const host = document.createElement("span");
        host.className = "ga-blur-host";
        node.replaceWith(host);
        // The heading observer already fired; do not wait for a second observer.
        flushSync(() => createRoot(host).render(
          <TextBlurIn as="span" startImmediately delay={wordOffset * 0.025}>{text}</TextBlurIn>
        ));
        wordOffset += text.trim().split(/\s+/).length;
      }
    }
  }, { threshold: 0, rootMargin: "0px 0px 40px 0px" });
  document.querySelectorAll("main h1, main h2, main h3, .ga-footer h2").forEach(heading => {
    if (heading.closest("dialog") || heading.querySelector("img, svg, .ga-sr-only, a, button")) return;
    observer.observe(heading);
  });
}
