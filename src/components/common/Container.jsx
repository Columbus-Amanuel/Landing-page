import { cn } from '@/lib/utils';

/**
 * Centered max-width wrapper. `size` controls the cap:
 *  - md  ≈ 800px (reading width)
 *  - lg  ≈ 1024px
 *  - xl  ≈ 1200px (default page width)
 */
export default function Container({ size = 'xl', className, children, ...props }) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-6',
        size === 'md' && 'max-w-3xl',
        size === 'lg' && 'max-w-5xl',
        size === 'xl' && 'max-w-7xl',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
