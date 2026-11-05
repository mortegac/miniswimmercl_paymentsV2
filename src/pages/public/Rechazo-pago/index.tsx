import { useNavigate } from 'react-router-dom';
import _ from "lodash";

import { Layout } from './components/Layout';


import {SvgFailed} from "./components/SvgFailed";


const email:string = "lal@lal.cl";

function Main() {
    const navigate = useNavigate();
    
    
    const handleReturnToHome = () => {
        navigate('/'); // Navegar a la raíz del sitio
    };

 
  
  return (
    <>
        <Layout>
        <div className="flex flex-col justify-between box min-h-[460px] p-8 space-y-4 mt-8 ">
            <div className="flex flex-col justify-start ">
        
        {/* <pre>transaction = {JSON.stringify(transaction, null, 2 )}</pre> */}

            <SvgFailed /> 
            
            {/* <div className="flex flex-row items-center justify-center gap-2 md:ml-8">
                <Button 
                id="returnButton"
                    variant="primary"
                    onClick={handleReturnToHome}
                    className="px-4 py-3 mt-10 text-white border-white intro-x">
                    Volver al Inicio
                </Button>
            </div> */}
        
        
            </div>
        </div>
        </Layout>
    </>
  );
}

export default Main;
