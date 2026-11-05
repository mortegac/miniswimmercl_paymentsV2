
import { Link } from "react-router-dom";
import {ErrorIllustration} from "../../../assets/images/error-illustration";
import Button from "@/components/Base/Button";

function Main() {
  return (
    <>
      <div className="py-2 bg-primary">
        <div className="container">
          {/* BEGIN: Error Page */}
          <div className="flex flex-col items-center justify-center h-screen text-center error-page lg:flex-row lg:text-left">
            <div className="-intro-x lg:mr-20">
              <ErrorIllustration/>
            </div>
            <div className="mt-10 text-white lg:mt-0">
              <div className="font-medium intro-x text-8xl px-14 ">500</div>
              <div className="mt-14 text-xl font-medium intro-x lg:text-3xl">
                Tenemos un problema con nuestros servidores
              </div>
              <div className="mt-14 text-lg intro-x">Intente más tarde</div>
              <Link
                to="/"
                className="px-4 py-3 mt-10 text-white border-white intro-x dark:border-darkmode-400 dark:text-slate-200"
              >
                <Button
              rounded
              variant="primary"
              className="px-4 py-3 border border-slate-200"
            >
              <span className="text-border-slate-200">Volver al Inicio</span>
            </Button>
                {/* <Button rounded className="px-4 py-3 mt-10 text-white border-white intro-x dark:border-darkmode-400 dark:text-slate-200">
                  Volver al Inicio
                </Button> */}
              </Link>
            </div>
          </div>
          {/* END: Error Page */}
        </div>
      </div>
    </>
  );
}

export default Main;
