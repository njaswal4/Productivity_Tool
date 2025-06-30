// src/components/FormModal/FormModal.jsx
import React from 'react'
import 'src/index.css' // Ensures Tailwind styles are available

const FormModal = ({ onClose, children }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
          aria-label="Close"
        >
          ✖
        </button>
        {children}
      </div>
    </div>
  )
}

export default FormModal
