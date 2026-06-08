import { createFileRoute } from '@tanstack/react-router'

import { ProjectBriefForm } from '@/components/project-brief/project-brief-form'

export const Route = createFileRoute('/forms')({
  component: FormsPage,
})

function FormsPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-xl font-medium">Forms</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Shared <code>formOptions</code>, Standard Schema validation, shadcn{' '}
          <code>Field</code> primitives, and TanStack Form composition with{' '}
          <code>withForm</code> / <code>withFieldGroup</code>.
        </p>
      </header>

      <ProjectBriefForm />
    </main>
  )
}
