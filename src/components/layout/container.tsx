/**
 * A React component that renders a full-width container with a gray background and vertical padding.
 * 
 * The container has a maximum width of 7xl (1920px) and centers its content horizontally.
 * The content inside the container is wrapped in a div with vertical spacing.
 * 
 * @param className - Additional CSS classes to apply to the container
 * @param children - The content to render inside the container
 * @param props - Additional HTML attributes to apply to the container
 * @returns A React element representing the container
 */
import * as React from 'react';

import { mergeClasses } from '@/lib/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLElement> {}

const Container = React.forwardRef<HTMLElement, ContainerProps>(
  ({ className, children, ...props }: ContainerProps, ref) => {
    return (
      <section
        className={mergeClasses(
          'w-full bg-gray py-16 md:py-20 2xl:py-24',
          className
        )}
        ref={ref}
        {...props}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 md:gap-12 md:px-8">
          {children}
        </div>
      </section>
    );
  }
);

Container.displayName = 'Container';

export default Container;
