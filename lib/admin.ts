export const ADMIN_EMAILS = [
  'renanriado@gmail.com',
  'leonardo6meirelles@gmail.com2',
]

export function isAdmin(email?: string | null) {
  return !!email && ADMIN_EMAILS.includes(email)
}