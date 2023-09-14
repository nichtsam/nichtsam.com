import { useFetcher } from "@remix-run/react";
import DOMPurify from "isomorphic-dompurify";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export enum Theme {
  DARK = "dark",
  LIGHT = "light",
}

const themes: Array<Theme> = Object.values(Theme);

export const isTheme = (value: unknown): value is Theme => {
  return typeof value === "string" && themes.includes(value as Theme);
};

type ThemeContextType =
  | [Theme | null, React.Dispatch<React.SetStateAction<Theme | null>>]
  | undefined;
const ThemeContext = createContext<ThemeContextType>(undefined);

const prefersDarkMediaQuery = "(prefers-color-scheme: dark)";
const getPreferredTheme = () =>
  window.matchMedia(prefersDarkMediaQuery).matches ? Theme.DARK : Theme.LIGHT;

const clientThemeCode = `
;(() => {
  const theme = window.matchMedia(${JSON.stringify(
    prefersDarkMediaQuery,
  )}).matches
    ? 'dark'
    : 'light';
  const cl = document.documentElement.classList;
  const themeAlreadyApplied = cl.contains('light') || cl.contains('dark');
  if (themeAlreadyApplied) {
    // this script shouldn't exist if the theme is already applied!
    console.warn(
      "Hi there, could you let Sam know you're seeing this message? Thanks!",
    );
  } else {
    // theme always come first.
    document.documentElement.setAttribute('class', \`\${theme} \${cl.value}\`)
  }

  const meta = document.querySelector('meta[name=color-scheme]');
  if (meta) {
    if (theme === 'dark') {
      meta.content = 'dark light';
    } else if (theme === 'light') {
      meta.content = 'light dark';
    }
  }
})();
`;

export const FixFlashOfWrongTheme = ({
  ssrTheme,
  nonce,
}: {
  ssrTheme: boolean;
  nonce?: string;
}) => {
  const [theme] = useTheme();

  return (
    <>
      <meta
        name="color-scheme"
        content={theme === Theme.LIGHT ? "light dark" : "dark light"}
      />
      {ssrTheme ? null : (
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(clientThemeCode, {
              RETURN_TRUSTED_TYPE: true,
            }),
          }}
        />
      )}
    </>
  );
};

export const ThemeProvider = ({
  children,
  specifiedTheme,
}: {
  children: React.ReactNode;
  specifiedTheme: Theme | null;
}) => {
  const [theme, setThemeState] = useState<Theme | null>(() => {
    // if specifiedTheme is not null, it means that it appeared in the cookie, in that case we respect it.
    // otherwise we let the clientThemeCode set the theme for us before hydration.
    // Then (during hydration), this code will get the same value that clientThemeCode got so hydration is happy.

    if (specifiedTheme) {
      if (themes.includes(specifiedTheme)) {
        return specifiedTheme;
      } else {
        return null;
      }
    }

    // there's no way for us to know what the theme should be in this context
    // the client will have to figure it out before hydration.
    if (typeof window !== "object") {
      return null;
    }

    return getPreferredTheme();
  });

  const persistTheme = useFetcher();

  // TODO: remove this when persistTheme is memoized properly
  const persistThemeRef = useRef(persistTheme);
  useEffect(() => {
    persistThemeRef.current = persistTheme;
  }, [persistTheme]);

  const setTheme = useCallback(
    (setThemeAction: Parameters<typeof setThemeState>[0]) => {
      setThemeState((prevTheme) => {
        const newTheme =
          typeof setThemeAction === "function"
            ? setThemeAction(prevTheme)
            : setThemeAction;

        if (newTheme) {
          persistThemeRef.current.submit(
            { theme: newTheme },
            { action: "action/set-theme", method: "POST" },
          );
        }

        return newTheme;
      });
    },
    [],
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(prefersDarkMediaQuery);
    const handleChange = ({ matches }: MediaQueryListEvent) => {
      setTheme(matches ? Theme.DARK : Theme.LIGHT);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [setTheme]);

  return (
    <ThemeContext.Provider value={[theme, setTheme]}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
