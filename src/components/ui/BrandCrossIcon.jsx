/** Brand logo image mark used in nav/footer/auth. */
export default function BrandCrossIcon({ className = '', alt = '', ...props }) {
  return (
    <img
      className={className}
      src="/logo.png"
      alt={alt}
      {...props}
    />
  );
}
