import { ref, watch, onMounted } from 'vue';

export function useDarkMode() {
  const isDark = ref(false);

  // Initialize from localStorage or system preference
  onMounted(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      isDark.value = stored === 'true';
    } else {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    applyTheme();
  });

  // Watch for changes and apply theme
  watch(isDark, () => {
    applyTheme();
    localStorage.setItem('darkMode', isDark.value.toString());
  });

  function applyTheme() {
    if (isDark.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  function toggle() {
    isDark.value = !isDark.value;
  }

  return {
    isDark,
    toggle
  };
}
