import { Metadata } from "next";
import RegistroForm from "./RegistroForm";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Registro de Usuario | Fundación Dibujando Sonrisas",
  description: "Crea una cuenta en el sistema administrativo de la Fundación Dibujando Sonrisas.",
};

export default function RegistroPage() {
  return (
    <>
      <Header />
      <RegistroForm />
      <Footer />
    </>
  );
}
