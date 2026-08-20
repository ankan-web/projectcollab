import LegalDoc from "./LegalDoc";

const sections = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    body: (
      <>
        <p>
          By creating an account or using HackHive ("the Service"), you agree to these Terms and
          Conditions. If you do not agree, do not use the Service.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    title: "Accounts",
    body: (
      <>
        <p>
          You are responsible for safeguarding your account credentials and for all activity that
          occurs under your account. You may sign in with email, Google, or GitHub. You must provide
          accurate information during registration and keep your profile up to date.
        </p>
      </>
    ),
  },
  {
    id: "content",
    title: "User Content",
    body: (
      <>
        <p>You retain ownership of the content you post. By posting content you grant HackHive a non-exclusive license to store, display, and distribute it as needed to operate the Service.</p>
        <ul>
          <li>Projects, profiles, groups, and messages are visible to other users as designed.</li>
          <li>You are responsible for the content you publish and the claims you make about it.</li>
          <li>We may remove content that violates these Terms.</li>
        </ul>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable Use",
    body: (
      <>
        <p>You agree not to misuse the Service, including but not limited to:</p>
        <ul>
          <li>Posting illegal, abusive, harassing, or deceptive content.</li>
          <li>Impersonating other people or organizations.</li>
          <li>Attempting to break, bypass, or abuse the Service's security or rate limits.</li>
          <li>Scraping, crawling, or mining user data without permission.</li>
          <li>Using the Service for spam, phishing, or fraud.</li>
        </ul>
      </>
    ),
  },
  {
    id: "ip",
    title: "Intellectual Property",
    body: (
      <>
        <p>
          The HackHive brand, design system, and platform software are owned by the HackHive team.
          Your content remains yours. Third-party trademarks (GitHub, Google, Firebase) belong to
          their respective owners.
        </p>
      </>
    ),
  },
  {
    id: "third-party",
    title: "Third-Party Services",
    body: (
      <>
        <p>
          The Service relies on third-party providers including Firebase (authentication, database,
          hosting) and GitHub and Google (sign-in). Your use of those services is also governed by
          their own terms and privacy policies.
        </p>
      </>
    ),
  },
  {
    id: "disclaimer",
    title: "Disclaimer of Warranties",
    body: (
      <>
        <p>
          The Service is provided "as is" and "as available" without warranties of any kind, express
          or implied, including merchantability and fitness for a particular purpose. We do not
          guarantee that the Service will be uninterrupted, error-free, or secure.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    body: (
      <>
        <p>
          To the maximum extent permitted by law, HackHive shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages arising from your use of the
          Service, including lost data, lost opportunities, or interactions between users.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to These Terms",
    body: (
      <>
        <p>
          We may update these Terms from time to time. Continued use of the Service after changes
          take effect constitutes acceptance of the revised Terms.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <>
        <p>
          Questions about these Terms? Email{" "}
          <a href="mailto:ankanmondal9280@gmail.com">ankanmondal9280@gmail.com</a>.
        </p>
      </>
    ),
  },
];

export default function Terms() {
  return (
    <LegalDoc
      docId="DOC-001"
      revision="2.0"
      effective="20 AUG 2026"
      title="Terms & Conditions"
      intro="These terms govern your use of the HackHive platform. Read them fully before building. By signing in, you agree to the rules below."
      sections={sections}
    />
  );
}