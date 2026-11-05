import Lucide from "@/components/Base/Lucide";

export function CartNotExist() {
  return (
    <div className="w-full h-96 flex justify-center items-center flex-col gap-4">
      <div className="relative">
        <Lucide icon="ShoppingCart" className="w-20 h-20 text-primary/30 stroke-[0.8]" />
        <Lucide icon="XCircle" className="w-8 h-8 text-red-400 absolute -bottom-1 -right-2 fill-white" />
      </div>
      <h2 className="text-2xl font-medium text-slate-600 mt-2">Carro de compras no encontrado</h2>
      <p className="text-slate-400 text-sm">El link de pago no es válido o ya fue procesado.</p>
      <a
        href="https://api.whatsapp.com/send/?phone=56973447496&text=Quiero+renovar+mis+clases+desde+pagos.miniswimmer.cl&type=phone_number&app_absent=0"
        target="_blank"
        rel="noopener noreferrer"
        className="w-72 mt-4 px-2 py-3 bg-primary rounded-full"
      >
        <p className="text-white text-lg text-center">Inicie su inscripción aquí</p>
      </a>
    </div>
  );
}
