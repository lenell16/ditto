import type { ProjectBriefFormValues } from '@/lib/form/schemas/project-brief'
import { checkSlugAvailability } from '@/lib/form/validators/async'

export function milestoneDuplicateDatesValidator({
  value,
}: {
  value: ProjectBriefFormValues
}) {
  const fields: Record<string, string> = {}
  const seen = new Map<string, number>()

  value.milestones.forEach((milestone, index) => {
    if (!milestone.targetDate) return

    const firstIndex = seen.get(milestone.targetDate)
    if (firstIndex !== undefined) {
      fields[`milestones[${index}].targetDate`] = 'Target dates must be unique'
      fields[`milestones[${firstIndex}].targetDate`] =
        'Target dates must be unique'
      return
    }

    seen.set(milestone.targetDate, index)
  })

  if (Object.keys(fields).length > 0) {
    return {
      form: 'Milestone target dates must be unique',
      fields,
    }
  }

  return undefined
}

async function validateSlugAvailability({
  value,
  signal,
}: {
  value: string
  signal: AbortSignal
}) {
  if (!value || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    return undefined
  }

  try {
    const { available } = await checkSlugAvailability(value, signal)
    return available ? undefined : 'This slug is already taken'
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return undefined
    }
    throw error
  }
}

export const slugFieldAsyncValidators = {
  onChangeAsync: validateSlugAvailability,
  onSubmitAsync: validateSlugAvailability,
} as const
