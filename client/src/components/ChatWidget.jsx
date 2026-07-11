import { useState } from "react";
import HeroSection from "./HeroSection.jsx";
import ChatWindow from "./ChatWindow.jsx";
import { playIgnition, playClose } from "../utils/sfx.js";

function ChatWidget({ session }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    playIgnition();
    setIsOpen(true);
  };

  const handleClose = () => {
    playClose();
    setIsOpen(false);
  };

  return (
    <>
      <HeroSection onOpenChat={handleOpen} />
      {isOpen && <ChatWindow onClose={handleClose} session={session} />}
    </>
  );
}

export default ChatWidget;
