import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { isValidEmail, submitLead, type LeadSource } from '../lib/lead';

const COOLDOWN_MESSAGES = {
  waitlist: 'Please wait a few seconds before submitting again.',
  contact: 'Please wait a few seconds before sending another message.'
} as const;

function showToast(text: string, kind: 'success' | 'error') {
  Toastify({
    text,
    gravity: 'bottom',
    position: 'right',
    duration: 3500,
    stopOnFocus: true,
    style:
      kind === 'success'
        ? {
            background: 'linear-gradient(135deg, #03a9f4, #44c5ff)',
            color: '#ffffff'
          }
        : {
            background: '#1f2f38',
            color: '#f5fbff'
          }
  }).showToast();
}

function setStatus(el: Element | null, message: string) {
  if (el instanceof HTMLElement) {
    el.textContent = message;
  }
}

function setButtonBusy(button: HTMLButtonElement | null, busy: boolean) {
  if (!button) {
    return;
  }

  button.disabled = busy;
  button.setAttribute('aria-busy', String(busy));
}

function runCooldown(button: HTMLButtonElement | null, source: LeadSource, ms: number) {
  if (!button) {
    return;
  }

  const expiresAt = Date.now() + ms;
  button.disabled = true;

  const interval = window.setInterval(() => {
    const remainingMs = expiresAt - Date.now();

    if (remainingMs <= 0) {
      button.disabled = false;
      button.textContent = source === 'waitlist' ? 'Join waitlist' : 'Send message';
      window.clearInterval(interval);
      return;
    }

    const remainingSec = Math.ceil(remainingMs / 1000);
    button.textContent = `Wait ${remainingSec}s`;
  }, 250);
}

function bindForm(form: HTMLFormElement) {
  if (form.dataset.bound === 'true') {
    return;
  }

  form.dataset.bound = 'true';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const source = (form.dataset.source === 'contact' ? 'contact' : 'waitlist') as LeadSource;
    const emailInput = form.querySelector<HTMLInputElement>('input[name="email"]');
    const messageInput = form.querySelector<HTMLTextAreaElement>('textarea[name="message"]');
    const honeypotInput = form.querySelector<HTMLInputElement>('input[name="company"]');
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const status = form.querySelector('[data-form-status]');

    const email = emailInput?.value.trim() ?? '';

    if (!isValidEmail(email)) {
      const message = 'Please enter a valid email address.';
      setStatus(status, message);
      showToast(message, 'error');
      emailInput?.focus();
      return;
    }

    setButtonBusy(button, true);
    setStatus(status, 'Submitting...');

    const result = await submitLead({
      email,
      source,
      message: messageInput?.value.trim() || undefined,
      honeypot: honeypotInput?.value ?? ''
    });

    setButtonBusy(button, false);

    if (!result.ok) {
      setStatus(status, result.message);
      showToast(result.message, 'error');

      if (result.retryAfterMs) {
        setStatus(status, COOLDOWN_MESSAGES[source]);
        runCooldown(button, source, result.retryAfterMs);
      }

      return;
    }

    form.reset();
    setStatus(status, result.message);
    showToast(result.message, 'success');
  });
}

export function initLeadForms(root: ParentNode = document) {
  const forms = root.querySelectorAll<HTMLFormElement>('[data-lead-form]');
  forms.forEach(bindForm);
}
