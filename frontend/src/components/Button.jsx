import LoadingSpinner from './LoadingSpinner.jsx'

export default function Button({
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  children,
}) {
  const base =
    'w-full flex items-center justify-center gap-2 px-4 py-[13px] font-bold text-[15px] rounded-[999px] border transition-all relative overflow-hidden btn-shine'

  const variants = {
    primary:
      'bg-[#E07A3E] text-[#2B2B2B] border-transparent hover:bg-[#B85F26] hover:text-white hover:-translate-y-px hover:shadow-[0_6px_16px_-4px_rgba(224,122,62,0.5)] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none',
    outline:
      'bg-white text-[#1B4F72] border-[#1B4F72]/30 hover:bg-[#EAF1F6] hover:-translate-y-px',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <LoadingSpinner size={16} color="#2B2B2B" />
      ) : (
        children
      )}
    </button>
  )
}
