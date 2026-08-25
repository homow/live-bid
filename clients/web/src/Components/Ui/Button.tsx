type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
};

const Button = ({ children, onClick }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="
        rounded-xl
        border
        border-indigo-500/40
        bg-indigo-500/10
        px-5
        py-2.5
        text-sm
        font-semibold
        text-indigo-400
        transition-all
        duration-300
       active:text-white
        hover:text-white
        hover:shadow-lg
        hover:shadow-indigo-500/20
        active:scale-95
      "
    >
      {children}
    </button>
  );
};

export default Button;
