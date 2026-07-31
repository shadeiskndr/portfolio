"use client";

import { Copy, Mail, Phone } from "lucide-react";
import { useCallback, useState } from "react";

import SocialIcons from "@/components/old-portfolio/data-display/social-icons";
import Tag from "@/components/old-portfolio/data-display/tag";
import IconButton from "@/components/old-portfolio/general/icon-button";
import Typography from "@/components/old-portfolio/general/typography";
import Container from "@/components/old-portfolio/layout/container";
import useWindowSize from "@/hooks/use-window-size";
import { copyTextToClipboard } from "@/lib/utils";

const email = "shahathiriskandar43@gmail.com";
const phone = "+60 1153787564";

type CopyValue = "email" | "phone";

const ContactSection = () => {
  const { width } = useWindowSize();
  const [isCopied, setIsCopied] = useState(false);
  const [copiedValueType, setCopiedValueType] = useState<CopyValue | null>(null);

  const handleCopyClick = useCallback(async (text: string, type: CopyValue) => {
    try {
      await copyTextToClipboard(text);
      setIsCopied(true);
      setCopiedValueType(type);
      const timeoutId = setTimeout(() => {
        setIsCopied(false);
        setCopiedValueType(null);
        clearTimeout(timeoutId);
      }, 1500);
    } catch (_error) {
      setIsCopied(false);
      setCopiedValueType(null);
      alert("Unable to copy!");
    }
  }, []);

  const handleCopyEmail = useCallback(() => handleCopyClick(email, "email"), [handleCopyClick]);
  const handleCopyPhone = useCallback(
    () => handleCopyClick(phone.replace(" ", ""), "phone"),
    [handleCopyClick]
  );

  return (
    // biome-ignore lint/correctness/useUniqueElementIds: stable page-section landmark; NAV_LINKS in lib/data.tsx anchors to this exact id
    <Container id="contact">
      <div className="flex flex-col items-center gap-4">
        <div className="self-center">
          <Tag label="Get in touch" />
        </div>
        <Typography variant="subtitle" className="max-w-xl text-center">
          What&apos;s next? Feel free to reach out to me if you are looking for a developer, have a
          query, or simply want to connect.
        </Typography>
      </div>

      <div className="flex flex-col items-center gap-6 md:gap-12">
        <div className="flex flex-col items-center md:gap-4">
          <div className="flex items-center gap-4 md:gap-5">
            <Mail className="h-6 w-6 md:h-8 md:w-8" />
            <Typography variant="h2">{email}</Typography>
            <IconButton
              size={width && width < 768 ? "md" : "lg"}
              onClick={handleCopyEmail}
              showTooltip={isCopied && copiedValueType === "email"}
              tooltipText="Copied!"
            >
              <Copy />
            </IconButton>
          </div>
          <div className="flex items-center gap-4 md:gap-5">
            <Phone className="h-6 w-6 md:h-8 md:w-8" />
            <Typography variant="h2">{phone}</Typography>
            <IconButton
              size={width && width < 768 ? "md" : "lg"}
              onClick={handleCopyPhone}
              showTooltip={isCopied && copiedValueType === "phone"}
              tooltipText="Copied!"
            >
              <Copy />
            </IconButton>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Typography className="text-center">You may also find me on these platforms!</Typography>
          <SocialIcons />
        </div>
      </div>
    </Container>
  );
};

export default ContactSection;
