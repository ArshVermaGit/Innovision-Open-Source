"use client";

import emailjs from "emailjs-com";
import { useRef, useState, useEffect } from "react";
import { FaInstagram } from "react-icons/fa6";
import { IoLogoWhatsapp } from "react-icons/io5";
import { FaXTwitter } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa";
import { FaYoutube, FaGithub } from "react-icons/fa6";
import { ToastContainer } from 'react-toastify';
import { toast } from "sonner";
import { PageBackground, GridPattern, ScrollReveal } from "@/components/ui/PageWrapper";
import { Mail, Send } from "lucide-react";


export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [dots, setDots] = useState([]);
  const formRef = useRef(null)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const generatedDots = Array.from({ length: 100 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${2 + Math.random() * 2}s`,
    }));

    setDots(generatedDots);
  }, []);


  function sendEmail(formData) {
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const userId = process.env.NEXT_PUBLIC_EMAILJS_USER_ID;

    if (!serviceId || !templateId || !userId) {
      console.error("EmailJS configuration missing");
      toast.error("Email service not configured. Please contact support.");
      formRef.current.removeAttribute("disabled");
      return;
    }

    emailjs.send(serviceId, templateId, formData, userId)
      .then((response) => {
        console.log("Email sent successfully:", response);
        toast.success("Message sent successfully!");
        formRef.current.removeAttribute("disabled");
      })
      .catch((error) => {
        console.error("Failed to send email.", error);

        // Specific error handling for Gmail API issues
        if (error.text && error.text.includes("Gmail_API")) {
          toast.error("Email service temporarily unavailable. Please try again later or contact us directly.");
        } else if (error.status === 412) {
          toast.error("Email service needs reconnection. Please contact support.");
        } else {
          toast.error("Failed to send message. Please try again.");
        }

        formRef.current.removeAttribute("disabled");
      });
  }


  const handleSubmit = (e) => {
    e.preventDefault();
    formRef.current.setAttribute("disabled", "true");

    // Only clear form and show success after email is actually sent
    const formData = { email, message };
    sendEmail(formData);

    // Clear form fields immediately for better UX
    setEmail("");
    setMessage("");
    toast.success("Message sent successfully!", { type: "success" });
    setTimeout(() => {
      formRef.current.removeAttribute("disabled");
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-black relative">
      {/* Animated dots background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {dots.map((style, i) => (
          <div
            key={i}
            className="dot absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={style}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col relative z-10 py-10">
        <ToastContainer />
        <div className="bg-transparent px-4">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 border border-white/10 rounded-full mb-6">
                <Mail className="h-7 w-7 text-blue-500" />
              </div>
              <h1 className="text-white text-4xl md:text-5xl font-light mb-4">Get in Touch</h1>
              <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto font-light">
                Have a question or idea? Reach out — we typically respond within 24 hours.
              </p>
            </div>
          </ScrollReveal>
        </div>

        <div className="flex-1 py-8 px-4">
          {mounted && (
            <ScrollReveal delay={100}>
              <div className="max-w-xl mx-auto">
                <div
                  className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl 
               shadow-[0_0_60px_-15px_rgba(59,130,246,0.25)] px-6 py-8 md:px-8 md:py-10">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-6 py-4 rounded-xl bg-black/40 border border-white/15 text-white placeholder:text-gray-500 
                       focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all font-light"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <textarea
                        placeholder="Message"
                        rows="5"
                        className="w-full px-6 py-4 rounded-2xl bg-black/40 border border-white/15 text-white placeholder:text-gray-500 
                      focus:outline-none focus:ring-2  focus:ring-blue-500/40 focus:border-blue-500/40 transition-all resize-none font-light"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </div>

                    <div className="flex justify-center pt-2">
                      <button
                        type="submit"
                        ref={formRef}
                        className="relative bg-blue-500 hover:bg-blue-600 text-white px-10 py-3.5 rounded-full font-medium transition-all duration-300 
                      hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed 
                      flex items-center gap-2 cursor-pointer w-full justify-center">
                        <Send className="h-4 w-4" />
                        Send Message
                      </button>
                    </div>
                  </form>
                </div>
              </div> {/* card */}
              <div className="flex justify-center text-muted-foreground space-x-6 mt-12">
                <a href="https://www.instagram.com/hands_on_coding_028/#"
                  className="text-2xl hover:text-foreground hover:scale-110 transition-all duration-300">
                  <FaInstagram />
                </a>

                <a href="https://wa.me/7019003366"
                  className="text-2xl hover:text-foreground hover:scale-110 transition-all duration-300">
                  <IoLogoWhatsapp />
                </a>

                <a href="https://github.com/ItsVikasA"
                  className="text-2xl hover:text-foreground hover:scale-110 transition-all duration-300">
                  <FaGithub />
                </a>

                <a href="https://www.linkedin.com/in/vikas028/"
                  className="text-2xl hover:text-foreground hover:scale-110 transition-all duration-300">
                  <FaLinkedin />
                </a>

                <a href="https://www.youtube.com/@hands_on_coding_028"
                  className="text-2xl hover:text-foreground hover:scale-110 transition-all duration-300">
                  <FaYoutube />
                </a>
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </div >
  );
}