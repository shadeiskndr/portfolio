import { Copyright } from "lucide-react";

import Typography from "@/components/old-portfolio/general/typography";

const BUILD_YEAR = process.env["NEXT_PUBLIC_BUILD_YEAR"];

const Footer = () => {
  return (
    <footer className="w-full py-6">
      <div className="flex items-center justify-center gap-1">
        <Typography className="flex items-center" variant="body3">
          <Copyright className="mr-1 inline-block h-4 w-4" />
          {BUILD_YEAR} | Made with ❤️️ by Shahathir Iskandar
        </Typography>
      </div>
    </footer>
  );
};

export default Footer;
