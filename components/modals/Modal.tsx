"use client"; // Indikerer at denne komponenten er en klientkomponent som bruker React Hooks.

import { useCallback, useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io"; // Importerer et ikon for lukkeknappen.
import Button from "../Button"; // Importerer en gjenbrukbar knappkomponent.

interface ModalProps {
  isOpen?: boolean; // Angir om modalen er åpen.
  onClose: () => void; // Callback for å lukke modalen.
  onSubmit: () => void; // Callback for å utføre en handling når brukeren sender inn skjemaet.
  title?: string; // Teksten som vises som overskrift i modalen.
  body?: React.ReactElement; // Innholdet som vises i modalens hoveddel.
  footer?: React.ReactElement; // Innholdet som vises i modalens bunn.
  actionLabel: string; // Teksten som vises på "Hoved"-knappen.
  disabled?: boolean; // Angir om knappene er deaktivert.
  secondaryAction?: () => void; // Callback for en sekundær handling (valgfritt).
  secondaryActionLabel?: string; // Teksten som vises på den sekundære knappen (valgfritt).
}

/**
 * Modal-komponenten brukes til å vise en popup-boks for ulike interaksjoner
 * som registrering, varsler eller andre handlinger.
 * Den er designet for å være gjenbrukbar og responsiv.
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  body,
  footer,
  actionLabel,
  disabled,
  secondaryAction,
  secondaryActionLabel,
}) => {
  // Lokalt state for å kontrollere visningen av modalen med animasjon.
  const [showModal, setShowModal] = useState(isOpen);

  // Oppdaterer `showModal` når `isOpen`-propen endres.
  useEffect(() => {
    setShowModal(isOpen);
  }, [isOpen]);

  /**
   * Lukkemekanisme for modalen.
   * - Hindrer at modalen lukkes hvis knappene er deaktivert.
   * - Animasjon for å skjule modalen før den fjernes fra DOM.
   */
  const handleClose = useCallback(() => {
    if (disabled) return;

    setShowModal(false);
    setTimeout(() => {
      onClose();
    }, 300); // Gir tid til en avsluttende animasjon før modalen fjernes.
  }, [disabled, onClose]);

  /**
   * Callback for "Hoved"-knappen (f.eks. "Fortsett").
   * Utfører handlingen spesifisert i `onSubmit`.
   */
  const handleSubmit = useCallback(() => {
    if (disabled) return;

    onSubmit();
  }, [disabled, onSubmit]);

  /**
   * Callback for den sekundære knappen (valgfritt).
   * Utfører handlingen spesifisert i `secondaryAction`.
   */
  const handleSecondaryAction = useCallback(() => {
    if (disabled || !secondaryAction) return;

    secondaryAction();
  }, [disabled, secondaryAction]);

  // Returnerer ingenting hvis modalen ikke er åpen.
  if (!isOpen) return null;

  return (
    <>
      {/* Bakgrunn som dekker hele skjermen når modalen er aktiv */}
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-neutral-800/70">
        {/* Modalens wrapper for innhold */}
        <div className="relative w-full md:w-4/6 lg:w-3/6 xl:w-2/5 my-6 mx-auto h-full lg:h-auto md:h-auto">
          {/* Modalens innhold med animasjon */}
          <div
            className={`translate duration-300 h-full ${
              showModal ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            }`}
          >
            <div className="translate h-full lg:h-auto md:h-auto border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
              {/* HEADER */}
              <div className="flex items-center p-6 rounded-t justify-center relative border-b-[1px]">
                {/* Lukkeknapp */}
                <button
                  onClick={handleClose}
                  className="p-1 border-0 hover:opacity-70 transition absolute right-9"
                >
                  <IoMdClose size={18} />
                </button>
                {/* Tittel i headeren */}
                <div className="text-lg font font-semibold">{title}</div>
              </div>

              {/* BODY */}
              <div className="relative p-6 flex-auto">{body}</div>

              {/* FOOTER */}
              <div className="flex flex-col gap-2 p-6">
                <div className="flex flex-row items-center gap-4 w-full">
                  {/* Sekundær handling (valgfritt) */}
                  {secondaryAction && secondaryActionLabel && (
                    <Button
                      outline
                      disabled={disabled}
                      label={secondaryActionLabel}
                      onClick={handleSecondaryAction}
                    />
                  )}

                  {/* Hoved handling */}
                  <Button disabled={disabled} label={actionLabel} onClick={handleSubmit} />
                </div>
                {/* Footer-innhold */}
                {footer}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
