type FieldMetaLike = {
  state: {
    meta: {
      isTouched: boolean
      isValid: boolean
    }
  }
}

export function isFieldInvalid(field: FieldMetaLike) {
  return field.state.meta.isTouched && !field.state.meta.isValid
}

export function fieldErrors(
  errors: ReadonlyArray<unknown>
): Array<{ message?: string } | undefined> {
  return errors.map((error) => {
    if (typeof error === 'string') return { message: error }
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof error.message === 'string'
    ) {
      return { message: error.message }
    }
    return { message: String(error) }
  })
}
