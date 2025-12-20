import { Loader2 } from 'lucide-react';

const SubmitButton = ({ loading = false, text = 'Submit', disabled = false, ...props }) => {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Submitting...</span>
        </>
      ) : (
        <span>{text}</span>
      )}
    </button>
  );
};

export default SubmitButton;

