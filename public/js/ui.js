document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    const tab = button.dataset.tab;

    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
    });

    document.querySelectorAll('.tab-content').forEach(section => {
      section.classList.remove('active');
    });

    button.classList.add('active');
    document.getElementById(tab).classList.add('active');
  });
});
