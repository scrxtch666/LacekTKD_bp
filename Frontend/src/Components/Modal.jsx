import { useState } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

function ModalWin() {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  return (
    <>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="bg-customWhite p-6 rounded-lg shadow-lg max-w-lg mx-auto mt-20 flex flex-col items-center gap-5 w-96"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <img
          src="/assets/Team/logo_tkdlacek_white.png"
          alt=""
        />
        <hr className="w-48 h-1 mx-auto my-4 bg-gray-100 border-0 rounded-sm dark:bg-customBlack" />
        <label>
          Email{" "}
          <input
            name="myInput"
            className="rounded-md border-2 border-customBlack"
          />
        </label>
        <label>
          Heslo{" "}
          <input
            name="myInput"
            className="rounded-md border-2 border-customBlack"
          />
        </label>

        <div className="">
          <button
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
            onClick={() => setModalIsOpen(false)}
          >
            Zavřít
          </button>
        </div>
      </Modal>
    </>
  );
}

export default ModalWin;
