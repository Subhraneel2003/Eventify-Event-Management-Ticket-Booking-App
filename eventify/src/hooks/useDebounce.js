import { useEffect, useState } from "react";

export function useDebounce(value, delay) {
    const [debounceValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)
        return () => clearTimeout(handler)
    }, [value, delay])
    
    return debounceValue
}