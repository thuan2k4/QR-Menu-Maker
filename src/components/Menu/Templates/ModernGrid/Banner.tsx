import { useMenuContext } from '../../MenuProvider';

export default function Banner() {
  const { primaryColor } = useMenuContext();

  return (
    <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Offer</p>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">Get 10% back on Hala Taxi</h2>
            <p className="mt-2 text-sm text-gray-500">Start a 60-day MenuPlus free trial with selected orders.</p>
          </div>
          <div className="inline-flex items-center justify-center rounded-3xl bg-[color:var(--theme-primary)] px-4 py-3 text-sm font-bold text-white" style={{ backgroundColor: primaryColor }}>
            Save on rides
          </div>
        </div>
      </div>
    </div>
  );
}
