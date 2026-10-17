// Runs before first paint (classic, blocking script) to avoid a theme flash.
(function boot() {
  var root = document.documentElement;
  root.classList.add('js');
  try {
    var prefs = JSON.parse(window.localStorage.getItem('systems-atlas:prefs') || '{}');
    if (['system', 'light', 'dark'].indexOf(prefs.theme) >= 0) root.dataset.theme = prefs.theme;
    if (['auto', 'off'].indexOf(prefs.motion) >= 0) root.dataset.motion = prefs.motion;
  } catch (error) {
    // Storage unavailable: keep the system defaults already set in the markup.
  }
}());
