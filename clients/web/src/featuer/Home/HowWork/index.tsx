import Moredetail from "../LearnMore/Moredetail";
import Link from "next/link";
const HowWork = () => {
  return (
    <>
      <Moredetail />
      <div>
        <Link href="/How-to-Work">
          <div className="mt-10 text-center">
            <button className="text-sm font-semibold text-indigo-400 transition-colors hover:text-indigo-300">
              Learn More →
            </button>
          </div>
        </Link>
      </div>
    </>
  );
};

export default HowWork;
