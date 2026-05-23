import { canvas } from '@/lib/canvas'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/classes/$classId/assignments/$assignmentId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { classId, assignmentId } = Route.useParams()
  const { assignment, isRefreshing } = canvas.assignments.useGet(classId, assignmentId)

  if (!assignment) {
    return <div>{isRefreshing ? 'Loading assignment...' : 'Assignment not found'}</div>
  }

  return <div><h1>{assignment.name}</h1>
    <div dangerouslySetInnerHTML={{__html: assignment.description ?? ""}} /></div>
}
