import { Info } from 'lucide-react';
import { useMenuContext } from './MenuProvider';

interface PrivatePreviewInlineNoticeProps {
  className?: string;
}

export default function PrivatePreviewInlineNotice({ className = '' }: PrivatePreviewInlineNoticeProps) {
  const { menuVisibility, isOwner, primaryColor, secondaryColor } = useMenuContext();

  if (menuVisibility === 'public' || !isOwner) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`mt-4 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 ${className}`.trim()}
      style={{ borderColor: primaryColor, backgroundColor: secondaryColor, color: primaryColor }}
    >
      <div className="flex items-start gap-2">
        <Info size={16} className="mt-0.5 shrink-0" />
        <p>
          Ban dang xem menu o che do Private voi role user. Day la ban xem truoc cho chu cua hang,
          khach ben ngoai se khong truy cap duoc.
        </p>
      </div>
    </div>
  );
}
