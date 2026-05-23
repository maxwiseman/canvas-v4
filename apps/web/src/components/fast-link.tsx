import { Link, useNavigate } from '@tanstack/react-router'

// `FastLink` triggers client-side navigation on `mousedown` to make route transitions
// feel more responsive. It's typed as `typeof Link` so you keep TanStack Router's
// `to`/`params` inference at call sites.
export const FastLink = ((props: any) => {
  const navigate = useNavigate()

  return (
    <Link
      {...props}
      onMouseDown={(e: any) => {
        props.onMouseDown?.(e)

        if (
          e.button !== 0 ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey
        ) {
          return
        }

        e.preventDefault()
        navigate({
          to: props.to,
          from: props.from,
          params: props.params,
          search: props.search,
          hash: props.hash,
          state: props.state,
          replace: props.replace,
        })
      }}
      onClick={(e: any) => {
        props.onClick?.(e)

        // Only block the browser default for plain left-clicks. For cmd/ctrl/shift
        // clicks (new tab/window) or other buttons, let the browser handle it.
        if (
          e.button !== 0 ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey
        ) {
          return
        }

        e.preventDefault()
      }}
    />
  )
}) as typeof Link
