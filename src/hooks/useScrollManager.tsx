import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export default function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    const saved = sessionStorage.getItem(location.pathname);

    if (navigationType === "POP" && saved) {
      // Back/forward navigation — restore saved position
      // Use setTimeout to ensure DOM has rendered
      setTimeout(() => {
        window.scrollTo(0, Number(saved));
      }, 0);
    } else {
      // New navigation (PUSH/REPLACE) — scroll to top
      window.scrollTo(0, 0);
    }

    const saveScroll = () => {
      sessionStorage.setItem(location.pathname, String(window.scrollY));
    };

    window.addEventListener("scroll", saveScroll);
    window.addEventListener("beforeunload", saveScroll);

    return () => {
      saveScroll();
      window.removeEventListener("scroll", saveScroll);
      window.removeEventListener("beforeunload", saveScroll);
    };
  }, [location, navigationType]);

  return null;
}