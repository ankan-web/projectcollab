import LegalDoc from "./LegalDoc";

const sections = [
  {
    id: "collect",
    title: "Information We Collect",
    body: (
      <>
        <p>We collect the minimum information needed to run the Service:</p>
        <ul>
          <li>Account details from your sign-in provider (email, display name, avatar).</li>
          <li>Profile information you add during onboarding (college, bio, skills, links).</li>
          <li>Content you create: projects, needs, groups, join requests, and chat messages.</li>
          <li>Basic usage analytics such as daily-active-user counts.</li>
        </ul>
      </>
    ),
  },
  {
    id: "use",
    title: "How We Use Information",
    body: (
      <>
        <ul>
          <li>To authenticate you and keep your session active.</li>
          <li>To display your profile, projects, and connections to other users.</li>
          <li>To power search, matching, messaging, and notifications.</li>
          <li>To measure platform activity and improve the Service.</li>
        </ul>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Sharing & Disclosure",
    body: (
      <>
        <p>
          Your public profile, projects, and posted needs are visible to other users of the Service
          by design. Chat messages are shared only with the conversation participants. We do not
          sell your personal data.
        </p>
      </>
    ),
  },
  {
    id: "storage",
    title: "Data Storage & Security",
    body: (
      <>
        <p>
          Data is stored on Firebase (Google Cloud) infrastructure using Firestore and Firebase
          Authentication. Access is governed by Firestore security rules. No storage method is 100%
          secure, and we cannot guarantee absolute security.
        </p>
      </>
    ),
  },
  {
    id: "choices",
    title: "Your Choices",
    body: (
      <>
        <ul>
          <li>You can edit or remove your profile information at any time.</li>
          <li>You can delete projects, needs, and groups you created.</li>
          <li>You can sign out or stop using the Service at any time.</li>
          <li>Admin users may remove accounts and content in accordance with the Service's rules.</li>
        </ul>
      </>
    ),
  },
  {
    id: "third-party",
    title: "Third-Party Services",
    body: (
      <>
        <p>
          Sign-in and infrastructure are provided by Google (Firebase, Google Sign-In) and GitHub.
          GitHub OAuth may read your public profile and, when authorized, interact with your
          repositories. Review their privacy policies for details.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children's Privacy",
    body: (
      <>
        <p>
          The Service is intended for students and builders, generally age 13 and older. We do not
          knowingly collect data from children under 13. If you believe a child under 13 has
          provided data, contact us and we will delete it.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    body: (
      <>
        <p>
          We may update this Privacy Policy from time to time. Changes will be reflected on this
          page, and continued use of the Service constitutes acceptance.
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
          Privacy questions? Email{" "}
          <a href="mailto:ankanmondal9280@gmail.com">ankanmondal9280@gmail.com</a>.
        </p>
      </>
    ),
  },
];

export default function Privacy() {
  return (
    <LegalDoc
      docId="DOC-002"
      revision="1.0"
      effective="20 AUG 2026"
      title="Privacy Policy"
      intro="This policy explains what data HackHive collects, how it is used, and the choices you have. We collect the minimum needed and never sell your data."
      sections={sections}
    />
  );
}