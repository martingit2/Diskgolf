/**
 * Filnavn: Modal.tsx
 * Beskrivelse: Gjenbrukbar modal-komponent...
 * Utvikler: Martin Pettersen
 * AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import Button from "../Button"; // Antar at denne finnes

interface ModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSubmit: () => void; // Callback for hovedhandling (hvis brukt)
  title?: string;
  body?: React.ReactElement;
  footer?: React.ReactElement; // For å sende inn egendefinert footer (som i ResetPasswordModal)
  actionLabel?: string; // Endret til valgfri
  disabled?: boolean;
  secondaryAction?: () => void;
  secondaryActionLabel?: string; // Også valgfri
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  body,
  footer, // Mottar footer prop
  actionLabel, // Mottar actionLabel (kan være tom eller undefined)
  disabled,
  secondaryAction,
  secondaryActionLabel, // Mottar secondaryActionLabel
}) => {
  const [showModal, setShowModal] = useState(isOpen);

  useEffect(() => {
    setShowModal(isOpen);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (disabled) return;
    setShowModal(false);
    setTimeout(() => onClose(), 300);
  }, [disabled, onClose]);

  const handleSubmit = useCallback(() => {
    if (disabled) return;
    onSubmit();
  }, [disabled, onSubmit]);

  const handleSecondaryAction = useCallback(() => {
    if (disabled || !secondaryAction) return;
    secondaryAction();
  }, [disabled, secondaryAction]);

  if (!isOpen) return null;

  // Bestem om den innebygde knapperaden skal vises
  // Skal kun vises hvis 'footer'-prop IKKE er gitt, OG minst én av action-labels har en verdi.
  const showInternalActions = !footer && (!!actionLabel || !!secondaryActionLabel);


  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-neutral-800/70">
        <div className="relative w-full md:w-4/6 lg:w-3/6 xl:w-2/5 my-6 mx-auto h-auto max-h-[90vh] overflow-y-auto">
          <div
            className={`translate duration-300 h-full ${
              showModal ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            }`}
          >
            <div className="translate h-full lg:h-auto md:h-auto border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
              {/* HEADER */}
              <div className="flex items-center p-4 md:p-5 rounded-t justify-center relative border-b-[1px]">
                <div className="text-lg font-semibold">{title}</div>
                <button
                  onClick={handleClose}
                  className="p-1 border-0 hover:opacity-70 transition absolute right-4 top-3 text-gray-500 hover:text-gray-800"
                >
                  <IoMdClose size={24} />
                </button>
              </div>

              {/* BODY */}
              <div className="relative flex-auto">
                {body}
              </div>

              {/* ------ START FOOTER LOGIC ------ */}

              {/* 1. Render den innebygde knapperaden KUN hvis betingelsen er sann */}
              {showInternalActions && (
                 <div className="flex flex-col gap-2 p-4 md:p-5 border-t-[1px]">
                   <div className="flex flex-row items-center gap-4 w-full">
                     {/* Sekundær handling (vises kun hvis label finnes) */}
                     {secondaryAction && secondaryActionLabel && (
                       <Button
                         outline
                         disabled={disabled}
                         label={secondaryActionLabel}
                         onClick={handleSecondaryAction}
                       />
                     )}
                     {/* Hoved handling (vises kun hvis label finnes) */}
                     {actionLabel && (
                        <Button
                          disabled={disabled}
                          label={actionLabel}
                          onClick={handleSubmit}
                          // Pass på at Button-komponenten din håndterer manglende 'type' eller sett default 'button'
                          // type="button" // Eller 'submit' hvis den skal submitte noe internt i Modal
                        />
                     )}
                   </div>
                 </div>
              )}

              {/* 2. Render footer-propen HVIS den er gitt (ignorerer da interne knapper) */}
               {footer && (
                  <div className="p-4 md:p-5 border-t-[1px]"> {/* Legg til border-top hvis footer skal ha det */}
                     {footer}
                  </div>
               )}

              {/* ------ END FOOTER LOGIC ------ */}

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;