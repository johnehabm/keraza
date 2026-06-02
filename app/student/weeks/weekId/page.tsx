import { redirect } from 'next/navigation'

export default function LiteralWeekIdFallbackPage() {
  redirect('/student/weeks')
}
