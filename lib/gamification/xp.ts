export function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

export function getLevelInfo(totalXP: number) {
  let level = 1
  let currentXP = totalXP

  while (currentXP >= getXPForLevel(level)) {
    currentXP -= getXPForLevel(level)
    level++
  }

  return {
    level,
    currentXP,
    nextLevelXP: getXPForLevel(level),
  }
}

export function calculateXP(
  scorePercent: number,
  xpFull: number,
  xpPartial: number,
  passingScore: number
): number {
  if (scorePercent === 100) return xpFull

  if (scorePercent >= passingScore) {
    const ratio = (scorePercent - passingScore) / (100 - passingScore)
    return Math.round(xpPartial + ratio * (xpFull - xpPartial))
  }

  if (scorePercent >= passingScore * 0.5) return Math.round(xpPartial * 0.5)

  return 10
}

export async function checkAndAwardBadges(
  studentId: string,
  context: {
    scorePercent: number
    weekId: string
    serviceClient: any
  }
) {
  const { scorePercent, serviceClient } = context
  const newBadges: any[] = []

  const { data: profile } = await serviceClient
    .from('profiles')
    .select('total_xp, streak_days')
    .eq('id', studentId)
    .single()

  const { data: submissions } = await serviceClient
    .from('exam_submissions')
    .select('id, score')
    .eq('student_id', studentId)
    .eq('is_graded', true)

  const { data: existingBadges } = await serviceClient
    .from('student_badges')
    .select('badge_id')
    .eq('student_id', studentId)

  const earnedBadgeIds = new Set(
    existingBadges?.map((badge: { badge_id: string }) => badge.badge_id) || []
  )

  const { data: allBadges } = await serviceClient.from('badges').select('*')

  for (const badge of allBadges || []) {
    if (earnedBadgeIds.has(badge.id)) continue

    let earned = false

    switch (badge.condition_type) {
      case 'first_exam':
        earned = (submissions?.length || 0) === 1
        break
      case 'perfect_score':
        earned = scorePercent === 100
        break
      case 'streak':
        earned = (profile?.streak_days || 0) >= (badge.condition_value || 0)
        break
      case 'weeks_completed':
        earned = (submissions?.length || 0) >= (badge.condition_value || 0)
        break
    }

    if (!earned) continue

    const { error } = await serviceClient.from('student_badges').insert({
      student_id: studentId,
      badge_id: badge.id,
    })

    if (error) continue

    if (badge.xp_bonus > 0) {
      await serviceClient.rpc('increment_xp', {
        p_student_id: studentId,
        p_xp: badge.xp_bonus,
        p_week_id: null,
      })
    }

    newBadges.push(badge)
  }

  return newBadges
}
