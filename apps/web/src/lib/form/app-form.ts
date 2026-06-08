import { createFormHook } from '@tanstack/react-form'

import { fieldContext, formContext } from '@/lib/form/form-context'

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {},
  formComponents: {},
})
