import { useState, useEffect } from "react"
import { supabase } from "../utils/supabaseClient"

export function useFetchCategories() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data, error } = await supabase
                    .from('rubros')
                    .select('nombre_rubro')
                    .limit(5)

                if (error) throw error

                setCategories(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchCategories()
    }, [])

    return { categories, loading, error }
}