import { Component, ErrorInfo } from 'react';

import {ErrorIllustration} from "./assets/images/error-illustration";
import Button from "@/components/Base/Button";
interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  handleClick = () => {
    window.location.reload();
  }
  
  public state: State = {
    hasError: false
  };

  // ...


  public static getDerivedStateFromError(_: Error): State {
    // Actualiza el state para el próximo render 
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  
  
  public render() {
    if (this.state.hasError) {
      return (
        <>
        
        { (process.env.NODE_ENV === "development" ? null : localStorage.clear()) }
        
      <div className="py-2">
        <div className="container">
          {/* BEGIN: Error Page */}
          <div className="flex flex-col items-center justify-center h-screen text-center error-page lg:flex-row lg:text-left">
            <div className="-intro-x lg:mt-20">
              <ErrorIllustration/>
            </div>
            <div className="mt-10 text-white lg:mt-0">
              <div className="font-medium intro-x text-8xl">500</div>
              <div className="mt-5 text-xl font-medium intro-x lg:text-3xl">
                Tenemos un problema con nuestros servidores
              </div>
              <div className="mt-3 text-lg intro-x">
                Intente más tarde
              </div>
              {/* <Link
                to="/"
                className="px-4 py-3 mt-10 text-white border-white intro-x dark:border-darkmode-400 dark:text-slate-200"
              > */}
                <Button onClick={this.handleClick} className="px-4 py-3 mt-10 text-white border-white intro-x dark:border-darkmode-400 dark:text-slate-200">
                  Volver al Inicio
              </Button>
              {/* </Link> */}
          
            </div>
          </div>
          {/* END: Error Page */}
        </div>
      </div>
    </>
      )
    
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;