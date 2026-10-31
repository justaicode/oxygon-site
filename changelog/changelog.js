/* Progressive enhancement: all history remains readable if JavaScript is unavailable. */
document.querySelectorAll('.release-toggle').forEach(function (button) {
  var panel = document.getElementById(button.getAttribute('aria-controls'));
  function update(open) {
    button.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
  }
  update(button.getAttribute('aria-expanded') === 'true');
  // Native buttons supply Enter and Space activation and keep keyboard focus on the heading.
  button.addEventListener('click', function () {
    update(button.getAttribute('aria-expanded') !== 'true');
  });
});
