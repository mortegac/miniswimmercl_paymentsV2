// import { format, tzDate } from '@formkit/tempo';


type FormatDateType = {
  date: string;
  options?: Intl.DateTimeFormatOptions;
};

const optDefault: Intl.DateTimeFormatOptions = {
  month: "long",
  day: "numeric",
};




export const FormatDate = ({
  date,
  options = optDefault,
}: FormatDateType): string => {
  const opt = { ...optDefault, ...options };
  const validDate = date.split("").slice(-1)[0] === "Z" ? date : date + "Z";
  try {
    return new Intl.DateTimeFormat("es-es", opt).format(new Date(validDate));
  } catch (error) {
    return "";
  }
};
// export const FormatDateSession = (fechaIso8601: string) => {
  
//   try {
  
//     // let fechaIso8601 =dateSession;
//     fechaIso8601 =fechaIso8601.replace(/\D/g, ' ');          
//     let componentsdate:any = fechaIso8601.split(' ');    
//     const dateSession = new Date(`${componentsdate[0]}/${componentsdate[1]}/${componentsdate[2]} 00:00:00`);
//     const fechaConZona = tzDate(dateSession.toISOString(), "America/Santiago");
//     const fechaFormateada = format(fechaConZona, "ddd, DD-MMM", "es");
    
//     return fechaFormateada
    
//   } catch (error) {
//     return fechaIso8601;
//   }
// };

function padTo2Digits(num: string) {
  return String(num).padStart(2, "0");
}

export const HoursAndMinutes = (date: string): string => {
  const d = new Date(date);

  const result: string =
    padTo2Digits(d.toUTCString()) + ":" + padTo2Digits(d.toUTCString());
  console.log(date), console.log(result);
  return result;
};





export function dateConverter(fechaString: string): Date {
  // Asumimos que la fecha viene en formato "dd/mm/yyyy"
  const [dia, mes, anio] = fechaString.split('/');
  
  // Creamos una nueva fecha en formato "yyyy-mm-dd"
  return new Date(`${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`);
}
export function calculateAge(birthday: string): { years: number; month: number } {
  try {
      const _birthday = dateConverter(birthday);
      const hoy = new Date();
      let years = hoy.getFullYear() - _birthday.getFullYear();
      let month = hoy.getMonth() - _birthday.getMonth();
    
      if (month < 0 || (month === 0 && hoy.getDate() < _birthday.getDate())) {
        years--;
        month += 12;
      }
    
      month = month % 12;
    
      return { years, month };
      
  } catch (error) {
      return { years:0, month:0 }
  }
}