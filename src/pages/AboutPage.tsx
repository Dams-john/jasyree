export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-16">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">About Jasyre</p>
      <h1 className="text-3xl font-black text-[#e91e8c] mb-6">Stories Worth Getting Lost In</h1>

      <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
        <p>
          Jasyre is a digital reading platform created to bring readers closer to stories that
          entertain, surprise, challenge and move them.
        </p>
        <p>
          From contemporary romance and billionaire love stories to suspense, drama, fantasy and
          other compelling genres, Jasyre gives readers a place to discover their next favourite
          story.
        </p>
        <p>
          Whether you enjoy slow-burn romance, complicated relationships, betrayal and revenge, or
          completely different adventures, there&apos;s always another story waiting to be explored.
        </p>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white pt-4">Our Mission</h2>
        <p>
          Our mission is to make engaging digital stories accessible to readers while creating
          opportunities for compelling storytelling and original intellectual property to grow.
        </p>
        <p>
          We want readers to discover stories they love, explore different genres and enjoy reading
          at their own pace.
        </p>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white pt-4">More Than Reading</h2>
        <p>
          Jasyre is part of a broader entertainment vision built around stories and intellectual
          property.
        </p>
        <p>
          We believe great stories can travel beyond the page. With the appropriate permissions and
          separate agreements where required, stories may have opportunities to develop into other
          entertainment formats, including film, television, vertical dramas, audio productions and
          interactive experiences.
        </p>
        <p>
          However, making a story available on Jasyre does not automatically grant us the right to
          adapt it into another format. Any such rights must be covered by a separate agreement with
          the relevant rights holder.
        </p>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white pt-4">Our Commitment</h2>
        <p>
          We aim to provide an enjoyable reading experience, clear information about purchases and
          platform rules, and a straightforward way for readers to contact us when they need
          assistance.
        </p>
        <p>
          Our catalogue may include mature themes and adult-oriented content. Age restrictions and
          appropriate access controls apply to content intended only for adults.
        </p>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white pt-4">Contact Us</h2>
        <p>
          For general enquiries, contact{' '}
          <a href="mailto:hello@inkwavestudios.com" className="text-[#e91e8c] underline">
            hello@inkwavestudios.com
          </a>
          .
        </p>
        <p>
          For reader support and payment enquiries, contact{' '}
          <a href="mailto:support@jasyre.com" className="text-[#e91e8c] underline">
            support@jasyre.com
          </a>
          .
        </p>
        <p>
          For information about how we handle personal information, please read our Privacy Policy.
        </p>
        <p>For the rules governing use of Jasyre, please read our Terms of Use.</p>
      </div>
    </div>
  );
}
