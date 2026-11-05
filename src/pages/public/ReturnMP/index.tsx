import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import LoadingIcon from "@/components/Base/LoadingIcon";
import { Logo } from "../Return/components/Logo";
import { useAppDispatch } from "@/stores/hooks";
import { setMPStatus } from "@/stores/MercadoPago/slice";
import { logger } from "@/utils/log";

function ReturnMP() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isFirstRender = useRef(true);
  const [message, setMessage] = useState("Verificando pago con MercadoPago…");

  useEffect(() => {
    if (!isFirstRender.current) return;
    isFirstRender.current = false;

    const paymentId = searchParams.get("payment_id") || "";
    const mpStatusParam = searchParams.get("status") || "";
    const preferenceId = searchParams.get("preference_id") || "";
    const externalReference = searchParams.get("external_reference") || "";

    logger.info("ReturnMP params", { paymentId, mpStatusParam, preferenceId, externalReference });

    const resolve = async () => {
      try {
        setMessage("Verificando estado del pago…");
        const result: any = await dispatch(
          setMPStatus({ paymentId, preferenceId, externalReference, mpStatus: mpStatusParam })
        );

        const data = result?.payload;
        const status: string = data?.status || mpStatusParam || "";

        logger.info("ReturnMP status result", { status, data });

        if (status === "approved" || status === "CAPTURED") {
          try {
            sessionStorage.setItem("paymentData", JSON.stringify({ email: data?.payerEmail ?? "" }));
          } catch {
            // storage unavailable
          }
          setMessage("Pago aprobado. Redirigiendo…");
          setTimeout(() => navigate("/recibo-pago", { replace: true }), 1500);
        } else if (status === "pending") {
          setMessage("Pago pendiente. Redirigiendo…");
          setTimeout(() => navigate("/rechazo-pago", { replace: true }), 2000);
        } else {
          setMessage("Pago no completado. Redirigiendo…");
          setTimeout(() => navigate("/rechazo-pago", { replace: true }), 2000);
        }
      } catch (error) {
        logger.error("ReturnMP error", error);
        setMessage("Error al verificar el pago. Redirigiendo…");
        setTimeout(() => navigate("/rechazo-pago", { replace: true }), 2000);
      }
    };

    resolve();
  }, []);

  return (
    <div className="grid grid-cols-12 gap-y-10 gap-x-6 mt-4">
      <div className="col-span-12 sm:col-span-10 sm:col-start-2 max-w-3xl w-full mx-auto px-2 sm:px-0">
        <div className="flex justify-center items-center">
          <Logo />
        </div>
        <div className="flex flex-col justify-center items-center box min-h-[600px] p-8 space-y-4 mt-8">
          <LoadingIcon color="#7E4996" icon="oval" className="w-10 h-10" />
          <p className="text-xl text-center text-gray-700 dark:text-gray-300">{message}</p>
          <p className="text-xl text-center bg-primary text-white p-4 mt-40">
            Por favor no cierre el navegador
          </p>
        </div>
      </div>
    </div>
  );
}

export default ReturnMP;
