"use client";

import { X } from "lucide-react";
import { ReactNode } from "react";

type AuthModalProp = {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
};

const AuthModal = ({ children, isOpen, title, onClose }: AuthModalProp) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-100 rounded-xl border border-white/30 bg-white/20 p-6 shadow-2xl backdrop-blur-xl">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 rounded-full p-1 transition hover:bg-white/20"
        >
          <X size={22} />
        </button>

        <h2 className="mb-4 text-title-md">{title}</h2>

        {children}
      </div>
    </div>
  );
};

export default AuthModal;
