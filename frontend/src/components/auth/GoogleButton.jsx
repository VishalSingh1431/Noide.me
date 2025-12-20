import { FcGoogle } from 'react-icons/fc';

const GoogleButton = ({ onClick, disabled = false, text = 'Continue with Google' }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700"
    >
      <FcGoogle className="w-5 h-5" />
      <span>{text}</span>
    </button>
  );
};

export default GoogleButton;

