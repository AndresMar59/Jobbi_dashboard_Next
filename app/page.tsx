import { redirect } from "next/navigation"


// Crea una funcion HomePage para redirigir a la page del dashboard
export default function HomePage() {
  redirect("/dashboard")
}

