import mixpanel from "@/lib/mixpanel.client";
import { useEffect } from "react";

//-------------------------------General--------------------------------

export function track(event: string, props = {}) {
  mixpanel.track(event, {
    ...props,
    app_env: process.env.NEXT_PUBLIC_APP_ENV,
  });
}

//-------------------------------Autenticación--------------------------------

export function aliasUser(userId: string) {
  const anonId = mixpanel.get_distinct_id();
  mixpanel.alias(userId, anonId);
}  // Crea una asociación entre el ID anónimo y el ID del usuario autenticado.

export function identifyUser(userId: string) {
  mixpanel.identify(userId);
} // Asocia eventos futuros con este ID de usuario. Por ahora es el company_user_id.

export function setUserProperties(properties: Record<string, any>) {
  mixpanel.people.set(properties);
}  // Las propiedades pueden incluir $Plan, $created (UNIX timestamp).
  // Si los jobbers tambien se pueden crear con este flujo. Asignar el propiedad $Type: "jobber" o "company_user".

export function setGroup(groupKey: string, groupId: string) {
  mixpanel.set_group(groupKey, groupId);
} // Asocia al usuario con un grupo (por ejemplo, una empresa).

//-------------------------------Eventos Específicos--------------------------------

 async function handleSignup(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) return;

  aliasUser(data.user.id);  
  identifyUser(data.user.id);

   if (data.type === "company_user") {
  setUserProperties({
    $Plan: data.user.plan,
    $created: new Date().toISOString(),
   // $type: "data.type"
  });

   else (data.type === "jobber") {
    setUserProperties({
      $created: new Date().toISOString(),
     // $type: "data.type"
    });
  }

  track("Signup Completed", {
    auth_provider: "supabase",
  });
} }

async function handleLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return;

  identifyUser(data.user.id);

  if (data.type === "company_user") {
  setUserProperties({
     $Plan: data.user.plan
  });

    else continue;

  track("Login Success", {
    auth_provider: "supabase",
  });
}}

async function handleLogout() {
  await supabase.auth.signOut();

  mixpanel.reset();

  mixpanel.track("Logout");
}


//-------------------------------Páginas Específicas--------------------------------

// Eventos de vista de paginas o sin necesidad de activacion del usuario

// Dashboard Page View Tracking
useEffect(() => {
  const key = "dashboard_viewed_session";

  if (!sessionStorage.getItem(key)) {
    track("Dashboard Viewed", {
      page: "dashboard",
      source: "client",
      app_env: process.env.NEXT_PUBLIC_APP_ENV,
    });

    sessionStorage.setItem(key, "true");
  }
}, []);

// Las demas funciones de tracking de páginas se pueden implementar de manera similar
// usando useEffect en paginas por defualt; o onclick, oninput, onsubmmit handlers en los componentes de React correspondientes.
// Por ejemplo, para una página de "Job Create", "Invite User", etc.















