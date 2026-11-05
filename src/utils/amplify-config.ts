// ponytail: env switching utility — read VITE_ENVIRONMENT to determine runtime environment
// does not change AWS configuration (see main.tsx for Amplify.configure setup)

export const isProd: boolean =
  import.meta.env.VITE_ENVIRONMENT === "prod" ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost");

export const isLocalDev: boolean = !isProd;
