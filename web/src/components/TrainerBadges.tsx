/**
 * @fileoverview "Certified" / "Licensed" badges for a listing's trainer.
 *
 * Shown next to the trainer name on catalog cards and in the course detail
 * dialog (Step 6, when listings got an owner). Seed listings without an
 * owner have no profile behind them, so they show nothing.
 */

import type {Course} from '@/lib/types';

interface TrainerBadgesProps {
  course: Course;
}

/** Two small status chips: certification and teaching license. */
export function TrainerBadges({course}: TrainerBadgesProps) {
  if (course.ownerId === null) return null;
  const certified = course.certificationStatus === 'approved';
  const licensed = course.licenseStatus === 'approved';
  return (
    <div className="trainer-badges">
      <span className={certified ? 'trainer-badge ok' : 'trainer-badge'}>
        {certified ? 'Certified' : 'Not certified'}
      </span>
      <span className={licensed ? 'trainer-badge ok' : 'trainer-badge'}>
        {licensed ? 'Licensed' : 'Not licensed'}
      </span>
    </div>
  );
}
