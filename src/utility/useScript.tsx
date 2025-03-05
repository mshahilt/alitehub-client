import { useState, useEffect } from "react";

const useScript = (src: string) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (document.querySelector(`script[src="${src}"]`)) {
      setLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [src]);

  return loaded;
};

export default useScript;
