import { z } from 'zod'

export const contactRoleSchema = z.enum([
  'pm',
  'design',
  'engineering',
  'stakeholder',
])

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  role: contactRoleSchema,
})

export const milestoneSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  targetDate: z.string().min(1, 'Target date is required'),
})

export const ownerSchema = z.object({
  name: z.string().min(2, 'Owner name must be at least 2 characters'),
  email: z.string().email('Enter a valid owner email'),
})

export const projectBriefSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(80, 'Title must be 80 characters or fewer'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Use lowercase letters, numbers, and hyphens'
    ),
  summary: z.string().max(500, 'Summary must be 500 characters or fewer'),
  owner: ownerSchema,
  contacts: z.array(contactSchema).min(1, 'Add at least one contact'),
  milestones: z.array(milestoneSchema),
})

export type ContactRole = z.infer<typeof contactRoleSchema>
export type Contact = z.infer<typeof contactSchema>
export type Milestone = z.infer<typeof milestoneSchema>
export type Owner = z.infer<typeof ownerSchema>
export type ProjectBriefFormValues = z.infer<typeof projectBriefSchema>

export const emptyContact = (): Contact => ({
  name: '',
  email: '',
  role: 'pm',
})

export const emptyMilestone = (): Milestone => ({
  title: '',
  targetDate: '',
})

export const ownerDefaultValues = {
  name: '',
  email: '',
} satisfies Owner

export const projectBriefDefaultValues = {
  title: '',
  slug: '',
  summary: '',
  owner: ownerDefaultValues,
  contacts: [emptyContact()],
  milestones: [emptyMilestone()],
} satisfies ProjectBriefFormValues
