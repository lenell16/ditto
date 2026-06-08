import { Button } from '@workspace/ui/components/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Spinner } from '@workspace/ui/components/spinner'
import { Textarea } from '@workspace/ui/components/textarea'

import { withFieldGroup, withForm } from '@/lib/form/app-form'
import { fieldErrors, isFieldInvalid } from '@/lib/form/field-utils'
import { projectBriefFormOpts } from '@/lib/form/project-brief-form-options'
import {
  emptyContact,
  emptyMilestone,
  ownerDefaultValues,
} from '@/lib/form/schemas/project-brief'
import type { ContactRole } from '@/lib/form/schemas/project-brief'
import { slugFieldAsyncValidators } from '@/lib/form/validators/project-brief'

const roleLabels: Record<ContactRole, string> = {
  pm: 'Product',
  design: 'Design',
  engineering: 'Engineering',
  stakeholder: 'Stakeholder',
}

export const BasicsSection = withForm({
  ...projectBriefFormOpts,
  props: {
    title: '',
  },
  render: function Render({ form, title }) {
    return (
      <section className="flex flex-col gap-4 rounded-lg border border-border p-4">
        <div>
          <h2 className="font-medium">{title}</h2>
          <p className="text-sm text-muted-foreground">
            Zod schema validates on submit, then on blur after the first
            attempt. Slug availability is checked asynchronously while typing.
          </p>
        </div>

        <FieldGroup>
          <form.Field
            name="title"
            children={(field) => {
              const invalid = isFieldInvalid(field)
              return (
                <Field data-invalid={invalid}>
                  <FieldLabel htmlFor={field.name}>Project title</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={invalid}
                    placeholder="Memoria onboarding refresh"
                    required
                  />
                  {invalid ? (
                    <FieldError errors={fieldErrors(field.state.meta.errors)} />
                  ) : null}
                </Field>
              )
            }}
          />

          <form.Field
            name="slug"
            asyncDebounceMs={450}
            validators={slugFieldAsyncValidators}
            children={(field) => {
              const invalid = isFieldInvalid(field)
              return (
                <Field data-invalid={invalid}>
                  <FieldLabel htmlFor={field.name}>URL slug</FieldLabel>
                  <div className="relative">
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={invalid}
                      placeholder="memoria-onboarding"
                      required
                    />
                    {field.state.meta.isValidating ? (
                      <Spinner className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground" />
                    ) : null}
                  </div>
                  <FieldDescription>
                    Try alpha, beta, or memoria to see async rejection.
                  </FieldDescription>
                  {invalid ? (
                    <FieldError errors={fieldErrors(field.state.meta.errors)} />
                  ) : null}
                </Field>
              )
            }}
          />

          <form.Field
            name="summary"
            children={(field) => {
              const invalid = isFieldInvalid(field)
              return (
                <Field data-invalid={invalid}>
                  <FieldLabel htmlFor={field.name}>Summary</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={invalid}
                    placeholder="What are we building and why?"
                    rows={4}
                  />
                  <FieldDescription>
                    Optional project overview.
                  </FieldDescription>
                  {invalid ? (
                    <FieldError errors={fieldErrors(field.state.meta.errors)} />
                  ) : null}
                </Field>
              )
            }}
          />
        </FieldGroup>
      </section>
    )
  },
})

export const OwnerFields = withFieldGroup({
  defaultValues: ownerDefaultValues,
  props: {
    title: '',
  },
  render: function Render({ group, title }) {
    return (
      <section className="flex flex-col gap-4 rounded-lg border border-border p-4">
        <div>
          <h2 className="font-medium">{title}</h2>
          <p className="text-sm text-muted-foreground">
            Nested object fields using a field group.
          </p>
        </div>

        <FieldSet className="grid gap-4 sm:grid-cols-2">
          <FieldLegend className="sr-only">Project owner</FieldLegend>

          <group.Field
            name="name"
            children={(field) => {
              const invalid = isFieldInvalid(field)
              return (
                <Field data-invalid={invalid}>
                  <FieldLabel htmlFor={field.name}>Owner name</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={invalid}
                    autoComplete="name"
                    required
                  />
                  {invalid ? (
                    <FieldError errors={fieldErrors(field.state.meta.errors)} />
                  ) : null}
                </Field>
              )
            }}
          />

          <group.Field
            name="email"
            children={(field) => {
              const invalid = isFieldInvalid(field)
              return (
                <Field data-invalid={invalid}>
                  <FieldLabel htmlFor={field.name}>Owner email</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={invalid}
                    autoComplete="email"
                    required
                  />
                  {invalid ? (
                    <FieldError errors={fieldErrors(field.state.meta.errors)} />
                  ) : null}
                </Field>
              )
            }}
          />
        </FieldSet>
      </section>
    )
  },
})

export const ContactsSection = withForm({
  ...projectBriefFormOpts,
  props: {
    title: '',
  },
  render: function Render({ form, title }) {
    return (
      <section className="flex flex-col gap-4 rounded-lg border border-border p-4">
        <div>
          <h2 className="font-medium">{title}</h2>
          <p className="text-sm text-muted-foreground">
            Array fields with nested objects.
          </p>
        </div>

        <form.Field name="contacts" mode="array">
          {(contactsField) => (
            <FieldGroup className="gap-3">
              {contactsField.state.value.map((_, index) => (
                <article
                  key={index}
                  className="grid gap-3 rounded-md border border-dashed border-border p-3 sm:grid-cols-[1fr_1fr_minmax(9rem,12rem)_auto]"
                >
                  <form.Field
                    name={`contacts[${index}].name`}
                    children={(field) => {
                      const invalid = isFieldInvalid(field)
                      return (
                        <Field data-invalid={invalid}>
                          <FieldLabel htmlFor={field.name}>
                            Contact {index + 1} name
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                            aria-invalid={invalid}
                            required
                          />
                          {invalid ? (
                            <FieldError
                              errors={fieldErrors(field.state.meta.errors)}
                            />
                          ) : null}
                        </Field>
                      )
                    }}
                  />

                  <form.Field
                    name={`contacts[${index}].email`}
                    children={(field) => {
                      const invalid = isFieldInvalid(field)
                      return (
                        <Field data-invalid={invalid}>
                          <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            type="email"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                            aria-invalid={invalid}
                            autoComplete="email"
                            required
                          />
                          {invalid ? (
                            <FieldError
                              errors={fieldErrors(field.state.meta.errors)}
                            />
                          ) : null}
                        </Field>
                      )
                    }}
                  />

                  <form.Field
                    name={`contacts[${index}].role`}
                    children={(field) => {
                      const invalid = isFieldInvalid(field)
                      return (
                        <Field data-invalid={invalid}>
                          <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                          <Select
                            name={field.name}
                            value={field.state.value}
                            onValueChange={(value) => {
                              field.handleChange(value as ContactRole)
                              field.handleBlur()
                            }}
                          >
                            <SelectTrigger
                              id={field.name}
                              className="w-full"
                              aria-invalid={invalid}
                            >
                              <SelectValue placeholder="Choose a role">
                                {roleLabels[field.state.value]}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {(
                                Object.keys(roleLabels) as Array<ContactRole>
                              ).map((role) => (
                                <SelectItem key={role} value={role}>
                                  {roleLabels[role]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {invalid ? (
                            <FieldError
                              errors={fieldErrors(field.state.meta.errors)}
                            />
                          ) : null}
                        </Field>
                      )
                    }}
                  />

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={contactsField.state.value.length <= 1}
                      onClick={() => contactsField.removeValue(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </article>
              ))}

              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="self-start"
                onClick={() => contactsField.pushValue(emptyContact())}
              >
                Add contact
              </Button>
            </FieldGroup>
          )}
        </form.Field>
      </section>
    )
  },
})

export const MilestonesSection = withForm({
  ...projectBriefFormOpts,
  props: {
    title: '',
  },
  render: function Render({ form, title }) {
    return (
      <section className="flex flex-col gap-4 rounded-lg border border-border p-4">
        <div>
          <h2 className="font-medium">{title}</h2>
          <p className="text-sm text-muted-foreground">
            Duplicate target dates surface as field-level errors on submit.
          </p>
        </div>

        <form.Field name="milestones" mode="array">
          {(milestonesField) => (
            <FieldGroup className="gap-3">
              {milestonesField.state.value.map((_, index) => (
                <article
                  key={index}
                  className="grid gap-3 rounded-md border border-dashed border-border p-3 sm:grid-cols-[1fr_12rem_auto]"
                >
                  <form.Field
                    name={`milestones[${index}].title`}
                    children={(field) => {
                      const invalid = isFieldInvalid(field)
                      return (
                        <Field data-invalid={invalid}>
                          <FieldLabel htmlFor={field.name}>
                            Milestone {index + 1}
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                            aria-invalid={invalid}
                            required
                          />
                          {invalid ? (
                            <FieldError
                              errors={fieldErrors(field.state.meta.errors)}
                            />
                          ) : null}
                        </Field>
                      )
                    }}
                  />

                  <form.Field
                    name={`milestones[${index}].targetDate`}
                    children={(field) => {
                      const invalid = isFieldInvalid(field)
                      return (
                        <Field data-invalid={invalid}>
                          <FieldLabel htmlFor={field.name}>
                            Target date
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            type="date"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                            aria-invalid={invalid}
                            required
                          />
                          {invalid ? (
                            <FieldError
                              errors={fieldErrors(field.state.meta.errors)}
                            />
                          ) : null}
                        </Field>
                      )
                    }}
                  />

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={milestonesField.state.value.length <= 1}
                      onClick={() => milestonesField.removeValue(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </article>
              ))}

              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="self-start"
                onClick={() => milestonesField.pushValue(emptyMilestone())}
              >
                Add milestone
              </Button>
            </FieldGroup>
          )}
        </form.Field>
      </section>
    )
  },
})
