import LegalDoc from "./LegalDoc";

const sections = [
  {
    id: "what",
    title: "What Is HackHive",
    body: (
      <>
        <p>
          HackHive is a student builder network. It connects developers, designers, and builders who
          want to team up, ship projects, and grow together — no proposals, no cold intros, just the
          work.
        </p>
      </>
    ),
  },
  {
    id: "problem",
    title: "The Problem",
    body: (
      <>
        <p>
          Solo builders struggle to find teammates. Group chats bury every ask in noise, there is no
          way to signal "I need a UI dev for two weeks", and there is no middle ground between casual
          chat and formal hiring. Great ideas stall because the right people never meet.
        </p>
      </>
    ),
  },
  {
    id: "how",
    title: "How It Works",
    body: (
      <>
        <ul>
          <li>Create a profile that shows your skills, college, and what you want to build.</li>
          <li>Browse the project feed and the people directory to find your crew.</li>
          <li>Post a project or put a "need" on the board and let builders come to you.</li>
          <li>Connect in real-time chat and start shipping together.</li>
          <li>Join groups and cohorts to stay plugged into a building community.</li>
        </ul>
      </>
    ),
  },
  {
    id: "built-for",
    title: "Built For Students",
    body: (
      <>
        <p>
          HackHive is designed for college builders: hackathon teams looking for a missing role,
          side-project duos, and first-time builders who need feedback and momentum. Every feature is
          scoped to one job — finding the right people and keeping the build moving.
        </p>
      </>
    ),
  },
  {
    id: "stack",
    title: "Our Stack",
    body: (
      <>
        <p>
          A serverless web app: React on the front end, Firebase (Auth, Firestore, Analytics) on the
          back end, deployed as a static build. No servers to babysit, and the data layer is
          governed by Firestore security rules.
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
          Built and maintained by Ankan Mondal. Questions, ideas, or bugs — email{" "}
          <a href="mailto:ankanmondal9280@gmail.com">ankanmondal9280@gmail.com</a>.
        </p>
      </>
    ),
  },
];

export default function AboutUs() {
  return (
    <LegalDoc
      docId="DOC-003"
      revision="1.0"
      effective="20 AUG 2026"
      title="About Us"
      intro="HackHive is a student builder network — a place where people who want to build things find the people they should build them with."
      sections={sections}
    />
  );
}