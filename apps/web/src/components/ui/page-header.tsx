import * as React from "react"
import { cn } from "@/lib/utils"

function PageHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 pb-6", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function PageHeaderHeading({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  )
}

function PageHeaderDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "max-w-2xl text-lg font-light text-foreground/70",
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}

export { PageHeader, PageHeaderHeading, PageHeaderDescription }