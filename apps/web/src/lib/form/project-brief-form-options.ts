import { formOptions, revalidateLogic } from '@tanstack/react-form'

import {
  projectBriefDefaultValues,
  projectBriefSchema,
} from '@/lib/form/schemas/project-brief'
import type { ProjectBriefFormValues } from '@/lib/form/schemas/project-brief'
import { milestoneDuplicateDatesValidator } from '@/lib/form/validators/project-brief'

export const projectBriefFormOpts = formOptions({
  defaultValues: projectBriefDefaultValues,
  validationLogic: revalidateLogic({
    mode: 'submit',
    modeAfterSubmission: 'blur',
  }),
  validators: {
    onDynamic: projectBriefSchema,
    onSubmit: milestoneDuplicateDatesValidator,
  },
})

export type { ProjectBriefFormValues }
