
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import {
    darkColors,
    lightColors,
    type AppColors,
} from "@/constants/colors";

export type ThemeMode = "light" | "dark";

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  isLoading: boolean;
  colors: AppColors;
  toggleTheme: () => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
}

const THEME_STORAGE_KEY = "express-laundry-theme";

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTheme() {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);

        if (savedTheme === "light" || savedTheme === "dark") {
          setThemeState(savedTheme);
        }
      } catch (error) {
        console.error("Could not load theme preference:", error);
      } finally {
        setIsLoading(false);
      }
    }

    void loadTheme();
  }, []);

  const setTheme = useCallback(async (nextTheme: ThemeMode) => {
    setThemeState(nextTheme);

    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch (error) {
      console.error("Could not save theme preference:", error);
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    await setTheme(nextTheme);
  }, [theme, setTheme]);

  const colors = theme === "dark" ? darkColors : lightColors;

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      isLoading,
      colors,
      toggleTheme,
      setTheme,
    }),
    [theme, isLoading, colors, toggleTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
