import { useEffect } from "react";
import { X } from "lucide-react";
import Button from "./Button";
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "medium",
  hideCloseButton = false,//forces user to make choice from either of two by disbaling all close button nad options
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();//used to listen to escape key when pressed ,model closes
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);//when model opens ,set up keyboard listening ,it check the pressed key and run function handleescape if the pressed key is escape then it closes the model and prevent page scrolling
      document.body.style.overflow = "hidden";//this prevent page scrollingby hiding scrollbar
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    small: "max-w-md",
    medium: "max-w-lg",
    large: "max-w-2xl",
    xlarge: "max-w-4xl",
    full: "max-w-full mx-4",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* //fixed position fixed the elements position relative to broswer window,not the page,
      // inset-0=used to make the element take 100% of the parents container ,
      // z-50=used to set the z-index of the element controls stacking oders which elements are in front or behind other elementsfor page contents we use z-0-10,for modal we use z-50,for dropdown we use z-20-30
      // overflow-y-auto=allows vertical scrolling if content is taller than the viewport*/}
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"//this is the section whcih appers behiond the modal and is used to make the modal focusableand when we click on the backdrop it closes the modal
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
          className={`relative w-full ${sizes[size]} transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl transition-all`}
        >
          {/* Header */}
          {title && (
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3
                  id="modal-title"
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  {title}
                </h3>

                {!hideCloseButton && (
                  <Button
                  variant="ghost"
                    onClick={onClose}
                    aria-label="Close modal"
                    icon={<X />}
                    iconOnly
                  >
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
