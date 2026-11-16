/*
 * BEL AVIATION & LOGISTICS — comportements du site statique
 * Remplace les actions serveur de la version PHP (formulaire de contact,
 * commentaires, "J'aime", liens de partage) sans modifier assets/js/site.js.
 */
(function () {
  'use strict';

  /* ===== RÉGLAGES ===== */
  var CONFIG = {
    // Adresse qui reçoit les demandes (formulaire de contact).
    contactEmail: 'bdm@belaviation.cm',
    // Adresse qui reçoit les commentaires d'articles (modération par e-mail).
    commentEmail: 'ops@belaviation.cm',
    // Optionnel : URL d'un service de formulaires (ex. https://formspree.io/f/xxxxxxx).
    // Vide = ouverture du client de messagerie du visiteur (mailto:).
    formEndpoint: ''
  };

  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c];
    });
  }
  function toast(icon, text) {
    if (window.Swal) {
      Swal.fire({ icon: icon, text: text, timer: 10000, confirmButtonColor: '#0758a6' });
    }
  }
  function alertBox(host, kind, html) {
    host.innerHTML = '<div class="alert alert-' + kind + '">' + html + '</div>';
    host.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function send(subject, fields, to, onDone) {
    if (CONFIG.formEndpoint) {
      var fd = new FormData();
      Object.keys(fields).forEach(function (k) { fd.append(k, fields[k]); });
      fd.append('_subject', subject);
      fetch(CONFIG.formEndpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
        .then(function (r) { onDone(r.ok, 'endpoint'); })
        .catch(function () { onDone(false, 'endpoint'); });
      return;
    }
    var body = Object.keys(fields).map(function (k) { return k + ' : ' + fields[k]; }).join('\n');
    window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    onDone(true, 'mailto');
  }

  /* ===== Formulaire de contact (mêmes règles de validation que la version PHP) ===== */
  var contact = $('#contactForm');
  if (contact) {
    var params = new URLSearchParams(location.search);
    if (params.get('subject') && contact.subject && !contact.subject.value) contact.subject.value = params.get('subject');

    contact.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var host = $('#formAlerts');
      var v = function (n) { return (contact.elements[n].value || '').trim(); };
      var errors = [];
      if (v('name').length < 2 || v('name').length > 140) errors.push('Veuillez saisir un nom valide.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email')) || v('email').length > 190) errors.push('Adresse email invalide.');
      if (v('subject').length < 3 || v('subject').length > 180) errors.push('Veuillez préciser l’objet de la demande.');
      if (v('message').length < 10 || v('message').length > 8000) errors.push('Le message doit contenir entre 10 et 8 000 caractères.');
      if (errors.length) {
        alertBox(host, 'danger', '<ul class="mb-0">' + errors.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul>');
        return;
      }
      send(v('subject'), {
        'Nom': v('name'), 'Entreprise': v('company'), 'Email': v('email'),
        'Téléphone': v('phone'), 'Objet': v('subject'), 'Message': v('message')
      }, CONFIG.contactEmail, function (ok, mode) {
        if (!ok) { alertBox(host, 'danger', '<ul class="mb-0"><li>L’envoi a échoué. Écrivez-nous directement à ' + esc(CONFIG.contactEmail) + ' ou sur WhatsApp.</li></ul>'); return; }
        var msg = mode === 'mailto'
          ? 'Votre application de messagerie va s’ouvrir avec votre demande pré-remplie : envoyez le message pour la transmettre à notre équipe.'
          : 'Votre message a bien été transmis à notre équipe.';
        alertBox(host, 'success', '<strong>' + (mode === 'mailto' ? 'Demande prête à envoyer.' : 'Demande envoyée.') + '</strong> ' + esc(msg));
        toast('success', msg);
        if (mode === 'endpoint') contact.reset();
      });
    });
  }

  /* ===== Articles : J'aime, copie du lien, partage, commentaires ===== */
  var like = $('#likeBtn');
  if (like) {
    var key = 'bel-like-' + like.getAttribute('data-slug');
    var base = parseInt(like.getAttribute('data-base') || '0', 10);
    var count = $('#likeCount');
    var liked = false;
    try { liked = localStorage.getItem(key) === '1'; } catch (e) {}
    if (liked) { count.textContent = base + 1; like.disabled = true; }
    like.addEventListener('click', function () {
      try { localStorage.setItem(key, '1'); } catch (e) {}
      count.textContent = base + 1; like.disabled = true;
    });
  }
  var copy = $('#copyLink');
  if (copy) copy.addEventListener('click', function () {
    var done = function () { toast('success', 'Lien copié dans le presse-papiers.'); };
    if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, function () {});
  });
  if (/^https?:$/.test(location.protocol)) {
    var title = ($('h1') || {}).textContent || document.title;
    var u = encodeURIComponent(location.href);
    var fb = document.querySelector('a[href*="facebook.com/sharer"]');
    var li = document.querySelector('a[href*="linkedin.com/sharing"]');
    var wa = document.querySelector('a[href^="https://wa.me/?text="]');
    if (fb) fb.href = 'https://www.facebook.com/sharer/sharer.php?u=' + u;
    if (li) li.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + u;
    if (wa) wa.href = 'https://wa.me/?text=' + encodeURIComponent(title + ' ' + location.href);
  }
  var comment = $('#commentForm');
  if (comment) comment.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var name = (comment.elements.author_name.value || '').trim();
    var text = (comment.elements.comment_text.value || '').trim();
    if (!name || !text || text.length > 3000) {
      toast('error', 'Veuillez compléter le nom et le commentaire (3 000 caractères maximum).');
      return;
    }
    var title = ($('h1') || {}).textContent || document.title;
    send('Commentaire — ' + title, { 'Article': title, 'Lien': location.href, 'Nom': name, 'Commentaire': text }, CONFIG.commentEmail, function (ok, mode) {
      if (!ok) { toast('error', 'Une erreur est survenue.'); return; }
      toast('success', mode === 'mailto'
        ? 'Votre application de messagerie va s’ouvrir : envoyez le message pour soumettre votre commentaire à la modération.'
        : 'Merci. Votre commentaire sera publié après modération.');
      if (mode === 'endpoint') comment.reset();
    });
  });
})();
