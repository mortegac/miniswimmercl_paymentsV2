

export function transformResponse(response:string) {
  // Paso 1: Eliminar los caracteres de escape adicionales
  const cleanedResponse = response.replace(/\\/g, '');
  
  // Paso 2: Parsear la cadena JSON
  try {
    const parsedArray = JSON.parse(cleanedResponse);
    return parsedArray;
  } catch (error) {
    console.error("Error al parsear la respuesta:", error);
    return null;
  }
}
