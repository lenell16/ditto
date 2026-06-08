import * as React from 'react'
import { Button } from '@workspace/ui/components/button'
import { Field } from '@workspace/ui/components/field'
import { Spinner } from '@workspace/ui/components/spinner'
import { cn } from '@workspace/ui/lib/utils'

import {
  BasicsSection,
  ContactsSection,
  MilestonesSection,
  OwnerFields,
} from '@/components/project-brief/project-brief-sections'
import { useAppForm } from '@/lib/form/app-form'
import { projectBriefFormOpts } from '@/lib/form/project-brief-form-options'
import { projectBriefSchema } from '@/lib/form/schemas/project-brief'
import type { ProjectBriefFormValues } from '@/lib/form/schemas/project-brief'

type ProjectBriefFormProps = {
  onSubmitted?: (value: ProjectBriefFormValues) => void
}

export function ProjectBriefForm({ onSubmitted }: ProjectBriefFormProps) {
  const [lastSubmitted, setLastSubmitted] =
    React.useState<ProjectBriefFormValues | null>(null)

  const form = useAppForm({
    ...projectBriefFormOpts,
    onSubmit: async ({ value }) => {
      const parsed = projectBriefSchema.parse(value)
      await new Promise((resolve) => window.setTimeout(resolve, 500))
      setLastSubmitted(parsed)
      onSubmitted?.(parsed)
    },
  })

  return (
    <form
      className="flex flex-col gap-6"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Subscribe
        selector={(state) => ({
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
          isDirty: state.isDirty,
          errorCount: state.errors.length,
          contactCount: state.values.contacts.length,
        })}
      >
        {(state) => (
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <span>{state.isDirty ? 'Unsaved changes' : 'Pristine'}</span>
            <span aria-hidden="true">·</span>
            <span>{state.contactCount} contacts</span>
            <span aria-hidden="true">·</span>
            <span>{state.canSubmit ? 'Ready to submit' : 'Blocked'}</span>
            {state.errorCount > 0 ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-destructive">
                  {state.errorCount} form error
                  {state.errorCount === 1 ? '' : 's'}
                </span>
              </>
            ) : null}
            {state.isSubmitting ? (
              <>
                <span aria-hidden="true">·</span>
                <span>Submitting…</span>
              </>
            ) : null}
          </div>
        )}
      </form.Subscribe>

      <BasicsSection form={form} title="Basics" />
      <OwnerFields form={form} fields="owner" title="Owner" />
      <ContactsSection form={form} title="Contacts" />
      <MilestonesSection form={form} title="Milestones" />

      <Field orientation="horizontal" className="flex-wrap items-center gap-3">
        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
            isPristine: state.isPristine,
          })}
        >
          {(state) => {
            const blocked =
              !state.canSubmit || state.isPristine || state.isSubmitting

            return (
              <Button
                type="submit"
                aria-disabled={blocked}
                className={cn(blocked && 'pointer-events-none opacity-50')}
              >
                {state.isSubmitting ? (
                  <>
                    <Spinner className="size-4" />
                    Saving…
                  </>
                ) : (
                  'Save brief'
                )}
              </Button>
            )
          }}
        </form.Subscribe>

        <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
          {(submitError) =>
            submitError ? (
              <p className="text-sm text-destructive" role="alert">
                {typeof submitError === 'string'
                  ? submitError
                  : 'Fix validation errors before saving.'}
              </p>
            ) : null
          }
        </form.Subscribe>
      </Field>

      {lastSubmitted ? (
        <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
          {JSON.stringify(lastSubmitted, null, 2)}
        </pre>
      ) : null}
    </form>
  )
}
