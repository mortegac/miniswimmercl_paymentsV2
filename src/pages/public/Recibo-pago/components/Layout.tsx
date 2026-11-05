import { Logo } from "../../Return/components/Logo";
// import StepsWizard from "./StepsWizard";

export function Layout({ children }: { children: React.ReactNode }) {
    return(
      <>
        <div className="grid grid-cols-12 gap-y-10 gap-x-6 mt-4">
          <div className="col-span-12 sm:col-span-10 sm:col-start-2 max-w-3xl w-full mx-auto px-2 sm:px-0">
            <div className="flex justify-center items-center">
              <Logo />
            </div>
            {/* <StepsWizard step={step}/> */}
            {children}
            {/* <OtherServices /> */}
          </div>
      </div>
      </>
    )
  }