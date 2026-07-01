import { createContext, useState } from 'react';
import { darkColors, lightColors } from '../styles/colors';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(false)
    const toggleTheme = () => setIsDark(prev => !prev)
    const colors = isDark ? darkColors : lightColors
    return (
        <ThemeContext.Provider value={{ colors, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}