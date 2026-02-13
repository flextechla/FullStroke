export default function ThemeScript() {
  const script = `
    (function() {
      try {
        var stored = localStorage.getItem('fs-theme');
        if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch(e) {}
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}