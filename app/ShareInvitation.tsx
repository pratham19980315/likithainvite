"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Check, Copy, Mail, MessageCircle, Share2, X } from "lucide-react";
import "./share-invitation.css";

const invitationTitle = "Likitha & Jeevan — Wedding Invitation";
const invitationText = "Join us to celebrate the wedding of Likitha S. and Jeevan B.K.";

export default function ShareInvitation() {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [sharing, setSharing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copying" | "copied" | "failed">("idle");
  const [invitationUrl, setInvitationUrl] = useState("");
  const invitationMessage = `${invitationText}\n\n${invitationUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(invitationMessage)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(invitationTitle)}&body=${encodeURIComponent(invitationMessage)}`;

  useEffect(() => {
    if (!dialogOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [dialogOpen]);

  function showShareOptions() {
    setCopyStatus("idle");
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    setDialogOpen(true);
  }

  async function shareInvitation() {
    if (sharing) return;
    const url = new URL("/", window.location.href).href;
    setInvitationUrl(url);
    if (typeof navigator.share !== "function") {
      showShareOptions();
      return;
    }
    setSharing(true);
    try {
      await navigator.share({ title: invitationTitle, text: invitationText, url });
    } catch (error) {
      // Dismissing the device's share sheet is an ordinary user choice.
      if (!(error instanceof Error && error.name === "AbortError")) showShareOptions();
    } finally {
      setSharing(false);
    }
  }

  async function copyLink() {
    setCopyStatus("copying");
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  }

  function restoreFocus() {
    setDialogOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
  }

  function closeFromBackdrop(click: MouseEvent<HTMLDialogElement>) {
    if (click.target !== click.currentTarget) return;
    const bounds = click.currentTarget.getBoundingClientRect();
    if (click.clientX < bounds.left || click.clientX > bounds.right || click.clientY < bounds.top || click.clientY > bounds.bottom) click.currentTarget.close();
  }

  return <>
    <button
      ref={triggerRef}
      className="quiet-link share-invitation-trigger"
      type="button"
      onClick={() => void shareInvitation()}
      disabled={sharing}
      aria-busy={sharing}
      aria-haspopup="dialog"
    ><Share2 size={15} aria-hidden="true" /> Share invitation</button>

    <dialog
      ref={dialogRef}
      className="share-invitation-dialog"
      aria-labelledby="share-invitation-title"
      aria-describedby="share-invitation-description"
      onClose={restoreFocus}
      onClick={closeFromBackdrop}
    >
      <div className="share-invitation-inner">
        <button className="share-invitation-close" type="button" onClick={() => dialogRef.current?.close()} aria-label="Close sharing options" autoFocus><X size={20} strokeWidth={1.5} /></button>
        <span className="share-invitation-flower" aria-hidden="true">✦</span>
        <p className="share-invitation-kicker">Likitha & Jeevan</p>
        <h2 id="share-invitation-title">Share the joy</h2>
        <p id="share-invitation-description">Send our invitation to someone you love.</p>

        <div className="share-invitation-options">
          <a className="share-invitation-option" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <span className="share-invitation-option-icon"><MessageCircle size={21} strokeWidth={1.5} aria-hidden="true" /></span>
            <span><strong>WhatsApp</strong><small>Choose a contact</small></span>
          </a>
          <a className="share-invitation-option" href={emailUrl}>
            <span className="share-invitation-option-icon"><Mail size={21} strokeWidth={1.5} aria-hidden="true" /></span>
            <span><strong>Email</strong><small>Draft an invitation message</small></span>
          </a>
        </div>

        <div className="share-invitation-copy">
          <label htmlFor="share-invitation-url">Or share the link</label>
          <div className="share-invitation-copy-row">
            <input id="share-invitation-url" aria-label="Invitation link" value={invitationUrl} readOnly onFocus={(focus) => focus.currentTarget.select()} />
            <button type="button" onClick={() => void copyLink()} disabled={copyStatus === "copying"}>
              {copyStatus === "copied" ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
              <span>{copyStatus === "copied" ? "Copied" : "Copy link"}</span>
            </button>
          </div>
          <p className="share-invitation-status" role="status" aria-live="polite">
            {copyStatus === "copied" ? "Link copied. You can paste it into a message." : copyStatus === "failed" ? "Copy is unavailable in this browser. Select and copy the link above." : ""}
          </p>
        </div>
      </div>
    </dialog>
  </>;
}
