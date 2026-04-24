import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { isValidEmail, submitLead, type LeadSource } from '../lib/lead';
import { emitAnalyticsEvent as trackEvent } from './analyticsEvents';

const COOLDOWN_MESSAGES = {
  waitlist: 'Please wait a few seconds before submitting again.',
  contact: 'Please wait a few seconds before sending another message.'
} as const;

interface FormInteractionState {
  source: LeadSource;
  started: boolean;
  submitted: boolean;
}

const formStates = new Map<HTMLFormElement, FormInteractionState>();
let isDropOffTrackingBound = false;

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
            background: 'linear-gradient(135deg, #02cdd4, #01b8be)',
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

function countCompletedFields(form: HTMLFormElement) {
  const fields = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    'input[name], textarea[name], select[name]'
  );

  let completed = 0;
  fields.forEach((field) => {
    if (field.name === 'company') {
      return;
    }

    const value = field.value?.trim();
    if (value) {
      completed += 1;
    }
  });

  return completed;
}

function markFormStarted(form: HTMLFormElement, source: LeadSource) {
  const state = formStates.get(form);
  if (!state || state.started) {
    return;
  }

  state.started = true;
  trackEvent('form_start', {
    form_name: source,
    page_path: window.location.pathname
  });
}

function bindDropOffTracking() {
  if (isDropOffTrackingBound || typeof window === 'undefined') {
    return;
  }

  isDropOffTrackingBound = true;

  window.addEventListener('pagehide', () => {
    formStates.forEach((state, form) => {
      if (!state.started || state.submitted) {
        return;
      }

      trackEvent('form_drop_off', {
        form_name: state.source,
        completed_fields: countCompletedFields(form),
        page_path: window.location.pathname
      });
    });
  });
}

function bindFormInteractionTracking(form: HTMLFormElement, source: LeadSource) {
  if (formStates.has(form)) {
    return;
  }

  formStates.set(form, {
    source,
    started: false,
    submitted: false
  });

  bindDropOffTracking();

  form.addEventListener('focusin', () => {
    markFormStarted(form, source);
  });

  form.addEventListener('input', () => {
    markFormStarted(form, source);
  });

  const topicSelect = form.querySelector<HTMLSelectElement>('select[name="topic"]');
  if (topicSelect) {
    topicSelect.addEventListener('change', () => {
      markFormStarted(form, source);
      if (!topicSelect.value) {
        return;
      }

      trackEvent('contact_topic_selected', {
        topic: topicSelect.value
      });
    });
  }
}

function classifySubmissionFailure(message: string, rateLimited: boolean) {
  if (rateLimited) {
    return 'rate_limited';
  }

  const normalized = message.toLowerCase();
  if (normalized.includes('network')) {
    return 'network';
  }
  if (normalized.includes('valid email') || normalized.includes('valid')) {
    return 'validation';
  }
  return 'submit_error';
}

let isBound = false;

export function initLeadForms() {
  if (isBound) return;
  if (typeof document === 'undefined') return;
  isBound = true;

  const forms = document.querySelectorAll<HTMLFormElement>('form[data-lead-form]');
  forms.forEach((form) => {
    const source = (form.dataset.source === 'contact' ? 'contact' : 'waitlist') as LeadSource;
    bindFormInteractionTracking(form, source);
  });

  document.addEventListener('submit', async (event) => {
    const form = event.target as HTMLFormElement;
    if (!form || !form.matches('[data-lead-form]')) {
      return;
    }

    event.preventDefault();

    const source = (form.dataset.source === 'contact' ? 'contact' : 'waitlist') as LeadSource;
    bindFormInteractionTracking(form, source);

    const emailInput = form.querySelector<HTMLInputElement>('input[name="email"]');
    const messageInput = form.querySelector<HTMLTextAreaElement>('textarea[name="message"]');
    const topicSelect = form.querySelector<HTMLSelectElement>('select[name="topic"]');
    const honeypotInput = form.querySelector<HTMLInputElement>('input[name="company"]');
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const status = form.querySelector('[data-form-status]');

    const email = emailInput?.value.trim() ?? '';
    const selectedTopic = topicSelect?.value.trim() || undefined;
    markFormStarted(form, source);

    trackEvent('form_submit_attempt', {
      form_name: source,
      page_path: window.location.pathname
    });

    trackEvent('cta_click', {
      cta_target: source === 'waitlist' ? 'waitlist_submit' : 'contact_submit',
      cta_location: source
    });

    if (!isValidEmail(email)) {
      const message = 'Please enter a valid email address.';
      setStatus(status, message);

      trackEvent('form_validation_error', {
        form_name: source,
        field_name: 'email',
        reason: 'invalid_format'
      });
      return;
    }

    setButtonBusy(button, true);
    setStatus(status, 'Submitting...');

    const result = await submitLead({
      email,
      source,
      message: messageInput?.value.trim() || undefined,
      topic: selectedTopic,
      honeypot: honeypotInput?.value ?? ''
    });

    setButtonBusy(button, false);

    if (!result.ok) {
      setStatus(status, result.message);

      trackEvent('form_submit_failed', {
        form_name: source,
        reason: classifySubmissionFailure(result.message, Boolean(result.retryAfterMs))
      });

      if (result.retryAfterMs) {
        setStatus(status, COOLDOWN_MESSAGES[source]);
        runCooldown(button, source, result.retryAfterMs);
      }

      return;
    }

    form.reset();

    const state = formStates.get(form);
    if (state) {
      state.submitted = true;
    }

    if (source === 'waitlist') {
      trackEvent('sign_up', {
        method: 'email_waitlist',
        source
      });
    } else {
      trackEvent('generate_lead', {
        source,
        topic: selectedTopic
      });
    }

    if (source === 'waitlist') {
      const formContainer = document.getElementById('waitlist-form-container');
      const successContainer = document.getElementById('waitlist-success');
      const emailSpan = document.getElementById('success-email');

      if (formContainer && successContainer && emailSpan) {
        emailSpan.textContent = email;
        formContainer.classList.add('hidden');
        successContainer.classList.remove('hidden');
        successContainer.classList.add('flex');
        return;
      }

      setStatus(status, result.message);
      showToast(result.message, 'success');
    } else if (source === 'contact') {
      const formContainer = document.getElementById('contact-form-container');
      const successContainer = document.getElementById('contact-success');

      if (formContainer && successContainer) {
        formContainer.classList.add('hidden');
        successContainer.classList.remove('hidden');
        successContainer.classList.add('flex');
        return;
      }

      setStatus(status, result.message);
      showToast(result.message, 'success');
    }
  });
}
