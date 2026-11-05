
import {calculateAge} from "@/utils/dateHandler"


interface Props {
    birthdate:string;
  }

export function CalculateAge (props:Props){
    
    const edad = calculateAge(String(props.birthdate === "" ? "1800/01/01":props.birthdate ));                
              
    
    return  <span className="text-slate-500 text-xs whitespace-nowrap mt-0.5">
        { edad.years > 100 ? "SIN EDAD":`${edad.years} años, ${edad.month} meses`}
        </span>
}