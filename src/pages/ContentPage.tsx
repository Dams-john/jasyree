export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-4">Contact</h1>
      <div className="space-y-4 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
        <p>
          <span className="font-semibold text-gray-900 dark:text-white">General enquiries</span>
          <br />
          <a className="text-[#e91e8c]" href="mailto:hello@inkwavestudios.com">
            hello@inkwavestudios.com
          </a>
        </p>
        <p>
          <span className="font-semibold text-gray-900 dark:text-white">
            Reader support & payments
          </span>
          <br />
          <a className="text-[#e91e8c]" href="mailto:support@jasyre.com">
            support@jasyre.com
          </a>
        </p>
        <p className="text-gray-500 dark:text-gray-400">
          Operated by Inkwave Studios Ltd.
        </p>
      </div>
    </div>
  );
}
