const SCRIPT = `
(function () {
  try {
    var theme = localStorage.getItem("hemdem-theme");
    if (theme === "light") document.documentElement.setAttribute("data-theme", "light");
  } catch (e) {}
})();
`;

/**
 * React hidrasyondan önce çalışması gereken tema uygulaması — normal bir
 * useEffect ilk boyamadan SONRA çalışır, bu da koyu temadan açık temaya
 * kısa bir "flash" (FOUC) demek. Bu script <head>'te render-blocking
 * olarak çalışıp `data-theme` özniteliğini ilk boyamadan önce ekliyor.
 */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
