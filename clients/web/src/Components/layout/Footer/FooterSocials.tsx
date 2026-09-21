import { FaGithub } from "react-icons/fa6";
import { Button } from "@/Components/Ui/button/button";

const FooterSocials = () => {
  return (
<div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-1">
  <Button
    nativeButton={false}
    variant="outline"
    size="sm"
    className="w-full sm:w-fit"
    render={
      <a
        href="https://github.com/mardi-niyayesh"
        target="_blank"
        rel="noopener noreferrer"
      />
    }
  >
    <FaGithub size={18} className="mr-3" />
    Niyayesh Mardi
  </Button>

  <Button
    nativeButton={false}
    variant="outline"
    size="sm"
    className="w-full sm:w-fit"
    render={
      <a
        href="https://github.com/homow"
        target="_blank"
        rel="noopener noreferrer"
      />
    }
  >
    <FaGithub size={18} className="mr-3" />
    Homayoun Sharifi
  </Button>
</div>
  );
};

export default FooterSocials;
