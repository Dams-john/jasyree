export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-gray-700 dark:text-gray-300 text-sm leading-relaxed space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Jasyre Privacy Policy</h1>
        <p className="text-xs text-gray-500 mt-1">Last updated: 18 October 2026</p>
      </div>

      <p>
        This Privacy Policy explains how personal information is handled when you use Jasyre,
        operated by Inkwave Studios Ltd.
      </p>

      <section>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">1. Information We Collect</h2>
        <p>
          Account details (email, name), reading activity, coin and payment records (via Stripe),
          technical data (IP, device), and messages when you contact us.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">2. How We Use It</h2>
        <p>
          To run accounts, provide stories, process payments, support you, prevent fraud, improve
          the platform, and meet legal duties.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">3–14. Full policy</h2>
        <p>
          Full details on lawful bases, cookies, advertising, sharing, retention, your rights, and
          children’s privacy are in the complete Privacy Policy. Contact: support@jasyre.com /
          hello@inkwavestudios.com.
        </p>
      </section>
    </div>
  );
}
