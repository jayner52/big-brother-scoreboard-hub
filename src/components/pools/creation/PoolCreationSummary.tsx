export const PoolCreationSummary = () => {
  return (
    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
      <h4 className="font-semibold text-green-800 mb-2">Smart Defaults Applied:</h4>
      <ul className="text-sm text-green-700 space-y-1">
        <li>• 🏆 Pre-configured scoring rules for all BB events</li>
        <li>• 📊 Prize distribution: 50% / 30% / 20%</li>
        <li>• 👥 4 draft groups + 1 free pick (5 selections per team)</li>
        <li>• 🏠 Season 27 houseguests will be loaded automatically</li>
        <li>• 🔒 Invite-only for security</li>
      </ul>
    </div>
  );
};