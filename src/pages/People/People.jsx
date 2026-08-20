import { useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import PeopleSearch from "../Home/PeopleSearch";

export default function People() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <main className="people-page">
        <style>{`
          .people-page {
            min-height: 100dvh;
            max-width: 1060px;
            margin: 0 auto;
            padding: 110px 24px 48px;
            font-family: 'JetBrains Mono', monospace;
            color: #EAEAEA;
          }
          .people-page-head { margin-bottom: 28px; }
          .people-page-kicker {
            font-size: 11px;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: #E61919;
            margin-bottom: 10px;
          }
          .people-page-title {
            font-family: 'Archivo Black', sans-serif;
            font-weight: 400;
            font-size: clamp(28px, 5vw, 44px);
            line-height: 1;
            text-transform: uppercase;
            letter-spacing: -0.02em;
            color: #EAEAEA;
            margin: 0;
          }
          @media (max-width: 768px) {
            .people-page { padding: 100px 16px 32px; }
          }
        `}</style>
        <div className="people-page-head">
          <p className="people-page-kicker">// FIND YOUR CREW</p>
          <h1 className="people-page-title">People</h1>
        </div>
        <PeopleSearch />
      </main>
    </>
  );
}